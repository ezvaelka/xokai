CONTEXTO DE PROYECTO — XOKAI
Leer antes de escribir cualquier línea de código o UI.

════════════════════════════════════════
CLIENTE PILOTO: HÁBITAT LEARNING COMMUNITY
Santa Anita, Jalisco, México
Colegio bilingüe (inglés/español)
════════════════════════════════════════

MODELO EDUCATIVO DE HÁBITAT:
Cada alumno pertenece a:

1. UN GRUPO REGULAR (salón fijo, ej: Kinder A, 1ro B)
   Tiene 3 maestros asignados por rol:
   · Maestro Principal → titular del grupo, da clases EN INGLÉS
   · Maestro de Español → da clases en español
   · Maestro Asistente → apoyo general en el salón
   
   El grupo es la unidad base para:
   · Pickup
   · Comunicados
   · Colegiatura mensual
   · Calendario regular

2. N ATELIERS (incluidos en colegiatura, sin costo extra)
   Ejemplos: Música, Robótica, Wellness
   · Alumnos de diferentes grupos pueden mezclarse
   · Tienen instructor propio (puede ser maestro interno)
   · Horario independiente del grupo regular
   · NO generan cargo adicional

3. N EXTRACURRICULARES (cobro aparte, opcional)
   Ejemplos: Fútbol, Ballet, Ajedrez
   · Inscripción opcional por familia
   · Tienen costo mensual adicional
   · Generan cargo separado en el módulo de pagos
   · Tienen cupo máximo y lista de espera
   · Una familia puede inscribir al alumno o darse de baja

════════════════════════════════════════
STACK TÉCNICO
════════════════════════════════════════
- Next.js 14 App Router
- Supabase (auth + db + storage + realtime)
- TypeScript estricto — nunca usar 'any'
- Tailwind CSS
- shadcn/ui como base de componentes
- Zod para validación de forms y API
- react-hook-form con @hookform/resolvers/zod
- sonner para toasts
- Supabase Realtime para pickup en tiempo real

════════════════════════════════════════
SCHEMA — TABLAS PRINCIPALES
════════════════════════════════════════

escuelas (
  id, nombre, logo_url, direccion, rfc,
  horario_pickup_inicio, horario_pickup_fin,
  tolerancia_pickup_minutos, activo, created_at
)

grupos (
  id, escuela_id, nombre, grado, ciclo_escolar,
  maestro_principal_id,   -- titular, da clases en INGLÉS
  maestro_español_id,     -- da clases en español
  maestro_asistente_id,   -- apoyo general
  activo, created_at
)

grupo_maestros (
  id, grupo_id, maestro_id,
  rol,   -- 'principal' | 'español' | 'asistente'
  created_at
  -- NOTA: rol 'principal' = clases en inglés (colegio bilingüe)
)

actividades (
  id, escuela_id, nombre,
  tipo,              -- 'atelier' | 'extracurricular'
  instructor_id,     -- referencia a maestros.id
  cupo_maximo,
  costo_mensual,     -- NULL si tipo = 'atelier'
  cobro_aparte,      -- false para ateliers, true para extracurriculares
  horario,           -- JSONB: [{dia, hora_inicio, hora_fin}]
  activo, created_at
)

actividad_inscripciones (
  id, actividad_id, alumno_id,
  fecha_inicio, fecha_fin,
  status,   -- 'activo' | 'baja' | 'lista_espera'
  created_at
)

alumnos (
  id, escuela_id, grupo_id,
  nombre, apellido, foto_url, curp,
  fecha_nacimiento, activo, created_at
)

maestros (
  id, escuela_id, nombre, apellido,
  email, foto_url, activo, created_at
)

padres (
  id, escuela_id, nombre, apellido,
  email, telefono,
  idioma_preferido,  -- 'es' | 'en'
  activo, created_at
)

alumno_padres (
  alumno_id, padre_id,
  relacion,           -- 'madre' | 'padre' | 'tutor' | 'otro'
  autorizado_pickup,  -- boolean
  es_contacto_principal -- boolean
)

personas_autorizadas_pickup (
  id, alumno_id, nombre, foto_url,
  relacion, telefono, activo
)

pickup_eventos (
  id, alumno_id, escuela_id,
  padre_id,       -- quien avisó
  recogido_por,   -- padre_id o persona_autorizada_id
  status,         -- 'en_camino' | 'llegando' | 'entregado'
  folio, lat, lng,
  entregado_at, created_at
)

comunicados (
  id, escuela_id, titulo, cuerpo,
  adjunto_url,
  segmento_tipo,  -- 'escuela' | 'grupo' | 'grado' | 'actividad'
  segmento_id,    -- id del grupo/grado/actividad según tipo
  programado_para, publicado_at, created_at
)

comunicado_lecturas (
  comunicado_id, padre_id, leido_at
)

calendario_eventos (
  id, escuela_id, titulo, descripcion,
  tipo,        -- 'sin_clase' | 'examen' | 'evento' | 'extracurricular' | 'menu'
  fecha_inicio, fecha_fin,
  grupo_id,    -- NULL = toda la escuela
  actividad_id -- NULL si no aplica
)

pagos (
  id, escuela_id, alumno_id,
  concepto, monto,
  tipo,    -- 'colegiatura' | 'inscripcion' | 'extracurricular'
  status,  -- 'pendiente' | 'pagado' | 'vencido' | 'cancelado'
  fecha_limite, pagado_at,
  stripe_payment_id, cfdi_url,
  created_at
)

