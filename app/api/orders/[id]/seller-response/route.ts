import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { haversineDistance, calculateDeliveryFee } from "@/lib/haversine";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json(); // "accept" | "decline"

    const order = await prisma.order.findUnique({
      where: { id },
      include: { package: true, user: true },
    });

    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    if (order.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Pesanan ini bukan untuk Anda" }, { status: 403 });
    }

    if (action === "accept") {
      await prisma.order.update({
        where: { id },
        data: {
          statusHistory: {
            create: {
              status: "CONFIRMED",
              description: `Seller ${session.user.name} menerima pesanan dan akan segera menjemput.`,
            },
          },
        },
      });

      await createNotification(
        order.userId,
        "Seller Menerima Pesanan",
        `Seller akan segera menuju lokasi Anda untuk menjemput cucian.`,
        "STATUS_UPDATE",
        id
      );

      return NextResponse.json({ success: true, action: "accepted" });
    }

    if (action === "decline") {
      // Reset seller dari order
      await prisma.order.update({
        where: { id },
        data: { sellerId: null, deliveryFee: null },
      });

      // Notifikasi admin untuk re-assign
      const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
      await Promise.all(
        admins.map((admin) =>
          createNotification(
            admin.id,
            "Seller Menolak Pesanan",
            `Seller menolak pesanan #${order.orderNumber}. Silakan assign ulang seller lain.`,
            "ORDER_DECLINED",
            id
          )
        )
      );

      // Coba re-assign ke seller berikutnya (lewati seller yang menolak)
      if (order.customerLat && order.customerLng) {
        const sellers = await prisma.sellerProfile.findMany({
          where: {
            isApproved: true,
            isAvailable: true,
            userId: { not: session.user.id }, // lewati seller yang menolak
          },
          include: { user: { select: { id: true, name: true } } },
        });

        const next = sellers
          .map((s) => ({
            ...s,
            distance: haversineDistance(s.latitude, s.longitude, order.customerLat!, order.customerLng!),
          }))
          .filter((s) => s.distance <= 5)
          .sort((a, b) => a.distance - b.distance)[0];

        if (next) {
          const deliveryFee = calculateDeliveryFee(next.distance, order.package.name);
          await prisma.order.update({
            where: { id },
            data: { sellerId: next.userId, deliveryFee },
          });
          await createNotification(
            next.userId,
            "Pesanan Baru Ditugaskan",
            `Anda ditugaskan untuk pesanan #${order.orderNumber}.`,
            "ORDER_ASSIGNED",
            id
          );
        }
      }

      return NextResponse.json({ success: true, action: "declined" });
    }

    return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
