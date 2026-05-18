create table if not exists public.application_jobs (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  title text not null,
  url text not null,
  link_text text not null default 'Stelle öffnen',
  motivation text not null,
  applied boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 999,
  created_at timestamptz not null default now()
);

alter table public.application_jobs enable row level security;

drop policy if exists "application_jobs_select" on public.application_jobs;
drop policy if exists "application_jobs_insert" on public.application_jobs;
drop policy if exists "application_jobs_update" on public.application_jobs;
drop policy if exists "application_jobs_delete" on public.application_jobs;

create policy "application_jobs_select"
on public.application_jobs for select
to anon
using (true);

create policy "application_jobs_insert"
on public.application_jobs for insert
to anon
with check (true);

create policy "application_jobs_update"
on public.application_jobs for update
to anon
using (true)
with check (true);

create policy "application_jobs_delete"
on public.application_jobs for delete
to anon
using (true);

insert into public.application_jobs
  (label, title, url, link_text, motivation, applied, featured, sort_order)
values
  (
    'Link 1',
    'Automatisierung, IT und moderne Arbeitsweisen',
    'https://www.linkedin.com/jobs/collections/remote-jobs/?currentJobId=4410637889&discover=true',
    'LinkedIn-Stelle öffnen',
    'Ich möchte mich auf diese Stelle bewerben, weil ich bereits seit rund einem Jahr bei BITM arbeite und dort mit der Software EMMA von Wianco Automatisierungen aufbaue. Zusätzlich nutze ich KI-Agenten, um mich kontinuierlich weiterzuentwickeln, neue Lösungswege zu entdecken und über den eigenen Horizont hinauszudenken. Genau diese Mischung aus praktischer IT-Erfahrung, Automatisierung und Lernbereitschaft macht die Stelle für mich besonders passend.',
    false,
    true,
    1
  ),
  (
    'Link 2',
    'IT-Support mit direktem Anwenderkontakt',
    'https://de.indeed.com/cmp/Teledyne-Gmbh/jobs?jk=e5534ed499c6c4d7&start=0&clearPrefilter=1',
    'Teledyne bei Indeed öffnen',
    'Da ich mittlerweile rund ein Jahr bei BITM im IT-Support arbeite und dort viel praktische Erfahrung sammeln durfte, passt diese Stelle sehr gut zu meiner beruflichen Weiterentwicklung. Ich bin ein freundlicher, extrovertierter und einfühlsamer Mensch, der Kundenprobleme ernst nimmt, aufmerksam zuhört und erst zufrieden ist, wenn ein Problem gelöst oder zuverlässig an die richtige Person weitergegeben wurde.',
    false,
    false,
    2
  ),
  (
    'Link 3',
    'KI-Agenten, Prompting und kreative Problemlösung',
    'https://www.linkedin.com/jobs/search-results/?currentJobId=4410635227&eBP=NOT_ELIGIBLE_FOR_CHARGING&refId=ZfVvPDpexWup1dB1c%2FJtKw%3D%3D&trackingId=zQW6oLx0dATDMn5ZVRjZRw%3D%3D&keywords=KI&origin=JOBS_HOME_SEARCH_BUTTON',
    'KI-Stelle bei LinkedIn öffnen',
    'Diese Stelle passt gut zu mir, weil ich bereits Erfahrung mit KI-Agenten wie OpenClaw gesammelt habe. Ich nehme mir Zeit, Prompts detailliert, präzise und zielgerichtet umzusetzen. Gleichzeitig bringe ich eine kreative Ader mit, um Probleme auch außerhalb gewohnter Denkmuster zu lösen. Deshalb sehe ich in dieser Stelle eine sehr gute Verbindung zu meinen Fähigkeiten und Interessen.',
    false,
    false,
    3
  )
on conflict do nothing;
