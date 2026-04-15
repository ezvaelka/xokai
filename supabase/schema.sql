-- ============================================================
-- XOKAI — Schema completo de base de datos
-- Sistema de control de salida de alumnos con semáforo
-- Versión: 2.0 — Con RLS completo, índices optimizados y user_profiles
-- ============================================================

-- Extensiones
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type pickup_event_status as enum (
  'waiting',    -- alumno en cola de espera
  'called',     -- alumno llamado al semáforo (verde)
  'delivered',  -- alumno entregado / salida confirmada
  'cancelled'   -- cancelado (no se presentó el tutor)
);

create type pickup_session_status as enum (
  'scheduled',  -- programada
  'active',     -- en curso
  'closed'      -- cerrada
);

create type guardian_relationship as enum (
  'mother',
  'father',
  'grandparent',
  'uncle_aunt',
  'sibling',
  'legal_guardian',
  'other'
);

create type user_role as enum (
  'sysadmin',   -- acceso total multi-escuela (Ez)
  'admin',      -- directora / administradora de una escuela
  'teacher',    -- maestro de un grupo
  'portero',    -- tablet de puerta / semáforo
  'guardian'    -- padre / tutor (app móvil)
);

-- ============================================================
-- SCHOOLS — Escuelas
-- ============================================================

