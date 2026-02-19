# PLANO DE AUDITORIA ESTRUTURAL (BjjOss V1 -> V1.1)

## 🎯 Objetivo
Realizar um "Pente Fino" em todo o sistema para identificar botões quebrados, links mortos, funcionalidades incompletas e remover vestígios de templates anteriores ("Lovable").

## 🕵️‍♂️ Escopo da Auditoria
1.  **Higienização de Código (Prioridade 0):**
    *   Buscar e remover termo "Lovable" em todo o projeto.
    *   Verificar `index.html`, `manifest.json`, metadados e componentes de UI.

2.  **Auditoria de Navegação (Links e Botões):**
    *   **Menu Lateral:** Testar todos os itens (Dashboard, Alunos, Financeiro, etc).
    *   **Ações Críticas:** Botões de "Novo Aluno", "Nova Turma", "Editar", "Excluir".
    *   **Landing Pages:** Testar botões de CTA e Login Demo.

3.  **Auditoria Funcional (CRUD):**
    *   Verificar se formulários estão salvando.
    *   Verificar feedbacks de erro/sucesso (Toasts).

## 📅 Roteiro de Execução

### Passo 1: Caça aos Fantasmas (`explorer-agent`)
*   Comando: `grep -r "Lovable" .` e `grep -r "lovable" .`
*   Ação: Substituir por "BjjOss" ou remover.

### Passo 2: Teste de Fumaça Automatizado (`test-engineer`)
*   Usar Script de Navegação para visitar todas as rotas listadas em `App.tsx`.
*   Registrar quais retornam 404 ou Tela Branca (Crash).

### Passo 3: Relatório de Bugs (`debugger`)
*   Listar cada botão não funcional encontrado.
*   Classificar por severidade (Crítico: Impede uso / Médio: UX ruim / Baixo: Visual).

### Passo 4: Plano de Correção V1.1
*   Gerar lista de tarefas para correção imediata.

## ✅ Critério de Sucesso
*   Zero menções a "Lovable".
*   Mapeamento de 100% dos botões quebrados.
*   Plano V1.1 aprovado.
