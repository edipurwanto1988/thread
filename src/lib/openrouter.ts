import { assertSupabase, supabase } from './db';

type LlmRow = {
  model_name: string;
  api_key: string | null;
  temperature: string | number;
  max_tokens: number;
};

export type OpenRouterModel = {
  id: string;
  name: string;
  context_length?: number;
  pricing?: {
    prompt?: string;
    completion?: string;
    request?: string;
    image?: string;
    web_search?: string;
    internal_reasoning?: string;
  };
};

function pricePerMillion(value?: string) {
  if (!value) return null;
  const price = Number(value);
  if (!Number.isFinite(price)) return null;
  return price * 1_000_000;
}

export function formatModelPrice(value?: string) {
  const price = pricePerMillion(value);
  if (price === null) return '-';
  if (price === 0) return 'Free';
  return `$${price.toLocaleString('en-US', {
    minimumFractionDigits: price < 1 ? 4 : 2,
    maximumFractionDigits: price < 1 ? 4 : 2
  })}`;
}

export async function listOpenRouterModels() {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`OpenRouter models error ${response.status}`);
  }

  const data = await response.json();
  const models = Array.isArray(data?.data) ? data.data : [];

  return models
    .map((model: Partial<OpenRouterModel>) => ({
      id: String(model.id || ''),
      name: String(model.name || model.id || ''),
      context_length: model.context_length,
      pricing: model.pricing || {}
    }))
    .filter((model: OpenRouterModel) => model.id)
    .sort((a: OpenRouterModel, b: OpenRouterModel) => a.name.localeCompare(b.name));
}

export async function getDefaultModel(modelName?: string) {
  if (modelName) {
    const { data, error } = await supabase
      .from('llm_settings')
      .select('model_name, api_key, temperature, max_tokens')
      .eq('active', true)
      .eq('model_name', modelName)
      .limit(1)
      .maybeSingle<LlmRow>();

    const selected = assertSupabase(data, error);
    if (selected) return selected;
  }

  const { data, error } = await supabase
    .from('llm_settings')
    .select('model_name, api_key, temperature, max_tokens')
    .eq('active', true)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle<LlmRow>();

  return assertSupabase(data, error);
}

export async function generateThread(input: {
  topic: string;
  language: string;
  style: string;
  targetAudience: string;
  totalPosts: number;
  promptTemplate: string;
  modelName?: string;
}) {
  const model = await getDefaultModel(input.modelName);
  if (!model) {
    throw new Error('Model OpenRouter belum dikonfigurasi.');
  }

  const apiKey = model.api_key || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY belum tersedia.');
  }

  const prompt = [
    input.promptTemplate,
    '',
    `Topik: ${input.topic}`,
    `Target audience: ${input.targetAudience || 'umum'}`,
    `Gaya tulisan: ${input.style || 'casual'}`,
    `Bahasa: ${input.language || 'id'}`,
    `Jumlah post: ${input.totalPosts}`,
    '',
    'Formatkan output sebagai daftar Post #1, Post #2, dan seterusnya. Tiap post harus ringkas, natural, dan siap dipakai di Threads.'
  ].join('\n');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
      'http-referer': process.env.PUBLIC_APP_URL || 'http://localhost:4321',
      'x-title': 'AI Threads Content Generator'
    },
    body: JSON.stringify({
      model: model.model_name,
      temperature: Number(model.temperature),
      max_tokens: model.max_tokens,
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah social media strategist untuk Threads. Tulis konten yang jelas, bernilai, dan tidak bertele-tele.'
        },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OpenRouter error ${response.status}: ${detail.slice(0, 300)}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenRouter tidak mengembalikan konten.');
  }

  return {
    content: String(content).trim(),
    modelName: model.model_name
  };
}
