import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { haversineDistance } from "@/lib/haversine";

const ORDER_INCLUDE = {
  user: { select: { id: true, name: true, email: true, phone: true, address: true } },
  seller: { select: { id: true, name: true, phone: true, sellerProfile: { select: { businessName: true } } } },
  package: true,
  statusHistory: { orderBy: { createdAt: "desc" as const } },
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const statusFilter = status ? { status: status as never } : {};

  // === SELLER: own orders + nearby PENDING ===
  if (session.user.role === "SELLER") {
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Pesanan milik seller ini
    const myOrders = await prisma.order.findMany({
      where: { sellerId: session.user.id, ...statusFilter },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
    });

    // PENDING orders di sekitar (radius ≤5km), belum diambil siapapun
    let nearbyOrders: (typeof myOrders[0] & { distance?: number })[] = [];
    if (sellerProfile) {
      const pendingOrders = await prisma.order.findMany({
        where: {
          status: "PENDING",
          sellerId: null,
          customerLat: { not: null },
          customerLng: { not: null },
        },
        include: ORDER_INCLUDE,
        orderBy: { createdAt: "desc" },
      });

      nearbyOrders = pendingOrders
        .map((o) => {
          const dist = haversineDistance(
            sellerProfile.latitude,
            sellerProfile.longitude,
            o.customerLat!,
            o.customerLng!
          );
          return { ...o, distance: dist };
        })
        .filter((o) => o.distance <= 5)
        .sort((a, b) => a.distance - b.distance);
    }

    return NextResponse.json({ orders: myOrders, nearbyOrders });
  }

  // === ADMIN: semua pesanan ===
  if (session.user.role === "ADMIN") {
    const orders = await prisma.order.findMany({
      where: statusFilter,
      include: ORDER_INCLUDE,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  }

  // === CUSTOMER: pesanan sendiri ===
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, ...statusFilter },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "CUSTOMER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { packageId, notes, customerLat, customerLng } = await req.json();

    if (!packageId) {
      return NextResponse.json(
        { error: "Paket laundry wajib dipilih" },
        { status: 400 }
      );
    }

    const pkg = await prisma.package.findUnique({ where: { id: packageId } });
    if (!pkg) {
      return NextResponse.json({ error: "Paket tidak ditemukan" }, { status: 404 });
    }

    // Generate nomor order unik: SL-YYYYMMDD-XXX
    const today = new Date();
    const dateStr = today
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    });
    const orderNumber = `SL-${dateStr}-${String(count + 1).padStart(3, "0")}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        packageId,
        notes: notes || null,
        customerLat: customerLat ? parseFloat(customerLat) : null,
        customerLng: customerLng ? parseFloat(customerLng) : null,
        statusHistory: {
          create: {
            status: "PENDING",
            description: "Pesanan berhasil dibuat, menunggu konfirmasi admin",
          },
        },
      },
      include: { package: true, statusHistory: true },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
