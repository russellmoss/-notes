-- Supabase Chat Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension if not enabled
create extension if not exists "pgcrypto";

-- Conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  archived_at timestamp with time zone
);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('system','user','assistant')),
  content text not null,
  created_at timestamp with time zone default now()
);

-- User memory (long-term summarized memory)
create table if not exists public.user_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  summary text not null,
  updated_at timestamp with time zone default now()
);

-- Indexes
create index if not exists idx_conversations_user on public.conversations(user_id);
create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_user_memory_user on public.user_memory(user_id);

-- Row Level Security
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.user_memory enable row level security;

-- Policies: users can access only their own records
-- Drop old policies if they exist (names must match exactly)
drop policy if exists "Users can manage their conversations" on public.conversations;
drop policy if exists "Users can manage their messages" on public.messages;
drop policy if exists "Users can manage their memory" on public.user_memory;

create policy "Users can manage their conversations" on public.conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their messages" on public.messages
  for all using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Users can manage their memory" on public.user_memory
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Updated timestamps
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

create trigger user_memory_set_updated_at
before update on public.user_memory
for each row execute function public.set_updated_at();
