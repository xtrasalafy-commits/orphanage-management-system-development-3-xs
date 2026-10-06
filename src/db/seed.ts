import { count } from "drizzle-orm";
import { db } from "@/db";
import { activities, children, donations, needs, sessions, staff, users } from "@/db/schema";
import { hashPassword } from "@/lib/password";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number, hour = 10) => {
  const d = new Date(Date.now() - n * DAY);
  d.setHours(hour, 0, 0, 0);
  return d;
};
const daysAhead = (n: number, hour = 9) => daysAgo(-n, hour);

export async function runSeed() {
  await db.delete(sessions);
  await db.delete(activities);
  await db.delete(needs);
  await db.delete(donations);
  await db.delete(children);
  await db.delete(staff);
  await db.delete(users);

  await db.insert(users).values([
    {
      name: "Administrator Panti",
      email: "admin@nurkasih.or.id",
      passwordHash: hashPassword("admin123"),
      role: "Admin",
    },
    {
      name: "Siti Maryam",
      email: "pengasuh@nurkasih.or.id",
      passwordHash: hashPassword("pengasuh123"),
      role: "Pengasuh",
    },
  ]);

  const CHILDREN: (typeof children.$inferInsert)[] = [
    { kode: "ANK-001", nama: "Ahmad Fajar Ramadhan", jenisKelamin: "Laki-laki", tempatLahir: "Bantul", tanggalLahir: new Date("2014-03-12"), statusAnak: "Yatim", tanggalMasuk: daysAgo(1410), pendidikan: "SD Kelas 6", namaWali: "Slamet Riyadi (Paman)", alamatAsal: "Bantul, Yogyakarta", kesehatan: "Sehat", catatan: "Gemar membaca dan hafal 5 juz Al-Qur'an." },
    { kode: "ANK-002", nama: "Siti Aisyah Putri", jenisKelamin: "Perempuan", tempatLahir: "Sleman", tanggalLahir: new Date("2012-07-25"), statusAnak: "Yatim Piatu", tanggalMasuk: daysAgo(1290), pendidikan: "SMP Kelas 8", namaWali: null, alamatAsal: "Sleman, Yogyakarta", kesehatan: "Sehat", catatan: "Rujukan Dinas Sosial Kab. Sleman." },
    { kode: "ANK-003", nama: "Muhammad Rizky Pratama", jenisKelamin: "Laki-laki", tempatLahir: "Klaten", tanggalLahir: new Date("2015-11-08"), statusAnak: "Yatim", tanggalMasuk: daysAgo(980), pendidikan: "SD Kelas 5", namaWali: "Joko Pranoto (Kakek)", alamatAsal: "Klaten, Jawa Tengah", kesehatan: "Dalam pemantauan gizi", catatan: "Program peningkatan gizi sejak Januari." },
    { kode: "ANK-004", nama: "Dewi Lestari", jenisKelamin: "Perempuan", tempatLahir: "Magelang", tanggalLahir: new Date("2013-05-19"), statusAnak: "Piatu", tanggalMasuk: daysAgo(1120), pendidikan: "SMP Kelas 7", namaWali: "Sukamto (Ayah)", alamatAsal: "Magelang, Jawa Tengah", kesehatan: "Sehat" },
    { kode: "ANK-005", nama: "Bintang Saputra", jenisKelamin: "Laki-laki", tempatLahir: "Yogyakarta", tanggalLahir: new Date("2016-01-30"), statusAnak: "Dhuafa", tanggalMasuk: daysAgo(760), pendidikan: "SD Kelas 4", namaWali: "Sari Ningsih (Ibu)", alamatAsal: "Umbulharjo, Yogyakarta", kesehatan: "Sehat" },
    { kode: "ANK-006", nama: "Naila Rahmah", jenisKelamin: "Perempuan", tempatLahir: "Gunungkidul", tanggalLahir: new Date("2017-09-14"), statusAnak: "Yatim", tanggalMasuk: daysAgo(640), pendidikan: "SD Kelas 3", namaWali: "Warsito (Kakek)", alamatAsal: "Gunungkidul, Yogyakarta", kesehatan: "Sehat" },
    { kode: "ANK-007", nama: "Farhan Hidayat", jenisKelamin: "Laki-laki", tempatLahir: "Purworejo", tanggalLahir: new Date("2011-12-03"), statusAnak: "Yatim Piatu", tanggalMasuk: daysAgo(1540), pendidikan: "SMP Kelas 9", namaWali: null, alamatAsal: "Purworejo, Jawa Tengah", kesehatan: "Sehat", catatan: "Persiapan ujian akhir & PPDB SMA." },
    { kode: "ANK-008", nama: "Zahra Aulia", jenisKelamin: "Perempuan", tempatLahir: "Yogyakarta", tanggalLahir: new Date("2018-04-22"), statusAnak: "Piatu", tanggalMasuk: daysAgo(430), pendidikan: "SD Kelas 2", namaWali: "Rahmat Hidayat (Ayah)", alamatAsal: "Gondokusuman, Yogyakarta", kesehatan: "Sehat" },
    { kode: "ANK-009", nama: "Dimas Anggara", jenisKelamin: "Laki-laki", tempatLahir: "Kulon Progo", tanggalLahir: new Date("2010-08-17"), statusAnak: "Yatim", tanggalMasuk: daysAgo(1800), pendidikan: "SMA Kelas 11", namaWali: "Teguh Waluyo (Paman)", alamatAsal: "Kulon Progo, Yogyakarta", kesehatan: "Sehat", catatan: "Ketua OSIS di sekolahnya." },
    { kode: "ANK-010", nama: "Kirana Maheswari", jenisKelamin: "Perempuan", tempatLahir: "Wonosobo", tanggalLahir: new Date("2015-06-06"), statusAnak: "Dhuafa", tanggalMasuk: daysAgo(905), pendidikan: "SD Kelas 5", namaWali: "Mahesa Jati (Ayah)", alamatAsal: "Wonosobo, Jawa Tengah", kesehatan: "Terapi wicara", catatan: "Sesi terapi wicara 2x per bulan di RSUD." },
    { kode: "ANK-011", nama: "Rafi Akbar Maulana", jenisKelamin: "Laki-laki", tempatLahir: "Bantul", tanggalLahir: new Date("2013-10-11"), statusAnak: "Yatim Piatu", tanggalMasuk: daysAgo(1350), pendidikan: "SMP Kelas 7", namaWali: null, alamatAsal: "Bantul, Yogyakarta", kesehatan: "Sehat" },
    { kode: "ANK-012", nama: "Ayu Wulandari", jenisKelamin: "Perempuan", tempatLahir: "Solo", tanggalLahir: new Date("2012-02-28"), statusAnak: "Yatim", tanggalMasuk: daysAgo(1175), pendidikan: "SMP Kelas 9", namaWali: "Wulan Sari (Bibi)", alamatAsal: "Surakarta, Jawa Tengah", kesehatan: "Sehat", catatan: "Berprestasi di olimpiade matematika tingkat kota." },
    { kode: "ANK-013", nama: "Gilang Ramadhan", jenisKelamin: "Laki-laki", tempatLahir: "Yogyakarta", tanggalLahir: new Date("2014-07-07"), statusAnak: "Piatu", tanggalMasuk: daysAgo(560), pendidikan: "SD Kelas 6", namaWali: "Darmadi (Ayah)", alamatAsal: "Jetis, Yogyakarta", kesehatan: "Sehat" },
    { kode: "ANK-014", nama: "Putri Ayudia", jenisKelamin: "Perempuan", tempatLahir: "Magelang", tanggalLahir: new Date("2016-12-25"), statusAnak: "Yatim", tanggalMasuk: daysAgo(300), pendidikan: "SD Kelas 4", namaWali: "Yusuf Maulana (Paman)", alamatAsal: "Muntilan, Magelang", kesehatan: "Sehat" },
    { kode: "ANK-015", nama: "Yusuf Ibrahim", jenisKelamin: "Laki-laki", tempatLahir: "Yogyakarta", tanggalLahir: new Date("2019-03-15"), statusAnak: "Yatim", tanggalMasuk: daysAgo(180), pendidikan: "SD Kelas 1", namaWali: "Ibrahim Hasan (Kakek)", alamatAsal: "Kotagede, Yogyakarta", kesehatan: "Sehat", catatan: "Masa adaptasi berjalan baik." },
    { kode: "ANK-016", nama: "Salma Khoirunnisa", jenisKelamin: "Perempuan", tempatLahir: "Klaten", tanggalLahir: new Date("2011-04-09"), statusAnak: "Yatim Piatu", tanggalMasuk: daysAgo(1600), pendidikan: "SMA Kelas 10", namaWali: null, alamatAsal: "Klaten, Jawa Tengah", kesehatan: "Sehat" },
  ];
  await db.insert(children).values(CHILDREN);

  const STAFF: (typeof staff.$inferInsert)[] = [
    { nama: "Siti Maryam, S.Pd.", jabatan: "Pengasuh", jenisKelamin: "Perempuan", telepon: "0812-2745-8890", email: "maryam@nurkasih.or.id", alamat: "Tirtonirmolo, Bantul", tanggalBergabung: daysAgo(2900), status: "Aktif" },
    { nama: "Bambang Sutrisno", jabatan: "Administrasi", jenisKelamin: "Laki-laki", telepon: "0813-9271-3345", email: "bambang@nurkasih.or.id", alamat: "Sewon, Bantul", tanggalBergabung: daysAgo(3100), status: "Aktif" },
    { nama: "Sri Wahyuni", jabatan: "Koki", jenisKelamin: "Perempuan", telepon: "0821-3365-7721", email: null, alamat: "Kasihan, Bantul", tanggalBergabung: daysAgo(2500), status: "Aktif" },
    { nama: "Agus Prasetyo", jabatan: "Keamanan", jenisKelamin: "Laki-laki", telepon: "0857-2990-1188", email: null, alamat: "Banguntapan, Bantul", tanggalBergabung: daysAgo(2100), status: "Aktif" },
    { nama: "Fitria Ningsih, S.Psi", jabatan: "Konselor", jenisKelamin: "Perempuan", telepon: "0815-7742-0091", email: "fitria@nurkasih.or.id", alamat: "Depok, Sleman", tanggalBergabung: daysAgo(1700), status: "Aktif" },
    { nama: "Dedi Kurniawan", jabatan: "Guru / Tutor", jenisKelamin: "Laki-laki", telepon: "0822-4418-6673", email: "dedi@nurkasih.or.id", alamat: "Gamping, Sleman", tanggalBergabung: daysAgo(1300), status: "Aktif" },
    { nama: "Rina Marlina, S.Keb.", jabatan: "Perawat", jenisKelamin: "Perempuan", telepon: "0819-0523-4417", email: "rina@nurkasih.or.id", alamat: "Mergangsan, Yogyakarta", tanggalBergabung: daysAgo(1500), status: "Aktif" },
    { nama: "Joko Santoso", jabatan: "Sopir", jenisKelamin: "Laki-laki", telepon: "0852-9081-2234", email: null, alamat: "Pleret, Bantul", tanggalBergabung: daysAgo(900), status: "Cuti" },
  ];
  await db.insert(staff).values(STAFF);

  const DONATIONS: (typeof donations.$inferInsert)[] = [
    { namaDonatur: "Hamba Allah", jenis: "Uang", jumlah: 5000000, tanggal: daysAgo(168), catatan: "Untuk biaya pendidikan anak." },
    { namaDonatur: "PT Sinar Abadi Jaya", jenis: "Sembako", barang: "Beras 4 karung (@25 kg), minyak goreng 2 dus, gula 20 kg", tanggal: daysAgo(160) },
    { namaDonatur: "Ibu Ratna Dewi", jenis: "Uang", jumlah: 1500000, tanggal: daysAgo(147), catatan: "Santunan rutin bulanan." },
    { namaDonatur: "Keluarga Besar Wijaya", jenis: "Barang", barang: "Kasur lipat 8 unit & sprei 8 set", tanggal: daysAgo(138) },
    { namaDonatur: "Komunitas Sedekah Jumat", jenis: "Uang", jumlah: 2750000, tanggal: daysAgo(126), catatan: "Hasil galang dana Jumat berkah." },
    { namaDonatur: "Yayasan Peduli Sesama", jenis: "Sembako", barang: "Mie instan 10 dus, susu UHT 6 dus, telur 15 kg", tanggal: daysAgo(112) },
    { namaDonatur: "H. Hartono Wibisono", jenis: "Uang", jumlah: 10000000, tanggal: daysAgo(101), catatan: "Wakaf pembangunan asrama putri." },
    { namaDonatur: "Donatur Anonim", jenis: "Uang", jumlah: 750000, tanggal: daysAgo(88) },
    { namaDonatur: "Bank Jateng Cab. Yogyakarta", jenis: "Barang", barang: "Seragam sekolah 20 set & tas sekolah 20 pcs", tanggal: daysAgo(79), catatan: "Program CSR pendidikan." },
    { namaDonatur: "Masjid Al-Ikhlas Purbayan", jenis: "Uang", jumlah: 4300000, tanggal: daysAgo(66), catatan: "Infak jamaah untuk kebutuhan pokok." },
    { namaDonatur: "Alumni SMAN 3 Yogyakarta", jenis: "Uang", jumlah: 6200000, tanggal: daysAgo(54), catatan: "Donasi reuni angkatan 2005." },
    { namaDonatur: "Toko Kita Bersama", jenis: "Barang", barang: "Alat tulis & buku tulis 1 paket besar", tanggal: daysAgo(47) },
    { namaDonatur: "Hamba Allah", jenis: "Uang", jumlah: 2500000, tanggal: daysAgo(39), catatan: "Untuk pengobatan anak yang sakit." },
    { namaDonatur: "CV Berkah Sejahtera", jenis: "Sembako", barang: "Beras 2 karung, kornet 3 dus, kue kering 5 toples", tanggal: daysAgo(31) },
    { namaDonatur: "Rotary Club Yogyakarta", jenis: "Barang", barang: "Sepatu sekolah 12 pasang (berbagai ukuran)", tanggal: daysAgo(26) },
    { namaDonatur: "Ibu Sari Handayani", jenis: "Uang", jumlah: 1000000, tanggal: daysAgo(19), catatan: "Santunan ulang tahun panti." },
    { namaDonatur: "PT Karya Anak Bangsa", jenis: "Uang", jumlah: 8500000, tanggal: daysAgo(14), catatan: "Donasi program nutrisi 3 bulan." },
    { namaDonatur: "Keluarga H. Mahfudz", jenis: "Sembako", barang: "Daging ayam 20 kg, ikan segar 15 kg, sayuran 1 pick-up", tanggal: daysAgo(11) },
    { namaDonatur: "Komunitas Bikers Sedekah", jenis: "Uang", jumlah: 3150000, tanggal: daysAgo(8), catatan: "Hasil touring amal." },
    { namaDonatur: "Donatur Anonim", jenis: "Barang", barang: "Kain sarung 10 pcs & mukena 10 pcs", tanggal: daysAgo(6) },
    { namaDonatur: "PT Nusantara Sejahtera", jenis: "Uang", jumlah: 12000000, tanggal: daysAgo(4), catatan: "Sponsor operasional semester genap." },
    { namaDonatur: "Ibu Dewi Anggraini", jenis: "Uang", jumlah: 2000000, tanggal: daysAgo(2) },
    { namaDonatur: "Apotek Sehat Farma", jenis: "Barang", barang: "Vitamin anak 3 dus, obat-obatan dasar & P3K lengkap", tanggal: daysAgo(1), catatan: "Dukungan program kesehatan." },
    { namaDonatur: "Hamba Allah", jenis: "Uang", jumlah: 5000000, tanggal: daysAgo(0), catatan: "Transfer via rekening BSI panti." },
  ];
  await db.insert(donations).values(DONATIONS);

  const NEEDS: (typeof needs.$inferInsert)[] = [
    { nama: "Beras & lauk pauk untuk 1 bulan", kategori: "Makanan & Gizi", jumlah: 60, satuan: "kg", prioritas: "Mendesak", estimasiBiaya: 2400000, tanggalDibutuhkan: daysAhead(5) },
    { nama: "Susu UHT & bubuk untuk anak usia 6–12 th", kategori: "Makanan & Gizi", jumlah: 12, satuan: "dus", prioritas: "Tinggi", estimasiBiaya: 1800000, tanggalDibutuhkan: daysAhead(9) },
    { nama: "Seragam sekolah tahun ajaran baru", kategori: "Pendidikan", jumlah: 16, satuan: "set", prioritas: "Mendesak", estimasiBiaya: 3200000, tanggalDibutuhkan: daysAhead(21) },
    { nama: "Buku tulis & alat tulis semester genap", kategori: "Pendidikan", jumlah: 20, satuan: "pak", prioritas: "Tinggi", estimasiBiaya: 1500000, tanggalDibutuhkan: daysAhead(16) },
    { nama: "Perbaikan atap dapur menjelang musim hujan", kategori: "Tempat Tinggal", jumlah: 1, satuan: "paket", prioritas: "Mendesak", estimasiBiaya: 6500000, tanggalDibutuhkan: daysAhead(12) },
    { nama: "Kasur & sprei asrama putri", kategori: "Tempat Tinggal", jumlah: 6, satuan: "set", prioritas: "Sedang", estimasiBiaya: 3000000, tanggalDibutuhkan: daysAhead(30) },
    { nama: "Pemeriksaan & imunisasi lanjutan anak", kategori: "Kesehatan", jumlah: 16, satuan: "anak", prioritas: "Tinggi", estimasiBiaya: 1600000, tanggalDibutuhkan: daysAhead(14) },
    { nama: "Lengkapi kotak P3K & obat dasar", kategori: "Kesehatan", jumlah: 1, satuan: "paket", prioritas: "Sedang", estimasiBiaya: 750000, tanggalDibutuhkan: daysAhead(25) },
    { nama: "Pakaian layak pakai anak (4–17 th)", kategori: "Pakaian", jumlah: 30, satuan: "pcs", prioritas: "Sedang", estimasiBiaya: 2000000, tanggalDibutuhkan: daysAhead(30) },
    { nama: "Sesi konseling trauma healing mingguan", kategori: "Perlindungan", jumlah: 8, satuan: "sesi", prioritas: "Tinggi", estimasiBiaya: 2400000, tanggalDibutuhkan: daysAhead(7) },
    { nama: "Pendampingan pengurusan akta kelahiran", kategori: "Perlindungan", jumlah: 4, satuan: "anak", prioritas: "Tinggi", estimasiBiaya: 600000, tanggalDibutuhkan: daysAhead(18) },
    { nama: "Sepatu sekolah & kaos kaki", kategori: "Pakaian", jumlah: 16, satuan: "pasang", prioritas: "Tinggi", status: "Terpenuhi", estimasiBiaya: 2800000, tanggalDibutuhkan: daysAgo(10) },
    { nama: "Alat kebersihan & sanitasi asrama", kategori: "Tempat Tinggal", jumlah: 10, satuan: "pak", prioritas: "Rendah", status: "Terpenuhi", estimasiBiaya: 1200000, tanggalDibutuhkan: daysAgo(4) },
  ];
  await db.insert(needs).values(NEEDS);

  const ACTIVITIES: (typeof activities.$inferInsert)[] = [
    { nama: "Tahsin & Tahfidz Pagi", jenis: "Keagamaan", tanggal: daysAhead(2, 5), lokasi: "Aula Panti Nur Kasih", deskripsi: "Setoran hafalan juz 30 dan perbaikan tajwid bersama ustadz pendamping.", penanggungJawab: "Siti Maryam, S.Pd.", status: "Terjadwal" },
    { nama: "Kelas Menulis Kreatif", jenis: "Pendidikan", tanggal: daysAhead(3, 15), lokasi: "Ruang Belajar", deskripsi: "Menulis cerpen bertema cita-cita bersama relawan Komunitas Literasi Jogja.", penanggungJawab: "Dedi Kurniawan", status: "Terjadwal" },
    { nama: "Pemeriksaan Kesehatan Rutin", jenis: "Kesehatan", tanggal: daysAhead(5, 8), lokasi: "Puskesmas Kasihan II", deskripsi: "Cek kesehatan umum, timbang ukur, dan screening gizi untuk seluruh anak asuh.", penanggungJawab: "Rina Marlina, S.Keb.", status: "Terjadwal" },
    { nama: "Sosialisasi Perlindungan Anak", jenis: "Perlindungan", tanggal: daysAhead(7, 10), lokasi: "Aula Panti Nur Kasih", deskripsi: "Edukasi hak anak & keamanan diri bersama Dinas P3A Kabupaten Bantul.", penanggungJawab: "Fitria Ningsih, S.Psi", status: "Terjadwal" },
    { nama: "Family Day & Outbound Ceria", jenis: "Rekreasi", tanggal: daysAhead(14, 8), lokasi: "Hutan Pinus Mangunan", deskripsi: "Permainan tim, piknik bersama donatur dan relawan. Menginap 1 malam.", penanggungJawab: "Bambang Sutrisno", status: "Terjadwal" },
    { nama: "Bimbingan Belajar UTBK", jenis: "Pendidikan", tanggal: daysAgo(3, 16), lokasi: "Ruang Belajar", deskripsi: "Tryout dan pembahasan soal untuk anak kelas 12 bersama alumni.", penanggungJawab: "Dedi Kurniawan", status: "Selesai" },
    { nama: "Santunan & Doa Bersama Donatur", jenis: "Keagamaan", tanggal: daysAgo(6, 16), lokasi: "Aula Panti Nur Kasih", deskripsi: "Penyaluran santunan bulanan dan ramah tamah dengan para donatur tetap.", penanggungJawab: "Bambang Sutrisno", status: "Selesai" },
    { nama: "Pelatihan Kewirausahaan Remaja", jenis: "Keterampilan", tanggal: daysAgo(10, 9), lokasi: "Aula Panti Nur Kasih", deskripsi: "Praktik membuat sabun cuci piring & strategi penjualan untuk anak remaja.", penanggungJawab: "Fitria Ningsih, S.Psi", status: "Selesai" },
    { nama: "Aksi Donor Darah & Bakti Sosial", jenis: "Kesehatan", tanggal: daysAgo(20, 8), lokasi: "Markas PMI Bantul", deskripsi: "Staf dan relawan panti ikut donor darah, disambung kerja bakti lingkungan.", penanggungJawab: "Agus Prasetyo", status: "Selesai" },
    { nama: "Wisata Edukasi Museum Affandi", jenis: "Rekreasi", tanggal: daysAgo(40, 9), lokasi: "Museum Affandi, Yogyakarta", deskripsi: "Mengenal seni lukis dan tur museum untuk anak asuh kelompok SD.", penanggungJawab: "Siti Maryam, S.Pd.", status: "Selesai" },
  ];
  await db.insert(activities).values(ACTIVITIES);
}

export async function ensureSeeded() {
  const [{ value }] = await db.select({ value: count() }).from(users);
  if (value === 0) {
    await runSeed();
  }
}

const invokedAsScript = process.argv[1]?.replace(/\\/g, "/").endsWith("db/seed.ts");
if (invokedAsScript) {
  runSeed()
    .then(() => {
      console.log("Database seeded successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
