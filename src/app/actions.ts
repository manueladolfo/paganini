"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAppData() {
  const [users, tasks, submissions, rewards, logs, redemptions, notifications] = await Promise.all([
    prisma.user.findMany({
      orderBy: { balance: "desc" },
    }),
    prisma.task.findMany({
      include: {
        targetUser: {
          select: { id: true, name: true, avatarUrl: true },
        },
        submissions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
      orderBy: [
        { status: "desc" }, // IN_REVIEW first
        { points: "desc" },
      ],
    }),
    prisma.taskSubmission.findMany({
      where: { status: "PENDING" },
      include: {
        task: true,
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.reward.findMany({
      orderBy: { costPoints: "asc" },
    }),
    prisma.activityLog.findMany({
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.rewardRedemption.findMany({
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.notification.findMany({
      include: {
        userStates: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const dbUrl = process.env.DATABASE_URL || "";
  const isCloud = dbUrl.includes("supabase.com") || dbUrl.includes("postgresql://") || dbUrl.includes("postgres://");
  const dbMode = isCloud ? "SUPABASE" : "LOCAL";

  return { users, tasks, submissions, rewards, logs, redemptions, notifications, dbMode };
}

// Helper para crear notificaciones familiares en tiempo real
async function createFamilyNotification(data: {
  title: string;
  description: string;
  type: string;
  pointsDelta?: number | null;
  actorName: string;
  actorAvatar?: string | null;
}) {
  try {
    await prisma.notification.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        pointsDelta: data.pointsDelta,
        actorName: data.actorName,
        actorAvatar: data.actorAvatar || null,
      },
    });
  } catch (err) {
    console.error("Error creating notification:", err);
  }
}

// Verifica el PIN de administrador (soporta comprobación individual por padre)
export async function verifyAdminPin(pin: string, targetUserId?: string): Promise<boolean> {
  const trimmed = pin.trim();
  if (targetUserId) {
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user || user.role !== "ADMIN") return false;
    return (user.pin && user.pin.trim() === trimmed) || (trimmed === "1234" && !user.pin);
  }

  const admin = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
      pin: trimmed,
    },
  });

  return Boolean(admin || trimmed === "1234");
}

// Participante: Marcar tarea como completada para revisión
export async function markTaskInReview(taskId: string, userId: string) {
  const [task, user] = await Promise.all([
    prisma.task.findUnique({ where: { id: taskId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);
  if (!task) throw new Error("Tarea no encontrada");

  // Crear una entrega individual acumulable
  await prisma.taskSubmission.create({
    data: {
      taskId: task.id,
      userId: userId,
      status: "PENDING",
      points: task.points,
    },
  });

  // Mantener compatibilidad con estado de tarea general
  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: "IN_REVIEW",
      submittedByUserId: userId,
    },
  });

  if (user) {
    await createFamilyNotification({
      title: `${user.name} completó una tarea`,
      description: `Para validar: "${task.title}" (+${task.points} pts)`,
      type: "TASK_REVIEW",
      pointsDelta: task.points,
      actorName: user.name,
      actorAvatar: user.avatarUrl,
    });
  }

  revalidatePath("/");
  return { success: true };
}

// Administrador: Aprobar una entrega específica
export async function approveTaskSubmission(submissionId: string, approvedByAdminName?: string) {
  const submission = await prisma.taskSubmission.findUnique({
    where: { id: submissionId },
    include: { task: true, user: true },
  });

  if (!submission) throw new Error("Entrega no encontrada");
  if (submission.status !== "PENDING") throw new Error("Esta entrega ya ha sido procesada");

  const adminLabel = approvedByAdminName ? `por ${approvedByAdminName}` : "por Admin";

  await prisma.$transaction(async (tx) => {
    // 1. Sumar puntos al usuario
    await tx.user.update({
      where: { id: submission.userId },
      data: {
        balance: { increment: submission.points },
      },
    });

    // 2. Marcar entrega como aprobada
    await tx.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status: "APPROVED",
        reviewedBy: approvedByAdminName || "Admin",
        reviewedAt: new Date(),
      },
    });

    // 3. Registrar en auditoría
    await tx.activityLog.create({
      data: {
        userId: submission.userId,
        pointsDelta: submission.points,
        type: submission.points >= 0 ? "TASK_DONE" : "PENALTY",
        description: `Validada ${adminLabel}: ${submission.task.title}`,
      },
    });

    // 4. Si no quedan más entregas pendientes para esta tarea, actualizar estado de la tarea
    const remainingPending = await tx.taskSubmission.count({
      where: { taskId: submission.taskId, status: "PENDING" },
    });

    if (remainingPending === 0) {
      await tx.task.update({
        where: { id: submission.taskId },
        data: {
          status: "PENDING",
          submittedByUserId: null,
        },
      });
    }
  });

  await createFamilyNotification({
    title: `Entrega aprobada ${adminLabel}`,
    description: `${submission.user.name} recibió +${submission.points} pts por: "${submission.task.title}"`,
    type: "TASK_DONE",
    pointsDelta: submission.points,
    actorName: approvedByAdminName || "Admin",
    actorAvatar: null,
  });

  revalidatePath("/");
  return { success: true };
}

// Administrador: Aprobar TODAS las entregas pendientes de golpe (en 1 clic)
export async function approveAllPendingSubmissions(approvedByAdminName?: string) {
  const pendingSubmissions = await prisma.taskSubmission.findMany({
    where: { status: "PENDING" },
    include: { task: true, user: true },
  });

  if (pendingSubmissions.length === 0) return { count: 0 };

  const adminLabel = approvedByAdminName ? `por ${approvedByAdminName}` : "por Admin";

  await prisma.$transaction(async (tx) => {
    for (const sub of pendingSubmissions) {
      // Sumar balance
      await tx.user.update({
        where: { id: sub.userId },
        data: { balance: { increment: sub.points } },
      });

      // Marcar submission
      await tx.taskSubmission.update({
        where: { id: sub.id },
        data: {
          status: "APPROVED",
          reviewedBy: approvedByAdminName || "Admin",
          reviewedAt: new Date(),
        },
      });

      // Crear log
      await tx.activityLog.create({
        data: {
          userId: sub.userId,
          pointsDelta: sub.points,
          type: sub.points >= 0 ? "TASK_DONE" : "PENALTY",
          description: `Validada ${adminLabel}: ${sub.task.title}`,
        },
      });
    }

    // Resetear todas las tareas a PENDING
    await tx.task.updateMany({
      where: { status: "IN_REVIEW" },
      data: { status: "PENDING", submittedByUserId: null },
    });
  });

  await createFamilyNotification({
    title: `Todas las tareas validadas ${adminLabel}`,
    description: `Se han aprobado ${pendingSubmissions.length} entregas de la semana con éxito`,
    type: "TASK_DONE",
    pointsDelta: null,
    actorName: approvedByAdminName || "Admin",
    actorAvatar: null,
  });

  revalidatePath("/");
  return { count: pendingSubmissions.length };
}

// Administrador: Rechazar una entrega específica
export async function rejectTaskSubmission(submissionId: string) {
  const submission = await prisma.taskSubmission.findUnique({
    where: { id: submissionId },
    include: { task: true, user: true },
  });
  if (!submission) throw new Error("Entrega no encontrada");

  await prisma.$transaction(async (tx) => {
    await tx.taskSubmission.update({
      where: { id: submissionId },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
      },
    });

    const remainingPending = await tx.taskSubmission.count({
      where: { taskId: submission.taskId, status: "PENDING" },
    });

    if (remainingPending === 0) {
      await tx.task.update({
        where: { id: submission.taskId },
        data: {
          status: "PENDING",
          submittedByUserId: null,
        },
      });
    }
  });

  if (submission.user && submission.task) {
    await createFamilyNotification({
      title: "Tarea no validada",
      description: `${submission.user.name}, la tarea "${submission.task.title}" no fue validada. Puedes volver a realizarla hoy.`,
      type: "TASK_REVIEW",
      pointsDelta: 0,
      actorName: "Admin",
      actorAvatar: null,
    });
  }

  revalidatePath("/");
  return { success: true };
}

// Mantener compatibilidad hacia atrás
export async function approveTask(taskId: string, approvedByAdminName?: string) {
  const pendingSub = await prisma.taskSubmission.findFirst({
    where: { taskId, status: "PENDING" },
  });
  if (pendingSub) {
    return approveTaskSubmission(pendingSub.id, approvedByAdminName);
  }
  return { success: true };
}

export async function rejectTask(taskId: string) {
  const pendingSub = await prisma.taskSubmission.findFirst({
    where: { taskId, status: "PENDING" },
  });
  if (pendingSub) {
    return rejectTaskSubmission(pendingSub.id);
  }
  await prisma.task.update({
    where: { id: taskId },
    data: { status: "PENDING", submittedByUserId: null },
  });
  revalidatePath("/");
  return { success: true };
}

// Administrador: Asignación manual de puntos positivos o negativos por comportamientos
export async function addManualPoints(
  userId: string,
  pointsDelta: number,
  description: string,
  type: "MANUAL" | "PENALTY" | "TASK_DONE" = "MANUAL"
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Usuario no encontrado");

  await prisma.$transaction(async (tx) => {
    // Si la resta es mayor que el saldo, dejamos 0 o permitimos saldo negativo si se desea
    const newBalance = Math.max(0, user.balance + pointsDelta);

    await tx.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });

    await tx.activityLog.create({
      data: {
        userId,
        pointsDelta,
        type: pointsDelta < 0 ? "PENALTY" : type,
        description,
      },
    });
  });

  await createFamilyNotification({
    title: pointsDelta > 0 ? `Bonificación para ${user.name}` : `Penalización para ${user.name}`,
    description: `${pointsDelta > 0 ? '+' : ''}${pointsDelta} pts: ${description}`,
    type: pointsDelta < 0 ? "PENALTY" : "MANUAL",
    pointsDelta,
    actorName: user.name,
    actorAvatar: user.avatarUrl,
  });

  revalidatePath("/");
  return { success: true };
}

