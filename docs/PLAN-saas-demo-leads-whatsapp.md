# PLAN: SaaS Demo → Lead → WhatsApp Verification Pipeline

> **Objetivo:** Transformar o modo Demo em uma máquina de captura de leads quentes, com verificação WhatsApp via N8N + Evolution API, e pipeline automático para o CRM do Super Admin.

---

## Decisões do Usuário (Socratic Gate)

| Pergunta | Resposta |
|----------|---------|
| WhatsApp Verification | N8N + Evolution API (já possui ambos) |
| Captura de Lead | Ao tentar fazer algo avançado (Demo = somente visualização) |
| Dados do Lead | Nome, Email, WhatsApp (obrigatórios) + tempo no demo, módulos acessados |
| Super Admin | Script SQL seguro (email: omd.vandersonoliveira@gmail.com) |

---

## Arquitetura do Fluxo

```
[Visitante]
    │
    ├── Clica "Acessar Demo" ──► [Demo Mode: READ-ONLY]
    │                                │
    │                                ├── Visualiza Dashboard, Alunos, Turmas, etc.
    │                                │
    │                                └── Tenta Cadastrar/Editar/Excluir
    │                                        │
    │                                        ▼
    │                              [MODAL: "Cadastre-se Grátis!"]
    │                                  Nome + Email + WhatsApp
    │                                        │
    │                                        ▼
    │                              [Lead salvo no CRM do Super Admin]
    │                              [Redireciona para /cadastro]
    │
    ├── Clica "Cadastrar-se" ──► [SignUp: Nome, Email, Senha, WhatsApp]
    │                                │
    │                                ▼
    │                          [Envia código via N8N → Evolution API → WhatsApp]
    │                                │
    │                                ▼
    │                          [Tela de Verificação: Digite o código]
    │                                │
    │                                ▼
    │                          [Conta ativa + Trial 7 dias inicia]
    │                          [Lead atualizado: status = "registered"]
    │
    └── Login Real ──► [Dashboard completo, sem restrições]
                       [Banner de Trial aparece: "Restam X dias"]
```

---

## Agentes Envolvidos

| # | Agente | Responsabilidade |
|---|--------|-----------------|
| 1 | `database-architect` | Tabelas: `saas_leads`, `verification_codes`, coluna `whatsapp` em `profiles` |
| 2 | `backend-specialist` | Webhook N8N, lógica de verificação, RPC de captura de lead |
| 3 | `frontend-specialist` | DemoGuard modal, SignUp com WhatsApp, tela de verificação, CRM Super Admin |
| 4 | `security-auditor` | Script Super Admin, rate limiting, hash do código, LGPD |

---

## Tarefas Detalhadas

### T1: Database (SQL Migrations)

```sql
-- 1. Tabela de Leads SaaS
CREATE TABLE public.saas_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  academy_name TEXT,
  city TEXT,
  source TEXT DEFAULT 'demo', -- 'demo', 'landing', 'referral'
  status TEXT DEFAULT 'new',  -- 'new', 'contacted', 'registered', 'converted', 'lost'
  demo_time_seconds INTEGER DEFAULT 0,
  demo_modules_accessed TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabela de Códigos de Verificação WhatsApp
CREATE TABLE public.verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,     -- SHA256 do código (nunca armazena plain text)
  attempts INTEGER DEFAULT 0,  -- Max 5 tentativas
  verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL, -- 10 min de validade
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Coluna WhatsApp em profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- 4. Coluna whatsapp_verified em profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT false;
```

### T2: Backend (Webhooks + Lógica)

- **Endpoint N8N (Edge Function ou RPC):**
  - `generate_verification_code(whatsapp, email)` → Gera código 6 dígitos, salva hash no banco, retorna código em plain text para o webhook N8N enviar via Evolution API.
  - **Webhook URL configurável:** O sistema chama um webhook N8N que dispara a mensagem no WhatsApp.

- **Verificação:**
  - `verify_whatsapp_code(email, code)` → Compara hash, marca como verificado, ativa conta.

- **Captura de Lead:**
  - `capture_demo_lead(name, email, whatsapp, modules_accessed)` → Insere no `saas_leads`.

### T3: Frontend (Componentes)

| Componente | Descrição |
|-----------|-----------|
| `DemoGuardModal` | Modal que aparece quando demo user tenta write operation. Captura nome/email/whatsapp como lead. |
| `useDemoGuard()` | Hook que intercepta ações de escrita e dispara o modal. |
| `WhatsAppVerification` | Tela pós-cadastro para digitar o código de 6 dígitos. |
| `SignUp.tsx` (update) | Adicionar campo WhatsApp obrigatório. |
| `SuperAdminLeads` | Página CRM para o Super Admin ver e gerenciar leads. |

### T4: Security

| Item | Implementação |
|------|--------------|
| Super Admin | Script SQL seguro com email específico |
| Código WhatsApp | SHA256 hash, 10min expiração, max 5 tentativas |
| Rate Limit | Max 3 códigos por WhatsApp por hora |
| LGPD | Consentimento no modal de lead + política de privacidade |

---

## Ordem de Execução

```
1. [Database]  → SQL Migration (tabelas + colunas)
2. [Security]  → Script Super Admin
3. [Backend]   → RPCs de verificação e captura de lead
4. [Frontend]  → DemoGuard + SignUp + Verificação + CRM Leads
```

---

## Critérios de Sucesso

- [ ] Demo user só consegue VER, nunca ESCREVER
- [ ] Ao tentar escrever, modal de lead aparece
- [ ] Lead capturado vai para CRM do Super Admin
- [ ] Cadastro exige WhatsApp com verificação por código
- [ ] Código enviado via webhook (pronto para N8N)
- [ ] Super Admin criado com credenciais seguras
- [ ] Trial de 7 dias inicia APÓS verificação WhatsApp
