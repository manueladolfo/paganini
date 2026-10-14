const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const backupPath = path.join(__dirname, 'backups', 'catalogo_tareas_y_premios.json');
  const rawData = fs.readFileSync(backupPath, 'utf8');
  const backup = JSON.parse(rawData);

  console.log('--- Iniciando carga de datos en Supabase ---');

  // 1. Usuarios
  console.log(`Cargando ${backup.users.length} usuarios...`);
  for (const u of backup.users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: {
        name: u.name,
        role: u.role,
        pin: u.pin,
        balance: u.balance,
        avatarUrl: u.avatarUrl,
        isActive: u.isActive,
      },
      create: {
        id: u.id,
        name: u.name,
        role: u.role,
        pin: u.pin,
        balance: u.balance,
        avatarUrl: u.avatarUrl,
        isActive: u.isActive,
        createdAt: new Date(u.createdAt),
        updatedAt: new Date(u.updatedAt),
      },
    });
  }

  // 2. Tareas
  console.log(`Cargando ${backup.tasks.length} tareas...`);
  for (const t of backup.tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        description: t.description,
        points: t.points,
        recurrence: t.recurrence,
        status: t.status,
        targetUserId: t.targetUserId,
        submittedByUserId: t.submittedByUserId,
      },
      create: {
        id: t.id,
        title: t.title,
        description: t.description,
        points: t.points,
        recurrence: t.recurrence,
        status: t.status,
        targetUserId: t.targetUserId,
        submittedByUserId: t.submittedByUserId,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt),
      },
    });
  }

  // 3. Premios
  console.log(`Cargando ${backup.rewards.length} premios...`);
  for (const r of backup.rewards) {
    await prisma.reward.upsert({
      where: { id: r.id },
      update: {
        title: r.title,
        costPoints: r.costPoints,
        icon: r.icon,
        description: r.description,
      },
      create: {
        id: r.id,
        title: r.title,
        costPoints: r.costPoints,
        icon: r.icon,
        description: r.description,
        createdAt: new Date(r.createdAt),
      },
    });
  }

  const userCount = await prisma.user.count();
  const taskCount = await prisma.task.count();
  const rewardCount = await prisma.reward.count();

  console.log(`\n✅ Carga completada con éxito en Supabase:`);
  console.log(`- Usuarios: ${userCount}`);
  console.log(`- Tareas: ${taskCount}`);
  console.log(`- Premios: ${rewardCount}`);
}

main()
  .catch((e) => {
    console.error('Error cargando datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
