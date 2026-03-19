# Product Requirement Document (PRD)
## Signature Laundry — Aplikasi Laundry untuk Anak Kost

**Versi**: 3.0 | **Tanggal**: Maret 2026 | **Status**: In Development

> **⚠️ Catatan QA untuk Developer:**
> Pastikan semua fitur dan sistem berjalan dengan sangat baik. Uji coba sebelum konfirmasi selesai.
> Jika ada kesalahan/bug, langsung diperbaiki agar sistemnya berjalan normal.

---

## Daftar Isi
1. [Ringkasan Produk](#1-ringkasan-produk)
2. [Target Pengguna](#2-target-pengguna)
3. [Tech Stack](#3-tech-stack)
4. [Hierarki Role](#4-hierarki-role)
5. [Fitur per Role](#5-fitur-per-role)
6. [Alur Status Pesanan](#6-alur-status-pesanan)
7. [Database Schema](#7-database-schema)
8. [Struktur Halaman & Routes](#8-struktur-halaman--routes)
9. [API Endpoints](#9-api-endpoints)
10. [Struktur Folder Proyek](#10-struktur-folder-proyek)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Rencana Implementasi & Status](#12-rencana-implementasi--status)
13. [Log Bug & Perbaikan](#13-log-bug--perbaikan)

---

## 1. Ringkasan Produk

**Nama Produk**: Signature Laundry
**Visi**: *"Pakaian bersih tanpa repot, cukup dari genggaman tangan."*

Signature Laundry adalah platform digital laundry berbasis web yang menghubungkan **pelanggan** (anak kost/mahasiswa), **seller** (penyedia jasa laundry sekaligus antar-jemput), dan **admin** (pengelola sistem) dalam satu ekosistem. Pelanggan memesan secara online, seller **secara mandiri mengambil pesanan** dalam radius 5km, mengelola seluruh proses laundry, dan mengantarkan kembali. Admin berperan sebagai **pengawas** dengan akses cancel/re-assign darurat.

---

## 2. Target Pengguna

| Role | Demografi | Kebutuhan Utama |
|------|-----------|-----------------|
| **Customer** | Mahasiswa/pekerja muda, 18–30 tahun, tinggal di kos | Pesan mudah, lacak status, lihat bukti pesanan |
| **Admin** | Pemilik/karyawan laundry | Pantau semua pesanan, approve seller, cancel/reassign darurat |
| **Seller** | Mitra jasa laundry + antar-jemput | Pilih pesanan terdekat, kelola laundry mandiri, konfirmasi berat |

---

## 3. Tech Stack

| Komponen | Teknologi | Keterangan |
|----------|-----------|------------|
| Framework | Next.js 16 (App Router) | Full-stack, Turbopack |
| Bahasa | TypeScript | Seluruh codebase |
| UI | Material UI (MUI) v5 | Komponen + dark/light mode |
| Database | MariaDB 10.4 (via XAMPP) | Local development |
| ORM | Prisma v6 | Schema-first, type-safe |
| Auth | NextAuth.js v4 | JWT strategy, Credentials provider |
| Password | bcryptjs | Hash + verify |
| Real-time | Socket.io | GPS tracking seller ke customer |
| Peta | Leaflet.js + OpenStreetMap | Gratis, no API key |
| Jarak | Haversine Formula | Kalkulasi jarak seller ke customer |

---

## 4. Hierarki Role

```
ADMIN
  └── Approve/reject pendaftaran seller
  └── Pantau semua pesanan (view-only untuk pesanan yang ada seller)
  └── Cancel pesanan darurat (alasan wajib >= 5 karakter)
  └── Re-assign seller (alasan wajib, pilih seller atau kembalikan ke antrian)

SELLER
  └── Lihat pesanan PENDING dalam radius 5km
  └── Ambil pesanan secara mandiri (self-assign)
  └── Kelola SELURUH siklus pesanan: jemput -> cuci -> antar -> selesai
  └── Konfirmasi berat + upload bukti foto timbangan (wajib)
  └── Berbagi lokasi GPS real-time saat jemput/antar

CUSTOMER
  └── Buat pesanan & pin lokasi
  └── Lacak seller secara real-time
  └── Lihat harga setelah seller konfirmasi berat
  └── Lihat riwayat & nota
```

---

## 5. Fitur per Role

### 5.1 Customer

| # | Fitur | Deskripsi |
|---|-------|-----------|
| C1 | Registrasi | Daftar akun: nama, email, password, HP, alamat |
| C2 | Login/Logout | Dengan email & password |
| C3 | Buat Pesanan | Pilih paket, estimasi berat (opsional), pin lokasi di peta |
| C4 | Tracking Status | Timeline visual 10 tahap (termasuk CANCELLED) |
| C5 | Lacak Seller | Peta real-time saat seller menuju/menjemput |
| C6 | Lihat Nota | Bukti pesanan: info pelanggan, paket, harga, timeline |
| C7 | Riwayat Pesanan | Semua pesanan + filter status |
| C8 | Dashboard | Pesanan aktif + shortcut buat pesanan |
| C9 | Konfirmasi Harga | Harga ditampilkan hanya setelah seller konfirmasi berat aktual |

### 5.2 Seller

| # | Fitur | Deskripsi |
|---|-------|-----------|
| S1 | Registrasi Seller | Halaman khusus: nama usaha, foto, alamat, jam, area layanan |
| S2 | Approval Admin | Akun seller aktif setelah disetujui admin |
| S3 | Dashboard Seller | Statistik & pesanan aktif |
| S4 | Lihat Pesanan Terdekat | Tab "Tersedia" — pesanan PENDING dalam radius 5km, diurutkan terdekat |
| S5 | Self-Assign Pesanan | Klik "Ambil Pesanan" -> status CONFIRMED, order jadi milik seller |
| S6 | Mulai Jemput | Status -> PICKED_UP, GPS aktif, customer bisa lacak di peta |
| S7 | Konfirmasi Berat + Foto | Upload foto timbangan (wajib) + input berat -> status PROCESSING + harga dihitung |
| S8 | Proses Laundry | Update status: WASHING -> DRYING -> READY secara mandiri |
| S9 | Mulai Antar | Status -> OUT_FOR_DELIVERY, GPS aktif |
| S10 | Konfirmasi Selesai | Status -> DELIVERED |
| S11 | Kelola Profil | Edit data usaha, jam operasional, foto, toggle ketersediaan |

### 5.3 Admin

| # | Fitur | Deskripsi |
|---|-------|-----------|
| A1 | Dashboard | Statistik: pesanan hari ini, pendapatan, pesanan aktif |
| A2 | Kelola Pesanan | List semua pesanan + filter status (view-only untuk pesanan ber-seller) |
| A3 | Detail Pesanan | Lihat semua info: pelanggan, seller, berat, foto bukti, timeline |
| A4 | Cancel Pesanan | Tindakan darurat: alasan wajib >= 5 karakter, notifikasi ke seller & pelanggan |
| A5 | Re-assign Seller | Pindah ke seller lain / kembalikan ke antrian PENDING, alasan wajib |
| A6 | Lihat Nota | Cetak/lihat bukti pesanan dengan detail lengkap |
| A7 | Kelola Seller | List semua seller + approve/reject + lihat profil |
| A8 | Kelola Pelanggan | Daftar semua customer |
| A9 | Notifikasi | Terima notif saat ada pendaftaran seller baru |

---

## 6. Alur Status Pesanan (10 Status)

```
PENDING -> CONFIRMED -> PICKED_UP -> PROCESSING -> WASHING -> DRYING -> READY -> OUT_FOR_DELIVERY -> DELIVERED
                                                                                        |
                                                                              (admin darurat kapan saja)
                                                                                        v
                                                                                   CANCELLED
```

| Status | Diubah Oleh | Keterangan |
|--------|-------------|------------|
| `PENDING` | System | Customer buat pesanan, menunggu seller ambil |
| `CONFIRMED` | **Seller** | Seller self-assign pesanan (ambil dari tab Tersedia) |
| `PICKED_UP` | **Seller** | Seller klik "Sudah Jemput", GPS aktif, customer bisa lacak |
| `PROCESSING` | **Seller** | Seller upload foto timbangan + input berat -> harga dihitung otomatis |
| `WASHING` | **Seller** | Cucian sedang dicuci |
| `DRYING` | **Seller** | Cucian sedang dikeringkan & disetrika |
| `READY` | **Seller** | Cucian siap diantar |
| `OUT_FOR_DELIVERY` | **Seller** | Seller klik "Mulai Antar", GPS aktif |
| `DELIVERED` | **Seller** | Seller klik "Sudah Diantar", pesanan selesai |
| `CANCELLED` | **Admin** | Pembatalan darurat dengan alasan wajib (>= 5 karakter) |

**Catatan Penting:**
- **Seller mengelola SEMUA status** dari CONFIRMED sampai DELIVERED
- **Admin hanya bisa view** pesanan yang sedang dikelola seller
- **Admin bisa Cancel atau Re-assign** kapan saja sebagai tindakan darurat
- **PROCESSING** hanya bisa diset melalui endpoint `/weight` (bukan `/status`), membutuhkan berat + foto bukti

**Catatan GPS:**
Seller berbagi lokasi saat PICKED_UP dan OUT_FOR_DELIVERY. Customer dapat melacak posisi seller di peta Leaflet via Socket.io.

**Catatan Delivery Fee:**
- Paket **Reguler**: `Rp 1.000 x ceil(jarak km)`
- Paket **Express**: **Gratis**

**Catatan Harga untuk Customer:**
- Customer memberikan estimasi berat saat memesan (opsional, untuk referensi seller)
- Harga final hanya ditampilkan setelah seller konfirmasi berat aktual + upload foto bukti
- Sebelum konfirmasi berat: customer melihat "Menunggu konfirmasi berat dari seller"

---

## 7. Database Schema

### Schema Saat Ini (Aktif)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model User {
  id             String         @id @default(cuid())
  name           String
  email          String         @unique
  password       String
  role           Role           @default(CUSTOMER)
  phone          String?
  address        String?
  createdAt      DateTime       @default(now())
  orders         Order[]
  sellerProfile  SellerProfile?
  notifications  Notification[]
  sellerOrders   Order[]        @relation("SellerOrders")

  @@map("users")
}

model Package {
  id           String  @id @default(cuid())
  name         String
  pricePerKg   Int
  durationDays Int
  description  String? @db.Text
  orders       Order[]

  @@map("packages")
}

model Order {
  id             String          @id @default(cuid())
  orderNumber    String          @unique
  userId         String
  packageId      String
  sellerId       String?
  weight         Float?
  weightProofUrl String?         // URL foto bukti timbangan (wajib saat konfirmasi berat)
  totalPrice     Int?
  deliveryFee    Int?
  customerLat    Float?
  customerLng    Float?
  status         OrderStatus     @default(PENDING)
  notes          String?         @db.Text
  cancelReason   String?         @db.Text
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  user           User            @relation(fields: [userId], references: [id])
  package        Package         @relation(fields: [packageId], references: [id])
  seller         User?           @relation("SellerOrders", fields: [sellerId], references: [id])
  statusHistory  StatusHistory[]

  @@map("orders")
}

model StatusHistory {
  id          String      @id @default(cuid())
  orderId     String
  status      OrderStatus
  description String?     @db.Text
  createdAt   DateTime    @default(now())
  order       Order       @relation(fields: [orderId], references: [id])

  @@map("status_histories")
}

model SellerProfile {
  id             String   @id @default(cuid())
  userId         String   @unique
  businessName   String
  photoUrl       String?
  address        String
  latitude       Float
  longitude      Float
  operatingHours String
  serviceArea    String
  isApproved     Boolean  @default(false)
  isAvailable    Boolean  @default(true)
  currentLat     Float?
  currentLng     Float?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  user           User     @relation(fields: [userId], references: [id])

  @@map("seller_profiles")
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  title     String
  message   String
  type      String
  isRead    Boolean  @default(false)
  orderId   String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])

  @@map("notifications")
}

enum Role {
  CUSTOMER
  ADMIN
  SELLER
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PICKED_UP
  PROCESSING
  WASHING
  DRYING
  READY
  OUT_FOR_DELIVERY
  DELIVERED
  CANCELLED
}
```

> **Catatan migrasi:** Jalankan `npx prisma db push` setiap kali schema berubah (XAMPP harus aktif).
> Fields `weightProofUrl`, `cancelReason`, dan enum `CANCELLED` memerlukan `prisma db push`.

---

## 8. Struktur Halaman & Routes

### Customer

| Route | Halaman | Status |
|-------|---------|--------|
| `/` | Landing Page — CTA daftar Pelanggan atau Seller | ✅ Selesai |
| `/login` | Login (redirect ke `/seller`, `/admin`, atau `/dashboard`) | ✅ Selesai |
| `/register` | Registrasi customer + tombol Daftar sebagai Seller | ✅ Selesai |
| `/dashboard` | Dashboard pesanan aktif | ✅ Selesai |
| `/order/new` | Buat pesanan (pilih paket + estimasi berat + pin lokasi) | ✅ Selesai |
| `/order/[id]` | Detail pesanan + timeline + lacak seller + banner CANCELLED | ✅ Selesai |
| `/order/[id]/nota` | Nota/bukti pesanan | ✅ Selesai |
| `/history` | Riwayat semua pesanan | ✅ Selesai |

### Seller

| Route | Halaman | Status |
|-------|---------|--------|
| `/register/seller` | Registrasi seller (nama usaha, foto, lokasi, jam) | ✅ Selesai |
| `/seller` | Dashboard seller — statistik & pesanan aktif | ✅ Selesai |
| `/seller/orders` | 3 tab: Tersedia / Pesananku / Selesai, auto-refresh 30 detik | ✅ Selesai |
| `/seller/orders/[id]` | Detail + tombol aksi per status + upload bukti + GPS | ✅ Selesai |
| `/seller/profile` | Edit profil usaha, foto, jam, toggle ketersediaan | ✅ Selesai |

### Admin

| Route | Halaman | Status |
|-------|---------|--------|
| `/admin` | Dashboard statistik | ✅ Selesai |
| `/admin/orders` | Semua pesanan + filter | ✅ Selesai |
| `/admin/orders/[id]` | Detail (view-only) + Cancel Dialog + Re-assign Dialog | ✅ Selesai |
| `/admin/orders/[id]/nota` | Nota admin | ✅ Selesai |
| `/admin/users` | Daftar pelanggan | ✅ Selesai |
| `/admin/sellers` | Daftar seller + approve/reject | ✅ Selesai |
| `/admin/sellers/[id]` | Detail profil seller | ✅ Selesai |

---

## 9. API Endpoints

### Autentikasi & Pengguna

| Method | Endpoint | Role | Deskripsi | Status |
|--------|----------|------|-----------|--------|
| `POST` | `/api/register` | Public | Daftar akun customer | ✅ |
| `POST` | `/api/auth/[...nextauth]` | Public | Login/Logout | ✅ |
| `GET` | `/api/users` | Admin | Daftar semua customer | ✅ |

### Pesanan

| Method | Endpoint | Role | Deskripsi | Status |
|--------|----------|------|-----------|--------|
| `GET` | `/api/orders` | All | Seller dapat `{ orders, nearbyOrders }`, Customer/Admin hanya orders | ✅ |
| `POST` | `/api/orders` | Customer | Buat pesanan baru (dengan customerLat/Lng) | ✅ |
| `GET` | `/api/orders/[id]` | All | Detail pesanan; Seller bisa lihat PENDING order orang lain | ✅ |
| `PATCH` | `/api/orders/[id]/status` | Seller | Update status CONFIRMED sampai DELIVERED | ✅ |
| `PATCH` | `/api/orders/[id]/weight` | Seller | Konfirmasi berat + foto bukti -> auto PROCESSING | ✅ |
| `POST` | `/api/orders/[id]/take` | Seller | Self-assign pesanan PENDING dalam 5km | ✅ |
| `POST` | `/api/orders/[id]/cancel` | Admin | Batalkan pesanan (alasan wajib >= 5 karakter) | ✅ |
| `POST` | `/api/orders/[id]/reassign` | Admin | Re-assign seller (alasan wajib, newSellerId opsional) | ✅ |

### Paket Laundry

| Method | Endpoint | Role | Deskripsi | Status |
|--------|----------|------|-----------|--------|
| `GET` | `/api/packages` | Public | Daftar paket laundry | ✅ |

### Seller

| Method | Endpoint | Role | Deskripsi | Status |
|--------|----------|------|-----------|--------|
| `POST` | `/api/sellers/register` | Public | Daftarkan akun seller + profil | ✅ |
| `GET` | `/api/sellers` | Admin | List semua seller | ✅ |
| `GET` | `/api/sellers/[id]` | Admin/Seller | Detail seller | ✅ |
| `PATCH` | `/api/sellers/[id]/approve` | Admin | Approve/reject seller | ✅ |
| `PATCH` | `/api/sellers/[id]/availability` | Seller | Toggle ketersediaan | ✅ |
| `PATCH` | `/api/sellers/[id]/location` | Seller | Update lokasi real-time | ✅ |

### Notifikasi & Upload

| Method | Endpoint | Role | Deskripsi | Status |
|--------|----------|------|-----------|--------|
| `GET` | `/api/notifications` | Auth | Ambil notifikasi pengguna | ✅ |
| `PATCH` | `/api/notifications/read` | Auth | Tandai semua sudah dibaca | ✅ |
| `POST` | `/api/upload` | Auth | Upload file gambar (foto bukti timbangan) | ✅ |

---

## 10. Struktur Folder Proyek

```
signature-laundry/
├── server.ts                              ✅ Custom server Socket.io
├── tsconfig.server.json                   ✅
├── PRD.md                                 ✅ Dokumen ini
├── public/uploads/sellers/                ✅ Foto seller & bukti timbangan
├── app/
│   ├── context/ThemeContext.tsx           ✅
│   ├── (auth)/
│   │   ├── login/page.tsx                 ✅ Redirect role-based
│   │   ├── register/page.tsx              ✅ + tombol Daftar sebagai Seller
│   │   └── register/seller/page.tsx       ✅
│   ├── (customer)/
│   │   ├── dashboard/page.tsx             ✅
│   │   ├── history/page.tsx               ✅
│   │   └── order/
│   │       ├── new/page.tsx               ✅ Estimasi berat + pin lokasi
│   │       └── [id]/
│   │           ├── page.tsx               ✅ Banner CANCELLED + menunggu berat
│   │           └── nota/page.tsx          ✅
│   ├── (seller)/
│   │   ├── layout.tsx                     ✅
│   │   └── seller/
│   │       ├── page.tsx                   ✅ Dashboard
│   │       ├── profile/page.tsx           ✅
│   │       └── orders/
│   │           ├── page.tsx               ✅ 3 tab + auto-refresh 30 detik
│   │           └── [id]/page.tsx          ✅ Full management + GPS + upload bukti
│   ├── (admin)/
│   │   └── admin/
│   │       ├── page.tsx                   ✅
│   │       ├── users/page.tsx             ✅
│   │       ├── sellers/
│   │       │   ├── page.tsx               ✅
│   │       │   └── [id]/page.tsx          ✅
│   │       └── orders/
│   │           ├── page.tsx               ✅
│   │           └── [id]/
│   │               ├── page.tsx           ✅ View-only + Cancel + Reassign dialog
│   │               └── nota/page.tsx      ✅
│   └── api/
│       ├── auth/[...nextauth]/route.ts    ✅
│       ├── register/route.ts              ✅
│       ├── packages/route.ts              ✅
│       ├── users/route.ts                 ✅
│       ├── upload/route.ts                ✅
│       ├── notifications/
│       │   ├── route.ts                   ✅
│       │   └── read/route.ts              ✅
│       ├── sellers/
│       │   ├── register/route.ts          ✅
│       │   └── [id]/
│       │       ├── route.ts               ✅
│       │       ├── approve/route.ts       ✅
│       │       ├── availability/route.ts  ✅
│       │       └── location/route.ts      ✅
│       └── orders/
│           ├── route.ts                   ✅ SELLER: { orders, nearbyOrders }
│           └── [id]/
│               ├── route.ts               ✅ Seller bisa lihat PENDING
│               ├── status/route.ts        ✅ Seller kelola semua status
│               ├── weight/route.ts        ✅ Konfirmasi berat + foto
│               ├── take/route.ts          ✅ Self-assign
│               ├── cancel/route.ts        ✅ Admin cancel + alasan wajib
│               └── reassign/route.ts      ✅ Admin reassign + alasan wajib
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                     ✅ + NotificationBell
│   │   ├── AdminSidebar.tsx               ✅ + menu Seller
│   │   └── SellerSidebar.tsx              ✅
│   ├── map/
│   │   ├── LocationPicker.tsx             ✅ Customer pin lokasi
│   │   └── LiveTrackingMap.tsx            ✅ Real-time tracking
│   ├── notifications/
│   │   └── NotificationBell.tsx           ✅
│   └── order/
│       ├── OrderCard.tsx                  ✅
│       ├── NotaView.tsx                   ✅
│       └── StatusStepper.tsx              ✅ 10 status + CANCELLED handling
├── lib/
│   ├── prisma.ts                          ✅
│   ├── auth.ts                            ✅ Role-based JWT
│   ├── haversine.ts                       ✅
│   └── notifications.ts                   ✅
├── middleware.ts                           ✅ Proteksi /seller/* + /admin/*
├── prisma/schema.prisma                   ✅ 3 role + 10 status + 5 model
└── types/next-auth.d.ts                   ✅
```

---

## 11. Non-Functional Requirements

| Aspek | Target |
|-------|--------|
| Performa | Halaman load < 3 detik |
| Responsif | Mobile-first (MUI breakpoints) |
| Keamanan | bcrypt hash, JWT session, validasi role di setiap API |
| Real-time | GPS update < 2 detik latency via Socket.io |
| Jangkauan Seller | Radius maksimum 5 km dari lokasi pin customer |
| Delivery Fee | Rp 1.000/km (Reguler), gratis (Express) |
| Anti-Fraud | Foto bukti timbangan wajib dilampirkan seller |
| TypeScript | 0 compile errors (`npx tsc --noEmit`) |

---

## 12. Rencana Implementasi & Status

### Fase 1 — Core (Selesai)
Setup project, auth, middleware, paket laundry, pesanan dasar, 6 status awal, dashboard admin, daftar pelanggan.

### Fase 2 — Nota & Berat (Selesai)
Admin input berat, nota pelanggan & admin, NotaView component, weight API, fix async params.

### Fase 3 — SELLER Role (Selesai)

**A — Foundation:** Socket.io, Leaflet, schema update, haversine.ts, notifications.ts, upload API

**B — Seller Auth:** Register seller, approve/reject, availability, location update

**C — Admin Seller Management:** /admin/sellers, AdminSidebar update

**D — Self-Assign Flow:** /take endpoint, seller lihat PENDING terdekat, 3-tab orders page

**E — Seller Kelola Status:** /status endpoint (CONFIRMED→DELIVERED), /weight endpoint (auto PROCESSING + foto wajib), seller orders [id] page lengkap

**F — Admin View-only + Darurat:** Admin orders [id] rewrite (view + Cancel + Reassign dialog), /cancel, /reassign endpoints

**G — Maps & Real-time:** LocationPicker, LiveTrackingMap, socket.io tracking, /order/new pin lokasi

**H — Customer View Update:** Banner menunggu berat, banner CANCELLED + alasan, StatusStepper 10 status

**I — Notifications & Middleware:** NotificationBell, proteksi /seller/*, 0 TypeScript errors

---

## 13. Log Bug & Perbaikan

| # | Bug | File Terdampak | Status |
|---|-----|----------------|--------|
| 1 | `useThemeContext` tidak diekspor, harusnya `useThemeMode` | `SellerSidebar.tsx` | Selesai |
| 2 | Login SELLER diredirect ke `/dashboard` (loop redirect middleware) | `login/page.tsx` | Selesai |
| 3 | Port preview server bentrok, lock file tidak dihapus | `.next/dev/lock` | Selesai |
| 4 | `StatusStepper` dipanggil tanpa prop `statusHistory` | `admin/orders/[id]/page.tsx` | Selesai |
| 5 | LiveTrackingMap menggunakan prop `sellerPos` yang tidak ada | `seller/orders/[id]/page.tsx` | Selesai |
| 6 | `nearest.distance` tidak dikenali TypeScript pada SellerProfile type | `assign-seller/route.ts` | Selesai |
| 7 | `CANCELLED` belum ada di Prisma enum (schema belum di-push) | `cancel/route.ts`, `status/route.ts` | Selesai (cast sementara) |
| 8 | `weightProofUrl` belum ada di Prisma schema (belum di-push) | `weight/route.ts` | Selesai (cast sementara) |
| 9 | `(user as { role: string })` menyebabkan TS error di auth callbacks | `lib/auth.ts` | Selesai |
| 10 | `Record<OrderStatus, string>` error karena `CANCELLED` belum di enum | `status/route.ts` | Selesai |

> **Catatan Bug 7 & 8:** Ini adalah workaround sementara (`as any` cast) hingga `npx prisma db push`
> dijalankan dengan XAMPP aktif. Setelah push, cast bisa dihapus dan TypeScript akan mengenali
> field `weightProofUrl`, `cancelReason`, dan status `CANCELLED` secara native.

---

*Dokumen ini merupakan panduan resmi pengembangan Signature Laundry v3.0*
*Terakhir diperbarui: 19 Maret 2026*
