"""Shared Google Ads API client for RedSeal Guide scripts."""

from __future__ import annotations

import os

import google.auth
from google.ads.googleads.client import GoogleAdsClient

# RedSeal Guide under 49 Studio manager
CUSTOMER_ID = "7710616309"
LOGIN_CUSTOMER_ID = "6079555378"
LEADS_SEARCH_CAMPAIGN_ID = 24036541858
AD_GROUP_1_ID = 201252644551


def require_developer_token() -> str:
    token = os.environ.get("GOOGLE_ADS_DEVELOPER_TOKEN")
    if not token:
        raise SystemExit(
            "Set GOOGLE_ADS_DEVELOPER_TOKEN (user or process env) before running Ads scripts."
        )
    return token


def get_ads_client() -> GoogleAdsClient:
    credentials, _ = google.auth.default(
        scopes=["https://www.googleapis.com/auth/adwords"],
    )
    return GoogleAdsClient(
        credentials=credentials,
        developer_token=require_developer_token(),
        login_customer_id=LOGIN_CUSTOMER_ID,
        use_proto_plus=True,
    )
