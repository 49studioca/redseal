"""Stub: replace RSA headlines/descriptions for Ad group 1.

Usage:
  python scripts/ads/update_rsa.py --dry-run
  python scripts/ads/update_rsa.py --apply --from-json path/to/rsa.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from _client import AD_GROUP_1_ID, CUSTOMER_ID, get_ads_client

# Placeholder electrician-focused copy — review before --apply
DEFAULT_RSA = {
    "final_url": "https://www.redsealguide.com",
    "headlines": [
        "Red Seal Electrician Prep",
        "309A Exam Practice Tests",
        "Pass Your Electrician Exam",
        "AI Red Seal Study Guide",
        "Canadian Electrician Prep",
        "Mock Exams for 309A",
        "Electrician Exam Questions",
        "Study Smarter for Red Seal",
        "Built for Canadian Trades",
        "Start Electrician Prep Today",
    ],
    "descriptions": [
        "Practice tests and lessons for Canadian Red Seal electrician exams.",
        "Prep for the 309A exam with Canadian code-aligned study material.",
        "Mock exams, flashcards, and guided lessons for electricians.",
        "Start studying on RedSealGuide — built for Red Seal candidates.",
    ],
}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", default=True)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--from-json", type=Path, help="RSA JSON override")
    args = parser.parse_args()
    dry_run = not args.apply

    payload = DEFAULT_RSA
    if args.from_json:
        payload = json.loads(args.from_json.read_text(encoding="utf-8"))

    headlines = payload["headlines"]
    descriptions = payload["descriptions"]
    if not (3 <= len(headlines) <= 15):
        raise SystemExit("RSA needs 3–15 headlines")
    if not (2 <= len(descriptions) <= 4):
        raise SystemExit("RSA needs 2–4 descriptions")

    print(f"{'DRY-RUN' if dry_run else 'APPLY'} RSA for ad group {AD_GROUP_1_ID}")
    print(f"  final_url={payload.get('final_url')}")
    print(f"  headlines ({len(headlines)}):")
    for h in headlines:
        print(f"    - {h}")
    print(f"  descriptions ({len(descriptions)}):")
    for d in descriptions:
        print(f"    - {d}")

    if dry_run:
        print("Re-run with --apply to mutate.")
        return

    # TODO: create new RSA + pause old ad, or update existing AdGroupAd
    _ = get_ads_client()
    _ = CUSTOMER_ID
    raise SystemExit(
        "Not implemented yet. Prefer create new RESPONSIVE_SEARCH_AD then "
        "pause the previous ad_group_ad rather than in-place edit."
    )


if __name__ == "__main__":
    main()
