# Product Requirement Document (PRD)
## Signature Laundry — Aplikasi Laundry untuk Anak Kost

---

## 1. Ringkasan Produk

| | |
|---|---|
| **Nama Produk** | Signature Laundry |
| **Versi** | 1.0.0 |
| **Tanggal** | Maret 2026 |
| **Status** | Draft |

### 1.1 Latar Belakang
Anak kost seringkali kesulitan dalam mengurus cucian karena keterbatasan waktu, alat, dan tempat. Layanan laundry kiloan menjadi solusi populer, namun prosesnya masih manual — pelanggan harus datang langsung, tidak tahu estimasi selesai, dan tidak bisa memantau status cuciannya. **Signature Laundry** hadir untuk mendigitalisasi pengalaman ini.

### 1.2 Tujuan Produk
- Memudahkan anak kost dalam memesan layanan laundry secara digital
- Memberikan transparansi status pesanan secara real-time
- Membantu admin laundry mengelola pesanan dengan lebih efisien

### 1.3 Visi
> *"Pakaian bersih tanpa repot, cukup dari genggaman tangan."*

---

## 2. Target Pengguna

### 2.1 Pelanggan (Anak Kost / Customer)
| Atribut | Detail |
|---------|--------|
| Demografi | Mahasiswa/pekerja muda, usia 18–30 tahun |
| Lokasi | Tinggal di kos-kosan dekat area laundry |
| Kebutuhan | Pesan laundry mudah, tahu kapan selesai, lihat riwayat |
| Pain Point | Harus datang langsung, tidak tahu estimasi, sering lupa ambil |

**User Journey Pelanggan:**
1. Daftar akun / Login
2. Pilih paket laundry (Reguler / Express)
3. Input berat cucian → lihat kalkulasi harga
4. Submit pesanan
5. Pantau status pesanan secara real-time
6. Lihat riwayat pesanan sebelumnya

### 2.2 Admin Laundry
| Atribut | Detail |
|---------|--------|
| Demografi | Pemilik/karyawan usaha laundry |
| Kebutuhan | Kelola pesanan, update status, pantau semua transaksi |
| Pain Point | Catat pesanan manual, sulit track status banyak pelanggan |

**User Journey Admin:**
1. Login sebagai admin
2. Lihat dashboard (statistik harian)
3. Kelola daftar pesanan yang masuk
4. Update status pesanan sesuai progress
5. Lihat data pelanggan

---

## 3. Tech Stack

| Komponen | Teknologi | Alasan |
|----------|-----------|--------|
| Framework | Next.js 14 (App Router) | Fullstack, SSR, file-based routing |
| Bahasa | TypeScript | Type safety, lebih mudah maintain |
| UI Framework | Material UI (MUI) v5 | Komponen siap pakai, Material Design |
| Database | MySQL | Relasional, cocok untuk data pesanan |
| ORM | Prisma | Type-safe database queries |
| Autentikasi | NextAuth.js v4 | Session management, JWT, role |
| Hashing Password | bcryptjs | Keamanan password |
| Deployment | Vercel + Railway (MySQL) | Free tier, mudah deploy |

---

## 4. Fitur Utama

### 4.1 Autentikasi (Auth)
- [x] Registrasi akun baru (nama, email, password, nomor HP, alamat kos)
- [x] Login dengan email & password
- [x] Sistem role: `CUSTOMER` dan `ADMIN`
- [x] Proteksi route berdasarkan role (Next.js Middleware)
- [x] Logout

### 4.2 Paket Laundry
| Paket | Harga | Estimasi | Keterangan |
|-------|-------|----------|------------|
| Reguler | Rp 5.000/kg | 3 hari | Cuci + setrika standar |
| Express | Rp 10.000/kg | 1 hari | Cuci + setrika prioritas, antrian diprioritaskan |

### 4.3 Pemesanan (Order)
- [x] Form pemesanan: pilih paket, input berat (kg), catatan tambahan
- [x] Kalkulator harga otomatis: `berat (kg) × harga per kg`
- [x] Konfirmasi pesanan sebelum submit
- [x] Nomor order unik otomatis (format: `SL-YYYYMMDD-XXX`)
- [x] Estimasi selesai ditampilkan berdasarkan paket yang dipilih

### 4.4 Tracking Status Pesanan
Alur status pesanan:
```
PENDING → PROCESSING → WASHING → DRYING → READY → DELIVERED
```

| Status | Keterangan | Yang Dilakukan |
|--------|------------|----------------|
| PENDING | Pesanan diterima | Menunggu konfirmasi admin |
| PROCESSING | Dikonfirmasi admin | Pakaian sedang ditimbang & dicatat |
| WASHING | Sedang dicuci | Proses pencucian |
| DRYING | Sedang dikeringkan | Proses pengeringan & setrika |
| READY | Siap diambil | Pelanggan bisa ambil cucian |
| DELIVERED | Selesai | Cucian sudah diambil pelanggan |

- Timeline visual (stepper) di halaman detail pesanan
- Setiap perubahan status dicatat dengan timestamp
- Pelanggan dapat melihat riwayat perubahan status

### 4.5 Riwayat Pesanan
- [x] Daftar semua pesanan dengan status & tanggal
- [x] Filter berdasarkan status
- [x] Detail pesanan: paket, berat, total harga, timeline status

