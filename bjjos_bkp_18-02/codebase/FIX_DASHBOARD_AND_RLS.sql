-- ==========================================
-- FIX_DASHBOARD_AND_RLS.sql
-- Correção de Colunas, Perfis e RLS Faltantes
-- ==========================================

-- 1. CORREÇÃO DA TABELA CTS (Schema Drift)
-- O frontend espera 'modules', mas o banco tinha 'features'
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cts' AND column_name='features') THEN
    ALTER TABLE public.cts RENAME COLUMN features TO modules;
  END IF;
  
  -- Se por acaso a coluna não existir, cria como modules
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cts' AND column_name='modules') THEN
    ALTER TABLE public.cts ADD COLUMN modules jsonb DEFAULT '{}';
  END IF;
END $$;

-- 2. VINCULAR ADMIN AO CT (Correção do Cantina/Dashboard Vazio)
-- Admin: admin@brasilia.com -> CT: Brasília BJJ Central
UPDATE public.profiles 
SET ct_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
WHERE email = 'admin@brasilia.com';

-- Vincular Professor e Atendente também
UPDATE public.profiles 
SET ct_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
WHERE email IN ('prof@brasilia.com', 'atendente@brasilia.com', 'aluno@brasilia.com');

-- 3. RLS PARA FINANCEIRO (Financial Transactions)
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Financeiro - Super Admin Total" ON public.financial_transactions
FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Financeiro - Admin CT Vê Seu CT" ON public.financial_transactions
FOR ALL TO authenticated 
USING (ct_id IN (SELECT ct_id FROM public.profiles WHERE id = auth.uid()));

-- 4. RLS PARA CANTINA (Products)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Produtos - Super Admin Total" ON public.products
FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Produtos - Leitura Geral" ON public.products
FOR SELECT TO authenticated USING (true); -- Produtos podem ser vistos por todos para venda

CREATE POLICY "Produtos - Gestão Admin" ON public.products
FOR ALL TO authenticated 
USING (ct_id IN (SELECT ct_id FROM public.profiles WHERE id = auth.uid()) 
       AND (public.get_my_role() IN ('admin_ct', 'super_admin')));

-- 5. RLS PARA ESTOQUE E PEDIDOS (Inventory/Orders)
-- Garantir que não quebrem se existirem
DO $$ 
BEGIN 
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'inventory') THEN
    ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Inventory Full" ON public.inventory;
    CREATE POLICY "Inventory Full" ON public.inventory FOR ALL TO authenticated USING (true);
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'orders') THEN
    ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Orders Full" ON public.orders;
    CREATE POLICY "Orders Full" ON public.orders FOR ALL TO authenticated USING (true);
  END IF;
END $$;

SELECT 'Correções aplicadas: Coluna modules renomeada, Perfis vinculados e RLS de Financeiro/Cantina ativados.' as resultado;
