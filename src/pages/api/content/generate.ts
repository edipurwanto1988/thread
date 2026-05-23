import type { APIRoute } from 'astro';
import { assertSupabase, supabase } from '../../../lib/db';
import { logActivity, requireUser } from '../../../lib/auth';
import { badRequest, json, readJson, unauthorized } from '../../../lib/http';
import { generateThread } from '../../../lib/openrouter';

type Payload = {
  topic: string;
  language: string;
  style: string;
  targetAudience: string;
  totalPosts: string;
  model: string;
  templateId: string;
};

export const POST: APIRoute = async (context) => {
  const user = await requireUser(context);
  if (!user) return unauthorized();

  const body = await readJson<Payload>(context.request);
  const topic = String(body.topic || '').trim();
  if (!topic) return badRequest('Topik wajib diisi.');

  const { data: template, error: templateError } = await supabase
    .from('prompt_templates')
    .select('prompt')
    .eq('id', String(body.templateId || ''))
    .maybeSingle<{ prompt: string }>();
  assertSupabase(template, templateError);
  if (!template) return badRequest('Prompt template tidak ditemukan.');

  try {
    const result = await generateThread({
      topic,
      language: String(body.language || 'id'),
      style: String(body.style || 'casual'),
      targetAudience: String(body.targetAudience || ''),
      totalPosts: Number(body.totalPosts || 5),
      promptTemplate: template.prompt,
      modelName: String(body.model || '')
    });
    await logActivity('Generate Content', `Topik: ${topic}`, user.id);
    return json(result);
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Generate gagal.');
  }
};
