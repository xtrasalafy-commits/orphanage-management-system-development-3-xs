import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("Admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const children = pgTable("children", {
  id: uuid("id").defaultRandom().primaryKey(),
  kode: text("kode").notNull(),
  nama: text("nama").notNull(),
  jenisKelamin: text("jenis_kelamin").notNull(),
  tempatLahir: text("tempat_lahir"),
  tanggalLahir: timestamp("tanggal_lahir", { withTimezone: true }),
  statusAnak: text("status_anak").notNull().default("Yatim"),
  tanggalMasuk: timestamp("tanggal_masuk", { withTimezone: true }).notNull().defaultNow(),
  pendidikan: text("pendidikan"),
  namaWali: text("nama_wali"),
  alamatAsal: text("alamat_asal"),
  kesehatan: text("kesehatan").default("Sehat"),
  catatan: text("catatan"),
  status: text("status").notNull().default("Aktif"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staff = pgTable("staff", {
  id: uuid("id").defaultRandom().primaryKey(),
  nama: text("nama").notNull(),
  jabatan: text("jabatan").notNull(),
  jenisKelamin: text("jenis_kelamin").notNull(),
  telepon: text("telepon"),
  email: text("email"),
  alamat: text("alamat"),
  tanggalBergabung: timestamp("tanggal_bergabung", { withTimezone: true }).notNull().defaultNow(),
  status: text("status").notNull().default("Aktif"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const donations = pgTable("donations", {
  id: uuid("id").defaultRandom().primaryKey(),
  namaDonatur: text("nama_donatur").notNull(),
  jenis: text("jenis").notNull().default("Uang"),
  jumlah: integer("jumlah"),
  barang: text("barang"),
  tanggal: timestamp("tanggal", { withTimezone: true }).notNull().defaultNow(),
  catatan: text("catatan"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const needs = pgTable("needs", {
  id: uuid("id").defaultRandom().primaryKey(),
  nama: text("nama").notNull(),
  kategori: text("kategori").notNull(),
  jumlah: integer("jumlah").notNull().default(1),
  satuan: text("satuan").notNull().default("unit"),
  prioritas: text("prioritas").notNull().default("Sedang"),
  status: text("status").notNull().default("Dibutuhkan"),
  estimasiBiaya: integer("estimasi_biaya"),
  tanggalDibutuhkan: timestamp("tanggal_dibutuhkan", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  nama: text("nama").notNull(),
  jenis: text("jenis").notNull(),
  tanggal: timestamp("tanggal", { withTimezone: true }).notNull(),
  lokasi: text("lokasi"),
  deskripsi: text("deskripsi"),
  penanggungJawab: text("penanggung_jawab"),
  status: text("status").notNull().default("Terjadwal"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
