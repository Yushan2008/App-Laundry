import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hapus data lama
  await prisma.statusHistory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.package.deleteMany();
  await prisma.user.deleteMany();

  // Buat admin
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      name: "Admin Signature Laundry",
      email: "admin@signaturelaundry.com",
      password: hashedPassword,
      role: "ADMIN",
      phone: "08123456789",
      address: "Jl. Laundry No. 1",
    },
  });

  // Buat paket laundry
  await prisma.package.createMany({
    data: [
      {
        name: "Reguler",
        pricePerKg: 5000,
        durationDays: 3,
        description:
          "Layanan cuci + setrika standar. Cocok untuk cucian biasa dengan estimasi selesai 3 hari kerja.",
      },
      {
        name: "Express",
        pricePerKg: 10000,
        durationDays: 1,
        description:
          "Layanan cuci + setrika prioritas. Pesanan diproses lebih cepat dengan estimasi selesai 1 hari kerja.",
      },
    ],
  });

  console.log("✅ Seed berhasil!");
  console.log("📧 Admin: admin@signaturelaundry.com | 🔑 Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
