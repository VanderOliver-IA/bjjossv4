-- ====================================================================
-- AUTH REPAIR SCRIPT - BJJOSS V4
-- Garante que os usuários Demo consigam logar com 123456
-- ====================================================================

-- 1. Garante a existência da extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Repair Users in auth.users
UPDATE auth.users 
SET 
  encrypted_password = crypt('123456', gen_salt('bf')),
  email_confirmed_at = now(),
  aud = 'authenticated',
  role = 'authenticated',
  raw_app_meta_data = '{"provider":"email","providers":["email"]}',
  is_super_admin = CASE WHEN email = 'super@bjjoss.com' THEN true ELSE false END,
  last_sign_in_at = NULL
WHERE email IN (
  'super@bjjoss.com', 
  'admin@brasilia.com', 
  'prof@brasilia.com', 
  'atendente@brasilia.com', 
  'aluno@brasilia.com'
);

-- 3. Log de confirmação
DO $$
BEGIN
    RAISE NOTICE 'Reparo de autenticação concluído.';
END $$;
