# PLANO MESTRE: Refinamento SaaS e Blindagem Super Admin

Este plano detalha as correções de UX, privacidade e expansão do CRM para tornar o BjjOss um produto comercial pronto para escala.

## 🎯 Objetivos
1.  **Blindagem de Dados**: Restringir visão do Super Admin a métricas globais (Privacidade por padrão).
2.  **Conversão Inteligente**: Transformar Leads em Academias (CTs) com um clique no CRM.
3.  **Checkout & Monetização**: Criar página de planos com CTA via WhatsApp.
4.  **UX & Feedback**: Corrigir edição de perfil e adicionar Toasts de feedback em todo o sistema.
5.  **Expansão CRM**: Adição manual de leads e captura automática de todos os novos cadastros.

---

## 🏗️ Arquitetura e Mudanças

### 1. Privacidade Super Admin (Backend/RLS)
- **Mudança**: Alterar as RLS das tabelas críticas (`students`, `transactions`, `events`, etc).
- **Lógica**: Se `auth.uid()` for Super Admin, acesso negado a menos que uma flag de "Sessão de Suporte" esteja ativa no perfil ou contexto.
- **Impacto**: O dashboard do Super Admin mostrará apenas agregados (RPCs), nunca listas de dados privados de terceiros.

### 2. Fluxo CRM Pro
- **Conversão**: Nova RPC `activate_lead_account`.
    - Cria entrada em `cts`.
    - Vincula o usuário ao novo `ct_id`.
    - Ativa o período de trial.
- **Captura Global**: trigger no banco para inserir em `saas_leads` sempre que um novo usuário for criado no Auth.

### 3. Frontend & UX
- **Página de Upgrade**: `/assinar` com cards de planos e botão flutuante WhatsApp (21 99975-7549).
- **Perfil**: Debug e correção do formulário de edição em `Perfil.tsx`.
- **CRM**: Modais de Adicionar/Editar Lead.

---

## 📅 Cronograma de Execução (Fase 2)

### 🟢 Etapa A: Fundação (Security & Database)
- [ ] Aplicar novas RLS de privacidade para Super Admin.
- [ ] Criar RPC `activate_lead_account`.
- [ ] Criar Trigger para captura automática de leads em novos cadastros.

### 🔵 Etapa B: Core (Frontend CRM & Planos)
- [ ] Criar página de Assinatura (`PremiumAccount.tsx`).
- [ ] Implementar Adição/Edição manual de leads no CRM.
- [ ] Integrar botão de "Ativar Conta" no CRM.

### 🟡 Etapa C: Polish (UX & Bugfix)
- [ ] Corrigir salvamento do Perfil.
- [ ] Auditar e adicionar Toasts (`toast.success/error`) em todas as ações de CRUD.
- [ ] Ocultar banners de trial do Super Admin.

---

## ✅ Critérios de Sucesso
- Super Admin vê erro ou lista vazia ao tentar acessar `/alunos` diretamente (sem suporte).
- Um lead se torna "Academia Administrada" com um clique no CRM.
- Perfil salva dados e exibe mensagem "Dados salvos com sucesso".
- Nova página de planos funcional e estética.
