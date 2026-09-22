# ISP Testbed Hub

# TALOS ISP LAB
## MOCK ERP / AMBIENTE DE TESTES PARA PROVEDOR DE INTERNET

Quero construir um sistema web chamado:

TALOS ISP LAB

O objetivo NÃO é criar um ERP comercial real neste momento.

O objetivo é criar um ambiente de laboratório que simule um ERP de provedor de internet para que outro sistema externo, especialmente GoHighLevel, possa consumir uma API HTTP e realizar testes reais de integração.

IMPORTANTE:

- Não copiar visualmente ou tecnicamente nenhum ERP existente.
- Não copiar HubSoft, IXC Soft, SGP, MKAuth, BeesWeb ou qualquer outro sistema.
- Apenas utilizar conceitos comuns de ERPs de provedores de internet.
- A interface deve ser simples, limpa e funcional.
- Priorizar funcionamento da API e banco de dados.
- O sistema deve ser construído com Supabase.
- Usar Supabase Postgres como banco.
- Usar Supabase Edge Functions para endpoints HTTP.
- Nunca colocar secrets no frontend.
- Habilitar RLS nas tabelas expostas.
- Criar dados fictícios.
- Nenhum dado real de cliente deve ser utilizado.

==================================================
1. OBJETIVO DO SISTEMA
==================================================

Criar um Mock ERP capaz de simular:

1. Cadastro de clientes
2. Consulta de clientes
3. Consulta por CPF
4. Consulta por telefone
5. Cadastro de contratos
6. Consulta de contratos
7. Cadastro de planos
8. Consulta de planos
9. Cadastro de faturas
10. Consulta de faturas
11. Consulta de fatura em aberto
12. Consulta de PIX
13. Consulta de boleto
14. Cadastro de chamados
15. Consulta de chamados
16. Consulta de cobertura
17. Simulação de venda concluída
18. Criação automática de cliente através de API
19. Criação automática de contrato através de API
20. Criação automática de fatura através de API
21. Registro de logs das chamadas da API

O sistema será utilizado como ERP fictício para testar o Talos ISP AI dentro do GoHighLevel.

==================================================
2. STACK
==================================================

Frontend:

- React
- TypeScript
- Tailwind
- shadcn/ui

Backend:

- Supabase
- PostgreSQL
- Supabase Edge Functions

Autenticação:

- Supabase Auth

API:

- REST/HTTP
- JSON

Realtime:

- Pode utilizar Supabase Realtime para atualizar o painel quando necessário.

==================================================
3. ESTRUTURA DO BANCO
==================================================

Criar as seguintes tabelas:

companies
customers
plans
contracts
invoices
tickets
coverage
api_keys
api_logs
webhook_events

----------------------------------
companies
----------------------------------

id UUID primary key
name TEXT
document TEXT
city TEXT
state TEXT
status TEXT
created_at TIMESTAMPTZ

Criar inicialmente:

name:
"ISP Teste Talos"

city:
"São Carlos"

state:
"SP"

status:
"active"

----------------------------------
customers
----------------------------------

id UUID primary key

external_id TEXT UNIQUE

name TEXT NOT NULL

cpf TEXT UNIQUE

phone TEXT

email TEXT

birth_date DATE nullable

city TEXT

state TEXT

cep TEXT

neighborhood TEXT

address TEXT

number TEXT

status TEXT

source TEXT

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

Valores possíveis para status:

active
inactive
suspended
cancelled
prospect

----------------------------------
plans
----------------------------------

id UUID primary key

external_id TEXT UNIQUE

name TEXT

description TEXT

download_mbps INTEGER

upload_mbps INTEGER

monthly_price NUMERIC

active BOOLEAN

created_at TIMESTAMPTZ

Criar inicialmente:

Plano 400 Mega
Plano 600 Mega
Plano 800 Mega
Plano 1 Giga

----------------------------------
contracts
----------------------------------

id UUID primary key

external_id TEXT UNIQUE

customer_id UUID REFERENCES customers(id)

plan_id UUID REFERENCES plans(id)

status TEXT

installation_date DATE

due_day INTEGER

monthly_price NUMERIC

created_at TIMESTAMPTZ

Valores:

active
pending
suspended
cancelled

----------------------------------
invoices
----------------------------------

id UUID primary key

external_id TEXT UNIQUE

customer_id UUID REFERENCES customers(id)

contract_id UUID REFERENCES contracts(id)

