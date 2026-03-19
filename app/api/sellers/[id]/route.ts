import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SELLER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const seller = await prisma.user.findUnique({
      where: { id, role: "SELLER" },
      include: {
        sellerProfile: true,
        sellerOrders: {
          include: { package: true, user: { select: { name: true, phone: true, address: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
      omit: { password: true },
    });

    if (!seller) return NextResponse.json({ error: "Seller tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ seller });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Seller hanya bisa update profil sendiri
    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { businessName, address, latitude, longitude, operatingHours, serviceArea, photoUrl } = await req.json();

    const updated = await prisma.sellerProfile.update({
      where: { userId: id },
      data: {
        businessName,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        operatingHours,
        serviceArea,
        photoUrl: photoUrl || null,
      },
    });

    return NextResponse.json({ sellerProfile: updated });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
