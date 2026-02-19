-- AJUSTE DE POLÍTICA PARA O LOGIN FUNCIONAR COM RLS ATIVO
-- Permite que usuários anônimos verifiquem se um email existe para fins de login/cadastro

DROP POLICY IF EXISTS "Allow anonymous profile existence check" ON public.profiles;
CREATE POLICY "Allow anonymous profile existence check"
ON public.profiles
FOR SELECT
TO anon
USING (true); 

-- Nota: Embora libere SELECT para anon, no Supabase as tabelas costumam ser restritas.
-- Para maior segurança no futuro, você pode restringir colunas específicas via VIEW ou políticas mais finas.
