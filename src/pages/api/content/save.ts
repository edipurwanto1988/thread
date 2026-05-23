import type { APIRoute } from 'astro';
import { assertSupabase, supabase } from '../../../lib/db';
import { logActivity, requireUser } from '../../../lib/auth';
import { badRequest, json, readJson, unauthorized } from '../../../lib/http';

type Payload = {
  title: string;
  topic: string;
  content: string;
  modelName: string;
};

export const POST: APIRoute = async (context) => {
  const user = await requireUser(context);
  if (!user) return unauthorized();

  const body = await readJson<Payload>(context.request);
  const title = String(body.title || '').trim();
  const content = String(body.content || '').trim();
  if (!title || !content) return badRequest('Judul dan konten wajib diisi.');

  const { error } = await supabase.from('posts').insert({
    title,
    topic: String(body.topic || title),
    content,
    status: 'draft',
    model_name: String(body.modelName || '')
  });
  assertSupabase(null, error);
  await logActivity('Save Draft', title, user.id);
  return json({ ok: true });
};
