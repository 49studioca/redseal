"""List conversion actions for RedSeal Guide (read-only).

Usage:
  python scripts/ads/list_conversions.py
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from _client import CUSTOMER_ID, get_ads_client


def main() -> None:
    client = get_ads_client()
    ga_service = client.get_service("GoogleAdsService")
    query = """
      SELECT
        conversion_action.id,
        conversion_action.name,
        conversion_action.status,
        conversion_action.type,
        conversion_action.category,
        conversion_action.primary_for_goal,
        conversion_action.include_in_conversions_metric
      FROM conversion_action
      ORDER BY conversion_action.status, conversion_action.name
    """
    print(f"Customer {CUSTOMER_ID} conversion actions:\n")
    for row in ga_service.search(customer_id=CUSTOMER_ID, query=query):
        action = row.conversion_action
        primary = "PRIMARY" if action.primary_for_goal else "secondary"
        include = "in_conversions" if action.include_in_conversions_metric else "excluded"
        print(
            f"{action.id}\t{action.status.name}\t{primary}\t{include}\t"
            f"{action.category.name}\t{action.type.name}\t{action.name}"
        )


if __name__ == "__main__":
    main()
