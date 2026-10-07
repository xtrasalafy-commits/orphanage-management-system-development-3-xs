import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const pool = new Pool({ connectionString: databaseUrl });
const db = drizzle(pool);

async function main() {
  const journalPath = path.join(process.cwd(), "drizzle", "meta", "_journal.json");
  if (!fs.existsSync(journalPath)) {
    console.warn("No migrations found in drizzle/ — run `npm run db:generate` first.");
    return;
  }
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  console.log("Migrations applied successfully.");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
