# Plano de Modernização Completa - BjjOss

Este documento rastreia a execução total das melhorias funcionais, visuais e de infraestrutura do sistema BjjOss SaaS.

## 🏁 Metas Atuais
1. **Visual Premium:** Estética Dark/Neon em todo o sistema.
2. **SuperAdmin Mastery:** Dashboard global e controle total de permissões de CTs.
3. **Novas Funcionalidades:** QR Code, CRM, IA de Retenção, Marketplace PIX.
4. **Segurança:** RLS (Row Level Security) robusta e Logs de Auditoria.

---

## 🏗️ Progresso da Implementação

### 1. Visual & UI (Premium Edition)
- [x] Definição de utilitários globais (`glass`, `neon`, `shadow-premium`) em `index.css`.
- [x] Upgrade do Dashboard Principal de CT para Estilo Premium (AdminCTDashboard).
- [x] Upgrade da tela de Gerenciamento de Permissões (ManagePermissions).
- [x] Upgrade do Dashboard de SuperAdmin (SuperAdminDashboard).
- [x] Implementação de micro-animações (Framer Motion) e transições fluidas.

### 2. SuperAdmin Mastery
- [x] Dashboard Global com métricas consolidadas.
- [x] Seletor de CT para gestão de permissões cross-unit.
- [x] Funcionalidade de Impersonate (View as Role) para todos os perfis.
- [x] Implementação de Logs Globais de Auditoria (Audit Logs) com visualização premium.
- [x] Configuração modular de CTs (Ativar/Desativar módulos por unidade).

### 3. Funcionalidades SaaS (Power Features)
- [x] **Módulo QR Code:** Gerador de código para check-in e validação no app do aluno.
- [x] **CRM Kanban:** Funil de vendas visual com movimentação de estágios.
- [ ] **Marketplace PIX:** Gateway de pagamento integrado (Próxima Fase).
- [ ] **IA de Retenção:** Dashboard de risco de churn baseado em presença (Planejado).
- [ ] **CRM Automatizado:** Funil de leads com integração básica de mensagens.
- [ ] **Financeiro PIX:** Integração com gateway para recebimento via QR Code PIX.
- [ ] **IA de Retenção:** Script básico para identificar alunos sem frequência há > 15 dias.

### 4. Backend & Segurança
- [ ] Auditoria: Criar tabela `audit_logs` e disparar inserts em ações críticas.
- [ ] RLS: Revisar todas as tabelas para garantir que `ct_id` seja respeitado.

---

## 🛠️ Notas de Execução
- Utilizar `shadcn/ui` para componentes base.
- Manter o tema dark como padrão absoluto.
- Focar em "UX Mágico": menos cliques, mais automação.
