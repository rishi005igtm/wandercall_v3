const { Client } = require('pg');

async function checkMetadata() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'anmol162004',
    database: 'postgres',
  });

  await client.connect();

  const res = await client.query(`
    SELECT "metadata" 
    FROM "chat_messages" 
    WHERE "type" = 'COMMUNITY_INVITE' 
    ORDER BY "createdAt" DESC 
    LIMIT 5;
  `);


  await client.end();
}

checkMetadata().catch(console.error);
