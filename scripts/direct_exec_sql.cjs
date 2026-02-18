const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Use uma variável de ambiente ou argumento para a conexão
const connectionString = process.env.DATABASE_URL || process.argv[3];

if (!connectionString) {
    console.error("❌ Configure DATABASE_URL ou passe a URL de conexão como 2º argumento");
    process.exit(1);
}

async function runSql() {
    const sqlFilePath = process.argv[2];
    const sql = fs.readFileSync(path.resolve(sqlFilePath), 'utf8');
    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 10000,
    });

    try {
        console.log(`🚀 Tentando conexão direta ao banco...`);
        await client.connect();
        console.log(`✅ Conectado! Executando: ${sqlFilePath}...`);
        await client.query(sql);
        console.log('✅ SQL executado com sucesso!');
    } catch (err) {
        console.error('❌ Erro:', err.message);
    } finally {
        await client.end();
    }
}

runSql();
