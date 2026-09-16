"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)", background: "#0a1628",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "2rem",
      fontFamily: "system-ui, sans-serif",
    }}>
      <p style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</p>
      <h1 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 800, marginBottom: ".75rem" }}>
        Er is iets misgegaan
      </h1>
      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2rem" }}>
        Probeer het opnieuw of ga terug naar de marketplace.
      </p>
      {error.digest && (
        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.75rem", marginBottom: "1.5rem", fontFamily: "monospace" }}>
          Error ID: {error.digest}
        </p>
      )}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            background: "#00c9a7", color: "#0a1628",
            padding: ".75rem 1.5rem", borderRadius: "10px",
            border: "none", fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Probeer opnieuw
        </button>
        <Link href="/marketplace" style={{
          border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.7)",
          padding: ".75rem 1.5rem", borderRadius: "10px",
          textDecoration: "none", fontWeight: 600,
        }}>
          Naar marketplace
        </Link>
      </div>
    </div>
  );
}
