# PLANO DE RESGATE DE PERMISSÕES E ESTABILIDADE (Fase 1)

## 🎯 Objetivo
Resolver definitivamente o erro `Permission Denied` (42501) nas tabelas cruciais (`products`, `feature_flags`) e garantir que o Dashboard e Cantina funcionem para todos os perfis (Super Admin, Admin CT, Professor).

## 🔍 Diagnóstico
1.  **Sintoma:** Dashboard exibe "Erro ao carregar" e Cantina vazia.
2.  **Causa Raiz:** As tabelas `products` e `feature_flags` existem, mas estão com permissões de acesso (GRANTs) revogadas ou incorretas. O `service_role` e usuários autenticados não têm permissão nem de `SELECT`.
3.  **Gravidade:** Crítica (Bloqueia funcionalidades core).

## 🛠️ Estratégia de Execução (Orquestrada)

### Passo 1: Correção de Infraestrutura (`database-architect`)
*   Criar script `RESCUE_PERMISSIONS.sql` focado em GRANTs.
*   Garantir `GRANT ALL` explícito para `postgres`, `authenticated`, `service_role`.
*   Verificar o `Owner` das tabelas.
*   Reaplicar RLS simplificado (permissiva por padrão, restritiva por exceção).

### Passo 2: Verificação de Backend (`backend-specialist`)
*   Criar script de teste (`verify_access.js`) que usa tanto a chave `anon` quanto a `service_role` para confirmar a correção.
*   Validar se as Edge Functions (se houver) não estão quebrando.

### Passo 3: Blindagem do Frontend (`frontend-specialist`)
*   Refatorar `Cantina.tsx` e `SuperAdminDashboard.tsx` para tratar erros de permissão com UI graciosa (ex: "Sem permissão" em vez de crash/skeleton eterno).
*   Garantir que o `AuthContext` atualize as permissões no client-side assim que o banco voltar.

### Passo 4: Validação Final (`test-engineer`)
*   Executar testes E2E manuais (via browser_subagent) em:
    *   Login (Super Admin, Prof).
    *   Dashboard (Flags).
    *   Cantina (Produtos).

## 📝 Aprovado?
Este plano foca na **camada de permissão SQL** que foi negligenciada nos scripts anteriores (focados apenas em RLS). Confirme para prosseguir.
