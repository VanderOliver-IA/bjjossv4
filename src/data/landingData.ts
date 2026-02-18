import { Archive, ShieldCheck, Users, Zap, TrendingUp, DollarSign, Camera, Sword, Heart } from 'lucide-react';

export const PLANS = [
    {
        id: 'starter',
        name: 'Faixa Branca',
        price: '49,90',
        description: 'Para professores independentes que querem organizar suas turmas.',
        features: ['Até 50 Alunos', 'Chamada por Foto (IA Básica)', 'Gestão de Graduação', 'Link de Pagamento'],
        cta: 'Começar Grátis',
        highlight: false
    },
    {
        id: 'pro',
        name: 'Black Belt',
        price: '149,90',
        description: 'Gestão completa para Academias e CTs em crescimento.',
        features: ['Alunos Ilimitados', 'Chamada IA Ilimitada', 'Financeiro Completo', 'Cantina & Estoque', 'CRM de Vendas', 'Site da Academia'],
        cta: 'Teste Grátis 7 Dias',
        highlight: true,
        badge: 'Mais Popular'
    },
    {
        id: 'enterprise',
        name: 'Alliance',
        price: 'Sob Consulta',
        description: 'Para grandes redes e franquias que precisam de escala.',
        features: ['Multi-Unidades', 'API Aberta', 'Gerente de Conta', 'Whitelabel (Sua Marca)', 'Relatórios de Rede'],
        cta: 'Falar com Consultor',
        highlight: false
    }
];

export const TESTIMONIALS = [
    {
        name: 'Mestre Renzo',
        role: 'Líder da Gracie Barra Centro',
        image: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=2670&auto=format&fit=crop',
        text: '“Antes eu perdia 20 minutos por aula fazendo chamada no papel. Com o BjjOss, tiro uma foto e o sistema marca a presença de 40 alunos em 3 segundos. Surreal.”'
    },
    {
        name: 'Prof. Amanda',
        role: 'Checkmat Ladies',
        image: 'https://images.unsplash.com/photo-1620026210207-e03445e9a4f6?q=80&w=2669&auto=format&fit=crop',
        text: '“A Cantina se pagou no primeiro mês. O sistema avisa quando o açaí tá acabando e cobra o aluno no cartão cadastrado. Organização é outra vida.”'
    },
    {
        name: 'Sensei Roberto',
        role: 'Alliance Project',
        image: 'https://images.unsplash.com/photo-1583476346985-7096e1ec82c4?q=80&w=2574&auto=format&fit=crop',
        text: '“O financeiro automático salvou minha academia. A inadimplência caiu de 30% para zero porque o sistema não deixa o aluno treinar se tiver devendo.”'
    }
];

export const FAQ = [
    {
        q: 'Como funciona a chamada por foto?',
        a: 'Nossa IA analisa a foto do tatame, identifica os rostos dos alunos cadastrados e marca presença automaticamente. Funciona mesmo com kimono bagunçado!'
    },
    {
        q: 'Preciso instalar algum programa?',
        a: 'Não. O BjjOss é 100% online. Funciona no seu celular, tablet ou computador, de qualquer lugar.'
    },
    {
        q: 'Meus dados estão seguros?',
        a: 'Sim. Usamos criptografia de ponta a ponta e servidores seguros (os mesmos da NASA). Seus alunos e financeiro são blindados.'
    },
    {
        q: 'Posso cancelar quando quiser?',
        a: 'Claro. Sem fidelidade, sem letras miúdas. Se não gostar, cancela com um clique.'
    }
];
