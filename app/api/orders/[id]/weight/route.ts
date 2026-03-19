import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Hanya seller yang dapat mengkonfirmasi berat" }, { status: 401 });
    }

    const { id } = await params;
    const { weight, weightProofUrl } = await req.json();

    if (!weight || typeof weight !== "number" || weight <= 0) {
      return NextResponse.json({ error: "Berat harus lebih dari 0 kg" }, { status: 400 });
    }
    if (!weightProofUrl) {
      return NextResponse.json(
        { error: "Foto bukti timbangan wajib dilampirkan untuk mencegah kecurangan" },
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
    if (order.sellerId !== session.user.id) {
      return NextResponse.json({ error: "Pesanan ini bukan milik Anda" }, { status: 403 });
    }
    if (order.status !== "PICKED_UP") {
      return NextResponse.json(
        { error: "Konfirmasi berat hanya bisa dilakukan setelah cucian dijemput (status PICKED_UP)" },
        { status: 400 }
      );
    }

    const totalPrice = Math.round(order.package.pricePerKg * weight);
    const total = totalPrice + (order.deliveryFee ?? 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (prisma.order.update as any)({
      where: { id },
      data: {
        weight,
        weightProofUrl,
        totalPrice,
        status: "PROCESSING",
        statusHistory: {
          create: {
            status: "PROCESSING",
            description: `Berat dikonfirmasi oleh seller: ${weight} kg. Biaya laundry: Rp ${totalPrice.toLocaleString("id-ID")}. Total: Rp ${total.toLocaleString("id-ID")}`,
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
      "Berat Cucian Dikonfirmasi",
      `Berat cucian Anda: ${weight} kg. Biaya laundry: Rp ${totalPrice.toLocaleString("id-ID")} + Ongkir: Rp ${(order.deliveryFee ?? 0).toLocaleString("id-ID")} = Total: Rp ${total.toLocaleString("id-ID")}`,
      "STATUS_UPDATE",
      id
    );

    return NextResponse.json({ order: updated });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
