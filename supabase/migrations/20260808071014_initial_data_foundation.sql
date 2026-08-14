begin;

-- Keep implementation helpers out of the Data API surface. Business tables remain
-- in public because Supabase RLS and deliberate grants will govern their access.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- A database sequence makes default SKU allocation atomic across concurrent admin
-- sessions. A supplied SKU bypasses this default and is still protected by its
-- unique constraint.
create sequence private.product_sku_sequence
  as bigint
  start with 1
  increment by 1
  minvalue 1
  no cycle;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete restrict,
  role text not null default 'customer'
    check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.marketing_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  is_marketing_opted_in boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.intake_items (
  id uuid primary key default gen_random_uuid(),
  source_type text not null
    check (source_type in ('sell', 'donate')),
  destination text
    check (destination is null or destination in (
      'catalog',
      'community_donation',
      'textile_recycling'
    )),
  source_profile_id uuid references public.profiles(id) on delete set null,
  created_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  acquisition_cost numeric(12, 2),
  received_at date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint intake_items_acquisition_cost_matches_source_type check (
    (source_type = 'donate' and acquisition_cost is null)
    or (source_type = 'sell' and acquisition_cost is not null and acquisition_cost > 0)
  )
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  intake_item_id uuid not null unique
    references public.intake_items(id) on delete restrict,
  created_by_profile_id uuid not null
    references public.profiles(id) on delete restrict,
  sku text not null unique default (
    'RV-' || lpad(nextval('private.product_sku_sequence')::text, 6, '0')
  ) check (sku ~ '^RV-[0-9]{6,}$'),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (btrim(title) <> ''),
  description text,
  price numeric(12, 2) check (price is null or price > 0),
  brand text,
  garment_type text,
  color text,
  material_details text,
  size_label text,
  measurements jsonb check (
    measurements is null or jsonb_typeof(measurements) = 'object'
  ),
  condition_rating smallint check (condition_rating between 0 and 3),
  condition_notes text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'reserved', 'sold', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_publication_requirements check (
    status not in ('published', 'reserved', 'sold')
    or (
      description is not null and btrim(description) <> ''
      and price is not null
      and garment_type is not null and btrim(garment_type) <> ''
      and condition_rating is not null
      and published_at is not null
      and (
        (size_label is not null and btrim(size_label) <> '')
        or measurements is not null
      )
    )
  )
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  storage_key text not null unique check (btrim(storage_key) <> ''),
  alt_text text not null check (btrim(alt_text) <> ''),
  position integer not null check (position > 0),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  mime_type text not null check (mime_type in (
    'image/avif',
    'image/jpeg',
    'image/png',
    'image/webp'
  )),
  created_at timestamptz not null default now(),
  unique (product_id, position)
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  tag_group text not null check (tag_group in ('style', 'season')),
  position integer not null check (position > 0),
  is_filter_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tag_group, position)
);

create unique index tags_unique_name_per_group
  on public.tags (tag_group, lower(name));

create table public.product_tags (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete restrict,
  primary key (product_id, tag_id)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  title text not null check (btrim(title) <> ''),
  description text not null check (btrim(description) <> ''),
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  position integer not null check (position > 0),
  primary key (collection_id, product_id),
  unique (collection_id, position)
);

create table public.site_testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null check (btrim(author_name) <> ''),
  attribution text not null check (btrim(attribution) <> ''),
  quote text not null check (btrim(quote) <> ''),
  position integer not null check (position > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (position)
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create trigger marketing_preferences_set_updated_at
before update on public.marketing_preferences
for each row execute function private.set_updated_at();

create trigger intake_items_set_updated_at
before update on public.intake_items
for each row execute function private.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function private.set_updated_at();

create trigger tags_set_updated_at
before update on public.tags
for each row execute function private.set_updated_at();

create trigger collections_set_updated_at
before update on public.collections
for each row execute function private.set_updated_at();

create trigger site_testimonials_set_updated_at
before update on public.site_testimonials
for each row execute function private.set_updated_at();

-- Default-deny is intentional. The next security migration will add narrowly
-- scoped policies and safe public read contracts after the auth boundary exists.
alter table public.profiles enable row level security;
alter table public.marketing_preferences enable row level security;
alter table public.intake_items enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.tags enable row level security;
alter table public.product_tags enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;
alter table public.site_testimonials enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.marketing_preferences from anon, authenticated;
revoke all on table public.intake_items from anon, authenticated;
revoke all on table public.products from anon, authenticated;
revoke all on table public.product_images from anon, authenticated;
revoke all on table public.tags from anon, authenticated;
revoke all on table public.product_tags from anon, authenticated;
revoke all on table public.collections from anon, authenticated;
revoke all on table public.collection_products from anon, authenticated;
revoke all on table public.site_testimonials from anon, authenticated;

commit;