amount NUMERIC

due_date DATE

status TEXT

pix_code TEXT

pix_qr_code TEXT

boleto_url TEXT

paid_at TIMESTAMPTZ nullable

created_at TIMESTAMPTZ

Valores:

open
paid
overdue
cancelled

IMPORTANTE:

Os códigos PIX e URLs de boleto são fictícios.

Nunca gerar PIX ou boleto real.

----------------------------------
tickets
----------------------------------

id UUID primary key

external_id TEXT UNIQUE

customer_id UUID REFERENCES customers(id)

category TEXT

description TEXT

priority TEXT

status TEXT

protocol TEXT

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

Categorias:

technical
financial
commercial
installation
cancellation
other

Prioridades:

low
normal
high
urgent

Status:

open
in_progress
resolved
cancelled

----------------------------------
coverage
----------------------------------

id UUID primary key

cep TEXT

city TEXT

state TEXT

neighborhood TEXT

covered BOOLEAN

available_plans JSONB

created_at TIMESTAMPTZ

Criar dados fictícios para cobertura.

----------------------------------
api_keys
----------------------------------

id UUID primary key

name TEXT

key_hash TEXT

active BOOLEAN

created_at TIMESTAMPTZ

IMPORTANTE:

Nunca armazenar API key em texto puro se não for necessário.

A API deve possuir mecanismo simples de autenticação.

----------------------------------
api_logs
----------------------------------

id UUID primary key

endpoint TEXT

method TEXT

status_code INTEGER

request_body JSONB

response_body JSONB

duration_ms INTEGER

created_at TIMESTAMPTZ

----------------------------------
webhook_events
----------------------------------

id UUID primary key

event_type TEXT

payload JSONB

processed BOOLEAN

created_at TIMESTAMPTZ

==================================================
4. CLIENTES DE TESTE
==================================================

Criar automaticamente alguns clientes fictícios.

Exemplo:

CLI-1001
João da Silva
CPF fictício
telefone fictício
status active

CLI-1002
Maria Oliveira
CPF fictício
status active

CLI-1003
Carlos Santos
CPF fictício
status suspended

CLI-1004
Ana Souza
CPF fictício
status cancelled

CLI-1005
Pedro Lima
CPF fictício
status prospect

Utilizar CPFs claramente fictícios/testes.

Nunca utilizar dados reais.

Criar diferentes situações para testes.

==================================================
5. CONTRATOS DE TESTE
==================================================

Criar contratos associados aos clientes.

Exemplo:

CTR-1001
Cliente CLI-1001
Plano 600 Mega
Status active
Valor R$ 99,90

CTR-1002
Cliente CLI-1002
Plano 800 Mega
Status active
Valor R$ 119,90

CTR-1003
Cliente CLI-1003
Plano 400 Mega
Status suspended

==================================================
6. FATURAS DE TESTE
==================================================

Criar diferentes cenários.

Cliente CLI-1001:

Fatura aberta
R$ 99,90
vencimento futuro
PIX fictício
boleto fictício

Cliente CLI-1002:

Fatura paga

Cliente CLI-1003:

Fatura vencida

Isso permitirá testar:

"Quero minha segunda via"

"Minha fatura está atrasada"

"Quero pagar por PIX"

==================================================
7. TICKETS DE TESTE
==================================================

Criar chamados fictícios.

Exemplo:

OS-10001
Cliente CLI-1001
Categoria technical
Prioridade normal
Status open

OS-10002
Cliente CLI-1002
Categoria technical
Status in_progress

==================================================
8. API REST
==================================================

Criar Supabase Edge Functions para os seguintes endpoints.

BASE:

/functions/v1/api/v1/

----------------------------------
GET /health
----------------------------------

Retornar:

{
  "status": "ok",
  "service": "Talos ISP Lab",
  "version": "1.0"
}

----------------------------------
POST /customers
----------------------------------

Criar cliente.

Entrada:

{
  "name": "João da Silva",
  "cpf": "CPF_TESTE",
  "phone": "5511999999999",
  "email": "teste@example.com",
  "cep": "13500000",
  "city": "São Carlos",
  "state": "SP",
  "neighborhood": "Centro",
  "address": "Rua Teste",
  "number": "100",
  "source": "GHL"
}

Retornar:

{
  "success": true,
  "customer": {
    "external_id": "CLI-1006",
    "name": "João da Silva",
    "status": "active"
  }
}

