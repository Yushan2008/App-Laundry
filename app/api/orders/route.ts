import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where =
    session.user.role === "ADMIN"
      ? status ? { status: status as never } : {}
      : { userId: session.user.id, ...(status ? { status: status as never } : {}) };

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      package: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
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
    const { packageId, notes } = await req.json();

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
