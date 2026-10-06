/** Client-side shapes (dates arrive serialized as ISO strings over JSON). */

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type Child = {
  id: string;
  kode: string;
  nama: string;
  jenisKelamin: string;
  tempatLahir: string | null;
  tanggalLahir: string | null;
  statusAnak: string;
  tanggalMasuk: string;
  pendidikan: string | null;
  namaWali: string | null;
  alamatAsal: string | null;
  kesehatan: string | null;
  catatan: string | null;
  status: string;
  createdAt: string;
};

export type StaffMember = {
  id: string;
  nama: string;
  jabatan: string;
  jenisKelamin: string;
  telepon: string | null;
  email: string | null;
  alamat: string | null;
  tanggalBergabung: string;
  status: string;
  createdAt: string;
};

export type Donation = {
  id: string;
  namaDonatur: string;
  jenis: string;
  jumlah: number | null;
  barang: string | null;
  tanggal: string;
  catatan: string | null;
  createdAt: string;
};

export type Need = {
  id: string;
  nama: string;
  kategori: string;
  jumlah: number;
  satuan: string;
  prioritas: string;
  status: string;
  estimasiBiaya: number | null;
  tanggalDibutuhkan: string | null;
  createdAt: string;
};

export type Activity = {
  id: string;
  nama: string;
  jenis: string;
  tanggal: string;
  lokasi: string | null;
  deskripsi: string | null;
  penanggungJawab: string | null;
  status: string;
  createdAt: string;
};
