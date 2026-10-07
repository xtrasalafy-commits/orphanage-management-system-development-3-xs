import fs from "node:fs";
import crypto from "node:crypto";
import { Pool } from "pg";

/**
 * Records an already-applied migration in drizzle's migration bookkeeping table
 * so `drizzle-orm`'s migrator won't try to re-run it. Used to reconcile tables
 * that were created out-of-band (e.g. raw SQL) with the migration journal.
 */
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const MIGRATION_FILE = "drizzle/0000_init.sql";
const journal = JSON.parse(fs.readFileSync("drizzle/meta/_journal.json", "utf8"));
const entry = journal.entries[0];
if (!entry) throw new Error("No journal entries found");

const sql = fs.readFileSync(MIGRATION_FILE, "utf8");
const hash = crypto.createHash("sha256").update(sql).digest("hex");

const pool = new Pool({ connectionString: url });

async function main() {
  const client = await pool.connect();
  try {
    await client.query("CREATE SCHEMA IF NOT EXISTS drizzle");
    await client.query(`
      CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);
    const existing = await client.query(
      "SELECT id FROM drizzle.__drizzle_migrations WHERE hash = $1",
      [hash],
    );
    if (existing.rows.length > 0) {
      console.log(`Migration ${entry.tag} already recorded — nothing to do.`);
    } else {
      await client.query(
        "INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ($1, $2)",
        [hash, entry.when],
      );
      console.log(`Recorded ${entry.tag} (created_at=${entry.when}).`);
    }
    const rows = await client.query(
      "SELECT id, hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id",
    );
    console.log("drizzle.__drizzle_migrations:", JSON.stringify(rows.rows));
  } finally {
    client.release();
  }
}

main()
  .catch((err) => {
    console.error("Reconciliation failed:", err);
    process.exit(1);
  })
  .finally(() => pool.end());
