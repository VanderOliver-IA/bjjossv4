# Evolução Super Admin: Do CRM ao SaaS Pro

Este plano estabelece a base para um sistema de gestão de alto nível, com dados históricos e inteligência de negócio.

## 1. Correção de Bloqueios (Prioridade 0)
- **RLS Recursion**: Blindar a função `get_my_role()` para usar apenas metadados do JWT, eliminando a consulta circular à tabela `user_roles`.
- **Ativação Segura**: Ajustar `activate_lead_account` para lidar com leads que ainda não são usuários auth.

## 2. Fábrica de Dados (Outubro/2025 - Fevereiro/2026)
- **Crescimento Exponencial**: Gerar script SQL para inserir:
    - ~25 CTs (Academia 1, 2, Bjj School, etc) com status variados.
    - ~100 Leads com histórico de tags: "Interessado", "Dúvida Preço", "Agendou Demo".
    - Financeiro Fake: Simulando MRR subindo de R$ 200 (Out) para R$ 2.500 (Fev).
- **Conversas Reais**: Leads com `notes` contendo diálogos simulatdos: "Mestre, como funciona a graduação automática?", "Tenho 100 alunos, o sistema aguenta?".

## 3. UI Dashboard Pro Max (`SuperAdminDashboard.tsx`)
- **Card: Panorama de Vendas**: Leads Novos vs Convertidos.
- **Card: MRR Growth**: Gráfico de linha comparando os últimos 6 meses.
- **Card: Churn Watch**: Lista de CTs que não logam há mais de 3 dias.
- **Grid de Funcionalidades**: Acesso rápido a todos os módulos SaaS.

## 4. CRM Refinado
- **Tags de Lead**: Visualização colorida no card do lead.
- **Histórico de Contato**: Timeline de interações.

## Cronograma
- 🟢 SQL: Correção de RLS e Geração de Dados.
- 🟡 React: Novo Dashboard Visual.
- 🟡 React: Ajuste de Perfil (Recursion Fix).
