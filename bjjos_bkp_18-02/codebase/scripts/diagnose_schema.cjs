const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://nczyfslurnepzrwirfir.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jenlmc2x1cm5lcHpyd2lyZmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzODkxMTIsImV4cCI6MjA4Njk2NTExMn0.Bv6JHHPUlaAymCm5rKUwEdY0oOyIXs5T8nLcw9bMAKU";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const REQUIRED_TABLES = [
  'cts',
  'profiles',
  'user_roles',
  'role_permissions',
  'students',
  'training_classes',
  'attendance_records',
  'attendance_students',
  'products',
  'financial_transactions',
  'leads',
  'audit_logs',
  'feature_flags'
];

async function diagnose() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO SCHEMA\n');
  console.log('='.repeat(50));

  // 1. Test each table
  console.log('\n📋 Verificando tabelas...\n');
  const results = [];

  for (const table of REQUIRED_TABLES) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`  ❌ ${table}: ${error.message}`);
        results.push({ table, status: 'ERROR', msg: error.message });
      } else {
        console.log(`  ✅ ${table}: OK (${count || 0} registros)`);
        results.push({ table, status: 'OK', count });
      }
    } catch (err) {
      console.log(`  ❌ ${table}: ${err.message}`);
      results.push({ table, status: 'CRASH', msg: err.message });
    }
  }

  // 2. Test auth login
  console.log('\n' + '='.repeat(50));
  console.log('\n🔐 Testando autenticação...\n');
  
  const testUsers = [
    { email: 'super@bjjoss.com', label: 'Super Admin' },
    { email: 'admin@brasilia.com', label: 'Admin CT' },
    { email: 'prof@brasilia.com', label: 'Professor' },
    { email: 'atendente@brasilia.com', label: 'Atendente' },
    { email: 'aluno@brasilia.com', label: 'Aluno' },
  ];

  for (const user of testUsers) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: '123456'
    });

    if (error) {
      console.log(`  ❌ ${user.label} (${user.email}): ${error.message}`);
    } else {
      console.log(`  ✅ ${user.label} (${user.email}): Login OK! UserID=${data.user.id}`);
      
      // Check if profile exists
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('id, name, email, ct_id')
        .eq('id', data.user.id)
        .single();

      if (profErr) {
        console.log(`     ⚠️  Perfil NÃO encontrado: ${profErr.message}`);
      } else {
        console.log(`     👤 Perfil: ${profile.name} | CT: ${profile.ct_id || 'N/A'}`);
      }

      // Check role
      const { data: roleData, error: roleErr } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();

      if (roleErr) {
        console.log(`     ⚠️  Role NÃO encontrada: ${roleErr.message}`);
      } else {
        console.log(`     🔑 Role: ${roleData.role}`);
      }

      // Sign out for next test
      await supabase.auth.signOut();
    }
  }

  // 3. Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 RESUMO:');
  const errors = results.filter(r => r.status !== 'OK');
  if (errors.length === 0) {
    console.log('  ✅ Todas as tabelas estão acessíveis!');
  } else {
    console.log(`  ❌ ${errors.length} tabela(s) com problema:`);
    errors.forEach(e => console.log(`     - ${e.table}: ${e.msg}`));
  }
}

diagnose().catch(console.error);
