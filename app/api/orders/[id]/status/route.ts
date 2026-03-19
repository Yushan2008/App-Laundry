import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@prisma/client";
import { createNotification } from "@/lib/notifications";

// Seller mengelola semua status kecuali PROCESSING (diatur via /weight endpoint)
const SELLER_STATUSES: string[] = [
  "CONFIRMED",
  "PICKED_UP",
  "WASHING",
  "DRYING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu seller",
  CONFIRMED: "Dikonfirmasi seller",
  PICKED_UP: "Dijemput seller",
  PROCESSING: "Berat dikonfirmasi, sedang diproses",
  WASHING: "Sedang dicuci",
  DRYING: "Sedang dikeringkan & disetrika",
  READY: "Siap diantarkan",
  OUT_FOR_DELIVERY: "Dalam perjalanan ke pelanggan",
  DELIVERED: "Selesai — cucian telah diterima",
  CANCELLED: "Dibatalkan",
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "CUSTOMER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status, description } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id },
      include: { package: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    // === SELLER ===
    if (session.user.role === "SELLER") {
      if (order.sellerId !== session.user.id) {
        return NextResponse.json({ error: "Pesanan ini bukan milik Anda" }, { status: 403 });
      }
      if (!SELLER_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: `Status "${status}" tidak dapat diubah melalui endpoint ini. Gunakan endpoint /weight untuk konfirmasi berat.` },
          { status: 400 }
        );
      }
    }

    // === ADMIN ===
    if (session.user.role === "ADMIN") {
      // Admin tidak bisa ubah status pesanan yang sudah dikelola seller
      if (order.sellerId) {
        return NextResponse.json(
          { error: "Pesanan ini sedang dikelola oleh seller. Gunakan fitur Cancel atau Re-assign jika ada masalah." },
          { status: 403 }
        );
      }
      // Admin hanya bisa update pesanan PENDING yang belum ada seller
      if (!["PENDING", "CONFIRMED"].includes(status)) {
        return NextResponse.json(
          { error: "Admin hanya dapat mengubah status pesanan yang belum diambil seller" },
          { status: 400 }
        );
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            description: description || STATUS_LABELS[status] || null,
          },
        },
      },
      include: {
        package: true,
        user: { select: { id: true, name: true, email: true, phone: true, address: true } },
        seller: { select: { id: true, name: true, email: true, phone: true, sellerProfile: { select: { businessName: true } } } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    // Notifikasi ke pelanggan
    await createNotification(
      order.userId,
      "Status Pesanan Diperbarui",
      `Pesanan #${order.orderNumber} — ${STATUS_LABELS[status] ?? status}`,
      "STATUS_UPDATE",
      id
    );

    // Notifikasi ke seller saat READY (siap diantar)
    if (status === "READY" && order.sellerId) {
      await createNotification(
        order.sellerId,
        "Cucian Siap Diantarkan",
        `Pesanan #${order.orderNumber} sudah selesai diproses dan siap diantarkan ke pelanggan.`,
        "STATUS_UPDATE",
        id
      );
    }

    return NextResponse.json({ order: updatedOrder });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
