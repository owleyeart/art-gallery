-- ============================================================
-- Newsletter Campaigns — Phase 2
-- ============================================================

create table if not exists public.newsletter_campaigns (
  id              uuid primary key default gen_random_uuid(),
  subject         text not null,
  body_html       text,
  body_text       text,
  status          text not null default 'draft'
                  check (status in ('draft', 'sending', 'sent', 'failed')),
  recipient_count integer,
  error_message   text,
  sent_at         timestamptz,
  sent_by         uuid references auth.users(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.newsletter_campaigns enable row level security;

-- Admin can manage campaigns
create policy "Admin manage campaigns" on public.newsletter_campaigns for all
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'system')
  ));

-- updated_at trigger
create trigger newsletter_campaigns_updated_at
  before update on public.newsletter_campaigns
  for each row execute procedure public.set_updated_at();

-- Allow admins to update subscriber active status (add missing policy)
create policy "Admin update subscribers" on public.newsletter_subscribers for update
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'system')
  ));

-- Allow admins to delete subscribers
create policy "Admin delete subscribers" on public.newsletter_subscribers for delete
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'system')
  ));
