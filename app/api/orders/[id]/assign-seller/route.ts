import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { haversineDistance, calculateDeliveryFee } from "@/lib/haversine";
import { createNotification } from "@/lib/notifications";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { package: true },
    });

    if (!order) return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });

    // Ambil semua seller yang approved dan available
    const sellers = await prisma.sellerProfile.findMany({
      where: { isApproved: true, isAvailable: true },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (sellers.length === 0) {
      return NextResponse.json(
        { error: "Tidak ada seller yang tersedia saat ini" },
        { status: 404 }
      );
    }

    type SellerWithDistance = (typeof sellers)[number] & { distance: number };
    let nearest: SellerWithDistance = { ...sellers[0], distance: 0 };
    let deliveryFee = 0;

    if (order.customerLat && order.customerLng) {
      // Hitung jarak Haversine ke setiap seller dan filter ≤5km
      const sellersWithDistance: SellerWithDistance[] = sellers
        .map((s) => ({
          ...s,
          distance: haversineDistance(s.latitude, s.longitude, order.customerLat!, order.customerLng!),
        }))
        .filter((s) => s.distance <= 5)
        .sort((a, b) => a.distance - b.distance);

      if (sellersWithDistance.length === 0) {
        return NextResponse.json(
          { error: "Tidak ada seller dalam radius 5 km dari lokasi pelanggan" },
          { status: 404 }
        );
      }

      nearest = sellersWithDistance[0];
      deliveryFee = calculateDeliveryFee(nearest.distance, order.package.name);
    } else {
      // Tanpa koordinat — assign seller pertama yang tersedia
      deliveryFee = calculateDeliveryFee(0, order.package.name);
    }

    // Update order dengan seller
    const updated = await prisma.order.update({
      where: { id },
      data: {
        sellerId: nearest.userId,
        deliveryFee,
        status: "CONFIRMED",
        statusHistory: {
          create: {
            status: "CONFIRMED",
            description: `Pesanan dikonfirmasi. Seller ${nearest.user.name} ditugaskan (jarak: ${nearest.distance.toFixed(1)} km).`,
          },
        },
      },
      include: {
        package: true,
        user: { select: { id: true, name: true, email: true, phone: true, address: true } },
        seller: { select: { id: true, name: true, email: true, phone: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    // Notifikasi ke seller
    await createNotification(
      nearest.userId,
      "Pesanan Baru Ditugaskan",
      `Anda ditugaskan untuk pesanan #${order.orderNumber}. Silakan segera jemput cucian pelanggan.`,
      "ORDER_ASSIGNED",
      id
    );

    // Notifikasi ke customer
    await createNotification(
      order.userId,
      "Seller Sedang Dalam Perjalanan",
      `Pesanan #${order.orderNumber} telah dikonfirmasi. Seller ${nearest.user.name} akan segera menjemput cucian Anda.`,
      "STATUS_UPDATE",
      id
    );

    return NextResponse.json({ order: updated, sellerDistance: nearest.distance.toFixed(2) });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
