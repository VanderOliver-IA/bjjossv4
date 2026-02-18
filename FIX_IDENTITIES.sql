-- ====================================================================
-- FIX DEFINITIVO: Criar auth.identities para os usuários Demo
-- O login falha porque auth.identities está vazio para esses usuários
-- Cole e execute no SQL Editor do Supabase
-- ====================================================================

-- 1. Criar identities para cada usuário (necessário para login email/senha)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES
  (
    gen_random_uuid(),
    'd0eebc99-1111-4ef8-bb6d-6bb9bd380f00',
    'super@bjjoss.com',
    '{"sub": "d0eebc99-1111-4ef8-bb6d-6bb9bd380f00", "email": "super@bjjoss.com", "email_verified": true, "phone_verified": false}',
    'email',
    now(),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'd0eebc99-2222-4ef8-bb6d-6bb9bd380a11',
    'admin@brasilia.com',
    '{"sub": "d0eebc99-2222-4ef8-bb6d-6bb9bd380a11", "email": "admin@brasilia.com", "email_verified": true, "phone_verified": false}',
    'email',
    now(),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'd0eebc99-3333-4ef8-bb6d-6bb9bd380e11',
    'prof@brasilia.com',
    '{"sub": "d0eebc99-3333-4ef8-bb6d-6bb9bd380e11", "email": "prof@brasilia.com", "email_verified": true, "phone_verified": false}',
    'email',
    now(),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'd0eebc99-4444-4ef8-bb6d-6bb9bd380d11',
    'atendente@brasilia.com',
    '{"sub": "d0eebc99-4444-4ef8-bb6d-6bb9bd380d11", "email": "atendente@brasilia.com", "email_verified": true, "phone_verified": false}',
    'email',
    now(),
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'd0eebc99-5555-4ef8-bb6d-6bb9bd380c11',
    'aluno@brasilia.com',
    '{"sub": "d0eebc99-5555-4ef8-bb6d-6bb9bd380c11", "email": "aluno@brasilia.com", "email_verified": true, "phone_verified": false}',
    'email',
    now(),
    now(),
    now()
  )
ON CONFLICT (provider, provider_id) DO NOTHING;

-- 2. Verificar resultado
SELECT ui.user_id, u.email, ui.provider, ui.provider_id
FROM auth.identities ui
JOIN auth.users u ON u.id = ui.user_id
WHERE u.email IN ('super@bjjoss.com', 'admin@brasilia.com', 'prof@brasilia.com', 'atendente@brasilia.com', 'aluno@brasilia.com');
