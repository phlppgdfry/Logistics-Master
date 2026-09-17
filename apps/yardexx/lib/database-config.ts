import type { PoolConfig } from "pg";
import { SUPABASE_ROOT_CA } from "./supabase-ca";

export function databaseConfig(
  connectionString = process.env.DATABASE_URL,
  customCa = process.env.DATABASE_CA_CERT,
): PoolConfig {
  if (!connectionString) throw new Error("DATABASE_URL must be configured");

  const url = new URL(connectionString);
  const isSupabase = url.hostname.endsWith(".supabase.co") || url.hostname.endsWith(".supabase.com");
  const isNeon = url.hostname.endsWith(".neon.tech");
  if (!isSupabase && !isNeon && !customCa) return { connectionString };

  // pg parses URL SSL options after the explicit config. Remove them here so
  // sslmode=require/no-verify cannot override certificate and hostname checks.
  for (const key of ["ssl", "sslmode", "sslcert", "sslkey", "sslrootcert", "uselibpqcompat"]) {
    url.searchParams.delete(key);
  }

  return {
    connectionString: url.toString(),
    ssl: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
      ca: customCa?.replace(/\\n/g, "\n") || (isSupabase ? SUPABASE_ROOT_CA : undefined),
    },
  };
}
