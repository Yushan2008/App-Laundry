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
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Cek profil seller
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!sellerProfile) {
      return NextResponse.json({ error: "Profil seller tidak ditemukan" }, { status: 400 });
    }
    if (!sellerProfile.isApproved) {
      return NextResponse.json({ error: "Akun seller belum diapprove admin" }, { status: 403 });
    }

    // Cek pesanan
    const order = await prisma.order.findUnique({
      where: { id },
      include: { package: true, user: { select: { name: true } } },
    });
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }
    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "Pesanan ini sudah tidak tersedia" }, { status: 400 });
    }
    if (order.sellerId) {
      return NextResponse.json({ error: "Pesanan ini sudah diambil oleh seller lain" }, { status: 409 });
    }

    // Cek jarak
    if (!order.customerLat || !order.customerLng) {
      return NextResponse.json({ error: "Lokasi pelanggan tidak tersedia" }, { status: 400 });
    }
    const distance = haversineDistance(
      sellerProfile.latitude,
      sellerProfile.longitude,
      order.customerLat,
      order.customerLng
    );
    if (distance > 5) {
      return NextResponse.json(
        { error: `Pesanan di luar jangkauan (${distance.toFixed(1)} km > 5 km)` },
        { status: 400 }
      );
    }

    // Hitung ongkir
    const deliveryFee = calculateDeliveryFee(distance, order.package.name);

    // Ambil pesanan
    const updated = await prisma.order.update({
      where: { id },
      data: {
        sellerId: session.user.id,
        deliveryFee,
        status: "CONFIRMED",
        statusHistory: {
          create: {
            status: "CONFIRMED",
            description: `Diambil oleh ${sellerProfile.businessName} (jarak ${distance.toFixed(1)} km). Ongkir: Rp ${deliveryFee.toLocaleString("id-ID")}`,
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
      "Pesanan Dikonfirmasi",
      `Pesanan #${order.orderNumber} diambil oleh ${sellerProfile.businessName}. Seller akan segera menjemput cucian Anda. Ongkir: Rp ${deliveryFee.toLocaleString("id-ID")}`,
      "ORDER_ASSIGNED",
      id
    );

    // Notifikasi ke semua admin
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    await Promise.all(
      admins.map((a) =>
        createNotification(
          a.id,
          "Pesanan Diambil Seller",
          `Pesanan #${order.orderNumber} telah diambil oleh ${sellerProfile.businessName}`,
          "ORDER_ASSIGNED",
          id
        )
      )
    );

    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
