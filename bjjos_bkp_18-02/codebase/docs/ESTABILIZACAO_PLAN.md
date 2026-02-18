# 📋 Plano de Estabilização BJJOSS

## 🎯 Objetivo
Eliminar o carregamento infinito do Dashboard e o erro `AbortError`, garantindo que o login resulte em uma interface funcional em menos de 2 segundos.

## 🔍 Diagnóstico do Estado Atual
O `AuthContext.tsx` atual possui lógica redundante. Quando o Supabase detecta o login, ele dispara eventos que reiniciam o carregamento do perfil várias vezes, cancelando as requisições anteriores (causando o `AbortError`). O sistema entra em um estado de "espera infinita" porque os dados nunca terminam de chegar antes de serem cancelados de novo.

## 🛠️ Opções de Caminho

### Opção A: Reconstrução via TanStack Query (Recomendada)
Migrar a lógica de "Buscar Perfil" para o TanStack Query (que já está no projeto).
*   **Vantagem:** O Query gerencia "Abort", "Retry" e "Cache" automaticamente. Se uma busca está acontecendo, ele não deixa outra começar. 100% à prova de loops.
*   **Eficiência:** Alta. Resolve o problema de raiz e torna o app mais rápido.

### Opção B: "Fast-Track" Auth (Simplificação Radical)
Mover a informação de `role` e `name` para os `user_metadata` do Supabase Auth.
*   **Vantagem:** O perfil é lido INSTANTANEAMENTE no momento do login, sem precisar de query extra na tabela `profiles`.
*   **Eficiência:** Máxima para o login, mas requer um script de migração de metadados.

## 🚀 Cronograma de Execução (Fase 2)
1. **[F-S]** Implementar `useProfileQuery` usando TanStack Query.
2. **[B-S]** Validar se as permissões RLS no Supabase permitem queries via caching.
3. **[T-E]** Teste automatizado de login com verificação de carregamento de dashboard.

---
**Status:** Aguardando Aprovação do Usuário
