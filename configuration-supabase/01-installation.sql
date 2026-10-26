-- Lycée Malraux — installation Supabase (à coller dans SQL Editor, sur un projet NEUF)
create table if not exists cms_profiles(
 id uuid primary key references auth.users on delete cascade,
 email text, role text not null default 'editor' check(role in('editor','publisher','admin')),
 staff_role text not null default 'redacteur');
create table if not exists cms_drafts(content_key text primary key, body text not null, updated_by uuid, updated_at timestamptz default now());
create table if not exists cms_published(content_key text primary key, body text not null, published_at timestamptz default now());
create table if not exists cms_events(id uuid primary key default gen_random_uuid(), title text not null, description text not null,
 starts_at timestamptz not null, image_url text, status text not null default 'draft' check(status in('draft','published')),
 created_by uuid, updated_by uuid, published_at timestamptz, created_at timestamptz default now());
create table if not exists cms_audit(id bigserial primary key, action text, content_key text, user_id uuid, created_at timestamptz default now());

-- profil créé automatiquement pour chaque nouveau compte (rôle minimal)
create or replace function cms_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into cms_profiles(id,email) values(new.id,new.email) on conflict do nothing; return new; end $$;
drop trigger if exists on_cms_user on auth.users;
create trigger on_cms_user after insert on auth.users for each row execute function cms_new_user();

create or replace function cms_role() returns text language sql stable security definer set search_path=public as $$
 select role from cms_profiles where id=auth.uid() $$;

alter table cms_profiles enable row level security; alter table cms_drafts enable row level security;
alter table cms_published enable row level security; alter table cms_events enable row level security; alter table cms_audit enable row level security;

create policy "lecture publique textes" on cms_published for select using(true);
create policy "lecture publique evenements" on cms_events for select using(status='published' or cms_role() is not null);
create policy "profil: voir le sien ou admin" on cms_profiles for select using(id=auth.uid() or cms_role()='admin');
create policy "brouillons: equipe" on cms_drafts for all using(cms_role() is not null) with check(cms_role() is not null);
create policy "evenements: creer brouillon" on cms_events for insert with check(cms_role() is not null and (status='draft' or cms_role() in('publisher','admin')));
create policy "evenements: modifier" on cms_events for update using(cms_role() in('publisher','admin') or (cms_role()='editor' and status='draft' and created_by=auth.uid()))
 with check(cms_role() in('publisher','admin') or status='draft');
create policy "evenements: supprimer" on cms_events for delete using(cms_role() in('publisher','admin'));
create policy "audit: lecture" on cms_audit for select using(cms_role() in('publisher','admin'));

-- publication d'un texte (réservée éditeurs / admins)
create or replace function cms_publish(item_key text) returns void language plpgsql security definer set search_path=public as $$
begin
 if cms_role() not in('publisher','admin') then raise exception 'Droit insuffisant'; end if;
 insert into cms_published(content_key,body) select content_key,body from cms_drafts where content_key=item_key
  on conflict(content_key) do update set body=excluded.body, published_at=now();
 insert into cms_audit(action,content_key,user_id) values('publication',item_key,auth.uid());
end $$;

-- changement de rôle (admin uniquement)
create or replace function cms_set_staff_role(target_id uuid,new_staff_role text) returns void language plpgsql security definer set search_path=public as $$
begin
 if cms_role()<>'admin' then raise exception 'Réservé aux administrateurs'; end if;
 update cms_profiles set staff_role=new_staff_role,
  role=case when new_staff_role in('super_admin','direction','direction_adjointe','site_admin') then 'admin'
            when new_staff_role in('secretariat','communication','intendance','responsable_pedagogique') then 'publisher' else 'editor' end
 where id=target_id;
end $$;

-- ÉTAPE FINALE : après avoir créé votre compte (Authentication > Users), exécutez :
-- update cms_profiles set role='admin', staff_role='super_admin' where email='VOTRE-EMAIL';