// Administrador: Creación de tareas (personales o colectivas)
export async function createTask(data: {
  title: string;
  description?: string;
  points: number;
  recurrence: "DAILY" | "WEEKLY" | "ONCE";
  targetUserId?: string | null;
}) {
  await prisma.task.create({
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      points: Number(data.points),
      recurrence: data.recurrence,
      targetUserId: data.targetUserId && data.targetUserId !== "ALL" ? data.targetUserId : null,
      status: "PENDING",
    },
  });

  revalidatePath("/");
  return { success: true };
}

// Administrador: Modificar o editar tarea existente
export async function updateTask(
  taskId: string,
  data: {
    title: string;
    description?: string | null;
    points: number;
    recurrence: "DAILY" | "WEEKLY" | "ONCE";
    targetUserId?: string | null;
  }
) {
  await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      points: Number(data.points),
      recurrence: data.recurrence,
      targetUserId: data.targetUserId && data.targetUserId !== "ALL" ? data.targetUserId : null,
    },
  });

  revalidatePath("/");
  return { success: true };
}

// Administrador: Eliminar tarea
export async function deleteTask(taskId: string) {
  await prisma.task.delete({
    where: { id: taskId },
  });

  revalidatePath("/");
  return { success: true };
}

// Participante: Canjear recompensa
export async function redeemReward(rewardId: string, userId: string) {
  const [reward, user] = await Promise.all([
    prisma.reward.findUnique({ where: { id: rewardId } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (!reward) throw new Error("Recompensa no encontrada");
  if (!user) throw new Error("Usuario no encontrado");

  if (user.balance < reward.costPoints) {
    throw new Error("Saldo de puntos insuficiente para esta recompensa");
  }

  await prisma.$transaction(async (tx) => {
    // Reducir balance del usuario
    await tx.user.update({
      where: { id: userId },
      data: {
        balance: {
          decrement: reward.costPoints,
        },
      },
    });

    // Registrar en auditoría
    await tx.activityLog.create({
      data: {
        userId,
        pointsDelta: -reward.costPoints,
        type: "REWARD",
        description: `Canjeó recompensa: ${reward.title}`,
      },
    });

    // Crear registro visual de recompensa desbloqueada
    await tx.rewardRedemption.create({
      data: {
        userId,
        rewardId,
        title: reward.title,
        costPoints: reward.costPoints,
        icon: reward.icon || "Gift",
        status: "UNLOCKED",
      },
    });
  });

  await createFamilyNotification({
    title: `¡${user.name} canjeó un premio!`,
    description: `Desbloqueó: "${reward.title}" (-${reward.costPoints} pts)`,
    type: "REWARD_CLAIMED",
    pointsDelta: -reward.costPoints,
    actorName: user.name,
    actorAvatar: user.avatarUrl,
  });

  revalidatePath("/");
  return { success: true };
}

// Administrador: Crear nueva recompensa
export async function createReward(data: {
  title: string;
  costPoints: number;
  description?: string;
  icon?: string;
}) {
  await prisma.reward.create({
    data: {
      title: data.title.trim(),
      costPoints: Number(data.costPoints),
      description: data.description?.trim() || null,
      icon: data.icon || "Gift",
    },
  });

  revalidatePath("/");
  return { success: true };
}

// Administrador: Actualizar recompensa existente
export async function updateReward(
  rewardId: string,
  data: {
    title: string;
    costPoints: number;
    description?: string;
    icon?: string;
  }
) {
  await prisma.reward.update({
    where: { id: rewardId },
    data: {
      title: data.title.trim(),
      costPoints: Number(data.costPoints),
      description: data.description?.trim() || null,
      icon: data.icon || "Gift",
    },
  });

  revalidatePath("/");
  return { success: true };
}

// Administrador: Eliminar recompensa
export async function deleteReward(rewardId: string) {
  await prisma.reward.delete({
    where: { id: rewardId },
  });

  revalidatePath("/");
  return { success: true };
}

// Administrador: Actualizar usuario existente
export async function updateUser(
  userId: string,
  data: {
    name: string;
    role: "ADMIN" | "MEMBER";
    pin?: string | null;
    balance?: number;
    avatarUrl?: string | null;
    isActive?: boolean;
  }
) {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) throw new Error("Usuario no encontrado");

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name.trim(),
      role: data.role,
      pin: data.pin?.trim() || (data.role === "ADMIN" ? "1234" : null),
      ...(typeof data.balance === "number" ? { balance: data.balance } : {}),
      ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
      ...(typeof data.isActive === "boolean" ? { isActive: data.isActive } : {}),
    },
  });

  revalidatePath("/");
  return { success: true };
}