----------------------------------
GET /customers/by-cpf
----------------------------------

Query:

?cpf=...

Retornar cliente.

----------------------------------
GET /customers/by-phone
----------------------------------

Query:

?phone=...

Retornar cliente.

----------------------------------
GET /customers/{external_id}
----------------------------------

Consultar cliente.

----------------------------------
GET /customers/{external_id}/contracts
----------------------------------

Consultar contratos do cliente.

----------------------------------
GET /customers/{external_id}/invoices
----------------------------------

Consultar todas as faturas.

----------------------------------
GET /customers/{external_id}/invoices/open
----------------------------------

Retornar apenas faturas abertas ou vencidas.

----------------------------------
GET /customers/{external_id}/tickets
----------------------------------

Consultar chamados.

----------------------------------
POST /tickets
----------------------------------

Criar chamado.

Entrada:

{
  "customer_id": "CLI-1001",
  "category": "technical",
  "description": "Cliente informou que está sem internet",
  "priority": "normal"
}

Gerar automaticamente:

ticket_id

protocol

created_at

Retornar:

{
  "success": true,
  "ticket": {
    "external_id": "OS-10010",
    "protocol": "202609211001",
    "status": "open"
  }
}

----------------------------------
POST /coverage/check
----------------------------------

Consultar cobertura.

Entrada:

{
  "cep": "13500000",
  "city": "São Carlos",
  "neighborhood": "Centro"
}

Retornar:

{
  "covered": true,
  "available_plans": [
    {
      "id": "PLAN-600",
      "name": "600 Mega",
      "price": 99.90
    }
  ]
}

Se não houver cobertura:

{
  "covered": false,
  "available_plans": []
}

NUNCA inventar cobertura.

----------------------------------
POST /sales/complete
----------------------------------

Este será um endpoint especialmente importante.

Objetivo:

Simular o fechamento de uma venda originada no GoHighLevel.

Entrada:

{
  "name": "João da Silva",
  "cpf": "CPF_TESTE",
  "phone": "5511999999999",
  "cep": "13500000",
  "city": "São Carlos",
  "neighborhood": "Centro",
  "plan_external_id": "PLAN-600",
  "source": "GHL"
}

Fluxo:

1. Verificar se cliente já existe por CPF.
2. Se não existir, criar cliente.
3. Se existir, utilizar cliente existente.
4. Criar contrato.
5. Associar plano.
6. Criar primeira fatura.
7. Registrar evento no api_logs.
8. Retornar todos os IDs criados.

Resposta:

{
  "success": true,

  "customer": {
    "external_id": "CLI-1006"
  },

  "contract": {
    "external_id": "CTR-1006"
  },

  "invoice": {
    "external_id": "FAT-1006",
    "status": "open",
    "amount": 99.90,
    "pix_code": "PIX-TEST-1006",
    "boleto_url": "https://example.test/boleto/FAT-1006"
  }
}

IMPORTANTE:

Esse endpoint é fictício.

Não gerar cobrança real.

==================================================
9. API PARA CONSULTA DE FATURA
==================================================

Criar:

GET

/customers/{external_id}/invoices/open

Retornar:

{
  "success": true,
  "invoices": [
    {
      "external_id": "FAT-1001",
      "status": "open",
      "amount": 99.90,
      "due_date": "2026-10-10",
      "pix_code": "PIX-TEST-1001",
      "boleto_url": "https://example.test/boleto/FAT-1001"
    }
  ]
}

==================================================
10. API PARA SIMULAR PAGAMENTO
==================================================

Criar endpoint:

POST /invoices/{external_id}/simulate-payment

Objetivo:

APENAS TESTE.

Alterar:

status = paid

paid_at = now()

Não integrar com gateway real.

==================================================
11. API PARA SIMULAR FALHA
==================================================

Criar endpoint:

POST /simulation/api-error

Permitir escolher:

timeout
500
404
401
invalid_json

Objetivo:

testar o comportamento do GHL quando a API do ERP falhar.

Não utilizar isso em produção.

==================================================
12. API PARA SIMULAR ERP OFFLINE
==================================================

Criar uma configuração:

ERP ONLINE / ERP OFFLINE

Quando estiver OFFLINE:

as chamadas da API devem retornar:

HTTP 503

{
  "success": false,
  "error": "ERP_UNAVAILABLE"
}

Isso será utilizado para testar o fallback humano do Talos ISP AI.

==================================================
13. PAINEL WEB
==================================================

