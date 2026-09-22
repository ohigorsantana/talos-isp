import { createFileRoute } from "@tanstack/react-router";
import { TalosDashboard } from "@/components/talos-dashboard";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "TALOS ISP LAB — Painel" },
    { name: "description", content: "Painel seguro do laboratório de ERP fictício para provedores." },
    { property: "og:title", content: "TALOS ISP LAB — Painel" },
    { property: "og:description", content: "Laboratório funcional para testes de integração de provedores." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: TalosDashboard,
});
