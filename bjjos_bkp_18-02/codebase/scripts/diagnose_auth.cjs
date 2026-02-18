const { Client } = require('pg');
const dns = require('dns');

const HOST = 'db.nczyfslurnepzrwirfir.supabase.co';
const PASS = 'Bjj2026#Oss';
const USER = 'postgres';
const DB = 'postgres';

async function diagnoseAuth() {
  console.log('🔍 Iniciando Diagnóstico de Dados de Autenticação...');

  const ip = await new Promise((resolve, reject) => {
    dns.lookup(HOST, 4, (err, address) => {
      if (err) resolve(HOST); // Fallback to hostname
      else resolve(address);
    });
  });

  const client = new Client({
    host: ip,
    port: 5432,
    user: USER,
    password: PASS,
    database: DB,
    ssl: { rejectUnauthorized: false, servername: HOST }
  });

  try {
    await client.connect();
    
    // 1. Verificar usuários em auth.users
    const authUsers = await client.query('SELECT id, email FROM auth.users');
    console.log(`\n👥 Usuários em auth.users: ${authUsers.rowCount}`);
    authUsers.rows.forEach(u => console.log(` - ID: ${u.id} | Email: ${u.email}`));

    // 2. Verificar perfis vinculados
    const profiles = await client.query('SELECT user_id, email, name FROM public.profiles');
    console.log(`\n👤 Perfis em public.profiles: ${profiles.rowCount}`);
    profiles.rows.forEach(p => console.log(` - UserID: ${p.user_id} | Email: ${p.email} | Name: ${p.name}`));

    // 3. Verificar roles
    const roles = await client.query('SELECT user_id, role FROM public.user_roles');
    console.log(`\n🔐 Roles atribuídas: ${roles.rowCount}`);
    roles.rows.forEach(r => console.log(` - UserID: ${r.user_id} | Role: ${r.role}`));

    if (authUsers.rowCount === 0) {
        console.log('\n❌ ERRO: O Banco está vazio! O script de SEED não funcionou ou não foi executado.');
    }

  } catch (err) {
    console.error('\n❌ Erro na conexão de diagnóstico:', err.message);
  } finally {
    await client.end();
  }
}

diagnoseAuth();
