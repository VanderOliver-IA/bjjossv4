# Esquema de Dados e Lógica de Banco (SaaS Lead Pipeline)

## Tabelas
### `saas_leads`
Armazena todos os contatos capturados no modo demo.
- `id`: UUID (Primary Key)
- `name`, `email`, `whatsapp`: Dados de contato.
- `academy_name`: Nome da academia opcional.
- `demo_modules_accessed`: Array de strings (ex: `['alunos', 'financeiro']`).
- `status`: Enum (`new`, `contacted`, `registered`, `converted`, `lost`).

### `verification_codes`
Armazena os tokens OTP temporários.
- `email`: Chave de vínculo.
- `code_hash`: Hash SHA256 do código de 6 dígitos.
- `expires_at`: Timestamp de validade (padrão 10 min).
- `attempts`: Contador de tentativas (max 5).

### `saas_config`
Configurações editáveis pelo Super Admin via UI.
- `n8n_whatsapp_webhook_url`: Alvo para envio de mensagens via Evolution API.
- `verification_code_ttl_minutes`: Tempo de vida do código.
- `verification_rate_limit_per_hour`: Proteção anti-spam.

## Funções RPC (PostgreSQL/Supabase)
1. `capture_demo_lead`: Insere ou atualiza um lead vindo do `DemoGuardModal`.
2. `generate_whatsapp_code`: Cria o OTP, envia para o N8N e retorna o código plano apenas para o log de transporte.
3. `verify_whatsapp_code`: Compara o código inserido pelo usuário com o hash no banco. Se correto, atualiza `profiles.whatsapp_verified = true`.
4. `cleanup_expired_codes`: Cron job simulado para limpar códigos antigos.
