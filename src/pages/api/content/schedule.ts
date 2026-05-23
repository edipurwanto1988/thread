import type { APIRoute } from 'astro';
import { assertSupabase, supabase } from '../../../lib/db';
import { logActivity, requireUser } from '../../../lib/auth';
import { badRequest, json, readJson, unauthorized } from '../../../lib/http';

type Payload = {
  id: string;
  profileId: string;
  publishAt: string;
};

export const POST: APIRoute = async (context) => {
  const user = await requireUser(context);
  if (!user) return unauthorized();

  const body = await readJson<Payload>(context.request);
  const id = String(body.id || '');
  const profileId = String(body.profileId || '');
  const publishAt = String(body.publishAt || '');
  if (!id || !profileId || !publishAt) return badRequest('Post, profile, dan waktu publish wajib diisi.');

  const { error: scheduleError } = await supabase.from('schedules').insert({
    post_id: id,
    profile_id: profileId,
    publish_at: new Date(publishAt).toISOString(),
    status: 'scheduled'
  });
  assertSupabase(null, scheduleError);

  const { error: postError } = await supabase.from('posts').update({ status: 'scheduled' }).eq('id', id);
  assertSupabase(null, postError);
  await logActivity('Schedule Content', `${id} -> ${publishAt}`, user.id);
  return json({ ok: true });
};
