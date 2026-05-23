import type { APIRoute } from 'astro';
import { assertSupabase, supabase } from '../../../lib/db';
import { logActivity, requireUser } from '../../../lib/auth';
import { badRequest, json, readJson, unauthorized } from '../../../lib/http';

export const POST: APIRoute = async (context) => {
  const user = await requireUser(context);
  if (!user) return unauthorized();

  const body = await readJson<{ id: string }>(context.request);
  const id = String(body.id || '');
  if (!id) return badRequest('ID post wajib diisi.');

  const { error } = await supabase.from('posts').update({ status: 'approved' }).eq('id', id);
  assertSupabase(null, error);
  await logActivity('Approve Content', id, user.id);
  return json({ ok: true });
};
