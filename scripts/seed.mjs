import { randomUUID, scryptSync } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY/SUPABASE_SECRET_KEY wajib diisi di .env');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const email = process.env.ADMIN_EMAIL || 'admin@example.com';
const password = process.env.ADMIN_PASSWORD || 'admin12345';
const salt = randomUUID();
const hash = `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;

const { data: existing, error: readError } = await supabase
  .from('users')
  .select('id')
  .eq('email', email)
  .maybeSingle();

if (readError) {
  throw readError;
}

if (!existing) {
  const { error } = await supabase.from('users').insert({
    email,
    name: 'Administrator',
    password_hash: hash
  });

  if (error) {
    throw error;
  }
}

console.log(`Admin user ready: ${email} / ${password}`);
