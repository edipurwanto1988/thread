import type { APIRoute } from 'astro';
import { assertSupabase, supabase } from '../../../lib/db';
import { requireUser } from '../../../lib/auth';
import { json, unauthorized } from '../../../lib/http';

export const GET: APIRoute = async (context) => {
  const user = await requireUser(context);
  if (!user) return unauthorized();

  const { data, error } = await supabase.from('posts').select('status');
  const rows = assertSupabase(data, error) || [];
  const stats = rows.reduce((result, row) => {
    result[row.status] = (result[row.status] || 0) + 1;
    return result;
  }, {} as Record<string, number>);

  return json({
    stats
  });
};
