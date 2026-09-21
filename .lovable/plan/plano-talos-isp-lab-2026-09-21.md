# Plano — TALOS ISP LAB

## Resultado
Construir um laboratório funcional de ERP para provedor, com painel autenticado, dados totalmente fictícios e API HTTP pública autenticada para testes do GoHighLevel.

## Etapas
1. **Base segura e dados de laboratório**
   - Criar as 9 tabelas solicitadas, configuração online/offline, restrições de status, índices, RLS e permissões mínimas.
   - Inserir a empresa, 4 planos, 10 clientes, 10 contratos, 10–20 faturas, 5 chamados e 10 áreas de cobertura fictícias.
   - Armazenar apenas hash da chave de teste; nunca exibir credenciais privadas.

2. **API HTTP e adapter**
   - Implementar um único endpoint versionado que atende `/api/public/v1/*`, com `MockERPAdapter` desacoplado para futura troca de ERP.
   - Entregar consultas, cadastros, cobertura, venda completa transacional, pagamento simulado, falhas simuladas, modo offline e webhook do GHL.
   - Validar entradas, autenticar por chave, aplicar limite básico de chamadas, registrar logs e garantir idempotência por `event_id`/`external_reference`.
   - PIX e boleto serão rótulos/URLs de teste, sem cobrança real.

3. **Painel web**
   - Criar acesso autenticado e navegação lateral para Dashboard, Clientes, Contratos, Planos, Faturas, Chamados, Cobertura, API, Logs e Simulador.
   - Implementar cadastro e consulta de clientes, detalhes, criação/atualização de chamados, cobertura, pagamento simulado e controle online/offline.
   - Mostrar dados e atualizações do laboratório em telas simples, limpas e responsivas.

4. **Documentação e simulador**
   - Criar `/api-docs` público com autenticação, exemplos, respostas, códigos HTTP e erros de todos os endpoints.
   - Criar testes internos para consultar cliente/fatura/cobertura, abrir chamado, fechar venda e simular falhas, exibindo request, response, status e tempo.

5. **Validação final**
   - Validar autenticação, RLS, todos os endpoints, duplicidade de eventos, modo offline, logs e os fluxos visuais principais em desktop e celular.
   - Confirmar que nenhum dado real, chave privada, pagamento real ou integração de rede/ERP foi incluído.

## Detalhes técnicos
- O projeto continuará em React, TypeScript, Tailwind e componentes existentes.
- Como este projeto usa TanStack Start, os endpoints HTTP serão rotas públicas de servidor equivalentes às Edge Functions, apropriadas para webhooks e chamadas externas.
- Operações compostas de venda/webhook serão executadas por função SQL transacional para evitar registros parciais ou duplicados.
- A API usará `Authorization: Bearer <TEST_KEY>`; somente o hash será persistido.
