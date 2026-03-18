import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { weight } = await req.json();

    if (!weight || typeof weight !== "number" || weight <= 0) {
      return NextResponse.json(
        { error: "Berat harus diisi dan lebih dari 0 kg" },
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

    const totalPrice = Math.round(order.package.pricePerKg * weight);

    const updated = await prisma.order.update({
      where: { id },
      data: { weight, totalPrice },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, address: true } },
        package: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
