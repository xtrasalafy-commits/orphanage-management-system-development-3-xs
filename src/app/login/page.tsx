import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ensureSeeded } from "@/db/seed";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  // Guarantee demo data exists on very first load, even on a fresh database.
  await ensureSeeded().catch(() => {});
  const user = await getSessionUser().catch(() => null);
  if (user) redirect("/dashboard");

  return (
    <main className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      {/* Left — form */}
      <section className="relative flex flex-col bg-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(1200px 500px at -10% -10%, rgba(39,103,85,0.08), transparent 60%)",
          }}
        />
        <div className="relative flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
          <LoginForm />
        </div>
        <p className="relative pb-6 text-center text-xs text-stone-400">
          &copy; {new Date().getFullYear()} Yayasan Panti Asuhan Nur Kasih — Bantul, Yogyakarta
        </p>
      </section>

      {/* Right — hero imagery */}
      <section className="relative hidden overflow-hidden lg:block">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-pine-800 via-pine-950 to-stone-950"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(900px 460px at 15% -5%, rgba(131,188,164,0.28), transparent 60%), radial-gradient(720px 620px at 105% 100%, rgba(251,191,36,0.14), transparent 60%), radial-gradient(560px 420px at 80% 25%, rgba(84,157,131,0.18), transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 12px)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pine-950/85 via-pine-950/25 to-pine-950/35" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-widest text-white/90 uppercase backdrop-blur">
            Kebutuhan Dasar &amp; Perlindungan Anak
          </p>
          <h2 className="max-w-xl font-display text-4xl leading-[1.15] font-medium text-white xl:text-5xl">
            Merawat harapan, menjaga tumbuh kembang setiap anak.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {[
              ["16", "Anak Asuh"],
              ["8", "Pengasuh & Staf"],
              ["6", "Program Rutin"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 backdrop-blur"
              >
                <p className="font-display text-2xl font-semibold text-white">{value}</p>
                <p className="text-xs font-medium tracking-wide text-white/75">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
