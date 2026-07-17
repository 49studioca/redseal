"""Stub: pause ad-group keywords by text match (electrician hygiene).

Usage:
  python scripts/ads/pause_keywords.py --dry-run --contains millwright,plumbing
  python scripts/ads/pause_keywords.py --apply --contains millwright
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from _client import AD_GROUP_1_ID, CUSTOMER_ID, get_ads_client


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", default=True)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument(
        "--contains",
        required=True,
        help="Comma-separated substrings; pause keywords containing any",
    )
    args = parser.parse_args()
    dry_run = not args.apply
    needles = [n.strip().lower() for n in args.contains.split(",") if n.strip()]

    client = get_ads_client()
    ga_service = client.get_service("GoogleAdsService")
    query = f"""
      SELECT
        ad_group_criterion.criterion_id,
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group_criterion.status
      FROM ad_group_criterion
      WHERE ad_group.id = {AD_GROUP_1_ID}
        AND ad_group_criterion.type = 'KEYWORD'
        AND ad_group_criterion.status != 'REMOVED'
    """

    matches: list[tuple[int, str, str, str]] = []
    for row in ga_service.search(customer_id=CUSTOMER_ID, query=query):
        text = row.ad_group_criterion.keyword.text.lower()
        if any(n in text for n in needles):
            matches.append(
                (
                    row.ad_group_criterion.criterion_id,
                    row.ad_group_criterion.keyword.text,
                    row.ad_group_criterion.keyword.match_type.name,
                    row.ad_group_criterion.status.name,
                )
            )

    print(f"{'DRY-RUN' if dry_run else 'APPLY'} pause {len(matches)} keyword(s):")
    for criterion_id, text, match_type, status in matches:
        print(f"  {criterion_id}\t{status}\t{match_type}\t{text}")

    if dry_run:
        print("Re-run with --apply to mutate.")
        return

    # TODO: AdGroupCriterionService update status=PAUSED
    raise SystemExit(
        "Not implemented yet. Implement AdGroupCriterionOperation updates "
        "setting status=PAUSED for matched criterion IDs."
    )


if __name__ == "__main__":
    main()
