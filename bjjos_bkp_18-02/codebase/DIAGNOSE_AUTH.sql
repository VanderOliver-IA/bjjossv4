-- ====================================================================
-- DIAGNÓSTICO PROFUNDO + CORREÇÃO DEFINITIVA
-- Cole e execute no SQL Editor do Supabase
-- ====================================================================

-- 1. Ver o que existe em auth.users
SELECT id, email, email_confirmed_at, role, aud, created_at 
FROM auth.users 
WHERE email IN ('super@bjjoss.com', 'admin@brasilia.com', 'prof@brasilia.com', 'atendente@brasilia.com', 'aluno@brasilia.com');

-- 2. Ver identities (necessário para login funcionar)
SELECT * FROM auth.identities 
WHERE email IN ('super@bjjoss.com', 'admin@brasilia.com', 'prof@brasilia.com', 'atendente@brasilia.com', 'aluno@brasilia.com');
