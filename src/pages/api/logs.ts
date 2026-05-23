import type { APIRoute } from 'astro';
import { assertSupabase, supabase } from '../../lib/db';
import { requireUser } from '../../lib/auth';
import { json, unauthorized } from '../../lib/http';

export const GET: APIRoute = async (context) => {
  const user = await requireUser(context);
  if (!user) return unauthorized();

  const { data, error } = await supabase
    .from('activity_logs')
    .select('action, detail, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  const logs = assertSupabase(data, error) || [];
  return json({ logs });
};
