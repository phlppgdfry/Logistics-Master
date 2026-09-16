#!/usr/bin/env python3
"""
Fetch seed URLs and store simple text extracts.

No third-party dependencies are required. This is intentionally small so it can
run on a clean machine. Respect robots.txt and website terms before broad crawls.
"""

from __future__ import annotations

import csv
import html.parser
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "data" / "sources.csv"
OUT_DIR = ROOT / "data" / "scraped"


class TextExtractor(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.skip = False
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style", "noscript", "svg"}:
            self.skip = True

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "noscript", "svg"}:
            self.skip = False

    def handle_data(self, data: str) -> None:
        if not self.skip:
            text = data.strip()
            if text:
                self.parts.append(text)


def slug(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")[:80] or "source"


def fetch(url: str) -> str:
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "zeebrugge-logistics-intel/0.1 (+local research script)",
        },
    )
    context = ssl.create_default_context()
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    with urllib.request.urlopen(request, timeout=20, context=context) as response:
        raw = response.read()
    return raw.decode("utf-8", errors="replace")


def extract_text(html: str) -> str:
    parser = TextExtractor()
    parser.feed(html)
    text = " ".join(parser.parts)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    rows = list(csv.DictReader(SOURCES.open(newline="", encoding="utf-8")))
    failures = 0

    for row in rows:
        source_id = row["id"]
        title = row["title"]
        url = row["url"]
        name = f"{source_id}_{slug(title)}.txt"
        target = OUT_DIR / name
        print(f"Fetching {source_id}: {url}")
        try:
            html = fetch(url)
            text = extract_text(html)
            target.write_text(
                f"Title: {title}\nURL: {url}\nSource ID: {source_id}\n\n{text}\n",
                encoding="utf-8",
            )
            time.sleep(1.0)
        except Exception as exc:  # noqa: BLE001 - research script should continue
            failures += 1
            target.write_text(
                f"Title: {title}\nURL: {url}\nSource ID: {source_id}\n\nERROR: {exc}\n",
                encoding="utf-8",
            )
            print(f"  failed: {exc}", file=sys.stderr)

    print(f"Done. Wrote {len(rows)} files to {OUT_DIR}. Failures: {failures}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
