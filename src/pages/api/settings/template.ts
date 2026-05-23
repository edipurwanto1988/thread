import type { APIRoute } from 'astro';
import { assertSupabase, supabase } from '../../../lib/db';
import { logActivity, requireUser } from '../../../lib/auth';

export const POST: APIRoute = async (context) => {
  const user = await requireUser(context);
  if (!user) return context.redirect('/login');

  const form = await context.request.formData();
  const title = String(form.get('title') || '').trim();
  const category = String(form.get('category') || '').trim();
  const prompt = String(form.get('prompt') || '').trim();

  if (title && category && prompt) {
    const { error } = await supabase.from('prompt_templates').insert({
      title,
      category,
      prompt,
      active: true,
      is_default: false
    });
    assertSupabase(null, error);
    await logActivity('Save Prompt Template', title, user.id);
  }

  return context.redirect('/settings');
};
