-- Verificar se existe tabela 'users' no schema public (conflito com auth.users)
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name = 'users';

-- Verificar o search_path atual
SHOW search_path;

-- Verificar se a extensão pgcrypto está ativa
SELECT * FROM pg_extension WHERE extname = 'pgcrypto';

-- Ver o log de erros recentes do GoTrue (se disponível)
SELECT * FROM auth.audit_log_entries 
ORDER BY created_at DESC 
LIMIT 5;
