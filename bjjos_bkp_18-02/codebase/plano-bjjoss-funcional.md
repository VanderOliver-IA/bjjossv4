# Plano de Modernização BjjOss (100% Funcional)

## 🎯 Visão Geral
Transformar o BjjOss em uma plataforma SaaS de alta performance, focada em automação e experiência do usuário (UX), utilizando o poder total da integração React + Supabase.

**Tipo de Projeto:** WEB (SaaS Multi-tenant)

## 🚀 10 Novas Funções e Organização
1. **Chamada via QR Code/NFC:** Redução de filas na recepção.
2. **Retenção Predictiva (IA):** Detectar alunos com risco de cancelamento.
3. **Loja Integrada com PIX:** Venda de produtos (Cantina/Loja) direto pelo app.
4. **Resumo de Treino (IA):** Gerar insights baseados na técnica ensinada.
5. **Contrato Digital:** Assinatura de termos integrada à matrícula.
6. **Gamificação (Ranking):** Aumentar o engajamento através de medalhas virtuais.
7. **CRM Automatizado:** Seguimento de leads via WhatsApp/E-mail automático.
8. **Dashboard Multi-Unidade:** Visão global para gestores de franquias.
9. **Log de Auditoria:** Rastreabilidade total de alterações sensíveis.
10. **Notificações Push (PWA):** Avisos de aulas, eventos e faturas no celular.

## 🛠️ Tech Stack Atualizada
- **Frontend:** React 18 + Vite + TypeScript.
- **UI:** shadcn/ui + Lucide Icons + Framer Motion (para micro-animações premium).
- **Backend:** Supabase (Auth, DB, Storage, Edge Functions).
- **Cache:** TanStack Query v5.

## 📋 Lista de Tarefas (Task Breakdown)

### Fase 1: Fundação e Segurança
- [ ] **Tarefa 1.1:** Criar Edge Function para processamento de Webhooks de pagamento.
  - *Agente:* `backend-specialist` | *Skill:* `api-patterns`
- [ ] **Tarefa 1.2:** Implementar Log de Auditoria na tabela `audit_logs`.
  - *Agente:* `database-architect` | *Skill:* `database-design`

### Fase 2: Módulo CRM e Vendas
- [ ] **Tarefa 2.1:** Modernizar a tela de Cantina com carrinho de compras persistente.
  - *Agente:* `frontend-specialist` | *Skill:* `frontend-design`
- [ ] **Tarefa 2.2:** Adicionar automação de status de Lead vis Edge Functions.
  - *Agente:* `backend-specialist` | *Skill:* `brainstorming`

### Fase 3: UX e Gamificação
- [ ] **Tarefa 3.1:** Criar Dashboard de Ranking de Alunos por CT.
  - *Agente:* `frontend-specialist` | *Skill:* `ui-ux-pro-max`

## ✅ Fase X: Verificação Final
- [ ] Lint e Type Check passados.
- [ ] Security Scan executado (`security_scan.py`).
- [ ] UX Audit validado (`ux_audit.py`).
- [ ] Build de produção sem erros.

---
*Criado por Antigravity AI - Explorer & Project Planner Agents.*
