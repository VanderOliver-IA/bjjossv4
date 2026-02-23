# 🧠 BjjOss SaaS - Respostas aos Pontos Críticos (Infra & Estratégia)

Este documento consolida as respostas sobre o estado técnico e as decisões de produto do ecossistema BjjOss, servindo como base para o fechamento dos gaps entre a versão alpha e o MVP.

---

## 1) Autenticação e identidade

**1. Hoje vocês usam Supabase Auth ou Clerk?**
R: Estamos usando o **Supabase**, pois entendemos que apesar do Clerk ser excelente, não queremos surpresas financeiras na hora de escalar. O Supabase nos dá controle total sobre a infraestrutura de autenticação com custos previsíveis.

**2. Onde exatamente vivem os “claims” do JWT e como vocês fazem o refresh?**
R: Os claims principais (como o `role`) vivem no `app_metadata` do Supabase Auth para garantir imutabilidade pelo usuário. Já o `view_as_ct` (usado pelo Super Admin para alternar entre unidades no modo suporte) vive no `user_metadata`. O RLS lê esses dados diretamente do JWT via funções SQL como `auth.jwt()`. O "refresh" dos metadados no lado do cliente é forçado através da função `supabase.auth.updateUser()` no `AuthContext.tsx`, que atualiza a sessão local instantaneamente.

**3. O Super Admin é “fora do tenant” (global) ou existe uma “org” especial para o Super Admin?**
R: O Super Admin é **global**. A arquitetura RLS foi desenhada para que, se o claim `role` no JWT for `super_admin`, as políticas de `ct_id` sejam ignoradas (bypass), permitindo visão total sobre todas as tabelas. Não existe um CT específico para o Super Admin.

## 2) Multi-tenant e modelo de CT

**4. A entidade principal chama cts no banco? Ela corresponde a organizations do modelo SaaS?**
R: Exatamente. A tabela `cts` é a espinha dorsal do multi-tenancy e corresponde às `organizations`.

**5. Vocês já têm 3 CTs reais no alpha ou ainda só seed?**
R: Atualmente operamos primordialmente com **seed de alta fidelidade**. O sistema gera automaticamente cerca de 20 CTs simulados com histórico de faturamento para validação de BI.

**6. “Multi-Gym support” — vocês querem isso por membership ou por uma entidade “grupo”?**
R: Queremos isso por **membership/perfil**. A ideia é permitir que um mesmo usuário (dono) alterne rapidamente entre vários CTs a partir de uma única conta, utilizando a lógica de `view_as_ct` já iniciada no Super Admin.

## 3) Navegação e telas “pretas”

**7. As telas pretas acontecem por rota inexistente, erro React (crash), ou Promise pendente?**
R: O diagnóstico principal apontou para **TDZ (Temporal Dead Zone)** e falta de **Hoisting** em definições de constantes e ícones, causando crashes silenciosos no build de produção.

**8. Vocês têm Error Boundary global e rota de fallback?**
R: Temos uma rota de fallback (`/404`), mas o **Error Boundary global ainda está no backlog** como item prioritário para evitar crashes totais da UI.

**9. A navegação é React Router? Se sim: vocês usam lazy()/code splitting?**
R: Sim, **React Router (v6)**. Atualmente as rotas são estáticas, mas o code splitting via `lazy()` está mapeado para a próxima fase de otimização assim que o bundle crescer.

## 4) Reconhecimento facial / presença por foto

**10. O reconhecimento facial hoje é simulado ou real?**
R: Ainda **simulado**. Estamos definindo a arquitetura, provavelmente integrando **N8N** para processar as imagens e retornar o match para o Supabase.

**11. Qual fluxo vocês querem primeiro como padrão no MVP: grupo (vários rostos) ou individual (selfie)?**
R: São coisas diferentes. **Detectar vários rostos** será a função principal (fotos de final de treino). A selfie individual será usada apenas em casos isolados ou para auditoria.

**12. Vocês vão aceitar “match” por 1 foto ou exigem 3 fotos?**
R: Exigiremos o cadastro de **3 fotos de referência** (frente, esquerda, direita) no cadastro do aluno para melhor precisão da IA. No entanto, o check-in diário será feito com apenas **1 foto** comparada contra a base.

**13. Vocês querem guardar recorte de rosto (face crop) no storage?**
R: **Sim**, com nome e data, para fins de auditoria e futuro treinamento da IA.

## 5) WhatsApp e Mensageria

**14. WhatsApp será via qual interface?**
R: Utilizaremos a **Evolution API com N8N** para garantir flexibilidade e evitar custos abusivos por mensagem de provedores oficiais.

**15. Vocês precisam de 2 vias (chat) ou apenas saída (notificações)?**
R: Vai depender do momento e do módulo, mas a arquitetura deve suportar ambas as necessidades.

**16. O que já existe hoje nesse “Bypass de WhatsApp” do Super Admin?**
R: Atualmente é um **toggle de validação manual** que permite ao Super Admin ativar contas de mestres que não receberam ou não conseguiram validar o OTP via WhatsApp.

## 6) Financeiro e cobrança automática

**17. Qual gateway vocês vão priorizar no Brasil?**
R: Ainda não decidimos. Estamos abertos a sugestões que facilitem **Pix + Cartão + Recorrência** com os menores custos.

**18. “Pendurar” na cantina vira transação pendente — vocês querem fechar isso automaticamente na fatura?**
R: **Sim**, conforme o PRD original. O consumo da cantina deve ser consolidado e cobrado junto com a próxima mensalidade do aluno.

## 7) Feature flags e módulos por CT/perfil

**19. Onde vocês armazenam hoje “módulos ativados”?**
R: Na tabela `cts` (coluna JSON `modules`) para pacotes contratados, e na tabela `role_permissions` para acessos granulares por perfil.

**20. O Admin CT consegue editar permissões por role já?**
R: **Sim**, a interface de `ManagePermissions.tsx` já permite o controle granular de módulos para Professores, Atendentes e Alunos.

## 8) Estado atual do código

**21. O projeto está em Vite + React — vocês vão manter ou migrar?**
R: **Manteremos Vite + React**. A performance para SPA é excelente e supre todas as necessidades do dashboards e CRM.

**22. Vocês já têm tipos gerados do Supabase — está sincronizado com migrations?**
R: Sim, usamos o arquivo `types.ts` sincronizado com os scripts SQL de consolidação de banco de dados.
