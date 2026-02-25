# 🥋 Plano de Evolução: Ecossistema WhatsApp (BjjOss)

Este plano foca na validação de Leads, segurança de acesso e comunicação interna via WhatsApp, utilizando a infraestrutura VPS (n8n + Evolution API).

## 🏗️ Fase 1: Validação de Leads & Ativação (Prioridade Máxima)
- **Objetivo**: Garantir que todo Lead que queira testar o sistema forneça um WhatsApp real e funcional.
- **Ações**:
  - [x] **Fluxo de Signup**: Etapa de validação de OTP adicionada ao `SignUp.tsx`.
  - [x] **Integração Supabase**: RPCs `generate_whatsapp_code` e `verify_whatsapp_code` criados.
  - [x] **UI OTP**: Componente `WhatsAppVerification.tsx` refinado e integrado.

## 🤖 Fase 2: Acesso Seguro & Recuperação via WhatsApp
- **Objetivo**: Fornecer uma alternativa moderna ao e-mail para login e recuperação de conta.
- **Ações**:
  - [x] **Login via WhatsApp**: Opção "WhatsApp OTP" integrada à tela de `Login.tsx`.
  - [ ] **Recuperação de Senha**: Fluxo de "Esqueci minha senha" que envia link ou código via WhatsApp.

## 🚀 Fase 3: Comunicação Interna (BjjOss Connect)
- **Objetivo**: Facilitar a troca de mensagens entre papéis (Admin, Professor, Aluno).
- **Ações**:
  - [x] **Botão de WhatsApp Direto**: Criado `SendWhatsAppDialog.tsx` e integrado em `Alunos.tsx`.
  - [ ] **Mensagens Automatizadas**: 
    - Professor -> Alunos: Notificação de troca de faixa ou ausência.
    - Admin -> Professor: Avisos administrativos.
  - [ ] **Tabela de Logs**: Registrar todo envio para auditoria do Super Admin.

---
**Status atual**: Fluxos de Login e Cadastro de Lead com validação via WhatsApp implementados. Botão de envio rápido adicionado à gestão de alunos. Ponto de atenção: Aplicar migração SQL no Supabase.
