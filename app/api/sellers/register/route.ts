import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      address,
      latitude,
      longitude,
      operatingHours,
      serviceArea,
      photoUrl,
    } = await req.json();

    if (!name || !email || !password || !businessName || !address || !latitude || !longitude || !operatingHours || !serviceArea) {
      return NextResponse.json(
        { error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: "SELLER",
        sellerProfile: {
          create: {
            businessName,
            address,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            operatingHours,
            serviceArea,
            photoUrl: photoUrl || null,
            isApproved: false,
          },
        },
      },
      include: { sellerProfile: true },
      omit: { password: true },
    });

    // Notifikasi ke semua admin
    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    await Promise.all(
      admins.map((admin) =>
        createNotification(
          admin.id,
          "Pendaftaran Seller Baru",
          `${businessName} (${email}) telah mendaftar sebagai seller. Silakan review dan approve.`,
          "NEW_SELLER_REGISTRATION"
        )
      )
    );

    return NextResponse.json({ user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Terjadi kesalahan" }, { status: 500 });
  }
}
