export type Role = "ADMIN" | "MEMBER";
export type Recurrence = "DAILY" | "WEEKLY" | "ONCE";
export type TaskStatus = "PENDING" | "IN_REVIEW" | "COMPLETED";
export type ActivityType = "TASK_DONE" | "PENALTY" | "REWARD" | "MANUAL";

export interface UserDTO {
  id: string;
  name: string;
  role: string;
  pin?: string | null;
  balance: number;
  avatarUrl?: string | null;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDTO {
  id: string;
  title: string;
  description?: string | null;
  points: number;
  recurrence: string;
  status: string;
  targetUserId?: string | null;
  targetUser?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
  submittedByUserId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLogDTO {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  pointsDelta: number;
  type: string;
  description: string;
  createdAt: Date;
}

export interface RewardDTO {
  id: string;
  title: string;
  costPoints: number;
  icon?: string | null;
  description?: string | null;
  createdAt: Date;
}

export interface RewardRedemptionDTO {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
  rewardId: string;
  title: string;
  costPoints: number;
  icon?: string | null;
  status: string; // "UNLOCKED" | "DELIVERED"
  createdAt: Date;
}

export interface NotificationStateDTO {
  id: string;
  notificationId: string;
  userId: string;
  isRead: boolean;
  isDismissed: boolean;
  readAt?: Date | null;
  createdAt: Date;
}

export interface NotificationDTO {
  id: string;
  title: string;
  description: string;
  type: string;
  pointsDelta?: number | null;
  actorName: string;
  actorAvatar?: string | null;
  createdAt: Date;
  userStates: NotificationStateDTO[];
}

export interface FamilyAppData {
  users: UserDTO[];
  tasks: TaskDTO[];
  rewards: RewardDTO[];
  logs: ActivityLogDTO[];
  redemptions: RewardRedemptionDTO[];
  notifications: NotificationDTO[];
  dbMode?: "SUPABASE" | "LOCAL";
}
