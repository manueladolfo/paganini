const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Limpiando base de datos previa...");
  await prisma.rewardRedemption.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.reward.deleteMany();
  await prisma.user.deleteMany();

  console.log("👨‍👩‍👧‍👦 Creando usuarios de la familia...");
  const papa = await prisma.user.create({
    data: {
      name: "Papá",
      role: "ADMIN",
      pin: "1234",
      balance: 100,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=PapaHero",
    },
  });

  const mama = await prisma.user.create({
    data: {
      name: "Mamá",
      role: "ADMIN",
      pin: "1234",
      balance: 100,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=MamaGenial",
    },
  });

  const sofia = await prisma.user.create({
    data: {
      name: "Sofía",
      role: "MEMBER",
      pin: "0000",
      balance: 520,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=SofiaStar",
    },
  });

  const lucas = await prisma.user.create({
    data: {
      name: "Lucas",
      role: "MEMBER",
      pin: "0000",
      balance: 380,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=LucasGamer",
    },
  });

  const mateo = await prisma.user.create({
    data: {
      name: "Mateo",
      role: "MEMBER",
      pin: "0000",
      balance: 240,
      avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=MateoFast",
    },
  });

  console.log("📋 Creando tareas iniciales...");
  await prisma.task.createMany({
    data: [
      {
        title: "Vaciar lavavajillas y colocar la vajilla",
        description: "Dejar el fregadero despejado y la vajilla limpia en sus muebles.",
        points: 40,
        recurrence: "DAILY",
        status: "PENDING",
        targetUserId: null, // Colectiva
      },
      {
        title: "Bajar la basura y el reciclaje (contenedor)",
        description: "Separar cartón, envases y orgánico antes de las 21:30.",
        points: 30,
        recurrence: "DAILY",
        status: "PENDING",
        targetUserId: null, // Colectiva
      },
      {
        title: "Pasear al perro por la tarde (40 min)",
        description: "Ruta del parque y rellenar su cuenco de agua al volver.",
        points: 50,
        recurrence: "DAILY",
        status: "IN_REVIEW", // Simular una en revisión para validar
        submittedByUserId: sofia.id,
        targetUserId: sofia.id,
      },
      {
        title: "Completar deberes escolares y repaso examen",
        description: "Mínimo 1 hora de estudio concentrado sin distracciones de móvil.",
        points: 60,
        recurrence: "DAILY",
        status: "PENDING",
        targetUserId: lucas.id,
      },
      {
        title: "Ordenar habitación y hacer la cama",
        description: "Ropa en el armario o cesto, escritorio despejado.",
        points: 30,
        recurrence: "DAILY",
        status: "PENDING",
        targetUserId: mateo.id,
      },
      {
        title: "Limpieza a fondo del salón y terraza el sábado",
        description: "Aspirar alfombra, quitar polvo y regar las plantas.",
        points: 120,
        recurrence: "WEEKLY",
        status: "PENDING",
        targetUserId: null, // Colectiva
      },
      {
        title: "Penalización: Dejar la ropa tirada en el suelo",
        description: "Resta directa aplicada si se deja ropa o mochilas fuera de lugar.",
        points: -25,
        recurrence: "DAILY",
        status: "PENDING",
        targetUserId: null,
      },
    ],
  });

  console.log("🎁 Creando catálogo de recompensas...");
  await prisma.reward.createMany({
    data: [
      {
        title: "1 hora extra de videojuegos o streaming",
        description: "Válido para consola, PC o tablet el fin de semana.",
        costPoints: 120,
        icon: "Gamepad2",
      },
      {
        title: "Elegir el menú de la cena del viernes",
        description: "Pizza casera, hamburguesas o comida favorita.",
        costPoints: 200,
        icon: "UtensilsCrossed",
      },
      {
        title: "Tarde de cine con palomitas",
        description: "Entrada pagada y combo de palomitas grande.",
        costPoints: 350,
        icon: "Film",
      },
      {
        title: "Bono de 10€ para compras personales o libros",
        description: "Transferencia directa o compra en tienda a elección.",
        costPoints: 500,
        icon: "Banknote",
      },
      {
        title: "Día comodín: Exento de tareas diarias",
        description: "Descanso total durante 24h sin tareas asignadas.",
        costPoints: 450,
        icon: "Sparkles",
      },
    ],
  });

  console.log("📜 Registrando historial de actividad inicial...");
  await prisma.activityLog.createMany({
    data: [
      {
        userId: sofia.id,
        pointsDelta: 120,
        type: "TASK_DONE",
        description: "Completó la limpieza profunda del salón",
      },
      {
        userId: lucas.id,
        pointsDelta: 60,
        type: "TASK_DONE",
        description: "Aprobó examen de Física con nota excelente",
      },
      {
        userId: mateo.id,
        pointsDelta: 40,
        type: "TASK_DONE",
        description: "Ayudó a ordenar la cocina tras el almuerzo",
      },
      {
        userId: lucas.id,
        pointsDelta: -30,
        type: "PENALTY",
        description: "Olvidó sacar la basura a su hora",
      },
      {
        userId: sofia.id,
        pointsDelta: -120,
        type: "REWARD",
        description: "Canjeó 1 hora extra de videojuegos",
      },
    ],
  });

  console.log("🎁 Registrando canje inicial de prueba para Sofía...");
  const firstReward = await prisma.reward.findFirst();
  if (firstReward) {
    await prisma.rewardRedemption.create({
      data: {
        userId: sofia.id,
        rewardId: firstReward.id,
        title: firstReward.title,
        costPoints: firstReward.costPoints,
        icon: firstReward.icon || "Gamepad2",
        status: "UNLOCKED",
      },
    });
  }

  console.log("✅ Seed completado con éxito. PIN de Papá y Mamá: 1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
