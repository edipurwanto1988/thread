import type { APIRoute } from 'astro';
import { assertSupabase, supabase } from '../../../lib/db';
import { logActivity, setSession, verifyPassword } from '../../../lib/auth';

type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
};

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');

  const { data, error } = await supabase
    .from('users')
    .select('id, email, name, password_hash')
    .eq('email', email)
    .maybeSingle<UserRow>();
  const user = assertSupabase(data, error);

  if (!user || !verifyPassword(password, user.password_hash)) {
    return redirect('/login?error=1');
  }

  setSession(cookies, user.id);
  await logActivity('Login', `${user.email} masuk`, user.id);
  return redirect('/dashboard');
};
