-- Cogito persistence schema
-- Run this file in Supabase SQL Editor after creating your project.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('quiz', 'flashcards')),
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  topic text not null,
  summary text,
  source_type text not null check (source_type in ('text', 'pdf', 'preset')),
  source_title text,
  item_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.generated_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  item_type text not null check (item_type in ('quiz', 'flashcard')),
  question text not null,
  answer text,
  hint text,
  options jsonb,
  correct_answer_index integer,
  explanation text,
  position integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.study_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null,
  total integer not null,
  percentage integer not null,
  answers jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.flashcard_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id uuid not null references public.generated_items(id) on delete cascade,
  status text not null check (status in ('mastered', 'needs_practice')),
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

alter table public.profiles enable row level security;
alter table public.study_sessions enable row level security;
alter table public.generated_items enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.flashcard_progress enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "Users can view own sessions" on public.study_sessions;
create policy "Users can view own sessions"
on public.study_sessions for select
using (auth.uid() = user_id);

drop policy if exists "Users can create own sessions" on public.study_sessions;
create policy "Users can create own sessions"
on public.study_sessions for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own sessions" on public.study_sessions;
create policy "Users can delete own sessions"
on public.study_sessions for delete
using (auth.uid() = user_id);

drop policy if exists "Users can view own generated items" on public.generated_items;
create policy "Users can view own generated items"
on public.generated_items for select
using (
  exists (
    select 1
    from public.study_sessions
    where study_sessions.id = generated_items.session_id
      and study_sessions.user_id = auth.uid()
  )
);

drop policy if exists "Users can create own generated items" on public.generated_items;
create policy "Users can create own generated items"
on public.generated_items for insert
with check (
  exists (
    select 1
    from public.study_sessions
    where study_sessions.id = generated_items.session_id
      and study_sessions.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own quiz attempts" on public.quiz_attempts;
create policy "Users can manage own quiz attempts"
on public.quiz_attempts for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own flashcard progress" on public.flashcard_progress;
create policy "Users can manage own flashcard progress"
on public.flashcard_progress for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