// Administrador: Activar o Desactivar usuario
export async function toggleUserActive(userId: string) {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!existingUser) throw new Error("Usuario no encontrado");

  // Si es el único admin, evitar desactivarlo
  if (existingUser.role === "ADMIN" && existingUser.isActive) {
    const activeAdmins = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });
    if (activeAdmins <= 1) {
      throw new Error("No puedes desactivar el único administrador activo de la familia");
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isActive: !existingUser.isActive },
  });

  revalidatePath("/");
  return { success: true, isActive: updated.isActive };
}

// Administrador: Crear nuevo miembro de la familia
export async function createUser(data: {
  name: string;
  role: "ADMIN" | "MEMBER";
  pin?: string | null;
  balance?: number;
  avatarUrl?: string | null;
  isActive?: boolean;
}) {
  const newUser = await prisma.user.create({
    data: {
      name: data.name.trim(),
      role: data.role,
      pin: data.pin?.trim() || (data.role === "ADMIN" ? "1234" : "0000"),
      balance: data.balance ?? 0,
      isActive: typeof data.isActive === "boolean" ? data.isActive : true,
      avatarUrl:
        data.avatarUrl ||
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
          data.name.trim()
        )}`,
    },
  });

  revalidatePath("/");
  return { success: true, user: newUser };
}

// Administrador: Eliminar usuario
export async function deleteUser(userId: string) {
  const userCount = await prisma.user.count();
  if (userCount <= 1) {
    throw new Error("No puedes eliminar el único usuario existente");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/");
  return { success: true };
}

// Administrador o Usuario: Actualizar PIN personal del padre/madre
export async function updateUserPin(userId: string, newPin: string) {
  const cleanPin = newPin.trim();
  if (cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
    throw new Error("El PIN debe tener exactamente 4 dígitos numéricos");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { pin: cleanPin },
  });

  revalidatePath("/");
  return { success: true };
}

// Administrador: Marcar recompensa canjeada como entregada/disfrutada
export async function markRewardDelivered(redemptionId: string) {
  await prisma.rewardRedemption.update({
    where: { id: redemptionId },
    data: { status: "DELIVERED" },
  });

  revalidatePath("/");
  return { success: true };
}

// Usuario: Marcar notificaciones como leídas (el puntito rojo desaparece en tiempo real SOLO para este usuario)
export async function markUserNotificationsRead(userId: string) {
  const notifications = await prisma.notification.findMany({
    select: { id: true },
    take: 50,
  });

  await prisma.$transaction(
    notifications.map((n) =>
      prisma.notificationState.upsert({
        where: {
          notificationId_userId: {
            notificationId: n.id,
            userId,
          },
        },
        update: {
          isRead: true,
          readAt: new Date(),
        },
        create: {
          notificationId: n.id,
          userId,
          isRead: true,
          isDismissed: false,
          readAt: new Date(),
        },
      })
    )
  );

  revalidatePath("/");
  return { success: true };
}

// Usuario: Borrar una notificación individual de su bandeja
export async function deleteUserNotification(notificationId: string, userId: string) {
  await prisma.notificationState.upsert({
    where: {
      notificationId_userId: {
        notificationId,
        userId,
      },
    },
    update: {
      isDismissed: true,
      isRead: true,
    },
    create: {
      notificationId,
      userId,
      isRead: true,
      isDismissed: true,
    },
  });

  revalidatePath("/");
  return { success: true };
}

// Usuario: Borrar todas las notificaciones de su bandeja
export async function clearAllUserNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    select: { id: true },
    take: 60,
  });

  await prisma.$transaction(
    notifications.map((n) =>
      prisma.notificationState.upsert({
        where: {
          notificationId_userId: {
            notificationId: n.id,
            userId,
          },
        },
        update: {
          isDismissed: true,
          isRead: true,
        },
        create: {
          notificationId: n.id,
          userId,
          isRead: true,
          isDismissed: true,
        },
      })
    )
  );

  revalidatePath("/");
  return { success: true };
}

// Administrador: Exportar copia de seguridad completa (Tareas, Premios y Usuarios)
export async function exportBackupData() {
  const [tasks, rewards, users] = await Promise.all([
    prisma.task.findMany({
      include: {
        targetUser: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.reward.findMany({
      orderBy: { costPoints: "asc" },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const backup = {
    version: "1.0",
    appName: "Paganini",
    exportedAt: new Date().toISOString(),
    counts: {
      tasks: tasks.length,
      rewards: rewards.length,
      users: users.length,
    },
    tasks: tasks.map((t) => ({
      title: t.title,
      description: t.description,
      points: t.points,
      recurrence: t.recurrence,
      targetUserName: t.targetUser?.name || null,
    })),
    rewards: rewards.map((r) => ({
      title: r.title,
      costPoints: r.costPoints,
      description: r.description,
      icon: r.icon,
    })),
    users: users.map((u) => ({
      name: u.name,
      role: u.role,
      balance: u.balance,
      avatarUrl: u.avatarUrl,
      isActive: u.isActive,
    })),
  };

  return backup;
}

// Administrador: Restaurar copia de seguridad desde objeto JSON
export async function restoreBackupData(
  payload: {
    tasks?: Array<{
      title: string;
      description?: string | null;
      points: number;
      recurrence: string;
      targetUserName?: string | null;
    }>;
    rewards?: Array<{
      title: string;
      costPoints: number;
      description?: string | null;
      icon?: string | null;
    }>;
    users?: Array<{
      name: string;
      role: string;
      balance?: number;
      avatarUrl?: string | null;
      isActive?: boolean;
    }>;
  },
  options?: { restoreUsers?: boolean }
) {
  if (!payload || typeof payload !== "object") {
    throw new Error("El archivo de copia de seguridad no tiene un formato válido");
  }

  // 1. Opcional: sincronizar usuarios
  if (options?.restoreUsers && Array.isArray(payload.users)) {
    for (const u of payload.users) {
      if (!u.name) continue;
      const existing = await prisma.user.findFirst({
        where: { name: { equals: u.name } },
      });
      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            role: u.role || existing.role,
            avatarUrl: u.avatarUrl || existing.avatarUrl,
            isActive: typeof u.isActive === "boolean" ? u.isActive : existing.isActive,
          },
        });
      } else {
        await prisma.user.create({
          data: {
            name: u.name,
            role: u.role || "MEMBER",
            balance: u.balance ?? 0,
            avatarUrl: u.avatarUrl || null,
            isActive: typeof u.isActive === "boolean" ? u.isActive : true,
          },
        });
      }
    }
  }

  // Obtener usuarios actuales para mapear targetUserId por nombre
  const currentUsers = await prisma.user.findMany({ select: { id: true, name: true } });
  const userMapByName = new Map(currentUsers.map((u) => [u.name.toLowerCase().trim(), u.id]));

  // 2. Restaurar Premios
  if (Array.isArray(payload.rewards)) {
    for (const r of payload.rewards) {
      if (!r.title || typeof r.costPoints !== "number") continue;
      const existingReward = await prisma.reward.findFirst({
        where: { title: { equals: r.title.trim() } },
      });
      if (existingReward) {
        await prisma.reward.update({
          where: { id: existingReward.id },
          data: {
            costPoints: r.costPoints,
            description: r.description || existingReward.description,
            icon: r.icon || existingReward.icon,
          },
        });
      } else {
        await prisma.reward.create({
          data: {
            title: r.title.trim(),
            costPoints: r.costPoints,
            description: r.description || null,
            icon: r.icon || "Gift",
          },
        });
      }
    }
  }

  // 3. Restaurar Tareas
  if (Array.isArray(payload.tasks)) {
    for (const t of payload.tasks) {
      if (!t.title || typeof t.points !== "number") continue;
      const targetUserId = t.targetUserName
        ? userMapByName.get(t.targetUserName.toLowerCase().trim()) || null
        : null;

      const existingTask = await prisma.task.findFirst({
        where: {
          title: { equals: t.title.trim() },
          recurrence: t.recurrence,
        },
      });

      if (existingTask) {
        await prisma.task.update({
          where: { id: existingTask.id },
          data: {
            description: t.description || existingTask.description,
            points: t.points,
            targetUserId: targetUserId ?? existingTask.targetUserId,
          },
        });
      } else {
        await prisma.task.create({
          data: {
            title: t.title.trim(),
            description: t.description || null,
            points: t.points,
            recurrence: t.recurrence || "DAILY",
            targetUserId,
            status: "PENDING",
          },
        });
      }
    }
  }

  revalidatePath("/");
  return { success: true };
}



