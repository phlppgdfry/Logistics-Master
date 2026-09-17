import assert from "node:assert/strict";
import { X509Certificate } from "node:crypto";
import test from "node:test";
import { databaseConfig } from "../lib/database-config";
import { SUPABASE_ROOT_CA } from "../lib/supabase-ca";

test("missing configuration fails without a fallback password", () => {
  assert.throws(() => databaseConfig(""), /DATABASE_URL must be configured/);
});

test("local Compose database does not require cloud TLS", () => {
  assert.deepEqual(databaseConfig("postgresql://db:5432/demo", ""), {
    connectionString: "postgresql://db:5432/demo",
  });
});

test("Supabase uses the authenticated CA and rejects insecure URL overrides", () => {
  const config = databaseConfig(
    "postgresql://aws-0-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=no-verify&ssl=false&sslrootcert=bad&uselibpqcompat=true&application_name=test",
    "",
  );
  assert.equal(new URL(config.connectionString!).searchParams.get("sslmode"), null);
  assert.equal(new URL(config.connectionString!).searchParams.get("ssl"), null);
  assert.equal(new URL(config.connectionString!).searchParams.get("sslrootcert"), null);
  assert.equal(new URL(config.connectionString!).searchParams.get("application_name"), "test");
  assert.deepEqual(config.ssl, {
    rejectUnauthorized: true, minVersion: "TLSv1.2", ca: SUPABASE_ROOT_CA,
  });
  const certificate = new X509Certificate(SUPABASE_ROOT_CA);
  assert.equal(certificate.ca, true);
  assert.equal(certificate.fingerprint256,
    "80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA");
});

test("Neon keeps the system trust store", () => {
  assert.deepEqual(databaseConfig("postgresql://ep-demo.neon.tech/demo", "").ssl, {
    rejectUnauthorized: true, minVersion: "TLSv1.2", ca: undefined,
  });
});

test("a configured CA is normalized without disabling verification", () => {
  assert.deepEqual(databaseConfig("postgresql://db.example.org/demo", "line1\\nline2").ssl, {
    rejectUnauthorized: true, minVersion: "TLSv1.2", ca: "line1\nline2",
  });
});

test("a lookalike hostname does not receive Supabase trust", () => {
  assert.equal(databaseConfig("postgresql://db.supabase.co.example.org/demo", "").ssl, undefined);
});
