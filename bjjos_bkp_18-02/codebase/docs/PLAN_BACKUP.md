# PLANO DE SISTEMA DE BACKUP E CONTEXTO DE IA (BjjOss V1)

## 🎯 Objetivo
Criar um "Snapshot de Recuperação Total" do projeto BjjOss no estado atual (Estável V1), permitindo que uma nova instância de IA ou desenvolvedor restaure o ambiente completo (Filesystem + Database + Contexto) em minutos.

## 📂 Estrutura de Diretórios Proposta (`bjjos_bkp_18-02`)
```
bjjos_bkp_18-02/
├── database/
│   ├── SCHEMA_FULL.sql          (Estrutura de tabelas e funções)
│   ├── SEED_DATA.sql            (Dados essenciais: Metadados, Produtos Básicos)
│   ├── RLS_POLICIES.sql         (Regras de segurança blindadas)
│   └── RESTORE_SCRIPT.sql       (Script único para rodar tudo na ordem certa)
├── codebase/
│   ├── src/                     (Código fonte limpo)
│   ├── .agent/                  (Cérebro da IA: Skills, Prompts, Histórico)
│   └── config_files/            (package.json, tsconfig, etc - sem node_modules)
├── documentation/
│   ├── PROJECT_CONTEXT.md       (O "Manual da IA" - Explicação profunda do sistema)
│   ├── ARCHITECTURE_V1.md       (Mapa de orquestração e decisões técnicas)
│   └── DEPLOY_GUIDE.md          (Como subir do zero)
└── AUTOMATION/
    └── backup_script.sh         (Script que gerou este backup)
```

## 📝 Documentação para IA (O "Cérebro Externo")
O arquivo `PROJECT_CONTEXT.md` deve conter:
1.  **Visão do Produto:** SaaS Multi-tenant para Academias de Jiu Jitsu.
2.  **Stack Técnica:** React, Supabase, Tailwind, RLS, Edge Functions.
3.  **Mapa de Dados:** Explicação das tabelas críticas (`cts`, `profiles`, `user_roles`).
4.  **Armadilhas Conhecidas:** (Ex: "Não use `features` na tabela `cts`, use `modules`").
5.  **Histórico de Decisões:** Por que usamos `Fast-Track Auth` (metadados)? Por que o RLS do Dashboard é específico?

## 🤖 Prompt Reutilizável (`BKP_BjjOss.md`)
Um "Meta-Prompt" que o usuário pode colar para qualquer IA no futuro para gerar um novo backup seguindo este mesmo padrão rigoroso.

## 🛠️ Plano de Execução

1.  **Extração de DB (`database-architect`):** Gerar o SQL consolidado que recria o banco DO ZERO (drop + create).
2.  **Criação de Scripts (`devops-engineer`):** Criar o `backup.sh` que ignora `node_modules` e `.git`, mas pega todo o resto.
3.  **Redação Técnica (`documentation-writer`):** Escrever o `PROJECT_CONTEXT.md` com nível de detalhe forense.
4.  **Prompt Engineering (`project-planner`):** Criar o `BKP_BjjOss.md`.

## ⚠️ Validação
O usuário deve conseguir pegar essa pasta, ir para uma nova máquina, rodar `npm install`, aplicar o SQL no Supabase e ter o sistema rodando igual a agora.
