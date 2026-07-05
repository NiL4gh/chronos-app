-- ============================================================
-- Chronos — Supabase Schema
-- Run this once in the Supabase SQL Editor.
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Organizations ───────────────────────────────────────
create table public.organizations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  industry    text,
  timezone    text default 'UTC',
  created_at  timestamptz default now()
);

-- ─── Profiles ────────────────────────────────────────────
-- One row per auth.users entry. Created automatically via trigger.
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  org_id        uuid references public.organizations(id) on delete cascade,
  full_name     text,
  email         text,
  job_title     text,
  role          text not null default 'employee' check (role in ('admin', 'employee')),
  hourly_rate   numeric(10,2) default 0,
  avatar_url    text,
  status        text default 'active' check (status in ('active', 'idle', 'offline')),
  created_at    timestamptz default now()
);

-- ─── Projects ────────────────────────────────────────────
create table public.projects (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  name          text not null,
  client        text,
  description   text,
  status        text default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  color         text default '#8b5cf6',
  goal_type     text default 'weekly' check (goal_type in ('daily', 'weekly', 'monthly', 'project')),
  goal_hours    numeric(10,2) default 40,
  logged_hours  numeric(10,2) default 0,
  budget        numeric(12,2) default 0,
  spent         numeric(12,2) default 0,
  due_date      date,
  tags          text[] default '{}',
  created_by    uuid references public.profiles(id),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── Tasks ───────────────────────────────────────────────
create table public.tasks (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  project_id    uuid references public.projects(id) on delete set null,
  title         text not null,
  description   text,
  status        text default 'todo' check (status in ('todo', 'in-progress', 'done')),
  priority      text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assigned_to   uuid references public.profiles(id) on delete set null,
  created_by    uuid references public.profiles(id),
  time_logged   numeric(10,2) default 0,
  due_date      date,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- ─── Time Logs ───────────────────────────────────────────
-- started_at / ended_at are full timestamptz (fixes the string-math bug).
-- duration_hours is stored as a computed convenience column.
create table public.time_logs (
  id              uuid primary key default uuid_generate_v4(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  project_id      uuid references public.projects(id) on delete set null,
  task_id         uuid references public.tasks(id) on delete set null,
  description     text,
  started_at      timestamptz not null,
  ended_at        timestamptz,
  duration_hours  numeric(10,4),        -- stored on save, not computed live
  source          text not null default 'manual' check (source in ('auto', 'manual')),
  billable        boolean default true,
  tags            text[] default '{}',
  created_at      timestamptz default now()
);

-- ─── Invoices ────────────────────────────────────────────
create table public.invoices (
  id                  uuid primary key default uuid_generate_v4(),
  org_id              uuid not null references public.organizations(id) on delete cascade,
  invoice_number      text not null,
  project_id          uuid references public.projects(id) on delete set null,
  client_name         text,
  client_email        text,
  client_address      text,
  issue_date          date,
  due_date            date,
  status              text default 'draft' check (status in ('draft', 'pending', 'overdue', 'paid')),
  requires_signature  boolean default false,
  subtotal            numeric(12,2) default 0,
  tax                 numeric(12,2) default 0,
  total               numeric(12,2) default 0,
  notes               text,
  line_items          jsonb default '[]',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- ─── Triggers ────────────────────────────────────────────

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Revoke public execute on the trigger function (only fires internally)
revoke execute on function public.handle_new_user() from public, anon;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at before update on public.projects
  for each row execute procedure public.set_updated_at();
create trigger tasks_updated_at before update on public.tasks
  for each row execute procedure public.set_updated_at();
create trigger invoices_updated_at before update on public.invoices
  for each row execute procedure public.set_updated_at();

-- ─── Row-Level Security ───────────────────────────────────
-- Users can only see data that belongs to their organization.

alter table public.organizations enable row level security;
alter table public.profiles      enable row level security;
alter table public.projects      enable row level security;
alter table public.tasks         enable row level security;
alter table public.time_logs     enable row level security;
alter table public.invoices      enable row level security;

-- Helper: returns the org_id of the currently authenticated user
create or replace function public.my_org_id()
returns uuid 
language plpgsql 
security definer 
set search_path = public 
stable as $$
declare
  _org_id uuid;
begin
  select org_id into _org_id from public.profiles where id = auth.uid();
  return _org_id;
end;
$$;

-- Helper: returns the role of the currently authenticated user
create or replace function public.my_role()
returns text 
language plpgsql 
security definer 
set search_path = public 
stable as $$
declare
  _role text;
begin
  select role into _role from public.profiles where id = auth.uid();
  return _role;
end;
$$;

-- Only authenticated users should call these helpers (RLS policies use them)
revoke execute on function public.my_org_id() from public, anon;
grant execute on function public.my_org_id() to authenticated;
revoke execute on function public.my_role() from public, anon;
grant execute on function public.my_role() to authenticated;

-- Organizations:
-- Simplified flow (for testing phase): email confirmation disabled,
-- signUp returns immediate session. Client creates org + updates profile.
-- INSERT: any authenticated user can create an org (used by Signup + OnboardingWorkspace).
-- SELECT: authenticated org members can read their own org.
-- UPDATE: org admins can update org name/settings.
-- DELETE: none (handled manually via dashboard or future edge function).
--
-- For production hardening: disable INSERT policy, re-enable email confirmation,
-- deploy signup-handler edge function to create orgs via service_role.
create policy "org_insert" on public.organizations
  for insert
  to authenticated
  with check (true);

create policy "org_members_read" on public.organizations
  for select
  to authenticated
  using (id = public.my_org_id());

create policy "org_admin_update" on public.organizations
  for update
  to authenticated
  using (id = public.my_org_id() and public.my_role() = 'admin')
  with check (id = public.my_org_id() and public.my_role() = 'admin');

-- Profiles: members see all profiles in their org
create policy "org_members_see_profiles" on public.profiles
  for select using (org_id = public.my_org_id());

-- Profiles: users can update their own profile
create policy "own_profile_update" on public.profiles
  for update using (id = auth.uid());

-- Projects: all org members can read; only admins can write
create policy "org_read_projects" on public.projects
  for select using (org_id = public.my_org_id());

create policy "admin_write_projects" on public.projects
  for insert with check (org_id = public.my_org_id() and public.my_role() = 'admin');

create policy "admin_update_projects" on public.projects
  for update using (org_id = public.my_org_id() and public.my_role() = 'admin');

create policy "admin_delete_projects" on public.projects
  for delete using (org_id = public.my_org_id() and public.my_role() = 'admin');

-- Tasks: all org members can read; assigned user or admin can write
create policy "org_read_tasks" on public.tasks
  for select using (org_id = public.my_org_id());

create policy "org_write_tasks" on public.tasks
  for insert with check (org_id = public.my_org_id());

create policy "org_update_tasks" on public.tasks
  for update using (org_id = public.my_org_id() and (assigned_to = auth.uid() or public.my_role() = 'admin'));

-- Time logs: users see all org logs; write only own logs
create policy "org_read_logs" on public.time_logs
  for select using (org_id = public.my_org_id());

create policy "own_write_logs" on public.time_logs
  for insert with check (org_id = public.my_org_id() and user_id = auth.uid());

create policy "own_update_logs" on public.time_logs
  for update using (org_id = public.my_org_id() and user_id = auth.uid());

create policy "own_delete_logs" on public.time_logs
  for delete using (org_id = public.my_org_id() and user_id = auth.uid());

-- Invoices: admin only
create policy "admin_all_invoices" on public.invoices
  for all using (org_id = public.my_org_id() and public.my_role() = 'admin');

-- ─── Indexes ─────────────────────────────────────────────
create index on public.time_logs (org_id, user_id, started_at desc);
create index on public.time_logs (org_id, project_id);
create index on public.projects  (org_id, status);
create index on public.tasks     (org_id, project_id);
create index on public.profiles  (org_id);
