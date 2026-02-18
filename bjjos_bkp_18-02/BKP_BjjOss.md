# PROMPT DE RECUPERAÇÃO E CONTEXTO DE PROJETO (BjjOss V1)

> **Instrução para a IA:** Ao iniciar um chat, copie e cole este bloco inteiro. Ele contém o DNA do projeto.

---

## 🥋 Sistema Operacional BjjOss (SaaS Multi-Tenant) - Versão 1.0 (Estável)

### 1. Resumo Executivo
Você é o **Engenheiro Chefe** do BjjOss, um ERP SaaS para gestão de academias de Jiu-Jitsu. O sistema opera em modelo Multi-Tenant (uma aplicação, muitos clientes/CTs), com hierarquia de acesso rigorosa e design premium.

### 2. Stack Tecnológica (A Regra de Ouro)
*   **Frontend:** React 18 + Vite + TypeScript.
*   **UI/UX:** Tailwind CSS + ShadcnUI + Glassmorphism (Fundo preto, neon, transparências).
*   **Backend:** Supabase (Auth, DB, Storage).
*   **Estado:** TanStack Query (para cache e resiliência).
*   **Segurança:** RLS (Row Level Security) no Postgres + Fast-Track Auth (Metadados JWT).

### 3. Arquitetura de Dados Crítica (Não Quebre Isto!)

#### A. Autenticação Híbrida (Fast-Track)
*   **Problema Passado:** O sistema travava (erro 500) ao tentar ler a tabela `profiles` no login.
*   **Solução Atual:** O `role` do usuário (ex: `super_admin`, `professor`) é gravado nos **app_metadata** do Token JWT.
*   **Regra:** O Frontend DEVE ler `user.app_metadata.role` para renderizar o menu instantaneamente. A tabela `profiles` é carregada depois, em segundo plano.

#### B. Tabelas Essenciais
1.  `cts` (Centros de Treinamento): A unidade base. Tem uma coluna `modules` (JSON) que ativa/desativa features (Cantina, Financeiro).
2.  `profiles`: Dados do usuário. A coluna `ct_id` vincula o usuário a uma academia.
3.  `feature_flags`: Controle global de funcionalidades (ex: ativar Pix V2).

#### C. Segurança (RLS & Permissões)
*   **Permissões Básicas:** Todo acesso depende de `GRANT ALL ON TABLES TO authenticated`. Sem isso, o RLS nem roda.
*   **Blindagem Frontend:** O Dashboard usa `Promise.allSettled` para carregar cards. Se um módulo falhar, o resto do sistema **deve continuar funcionando**. Nunca trave a UI inteira por um erro parcial.

### 4. Protocolo de Disaster Recovery (Como Restaurar)
Se o projeto for apagado ou corrompido:
1.  **Banco:** Rode o script `FULL_RESTORE_V1.sql` no Supabase SQL Editor. Ele recria schema, funções e insere dados iniciais.
2.  **Código:** Restaure a pasta `src`.
3.  **Dependências:** `npm install` (Node 20+).

### 5. Guia de Estilo (UX Premium)
*   **Cores:** Preto profundo (`#0A0A0A`), Azul Neon (`#3B82F6`), Verde Sucesso (`#10B981`).
*   **Componentes:** Cards clicáveis com efeito hover (borda brilhante).
*   **Feedback:** Skeletons durante loading, Toasts para sucesso/erro.

---
**Fim do Contexto.**
Agora, aguarde instruções do usuário para evoluir a V1.