Criar sidebar:

Dashboard
Clientes
Contratos
Planos
Faturas
Chamados
Cobertura
API
Logs
Simulador

----------------------------------
Dashboard
----------------------------------

Mostrar:

Total de clientes

Clientes ativos

Clientes suspensos

Faturas abertas

Faturas vencidas

Chamados abertos

Leads

API status

ERP status

----------------------------------
Clientes
----------------------------------

Tabela:

ID
Nome
CPF
Telefone
Status
Plano
Contrato

Botão:

"Novo cliente"

----------------------------------
Detalhes do cliente
----------------------------------

Mostrar:

Dados pessoais

Contrato

Plano

Status

Faturas

Chamados

Histórico

----------------------------------
Novo cliente
----------------------------------

Formulário:

Nome
CPF
Telefone
Email
CEP
Cidade
Estado
Bairro
Endereço
Número

Botão:

"Cadastrar cliente"

Ao salvar:

gerar external_id automaticamente.

----------------------------------
Faturas
----------------------------------

Tabela:

Fatura
Cliente
Valor
Vencimento
Status

Botões:

Ver

Simular pagamento

----------------------------------
Chamados
----------------------------------

Mostrar:

Protocolo
Cliente
Categoria
Prioridade
Status

Permitir:

Criar chamado

Alterar status

----------------------------------
Cobertura
----------------------------------

Permitir:

Cadastrar CEP

Cidade

Bairro

Cobertura:

SIM/NÃO

Planos disponíveis

----------------------------------
API
----------------------------------

Criar uma página para desenvolvedor mostrando:

Base URL

Endpoints

Método

Descrição

Exemplo de request

Exemplo de response

Autenticação

Botão:

"Copiar"

para copiar:

Base URL

API Key

Endpoint

IMPORTANTE:

Nunca mostrar secret keys reais no frontend.

Se houver uma API key de teste, deixar claramente marcada como TEST KEY.

----------------------------------
Logs
----------------------------------

Mostrar:

Data

Endpoint

Método

Status

Tempo

Erro

Request

Response

Permitir abrir detalhes.

----------------------------------
Simulador
----------------------------------

Criar uma tela para testar a API sem Postman.

Cards:

[Consultar cliente]

[Consultar fatura]

[Consultar cobertura]

[Criar chamado]

[Fechar venda]

[Simular erro]

[Simular ERP offline]

Ao executar:

mostrar request

mostrar response

mostrar HTTP status

mostrar tempo de resposta.

==================================================
14. WEBHOOK PARA GHL
==================================================

Criar endpoint:

POST /webhooks/ghl

Esse endpoint deve aceitar eventos provenientes do GoHighLevel.

Exemplo:

{
  "event": "sale.completed",

  "contact": {
    "name": "João da Silva",
    "phone": "5511999999999",
    "cpf": "CPF_TESTE",
    "cep": "13500000"
  },

  "plan": {
    "external_id": "PLAN-600"
  }
}

Ao receber:

1. Validar autenticação.
2. Registrar webhook_events.
3. Verificar se já existe processamento idempotente.
4. Criar cliente se necessário.
5. Criar contrato.
6. Criar primeira fatura.
7. Registrar api_log.
8. Retornar sucesso.

==================================================
15. IDEMPOTÊNCIA
==================================================

Muito importante.

Se o GHL enviar o mesmo evento duas vezes:

NÃO criar dois clientes.

NÃO criar dois contratos.

NÃO criar duas vendas.

Criar mecanismo de idempotência utilizando:

event_id

ou

external_reference.

Se o mesmo evento chegar novamente:

retornar o resultado já processado.

==================================================
16. SEGURANÇA
==================================================

Implementar:

Supabase Auth

RLS

API authentication

Rate limiting básico quando possível

Validação de payload

Validação de CPF apenas como formato, sem consultar Receita Federal.

Nunca expor:

service_role key

secret keys

database credentials

no frontend.

Segredos devem permanecer em Edge Functions.

==================================================
17. DADOS DE TESTE
==================================================

Criar seed inicial.

Criar pelo menos:

10 clientes

10 contratos

10-20 faturas

5 chamados

10 registros de cobertura

4 planos

Criar situações:

cliente ativo

cliente suspenso

cliente cancelado

cliente sem fatura

cliente com fatura aberta

cliente com fatura vencida

cliente com chamado aberto

CEP com cobertura

CEP sem cobertura

