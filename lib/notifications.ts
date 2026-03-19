import { prisma } from "./prisma";

export type NotificationType =
  | "ORDER_ASSIGNED"
  | "ORDER_ACCEPTED"
  | "ORDER_DECLINED"
  | "STATUS_UPDATE"
  | "SELLER_APPROVED"
  | "SELLER_REJECTED"
  | "NEW_SELLER_REGISTRATION";

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  orderId?: string
) {
  return prisma.notification.create({
    data: { userId, title, message, type, orderId: orderId || null },
  });
}
