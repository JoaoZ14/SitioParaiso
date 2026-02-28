-- ============================================================
-- SÍTIO PARAÍSO — Setup do banco de dados no Supabase
-- Execute este script no SQL Editor do seu projeto Supabase
-- (https://supabase.com/dashboard → SQL Editor → New query)
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- TABELAS
-- ──────────────────────────────────────────────────────────

create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  content     text not null default '',
  tag         text not null default 'Ideia'
                check (tag in ('Ideia', 'Compra', 'Reforma', 'Lembrete')),
  created_at  timestamptz not null default now()
);

create table if not exists public.animals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  type        text not null,
  name        text not null,
  qty         integer not null default 1,
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists public.costs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  item        text not null,
  category    text not null default 'Outros'
                check (category in ('Construção','Animais','Ferramentas','Jardim/Horta','Documentação','Outros')),
  value       numeric(12,2) not null default 0,
  priority    text not null default 'Média'
                check (priority in ('Alta','Média','Baixa')),
  created_at  timestamptz not null default now()
);

-- finance: um registro por usuário (upsert pelo user_id)
create table if not exists public.finance (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null unique,
  saved       numeric(12,2) not null default 0,
  goal        numeric(12,2) not null default 0,
  updated_at  timestamptz not null default now()
);

-- ──────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- Cada usuário vê e edita apenas os próprios dados
-- ──────────────────────────────────────────────────────────

alter table public.notes   enable row level security;
alter table public.animals enable row level security;
alter table public.costs   enable row level security;
alter table public.finance enable row level security;

-- NOTES
create policy "notes: select own"  on public.notes for select using (auth.uid() = user_id);
create policy "notes: insert own"  on public.notes for insert with check (auth.uid() = user_id);
create policy "notes: update own"  on public.notes for update using (auth.uid() = user_id);
create policy "notes: delete own"  on public.notes for delete using (auth.uid() = user_id);

-- ANIMALS
create policy "animals: select own" on public.animals for select using (auth.uid() = user_id);
create policy "animals: insert own" on public.animals for insert with check (auth.uid() = user_id);
create policy "animals: update own" on public.animals for update using (auth.uid() = user_id);
create policy "animals: delete own" on public.animals for delete using (auth.uid() = user_id);

-- COSTS
create policy "costs: select own" on public.costs for select using (auth.uid() = user_id);
create policy "costs: insert own" on public.costs for insert with check (auth.uid() = user_id);
create policy "costs: update own" on public.costs for update using (auth.uid() = user_id);
create policy "costs: delete own" on public.costs for delete using (auth.uid() = user_id);

-- FINANCE
create policy "finance: select own" on public.finance for select using (auth.uid() = user_id);
create policy "finance: insert own" on public.finance for insert with check (auth.uid() = user_id);
create policy "finance: update own" on public.finance for update using (auth.uid() = user_id);
create policy "finance: delete own" on public.finance for delete using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- GALERIA
-- ──────────────────────────────────────────────────────────

-- Tabela de metadados das imagens
create table if not exists public.gallery_images (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  storage_path text not null,           -- caminho no bucket: "user_id/filename"
  caption     text not null default '',
  created_at  timestamptz not null default now()
);

alter table public.gallery_images enable row level security;

create policy "gallery: select own" on public.gallery_images for select using (auth.uid() = user_id);
create policy "gallery: insert own" on public.gallery_images for insert with check (auth.uid() = user_id);
create policy "gallery: delete own" on public.gallery_images for delete using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- STORAGE — bucket "gallery"
-- Execute separadamente no SQL Editor se necessário
-- ──────────────────────────────────────────────────────────

-- Cria o bucket como privado (acesso via signed URL)
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', false)
on conflict (id) do nothing;

-- Permite ao usuário autenticado fazer upload na pasta dele
create policy "gallery storage: upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'gallery'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permite ao usuário ler suas próprias imagens
create policy "gallery storage: read own"
  on storage.objects for select
  using (
    bucket_id = 'gallery'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permite ao usuário deletar suas próprias imagens
create policy "gallery storage: delete own"
  on storage.objects for delete
  using (
    bucket_id = 'gallery'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ──────────────────────────────────────────────────────────
-- FOTOS DO CASAL
-- ──────────────────────────────────────────────────────────

create table if not exists public.couple_photos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  storage_path text not null,
  caption      text not null default '',
  taken_at     date,                        -- data em que a foto foi tirada (opcional)
  created_at   timestamptz not null default now()
);

alter table public.couple_photos enable row level security;

create policy "couple: select own" on public.couple_photos for select using (auth.uid() = user_id);
create policy "couple: insert own" on public.couple_photos for insert with check (auth.uid() = user_id);
create policy "couple: delete own" on public.couple_photos for delete using (auth.uid() = user_id);

-- Bucket "couple-photos" (privado, acesso via signed URL)
insert into storage.buckets (id, name, public)
values ('couple-photos', 'couple-photos', false)
on conflict (id) do nothing;

create policy "couple storage: upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'couple-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "couple storage: read own"
  on storage.objects for select
  using (
    bucket_id = 'couple-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "couple storage: delete own"
  on storage.objects for delete
  using (
    bucket_id = 'couple-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ──────────────────────────────────────────────────────────
-- ÍNDICES para performance
-- ──────────────────────────────────────────────────────────

create index if not exists notes_user_id_idx   on public.notes(user_id);
create index if not exists animals_user_id_idx on public.animals(user_id);
create index if not exists costs_user_id_idx   on public.costs(user_id);
create index if not exists finance_user_id_idx on public.finance(user_id);
create index if not exists gallery_user_id_idx  on public.gallery_images(user_id);
create index if not exists couple_user_id_idx   on public.couple_photos(user_id);
