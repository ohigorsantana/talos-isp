import { createFileRoute } from "@tanstack/react-router";
import { MockERPAdapter, authenticateApi, checkRateLimit, type ApiResult } from "@/lib/talos-api.server";

const headers = { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "access-control-allow-headers": "authorization,x-api-key,content-type,idempotency-key", "access-control-allow-methods": "GET,POST,OPTIONS" };
const json = (result: ApiResult) => Response.json(result.body, { status: result.status, headers });

async function handle(request: Request, rawPath: string) {
  const started = Date.now();
  const path = `/${rawPath.replace(/^\//, "")}`;
  const url = new URL(request.url);
  const body = request.method === "POST" ? await request.json().catch(() => null) : null;
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  let result: ApiResult;

  if (path === "/health") return json({ status: 200, body: { status: "ok", service: "Talos ISP Lab", version: "1.0" } });
  if (!(await checkRateLimit(db, request))) return json({ status: 429, body: { success: false, error: "RATE_LIMIT_EXCEEDED" } });
  if (!(await authenticateApi(db, request))) return json({ status: 401, body: { success: false, error: "UNAUTHORIZED" } });

  const { data: setting } = await db.from("lab_settings").select("erp_online").eq("id", true).single();
  if (!setting?.erp_online && path !== "/simulation/erp-status") return json({ status: 503, body: { success: false, error: "ERP_UNAVAILABLE" } });
  const adapter = new MockERPAdapter(db);

  try {
    if (path === "/customers" && request.method === "POST") result = await adapter.createCustomer(body ?? {});
    else if (path === "/customers/by-cpf" && request.method === "GET") result = await adapter.findCustomer("cpf", url.searchParams.get("cpf") ?? "");
    else if (path === "/customers/by-phone" && request.method === "GET") result = await adapter.findCustomer("phone", url.searchParams.get("phone") ?? "");
    else if (path === "/tickets" && request.method === "POST") result = await adapter.createTicket(body ?? {});
    else if (path === "/coverage/check" && request.method === "POST") result = await adapter.checkCoverage(body ?? {});
    else if (path === "/sales/complete" && request.method === "POST") result = await adapter.completeSale(body ?? {}, request.headers.get("idempotency-key") ?? String((body as Record<string, unknown> | null)?.external_reference ?? "") || undefined);
    else if (path === "/webhooks/ghl" && request.method === "POST") {
      const payload = body as Record<string, any> | null;
      const contact = payload?.contact ?? {};
      result = await adapter.completeSale({ ...contact, plan_external_id: payload?.plan?.external_id, source: "GHL" }, String(payload?.event_id ?? payload?.external_reference ?? "") || undefined);
    }
    else if (path === "/simulation/api-error" && request.method === "POST") {
      const type = String((body as Record<string, unknown> | null)?.type ?? "500");
      if (type === "timeout") await new Promise((resolve) => setTimeout(resolve, 8000));
      if (type === "invalid_json") return new Response("{invalid-json", { status: 200, headers });
      const code = type === "404" ? 404 : type === "401" ? 401 : 500;
      result = { status: code, body: { success: false, error: `SIMULATED_${type.toUpperCase()}` } };
    } else {
      const payment = path.match(/^\/invoices\/([^/]+)\/simulate-payment$/);
      const child = path.match(/^\/customers\/([^/]+)\/(contracts|invoices|tickets)(\/open)?$/);
      const customer = path.match(/^\/customers\/([^/]+)$/);
      if (payment && request.method === "POST") result = await adapter.simulatePayment(payment[1]);
      else if (child && request.method === "GET") result = child[2] === "contracts" ? await adapter.getContracts(child[1]) : child[2] === "tickets" ? await adapter.getTickets(child[1]) : await adapter.getInvoices(child[1], Boolean(child[3]));
      else if (customer && request.method === "GET") result = await adapter.getCustomer(customer[1]);
      else result = { status: 404, body: { success: false, error: "ENDPOINT_NOT_FOUND" } };
    }
  } catch (error) {
    result = { status: 500, body: { success: false, error: "INTERNAL_ERROR" } };
  }

  await db.from("api_logs").insert({ endpoint: path, method: request.method, status_code: result.status, request_body: body, response_body: result.body as never, duration_ms: Date.now() - started, error: result.status >= 400 ? JSON.stringify(result.body) : null });
  return json(result);
}

export const Route = createFileRoute("/api/public/v1/$")({ server: { handlers: {
  GET: ({ request, params }) => handle(request, params._splat ?? ""),
  POST: ({ request, params }) => handle(request, params._splat ?? ""),
  OPTIONS: async () => new Response(null, { status: 204, headers }),
} } });