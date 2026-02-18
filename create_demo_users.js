import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nczyfslurnepzrwirfir.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jenlmc2x1cm5lcHpyd2lyZmlyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTM4OTExMiwiZXhwIjoyMDg2OTY1MTEyfQ.Ia7ajpw7GW8BvshdEJjOotA0PHoFhlsMWtXGG2w6Guw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const DEMO_CT_ID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // UUID válido!

// Dados do CT de Demo (caso precise recriar)
const DEMO_CT_DATA = {
    id: DEMO_CT_ID,
    name: 'Dojo Digital Demo Gym',
    slug: 'demo-gym',
    subscription: 'enterprise',
    subscription_status: 'ativo',
    modules: { cantina: true, financeiro: true, crm: true, eventos: true },
    active: true
};

const demoUsers = [
    { email: 'demo.dono@bjjoss.com', password: 'password123', role: 'admin_ct', name: 'Mestre Demo (Dono)' },
    { email: 'demo.prof@bjjoss.com', password: 'password123', role: 'professor', name: 'Professor Demo' }
];

async function run() {
    console.log('--- SETUP AMBIENTE DEMO ---');

    // 1. Criar/Garantir CT de Demo
    console.log('Verificando CT de Demo...');
    const { error: ctError } = await supabase.from('cts').upsert(DEMO_CT_DATA);
    if (ctError) {
        console.error(`Erro crítico ao criar CT: ${ctError.message}`);
        if (ctError.code === '23505') console.log('CT Demo já existe (ignorando erro de duplicação).'); // 23505 = unique constraint violation?? Upsert deveria lidar.
        // Se o Upsert falhar por RLS (service role deve passar), então temos problema grave.
        // Mas upsert com ID fixo deve funcionar.
    } else {
        console.log('CT de Demo garantido.');
    }

    // 2. Criar Usuários
    for (const u of demoUsers) {
        console.log(`Processando usuário: ${u.email}...`);

        // A. Criar Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            email_confirm: true,
            user_metadata: { name: u.name }
        });

        let userId = authData?.user?.id;

        if (authError) {
            // Se user já existe, tentamos encontrá-lo
            console.log(`> Auth: ${authError.message}`);
            // Hack: Tentar logar para pegar o ID, ou listar users se tiver permissão
            // Como service_role, listUsers funciona.
            const { data: users, error: listError } = await supabase.auth.admin.listUsers();
            const existing = users?.users?.find(x => x.email === u.email);
            if (existing) {
                userId = existing.id;
                console.log(`> Usuário existente recuperado: ${userId}`);
            } else {
                console.error('> Falha fatal: Não consegui criar nem recuperar usuário.');
                continue;
            }
        } else {
            console.log(`> Novo usuário criado: ${userId}`);
        }

        // B. Criar Perfil (Vinculado ao CT)
        const { error: profileError } = await supabase.from('profiles').upsert({
            id: userId,
            user_id: userId, // Redundancia util
            ct_id: DEMO_CT_ID,
            email: u.email,
            name: u.name,
            bio: 'Usuário de Demonstração - BjjOss V1'
        });

        if (profileError) console.error(`> Erro Perfil: ${profileError.message}`);
        else console.log('> Perfil garantido.');

        // C. Atribuir Role (user_roles)
        // Tabela user_roles não tem unique constraint no user_id?
        // Vamos deletar antes de inserir para evitar duplicação se não tiver constraint
        await supabase.from('user_roles').delete().eq('user_id', userId);

        const { error: roleError } = await supabase.from('user_roles').insert({
            user_id: userId,
            role: u.role
        });

        if (roleError) console.error(`> Erro Role: ${roleError.message}`);
        else console.log(`> Role '${u.role}' atribuída.`);

        // D. Atualizar Metadados JWT (Fast-Track)
        const { error: metaError } = await supabase.auth.admin.updateUserById(
            userId,
            { app_metadata: { role: u.role } }
        );
        if (metaError) console.error(`> Erro Metadata: ${metaError.message}`);
        else console.log('> Metadados JWT atualizados.');

        console.log('---');
    }

    console.log('Setup Demo Concluído com Sucesso!');
}

run();
