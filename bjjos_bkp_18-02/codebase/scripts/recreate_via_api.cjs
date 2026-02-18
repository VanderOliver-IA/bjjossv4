// ====================================================================
// RECRIAÇÃO VIA MANAGEMENT API (usa Personal Access Token)
// Execute: node scripts/recreate_via_api.cjs
// ====================================================================

const https = require('https');

const PROJECT_REF = 'nczyfslurnepzrwirfir';
const PAT = process.argv[2] || ''; // Forneça o Personal Access Token como argumento

const DEMO_USERS = [
    { email: 'super@bjjoss.com', password: '123456', name: 'Super Admin Global' },
    { email: 'admin@brasilia.com', password: '123456', name: 'Ricardo Silva' },
    { email: 'prof@brasilia.com', password: '123456', name: 'Rodrigo Santos' },
    { email: 'atendente@brasilia.com', password: '123456', name: 'Maria Alves' },
    { email: 'aluno@brasilia.com', password: '123456', name: 'João Aluno' },
];

function apiRequest(method, path, body) {
    return new Promise((resolve, reject) => {
        const data = body ? JSON.stringify(body) : null;
        const options = {
            hostname: 'api.supabase.com',
            path,
            method,
            headers: {
                'Authorization': `Bearer ${PAT}`,
                'Content-Type': 'application/json',
                ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: JSON.parse(responseData) });
                } catch {
                    resolve({ status: res.statusCode, body: responseData });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function run() {
    console.log('🔧 Testando conexão com Supabase Management API...\n');

    // Test connection
    const test = await apiRequest('GET', `/v1/projects/${PROJECT_REF}`);
    if (test.status !== 200) {
        console.error(`❌ Erro de autenticação (${test.status}):`, test.body);
        console.error('\nVerifique se o Personal Access Token está correto.');
        process.exit(1);
    }
    console.log(`✅ Conectado ao projeto: ${test.body.name}\n`);

    // List existing users
    console.log('👥 Buscando usuários existentes...');
    const usersResp = await apiRequest('GET', `/v1/projects/${PROJECT_REF}/auth/users?page=1&per_page=50`);

    if (usersResp.status !== 200) {
        console.error('❌ Erro ao buscar usuários:', usersResp.body);
        process.exit(1);
    }

    const existingUsers = usersResp.body.users || [];
    console.log(`   Encontrados: ${existingUsers.length} usuários\n`);

    for (const demo of DEMO_USERS) {
        console.log(`📧 Processando: ${demo.email}`);

        // Check if exists
        const existing = existingUsers.find(u => u.email === demo.email);

        if (existing) {
            // Update password
            const updateResp = await apiRequest(
                'PUT',
                `/v1/projects/${PROJECT_REF}/auth/users/${existing.id}`,
                {
                    password: demo.password,
                    email_confirm: true,
                    user_metadata: { name: demo.name }
                }
            );

            if (updateResp.status === 200) {
                console.log(`   ✅ Senha atualizada! ID: ${existing.id}`);
            } else {
                console.log(`   ❌ Erro ao atualizar: ${JSON.stringify(updateResp.body)}`);
            }
        } else {
            // Create new
            const createResp = await apiRequest(
                'POST',
                `/v1/projects/${PROJECT_REF}/auth/users`,
                {
                    email: demo.email,
                    password: demo.password,
                    email_confirm: true,
                    user_metadata: { name: demo.name }
                }
            );

            if (createResp.status === 200 || createResp.status === 201) {
                console.log(`   ✅ Criado! ID: ${createResp.body.id}`);
            } else {
                console.log(`   ❌ Erro ao criar: ${JSON.stringify(createResp.body)}`);
            }
        }
    }

    console.log('\n✅ Processo concluído! Teste o login agora.');
}

run().catch(console.error);
