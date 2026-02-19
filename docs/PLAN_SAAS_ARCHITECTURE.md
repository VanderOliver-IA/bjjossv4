# PLANO SAAS V2: Arquitetura Híbrida (Real vs Sandbox) & Super Admin

## 1. O Conceito "Sandbox" (Demo Funcional)
O desafio técnico é: permitir que o usuário Demo *crie/edite/exclua* dados (alunos, financeiro) sem sujar o banco real e sem ver dados de outros demos.

**Solução Arquitetural: "Session-Based Isolation"**
*   **Não criaremos um banco separado.** Usaremos o mesmo banco com isolamento via **RLS (Row Level Security)**.
*   **Como funciona:**
    1.  Quando alguém entra no "Modo Demo", geramos um `demo_session_id` (UUID) temporário no navegador.
    2.  Todos os inserts (criar aluno, criar conta) levarão esse `demo_session_id`.
    3.  A política de segurança (RLS) do Supabase dirá:
        *   *Usuário Real:* Vê dados onde `ct_id` = seu CT.
        *   *Usuário Demo:* Vê dados onde `demo_session_id` = sua sessão atual.
    4.  **Limpeza:** Uma `pg_cron` (Cron Job do Banco) roda a cada hora deletando registros onde `demo_session_id` existe e foi criado há > 24h.

## 2. Fluxo de Login Inteligente (UX)
O Login precisa ser fluido e detectar a intenção do usuário.

**Fluxo Proposto:**
1.  **Input Único:** Usuário digita o Email.
2.  **Verificação (Backend):** O sistema checa silenciosamente se o email existe na `auth.users`.
3.  **Ramificação:**
    *   *Se existe:* Mostra campo de **Senha** -> Login Normal.
    *   *Se NÃO existe:* Mostra mensagem: *"Usuário não encontrado. Deseja criar uma conta grátis com este email?"* -> Redireciona para Cadastro já preenchendo o email.
4.  **Botão Demo:** Fica fixo abaixo, como "Acessar Simulador (Sem Cadastro)".

## 3. Super Admin & Privacidade (LGPD)
Você (Super Admin) é o dono do SaaS, não o dono dos CTs.

**Regras de Acesso (LGPD):**
*   **Tabela `cts` (Academias):** ✅ Acesso Total. (Ver quem paga, status, plano).
*   **Tabela `users` (Donos):** ✅ Acesso Parcial (Nome, Email, Contato).
*   **Tabela `students` (Alunos dos CTs):** ❌ **BLOQUEADO**. Você ver dados sensíveis (fotos, endereços) dos alunos dos seus clientes fere a LGPD.
    *   *Exceção:* Acesso a "Metadados Anônimos" via Views (ex: CT A tem 200 alunos), mas não acesso nominal (`SELECT * FROM students` retorna vazio para Super Admin).
*   **CRM BjjOss:** ✅ Tabela separada `saas_leads`. Acesso exclusivo seu.

## 4. Upload de Fotos (Híbrido)
Requisito: 3 Fotos Obrigatórias (Frente, Perfil Esq, Perfil Dir).

**Implementação Técnica:**
1.  **Storage:** Bucket `student-photos` no Supabase.
2.  **Interface de Captura:**
    *   Botão **"📁 Enviar Arquivo"**: Abre seletor de arquivos.
    *   Botão **"📸 Tirar Selfie"**: Abre componente `react-webcam` (precisa de permissão HTTPS).
3.  **Edição:** Permite crop/zoom antes de salvar.

## 5. Roteiro de Execução

### Fase A: Autenticação Inteligente (`frontend-specialist`)
*   Refazer `Login.tsx` para o fluxo de "Check Email First".
*   Garantir que o Trial de 7 dias só apareça para usuários reais.

### Fase B: Arquitetura Sandbox (`database-architect`)
*   Alterar TODAS as tabelas (`students`, `financial`, `classes`) para ter coluna `demo_session_id` (nullable).
*   Configurar RLS Policies para isolar sessões de demo.
*   Criar Trigger de deleção automática (Garbage Collector).

### Fase C: Super Admin Dashboard (`backend-specialist`)
*   Criar Dashboard específica para `role: super_admin`.
*   Mostrar KPIs globais (MRR, Total CTs, Churn).
*   Implementar bloqueio RLS para dados de alunos.

### Fase D: Módulo de Fotos (`frontend-specialist`)
*   Criar componente `PhotoCapture.tsx` (Webcam + Upload).
*   Integrar no fluxo de cadastro de aluno.

---

### ❓ Pergunta Chave
Para o "Super Admin", você prefere:
1.  **Ver apenas números** (Ex: "CT Gracie Barra - 150 Alunos")?
2.  **Ter um botão "Impersonate"** (Logar como o Dono do CT) para dar suporte técnico? (Isso permite ver os dados, mas deixa rastro de auditoria para segurança).
