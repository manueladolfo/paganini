Actúa como desarrollador full-stack senior y crea una aplicación web local para gestionar tareas, hábitos y recompensas familiares.

### 1. Stack Técnico Estricto
- Next.js (App Router), TypeScript, Tailwind CSS.
- Base de datos: SQLite local gestionado exclusivamente con Prisma ORM.
- Estado y Sincronización: Usa Server Actions y SWR (o Server-Sent Events) para asegurar que los cambios de saldo o tareas completadas se reflejen en tiempo real entre distintos dispositivos en la red local.

### 2. Diseño y UX
- Interfaz mobile-first, moderna y gamificada (estilo app de productividad/Duolingo).
- Diseño neutro apto para adolescentes y adultos (evitar estéticas o iconos infantiles).
- Componentes: Radix UI / Shadcn UI y Lucide React.

### 3. Roles y Vistas (Separación estricta)
- **Vista Participante:** Dashboard simplificado. Muestra tareas asignadas, balance de puntos, podio del ranking semanal y catálogo de recompensas. Botón para marcar tarea como "Pendiente de revisión".
- **Vista Administrador (Protegida por PIN):** Acceso a control total. Validación de tareas, asignación manual de puntos positivos o negativos por comportamientos, creación de tareas (personales o colectivas) y auditoría del historial de actividad.

### 4. Modelo de Datos (Prisma Schema)
- `User`: id, name, role (ADMIN/MEMBER), pin, balance, avatarUrl.
- `Task`: id, title, description, points (puede ser negativo), recurrence (DAILY, WEEKLY, ONCE), targetUserId (NULL para tareas colectivas).
- `ActivityLog`: id, userId, pointsDelta, type (TASK_DONE, PENALTY, REWARD, MANUAL), description, createdAt.
- `Reward`: id, title, costPoints.

Genera la estructura de carpetas recomendada, el archivo `schema.prisma` exacto y el código de las vistas principales para ejecutar el proyecto en local con `npm run dev`.