"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    // Hapus data lama
    await prisma.statusHistory.deleteMany();
    await prisma.order.deleteMany();
    await prisma.package.deleteMany();
    await prisma.user.deleteMany();
    // Buat admin
    const hashedPassword = await bcryptjs_1.default.hash("admin123", 12);
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
                description: "Layanan cuci + setrika standar. Cocok untuk cucian biasa dengan estimasi selesai 3 hari kerja.",
            },
            {
                name: "Express",
                pricePerKg: 10000,
                durationDays: 1,
                description: "Layanan cuci + setrika prioritas. Pesanan diproses lebih cepat dengan estimasi selesai 1 hari kerja.",
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
