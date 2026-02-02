# BJJ OSS - Prompts para Recriar o Projeto

Este documento contém prompts estruturados e sequenciais para recriar o sistema BJJ OSS (Organização de CT) do zero no Lovable.

---

## 📋 ÍNDICE

1. [Visão Geral e Setup Inicial](#1-visão-geral-e-setup-inicial)
2. [Banco de Dados - Estrutura Base](#2-banco-de-dados---estrutura-base)
3. [Sistema de Autenticação e Roles](#3-sistema-de-autenticação-e-roles)
4. [Design System e Navegação](#4-design-system-e-navegação)
5. [Dashboards por Perfil](#5-dashboards-por-perfil)
6. [Módulo de Alunos](#6-módulo-de-alunos)
7. [Módulo de Turmas](#7-módulo-de-turmas)
8. [Módulo de Presença com Reconhecimento Facial](#8-módulo-de-presença-com-reconhecimento-facial)
9. [Módulo Financeiro](#9-módulo-financeiro)
10. [Módulo Cantina/Loja](#10-módulo-cantinaloja)
11. [Módulo de Eventos e Graduação](#11-módulo-de-eventos-e-graduação)
12. [Módulo CRM (Leads)](#12-módulo-crm-leads)
13. [Módulo de Comunicação](#13-módulo-de-comunicação)
14. [Relatórios](#14-relatórios)
15. [Configurações e Feature Flags](#15-configurações-e-feature-flags)
16. [Regras Globais de UX](#16-regras-globais-de-ux)

---

## 1. VISÃO GERAL E SETUP INICIAL

### Prompt 1.1 - Definição do Projeto
```
Crie um sistema de gestão para Centros de Treinamento de Jiu-Jitsu chamado "BJJ OSS".

VISÃO GERAL:
- Sistema multi-tenant (vários CTs no mesmo sistema)
- 5 níveis de acesso: Super Admin, Admin CT, Professor, Atendente, Aluno
- Foco em organização, gestão de alunos e controle de presença
- 100% funcional com dados reais (sem simulações ou mocks)
- Mobile-first mas responsivo para desktop

TECNOLOGIAS:
- React + TypeScript + Vite
- Tailwind CSS com design system personalizado
- Supabase (Lovable Cloud) para backend
- Shadcn/UI como biblioteca de componentes

Habilite o Lovable Cloud para este projeto.
```

### Prompt 1.2 - Identidade Visual
```
Defina a identidade visual do BJJ OSS:

CORES PRINCIPAIS (HSL):
- Primary: Azul (221 83% 53%)
- Secondary: Roxo (262 83% 58%)
- Accent: Gradiente do Azul ao Roxo
- Success: Verde (142 76% 36%)
- Warning: Amarelo (38 92% 50%)
- Destructive: Vermelho (0 84% 60%)

TIPOGRAFIA:
- Font principal: Inter
- Títulos: Bold/Semibold
- Corpo: Regular

TEMA:
- Suporte a modo claro e escuro
- Cores de fundo, texto e bordas adaptáveis ao tema
- Usar tokens semânticos (--background, --foreground, --primary, etc.)

Configure o index.css e tailwind.config.ts com estes tokens.
```

---

## 2. BANCO DE DADOS - ESTRUTURA BASE

### Prompt 2.1 - Tabela de CTs (Centros de Treinamento)
```
Crie a tabela de CTs (Centros de Treinamento) com:

CAMPOS:
- id (UUID, PK)
- name (text, obrigatório)
- cnpj (text, opcional)
- address (text, obrigatório)
- phone (text, obrigatório)
- email (text, obrigatório)
- logo_url (text, opcional)
- modules (JSONB - controla quais módulos estão ativos)
- subscription (enum: trial, basic, pro, enterprise)
- subscription_status (enum: ativo, inativo, pendente)
- subscription_value (numeric)
- subscription_due_day (integer)
- created_at, updated_at (timestamps)

MÓDULOS PADRÃO (JSON):
{
  "alunos": true,
  "turmas": true,
  "presenca": true,
  "financeiro": true,
  "cantina": true,
  "eventos": true,
  "graduacao": true,
  "crm": true,
  "comunicacao": true,
  "relatorios": true
}

RLS: Super admins podem tudo, membros do CT podem ver seu CT.
```

### Prompt 2.2 - Tabela de Profiles
```
Crie a tabela de profiles para armazenar dados adicionais dos usuários:

CAMPOS:
- id (UUID, PK)
- user_id (UUID, referencia auth.users)
- ct_id (UUID, referencia cts, opcional para super_admin)
- name (text, obrigatório)
- email (text, obrigatório)
- phone (text, opcional)
- avatar_url (text, opcional)
- created_at, updated_at (timestamps)

TRIGGER: Criar profile automaticamente quando um usuário se registra.

RLS:
- Usuários podem ver e editar seu próprio profile
- Admins do CT podem gerenciar profiles do seu CT
- Super admins podem gerenciar todos
```

### Prompt 2.3 - Tabela de User Roles
```
Crie o sistema de roles de usuário:

ENUM app_role:
- super_admin
- admin_ct
- professor
- atendente
- aluno

TABELA user_roles:
- id (UUID, PK)
- user_id (UUID, referencia auth.users)
- role (app_role)
- UNIQUE(user_id, role)

FUNÇÕES AUXILIARES (SECURITY DEFINER):
1. has_role(user_id, role) - verifica se usuário tem role
2. is_super_admin() - verifica se é super admin
3. is_ct_admin(ct_id) - verifica se é admin do CT específico
4. can_access_ct(ct_id) - verifica acesso ao CT
5. get_user_ct_id() - retorna o ct_id do usuário
6. get_user_profile() - retorna o profile_id do usuário

IMPORTANTE: Nunca armazenar role na tabela profiles para evitar escalação de privilégios.
```

### Prompt 2.4 - Tabela de Role Permissions
```
Crie tabela para controlar permissões de módulos por role dentro de cada CT:

TABELA role_permissions:
- id (UUID, PK)
- ct_id (UUID, referencia cts)
- role (app_role)
- modules (JSONB - mesma estrutura dos módulos do CT)
- created_at, updated_at

DEFAULT para professor/atendente:
{
  "alunos": true,
  "turmas": true,
  "presenca": true,
  "financeiro": false,
  "cantina": true,
  "eventos": true,
  "graduacao": true,
  "crm": false,
  "comunicacao": true,
  "relatorios": false
}

Isso permite que o Admin do CT customize quais módulos cada perfil pode acessar.
```

### Prompt 2.5 - Tabela de Alunos (Students)
```
Crie a tabela de alunos com todos os campos necessários:

CAMPOS OBRIGATÓRIOS:
- id (UUID, PK)
- ct_id (UUID, referencia cts)
- name (text)
- email (text)
- phone (text)
- belt (enum: branca, azul, roxa, marrom, preta)
- stripes (integer, 0-4)
- status (enum: ativo, inativo, experimental)
- enrollment_date (date)

CAMPOS OPCIONAIS:
- profile_id (UUID, referencia profiles - se aluno tiver login)
- birth_date (date)
- address (text)
- responsible_name (text - para menores)
- responsible_phone (text)
- emergency_contact (text)
- jj_start_date (date - início no jiu-jitsu)
- previous_ct (text - CT anterior)
- federated (boolean)
- balance (numeric - saldo na cantina)
- notes (text)
- pause_periods (JSONB - períodos de pausa)

FOTOS PARA RECONHECIMENTO FACIAL (obrigatório para presença):
- photo_front (text - URL)
- photo_left (text - URL)
- photo_right (text - URL)

- created_at, updated_at

RLS: Membros do CT podem ver, admins podem gerenciar.
```

### Prompt 2.6 - Tabela de Turmas (Training Classes)
```
Crie a tabela de turmas:

CAMPOS:
- id (UUID, PK)
- ct_id (UUID, referencia cts)
- name (text, obrigatório)
- professor_id (UUID, referencia profiles, opcional)
- level (enum: iniciante, intermediario, avancado, todos)
- days_of_week (text[] - ex: ["segunda", "quarta", "sexta"])
- time_start (time)
- time_end (time)
- schedule (text - descrição legível)
- max_students (integer, default 30)
- active (boolean, default true)
- created_at, updated_at

TABELA student_classes (relação N:N):
- id (UUID, PK)
- student_id (UUID, referencia students)
- class_id (UUID, referencia training_classes)
- enrolled_at (timestamp)

RLS: Professores podem atualizar suas turmas, admins podem tudo.
```

### Prompt 2.7 - Tabelas de Presença
```
Crie as tabelas para controle de presença:

TABELA attendance_records:
- id (UUID, PK)
- ct_id (UUID, referencia cts)
- class_id (UUID, referencia training_classes, opcional)
- date (date, default CURRENT_DATE)
- photo_url (text - foto do grupo)
- visitors (integer, default 0)
- experimental (integer, default 0)
- notes (text)
- created_by (UUID, referencia profiles)
- created_at

TABELA attendance_students:
- id (UUID, PK)
- attendance_id (UUID, referencia attendance_records)
- student_id (UUID, referencia students)
- recognized (boolean - se foi por reconhecimento facial)

RLS: Professores podem gerenciar presença das suas turmas.
```

### Prompt 2.8 - Tabelas Financeiras
```
Crie as tabelas para o módulo financeiro:

ENUM transaction_type: mensalidade, cantina, loja, evento, outros
ENUM payment_status: pago, pendente, atrasado
ENUM payment_method: pix, cartao, dinheiro, boleto

TABELA financial_transactions:
- id (UUID, PK)
- ct_id (UUID)
- student_id (UUID, opcional)
- product_id (UUID, opcional)
- type (transaction_type)
- description (text)
- amount (numeric)
- status (payment_status)
- payment_method (payment_method, opcional)
- due_date (date, opcional)
- paid_date (date, opcional)
- created_by (UUID)
- created_at, updated_at

TABELA recurring_expenses:
- id (UUID, PK)
- ct_id (UUID)
- description (text)
- category (text)
- amount (numeric)
- due_day (integer, 1-31)
- active (boolean)
- created_at, updated_at

RLS: Apenas admins podem gerenciar financeiro.
```

### Prompt 2.9 - Tabelas de Caixa Diário
```
Crie tabelas para controle de caixa diário:

ENUM cash_status: aberto, fechado
ENUM cash_transaction_type: entrada, saida

TABELA daily_cash:
- id (UUID, PK)
- ct_id (UUID)
- date (date)
- opening_balance (numeric)
- closing_balance (numeric, opcional)
- status (cash_status)
- closed_by (UUID, opcional)
- closed_at (timestamp, opcional)
- created_at

TABELA cash_transactions:
- id (UUID, PK)
- daily_cash_id (UUID)
- type (cash_transaction_type)
- description (text)
- amount (numeric)
- payment_method (payment_method)
- created_at

RLS: Admins do CT podem gerenciar caixa.
```

### Prompt 2.10 - Tabela de Produtos
```
Crie tabela de produtos para cantina e loja:

ENUM product_category: cantina, loja

TABELA products:
- id (UUID, PK)
- ct_id (UUID)
- name (text)
- category (product_category)
- price (numeric)
- stock (integer, default 0)
- image_url (text, opcional)
- active (boolean, default true)
- created_at, updated_at

RLS: Membros podem ver, admins podem gerenciar.
```

### Prompt 2.11 - Tabelas de Eventos e Graduação
```
Crie tabelas para eventos e graduações:

ENUM event_type: graduacao, campeonato, interno, seminario

TABELA events:
- id (UUID, PK)
- ct_id (UUID)
- title (text)
- type (event_type)
- date (date)
- location (text, opcional)
- description (text, opcional)
- price (numeric, opcional)
- created_at, updated_at

TABELA event_participants:
- id (UUID, PK)
- event_id (UUID)
- student_id (UUID)
- registered_at (timestamp)

TABELA graduation_records:
- id (UUID, PK)
- ct_id (UUID)
- student_id (UUID)
- event_id (UUID, opcional - se foi em evento de graduação)
- from_belt (belt_type)
- from_stripes (integer)
- to_belt (belt_type)
- to_stripes (integer)
- date (date)
- awarded_by (UUID, referencia profiles)
- notes (text, opcional)
- created_at

RLS: Membros podem ver, admins e professores podem gerenciar graduações.
```

### Prompt 2.12 - Tabela de Leads (CRM)
```
Crie tabela para gestão de leads:

ENUM lead_status: novo, contatado, agendado, experimental, matriculado, perdido
ENUM lead_source: instagram, facebook, indicacao, site, outros

TABELA leads:
- id (UUID, PK)
- ct_id (UUID)
- name (text)
- phone (text)
- email (text, opcional)
- source (lead_source)
- status (lead_status)
- assigned_to (UUID, referencia profiles, opcional)
- last_contact (date, opcional)
- notes (text, opcional)
- created_at, updated_at

RLS: Admins podem gerenciar, usuários atribuídos podem ver seus leads.
```

### Prompt 2.13 - Tabela de Mensagens
```
Crie tabela para comunicação interna:

TABELA messages:
- id (UUID, PK)
- ct_id (UUID)
- from_profile_id (UUID)
- to_profile_id (UUID, opcional - null para broadcast)
- subject (text)
- content (text)
- read (boolean, default false)
- read_at (timestamp, opcional)
- created_at

RLS: Usuários podem ver mensagens enviadas/recebidas por eles.
```

### Prompt 2.14 - Tabelas Auxiliares
```
Crie tabelas auxiliares:

TABELA dashboard_configs:
- id (UUID, PK)
- profile_id (UUID, UNIQUE)
- cards (JSONB - configuração dos cards)
- charts (JSONB - configuração dos gráficos)
- layout (JSONB - layout drag-and-drop)
- updated_at

TABELA feature_flags:
- id (UUID, PK)
- name (text)
- description (text, opcional)
- enabled (boolean, default false)
- ct_ids (UUID[] - CTs específicos, vazio = todos)
- created_at, updated_at

RLS: Usuários podem gerenciar seu próprio dashboard_config.
Super admins podem gerenciar feature_flags.
```

### Prompt 2.15 - Storage Bucket
```
Crie um bucket público chamado "photos" para armazenar:
- Fotos de perfil de usuários
- Fotos de alunos (frente, esquerda, direita) para reconhecimento facial
- Fotos de produtos
- Fotos de presença (grupo)
- Logos dos CTs

O bucket deve ser público para leitura (GET) para facilitar exibição das imagens.
```

---

## 3. SISTEMA DE AUTENTICAÇÃO E ROLES

### Prompt 3.1 - Contexto de Autenticação
```
Crie um AuthContext completo que:

1. Gerencia estado de autenticação (user, session, loading)
2. Carrega o profile do usuário logado
3. Carrega o role do usuário (da tabela user_roles)
4. Fornece funções: login, logout, signup
5. Expõe: user, profile, role, isLoading, ctId

TIPOS:
type AppRole = 'super_admin' | 'admin_ct' | 'professor' | 'atendente' | 'aluno';

O contexto deve:
- Escutar mudanças de auth state
- Redirecionar para login se não autenticado
- Redirecionar para dashboard após login
- Limpar estado ao fazer logout
```

### Prompt 3.2 - Página de Login
```
Crie uma página de login profissional:

ELEMENTOS:
- Logo do sistema centralizado
- Formulário com email e senha
- Botão de login com loading state
- Link para "Esqueci minha senha" (pode ser placeholder)
- Mensagens de erro claras

VISUAL:
- Fundo com gradiente sutil ou imagem de BJJ
- Card centralizado com o formulário
- Responsivo para mobile e desktop

COMPORTAMENTO:
- Validação de campos
- Feedback visual de loading
- Toast de erro em caso de falha
- Redirecionamento para /dashboard após sucesso
```

---

## 4. DESIGN SYSTEM E NAVEGAÇÃO

### Prompt 4.1 - Estrutura de Navegação
```
Implemente a navegação com menu inferior fixo:

ESTRUTURA (5 ícones):
1. Dashboard (ícone: LayoutDashboard)
2. Atalho configurável pelo usuário
3. BOTÃO CENTRAL DE DESTAQUE - Presença (ícone: Camera)
   - 20-30% maior que os outros
   - Gradiente de Azul para Roxo
   - Destaque visual (elevação/sombra)
4. Atalho configurável pelo usuário
5. Menu geral (ícone: Menu) - abre Sheet com todos os módulos

COMPORTAMENTO:
- Ícones grandes e coloridos
- Animação de feedback ao clicar (scale + opacity)
- Indicador visual do item ativo
- Persistência dos atalhos em localStorage por usuário

RESPONSIVIDADE:
- Mobile: menu inferior fixo
- Desktop: pode manter inferior ou sidebar (preferência: inferior)
```

### Prompt 4.2 - Configuração de Atalhos
```
Crie sistema para configurar os 2 atalhos do menu inferior:

ARQUIVO src/config/bottomNav.ts:
- Lista de todos os módulos disponíveis com ícone e rota
- Função para obter atalhos padrão por role
- Função para filtrar módulos permitidos por role

HOOK useBottomNavConfig:
- Carrega configuração do localStorage
- Fornece função para atualizar atalhos
- Fornece função para resetar ao padrão
- Fornece função para trocar (swap) os atalhos

PADRÕES POR ROLE:
- super_admin: CTs, Relatórios
- admin_ct: Alunos, Financeiro
- professor: Turmas, Graduação
- atendente: Alunos, Cantina
- aluno: Frequência, Mensagens
```

### Prompt 4.3 - Menu Lateral (Sheet)
```
Crie o menu lateral que abre ao clicar no ícone de menu:

COMPONENTE Sheet:
- Abre da direita
- Lista todos os módulos permitidos para o role do usuário
- Cada item com ícone e nome
- Agrupa por categoria se necessário
- Botão de logout no final

MÓDULOS (filtrados por permissão):
- Dashboard
- Alunos
- Turmas
- Presença
- Financeiro
- Cantina
- Eventos
- Graduação
- CRM
- Comunicação
- Relatórios
- Configurações

PARA SUPER ADMIN adicionar:
- CTs (gestão de centros)
- Feature Flags
```

### Prompt 4.4 - Layout Principal
```
Crie o MainLayout que envolve todas as páginas autenticadas:

ESTRUTURA:
- Header superior fixo com:
  - Logo (link para dashboard)
  - Toggle de tema (claro/escuro)
  - Ícone de notificações (com badge)
  - Menu do usuário (avatar, nome, role, logout)
  
- Área de conteúdo com padding adequado
  - Espaço para header (top)
  - Espaço para menu inferior (bottom)
  
- Menu inferior fixo (BottomNavigation)

COMPORTAMENTO:
- Verificar autenticação (redirecionar se não logado)
- Passar contexto de auth para children
- Responsivo
```

---

## 5. DASHBOARDS POR PERFIL

### Prompt 5.1 - Dashboard do Super Admin
```
Crie o dashboard para Super Admin com:

CARDS PRINCIPAIS (clicáveis → módulo):
1. Total de CTs ativos (→ /cts)
2. Total de alunos na plataforma (→ listagem)
3. Receita total do mês (→ /financeiro)
4. CTs com pagamento pendente (→ /cts filtrado)

GRÁFICOS:
1. Crescimento de CTs (linha, últimos 12 meses)
2. Distribuição de planos (pizza: trial, basic, pro, enterprise)
3. Receita por mês (barras)

LISTA:
- Últimas mensagens de suporte dos CTs
- CTs recém cadastrados

REGRA: Todo elemento visual deve ser clicável e levar ao módulo/detalhe relacionado.
```

### Prompt 5.2 - Dashboard do Admin CT
```
Crie o dashboard para Admin do CT com:

CARDS PRINCIPAIS (clicáveis):
1. Total de alunos ativos (→ /alunos)
2. Alunos em aula experimental (→ /alunos?status=experimental)
3. Presenças hoje (→ /presenca)
4. Receita do mês (→ /financeiro)
5. Mensalidades pendentes (→ /financeiro?status=pendente)
6. Leads novos (→ /crm)

GRÁFICOS:
1. Presença semanal (barras por dia)
2. Distribuição por faixa (pizza colorida por faixa)
3. Receita vs Despesas (linha comparativa)

LISTAS:
- Próximos eventos
- Aniversariantes do mês
- Alunos com mensalidade atrasada

CORES DAS FAIXAS:
- Branca: #FFFFFF (borda cinza)
- Azul: #2563EB
- Roxa: #7C3AED
- Marrom: #92400E
- Preta: #1F2937
```

### Prompt 5.3 - Dashboard do Professor
```
Crie o dashboard para Professor com:

CARDS PRINCIPAIS:
1. Minhas turmas ativas (→ /turmas)
2. Alunos nas minhas turmas (→ /alunos)
3. Presenças hoje (→ /presenca)
4. Próxima graduação (→ /eventos)

GRÁFICOS:
1. Presença por turma (barras)
2. Evolução de presenças (linha, últimas 4 semanas)

LISTAS:
- Turmas do dia (com horário)
- Alunos aptos para graduação (critérios de presença/tempo)

AÇÕES RÁPIDAS:
- Botão grande "Registrar Presença" (→ /presenca)
- Botão "Ver Turmas de Hoje"
```

### Prompt 5.4 - Dashboard do Atendente
```
Crie o dashboard para Atendente com:

CARDS PRINCIPAIS:
1. Leads para contatar hoje (→ /crm)
2. Alunos experimentais (→ /alunos?status=experimental)
3. Caixa do dia (→ /caixa)
4. Vendas da cantina hoje (→ /cantina)

GRÁFICOS:
1. Funil de leads (barras horizontais por status)
2. Vendas por categoria (pizza: cantina vs loja)

LISTAS:
- Leads pendentes de contato
- Experimentais para acompanhar
- Últimas vendas

AÇÕES RÁPIDAS:
- Novo Lead
- Nova Venda
- Abrir/Fechar Caixa
```

### Prompt 5.5 - Dashboard do Aluno
```
Crie o dashboard para Aluno com:

CARDS PRINCIPAIS:
1. Minha faixa e graus (visual da faixa)
2. Presenças no mês (→ /frequencia)
3. Saldo na cantina (→ /extrato)
4. Próximo evento (→ /eventos)

GRÁFICOS:
1. Frequência mensal (linha, últimos 6 meses)
2. Meta de presença (progresso circular)

INFORMAÇÕES:
- Turmas matriculadas
- Horários das aulas
- Tempo de treino (desde jj_start_date)

HISTÓRICO:
- Últimas presenças
- Últimas compras
- Graduações anteriores
```

---

## 6. MÓDULO DE ALUNOS

### Prompt 6.1 - Listagem de Alunos
```
Crie a página de listagem de alunos (/alunos):

FILTROS:
- Busca por nome/email/telefone
- Status (ativo, inativo, experimental)
- Faixa
- Turma

TABELA/CARDS:
- Foto (miniatura)
- Nome (clicável → perfil)
- Faixa com graus (visual)
- Status (badge colorido)
- Telefone
- Data de matrícula
- Ações: Ver, Editar, Inativar

AÇÕES:
- Botão "Novo Aluno"
- Exportar lista (CSV)

RESPONSIVO:
- Desktop: tabela
- Mobile: cards empilhados
```

### Prompt 6.2 - Cadastro/Edição de Aluno
```
Crie formulário de cadastro de aluno com:

DADOS PESSOAIS:
- Nome* 
- Email*
- Telefone*
- Data de nascimento
- Endereço
- Contato de emergência

RESPONSÁVEL (se menor de idade):
- Nome do responsável
- Telefone do responsável

DADOS DO JIU-JITSU:
- Data de início no JJ
- CT anterior (se houver)
- Faixa atual*
- Graus (0-4)
- Federado (checkbox)

FOTOS PARA RECONHECIMENTO FACIAL (obrigatórias):
- Upload de 3 fotos: frente, lado esquerdo, lado direito
- Preview das fotos
- Instruções claras de como tirar as fotos
- Validação: não salvar sem as 3 fotos

MATRÍCULA:
- Data de matrícula
- Status inicial
- Turmas (seleção múltipla)

VALIDAÇÕES:
- Campos obrigatórios marcados
- Email válido
- Telefone no formato correto
- Fotos obrigatórias
```

### Prompt 6.3 - Perfil do Aluno
```
Crie página de perfil individual do aluno:

HEADER:
- Foto grande
- Nome
- Faixa com graus (visual bonito)
- Status (badge)
- Tempo de treino
- Botão Editar

ABAS/SEÇÕES:

1. INFORMAÇÕES:
   - Dados pessoais
   - Responsável
   - Contatos

2. TREINO:
   - Turmas matriculadas
   - Horários
   - Professor(es)

3. FREQUÊNCIA:
   - Gráfico de presença
   - Histórico de presenças
   - % de frequência

4. FINANCEIRO:
   - Mensalidades (status)
   - Histórico de pagamentos
   - Compras na cantina/loja
   - Saldo atual

5. GRADUAÇÕES:
   - Histórico de faixas/graus
   - Timeline visual

6. OBSERVAÇÕES:
   - Notas internas
   - Períodos de pausa
```

---

## 7. MÓDULO DE TURMAS

### Prompt 7.1 - Listagem e Gestão de Turmas
```
Crie a página de turmas (/turmas):

LISTAGEM:
- Cards por turma com:
  - Nome da turma
  - Nível (badge)
  - Professor
  - Dias e horários
  - Número de alunos / máximo
  - Status (ativa/inativa)

FILTROS:
- Nível
- Professor
- Dia da semana
- Status

AÇÕES:
- Nova Turma
- Editar
- Ver alunos matriculados
- Desativar

MODAL DE TURMA:
- Dados da turma
- Lista de alunos matriculados
- Botão para adicionar/remover alunos
```

### Prompt 7.2 - Formulário de Turma
```
Crie formulário para criar/editar turma:

CAMPOS:
- Nome da turma*
- Professor (select dos professores do CT)
- Nível (select: iniciante, intermediário, avançado, todos)
- Dias da semana (checkboxes múltiplos)
- Horário início
- Horário fim
- Máximo de alunos
- Descrição/observações
- Ativa (toggle)

ALUNOS:
- Lista de alunos matriculados
- Busca para adicionar
- Remover aluno da turma
```

---

## 8. MÓDULO DE PRESENÇA COM RECONHECIMENTO FACIAL

### Prompt 8.1 - Fluxo de Presença
```
Crie a página de presença (/presenca) com reconhecimento facial:

ESTADO INICIAL:
- Tela limpa com mensagem: "Envie ou tire uma foto para iniciar a análise"
- Seleção opcional de turma
- Dois botões: "Tirar Foto" e "Enviar Foto"

FLUXO:
1. Usuário seleciona turma (opcional)
2. Usuário tira ou envia foto
3. Sistema mostra preview
4. Sistema processa (com etapas visuais):
   - Otimizando imagem...
   - Detectando rostos...
   - Exibindo rostos detectados...
   - Comparando com alunos cadastrados...

REGRA CRÍTICA:
- NUNCA iniciar análise sem imagem real
- NUNCA inventar rostos ou alunos
- Só mostrar resultados baseados na análise real
```

### Prompt 8.2 - Resultados do Reconhecimento
```
Após processamento, exibir resultados:

RESUMO:
- Total de rostos detectados
- Reconhecidos
- Pendentes (não reconhecidos)

LISTA DE ROSTOS:
Para cada rosto detectado, mostrar card com:
- Miniatura do rosto (recortada da foto)
- Status: Reconhecido (verde) ou Não reconhecido (amarelo)

SE RECONHECIDO:
- Nome do aluno
- Faixa
- Confiança (%)
- Status: "Presença confirmada"

SE NÃO RECONHECIDO:
- Botões de ação:
  - Visitante
  - Aula Experimental
  - Cadastrar novo aluno
  - Professor
  - Ignorar

O usuário DEVE classificar todos os rostos pendentes antes de finalizar.

BOTÃO FINAL:
"Finalizar registro de presença" (só ativo quando não há pendentes)
```

### Prompt 8.3 - Edge Function de Reconhecimento Facial
```
Crie uma Edge Function (supabase/functions/facial-recognition) que:

AÇÕES:
1. "recognize" - Analisa imagem e compara com alunos
2. "record_attendance" - Registra a presença

FLUXO DE RECOGNIZE:
1. Validar que image_base64 existe e é válida (mínimo 5KB)
2. Buscar alunos do CT que têm fotos cadastradas
3. Gerar URLs assinadas para as fotos dos alunos
4. Usar Lovable AI (modelo de visão) para:
   - Detectar rostos na imagem
   - Retornar bounding boxes normalizadas (0-1)
   - Comparar cada rosto com fotos dos alunos
   - Retornar matches com confiança

RESPOSTA:
{
  "success": true,
  "detected_faces": [
    {
      "face_id": "face_1",
      "box": {"x": 0.1, "y": 0.2, "width": 0.2, "height": 0.25},
      "match": {
        "student_id": "uuid",
        "confidence": 85,
        "matched": true
      } | null
    }
  ],
  "results": [...],  // legacy format
  "unrecognized_count": 2
}

VALIDAÇÕES:
- Só retornar match se student_id existe no CT
- Só considerar matched se confidence >= 70
- Não inventar dados
```

---

## 9. MÓDULO FINANCEIRO

### Prompt 9.1 - Dashboard Financeiro
```
Crie a página de financeiro (/financeiro):

CARDS RESUMO:
- Receita do mês
- Despesas do mês
- Saldo
- Mensalidades pendentes
- Mensalidades atrasadas

FILTROS:
- Período (mês/ano)
- Tipo (mensalidade, cantina, loja, evento)
- Status (pago, pendente, atrasado)
- Aluno

GRÁFICOS:
- Receita vs Despesa (barras comparativas)
- Receita por tipo (pizza)
- Evolução mensal (linha)

TABELA DE TRANSAÇÕES:
- Data
- Descrição
- Aluno (se aplicável)
- Tipo
- Valor
- Status (badge colorido)
- Ações: Ver, Editar, Baixar (marcar pago)
```

### Prompt 9.2 - Gestão de Mensalidades
```
Crie funcionalidade de mensalidades:

GERAÇÃO AUTOMÁTICA:
- Gerar mensalidades para todos os alunos ativos
- Baseado em valor padrão ou valor individual
- Gerar para o mês seguinte

VISUALIZAÇÃO:
- Lista de mensalidades do mês
- Filtro por status
- Destaque para atrasadas

AÇÕES:
- Registrar pagamento (com método)
- Gerar boleto/pix (placeholder)
- Enviar lembrete
- Cancelar/estornar

REGRAS:
- Mensalidade vence no dia X (configurável por CT)
- Após vencimento, status muda para "atrasado"
```

### Prompt 9.3 - Despesas Recorrentes
```
Crie gestão de despesas recorrentes:

CADASTRO:
- Descrição
- Categoria (aluguel, água, luz, internet, etc.)
- Valor
- Dia do vencimento
- Ativo (toggle)

LISTAGEM:
- Despesas cadastradas
- Próximo vencimento
- Status

AUTOMAÇÃO:
- Gerar lançamento de despesa automaticamente no início do mês
```

---

## 10. MÓDULO CANTINA/LOJA

### Prompt 10.1 - PDV da Cantina
```
Crie interface de ponto de venda para cantina:

LAYOUT:
- Grid de produtos (cards com foto, nome, preço)
- Filtro por categoria (cantina/loja)
- Busca

CARRINHO:
- Lista de itens selecionados
- Quantidade editável
- Subtotal por item
- Total geral
- Botão limpar

FINALIZAÇÃO:
- Selecionar cliente:
  - Aluno (debitar do saldo ou cobrar)
  - Avulso (sem cliente)
- Método de pagamento
- Confirmar venda

INTEGRAÇÃO:
- Baixar estoque
- Registrar transação financeira
- Atualizar saldo do aluno (se aplicável)
```

### Prompt 10.2 - Gestão de Produtos
```
Crie página de gestão de produtos:

LISTAGEM:
- Foto
- Nome
- Categoria
- Preço
- Estoque
- Status (ativo/inativo)
- Ações

CADASTRO/EDIÇÃO:
- Nome*
- Categoria*
- Preço*
- Estoque inicial
- Foto (upload)
- Ativo

CONTROLE DE ESTOQUE:
- Entrada de produtos
- Alerta de estoque baixo
```

---

## 11. MÓDULO DE EVENTOS E GRADUAÇÃO

### Prompt 11.1 - Gestão de Eventos
```
Crie página de eventos (/eventos):

TIPOS:
- Graduação
- Campeonato
- Evento interno
- Seminário

LISTAGEM:
- Calendário visual ou lista
- Cards com: título, tipo, data, local
- Filtro por tipo e período

CADASTRO:
- Título*
- Tipo*
- Data*
- Local
- Descrição
- Valor (se pago)

PARTICIPANTES:
- Lista de inscritos
- Adicionar participantes
- Gerar lista de presença
```

### Prompt 11.2 - Gestão de Graduações
```
Crie funcionalidade de graduação:

REGISTRO:
- Selecionar aluno
- Faixa/graus atuais (preenchido automaticamente)
- Nova faixa/graus
- Data
- Evento vinculado (opcional)
- Professor que graduou
- Observações

VALIDAÇÕES:
- Ordem correta de faixas
- Máximo 4 graus por faixa
- Não pular faixas

HISTÓRICO:
- Timeline do aluno
- Todas as graduações registradas

ALUNOS APTOS:
- Lista de alunos que atendem critérios:
  - Tempo mínimo na faixa
  - Frequência mínima
  - Aprovação do professor
```

---

## 12. MÓDULO CRM (LEADS)

### Prompt 12.1 - Gestão de Leads
```
Crie página de CRM (/crm):

KANBAN:
- Colunas por status: Novo, Contatado, Agendado, Experimental, Matriculado, Perdido
- Cards arrastáveis
- Cores por origem

LISTA:
- Alternativa em tabela
- Filtros por status, origem, responsável

CARD DO LEAD:
- Nome
- Telefone (clicável para WhatsApp)
- Origem (badge)
- Dias desde criação
- Último contato
- Responsável

AÇÕES:
- Novo Lead
- Editar
- Agendar experimental
- Converter em aluno
- Marcar como perdido
```

### Prompt 12.2 - Conversão de Lead
```
Crie fluxo de conversão de lead em aluno:

QUANDO STATUS = "MATRICULADO":
1. Abrir modal de cadastro de aluno
2. Pré-preencher dados do lead (nome, telefone, email)
3. Completar cadastro com dados faltantes
4. Ao salvar: criar aluno e arquivar lead

AULA EXPERIMENTAL:
1. Marcar lead como "Experimental"
2. Registrar data da aula
3. Criar aluno temporário com status "experimental"
4. Após avaliação: converter ou marcar como perdido
```

---

## 13. MÓDULO DE COMUNICAÇÃO

### Prompt 13.1 - Sistema de Mensagens
```
Crie página de comunicação (/comunicacao):

INBOX:
- Lista de mensagens recebidas
- Indicador de lidas/não lidas
- Ordenação por data

ENVIADAS:
- Lista de mensagens enviadas
- Status de leitura

NOVA MENSAGEM:
- Destinatário:
  - Usuário específico
  - Todos os alunos
  - Todos os professores
  - Turma específica
- Assunto
- Conteúdo (rich text simples)

VISUALIZAÇÃO:
- Thread de conversa
- Responder
```

---

## 14. RELATÓRIOS

### Prompt 14.1 - Dashboard de Relatórios
```
Crie página de relatórios (/relatorios):

FILTROS GLOBAIS:
- Período (data início, data fim)
- Presets: Hoje, Esta semana, Este mês, Últimos 3 meses

RELATÓRIOS DISPONÍVEIS:

1. FREQUÊNCIA:
   - Por aluno
   - Por turma
   - Por período
   - Gráfico de evolução

2. FINANCEIRO:
   - Receitas x Despesas
   - Por categoria
   - Inadimplência
   - Projeção

3. ALUNOS:
   - Ativos x Inativos
   - Por faixa
   - Novos x Cancelados
   - Tempo médio de permanência

4. CONVERSÃO (CRM):
   - Funil de leads
   - Taxa de conversão
   - Origem mais efetiva

EXPORTAÇÃO:
- PDF
- Excel/CSV
```

---

## 15. CONFIGURAÇÕES E FEATURE FLAGS

### Prompt 15.1 - Página de Configurações
```
Crie página de configurações (/configuracoes):

PARA ADMIN CT:

1. DADOS DO CT:
   - Editar nome, endereço, telefone
   - Upload de logo
   - CNPJ

2. MÓDULOS:
   - Ativar/desativar módulos do sistema

3. PERMISSÕES POR PERFIL:
   - Definir quais módulos cada role pode acessar

4. FINANCEIRO:
   - Dia de vencimento padrão
   - Valor padrão de mensalidade

5. USUÁRIOS:
   - Lista de usuários do CT
   - Adicionar novo usuário
   - Alterar role
   - Desativar

PARA SUPER ADMIN adicionar:

6. FEATURE FLAGS:
   - Listar flags
   - Ativar/desativar globalmente
   - Ativar para CTs específicos
```

### Prompt 15.2 - Gestão de CTs (Super Admin)
```
Crie página de gestão de CTs (/cts) para Super Admin:

LISTAGEM:
- Nome do CT
- Plano
- Status do pagamento
- Número de alunos
- Data de cadastro
- Ações

DETALHES DO CT:
- Informações gerais
- Estatísticas de uso
- Histórico de pagamentos
- Logs de acesso

AÇÕES:
- Novo CT
- Editar
- Alterar plano
- Suspender/reativar
- Enviar mensagem
```

---

## 16. REGRAS GLOBAIS DE UX

### Prompt 16.1 - Fallbacks e Estados Vazios
```
Implemente regra global para evitar telas vazias:

REGRAS:
1. Nenhuma rota pode resultar em tela preta/vazia
2. Nenhum clique pode travar sem resposta
3. Toda rota deve ter fallback

ESTADOS:

CARREGANDO:
- Skeleton loaders
- Spinner com mensagem

SEM DADOS:
- Ilustração/ícone
- Mensagem explicativa
- Ação sugerida (ex: "Cadastre seu primeiro aluno")

EM CONSTRUÇÃO:
- Ícone de construção
- Mensagem: "Módulo em desenvolvimento"
- Botão para voltar

ERRO:
- Mensagem de erro amigável
- Botão para tentar novamente
- Link para suporte

Criar componente reutilizável para cada estado.
```

### Prompt 16.2 - Links e Interatividade
```
Implemente regra de navegabilidade total:

REGRA:
Tudo que aparece como informação visual deve ser clicável e levar a um módulo relacionado.

ELEMENTOS QUE DEVEM SER CLICÁVEIS:
- Cards de dashboard → módulo correspondente
- KPIs/números → lista filtrada
- Linhas de tabela → detalhe do item
- Nomes de aluno → perfil do aluno
- Gráficos → relatório detalhado
- Alertas → ação relacionada
- Notificações → item mencionado

FEEDBACK VISUAL:
- Cursor pointer em itens clicáveis
- Hover com destaque (cor ou sombra)
- Transição suave (150-200ms)
- Animação de clique (scale)

Criar componente wrapper "ClickableCard" que:
- Recebe children
- Recebe rota de destino
- Aplica estilos de hover/active
- Navega ao clicar
```

### Prompt 16.3 - Gráficos e Visualização
```
Padronize os gráficos do sistema:

CORES:
Usar cores das faixas e do sistema:
- Azul (primary)
- Roxo (secondary)
- Verde (success)
- Amarelo (warning)
- Vermelho (destructive)
- Branca (com borda)
- Marrom
- Preta

REGRAS:
- Nunca usar gráficos monocromáticos
- Mínimo 2 cores por gráfico
- Legendas sempre visíveis
- Tooltips ao passar o mouse
- Responsivos

TIPOS RECOMENDADOS:
- Pizza: distribuição (máx 6 fatias)
- Barras: comparação
- Linha: evolução temporal
- Progress: meta/progresso

PARA FAIXAS:
Usar cores reais:
- branca: '#FFFFFF' (borda cinza)
- azul: '#2563EB'
- roxa: '#7C3AED'  
- marrom: '#92400E'
- preta: '#1F2937'
```

---

## 📝 NOTAS FINAIS

### Ordem Recomendada de Implementação:
1. Setup inicial e design system
2. Banco de dados (todas as tabelas)
3. Autenticação e roles
4. Layout e navegação
5. Dashboard por perfil
6. Módulo de Alunos
7. Módulo de Turmas
8. Módulo de Presença (com reconhecimento facial)
9. Módulo Financeiro
10. Demais módulos

### Dicas:
- Execute um prompt por vez
- Aguarde a execução completa antes do próximo
- Teste cada módulo antes de seguir
- Se algo não funcionar, corrija antes de continuar
- Mantenha as memórias do projeto atualizadas

### Memórias Recomendadas:
Após criar o projeto, adicione estas memórias em Settings > Manage Knowledge:

1. `project/overview` - Descrição do projeto
2. `tech/arquitetura-backend` - Stack técnica
3. `features/controle-acesso` - Níveis de acesso
4. `features/presenca-facial` - Fluxo de presença
5. `style/navigation-structure` - Estrutura de navegação
6. `style/interactivity-logic` - Regra de clicabilidade
7. `constraints/real-execution` - Sem simulações/mocks
