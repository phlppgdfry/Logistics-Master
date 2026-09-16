#!/usr/bin/env python3
"""
Attempt to extract APZI member candidates from the public members page.

The APZI page is partly rendered as a directory/search UI, so this script is
deliberately conservative: it records visible candidate lines and categories
instead of pretending to have a complete member export.
"""

from __future__ import annotations

import csv
import html.parser
import json
import re
import ssl
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "data" / "apzi_member_candidates.csv"
FIRECRAWL_DIR = ROOT / "data" / "firecrawl"
MEMBER_EXPORT = ROOT / "data" / "apzi_members_export.csv"
URLS = [
    "https://www.apzi.be/leden",
    "https://www.apzi.be/en/leden",
]

CATEGORY_TERMS = {
    "customs",
    "douane",
    "expeditie",
    "freight",
    "forwarding",
    "goederenbehandeling",
    "it",
    "logistiek",
    "logistics",
    "magazijnopslag",
    "rederijen",
    "shipping",
    "terminal",
    "transport",
    "warehousing",
}
NOISE_TEXT = {
    "all activities",
    "home",
    "news",
    "events",
    "leden",
    "members",
    "quicklinks",
    "we use cookies to provide you a better user experience on this website.",
}


class TextExtractor(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.skip = False
        self.parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in {"script", "style", "svg", "noscript"}:
            self.skip = True

    def handle_endtag(self, tag: str) -> None:
        if tag in {"script", "style", "svg", "noscript"}:
            self.skip = False

    def handle_data(self, data: str) -> None:
        if self.skip:
            return
        text = re.sub(r"\s+", " ", data).strip()
        if text:
            self.parts.append(text)


def fetch(url: str) -> str:
    request = urllib.request.Request(
        url,
        headers={"User-Agent": "zeebrugge-logistics-intel/0.2 (+research script)"},
    )
    context = ssl.create_default_context()
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    with urllib.request.urlopen(request, timeout=20, context=context) as response:
        return response.read().decode("utf-8", errors="replace")


def classify(text: str) -> str:
    lowered = text.lower()
    hits = sorted(term for term in CATEGORY_TERMS if re.search(rf"\b{re.escape(term)}\b", lowered))
    return ";".join(hits)


def looks_like_candidate(text: str) -> bool:
    if len(text) < 3 or len(text) > 120:
        return False
    if text.lower() in NOISE_TEXT:
        return False
    if text.startswith("→"):
        return False
    if re.fullmatch(r"[0-9]+", text):
        return False
    return bool(classify(text) or re.search(r"\b(nv|bv|sa|ltd|logistics|terminal|ports?)\b", text, re.I))


def member_name_from_url(url: str) -> str:
    slug = url.rstrip("/").rsplit("/", 1)[-1]
    slug = re.sub(r"-[0-9]+$", "", slug)
    replacements = {
        "csp": "CSP",
        "dfds": "DFDS",
        "dp": "DP",
        "dsv": "DSV",
        "ecs": "ECS",
        "g4s": "G4S",
        "h": "H",
        "hr": "HR",
        "ico": "ICO",
        "it": "IT",
        "kbc": "KBC",
        "lng": "LNG",
        "nv": "NV",
        "nyk": "NYK",
        "p": "P",
        "o": "O",
        "pdi": "PDI",
        "sa": "SA",
        "sds": "SDS",
        "uk": "UK",
    }
    words = [replacements.get(part, part.capitalize()) for part in slug.split("-")]
    return " ".join(words)


def clean_activity_text(value: str) -> str:
    value = re.sub(r"!\[\]\(<Base64-Image-Removed>\)", "", value)
    value = value.replace("\\\n", "\n")
    value = value.replace("\\", "\n")
    parts = [re.sub(r"\s+", " ", part).strip() for part in value.splitlines()]
    return "; ".join(part for part in parts if part)


def extract_firecrawl_member_rows() -> list[dict[str, str]]:
    rows: list[dict[str, str]] = []
    seen: set[str] = set()
    files = sorted(FIRECRAWL_DIR.glob("APZI_members_page*.json"))
    pattern = re.compile(
        r"\[(!\[\]\(<Base64-Image-Removed>\).*?)\]\((https://www\.apzi\.be/en/leden/[^)#?]+)\)",
        re.S,
    )

    for path in files:
        payload = json.loads(path.read_text(encoding="utf-8"))
        markdown = payload.get("markdown", "")
        page_match = re.search(r"/page/([0-9]+)", payload.get("metadata", {}).get("url", ""))
        page = page_match.group(1) if page_match else "1"
        for match in pattern.finditer(markdown):
            activity_tags = clean_activity_text(match.group(1))
            profile_url = match.group(2)
            if profile_url in seen:
                continue
            seen.add(profile_url)
            rows.append(
                {
                    "member_name": member_name_from_url(profile_url),
                    "profile_url": profile_url,
                    "activity_tags": activity_tags,
                    "directory_page": page,
                    "source_file": path.name,
                    "extraction_status": "firecrawl_directory_card",
                }
            )

    rows.sort(key=lambda row: (row["member_name"].lower(), row["profile_url"]))
    return rows


def write_member_export(rows: list[dict[str, str]]) -> None:
    MEMBER_EXPORT.parent.mkdir(parents=True, exist_ok=True)
    with MEMBER_EXPORT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=[
                "member_name",
                "profile_url",
                "activity_tags",
                "directory_page",
                "source_file",
                "extraction_status",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    rows: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()

    for url in URLS:
        html = fetch(url)
        parser = TextExtractor()
        parser.feed(html)
        for text in parser.parts:
            if not looks_like_candidate(text):
                continue
            key = (url, text.lower())
            if key in seen:
                continue
            seen.add(key)
            rows.append(
                {
                    "source_url": url,
                    "candidate_text": text,
                    "matched_terms": classify(text),
                    "status": "candidate_visible_text",
                }
            )

    TARGET.parent.mkdir(parents=True, exist_ok=True)
    with TARGET.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=["source_url", "candidate_text", "matched_terms", "status"],
        )
        writer.writeheader()
        writer.writerows(rows)

    member_rows = extract_firecrawl_member_rows()
    write_member_export(member_rows)

    print(f"Wrote {len(rows)} APZI visible-text candidates to {TARGET}")
    print(f"Wrote {len(member_rows)} APZI member directory rows to {MEMBER_EXPORT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
