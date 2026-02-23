# 📋 BjjOss – Estado Atual & Próximos Passos

## Onde Paramamos

1. **UI/UX** – Design *Belt‑Driven* concluído nas principais telas (Dashboard, Leads, Alunos, Navegação).  
2. **Auth** – Supabase Auth em produção, claims (`role`, `view_as_ct`) configurados e RLS blindado.  
3. **Multi‑tenant** – Tabela `cts` (organizations) e seed de 20 CTs gerados; `role_permissions` permite controle granular por perfil.  
4. **Feature Flags** – Implementadas (reconhecimento facial, WhatsApp, Pix) e armazenadas em `feature_flags`.  
5. **Infra** – Build Vite + React passa lint, testes e build sem erros; commit e push já realizados.  
6. **Documentação** – Relatório técnico (`BJJOSS_SAAS_REPORT_2026.md`) e respostas consolidadas (`BJJOSS_SAAS_RESPONSES_2026.md`).

## Próximos Passos (MVP & Pós‑MVP)

| Área | Tarefa | Responsável | Prioridade |
|------|--------|-------------|------------|
| **Frontend** | Finalizar *Error Boundary* global e fallback 404. | frontend‑specialist | Alta |
| **Backend** | Implementar webhook de *n8n* para logs de presença e integração WhatsApp. | backend‑specialist | Alta |
| **Security** | Rodar `security_scan.py` e validar RLS contra possíveis bypass. | security‑auditor | Alta |
| **Testing** | Cobertura de testes unitários (jest) e E2E (Playwright) para fluxo de presença. | test‑engineer | Média |
| **DevOps** | Configurar CI/CD (GitHub Actions) → Vercel deploy automático após merge. | devops‑engineer | Média |
| **Feature** | Integrar API de reconhecimento facial (N8N → Supabase). | backend‑specialist | Média |
| **Financeiro** | Definir gateway de pagamento (Pix + Stripe) e fluxo de cobrança recorrente. | backend‑specialist | Média |
| **Docs** | Atualizar README com instruções de setup local e deploy. | documentation‑writer | Baixa |

## Checklist de Pré‑Lançamento
- [ ] **Security Scan** (`python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`) – Pass
- [ ] **Lint** (`npm run lint`) – Pass
- [ ] **Build** (`npm run build`) – Pass
- [ ] **Test Suite** (`npm test`) – Pass
- [ ] **CI/CD** configurado e rodando
- [ ] **Feature Flags** revisadas e ativadas para produção
- [ ] **Documentação** completa

---

**Próxima fase:** Após aprovação deste plano, iniciaremos a implementação paralela das tarefas listadas, envolvendo os agentes *frontend‑specialist*, *backend‑specialist*, *security‑auditor*, *test‑engineer* e *devops‑engineer*.