### 4.6 Dashboard Admin
- [x] Statistik: total pesanan hari ini, total pendapatan, pesanan aktif
- [x] Daftar semua pesanan dengan filter status
- [x] Update status pesanan + tambah catatan opsional
- [x] Daftar data pelanggan terdaftar

---

## 5. Struktur Halaman (Sitemap)

### Halaman Publik
```
/               → Landing Page
/login          → Halaman Login
/register       → Halaman Registrasi
```

### Halaman Pelanggan (require auth: CUSTOMER)
```
/dashboard              → Ringkasan pesanan aktif
/order/new              → Form buat pesanan baru
/order/[id]             → Detail & tracking pesanan
/history                → Riwayat semua pesanan
```

### Halaman Admin (require auth: ADMIN)
```
/admin                  → Dashboard admin
/admin/orders           → Daftar semua pesanan
/admin/orders/[id]      → Detail pesanan + update status
/admin/users            → Daftar pelanggan
```

---

## 6. Desain Database

### Entity Relationship

```
User (1) ─────── (N) Order
Package (1) ──── (N) Order
Order (1) ─────── (N) StatusHistory
```

### Skema Tabel

#### Tabel `users`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | CUID | Primary key |
| name | VARCHAR | Nama lengkap |
| email | VARCHAR | Email unik |
| password | VARCHAR | Password ter-hash |
| role | ENUM | CUSTOMER / ADMIN |
| phone | VARCHAR | Nomor HP (opsional) |
| address | TEXT | Alamat kos (opsional) |
| createdAt | DATETIME | Waktu registrasi |

#### Tabel `packages`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | CUID | Primary key |
| name | VARCHAR | Reguler / Express |
| pricePerKg | INT | Harga per kg (Rupiah) |
| durationDays | INT | Estimasi hari selesai |
| description | TEXT | Deskripsi paket |

#### Tabel `orders`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | CUID | Primary key |
| orderNumber | VARCHAR | Nomor unik (SL-YYYYMMDD-XXX) |
| userId | CUID | FK → users |
| packageId | CUID | FK → packages |
| weight | FLOAT | Berat cucian (kg) |
| totalPrice | INT | Total harga (Rupiah) |
| status | ENUM | Status pesanan |
| notes | TEXT | Catatan pelanggan |
| createdAt | DATETIME | Waktu pesan |
| updatedAt | DATETIME | Waktu update terakhir |

#### Tabel `status_histories`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | CUID | Primary key |
| orderId | CUID | FK → orders |
| status | ENUM | Status baru |
| description | TEXT | Catatan admin (opsional) |
| createdAt | DATETIME | Waktu perubahan |

---

## 7. API Endpoints

| Method | Endpoint | Deskripsi | Akses |
|--------|----------|-----------|-------|
| POST | `/api/register` | Daftar akun baru | Public |
| GET | `/api/packages` | Ambil daftar paket | Public |
| GET | `/api/orders` | Daftar pesanan user | Customer / Admin |
| POST | `/api/orders` | Buat pesanan baru | Customer |
| GET | `/api/orders/[id]` | Detail pesanan | Customer / Admin |
| PATCH | `/api/orders/[id]/status` | Update status pesanan | Admin |

---

## 8. Struktur Folder Proyek

```
signature-laundry/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (customer)/
│   │   ├── dashboard/page.tsx
│   │   ├── order/
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── history/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── orders/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       └── users/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── register/route.ts
│   │   ├── orders/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── status/route.ts
│   │   └── packages/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── AdminSidebar.tsx
│   ├── order/
│   │   ├── OrderCard.tsx
│   │   ├── StatusStepper.tsx
│   │   └── PriceCalculator.tsx
│   └── ui/
│       └── PageLoader.tsx
├── lib/
│   ├── prisma.ts
│   └── auth.ts
├── middleware.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── next-auth.d.ts
├── .env.local
├── package.json
└── PRD.md
```

---

## 9. Non-Functional Requirements

| Aspek | Target |
|-------|--------|
| Performa | Halaman load < 3 detik |
| Responsif | Mobile-first (MUI breakpoints: xs, sm, md, lg) |
| Keamanan | Password ter-hash (bcrypt, salt 12), session JWT, validasi input |
| Aksesibilitas | Mengikuti standar MUI accessibility |
| Skalabilitas | Struktur siap dikembangkan untuk multi-cabang |

---

## 10. Data Awal (Seed Data)

```
Admin Default:
  Nama  : Admin Signature Laundry
  Email : admin@signaturelaundry.com
  Password : admin123

Paket Laundry:
  1. Reguler  — Rp 5.000/kg  — Estimasi 3 hari
  2. Express  — Rp 10.000/kg — Estimasi 1 hari
```

---

## 11. Urutan Implementasi

| Tahap | Task | Prioritas |
|-------|------|-----------|
| 1 | Setup Next.js + install dependensi | HIGH |
| 2 | Prisma schema + MySQL + seed | HIGH |
| 3 | NextAuth setup (login, session, role) | HIGH |
| 4 | API Routes | HIGH |
| 5 | Middleware proteksi route | HIGH |
| 6 | MUI Theme + Layout | MEDIUM |
| 7 | Halaman Auth (Login, Register) | HIGH |
| 8 | Halaman Customer | HIGH |
| 9 | Halaman Admin | HIGH |

---

## 12. Environment Variables

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/signature_laundry"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

---

*Dokumen ini merupakan panduan pengembangan resmi untuk Signature Laundry v1.0*
*Dibuat: Maret 2026 | Tim Pengembang: Signature Laundry Dev Team*
