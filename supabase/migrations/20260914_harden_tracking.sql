-- Apply in Supabase SQL Editor before using real customer data.
-- This migration keeps tracking-number lookup public while hiding private shipment columns.

create or replace view public.public_tracking_shipments as
select id, tracking_number, origin_city, destination_city,
       current_lat, current_lng, status, created_at, updated_at
from public.shipments;

create or replace view public.public_tracking_events as
select shipment_id, status, location, created_at
from public.shipment_events;

grant select on public.public_tracking_shipments to anon, authenticated;
grant select on public.public_tracking_events to anon, authenticated;
revoke all on public.shipments from anon;
revoke all on public.shipment_events from anon;

-- Remove the permissive policies from the initial schema.
drop policy if exists "Public shipment tracking" on public.shipments;
drop policy if exists "Public shipment events" on public.shipment_events;
drop policy if exists "Authenticated shipment writes" on public.shipments;
drop policy if exists "Authenticated location writes" on public.driver_locations;
drop policy if exists "Authenticated location reads" on public.driver_locations;
drop policy if exists "Authenticated proof access" on public.delivery_proofs;
drop policy if exists "Authenticated event writes" on public.shipment_events;

create policy "Admin and dispatcher shipment access" on public.shipments
for all to authenticated
using ((auth.jwt()->'app_metadata'->>'role') in ('admin','dispatcher'))
with check ((auth.jwt()->'app_metadata'->>'role') in ('admin','dispatcher'));

create policy "Operators may write locations" on public.driver_locations
for insert to authenticated
with check ((auth.jwt()->'app_metadata'->>'role') in ('admin','dispatcher','driver'));

create policy "Operators may read locations" on public.driver_locations
for select to authenticated
using ((auth.jwt()->'app_metadata'->>'role') in ('admin','dispatcher','driver'));

create policy "Operators may manage proofs" on public.delivery_proofs
for all to authenticated
using ((auth.jwt()->'app_metadata'->>'role') in ('admin','dispatcher','driver'))
with check ((auth.jwt()->'app_metadata'->>'role') in ('admin','dispatcher','driver'));

create policy "Operators may manage events" on public.shipment_events
for all to authenticated
using ((auth.jwt()->'app_metadata'->>'role') in ('admin','dispatcher','driver'))
with check ((auth.jwt()->'app_metadata'->>'role') in ('admin','dispatcher','driver'));
