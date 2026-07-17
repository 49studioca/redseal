"""Apply high-impact RedSeal Ads fixes (Search campaign).

What this does:
- Upload square logo PNG and link as BUSINESS_LOGO (not LOGO — Search API)
- Link business name RedSeal Guide as BUSINESS_NAME
- Turn Display Network off
- Add phrase negatives for non-electrician intent
- Pause Trades List sitelink

What this cannot do:
- GA4 conversion primary / include_in_conversions_metric — immutable via API; use Ads UI.

Usage:
  python scripts/ads/apply_important_fixes.py
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from google.ads.googleads.errors import GoogleAdsException
from google.protobuf import field_mask_pb2

from _client import CUSTOMER_ID, LEADS_SEARCH_CAMPAIGN_ID, get_ads_client

LOGO_PATH = Path(__file__).resolve().parent / "assets" / "redseal-logo-square-1200.png"
BUSINESS_NAME = "RedSeal Guide"
TRADES_LIST_SITELINK_ASSET_ID = 392884797036

NEGATIVES = [
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
    "apprenticeship salary",
    "what is red seal",
]


def _mutate(client, label: str, service_name: str, method: str, operations):
    service = client.get_service(service_name)
    try:
        response = getattr(service, method)(
            customer_id=CUSTOMER_ID, operations=operations
        )
    except GoogleAdsException as ex:
        print(f"FAILED {label}")
        for error in ex.failure.errors:
            print(f"  {error.error_code}: {error.message}")
        raise SystemExit(1) from ex
    print(f"OK {label}: {len(response.results)}")
    return response


def main() -> None:
    if not LOGO_PATH.exists():
        raise SystemExit(f"Missing logo PNG: {LOGO_PATH}")
    if not os.environ.get("GOOGLE_ADS_DEVELOPER_TOKEN"):
        raise SystemExit("GOOGLE_ADS_DEVELOPER_TOKEN required")

    client = get_ads_client()
    campaign = f"customers/{CUSTOMER_ID}/campaigns/{LEADS_SEARCH_CAMPAIGN_ID}"

    # Logo
    op = client.get_type("AssetOperation")
    asset = op.create
    asset.name = "RedSeal Guide logo"
    asset.type_ = client.enums.AssetTypeEnum.IMAGE
    data = LOGO_PATH.read_bytes()
    asset.image_asset.data = data
    asset.image_asset.file_size = len(data)
    asset.image_asset.mime_type = client.enums.MimeTypeEnum.IMAGE_PNG
    logo_rn = _mutate(client, "upload logo", "AssetService", "mutate_assets", [op]).results[
        0
    ].resource_name

    op = client.get_type("CampaignAssetOperation")
    link = op.create
    link.asset = logo_rn
    link.campaign = campaign
    link.field_type = client.enums.AssetFieldTypeEnum.BUSINESS_LOGO
    _mutate(client, "link BUSINESS_LOGO", "CampaignAssetService", "mutate_campaign_assets", [op])

    # Business name
    op = client.get_type("AssetOperation")
    asset = op.create
    asset.name = "Business name RedSeal Guide"
    asset.type_ = client.enums.AssetTypeEnum.TEXT
    asset.text_asset.text = BUSINESS_NAME
    biz_rn = _mutate(
        client, "create business name", "AssetService", "mutate_assets", [op]
    ).results[0].resource_name

    op = client.get_type("CampaignAssetOperation")
    link = op.create
    link.asset = biz_rn
    link.campaign = campaign
    link.field_type = client.enums.AssetFieldTypeEnum.BUSINESS_NAME
    _mutate(
        client, "link BUSINESS_NAME", "CampaignAssetService", "mutate_campaign_assets", [op]
    )

    # Display off
    op = client.get_type("CampaignOperation")
    c = op.update
    c.resource_name = campaign
    c.network_settings.target_google_search = True
    c.network_settings.target_search_network = True
    c.network_settings.target_content_network = False
    op.update_mask.CopyFrom(
        field_mask_pb2.FieldMask(
            paths=[
                "network_settings.target_google_search",
                "network_settings.target_search_network",
                "network_settings.target_content_network",
            ]
        )
    )
    _mutate(client, "display off", "CampaignService", "mutate_campaigns", [op])

    # Negatives
    ops = []
    for phrase in NEGATIVES:
        op = client.get_type("CampaignCriterionOperation")
        cr = op.create
        cr.campaign = campaign
        cr.negative = True
        cr.keyword.text = phrase
        cr.keyword.match_type = client.enums.KeywordMatchTypeEnum.PHRASE
        ops.append(op)
    _mutate(
        client,
        "negatives",
        "CampaignCriterionService",
        "mutate_campaign_criteria",
        ops,
    )

    # Pause Trades List sitelink
    op = client.get_type("CampaignAssetOperation")
    link = op.update
    link.resource_name = (
        f"customers/{CUSTOMER_ID}/campaignAssets/"
        f"{LEADS_SEARCH_CAMPAIGN_ID}~{TRADES_LIST_SITELINK_ASSET_ID}~SITELINK"
    )
    link.status = client.enums.AssetLinkStatusEnum.PAUSED
    op.update_mask.CopyFrom(field_mask_pb2.FieldMask(paths=["status"]))
    _mutate(
        client, "pause Trades List", "CampaignAssetService", "mutate_campaign_assets", [op]
    )

    print("DONE — still finish conversion primaries in Ads UI (GA4 imports are API-immutable).")


if __name__ == "__main__":
    main()
