-- ====================================================================
-- CORREÇÃO FINAL DE ACESSO AO PERFIL (RLS)
-- Garante que o dashboard pare de carregar infinitamente
-- ====================================================================

-- 1. Dar permissão de leitura para todos os usuários autenticados nas tabelas de base
-- Isso resolve o problema do dashboard não carregar os metadados iniciais
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT SELECT ON public.user_roles TO anon, authenticated;
GRANT SELECT ON public.cts TO anon, authenticated;

-- 2. RESETAR E SIMPLIFICAR POLICIES DE PERFIL
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "allow_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "allow_super_admin_profiles" ON public.profiles;

-- Política ultra-simples: Qualquer um logado vê seu próprio ID ou super_admin vê tudo
CREATE POLICY "perfil_acesso_total" ON public.profiles
FOR SELECT USING (
  auth.uid() = id 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- 3. RESETAR E SIMPLIFICAR POLICIES DE ROLES
DROP POLICY IF EXISTS "roles_select" ON public.user_roles;
DROP POLICY IF EXISTS "allow_own_role" ON public.user_roles;
DROP POLICY IF EXISTS "allow_super_admin_roles" ON public.user_roles;

CREATE POLICY "role_acesso_total" ON public.user_roles
FOR SELECT USING (
  user_id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
);

-- 4. LIMPAR CACHE DE PERMISSÕES
DISCARD PLANS;
