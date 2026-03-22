import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Endpoint polling: customer/admin ambil lokasi GPS seller terkini dari DB
// Digunakan sebagai fallback ketika Socket.io tidak tersedia
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        sellerId: true,
        seller: {
          select: {
            sellerProfile: {
              select: { currentLat: true, currentLng: true },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    if (!order.sellerId || !order.seller?.sellerProfile) {
      return NextResponse.json({ lat: null, lng: null });
    }

    const { currentLat: lat, currentLng: lng } = order.seller.sellerProfile;

    return NextResponse.json({ lat, lng });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
