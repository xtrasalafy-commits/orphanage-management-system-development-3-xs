CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" text NOT NULL,
	"jenis" text NOT NULL,
	"tanggal" timestamp with time zone NOT NULL,
	"lokasi" text,
	"deskripsi" text,
	"penanggung_jawab" text,
	"status" text DEFAULT 'Terjadwal' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "children" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kode" text NOT NULL,
	"nama" text NOT NULL,
	"jenis_kelamin" text NOT NULL,
	"tempat_lahir" text,
	"tanggal_lahir" timestamp with time zone,
	"status_anak" text DEFAULT 'Yatim' NOT NULL,
	"tanggal_masuk" timestamp with time zone DEFAULT now() NOT NULL,
	"pendidikan" text,
	"nama_wali" text,
	"alamat_asal" text,
	"kesehatan" text DEFAULT 'Sehat',
	"catatan" text,
	"status" text DEFAULT 'Aktif' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama_donatur" text NOT NULL,
	"jenis" text DEFAULT 'Uang' NOT NULL,
	"jumlah" integer,
	"barang" text,
	"tanggal" timestamp with time zone DEFAULT now() NOT NULL,
	"catatan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "needs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" text NOT NULL,
	"kategori" text NOT NULL,
	"jumlah" integer DEFAULT 1 NOT NULL,
	"satuan" text DEFAULT 'unit' NOT NULL,
	"prioritas" text DEFAULT 'Sedang' NOT NULL,
	"status" text DEFAULT 'Dibutuhkan' NOT NULL,
	"estimasi_biaya" integer,
	"tanggal_dibutuhkan" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" text NOT NULL,
	"jabatan" text NOT NULL,
	"jenis_kelamin" text NOT NULL,
	"telepon" text,
	"email" text,
	"alamat" text,
	"tanggal_bergabung" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text DEFAULT 'Aktif' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'Admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;