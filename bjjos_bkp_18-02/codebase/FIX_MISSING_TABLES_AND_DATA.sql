-- ==========================================
-- FIX_MISSING_TABLES_AND_DATA.sql
-- Recria tabelas críticas (Produtos, Flags) e aplica correções
-- ==========================================

-- 1. CRIAR TABELA DE PRODUTOS (CANTINA)
CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ct_id uuid REFERENCES public.cts(id) ON DELETE CASCADE,
    name text NOT NULL,
    price decimal(10,2) NOT NULL DEFAULT 0,
    stock integer NOT NULL DEFAULT 0,
    category text NOT NULL CHECK (category IN ('cantina', 'loja')),
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Seed de Produtos (Exemplo para Brasília BJJ)
INSERT INTO public.products (ct_id, name, price, stock, category)
SELECT 
    id, 'Açaí 500ml', 25.00, 50, 'cantina'
FROM public.cts WHERE slug = 'brasilia-bjj'
ON CONFLICT DO NOTHING;

INSERT INTO public.products (ct_id, name, price, stock, category)
SELECT 
    id, 'Kimono Oficial', 450.00, 10, 'loja'
FROM public.cts WHERE slug = 'brasilia-bjj'
ON CONFLICT DO NOTHING;

-- 2. CRIAR TABELA FEATURE FLAGS (DASHBOARD)
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    enabled boolean DEFAULT true,
    description text
);

-- Seed de Flags
INSERT INTO public.feature_flags (name, enabled, description) VALUES
('saas_metrics', true, 'Métricas globais no dashboard'),
('multi_tenant_access', true, 'Acesso multi-CT via seletor')
ON CONFLICT (name) DO UPDATE SET enabled = EXCLUDED.enabled;

-- 3. CORREÇÃO DA COLUNA MODULES (SCHEMA DRIFT)
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cts' AND column_name='features') THEN
    ALTER TABLE public.cts RENAME COLUMN features TO modules;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cts' AND column_name='modules') THEN
    ALTER TABLE public.cts ADD COLUMN modules jsonb DEFAULT '{}';
  END IF;
END $$;

-- 4. VINCULAR PERFIS AO CT PRINCIPAL
UPDATE public.profiles 
SET ct_id = (SELECT id FROM public.cts WHERE slug = 'brasilia-bjj' LIMIT 1)
WHERE email IN ('admin@brasilia.com', 'prof@brasilia.com', 'atendente@brasilia.com', 'aluno@brasilia.com')
AND ct_id IS NULL;

-- 5. POLÍTICAS RLS (REAPLICAÇÃO SEGURA)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Produtos - Super Admin" ON public.products;
DROP POLICY IF EXISTS "Produtos - Leitura" ON public.products;

CREATE POLICY "Produtos - Super Admin" ON public.products FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Produtos - Leitura" ON public.products FOR SELECT TO authenticated USING (true);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Flags - Leitura Geral" ON public.feature_flags;
CREATE POLICY "Flags - Leitura Geral" ON public.feature_flags FOR SELECT TO authenticated USING (true);

SELECT 'Tabelas products/feature_flags criadas, dados inseridos e RLS corrigido.' as status;
