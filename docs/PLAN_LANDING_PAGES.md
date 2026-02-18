# PLANO DE LANDING PAGES E DEMO MODE (BjjOss V1)

## 🎯 Objetivo
Criar um ecossistema de vendas com **3 Landing Pages Distintas** (Testes A/B/C) focadas em conversão, integradas a um **Modo Demo Seguro** que permite ao lead testar o sistema como Dono de CT ou Professor.

## 🏗️ Estrutura das Páginas

### 1. Rota `/vendas/dojo-digital` (Opção A - High Tech)
*   **Vibe:** Cyberpunk, Neon, IA.
*   **Foco:** Reconhecimento Facial, Automação, Futuro.
*   **Headline:** "A Primeira Inteligência Artificial Faixa Preta."
*   **Ideal para:** Jovens professores, academias modernas.

### 2. Rota `/vendas/gestao-pro` (Opção B - Corporativo)
*   **Vibe:** Clean, Branco/Dourado, Minimalista.
*   **Foco:** Financeiro, ROI, Controle de Inadimplência.
*   **Headline:** "Assuma o Controle do Lucro do Seu Tatame."
*   **Ideal para:** Donos de grandes redes, investidores.

### 3. Rota `/vendas/comunidade` (Opção C - Social)
*   **Vibe:** Vibrante, Fotos de Galera, Redes Sociais.
*   **Foco:** Retenção de Alunos, Família, Tribo.
*   **Headline:** "Mais que um Sistema, Uma Família."
*   **Ideal para:** Projetos sociais, academias de bairro.

## 🔑 Funcionalidade "Conheça por Dentro" (Demo Mode)

Para permitir o test-drive sem risco, criaremos uma rota `/demo-login` que:
1.  Oferece dois botões: **"Entrar como Dono"** e **"Entrar como Professor"**.
2.  Realiza login automático em contas pré-criadas:
    *   `demo.dono@bjjoss.com` (Role: `admin_ct`)
    *   `demo.prof@bjjoss.com` (Role: `professor`)
3.  **Segurança Crítica:**
    *   Bloquear acesso ao `Super Admin`.
    *   Ocultar dados sensíveis (se houver).
    *   (Idealmente) Essas contas devem ser "Read Only" ou resetadas diariamente (reset manual via script por enquanto).

## 📅 Roadmap de Implementação

1.  **Dados de Demo (`database-architect`):**
    *   Criar CT "Demo Gym" com dados populados (Alunos, Turmas, Financeiro Fictício).
    *   Criar usuários `demo.dono` e `demo.prof`.

2.  **Componentes de Venda (`frontend-specialist`):**
    *   `PricingTable.tsx`: Tabela comparativa dos 3 planos.
    *   `FaceIdDemo.tsx`: Componente visual simulando a IA.
    *   `TestimonialCarousel.tsx`: Prova social.

3.  **Páginas (`frontend-specialist`):**
    *   Implementar as 3 rotas com layouts exclusivos.

4.  **Validação (`test-engineer`):**
    *   Garantir que o Demo Login NUNCA redirecione para Super Admin.
    *   Verificar responsividade mobile.

## 📝 Copywriting (Gatilhos)
*   *Escassez:* "Vagas limitadas para o plano Founder."
*   *Autoridade:* "Usado por 500+ faixas pretas."
*   *Prova Social:* Fotos de mestres (fictícios/stock) sorrindo com tablets.

Aprovação necessária para iniciar a criação dos dados de Demo e páginas.
