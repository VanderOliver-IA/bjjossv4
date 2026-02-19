-- ==========================================
-- MIGRATE_SAAS_V2_CORE.sql
-- Arquitetura de Sandbox, Suporte Governança e Super Admin
-- ==========================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. TABELA DE ACESSO DE SUPORTE (LGPD COMPLIANT)
CREATE TABLE IF NOT EXISTS public.support_access_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id),
    permissions TEXT[] NOT NULL, -- ['financeiro', 'alunos', 'cantina', 'crm']
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
    active BOOLEAN DEFAULT true
);

-- 3. ADICIONAR COLUNA DE SANDBOX NAS TABELAS PRINCIPAIS
-- Permite que usuários de demo criem dados sem afetar o banco real de forma permanente
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS demo_session_id UUID;
ALTER TABLE public.financial_transactions ADD COLUMN IF NOT EXISTS demo_session_id UUID;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS demo_session_id UUID;

-- 4. POLÍTICAS DE RLS (ROW LEVEL SECURITY) - EXEMPLO STUDENTS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Regra para Usuário Real: Só vê os alunos do seu CT
CREATE POLICY student_isolation_policy ON public.students
FOR ALL TO authenticated
USING (
    (ct_id IN (SELECT ct_id FROM public.profiles WHERE user_id = auth.uid())) 
    OR 
    -- Regra Super Admin com Suporte Ativo
    (EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.support_access_requests sar ON sar.ct_id = public.students.ct_id
        WHERE ur.user_id = auth.uid() 
        AND ur.role = 'super_admin'
        AND sar.expires_at > now()
        AND sar.active = true
        AND 'alunos' = ANY(sar.permissions)
    ))
);

-- Regra para Usuário Demo (Sandbox): Só vê o que ele mesmo criou na sessão
CREATE POLICY sandbox_student_policy ON public.students
FOR ALL TO anon, authenticated
USING (
    demo_session_id IS NOT NULL 
    AND demo_session_id = (current_setting('app.demo_session_id', true))::UUID
);

-- 5. FUNÇÃO DE LIMPEZA DO SANDBOX (GARBAGE COLLECTOR)
CREATE OR REPLACE FUNCTION public.cleanup_sandbox_data()
RETURNS void AS $$
BEGIN
    DELETE FROM public.students WHERE demo_session_id IS NOT NULL AND created_at < (now() - interval '24 hours');
    DELETE FROM public.financial_transactions WHERE demo_session_id IS NOT NULL AND created_at < (now() - interval '24 hours');
    DELETE FROM public.products WHERE demo_session_id IS NOT NULL AND created_at < (now() - interval '24 hours');
END;
$$ LANGUAGE plpgsql;

-- 6. PERMISSÃO DO SUPER ADMIN (O DONO)
-- Criamos uma role que permite ver a lista de CTs, mas não os dados internos sem o ticket de suporte
INSERT INTO public.user_roles (user_id, role) 
-- Nota: O user_id real será inserido após o cadastro do Mestre
VALUES ('00000000-0000-0000-0000-000000000000', 'super_admin')
ON CONFLICT DO NOTHING;

-- 7. FUNÇÃO RPC PARA LIMPEZA MANUAL DE SESSÃO DEMO
-- Chamada pelo frontend no Logout
CREATE OR REPLACE FUNCTION public.cleanup_demo_session(session_id UUID)
RETURNS void AS $$
BEGIN
    DELETE FROM public.students WHERE demo_session_id = session_id;
    DELETE FROM public.financial_transactions WHERE demo_session_id = session_id;
    DELETE FROM public.products WHERE demo_session_id = session_id;
    -- Adicionar outras tabelas conforme necessário
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cleanup_demo_session IS 'Limpa dados temporários vinculados a uma sessão de demonstração específica.';
