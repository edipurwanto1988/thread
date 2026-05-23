import { readFile } from 'node:fs/promises';
import pg from 'pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL wajib diisi di .env');
}

const sql = await readFile(new URL('../database/schema.sql', import.meta.url), 'utf8');
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

await client.connect();
try {
  await client.query(sql);
  console.log('Supabase schema migration complete.');
} finally {
  await client.end();
}
