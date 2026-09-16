#!/usr/bin/env python3
"""
Collect lightweight website technology hints for company domains.

This is not a Wappalyzer replacement. It records transparent, reproducible
signals from headers, generator meta tags and script URLs so manual
Wappalyzer/BuiltWith checks can be compared against local evidence.
"""

from __future__ import annotations

import csv
import html.parser
import re
import ssl
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ENRICHMENT = ROOT / "data" / "company_enrichment.csv"
TARGET = ROOT / "data" / "web_tech_scan.csv"


class SignalParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.generators: list[str] = []
        self.scripts: list[str] = []
        self.stylesheets: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): value or "" for key, value in attrs}
        if tag == "meta" and values.get("name", "").lower() == "generator":
            self.generators.append(values.get("content", ""))
        if tag == "script" and values.get("src"):
            self.scripts.append(values["src"])
        if tag == "link" and values.get("rel", "").lower() == "stylesheet":
            self.stylesheets.append(values.get("href", ""))


def fetch(url: str) -> tuple[str, str]:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "zeebrugge-logistics-intel/0.2 (+web tech scan)"},
    )
    context = ssl.create_default_context()
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    with urllib.request.urlopen(request, timeout=20, context=context) as response:
        headers = "\n".join(f"{key}: {value}" for key, value in response.headers.items())
        body = response.read(1_000_000).decode("utf-8", errors="replace")
    return headers, body


def infer_signals(headers: str, body: str, parser: SignalParser) -> list[str]:
    haystack = "\n".join([headers, body[:200_000], " ".join(parser.scripts), " ".join(parser.stylesheets)]).lower()
    checks = {
        "Cloudflare": "cloudflare",
        "WordPress": "wp-content",
        "Drupal": "drupal",
        "Next.js": "_next/static",
        "React": "react",
        "Vue": "vue",
        "Google Tag Manager": "googletagmanager",
        "Google Analytics": "google-analytics",
        "Cookiebot": "cookiebot",
        "OneTrust": "onetrust",
        "jQuery": "jquery",
        "Bootstrap": "bootstrap",
    }
    signals = [name for name, needle in checks.items() if needle in haystack]
    for generator in parser.generators:
        if generator and generator not in signals:
            signals.append(f"generator:{generator}")
    return signals


def normalize_url(domain: str) -> str:
    domain = domain.strip()
    if not domain:
        return ""
    if domain.startswith(("http://", "https://")):
        return domain
    return f"https://{domain}"


def main() -> int:
    rows = list(csv.DictReader(ENRICHMENT.open(newline="", encoding="utf-8")))
    results: list[dict[str, str]] = []

    for row in rows:
        url = normalize_url(row["domain"])
        if not url:
            continue
        try:
            headers, body = fetch(url)
            parser = SignalParser()
            parser.feed(body)
            signals = infer_signals(headers, body, parser)
            status = "ok"
            error = ""
        except (urllib.error.URLError, TimeoutError, ValueError) as exc:
            signals = []
            status = "failed"
            error = str(exc)

        results.append(
            {
                "company": row["company"],
                "domain": row["domain"],
                "status": status,
                "signals": ";".join(signals),
                "error": re.sub(r"\s+", " ", error)[:220],
            }
        )

    with TARGET.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["company", "domain", "status", "signals", "error"])
        writer.writeheader()
        writer.writerows(results)

    ok = sum(1 for row in results if row["status"] == "ok")
    print(f"Wrote {len(results)} web tech rows to {TARGET} ({ok} successful fetches)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
