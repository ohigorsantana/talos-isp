CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.customer_status AS ENUM ('active','inactive','suspended','cancelled','prospect');
CREATE TYPE public.contract_status AS ENUM ('active','pending','suspended','cancelled');
CREATE TYPE public.invoice_status AS ENUM ('open','paid','overdue','cancelled');
CREATE TYPE public.ticket_category AS ENUM ('technical','financial','commercial','installation','cancellation','other');
CREATE TYPE public.ticket_priority AS ENUM ('low','normal','high','urgent');
CREATE TYPE public.ticket_status AS ENUM ('open','in_progress','resolved','cancelled');

CREATE SEQUENCE public.customer_external_seq START 1011;
CREATE SEQUENCE public.contract_external_seq START 1011;
CREATE SEQUENCE public.invoice_external_seq START 1021;
CREATE SEQUENCE public.ticket_external_seq START 10006;

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage companies" ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL UNIQUE DEFAULT ('CLI-' || nextval('public.customer_external_seq')::TEXT),
  name TEXT NOT NULL,
  cpf TEXT UNIQUE,
  phone TEXT,
  email TEXT,
  birth_date DATE,
  city TEXT,
  state TEXT,
  cep TEXT,
  neighborhood TEXT,
  address TEXT,
  number TEXT,
  status public.customer_status NOT NULL DEFAULT 'active',
  source TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.customer_external_seq TO authenticated, service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX customers_phone_idx ON public.customers(phone);
CREATE INDEX customers_status_idx ON public.customers(status);

CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  download_mbps INTEGER NOT NULL CHECK (download_mbps > 0),
  upload_mbps INTEGER NOT NULL CHECK (upload_mbps > 0),
  monthly_price NUMERIC(10,2) NOT NULL CHECK (monthly_price >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage plans" ON public.plans FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL UNIQUE DEFAULT ('CTR-' || nextval('public.contract_external_seq')::TEXT),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  status public.contract_status NOT NULL DEFAULT 'pending',
  installation_date DATE,
  due_day INTEGER NOT NULL DEFAULT 10 CHECK (due_day BETWEEN 1 AND 28),
  monthly_price NUMERIC(10,2) NOT NULL CHECK (monthly_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contracts TO authenticated;
GRANT ALL ON public.contracts TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.contract_external_seq TO authenticated, service_role;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage contracts" ON public.contracts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX contracts_customer_idx ON public.contracts(customer_id);

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL UNIQUE DEFAULT ('FAT-' || nextval('public.invoice_external_seq')::TEXT),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE RESTRICT,
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  due_date DATE NOT NULL,
  status public.invoice_status NOT NULL DEFAULT 'open',
  pix_code TEXT,
  pix_qr_code TEXT,
  boleto_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.invoice_external_seq TO authenticated, service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage invoices" ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX invoices_customer_idx ON public.invoices(customer_id);
CREATE INDEX invoices_status_due_idx ON public.invoices(status, due_date);

CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id TEXT NOT NULL UNIQUE DEFAULT ('OS-' || nextval('public.ticket_external_seq')::TEXT),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  category public.ticket_category NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 3 AND 2000),
  priority public.ticket_priority NOT NULL DEFAULT 'normal',
  status public.ticket_status NOT NULL DEFAULT 'open',
  protocol TEXT NOT NULL UNIQUE DEFAULT to_char(clock_timestamp(),'YYYYMMDDHH24MISSMS'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tickets TO authenticated;
GRANT ALL ON public.tickets TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.ticket_external_seq TO authenticated, service_role;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage tickets" ON public.tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX tickets_customer_idx ON public.tickets(customer_id);
CREATE INDEX tickets_status_idx ON public.tickets(status);

CREATE TABLE public.coverage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cep TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  covered BOOLEAN NOT NULL DEFAULT false,
  available_plans JSONB NOT NULL DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cep, city, neighborhood)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coverage TO authenticated;
GRANT ALL ON public.coverage TO service_role;
ALTER TABLE public.coverage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage coverage" ON public.coverage FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX coverage_lookup_idx ON public.coverage(cep, city, neighborhood);

CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  key_hash TEXT NOT NULL UNIQUE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users view API key labels" ON public.api_keys FOR SELECT TO authenticated USING (true);

CREATE TABLE public.api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  request_body JSONB,
  response_body JSONB,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.api_logs TO authenticated;
GRANT ALL ON public.api_logs TO service_role;
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users view API logs" ON public.api_logs FOR SELECT TO authenticated USING (true);
CREATE INDEX api_logs_created_idx ON public.api_logs(created_at DESC);

CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  result JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.webhook_events TO authenticated;
GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users view webhook events" ON public.webhook_events FOR SELECT TO authenticated USING (true);

CREATE TABLE public.lab_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  erp_online BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.lab_settings TO authenticated;
GRANT ALL ON public.lab_settings TO service_role;
ALTER TABLE public.lab_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users view lab settings" ON public.lab_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users update lab settings" ON public.lab_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.api_rate_limits (
  client_hash TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (client_hash, window_start)
);
GRANT ALL ON public.api_rate_limits TO service_role;
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.complete_mock_sale(
  p_name TEXT, p_cpf TEXT, p_phone TEXT, p_cep TEXT, p_city TEXT,
  p_neighborhood TEXT, p_plan_external_id TEXT, p_source TEXT,
  p_idempotency_key TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_customer public.customers;
  v_plan public.plans;
  v_contract public.contracts;
  v_invoice public.invoices;
  v_existing JSONB;
BEGIN
  IF p_idempotency_key IS NOT NULL THEN
    SELECT result INTO v_existing FROM public.webhook_events WHERE event_id = p_idempotency_key AND processed = true;
    IF v_existing IS NOT NULL THEN RETURN v_existing || jsonb_build_object('idempotent_replay', true); END IF;
  END IF;

  SELECT * INTO v_plan FROM public.plans WHERE external_id = p_plan_external_id AND active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'PLAN_NOT_FOUND'; END IF;

  SELECT * INTO v_customer FROM public.customers WHERE cpf = p_cpf FOR UPDATE;
  IF NOT FOUND THEN
    INSERT INTO public.customers(name, cpf, phone, cep, city, state, neighborhood, status, source)
    VALUES (p_name, p_cpf, p_phone, p_cep, p_city, 'SP', p_neighborhood, 'active', COALESCE(p_source,'GHL')) RETURNING * INTO v_customer;
  END IF;

  INSERT INTO public.contracts(customer_id, plan_id, status, installation_date, due_day, monthly_price)
  VALUES (v_customer.id, v_plan.id, 'pending', current_date + 7, 10, v_plan.monthly_price) RETURNING * INTO v_contract;

  INSERT INTO public.invoices(customer_id, contract_id, amount, due_date, status)
  VALUES (v_customer.id, v_contract.id, v_plan.monthly_price, current_date + 10, 'open') RETURNING * INTO v_invoice;
  UPDATE public.invoices SET pix_code = 'PIX-TEST-' || v_invoice.external_id,
    pix_qr_code = 'QR-TEST-' || v_invoice.external_id,
    boleto_url = 'https://example.test/boleto/' || v_invoice.external_id WHERE id = v_invoice.id RETURNING * INTO v_invoice;

  v_existing := jsonb_build_object('success', true,
    'customer', jsonb_build_object('external_id', v_customer.external_id),
    'contract', jsonb_build_object('external_id', v_contract.external_id),
    'invoice', jsonb_build_object('external_id', v_invoice.external_id, 'status', v_invoice.status, 'amount', v_invoice.amount, 'pix_code', v_invoice.pix_code, 'boleto_url', v_invoice.boleto_url));

  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO public.webhook_events(event_id, event_type, payload, processed, result)
    VALUES (p_idempotency_key, 'sale.completed', jsonb_build_object('cpf',p_cpf,'plan_external_id',p_plan_external_id), true, v_existing)
    ON CONFLICT (event_id) DO NOTHING;
  END IF;
  RETURN v_existing;
END; $$;
REVOKE ALL ON FUNCTION public.complete_mock_sale(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_mock_sale(TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT,TEXT) TO service_role;