documentos (
  id, escuela_id, nombre, descripcion,
  pdf_url, requiere_firma,
  activo, created_at
)

documento_asignaciones (
  id, documento_id,
  scope_tipo,  -- 'escuela' | 'grupo' | 'alumno'
  scope_id
)

documento_firmas (
  id, documento_id, padre_id,
  firmado_at, pdf_firmado_url, folio
)

════════════════════════════════════════
DESIGN TOKENS — nunca hardcodear colores
════════════════════════════════════════
--bg:        #F7F6F3   (fondo principal)
--bg2:       #FFFFFF   (cards, modales)
--bg3:       #EFEDE8   (fondo sutil, hover)
--border:    #E2DFD8   (bordes)
--text:      #1C1A17   (texto principal)
--text2:     #6B6760   (texto secundario)
--muted:     #A8A49E   (texto deshabilitado)
--accent:    #1A6B4A   (verde principal)
--accent-lt: #E6F4ED   (verde claro, badges, fondos)
--accent-md: #9FD4B8   (verde medio, bordes activos)
--accent-dk: #0F4A32   (verde oscuro, hover)
--warn:      #D97706   (amarillo, alertas)
--warn-lt:   #FEF3C7   (amarillo claro)
--danger:    #DC2626   (rojo, errores, destructivo)

════════════════════════════════════════
TIPOGRAFÍA
════════════════════════════════════════
- Títulos grandes:     Fraunces (serif), weight 700
- UI / body / labels:  Geist (sans), weight 400-600
- Monospace / técnico: Geist Mono

════════════════════════════════════════
PATRONES DE UI — OBLIGATORIOS
════════════════════════════════════════

1. ESTRUCTURA DE PÁGINA:
   page.tsx = server component
   · Verificar sesión con createServerComponentClient
   · Verificar rol del usuario
   · Fetch inicial de datos
   · Renderiza <[Modulo]Client data={data} />
   
   [Modulo]Client.tsx = client component
   · Toda la interactividad aquí
   · <PageHeader titulo descripcion accionPrimaria />
   · <[Modulo]Filters />
   · <[Modulo]Table />
   · Modales inline

2. TABLAS:
   · Búsqueda en tiempo real (debounce 300ms)
   · Filtros relevantes al módulo
   · Paginación server-side (20 items por página)
   · Columna de acciones con DropdownMenu de shadcn
   · Empty state: ilustración SVG + texto + botón CTA
   · Loading: Skeleton rows (nunca spinner solo)

3. FORMS / MODALES:
   · shadcn Dialog siempre
   · Validación con Zod schema + react-hook-form
   · Cada campo: Label + Input + mensaje de error debajo
   · Botón submit con loading state (disabled + spinner)
   · Reset completo del form al cerrar modal

4. FEEDBACK AL USUARIO:
   · Éxito → toast verde en español
   · Error → toast rojo con mensaje descriptivo
   · Acción destructiva → AlertDialog de confirmación primero
   · Nunca usar alert() o confirm() nativo

5. SEGURIDAD — en cada componente:
   · Siempre filtrar queries por escuela_id
   · Verificar rol antes de mostrar acciones admin
   · Nunca exponer datos de otra escuela
   · Validación server-side siempre, nunca solo cliente

6. ESTADOS OBLIGATORIOS:
   · Loading → Skeleton
   · Empty → EmptyState con CTA
   · Error → mensaje + botón reintentar
   · Éxito → toast + refetch de data

════════════════════════════════════════
COMPONENTES BASE YA CREADOS (C0)
════════════════════════════════════════
Importar desde @/components/ui/custom/:
· <PageHeader>      — header estándar con título + CTA
· <DataTable>       — tabla con búsqueda y paginación
· <ConfirmDialog>   — confirmación antes de acción destructiva
· <FormModal>       — modal base con form
· <EmptyState>      — estado vacío con ilustración + CTA
· <LoadingSkeleton> — skeleton de carga
· <StatusBadge>     — badge de estado con colores semánticos

════════════════════════════════════════
ESTRUCTURA DE ARCHIVOS POR MÓDULO
════════════════════════════════════════
/app/dashboard/[modulo]/
  page.tsx                 ← server component
  [Modulo]Client.tsx       ← client component principal
  components/
    [Modulo]Table.tsx
    [Modulo]Modal.tsx
    [Modulo]Filters.tsx

════════════════════════════════════════
ROLES DE USUARIO
════════════════════════════════════════
· admin    → acceso total a su escuela
· maestro  → solo ve su grupo asignado
· portero  → solo ve pickup (tablet)
· padre    → solo app móvil (fuera del dashboard)
· sysadmin → acceso global a todas las escuelas

════════════════════════════════════════
IDIOMA Y FORMATO
════════════════════════════════════════
· Todo el copy en español México
· Fechas: DD/MM/YYYY
· Hora: 12hr con AM/PM
· Moneda: MXN con símbolo $ (ej: $1,500.00)
· Nombres con acentos correctos siempre

════════════════════════════════════════
REFERENCIAS EN EL CODEBASE
════════════════════════════════════════
· Patrón de página:  /app/dashboard/page.tsx
· Patrón de módulo:  /app/dashboard/alumnos/page.tsx
· Cliente Supabase:  /lib/supabase/client.ts
· Schema completo:   /supabase/schema.sql
