# PLANO AUTH V2: Sistema de Cadastro Real & Trial 7 Dias

## 🎯 Objetivo
Implementar fluxo de cadastro real (SaaS) com período de teste gratuito, mantendo o ambiente de demonstração acessível separadamente.

## 🏗️ Requisitos Funcionais

### 1. Reestruturação de Rotas
*   `/login`: Nova tela de Login Oficial (Email/Senha).
*   `/cadastro`: Nova tela de Cadastro (Escolha: Dono de CT ou Professor).
*   `/logindemo`: Antiga tela de login com botões mágicos (para demonstração).
*   `/pagamento`: Tela de bloqueio/checkout após fim do trial.

### 2. Lógica de Trial (7 Dias)
*   **Banco de Dados:**
    *   Adicionar `trial_ends_at` (timestamp) na tabela `profiles` ou `cts`.
    *   Adicionar `subscription_status` ('trial', 'active', 'past_due').
*   **Frontend:**
    *   Banner fixo no topo: "Seu teste acaba em X dias".
    *   Middleware de proteção: Se `now() > trial_ends_at` e não pagou -> Redirecionar para `/pagamento`.

### 3. Cadastro Diferenciado
*   **Dono de CT:**
    *   Cria Usuário + Cria CT (Schema: `cts`).
    *   Gera Link de Convite (`bjjoss.com/convite/[ct_id]`).
*   **Professor (Freelancer):**
    *   Cria Usuário + Perfil 'professor'.
    *   Pode criar Turmas sem CT vinculado (V1.2? Ou cria um "CT Pessoal" oculto?).
    *   *Decisão:* Criar um CT "Personal" automaticamente para professores independentes.

### 4. Notificações (Webhook)
*   Disparar POST para endpoint OMD (`omd.vandersonoliveira.com.br`) a cada novo `auth.users` criado.
*   Implementar via Supabase Edge Function ou Trigger (se disponível).

## 📅 Roteiro de Implementação

### Passo 1: Banco de Dados (`database-architect`)
*   Criar migration para `trial_ends_at` e `plan_type` na tabela `cts` (ou `profiles`?).
*   *Decisão:* Trial é por CT (empresa) ou por Professor? Por Entidade Pagante.

### Passo 2: Backend & Notificação (`backend-specialist`)
*   Criar Edge Function `on-signup` que:
    1.  Define `trial_ends_at = now() + 7 days`.
    2.  Envia email para OMD.
    3.  Cria estrutura inicial (CT ou CT Personal).

### Passo 3: Frontend (`frontend-specialist`)
*   Renomear `Login.tsx` atual para `LoginDemo.tsx` e mover rota.
*   Criar novo `Login.tsx` (Formulário Real).
*   Criar `SignUp.tsx` (Seleção de Perfil + Form).
*   Criar `TrialBanner.tsx` (Contador regressivo).

### Passo 4: Bloqueio (`frontend-specialist`)
*   Atualizar `AuthContext` ou criar `SubscriptionGuard` para checar validade do trial.

## ❓ Questões em Aberto
1.  Qual gateway de pagamento usaremos na tela de bloqueio? (Por hora, apenas botão "Falar com Vendas" ou placeholder).
2.  Professor Freelancer paga? (Assumindo que sim, entra no mesmo fluxo de trial).

## ✅ Critério de Aceite
*   Usuário se cadastra sem cartão.
*   Trial de 7 dias inicia.
*   Dono recebe email de notificação.
*   Login Demo continua acessível em rota separada.
