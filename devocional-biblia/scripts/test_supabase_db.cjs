const { Client } = require('pg');

const client = new Client({
  host: 'db.chbfnwrhnklwbylzjjrc.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'GbwjL3&fcEdw+4@',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  
  const res = await client.query(`
    SELECT name, setting 
    FROM pg_settings 
    WHERE name LIKE '%jwt%' OR name LIKE '%auth%' OR name LIKE '%postgrest%'
    ORDER BY name;
  `);
  console.log('Settings:', res.rows);
  
  await client.end();
}

main().catch(err => {
  console.error('Erro:', err);
  client.end();
});
