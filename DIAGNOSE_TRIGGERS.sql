-- ====================================================================
-- DIAGNÓSTICO PROFUNDO DE TRIGGERS EM auth.users
-- Cole e execute no SQL Editor do Supabase
-- ====================================================================

-- 1. Listar TODOS os triggers em auth.users
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.action_timing,
  t.action_statement
FROM information_schema.triggers t
WHERE t.event_object_schema = 'auth' 
  AND t.event_object_table = 'users'
ORDER BY t.trigger_name;

-- 2. Ver o código da função handle_new_user ATUAL (após nosso fix)
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Testar a função diretamente (simular o que o trigger faz)
-- Isso vai mostrar se a função quebra ao ser chamada
DO $$
DECLARE
  test_id UUID := 'd0eebc99-1111-4ef8-bb6d-6bb9bd380f00';
BEGIN
  -- Simular o que o trigger faria
  INSERT INTO public.profiles (id, name, email)
  VALUES (test_id, 'Test', 'super@bjjoss.com')
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Função de perfil OK!';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERRO na função: %', SQLERRM;
END $$;

-- 4. Ver se há outros triggers problemáticos
SELECT 
  n.nspname as schema,
  c.relname as table_name,
  t.tgname as trigger_name,
  p.proname as function_name
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE n.nspname = 'auth'
ORDER BY c.relname, t.tgname;
