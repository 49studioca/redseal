"""Stub: add campaign-level negative keywords for RedSeal Leads-Search.

Usage:
  python scripts/ads/add_negatives.py --dry-run
  python scripts/ads/add_negatives.py --apply --phrases millwright,plumbing,hairstylist
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from _client import CUSTOMER_ID, LEADS_SEARCH_CAMPAIGN_ID, get_ads_client

# Safe defaults for electrician-only targeting
DEFAULT_NEGATIVES = [
    "millwright",
    "plumbing",
    "plumber",
    "carpenter",
    "hairstylist",
    "automotive",
    "heavy duty",
    "mechanic",
    "welder",
    "free pdf",
    "reddit",
    "salary",
    "job",
    "jobs",
    "hiring",
]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", default=True)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument(
        "--phrases",
        default=",".join(DEFAULT_NEGATIVES),
        help="Comma-separated negative phrases (phrase match)",
    )
    args = parser.parse_args()
    dry_run = not args.apply
    phrases = [p.strip() for p in args.phrases.split(",") if p.strip()]

    print(
        f"{'DRY-RUN' if dry_run else 'APPLY'} add {len(phrases)} campaign negatives "
        f"to {LEADS_SEARCH_CAMPAIGN_ID}:"
    )
    for phrase in phrases:
        print(f"  - [{phrase}]")

    if dry_run:
        print("Re-run with --apply to mutate.")
        return

    # TODO: CampaignCriterionService create KEYWORD negatives (PHRASE)
    _ = get_ads_client()
    _ = CUSTOMER_ID
    raise SystemExit(
        "Not implemented yet. Implement CampaignCriterionOperation creates "
        "with negative=True and keyword.match_type=PHRASE."
    )


if __name__ == "__main__":
    main()
