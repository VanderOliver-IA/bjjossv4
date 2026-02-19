# Plano de Refinamento: Verificação de WhatsApp e Ativação Manual

Este plano visa ajustar o fluxo de verificação de WhatsApp para que seja exigido apenas em cadastros orgânicos e permitir que o Super Admin ative contas sem essa barreira.

## 1. Banco de Dados (Supabase)
### 1.1. Alteração na Função `activate_lead_account`
- Modificar a RPC `activate_lead_account` para que, ao converter um lead em CT, o campo `whatsapp_verified` na tabela `profiles` seja definido como `true` automaticamente.
- Garantir que o `raw_user_meta_data` do Auth também reflita `whatsapp_verified: true`.

### 1.2. Atualização de Perfis Existentes
- Script para marcar o Super Admin e usuários já ativos como verificados para evitar que caiam no loop de verificação.

## 2. Frontend (React)
### 2.1. Lógica de Redirecionamento (`MainLayout.tsx`)
- Garantir que a verificação de `whatsappVerified` respeite o papel do usuário. Super Admins nunca devem ser redirecionados para verificação.

### 2.2. Contexto de Autenticação (`AuthContext.tsx`)
- Assegurar que o estado `whatsappVerified` seja lido corretamente do perfil e que atualizações via metadados do Auth sejam refletidas no estado global.

### 2.3. Painel de CRM (`SuperAdminLeads.tsx`)
- Confirmar que a chamada para `activate_lead_account` passa todos os parâmetros necessários para que o usuário criado já esteja operacional (bypass de verificação).

## 3. Verificação e Segurança
### 3.1. Segurança
- Validar se o bypass de verificação está restrito apenas a ações disparadas por `super_admin`.
- Usar `SECURITY DEFINER` nas funções para permitir alterações em tabelas protegidas, mas com validação de `auth.role()`.

## Tarefas de Implementação
- [ ] Criar SQL de migração para atualizar RPC e perfis atuais.
- [ ] Modificar `MainLayout.tsx` para bypass de Super Admin.
- [ ] Testar fluxo de ativação manual no CRM.
