const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://nczyfslurnepzrwirfir.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jenlmc2x1cm5lcHpyd2lyZmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzODkxMTIsImV4cCI6MjA4Njk2NTExMn0.Bv6JHHPUlaAymCm5rKUwEdY0oOyIXs5T8nLcw9bMAKU'
);

const users = [
    { email: 'super@bjjoss.com', label: 'Super Admin' },
    { email: 'admin@brasilia.com', label: 'Admin CT' },
    { email: 'prof@brasilia.com', label: 'Professor' },
    { email: 'atendente@brasilia.com', label: 'Atendente' },
    { email: 'aluno@brasilia.com', label: 'Aluno' },
];

async function run() {
    console.log('🔐 Testando login de todos os usuários Demo...\n');

    for (const u of users) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: u.email,
            password: '123456',
        });

        if (error) {
            console.log(`❌ ${u.label}: ${error.message}`);
            continue;
        }

        console.log(`✅ ${u.label} — Login OK!`);

        // Verificar profile
        const { data: profile, error: pErr } = await supabase
            .from('profiles')
            .select('id, name, ct_id')
            .eq('id', data.user.id)
            .single();

        if (pErr) console.log(`   ⚠️  Profile: ${pErr.message}`);
        else console.log(`   👤 Profile: ${profile.name} | CT: ${profile.ct_id || 'N/A'}`);

        // Verificar role
        const { data: role, error: rErr } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .single();

        if (rErr) console.log(`   ⚠️  Role: ${rErr.message}`);
        else console.log(`   🔑 Role: ${role.role}`);

        await supabase.auth.signOut();
        console.log();
    }

    console.log('✅ Teste concluído!');
}

run().catch(console.error);
