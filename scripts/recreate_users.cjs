// ====================================================================
// RECRIAÇÃO DE USUÁRIOS VIA API ADMIN DO SUPABASE
// Usa service_role key para criar usuários da forma correta
// Execute: node scripts/recreate_users.cjs <SERVICE_ROLE_KEY>
// ====================================================================

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://nczyfslurnepzrwirfir.supabase.co";
const SERVICE_ROLE_KEY = process.argv[2];

if (!SERVICE_ROLE_KEY) {
    console.error('❌ Uso: node scripts/recreate_users.cjs <SERVICE_ROLE_KEY>');
    console.error('   Encontre a service_role key em: Supabase → Settings → API');
    process.exit(1);
}

// Admin client com service_role bypassa RLS e tem acesso total
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

const DEMO_USERS = [
    {
        email: 'super@bjjoss.com',
        password: '123456',
        name: 'Super Admin Global',
        role: 'super_admin',
        ct_id: null,
        id: 'd0eebc99-1111-4ef8-bb6d-6bb9bd380f00'
    },
    {
        email: 'admin@brasilia.com',
        password: '123456',
        name: 'Ricardo Silva',
        role: 'admin_ct',
        ct_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        id: 'd0eebc99-2222-4ef8-bb6d-6bb9bd380a11'
    },
    {
        email: 'prof@brasilia.com',
        password: '123456',
        name: 'Rodrigo Santos',
        role: 'professor',
        ct_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        id: 'd0eebc99-3333-4ef8-bb6d-6bb9bd380e11'
    },
    {
        email: 'atendente@brasilia.com',
        password: '123456',
        name: 'Maria Alves',
        role: 'atendente',
        ct_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        id: 'd0eebc99-4444-4ef8-bb6d-6bb9bd380d11'
    },
    {
        email: 'aluno@brasilia.com',
        password: '123456',
        name: 'João Aluno',
        role: 'aluno',
        ct_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        id: 'd0eebc99-5555-4ef8-bb6d-6bb9bd380c11'
    }
];

async function recreateUsers() {
    console.log('🔧 Recriando usuários Demo via API Admin...\n');

    for (const user of DEMO_USERS) {
        console.log(`📧 Processando: ${user.email}`);

        // 1. Deletar usuário existente (se houver)
        try {
            const { error: delErr } = await supabase.auth.admin.deleteUser(user.id);
            if (delErr && !delErr.message.includes('not found')) {
                console.log(`   ⚠️  Delete: ${delErr.message}`);
            } else {
                console.log(`   🗑️  Usuário anterior removido`);
            }
        } catch (e) {
            console.log(`   ⚠️  Delete skip: ${e.message}`);
        }

        // Pequena pausa para o banco processar
        await new Promise(r => setTimeout(r, 500));

        // 2. Criar usuário via API Admin (cria auth.users + auth.identities corretamente)
        const { data: created, error: createErr } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            user_metadata: { name: user.name },
            app_metadata: { role: user.role }
        });

        if (createErr) {
            console.log(`   ❌ Criação falhou: ${createErr.message}`);
            continue;
        }

        const newId = created.user.id;
        console.log(`   ✅ Criado! Novo ID: ${newId}`);

        // 3. Inserir/atualizar profile
        const { error: profErr } = await supabase
            .from('profiles')
            .upsert({
                id: newId,
                name: user.name,
                email: user.email,
                ct_id: user.ct_id
            }, { onConflict: 'id' });

        if (profErr) console.log(`   ⚠️  Profile: ${profErr.message}`);
        else console.log(`   👤 Profile criado`);

        // 4. Inserir role
        const { error: roleErr } = await supabase
            .from('user_roles')
            .upsert({ user_id: newId, role: user.role }, { onConflict: 'user_id,role' });

        if (roleErr) console.log(`   ⚠️  Role: ${roleErr.message}`);
        else console.log(`   🔑 Role: ${user.role}`);

        console.log();
    }

    // 5. Teste de login final
    console.log('='.repeat(50));
    console.log('\n🔐 Testando login...\n');

    // Usar anon client para testar
    const anonClient = createClient(SUPABASE_URL,
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jenlmc2x1cm5lcHpyd2lyZmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzODkxMTIsImV4cCI6MjA4Njk2NTExMn0.Bv6JHHPUlaAymCm5rKUwEdY0oOyIXs5T8nLcw9bMAKU'
    );

    const { data: loginData, error: loginErr } = await anonClient.auth.signInWithPassword({
        email: 'super@bjjoss.com',
        password: '123456'
    });

    if (loginErr) {
        console.log(`❌ Login ainda falha: ${loginErr.message}`);
    } else {
        console.log(`✅ LOGIN FUNCIONANDO! User: ${loginData.user.email}`);
        console.log('\n🎉 Sistema pronto para uso!');
    }
}

recreateUsers().catch(console.error);
