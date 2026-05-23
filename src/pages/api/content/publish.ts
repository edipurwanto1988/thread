import type { APIRoute } from 'astro';
import { assertSupabase, supabase } from '../../../lib/db';
import { logActivity, requireUser } from '../../../lib/auth';
import { sendToBuffer } from '../../../lib/buffer';
import { badRequest, json, readJson, unauthorized } from '../../../lib/http';

type PostRow = {
  id: string;
  title: string;
  content: string;
};

export const POST: APIRoute = async (context) => {
  const user = await requireUser(context);
  if (!user) return unauthorized();

  const body = await readJson<{ id: string; profileId?: string }>(context.request);
  const id = String(body.id || '');
  if (!id) return badRequest('ID post wajib diisi.');

  const { data: post, error: postReadError } = await supabase
    .from('posts')
    .select('id, title, content')
    .eq('id', id)
    .maybeSingle<PostRow>();
  assertSupabase(post, postReadError);
  if (!post) return badRequest('Post tidak ditemukan.');

  try {
    const result = await sendToBuffer({ content: post.content, profileId: String(body.profileId || '') || undefined });
    const updateId = result?.updates?.[0]?.id || result?.update?.id || '';
    const { error } = await supabase.from('posts').update({ status: 'published', buffer_update_id: updateId }).eq('id', id);
    assertSupabase(null, error);
    await logActivity('Publish Content', post.title, user.id);
    return json({ ok: true, result });
  } catch (error) {
    const { error: updateError } = await supabase.from('posts').update({ status: 'failed' }).eq('id', id);
    assertSupabase(null, updateError);
    await logActivity('Publish Failed', `${post.title}: ${error instanceof Error ? error.message : 'unknown error'}`, user.id);
    return badRequest(error instanceof Error ? error.message : 'Publish gagal.');
  }
};
