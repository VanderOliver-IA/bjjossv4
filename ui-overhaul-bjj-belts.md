# 🥋 Plano de Redesign: BjjOss Belt-Driven System
**Task Slug:** `ui-overhaul-bjj-belts`
**Status:** 📝 Em Planejamento

---

## 1. Visão Geral
Transformação radical do design do BjjOss, abandonando o azul genérico e adotando a **Hierarquia das Faixas** como linguagem visual. O sistema será minimalista, focado em alta performance e tipografia limpa, removendo elementos exagerados.

### Critérios de Sucesso
- [ ] Sistema de cores 100% derivado das faixas (Branca até Preta).
- [ ] Alternador Dark/Light mode funcional e acessível em todos os dashboards.
- [ ] Remoção de botões e textos "exagerados" por uma estética clean e profissional.
- [ ] Manutenção da responsividade e performance (Lighthouse > 90).

---

## 2. Sistema de Cores (The Belt tokens)

### Base (Temas)
| Elemento | Dark Mode (Preta) | Light Mode (Branca) |
| :--- | :--- | :--- |
| Background | `#0A0A0A` (Deep Black) | `#F8F9FA` (Off White) |
| Surface/Cards | `#141414` (Matte Black) | `#FFFFFF` (Pure White) |
| Border | `#1F1F1F` | `#E2E8F0` |

### Paleta Primária (Ações Principais)
1. **Azul (Técnica/Principal)**: `#2563EB` (Primária 1)
2. **Roxa (Evolução)**: `#7C3AED` (Primária 2)
3. **Marrom (Refinamento)**: `#78350F` (Primária 3)

### Paleta Secundária (Alertas/Kids)
- **Cinza**: `#64748B` (Utilidade)
- **Amarelo**: `#F59E0B` (Alertas)
- **Laranja**: `#EA580C` (Atenção)
- **Verde**: `#10B981` (Sucesso/Confirmado)

---

## 3. Estrutura de Arquivos Afetada
- `src/index.css`: Definição de tokens HSL e transições de tema.
- `src/components/ThemeToggle.tsx`: Novo componente global.
- `src/components/dashboards/*`: Atualização de todos os cards e layouts.
- `tailwind.config.js`: Injeção da nova paleta de cores.

---

## 4. Cronograma de Execução (Tasks)

### Fase 1: Fundação (The Belt Tokens)
- [ ] **Task 1.1**: Configurar `index.css` com as novas variáveis CSS/HSL baseadas nas faixas.
    - **Agent**: `frontend-specialist`
    - **Verify**: Inspeção no devTools para garantir que as variáveis mudam no nó `:root` e `.dark`.
- [ ] **Task 1.2**: Criar e injetar o componente `ThemeToggle` no cabeçalho/sidebar global.
    - **Agent**: `frontend-specialist`

### Fase 2: Redesign Estético (Clean & Sharp)
- [ ] **Task 2.1**: Refatorar `SuperAdminDashboard.tsx` para remover exageros e aplicar a nova hierarquia de cores.
    - **Agent**: `frontend-specialist`
- [ ] **Task 2.2**: Padronizar botões e tipografia usando o sistema "Sharp" (raio de borda mínimo de 4px a 8px).
    - **Agent**: `frontend-specialist`

### Fase 3: Propagação (Multi-Perfil)
- [ ] **Task 3.1**: Aplicar o novo visual nas páginas de Leads, Alunos e Financeiro.
    - **Agent**: `frontend-specialist`

---

## 5. Phase X: Verificação Final
- [ ] **Security**: `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
- [ ] **UX Audit**: `python .agent/skills/frontend-design/scripts/ux_audit.py .`
- [ ] **Build**: `npm run build`
- [ ] **Checklist Visual**:
    - [ ] Sem cores fora da lista de faixas?
    - [ ] Dark mode é baseado no Preto?
    - [ ] Light mode é baseado no Branco?
    - [ ] Botoes e textos estão em tamanho profissional (não exagerado)?
