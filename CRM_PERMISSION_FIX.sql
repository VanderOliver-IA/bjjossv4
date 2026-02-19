-- 1. Garantir que o Super Admin tenha a role correta no banco (Sem ON CONFLICT para evitar erro de constraint)
DO $$ 
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'omd.vandersonoliveira@gmail.com';
    
    IF v_user_id IS NOT NULL THEN
        -- Remove se já existir com outra role ou se quiser garantir apenas super_admin
        DELETE FROM public.user_roles WHERE user_id = v_user_id;
        INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'super_admin');
    END IF;
END $$;

-- 2. Corrigir RLS da tabela saas_leads para ser EXPLÍCITA
-- Removemos a anterior para evitar conflitos
DROP POLICY IF EXISTS "super_admin_full_access_leads" ON public.saas_leads;
DROP POLICY IF EXISTS "anyone_can_insert_lead" ON public.saas_leads;

-- Política para Super Admin (Full Control)
-- Usamos a função auth.uid() combinada com a role no JWT para maior performance e bypass de RLS circular
CREATE POLICY "super_admin_manage_all_leads" ON public.saas_leads
FOR ALL
TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' = 'super_admin')
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role' = 'super_admin')
);

-- Política para captura pública (Anon/Authenticated)
CREATE POLICY "public_capture_leads" ON public.saas_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 3. Corrigir RLS da tabela support_access_requests
DROP POLICY IF EXISTS "ct_admin_insert_support" ON public.support_access_requests;
DROP POLICY IF EXISTS "super_admin_read_support" ON public.support_access_requests;

CREATE POLICY "everyone_authenticated_can_insert_support" ON public.support_access_requests
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "super_admin_and_owner_read_support" ON public.support_access_requests
FOR SELECT TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' = 'super_admin') OR
  (granted_by = auth.uid())
);

-- 4. Criar política para ler saas_config (necessário no CRM/Config)
DROP POLICY IF EXISTS "super_admin_manage_config" ON public.saas_config;
DROP POLICY IF EXISTS "anyone_can_read_config" ON public.saas_config;

CREATE POLICY "super_admin_full_config" ON public.saas_config
FOR ALL TO authenticated
USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'super_admin');

CREATE POLICY "public_read_config" ON public.saas_config
FOR SELECT TO anon, authenticated
USING (true);