create table schools (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  short_name    text,
  address       text,
  city          text,
  state         text,
  phone         text,
  email         text,
  logo_url      text,
  timezone      text not null default 'America/Mexico_City',
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- USER_PROFILES — Vincula auth.users con escuelas y roles
-- ============================================================

create table user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  school_id   uuid references schools(id) on delete cascade, -- null para sysadmin
  role        user_role not null default 'admin',
  first_name  text,
  last_name   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- GROUPS — Grupos / Salones
-- ============================================================

create table groups (
  id             uuid primary key default uuid_generate_v4(),
  school_id      uuid not null references schools(id) on delete cascade,
  name           text not null,           -- ej. "1°A", "3°B"
  grade          smallint,                -- grado numérico (1-6 primaria, etc.)
  level          text,                    -- "primaria", "secundaria", etc.
  academic_year  text not null,           -- ej. "2025-2026"
  teacher_name   text,
  teacher_id     uuid references user_profiles(id) on delete set null,
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (school_id, name, academic_year)
);

-- ============================================================
-- STUDENTS — Alumnos
-- ============================================================

create table students (
  id              uuid primary key default uuid_generate_v4(),
  school_id       uuid not null references schools(id) on delete cascade,
  group_id        uuid references groups(id) on delete set null,
  student_code    text,                   -- matrícula / número de alumno
  first_name      text not null,
  last_name       text not null,
  photo_url       text,
  date_of_birth   date,
  allergies       text,
  medical_notes   text,
  active          boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (school_id, student_code)
);

-- ============================================================
-- GUARDIANS — Tutores / Padres de familia
-- ============================================================

create table guardians (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references user_profiles(id) on delete set null, -- si tiene cuenta
  first_name    text not null,
  last_name     text not null,
  phone         text,
  email         text,
  photo_url     text,
  id_document   text,                     -- número de INE / pasaporte
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Relación muchos-a-muchos entre alumnos y tutores
create table student_guardians (
  student_id    uuid not null references students(id) on delete cascade,
  guardian_id   uuid not null references guardians(id) on delete cascade,
  relationship  guardian_relationship not null default 'other',
  is_primary    boolean not null default false,
  can_pickup    boolean not null default true,
  created_at    timestamptz not null default now(),
  primary key (student_id, guardian_id)
);

-- ============================================================
-- AUTHORIZED_PICKUPS — Personas autorizadas a recoger
-- ============================================================

create table authorized_pickups (
  id            uuid primary key default uuid_generate_v4(),
  student_id    uuid not null references students(id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  phone         text,
  photo_url     text,
  id_document   text,
  relationship  text,                     -- texto libre: "tío", "vecino", etc.
  notes         text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- PICKUP_SESSIONS — Sesiones de salida diaria
-- ============================================================

create table pickup_sessions (
  id            uuid primary key default uuid_generate_v4(),
  school_id     uuid not null references schools(id) on delete cascade,
  date          date not null,
  status        pickup_session_status not null default 'scheduled',
  started_at    timestamptz,
  closed_at     timestamptz,
  notes         text,
  created_by    uuid references user_profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (school_id, date)
);

-- ============================================================
-- PICKUP_EVENTS — Eventos del semáforo en tiempo real
-- ============================================================

create table pickup_events (
  id                   uuid primary key default uuid_generate_v4(),
  session_id           uuid not null references pickup_sessions(id) on delete cascade,
  student_id           uuid not null references students(id) on delete cascade,
  -- quién va a recoger: tutor registrado o persona autorizada
  guardian_id          uuid references guardians(id) on delete set null,
  authorized_pickup_id uuid references authorized_pickups(id) on delete set null,
  status               pickup_event_status not null default 'waiting',
  queue_position       smallint,          -- posición en la cola del semáforo
  called_at            timestamptz,       -- momento en que se llamó al alumno
  delivered_at         timestamptz,       -- momento de entrega confirmada
  cancelled_at         timestamptz,
  cancel_reason        text,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  -- un alumno solo puede tener un evento activo por sesión
  constraint unique_active_event unique (session_id, student_id)
);

-- ============================================================
-- ÍNDICES — Optimizados para los queries más frecuentes
-- ============================================================

-- user_profiles
create index idx_user_profiles_school    on user_profiles(school_id);
create index idx_user_profiles_role      on user_profiles(role);

-- schools
create index idx_schools_active          on schools(active);

-- groups
create index idx_groups_school           on groups(school_id);
create index idx_groups_school_active    on groups(school_id, active);
create index idx_groups_school_year      on groups(school_id, academic_year);
create index idx_groups_teacher          on groups(teacher_id);

-- students
create index idx_students_school         on students(school_id);
create index idx_students_group          on students(group_id);
create index idx_students_code           on students(school_id, student_code);
create index idx_students_school_active  on students(school_id, active);

-- guardians
create index idx_guardians_user          on guardians(user_id);
create index idx_guardians_email         on guardians(email);

-- student_guardians (guardian_id: el PK cubre student_id)
create index idx_student_guardians_g     on student_guardians(guardian_id);

-- authorized_pickups
create index idx_authorized_student        on authorized_pickups(student_id);
create index idx_authorized_student_active on authorized_pickups(student_id, active);

-- pickup_sessions
create index idx_sessions_school_date    on pickup_sessions(school_id, date);
create index idx_sessions_school_status  on pickup_sessions(school_id, status);

-- pickup_events
create index idx_events_session          on pickup_events(session_id);
create index idx_events_student          on pickup_events(student_id);
create index idx_events_status           on pickup_events(session_id, status);
create index idx_events_guardian         on pickup_events(guardian_id);
create index idx_events_authorized       on pickup_events(authorized_pickup_id);
create index idx_events_queue            on pickup_events(session_id, queue_position);

-- ============================================================
-- UPDATED_AT — Trigger automático para todas las tablas
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_schools_updated_at
  before update on schools
  for each row execute function set_updated_at();

create trigger trg_user_profiles_updated_at
  before update on user_profiles
  for each row execute function set_updated_at();

create trigger trg_groups_updated_at
  before update on groups
  for each row execute function set_updated_at();

create trigger trg_students_updated_at
  before update on students
  for each row execute function set_updated_at();

create trigger trg_guardians_updated_at
  before update on guardians
  for each row execute function set_updated_at();

create trigger trg_authorized_pickups_updated_at
  before update on authorized_pickups
  for each row execute function set_updated_at();

create trigger trg_pickup_sessions_updated_at
  before update on pickup_sessions
  for each row execute function set_updated_at();

create trigger trg_pickup_events_updated_at
  before update on pickup_events
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY — Activado en todas las tablas
-- ============================================================

alter table schools            enable row level security;
alter table user_profiles      enable row level security;
alter table groups             enable row level security;
alter table students           enable row level security;
alter table guardians          enable row level security;
alter table student_guardians  enable row level security;
alter table authorized_pickups enable row level security;
alter table pickup_sessions    enable row level security;
alter table pickup_events      enable row level security;

-- ============================================================
-- HELPER FUNCTIONS — Usadas dentro de las RLS policies
-- security definer = se ejecutan con privilegios del creador,
-- no del usuario autenticado (evita recursión y mejora perf.)
-- ============================================================

-- Retorna el school_id del usuario autenticado
create or replace function auth_school_id()
returns uuid language sql stable security definer as $$
  select school_id from user_profiles where id = auth.uid()
$$;

-- Retorna el role del usuario autenticado
create or replace function auth_user_role()
returns user_role language sql stable security definer as $$
  select role from user_profiles where id = auth.uid()
$$;

-- ¿Es sysadmin?
create or replace function is_sysadmin()
returns boolean language sql stable security definer as $$
  select coalesce(
    (select role = 'sysadmin' from user_profiles where id = auth.uid()),
    false
  )
$$;

-- ¿Es admin (o sysadmin) de una escuela específica?
create or replace function is_school_admin(sid uuid)
returns boolean language sql stable security definer as $$
  select is_sysadmin() or exists(
    select 1 from user_profiles
    where id = auth.uid() and school_id = sid and role = 'admin'
  )
$$;

-- ¿Tiene cualquier acceso a una escuela?
create or replace function can_access_school(sid uuid)
returns boolean language sql stable security definer as $$
  select is_sysadmin() or exists(
    select 1 from user_profiles
    where id = auth.uid() and school_id = sid
  )
$$;

-- ============================================================
-- RLS POLICIES — SCHOOLS
-- ============================================================

create policy "schools_select" on schools
  for select using (
    is_sysadmin() or id = auth_school_id()
  );

create policy "schools_insert" on schools
  for insert with check (is_sysadmin());

create policy "schools_update" on schools
  for update using (is_sysadmin() or id = auth_school_id())
  with check  (is_sysadmin() or id = auth_school_id());

create policy "schools_delete" on schools
  for delete using (is_sysadmin());

-- ============================================================
-- RLS POLICIES — USER_PROFILES
-- ============================================================

create policy "user_profiles_select" on user_profiles
  for select using (
    id = auth.uid() or
    is_sysadmin() or
    ( auth_user_role() = 'admin' and school_id = auth_school_id() )
  );

create policy "user_profiles_insert" on user_profiles
  for insert with check (
    is_sysadmin() or
    ( auth_user_role() = 'admin' and school_id = auth_school_id() )
  );

create policy "user_profiles_update" on user_profiles
  for update
  using  ( id = auth.uid() or is_sysadmin() or
           ( auth_user_role() = 'admin' and school_id = auth_school_id() ) )
  with check ( id = auth.uid() or is_sysadmin() or
               ( auth_user_role() = 'admin' and school_id = auth_school_id() ) );

create policy "user_profiles_delete" on user_profiles
  for delete using (
    is_sysadmin() or
    ( auth_user_role() = 'admin' and school_id = auth_school_id() )
  );

-- ============================================================
-- RLS POLICIES — GROUPS
-- ============================================================

create policy "groups_select" on groups
  for select using ( can_access_school(school_id) );

create policy "groups_insert" on groups
  for insert with check ( is_school_admin(school_id) );

create policy "groups_update" on groups
  for update using  ( is_school_admin(school_id) )
  with check        ( is_school_admin(school_id) );

create policy "groups_delete" on groups
  for delete using ( is_school_admin(school_id) );

-- ============================================================
-- RLS POLICIES — STUDENTS
-- ============================================================

create policy "students_select" on students
  for select using (
    can_access_school(school_id) or
    -- tutor que tiene un hijo registrado en esta escuela
    exists (
      select 1 from student_guardians sg
        join guardians g on g.id = sg.guardian_id
      where sg.student_id = students.id
        and g.user_id = auth.uid()
    )
  );

create policy "students_insert" on students
  for insert with check ( is_school_admin(school_id) );

create policy "students_update" on students
  for update using  ( is_school_admin(school_id) )
  with check        ( is_school_admin(school_id) );

create policy "students_delete" on students
  for delete using ( is_school_admin(school_id) );

-- ============================================================
-- RLS POLICIES — GUARDIANS
-- ============================================================

create policy "guardians_select" on guardians
  for select using (
    user_id = auth.uid() or
    is_sysadmin() or
    -- admin, portero o maestro ve tutores de alumnos de su escuela
    ( auth_user_role() in ('admin', 'portero', 'teacher') and
      exists (
        select 1 from student_guardians sg
          join students s on s.id = sg.student_id
        where sg.guardian_id = guardians.id
          and s.school_id = auth_school_id()
      )
    )
  );

create policy "guardians_insert" on guardians
  for insert with check (
    is_sysadmin() or auth_user_role() = 'admin'
  );

create policy "guardians_update" on guardians
  for update
  using (
    user_id = auth.uid() or
    is_sysadmin() or
    ( auth_user_role() = 'admin' and
      exists (
        select 1 from student_guardians sg
          join students s on s.id = sg.student_id
        where sg.guardian_id = guardians.id
          and s.school_id = auth_school_id()
      )
    )
  )
  with check ( user_id = auth.uid() or is_sysadmin() or auth_user_role() = 'admin' );

create policy "guardians_delete" on guardians
  for delete using (
    is_sysadmin() or auth_user_role() = 'admin'
  );

-- ============================================================
-- RLS POLICIES — STUDENT_GUARDIANS
-- ============================================================

create policy "student_guardians_select" on student_guardians
  for select using (
    is_sysadmin() or
    ( auth_user_role() in ('admin', 'portero', 'teacher') and
      exists ( select 1 from students s
               where s.id = student_id and s.school_id = auth_school_id() )
    ) or
    exists ( select 1 from guardians g
             where g.id = guardian_id and g.user_id = auth.uid() )
  );

create policy "student_guardians_insert" on student_guardians
  for insert with check (
    is_sysadmin() or
    ( auth_user_role() = 'admin' and
      exists ( select 1 from students s
               where s.id = student_id and s.school_id = auth_school_id() )
    )
  );

create policy "student_guardians_delete" on student_guardians
  for delete using (
    is_sysadmin() or
    ( auth_user_role() = 'admin' and
      exists ( select 1 from students s
               where s.id = student_id and s.school_id = auth_school_id() )
    )
  );

-- ============================================================
-- RLS POLICIES — AUTHORIZED_PICKUPS
-- ============================================================

create policy "authorized_pickups_select" on authorized_pickups
  for select using (
    is_sysadmin() or
    exists (
      select 1 from students s where s.id = student_id and (
        s.school_id = auth_school_id() or
        exists (
          select 1 from student_guardians sg
            join guardians g on g.id = sg.guardian_id
          where sg.student_id = s.id and g.user_id = auth.uid()
        )
      )
    )
  );

create policy "authorized_pickups_insert" on authorized_pickups
  for insert with check (
    is_sysadmin() or
    ( auth_user_role() = 'admin' and
      exists ( select 1 from students s
               where s.id = student_id and s.school_id = auth_school_id() )
    ) or
    -- tutor puede agregar personas autorizadas para sus hijos
    exists (
      select 1 from student_guardians sg
        join guardians g on g.id = sg.guardian_id
      where sg.student_id = student_id and g.user_id = auth.uid()
    )
  );

create policy "authorized_pickups_update" on authorized_pickups
  for update
  using (
    is_sysadmin() or
    ( auth_user_role() = 'admin' and
      exists ( select 1 from students s
               where s.id = student_id and s.school_id = auth_school_id() )
    ) or
    exists (
      select 1 from student_guardians sg
        join guardians g on g.id = sg.guardian_id
      where sg.student_id = student_id and g.user_id = auth.uid()
    )
  )
  with check ( is_sysadmin() or auth_user_role() in ('admin', 'guardian') );

create policy "authorized_pickups_delete" on authorized_pickups
  for delete using (
    is_sysadmin() or
    ( auth_user_role() = 'admin' and
      exists ( select 1 from students s
               where s.id = student_id and s.school_id = auth_school_id() )
    )
  );

-- ============================================================
-- RLS POLICIES — PICKUP_SESSIONS
-- ============================================================

create policy "pickup_sessions_select" on pickup_sessions
  for select using ( can_access_school(school_id) );

create policy "pickup_sessions_insert" on pickup_sessions
  for insert with check (
    is_sysadmin() or
    ( auth_user_role() in ('admin', 'portero') and school_id = auth_school_id() )
  );

create policy "pickup_sessions_update" on pickup_sessions
  for update
  using  ( is_sysadmin() or
           ( auth_user_role() in ('admin', 'portero') and school_id = auth_school_id() ) )
  with check ( is_sysadmin() or
               ( auth_user_role() in ('admin', 'portero') and school_id = auth_school_id() ) );

create policy "pickup_sessions_delete" on pickup_sessions
  for delete using ( is_school_admin(school_id) );

-- ============================================================
-- RLS POLICIES — PICKUP_EVENTS
-- ============================================================

create policy "pickup_events_select" on pickup_events
  for select using (
    is_sysadmin() or
    exists (
      select 1 from pickup_sessions ps where ps.id = session_id and (
        can_access_school(ps.school_id) or
        -- tutor ve los eventos de sus hijos
        exists (
          select 1 from student_guardians sg
            join guardians g on g.id = sg.guardian_id
          where sg.student_id = pickup_events.student_id
            and g.user_id = auth.uid()
        )
      )
    )
  );

create policy "pickup_events_insert" on pickup_events
  for insert with check (
    is_sysadmin() or
    exists (
      select 1 from pickup_sessions ps
      where ps.id = session_id
        and auth_user_role() in ('admin', 'portero')
        and ps.school_id = auth_school_id()
    )
  );

create policy "pickup_events_update" on pickup_events
  for update
  using (
    is_sysadmin() or
    exists (
      select 1 from pickup_sessions ps
      where ps.id = session_id
        and auth_user_role() in ('admin', 'portero')
        and ps.school_id = auth_school_id()
    )
  )
  with check (
    is_sysadmin() or
    exists (
      select 1 from pickup_sessions ps
      where ps.id = session_id
        and auth_user_role() in ('admin', 'portero')
        and ps.school_id = auth_school_id()
    )
  );

create policy "pickup_events_delete" on pickup_events
  for delete using (
    is_school_admin(
      (select school_id from pickup_sessions where id = session_id)
    )
  );

-- ============================================================
-- REALTIME — Habilitar para el semáforo en vivo
-- ============================================================

alter publication supabase_realtime add table pickup_events;
alter publication supabase_realtime add table pickup_sessions;
