-- ============================================================
-- Art Gallery — Initial Schema
-- ============================================================

-- Site configuration (singleton row, id = 1)
create table if not exists public.site_config (
  id                integer primary key default 1,
  site_name         text not null default 'Images Art Gallery',
  tagline           text default 'Where Art Comes Alive',
  about             text,
  logo_url          text,
  address           text default '7945 Marty St, Overland Park, KS 66204',
  phone             text,
  email             text,
  hours             text default 'Tue–Sat 11am–5pm',
  social_links      jsonb default '{}',
  color_primary     text default '#2d2d2d',
  color_secondary   text default '#6b4c8a',
  color_accent      text default '#c9a84c',
  color_surface     text default '#fafafa',
  font_heading      text default '''Georgia'', serif',
  font_body         text default '''Inter'', system-ui, sans-serif',
  google_calendar_id text,
  meta_description  text default 'A community art gallery showcasing local artists.',
  meta_keywords     text default 'art gallery, local art, artists',
  constraint site_config_singleton check (id = 1)
);

-- User roles (extends Supabase auth.users)
create table if not exists public.user_roles (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  role      text not null check (role in ('system', 'admin')),
  created_at timestamptz default now()
);

-- Artists / members
create table if not exists public.artists (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  headshot_url  text,
  bio           text,
  statement     text,
  medium        text,
  email         text,
  phone         text,
  social_links  jsonb default '{}',
  external_links jsonb default '[]',
  youtube_urls  jsonb default '[]',
  exhibit_title text,
  is_featured   boolean default false,
  is_active     boolean default true,
  sort_order    integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Artworks
create table if not exists public.artworks (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references public.artists(id) on delete cascade,
  title       text not null,
  medium      text,
  dimensions  text,
  price       numeric(10,2),
  image_url   text not null,
  description text,
  is_sold     boolean default false,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- Events
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  start_date  timestamptz not null,
  end_date    timestamptz,
  event_type  text default 'other'
              check (event_type in ('featured_friday','juried_show','farmers_market','art_fair','other')),
  location    text,
  image_url   text,
  is_recurring boolean default false,
  google_event_id text,
  created_at  timestamptz default now()
);

-- Newsletter subscribers
create table if not exists public.newsletter_subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  is_active     boolean default true,
  subscribed_at timestamptz default now()
);

-- Documents (file storage references)
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text default 'general',
  storage_path text not null,
  uploaded_by uuid references auth.users(id),
  created_at  timestamptz default now()
);

-- ============================================================
-- RLS Policies
-- ============================================================

alter table public.site_config          enable row level security;
alter table public.user_roles           enable row level security;
alter table public.artists              enable row level security;
alter table public.artworks             enable row level security;
alter table public.events               enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.documents            enable row level security;

-- site_config: public read, admin write
create policy "Public read site_config" on public.site_config for select using (true);
create policy "Admin update site_config" on public.site_config for update
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','system')));

-- artists: public read, admin write
create policy "Public read artists" on public.artists for select using (is_active = true);
create policy "Admin manage artists" on public.artists for all
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','system')));

-- artworks: public read, admin write
create policy "Public read artworks" on public.artworks for select using (true);
create policy "Admin manage artworks" on public.artworks for all
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','system')));

-- events: public read, admin write
create policy "Public read events" on public.events for select using (true);
create policy "Admin manage events" on public.events for all
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','system')));

-- newsletter: public insert, admin read
create policy "Public subscribe" on public.newsletter_subscribers for insert with check (true);
create policy "Admin read subscribers" on public.newsletter_subscribers for select
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','system')));

-- documents: admin only
create policy "Admin manage documents" on public.documents for all
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role in ('admin','system')));

-- user_roles: system only
create policy "System manage roles" on public.user_roles for all
  using (exists (select 1 from public.user_roles where user_id = auth.uid() and role = 'system'));

-- ============================================================
-- Seed: singleton site_config row
-- ============================================================
insert into public.site_config (id) values (1) on conflict do nothing;

-- updated_at trigger for artists
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger artists_updated_at before update on public.artists
  for each row execute procedure public.set_updated_at();
