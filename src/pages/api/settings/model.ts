import type { APIRoute } from 'astro';
import { assertSupabase, supabase } from '../../../lib/db';
import { logActivity, requireUser } from '../../../lib/auth';

export const POST: APIRoute = async (context) => {
  const user = await requireUser(context);
  if (!user) return context.redirect('/login');

  const form = await context.request.formData();
  const modelName = String(form.get('model_name') || '').trim();
  const apiKey = String(form.get('api_key') || '').trim();
  const temperature = Number(form.get('temperature') || 0.7);
  const maxTokens = Number(form.get('max_tokens') || 1200);

  if (modelName) {
    const { error } = await supabase.from('llm_settings').insert({
      provider: 'openrouter',
      model_name: modelName,
      api_key: apiKey || null,
      temperature,
      max_tokens: maxTokens,
      active: true,
      is_default: false
    });
    assertSupabase(null, error);
    await logActivity('Save OpenRouter Setting', modelName, user.id);
  }

  return context.redirect('/settings');
};
