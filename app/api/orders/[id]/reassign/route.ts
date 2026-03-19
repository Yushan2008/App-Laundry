import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { haversineDistance, calculateDeliveryFee } from "@/lib/haversine";
import { createNotification } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Hanya admin yang dapat re-assign seller" }, { status: 401 });
    }

    const { id } = await params;
    const { reason, newSellerId } = await req.json();

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "Alasan re-assign wajib diisi (minimal 5 karakter)" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { package: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }
    if (["DELIVERED", "CANCELLED"].includes(order.status)) {
      return NextResponse.json({ error: "Pesanan ini tidak dapat di-reassign" }, { status: 400 });
    }

    const prevSellerId = order.sellerId;

    let newDeliveryFee = order.deliveryFee;

    // Jika newSellerId diberikan, assign ke seller tertentu
    if (newSellerId) {
      const newSeller = await prisma.sellerProfile.findUnique({
        where: { userId: newSellerId },
      });
      if (!newSeller) {
        return NextResponse.json({ error: "Seller baru tidak ditemukan" }, { status: 404 });
      }
      if (!newSeller.isApproved) {
        return NextResponse.json({ error: "Seller baru belum diapprove" }, { status: 400 });
      }

      // Hitung ulang ongkir
      if (order.customerLat && order.customerLng) {
        const dist = haversineDistance(
          newSeller.latitude,
          newSeller.longitude,
          order.customerLat,
          order.customerLng
        );
        newDeliveryFee = calculateDeliveryFee(dist, order.package.name);
      }
    }

    // Update pesanan
    const updated = await prisma.order.update({
      where: { id },
      data: {
        sellerId: newSellerId || null,
        deliveryFee: newSellerId ? newDeliveryFee : null,
        status: newSellerId ? "CONFIRMED" : "PENDING",
        statusHistory: {
          create: {
            status: newSellerId ? "CONFIRMED" : "PENDING",
            description: `[Admin] Re-assign seller. Alasan: ${reason.trim()}${newSellerId ? `. Dialihkan ke seller baru.` : ` Pesanan dikembalikan ke antrian (PENDING).`}`,
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

    // Notifikasi ke seller lama
    if (prevSellerId) {
      await createNotification(
        prevSellerId,
        "Pesanan Dialihkan",
        `Pesanan #${order.orderNumber} telah dialihkan dari Anda oleh admin. Alasan: ${reason.trim()}`,
        "STATUS_UPDATE",
        id
      );
    }

    // Notifikasi ke seller baru
    if (newSellerId && newSellerId !== prevSellerId) {
      await createNotification(
        newSellerId,
        "Pesanan Baru Ditetapkan",
        `Pesanan #${order.orderNumber} telah ditetapkan kepada Anda oleh admin.`,
        "ORDER_ASSIGNED",
        id
      );
    }

    // Notifikasi ke pelanggan
    await createNotification(
      order.userId,
      "Seller Pesanan Diubah",
      `Admin telah mengubah seller untuk pesanan #${order.orderNumber}. ${newSellerId ? "Seller baru akan segera menghubungi Anda." : "Pesanan Anda sedang mencari seller baru."}`,
      "STATUS_UPDATE",
      id
    );

    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
