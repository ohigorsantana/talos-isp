import { createHash } from "crypto";

type Admin = Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"];

export type ApiResult = { status: number; body: unknown };

export interface ERPAdapter {
  getCustomer(externalId: string): Promise<ApiResult>;
  getInvoices(externalId: string, openOnly?: boolean): Promise<ApiResult>;
  createTicket(input: Record<string, unknown>): Promise<ApiResult>;
  checkCoverage(input: Record<string, unknown>): Promise<ApiResult>;
  completeSale(input: Record<string, unknown>, idempotencyKey?: string): Promise<ApiResult>;
}

const ok = (body: unknown, status = 200): ApiResult => ({ status, body });
const fail = (error: string, status = 400): ApiResult => ({ status, body: { success: false, error } });

export class MockERPAdapter implements ERPAdapter {
  constructor(private db: Admin) {}

  async getCustomer(externalId: string) {
    const { data, error } = await this.db.from("customers").select("*").eq("external_id", externalId).maybeSingle();
    return error ? fail("DATABASE_ERROR", 500) : data ? ok({ success: true, customer: data }) : fail("CUSTOMER_NOT_FOUND", 404);
  }

  async findCustomer(field: "cpf" | "phone", value: string) {
    const { data, error } = await this.db.from("customers").select("*").eq(field, value).maybeSingle();
    return error ? fail("DATABASE_ERROR", 500) : data ? ok({ success: true, customer: data }) : fail("CUSTOMER_NOT_FOUND", 404);
  }

  async createCustomer(input: Record<string, unknown>) {
    if (typeof input.name !== "string" || input.name.length < 2) return fail("INVALID_NAME");
    if (typeof input.cpf !== "string" || !/^[\d.\/-]{5,18}$/.test(input.cpf)) return fail("INVALID_CPF");
    const { data, error } = await this.db.from("customers").insert({
      name: input.name, cpf: input.cpf, phone: String(input.phone ?? ""), email: input.email ? String(input.email) : null,
      cep: String(input.cep ?? ""), city: String(input.city ?? ""), state: String(input.state ?? "SP"),
      neighborhood: String(input.neighborhood ?? ""), address: String(input.address ?? ""), number: String(input.number ?? ""),
      source: String(input.source ?? "API"), status: "active",
    }).select("external_id,name,status").single();
    if (error?.code === "23505") return fail("CUSTOMER_ALREADY_EXISTS", 409);
    return error ? fail("DATABASE_ERROR", 500) : ok({ success: true, customer: data }, 201);
  }

  async getContracts(externalId: string) {
    const { data: customer } = await this.db.from("customers").select("id").eq("external_id", externalId).maybeSingle();
    if (!customer) return fail("CUSTOMER_NOT_FOUND", 404);
    const { data, error } = await this.db.from("contracts").select("*, plans(external_id,name,download_mbps,monthly_price)").eq("customer_id", customer.id);
    return error ? fail("DATABASE_ERROR", 500) : ok({ success: true, contracts: data });
  }

  async getInvoices(externalId: string, openOnly = false) {
    const { data: customer } = await this.db.from("customers").select("id").eq("external_id", externalId).maybeSingle();
    if (!customer) return fail("CUSTOMER_NOT_FOUND", 404);
    let query = this.db.from("invoices").select("external_id,status,amount,due_date,pix_code,boleto_url,paid_at").eq("customer_id", customer.id).order("due_date", { ascending: false });
    if (openOnly) query = query.in("status", ["open", "overdue"]);
    const { data, error } = await query;
    return error ? fail("DATABASE_ERROR", 500) : ok({ success: true, invoices: data });
  }

  async getTickets(externalId: string) {
    const { data: customer } = await this.db.from("customers").select("id").eq("external_id", externalId).maybeSingle();
    if (!customer) return fail("CUSTOMER_NOT_FOUND", 404);
    const { data, error } = await this.db.from("tickets").select("external_id,protocol,category,priority,status,description,created_at").eq("customer_id", customer.id).order("created_at", { ascending: false });
    return error ? fail("DATABASE_ERROR", 500) : ok({ success: true, tickets: data });
  }

