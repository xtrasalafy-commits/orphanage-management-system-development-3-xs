# SIMPA Nur Kasih — Sistem Manajemen Panti Asuhan

Aplikasi manajemen panti asuhan (Next.js 16 App Router + Drizzle ORM + PostgreSQL).
Modul: dashboard ringkasan, anak asuh, pengasuh & staf, donasi, kebutuhan dasar, dan
kegiatan.

## Prasyarat

- Node.js 20+ (direkomendasikan 22)
- Database PostgreSQL (mis. [Neon](https://neon.tech))

## Setup lokal

```bash
npm install
cp .env.example .env   # isi DATABASE_URL Anda
npm run db:migrate     # buat/migrasi tabel
npm run db:seed        # isi data contoh
npm run dev
```

Buka http://localhost:3000 lalu masuk dengan akun demo:

| Peran     | Email                       | Kata sandi     |
| --------- | --------------------------- | -------------- |
| Admin     | admin@nurkasih.or.id        | `admin123`     |
| Pengasuh  | pengasuh@nurkasih.or.id     | `pengasuh123`  |

## Script yang tersedia

| Script               | Keterangan                                              |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | Jalankan dev server                                      |
| `npm run build`      | Build produksi                                           |
| `npm run start`      | Jalankan hasil build produksi                            |
| `npm run lint`       | Jalankan ESLint                                          |
| `npm run typecheck`  | Cek tipe TypeScript                                      |
| `npm run db:generate`| Buat file migration dari perubahan `src/db/schema.ts`    |
| `npm run db:migrate` | Terapkan migration ke database                           |
| `npm run db:seed`    | Isi ulang database dengan data contoh                    |
| `npm run db:reconcile`| Catat migration yang sudah diterapkan manual            |
| `npm run pack:source` | Packing ulang `public/source-code.zip`                  |

## Widget Trakteer & Download Source Code

Aplikasi ini dilengkapi **floating widget Trakteer** di sudut kanan bawah layar
(`src/components/widgets/trakteer-widget.tsx`) dengan tulisan
_"Web app ini gratis & bebas iklan. Kopi kecil, server tetap jalan."_

Ketika diklik, widget membuka panel di dalam aplikasi (tanpa pindah halaman) yang berisi:

- **Pilihan nominal traktiran** mulai dari Rp 6.000 dan kelipatannya
  (Rp 6.000 / 12.000 / 18.000 / 24.000 / 36.000 / 50.000 / 100.000 / 200.000).
- **QR Code** yang di-generate langsung di browser (library `qrcode`) menunjuk ke
  https://trakteer.id/perpus_opera/ — cukup scan dengan kamera ponsel.
- **Tombol "Buka Trakteer"** menuju halaman Trakteer.
- **Tombol "Download Source"** untuk mengunduh kode sumber lengkap
  (`public/source-code.zip`, di-generate otomatis oleh `npm run prebuild`
  melalui `scripts/pack-source.mjs` — berjalan otomatis sebelum `next build`
  di Vercel).

## Deploy ke Vercel

1. Push repository ini ke GitHub/GitLab.
2. Import proyek di [vercel.com](https://vercel.com) (framework "Next.js" terdeteksi
   otomatis — tidak perlu konfigurasi build tambahan).
3. Tambahkan environment variable di **Settings → Environment Variables**:

   ```
   DATABASE_URL=postgresql://user:password@host-pooler.region.aws.neon.tech/dbname?sslmode=require
   ```

   Gunakan connection string **pooled** (PgBouncer) dari Neon untuk serverless.

4. Deploy. Pastikan tabel sudah ada — jalankan migration sekali dari mesin lokal
   yang memiliki akses ke database produksi:

   ```bash
   npm run db:migrate
   npm run db:seed   # opsional, hanya untuk data contoh
   ```

## Catatan

- `.env` mengandung kredensial dan diabaikan oleh git; jangan di-commit.
- Password disimpan dengan scrypt; sesi disimpan di tabel `sessions` dengan cookie
  httpOnly `panti_session`.
- Gambar hero halaman login murni CSS (tanya aset gambar eksternal).

## Lisensi

**Open Source oleh MZF — 2026**

Kode sumber lengkap aplikasi ini tersedia gratis dan dapat diunduh langsung dari
aplikasi melalui tombol **Download Source** pada widget Trakteer, atau dari halaman
releases repository ini. Bebas digunakan, dipelajari, dan dimodifikasi.

