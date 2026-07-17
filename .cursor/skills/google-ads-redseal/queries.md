# Google Ads MCP query patterns (RedSeal)

Use with `search_search` on customer `7710616309`. Discover exact field names via `metadata_get_resource_metadata` before relying on these lists — API field availability can differ by resource.

## Campaign performance (30d)

```
resource: campaign
fields:
  - campaign.id
  - campaign.name
  - campaign.status
  - campaign.advertising_channel_type
  - campaign.bidding_strategy_type
  - campaign_budget.amount_micros
  - metrics.impressions
  - metrics.clicks
  - metrics.cost_micros
  - metrics.conversions
  - metrics.conversions_value
  - metrics.cost_per_conversion
conditions:
  - segments.date DURING LAST_30_DAYS
  - campaign.status != 'REMOVED'
orderings:
  - metrics.cost_micros DESC
```

## Conversion actions

```
resource: conversion_action
fields:
  - conversion_action.id
  - conversion_action.name
  - conversion_action.status
  - conversion_action.type
  - conversion_action.category
  - conversion_action.primary_for_goal
  - metrics.conversions
  - metrics.conversions_value
  - metrics.all_conversions
conditions:
  - segments.date DURING LAST_30_DAYS
```

## Keywords

```
resource: keyword_view
fields:
  - campaign.id
  - campaign.name
  - ad_group.id
  - ad_group.name
  - ad_group_criterion.keyword.text
  - ad_group_criterion.keyword.match_type
  - ad_group_criterion.status
  - metrics.impressions
  - metrics.clicks
  - metrics.cost_micros
  - metrics.conversions
  - metrics.average_cpc
conditions:
  - segments.date DURING LAST_30_DAYS
  - campaign.status != 'REMOVED'
  - ad_group_criterion.status != 'REMOVED'
orderings:
  - metrics.cost_micros DESC
limit: 100
```

## Search terms

```
resource: search_term_view
fields:
  - campaign.id
  - campaign.name
  - ad_group.id
  - ad_group.name
  - search_term_view.search_term
  - search_term_view.status
  - metrics.impressions
  - metrics.clicks
  - metrics.cost_micros
  - metrics.conversions
conditions:
  - segments.date DURING LAST_30_DAYS
orderings:
  - metrics.cost_micros DESC
limit: 150
```

## RSAs

```
resource: ad_group_ad
fields:
  - campaign.id
  - campaign.name
  - ad_group.id
  - ad_group.name
  - ad_group_ad.ad.id
  - ad_group_ad.status
  - ad_group_ad.ad.type
  - ad_group_ad.ad.responsive_search_ad.headlines
  - ad_group_ad.ad.responsive_search_ad.descriptions
  - metrics.impressions
  - metrics.clicks
  - metrics.conversions
  - metrics.cost_micros
conditions:
  - segments.date DURING LAST_30_DAYS
  - ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD'
  - ad_group_ad.status != 'REMOVED'
```

## Notes

- Date literals like `LAST_30_DAYS` must be valid for the API version the MCP uses; if a condition errors, switch to explicit `segments.date BETWEEN 'YYYY-MM-DD' AND 'YYYY-MM-DD'`.
- Some QS / ad-strength fields live on different resources — check metadata rather than forcing them onto `keyword_view` / `ad_group_ad`.
- Manager account `6079555378` is login-only; do not use it as `customer_id` for performance pulls.
