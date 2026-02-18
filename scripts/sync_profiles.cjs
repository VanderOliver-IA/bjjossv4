const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://nczyfslurnepzrwirfir.supabase.co";
const SERVICE_ROLE = process.argv[2]; // Use a service_role key como argumento

if (!SERVICE_ROLE) {
    console.error("❌ Forneça a service_role como argumento");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

const MAPPING = [
    { email: 'super@bjjoss.com', name: 'Super Admin', role: 'super_admin', ct: null },
    { email: 'admin@brasilia.com', name: 'Ricardo Silva', role: 'admin_ct', ct: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    { email: 'prof@brasilia.com', name: 'Rodrigo Santos', role: 'professor', ct: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    { email: 'atendente@brasilia.com', name: 'Maria Alves', role: 'atendente', ct: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
    { email: 'aluno@brasilia.com', name: 'João Aluno', role: 'aluno', ct: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }
];

async function sync() {
    console.log('🔄 Sincronizando Perfis e Roles...\n');

    const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();
    if (uError) throw uError;

    for (const item of MAPPING) {
        const user = users.find(u => u.email === item.email);
        if (!user) {
            console.log(`❌ Usuário não encontrado no Auth: ${item.email}`);
            continue;
        }

        console.log(`👤 Sincronizando: ${item.email} (ID: ${user.id})`);

        // 1. Upsert Profile
        const { error: pErr } = await supabase.from('profiles').upsert({
            id: user.id,
            name: item.name,
            email: item.email,
            ct_id: item.ct
        });
        if (pErr) console.log(`   ⚠️ Erro Profile: ${pErr.message}`);

        // 2. Upsert Role
        const { error: rErr } = await supabase.from('user_roles').upsert({
            user_id: user.id,
            role: item.role
        });
        if (rErr) console.log(`   ⚠️ Erro Role: ${rErr.message}`);
    }

    console.log('\n✅ Sincronização concluída!');
}

sync().catch(console.error);
