import { assertSupabase, supabase } from './db';

type BufferAccount = {
  profile_id: string;
  profile_name: string;
  access_token: string | null;
};

export async function getBufferAccount(profileId?: string) {
  let request = supabase
    .from('buffer_accounts')
    .select('profile_id, profile_name, access_token')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1);

  if (profileId) {
    request = request.eq('profile_id', profileId);
  }

  const { data, error } = await request.maybeSingle<BufferAccount>();
  return assertSupabase(data, error);
}

export async function sendToBuffer(input: {
  content: string;
  profileId?: string;
  publishAt?: string;
}) {
  const account = await getBufferAccount(input.profileId);
  if (!account) {
    throw new Error('Akun Buffer belum dikonfigurasi.');
  }

  const token = account.access_token || process.env.BUFFER_ACCESS_TOKEN;
  if (!token) {
    throw new Error('BUFFER_ACCESS_TOKEN belum tersedia.');
  }

  const params = new URLSearchParams();
  params.set('text', input.content);
  params.append('profile_ids[]', account.profile_id);
  if (input.publishAt) {
    params.set('scheduled_at', input.publishAt);
  } else {
    params.set('now', 'true');
  }

  const response = await fetch('https://api.bufferapp.com/1/updates/create.json', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success === false) {
    throw new Error(`Buffer error ${response.status}: ${JSON.stringify(data).slice(0, 300)}`);
  }

  return data;
}
