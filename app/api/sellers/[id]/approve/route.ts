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
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { isApproved } = await req.json();

    const seller = await prisma.user.findUnique({
      where: { id, role: "SELLER" },
      include: { sellerProfile: true },
    });
    if (!seller || !seller.sellerProfile) {
      return NextResponse.json({ error: "Seller tidak ditemukan" }, { status: 404 });
    }

    await prisma.sellerProfile.update({
      where: { userId: id },
      data: { isApproved },
    });

    await createNotification(
      id,
      isApproved ? "Akun Seller Disetujui" : "Pendaftaran Seller Ditolak",
      isApproved
        ? "Selamat! Akun seller Anda telah disetujui. Anda sekarang dapat menerima pesanan."
        : "Maaf, pendaftaran seller Anda belum disetujui. Silakan hubungi admin untuk informasi lebih lanjut.",
      isApproved ? "SELLER_APPROVED" : "SELLER_REJECTED"
    );

    return NextResponse.json({ success: true, isApproved });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
