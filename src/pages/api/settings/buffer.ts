import type { APIRoute } from 'astro';
import { assertSupabase, supabase } from '../../../lib/db';
import { logActivity, requireUser } from '../../../lib/auth';

export const POST: APIRoute = async (context) => {
  const user = await requireUser(context);
  if (!user) return context.redirect('/login');

  const form = await context.request.formData();
  const profileId = String(form.get('profile_id') || '').trim();
  const profileName = String(form.get('profile_name') || '').trim();
  const profileType = String(form.get('profile_type') || 'threads').trim();
  const accessToken = String(form.get('access_token') || '').trim();

  if (profileId && profileName) {
    const { error } = await supabase.from('buffer_accounts').insert({
      profile_id: profileId,
      profile_name: profileName,
      access_token: accessToken || null,
      profile_type: profileType,
      active: true
    });
    assertSupabase(null, error);
    await logActivity('Save Buffer Account', profileName, user.id);
  }

  return context.redirect('/settings');
};
