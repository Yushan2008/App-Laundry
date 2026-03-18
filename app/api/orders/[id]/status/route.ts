import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "WASHING",
  "DRYING",
  "READY",
  "DELIVERED",
];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status, description } = await req.json();

    if (!STATUS_ORDER.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        statusHistory: {
          create: {
            status,
            description: description || null,
          },
        },
      },
      include: {
        package: true,
        user: { select: { id: true, name: true, email: true } },
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
