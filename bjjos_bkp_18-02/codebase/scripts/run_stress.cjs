const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dns = require('dns');

const HOST = 'db.nczyfslurnepzrwirfir.supabase.co';
const PASS = 'Bjj2026#Oss';
const USER = 'postgres';
const DB = 'postgres';

async function runSeed() {
    console.log('🔥 Injetando Mega Stress Seed...');

    const ip = await new Promise((resolve, reject) => {
        dns.lookup(HOST, 4, (err, address) => {
            if (err) reject(err);
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
        const sqlPath = path.join(__dirname, 'MEGA_STRESS_SEED.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Removemos console_log do PL/pgSQL que pode dar erro se não definido
        const cleanedSql = sql.replace("console_log('Iniciando Injeção de dados de stress...');", "");

        await client.query(cleanedSql);
        console.log('✅ Dados de stress injetados com sucesso!');
    } catch (err) {
        console.error('❌ Erro no seed de stress:', err);
    } finally {
        await client.end();
    }
}

runSeed();
