-- ============================================================
-- XOKAI — Schema completo de base de datos
-- Sistema de control de salida de alumnos con semáforo
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
  created_by    uuid,                     -- ref a auth.users si se usa Supabase Auth
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
-- ÍNDICES
-- ============================================================

create index idx_groups_school        on groups(school_id);
create index idx_students_school      on students(school_id);
create index idx_students_group       on students(group_id);
create index idx_students_code        on students(school_id, student_code);
create index idx_student_guardians_g  on student_guardians(guardian_id);
create index idx_authorized_student   on authorized_pickups(student_id);
create index idx_sessions_school_date on pickup_sessions(school_id, date);
create index idx_events_session       on pickup_events(session_id);
create index idx_events_student       on pickup_events(student_id);
create index idx_events_status        on pickup_events(session_id, status);

-- ============================================================
-- UPDATED_AT automático
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
-- ROW LEVEL SECURITY (RLS)
-- Activado en todas las tablas — configurar políticas según roles
-- ============================================================

alter table schools           enable row level security;
alter table groups            enable row level security;
alter table students          enable row level security;
alter table guardians         enable row level security;
alter table student_guardians enable row level security;
alter table authorized_pickups enable row level security;
alter table pickup_sessions   enable row level security;
alter table pickup_events     enable row level security;

-- Política temporal: acceso completo mientras se configura auth
-- ⚠️  Reemplazar con políticas por rol antes de producción
create policy "temp_allow_all" on schools            for all using (true) with check (true);
create policy "temp_allow_all" on groups             for all using (true) with check (true);
create policy "temp_allow_all" on students           for all using (true) with check (true);
create policy "temp_allow_all" on guardians          for all using (true) with check (true);
create policy "temp_allow_all" on student_guardians  for all using (true) with check (true);
create policy "temp_allow_all" on authorized_pickups for all using (true) with check (true);
create policy "temp_allow_all" on pickup_sessions    for all using (true) with check (true);
create policy "temp_allow_all" on pickup_events      for all using (true) with check (true);

-- ============================================================
-- REALTIME — Habilitar para el semáforo en vivo
-- ============================================================

alter publication supabase_realtime add table pickup_events;
alter publication supabase_realtime add table pickup_sessions;
