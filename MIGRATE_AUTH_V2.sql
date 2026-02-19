-- ADICIONAR COLUNAS DE TRIAL E TIPO DE PLANO

-- 1. Tabela CTS (Academias)
ALTER TABLE public.cts 
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'trial'; -- trial, starter, pro, enterprise

-- 2. Tabela PROFILES (Para professores freelancers sem CT formal ainda)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'standard'; -- standard, admin_ct, professor_freelancer

-- 3. TRIGGER PARA DEFINIR TRIAL NO CADASTRO
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o usuário criou um CT (admin_ct), o trial é setado no CT via backend.
  -- Mas se for um professor avulso, o trial é no profile.
  NEW.trial_ends_at := now() + interval '7 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- (Opcional) Trigger before insert on profiles se quiser automatizar no DB, 
-- mas faremos via Supabase Auth Hook ou Edge Function para ter mais controle.

-- 4. VIEW PARA STATUS DE ASSINATURA UNIFICADO
CREATE OR REPLACE VIEW public.subscription_status_view AS
SELECT 
    p.id as user_id,
    p.email,
    CASE 
        WHEN c.id IS NOT NULL THEN c.trial_ends_at 
        ELSE p.trial_ends_at 
    END as trial_ends_at,
    CASE 
        WHEN c.id IS NOT NULL THEN c.subscription_status
        ELSE 'trial' -- Default para freelancer
    END as status
FROM public.profiles p
LEFT JOIN public.cts c ON p.ct_id = c.id;

-- 5. NOTIFICAÇÃO DE CADASTRO (Hook OMD)
-- Esta função deve ser chamada por uma Trigger na tabela auth.users ou configurada como Database Webhook no painel Supabase.

-- CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.notify_omd_signup()
RETURNS TRIGGER AS $$
DECLARE
  request_body jsonb;
BEGIN
  request_body := jsonb_build_object(
      'email', NEW.email,
      'id', NEW.id,
      'meta', NEW.raw_user_meta_data,
      'created_at', NEW.created_at
  );

  -- Dispara requisição assíncrona para o OMD
  PERFORM net.http_post(
      url := 'https://omd.vandersonoliveira.com.br/webhook/bjjoss/signup',
      body := request_body,
      headers := '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- COMANDO PARA ATIVAR A TRIGGER (Rodar no SQL Editor do Supabase):
-- CREATE TRIGGER on_auth_user_created
-- AFTER INSERT ON auth.users
-- FOR EACH ROW EXECUTE FUNCTION public.notify_omd_signup();

