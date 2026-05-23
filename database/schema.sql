create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  name varchar(255) not null,
  password_hash varchar(255) not null,
  created_at timestamptz default now()
);

create table if not exists public.llm_settings (
  id uuid primary key default gen_random_uuid(),
  provider varchar(100) not null default 'openrouter',
  model_name varchar(255) not null,
  api_key text,
  temperature numeric(4,2) not null default 0.70,
  max_tokens integer not null default 1200,
  active boolean default true,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.buffer_accounts (
  id uuid primary key default gen_random_uuid(),
  profile_id varchar(255) not null,
  profile_name varchar(255) not null,
  access_token text,
  profile_type varchar(100) default 'threads',
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.prompt_templates (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  category varchar(100) not null,
  prompt text not null,
  active boolean default true,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  topic text not null,
  content text not null,
  status varchar(50) not null default 'draft',
  model_name varchar(255),
  target_audience varchar(255),
  writing_style varchar(255),
  language varchar(50),
  buffer_update_id varchar(255),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  profile_id varchar(255) not null,
  publish_at timestamptz not null,
  status varchar(50) not null default 'scheduled',
  created_at timestamptz default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  action varchar(255) not null,
  user_id uuid references public.users(id) on delete set null,
  detail text,
  created_at timestamptz default now()
);

alter table public.posts enable row level security;
alter table public.users enable row level security;
alter table public.llm_settings enable row level security;
alter table public.buffer_accounts enable row level security;
alter table public.prompt_templates enable row level security;
alter table public.schedules enable row level security;
alter table public.activity_logs enable row level security;

drop policy if exists "app can manage users" on public.users;
drop policy if exists "app can manage llm settings" on public.llm_settings;
drop policy if exists "app can manage buffer accounts" on public.buffer_accounts;
drop policy if exists "app can manage prompt templates" on public.prompt_templates;
drop policy if exists "app can manage posts" on public.posts;
drop policy if exists "app can manage schedules" on public.schedules;
drop policy if exists "app can manage activity logs" on public.activity_logs;

create policy "app can manage users" on public.users for all using (true) with check (true);
create policy "app can manage llm settings" on public.llm_settings for all using (true) with check (true);
create policy "app can manage buffer accounts" on public.buffer_accounts for all using (true) with check (true);
create policy "app can manage prompt templates" on public.prompt_templates for all using (true) with check (true);
create policy "app can manage posts" on public.posts for all using (true) with check (true);
create policy "app can manage schedules" on public.schedules for all using (true) with check (true);
create policy "app can manage activity logs" on public.activity_logs for all using (true) with check (true);

insert into public.llm_settings (provider, model_name, temperature, max_tokens, active, is_default)
select 'openrouter', 'openai/gpt-5', 0.70, 1200, true, true
where not exists (select 1 from public.llm_settings);

insert into public.prompt_templates (title, category, prompt, active, is_default)
select 'Threads edukatif ringkas', 'Educational Content',
       'Buat thread yang jelas, bernilai praktis, mudah dipahami, dan punya hook kuat. Pecah menjadi beberapa post pendek yang cocok untuk Threads.',
       true, true
where not exists (select 1 from public.prompt_templates);
