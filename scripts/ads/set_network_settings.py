"""Stub: turn Search Partners / Display Network on or off for Leads-Search.

Usage:
  python scripts/ads/set_network_settings.py --dry-run
  python scripts/ads/set_network_settings.py --apply --no-search-partners --no-content-network
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from _client import CUSTOMER_ID, LEADS_SEARCH_CAMPAIGN_ID, get_ads_client


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true", default=True)
    parser.add_argument("--apply", action="store_true", help="Perform the mutate")
    parser.add_argument("--no-search-partners", action="store_true")
    parser.add_argument("--no-content-network", action="store_true")
    args = parser.parse_args()
    dry_run = not args.apply

    target_search = True
    target_partners = not args.no_search_partners
    target_content = not args.no_content_network

    print(
        f"{'DRY-RUN' if dry_run else 'APPLY'} campaign {LEADS_SEARCH_CAMPAIGN_ID}\n"
        f"  target_google_search={target_search}\n"
        f"  target_search_network={target_partners}\n"
        f"  target_content_network={target_content}"
    )
    if dry_run:
        print("Re-run with --apply to mutate.")
        return

    # TODO: CampaignService.mutate_campaigns updating network_settings
    _ = get_ads_client()
    _ = CUSTOMER_ID
    raise SystemExit(
        "Not implemented yet. Implement CampaignOperation update for "
        "network_settings.target_search_network / target_content_network."
    )


if __name__ == "__main__":
    main()
