create extension if not exists pgcrypto;
create type public.user_role as enum ('admin','dispatcher','driver','customer');
create type public.shipment_status as enum ('Order Placed','Picked Up','In Transit','Out for Delivery','Delivered','Exception');
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,full_name text not null,role public.user_role not null default 'customer');
create table public.shipments(id uuid primary key default gen_random_uuid(),tracking_number text unique not null,sender_name text not null,sender_address text not null default '',receiver_name text not null,receiver_email text not null default '',receiver_phone text not null default '',receiver_address text not null default '',origin_city text not null,origin_lat double precision not null,origin_lng double precision not null,destination_city text not null,destination_lat double precision not null,destination_lng double precision not null,current_lat double precision not null,current_lng double precision not null,weight_kg numeric(10,2),length_cm numeric(10,2),width_cm numeric(10,2),height_cm numeric(10,2),service_type text not null default 'Standard',status public.shipment_status not null default 'Order Placed',driver_id uuid references public.profiles(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.driver_locations(id bigint generated always as identity primary key,driver_id uuid not null references public.profiles(id),shipment_id uuid references public.shipments(id),latitude double precision not null,longitude double precision not null,accuracy_m double precision,recorded_at timestamptz not null default now());
create table public.delivery_proofs(shipment_id uuid primary key references public.shipments(id),signature_name text not null default '',notes text not null default '',photo_path text,delivered_at timestamptz,created_by uuid references public.profiles(id));
create table public.shipment_events(id bigint generated always as identity primary key,shipment_id uuid not null references public.shipments(id) on delete cascade,status public.shipment_status not null,location text not null default '',created_at timestamptz not null default now());
alter table public.shipments enable row level security;
alter table public.driver_locations enable row level security;
alter table public.delivery_proofs enable row level security;
alter table public.shipment_events enable row level security;

-- Tracking pages may read shipment progress; operational writes require a signed-in user.
create policy "Public shipment tracking" on public.shipments for select using (true);
create policy "Public shipment events" on public.shipment_events for select using (true);
create policy "Authenticated shipment writes" on public.shipments for all to authenticated using (true) with check (true);
create policy "Authenticated location writes" on public.driver_locations for insert to authenticated with check (true);
create policy "Authenticated location reads" on public.driver_locations for select to authenticated using (true);
create policy "Authenticated proof access" on public.delivery_proofs for all to authenticated using (true) with check (true);
create policy "Authenticated event writes" on public.shipment_events for all to authenticated using (true) with check (true);
