import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Copy, ShieldCheck, Wifi } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/api-docs")({
  head: () => ({ meta: [
    { title: "Documentação da API — TALOS ISP LAB" },
    { name: "description", content: "Referência da API v1 do laboratório TALOS ISP LAB." },
    { property: "og:title", content: "Documentação da API — TALOS ISP LAB" },
    { property: "og:description", content: "Endpoints e exemplos para integrar o GoHighLevel ao laboratório." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }), component: ApiDocs,
});

const docs = [
  ["GET", "/health", "Verifica se a API está disponível.", null, { status: "ok", service: "Talos ISP Lab", version: "1.0" }],
  ["GET", "/customers/by-cpf?cpf=000.000.000-01", "Localiza cliente pelo CPF de teste.", null, { success: true, customer: { external_id: "CLI-1001", name: "Cliente Fictício" } }],
  ["GET", "/customers/{external_id}", "Consulta os dados de um cliente.", null, { success: true, customer: { external_id: "CLI-1001" } }],
  ["GET", "/customers/{external_id}/contracts", "Lista contratos do cliente.", null, { success: true, contracts: [] }],
  ["GET", "/customers/{external_id}/invoices/open", "Lista faturas abertas e vencidas.", null, { success: true, invoices: [] }],
  ["GET", "/customers/{external_id}/tickets", "Lista chamados do cliente.", null, { success: true, tickets: [] }],
  ["POST", "/customers", "Cadastra um cliente fictício.", { name: "Cliente Fictício", cpf: "000.000.000-99", phone: "5516999999999", cep: "13560000", city: "São Carlos", state: "SP", neighborhood: "Centro" }, { success: true, customer: { external_id: "CLI-1011" } }],
  ["POST", "/coverage/check", "Consulta somente áreas cadastradas.", { cep: "13560000", city: "São Carlos", neighborhood: "Centro" }, { covered: true, available_plans: ["PLAN-400", "PLAN-600"] }],
  ["POST", "/tickets", "Abre um chamado e gera protocolo.", { customer_id: "CLI-1001", category: "technical", priority: "normal", description: "Sem conexão desde a manhã" }, { success: true, ticket: { external_id: "OS-10006", protocol: "OS-10006" } }],
  ["POST", "/sales/complete", "Cria cliente, contrato e primeira fatura em uma transação idempotente.", { name: "Novo Lead Fictício", cpf: "000.000.000-98", phone: "5516999999998", cep: "13560000", city: "São Carlos", neighborhood: "Centro", plan_external_id: "PLAN-600", external_reference: "GHL-TEST-001" }, { success: true, customer_external_id: "CLI-1012", contract_external_id: "CTR-1011", invoice_external_id: "FAT-1021" }],
  ["POST", "/invoices/{external_id}/simulate-payment", "Marca uma fatura como paga somente no laboratório.", {}, { success: true, invoice: { external_id: "FAT-1001", status: "paid" } }],
  ["POST", "/simulation/api-error", "Simula timeout, 500, 404, 401 ou JSON inválido.", { type: "500" }, { success: false, error: "SIMULATED_500" }],
  ["POST", "/webhooks/ghl", "Recebe uma venda fictícia do GHL com idempotência.", { event_id: "evt_test_001", contact: { name: "Lead Fictício", cpf: "000.000.000-97", phone: "5516999999997", cep: "13560000", city: "São Carlos", neighborhood: "Centro" }, plan: { external_id: "PLAN-400" } }, { success: true }],
] as const;

function ApiDocs() {
  const base = typeof window === "undefined" ? "/api/public/v1" : `${window.location.origin}/api/public/v1`;
  const copy = (text: string) => void navigator.clipboard.writeText(text).then(() => toast.success("Copiado"));
  return <div className="min-h-screen bg-muted/30"><header className="border-b bg-background"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><a href="/" className="flex items-center gap-3 font-semibold"><span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground"><Wifi className="size-4" /></span>TALOS ISP LAB</a><Button variant="outline" size="sm" asChild><a href="/">Abrir painel</a></Button></div></header><main className="mx-auto max-w-6xl px-5 py-10"><div className="max-w-3xl"><Badge variant="outline">API v1</Badge><h1 className="mt-4 text-4xl font-semibold">Documentação da API</h1><p className="mt-3 text-muted-foreground">Referência para integrar e testar fluxos do GoHighLevel com dados totalmente fictícios.</p></div><Card className="mt-8 rounded-lg shadow-sm"><CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-medium uppercase text-muted-foreground">Base URL</p><code className="mt-1 block break-all text-sm">{base}</code></div><Button variant="outline" size="sm" onClick={() => copy(base)}><Copy />Copiar</Button></CardContent></Card><div className="mt-5 rounded-md border border-warning/25 bg-warning/10 p-4 text-sm"><div className="flex gap-3"><ShieldCheck className="mt-0.5 size-5 shrink-0" /><div><strong>Autenticação</strong><p className="mt-1 text-muted-foreground">Envie <code>Authorization: Bearer &lt;SUA_TEST_KEY&gt;</code>. A chave não é exibida nesta documentação. O endpoint <code>/health</code> é público.</p></div></div></div><section className="mt-10 space-y-5"><div><h2 className="text-xl font-semibold">Endpoints</h2><p className="mt-1 text-sm text-muted-foreground">Respostas usam JSON, exceto a simulação intencional de JSON inválido.</p></div>{docs.map(([method, path, description, request, response]) => <Card key={`${method}-${path}`} className="rounded-lg shadow-sm"><CardContent className="p-0"><div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center"><Badge variant={method === "POST" ? "default" : "outline"}>{method}</Badge><code className="break-all text-sm font-semibold">{path}</code><span className="text-sm text-muted-foreground sm:ml-auto">{description}</span></div><div className="grid md:grid-cols-2">{request !== null && <CodeBlock title="Request" value={request} />}<CodeBlock title="Response de exemplo" value={response} /><div className="border-t p-4 text-xs text-muted-foreground md:col-span-2">Respostas comuns: <strong>200/201</strong> sucesso · <strong>400</strong> dados inválidos · <strong>401</strong> chave inválida · <strong>404</strong> não encontrado · <strong>429</strong> limite excedido · <strong>503</strong> ERP offline</div></div></CardContent></Card>)}</section><footer className="py-10 text-center text-xs text-muted-foreground">PIX, boleto, vendas e pagamentos são somente simulações de laboratório.</footer></main></div>;
}
function CodeBlock({ title, value }: { title: string; value: unknown }) { return <div className="border-t p-5 md:border-r"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-medium uppercase text-muted-foreground">{title}</p><BookOpen className="size-4 text-muted-foreground" /></div><pre className="overflow-x-auto rounded-md bg-code p-4 text-xs leading-5 text-code-foreground">{JSON.stringify(value, null, 2)}</pre></div>; }