==================================================
18. TESTE PRINCIPAL
==================================================

O sistema precisa permitir este teste:

PASSO 1

Criar lead no GHL.

PASSO 2

Lead conversa com IA.

PASSO 3

IA coleta:

nome
telefone
CPF
CEP
cidade
bairro
plano

PASSO 4

GHL consulta:

POST /coverage/check

PASSO 5

API retorna:

covered = true

PASSO 6

Lead avança para:

Pré-qualificado

Viabilidade

Proposta

Ganho

PASSO 7

GHL envia:

POST /sales/complete

PASSO 8

Mock ERP cria:

cliente

contrato

fatura

PASSO 9

No painel Talos ISP Lab deve aparecer:

Novo cliente criado.

PASSO 10

Depois testar no WhatsApp:

"Quero minha segunda via."

GHL deve:

1. identificar cliente
2. consultar API
3. buscar fatura aberta
4. receber PIX/boleto fictício
5. responder usando os dados da API.

==================================================
19. SEGUNDO TESTE
==================================================

Cliente envia:

"Estou sem internet."

GHL deve:

1. identificar cliente
2. consultar cliente
3. NÃO inventar diagnóstico técnico
4. criar ticket
5. retornar protocolo
6. encaminhar para humano quando necessário.

==================================================
20. TERCEIRO TESTE
==================================================

Cliente envia:

"Quero cancelar."

O V1 NÃO deve cancelar automaticamente.

Deve:

1. identificar cliente
2. registrar intenção de cancelamento
3. encaminhar para humano.

Não implementar módulo de retenção neste momento.

==================================================
21. ARQUITETURA FUTURA
==================================================

Preparar a estrutura para futuramente trocar:

Mock ERP

por:

IXC
HubSoft
SGP
MKAuth
BeesWeb
MK Solutions

IMPORTANTE:

Não implementar essas integrações agora.

Criar uma camada de abstração:

ERP Adapter

com funções conceituais:

getCustomer()
getInvoices()
getOpenInvoices()
createTicket()
checkCoverage()
createCustomer()
createContract()

O Mock ERP será o primeiro adapter.

Isso permitirá futuramente substituir:

MockERPAdapter

por:

IXCAdapter

HubSoftAdapter

SGPAdapter

etc.

Mas NÃO desenvolver os adapters reais agora.

==================================================
22. DOCUMENTAÇÃO
==================================================

Criar página:

/api-docs

Documentar:

GET /health

GET /customers/by-cpf

GET /customers/by-phone

GET /customers/{id}

GET /customers/{id}/contracts

GET /customers/{id}/invoices

GET /customers/{id}/invoices/open

GET /customers/{id}/tickets

POST /customers

POST /tickets

POST /coverage/check

POST /sales/complete

POST /invoices/{id}/simulate-payment

POST /simulation/api-error

POST /webhooks/ghl

Para cada endpoint mostrar:

Método

URL

Headers

Request

Response

HTTP status

Erros possíveis.

==================================================
23. NÃO FAZER
==================================================

Não implementar:

NOC

ACS

ONU

ONT

GenieACS

SmartOLT

Anlix

Integração real com roteador

Integração real com OLT

Integração real com ERP

Gateway de pagamento

PIX real

Boleto real

Cancelamento automático

Retenção automática

Cobrança real

Dados reais

==================================================
24. CRITÉRIO DE CONCLUSÃO
==================================================

Considerar o projeto concluído somente quando:

1. Posso abrir o painel.
2. Posso cadastrar cliente manualmente.
3. Posso consultar cliente.
4. Posso consultar fatura.
5. Posso consultar cobertura.
6. Posso criar chamado.
7. Posso simular pagamento.
8. Posso simular erro.
9. Posso colocar ERP OFFLINE.
10. Posso executar uma venda pelo endpoint.
11. A venda cria cliente.
12. A venda cria contrato.
13. A venda cria fatura.
14. Posso visualizar tudo no painel.
15. O GHL consegue chamar a API.
16. Logs são registrados.
17. Requisições duplicadas não duplicam clientes.
18. Nenhum secret aparece no frontend.
19. RLS está habilitado.
20. API Docs estão disponíveis.

Antes de finalizar, testar todos os fluxos acima.

Não reconstruir o projeto desnecessariamente caso alguma parte já exista.

Priorizar uma implementação funcional e simples em vez de uma interface sofisticada.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ee76cc04-f551-4087-8413-94ab7e687179).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
