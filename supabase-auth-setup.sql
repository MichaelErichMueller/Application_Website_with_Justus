create table if not exists public.allowed_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table public.allowed_emails enable row level security;
alter table public.application_jobs enable row level security;

drop policy if exists "application_jobs_select" on public.application_jobs;
drop policy if exists "application_jobs_insert" on public.application_jobs;
drop policy if exists "application_jobs_update" on public.application_jobs;
drop policy if exists "application_jobs_delete" on public.application_jobs;
drop policy if exists "application_jobs_select_allowed" on public.application_jobs;
drop policy if exists "application_jobs_insert_allowed" on public.application_jobs;
drop policy if exists "application_jobs_update_allowed" on public.application_jobs;
drop policy if exists "application_jobs_delete_allowed" on public.application_jobs;

create policy "application_jobs_select_allowed"
on public.application_jobs for select
to authenticated
using (
  exists (
    select 1
    from public.allowed_emails
    where lower(email) = lower(auth.jwt() ->> 'email')
  )
);

create policy "application_jobs_insert_allowed"
on public.application_jobs for insert
to authenticated
with check (
  exists (
    select 1
    from public.allowed_emails
    where lower(email) = lower(auth.jwt() ->> 'email')
  )
);

create policy "application_jobs_update_allowed"
on public.application_jobs for update
to authenticated
using (
  exists (
    select 1
    from public.allowed_emails
    where lower(email) = lower(auth.jwt() ->> 'email')
  )
)
with check (
  exists (
    select 1
    from public.allowed_emails
    where lower(email) = lower(auth.jwt() ->> 'email')
  )
);

create policy "application_jobs_delete_allowed"
on public.application_jobs for delete
to authenticated
using (
  exists (
    select 1
    from public.allowed_emails
    where lower(email) = lower(auth.jwt() ->> 'email')
  )
);

insert into public.allowed_emails (email)
values
  ('DEINE_EMAIL@example.com'),
  ('EMAIL_DER_ANDEREN_PERSON@example.com')
on conflict (email) do nothing;