  async createTicket(input: Record<string, unknown>) {
    const customerExternal = String(input.customer_id ?? "");
    const { data: customer } = await this.db.from("customers").select("id").eq("external_id", customerExternal).maybeSingle();
    if (!customer) return fail("CUSTOMER_NOT_FOUND", 404);
    const categories = ["technical","financial","commercial","installation","cancellation","other"] as const;
    const priorities = ["low","normal","high","urgent"] as const;
    const category = String(input.category ?? "other") as typeof categories[number];
    const priority = String(input.priority ?? "normal") as typeof priorities[number];
    if (!categories.includes(category) || !priorities.includes(priority) || String(input.description ?? "").length < 3) return fail("INVALID_PAYLOAD");
    const { data, error } = await this.db.from("tickets").insert({ customer_id: customer.id, category, priority, description: String(input.description), status: "open" }).select("external_id,protocol,status,created_at").single();
    return error ? fail("DATABASE_ERROR", 500) : ok({ success: true, ticket: data }, 201);
  }

  async checkCoverage(input: Record<string, unknown>) {
    let query = this.db.from("coverage").select("covered,available_plans").eq("cep", String(input.cep ?? ""));
    if (input.city) query = query.ilike("city", String(input.city));
    if (input.neighborhood) query = query.ilike("neighborhood", String(input.neighborhood));
    const { data, error } = await query.maybeSingle();
    if (error) return fail("DATABASE_ERROR", 500);
    return ok({ covered: data?.covered ?? false, available_plans: data?.covered ? data.available_plans : [] });
  }

  async completeSale(input: Record<string, unknown>, idempotencyKey?: string) {
    const required = ["name","cpf","phone","cep","city","neighborhood","plan_external_id"];
    if (required.some((key) => typeof input[key] !== "string" || !String(input[key]).trim())) return fail("INVALID_PAYLOAD");
    const { data, error } = await this.db.rpc("complete_mock_sale", {
      p_name: String(input.name), p_cpf: String(input.cpf), p_phone: String(input.phone), p_cep: String(input.cep),
      p_city: String(input.city), p_neighborhood: String(input.neighborhood), p_plan_external_id: String(input.plan_external_id),
      p_source: String(input.source ?? "GHL"), p_idempotency_key: idempotencyKey ?? null,
    });
    if (error?.message.includes("PLAN_NOT_FOUND")) return fail("PLAN_NOT_FOUND", 404);
    return error ? fail("SALE_PROCESSING_ERROR", 500) : ok(data, 201);
  }

  async simulatePayment(externalId: string) {
    const { data, error } = await this.db.from("invoices").update({ status: "paid", paid_at: new Date().toISOString() }).eq("external_id", externalId).in("status", ["open","overdue"]).select("external_id,status,paid_at").maybeSingle();
    return error ? fail("DATABASE_ERROR", 500) : data ? ok({ success: true, invoice: data }) : fail("INVOICE_NOT_FOUND_OR_PAID", 404);
  }
}

export async function authenticateApi(db: Admin, request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? request.headers.get("x-api-key") ?? "";
  if (!token) return false;
  const hash = createHash("sha256").update(token).digest("hex");
  const { data } = await db.from("api_keys").select("id").eq("key_hash", hash).eq("active", true).maybeSingle();
  return Boolean(data);
}

export async function checkRateLimit(db: Admin, request: Request) {
  const identity = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown";
  const hash = createHash("sha256").update(identity).digest("hex");
  const windowStart = new Date(Math.floor(Date.now() / 60000) * 60000).toISOString();
  const { data } = await db.from("api_rate_limits").select("request_count").eq("client_hash", hash).eq("window_start", windowStart).maybeSingle();
  if ((data?.request_count ?? 0) >= 120) return false;
  await db.from("api_rate_limits").upsert({ client_hash: hash, window_start: windowStart, request_count: (data?.request_count ?? 0) + 1 });
  return true;
}