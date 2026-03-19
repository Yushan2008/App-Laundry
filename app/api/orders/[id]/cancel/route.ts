import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya admin yang dapat membatalkan pesanan" }, { status: 401 });
    }

    const { id } = await params;
    const { reason } = await req.json();

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "Alasan pembatalan wajib diisi (minimal 5 karakter)" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((order.status as any) === "CANCELLED") {
      return NextResponse.json({ error: "Pesanan sudah dibatalkan" }, { status: 400 });
    }
    if (order.status === "DELIVERED") {
      return NextResponse.json({ error: "Pesanan yang sudah selesai tidak dapat dibatalkan" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (prisma.order.update as any)({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelReason: reason.trim(),
        statusHistory: {
          create: {
            status: "CANCELLED",
            description: `[Admin] Dibatalkan oleh admin. Alasan: ${reason.trim()}`,
          },
        },
      },
      include: {
        package: true,
        user: { select: { id: true, name: true, email: true, phone: true, address: true } },
        seller: { select: { id: true, name: true, phone: true, sellerProfile: { select: { businessName: true } } } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    // Notifikasi ke pelanggan
    await createNotification(
      order.userId,
      "Pesanan Dibatalkan",
      `Pesanan #${order.orderNumber} telah dibatalkan oleh admin. Alasan: ${reason.trim()}`,
      "STATUS_UPDATE",
      id
    );

    // Notifikasi ke seller jika ada
    if (order.sellerId) {
      await createNotification(
        order.sellerId,
        "Pesanan Dibatalkan Admin",
        `Pesanan #${order.orderNumber} yang sedang Anda kelola telah dibatalkan admin. Alasan: ${reason.trim()}`,
        "STATUS_UPDATE",
        id
      );
    }

    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
