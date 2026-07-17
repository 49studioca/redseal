---
name: google-ads-redseal
description: >-
  Manages RedSeal Guide Google Ads (customer 7710616309 under manager 6079555378).
  Audits campaigns, keywords, RSAs, conversions, and bidding using 2026 Search best
  practices. Use when the user asks about Google Ads, campaigns, keywords, ROAS,
  CPA, search terms, or Ads performance.
disable-model-invocation: true
---

# Google Ads — RedSeal Guide

Explicit skill: only apply when the user invokes `@google-ads-redseal`.

## Hard rules

These are non-negotiable. Flag any live setup that violates them.

1. **Account:** RedSeal `7710616309`, login customer `6079555378`
2. **Goal:** purchases / subscription (not vanity leads)
3. **One primary conversion only** — live: `RedSeal (web) purchase` (`7685187760`) only; duplicates REMOVED (2026-07-16)
4. **Search only;** Display Network off unless intentional
5. **Theme ad groups** (electrician / 309A), not one giant bag of keywords
6. **RSA:** 10–15 distinct headlines, 4 descriptions, landing page match
7. **Bidding:** Maximize Conversions while learning; move to tCPA after ~30 conversions/month
8. **Match types (2026 nuance):** Broad + Smart Bidding is Google’s default only with clean conversions; for low volume / early RedSeal, prefer Phrase/Exact + negatives until conversion quality is solid
9. **Always:** read via MCP first → propose changes → get approval → mutate via scripts → **update [HISTORY.md](HISTORY.md)**
10. **Never** invent spend/change without confirmation
11. **After every applied change** (keywords, ads, budgets, networks, conversions, scripts, auth): append to [HISTORY.md](HISTORY.md) in the same turn — changelog row + relevant section. A change is incomplete until history is updated.

## Account

| Role                     | ID                           |
| ------------------------ | ---------------------------- |
| Manager (login customer) | `6079555378`                 |
| Client account           | `7710616309`                 |
| Campaign (Search)        | `Leads-Search` `24036541858` |
| Ad group                 | `Ad group 1` `201252644551`  |

Always query **customer_id `7710616309`**. Login customer is already set in `.cursor/mcp.json` (`GOOGLE_ADS_LOGIN_CUSTOMER_ID`).

## Analytics (GA4) + Ads tags

RedSeal uses its **own** GA4 stream and Ads tag — never CELPIP IDs.

| Item                     | Value                                                                       |
| ------------------------ | --------------------------------------------------------------------------- |
| GA4 stream name          | `web redsealguide`                                                          |
| GA4 stream URL           | `https://www.redsealguide.com/`                                             |
| GA4 stream ID            | `15257285665`                                                               |
| GA4 measurement ID       | `G-FM7SKL3XCY`                                                              |
| Ads tag                  | `AW-18254357419`                                                            |
| Site Subscribe label     | `AW-18254357419/FzzgCOWV2NEcEKvHrYBE` (fired from `track-purchase.ts`)      |
| Intended bidding primary | **One** of: site Subscribe **or** GA4 `RedSeal (web) purchase` — never both |

Repo sources: `src/lib/analytics/ids.ts`, `src/lib/analytics/track-purchase.ts` (Checkout Session, deduped). Click IDs via `src/lib/analytics/ad-click-ids.ts`.

When auditing `conversion_action`: list all primaries. Multiple ENABLED purchase primaries (including GA4 page-load `checkout=success` clones) is a **P0 fix** — demote extras to secondary. Do not bid on vanity leads.

Follow the full cleanup steps in [`scripts/ads/CONVERSION_CLEANUP_CHECKLIST.md`](../../../scripts/ads/CONVERSION_CLEANUP_CHECKLIST.md). Verify live with `python scripts/ads/list_conversions.py`.

## Mutation scripts

MCP is **read-only**. After approval, mutate only via `scripts/ads/` (see [`scripts/ads/README.md`](../../../scripts/ads/README.md)):

| Script                    | Purpose                          |
| ------------------------- | -------------------------------- |
| `list_conversions.py`     | Ready — list conversion actions  |
| `pause_keywords.py`       | Stub — pause by substring        |
| `add_negatives.py`        | Stub — campaign negatives        |
| `set_network_settings.py` | Stub — Search partners / Display |
| `update_rsa.py`           | Stub — RSA refresh               |

Default is dry-run; use `--apply` only after user approval. Do not invent new mutate paths in chat.

## MCP

Server: `project-0-redseal-google-ads-mcp`

1. Call `GetMcpTools` for that server before invoking tools.
2. Prefer `search_search` with `customer_id: "7710616309"`.
3. **Never guess GAQL fields** — call `metadata_get_resource_metadata` for the resource first (cache results in-session).
4. If auth fails, run `mcp_auth` once, re-check tools, retry.
5. Optional discovery: `customers_list_accessible_customers` — then still default to `7710616309` unless the user asks otherwise.

Cross-check site traffic with Analytics MCP (`project-0-redseal-analytics-mcp`) only when the user asks for GA4 vs Ads reconciliation.

## Change workflow

```
1. Read (MCP search) — live account only; skim HISTORY.md for prior context
2. Propose — concrete diffs with IDs, expected impact, risk
3. Approval — wait for explicit user OK
4. Mutate via scripts — never claim a change was applied from chat alone
5. Document — update HISTORY.md before ending the turn (required)
```

### HISTORY.md update requirements (step 5)

After any successful mutation or material account discovery, edit [HISTORY.md](HISTORY.md):

1. Add a **Changelog** row: `YYYY-MM-DD | what changed (IDs if any)`
2. Update the relevant section(s): keywords, RSA, conversions, campaign baseline, open issues, scripts inventory
3. If a new entity ID appears (campaign, ad group, ad, conversion), add it to **Identity map** or the matching section
4. Mark completed open issues; add new ones if created
5. In the user reply, briefly confirm history was updated

No invented spend, CPA, ROAS, or “I updated the account” without confirmation + a real mutation path + HISTORY.md entry.

## Audit workflow

Default date window: last 30 days (adjust if user specifies). Pull live data before recommending changes.

```
Audit progress:
- [ ] 1. Hard-rule violations (primaries, Display, structure, RSA counts)
- [ ] 2. Account health (campaigns, status, budget, bidding)
- [ ] 3. Conversions & attribution (one primary)
- [ ] 4. Keywords & match types (theme ad groups; Phrase/Exact bias)
- [ ] 5. Search terms (negatives / expansion)
- [ ] 6. RSAs (10–15 H / 4 D, LP match)
- [ ] 7. Bidding (Max Conv → tCPA at ~30 conv/mo)
- [ ] 8. Recommendations (prioritized; await approval)
```

### 1. Campaigns

Resource: `campaign`. Include status, channel type, network settings, bidding strategy, budget, cost, conversions, conversion value (`metrics.cost_micros`, `metrics.conversions`, `metrics.conversions_value`, `metrics.clicks`, `metrics.impressions`).

Flag: Display/Search Partners on without intent; non-Search channels unless user asked; budgets limiting winners; learning / limited-by-budget.

### 2. Conversions

Resource: `conversion_action`. Enforce **one** primary for purchases/subscription. Flag multiple purchase primaries, secondary/import noise used as bid signal, zero-conversion spend, tag mismatches.

### 3. Keywords & structure

Resources: `keyword_view` / `ad_group_criterion`. Ad groups must be themed (e.g. electrician, 309A) — not one giant bag. For early/low volume: Phrase/Exact + negatives; treat Broad as conditional on clean conversion data + Smart Bidding. Flag low-QS high-spend and cross-ad-group cannibalization.

### 4. Search terms

Resource: `search_term_view`. Propose negatives for irrelevant intent; propose Phrase/Exact adds for converting terms. Align to RedSeal exam prep / trade certification — not DIY or job-board noise.

### 5. RSAs

Resource: `ad_group_ad`. Target **10–15 distinct headlines**, **4 descriptions**, copy aligned to the landing page. Flag thin asset sets, heavy pinning, weak LP match, missing extensions when relevant.

### 6. Bidding

- Learning / low volume: **Maximize Conversions**
- After ~**30 conversions/month**: propose move to **tCPA** (do not flip without approval)
- Do not chase micro-conversions as the bid signal

## Response format

```markdown
## Summary

[2–4 sentences: performance vs purchase goal, biggest hard-rule issue]

## Hard-rule check

| Rule                      | Pass/Fail | Evidence |
| ------------------------- | --------- | -------- |
| One primary conversion    | …         | …        |
| Search only / Display off | …         | …        |
| Theme ad groups           | …         | …        |
| RSA 10–15 H / 4 D + LP    | …         | …        |
| Bidding stage             | …         | …        |
| Match types appropriate   | …         | …        |

## Findings

| Area        | Status | Evidence      |
| ----------- | ------ | ------------- |
| Campaigns   | …      | metrics / IDs |
| Keywords    | …      | …             |
| RSAs        | …      | …             |
| Conversions | …      | …             |
| Bidding     | …      | …             |

## Proposed changes (needs approval)

1. [Priority] Action — expected impact — risk
2. …

## History

- [ ] HISTORY.md updated (changelog + section) — required after applied changes

## Queries used

- resource + key conditions
```

Costs: report in currency units (divide `cost_micros` by 1_000_000). Cite campaign/ad group names and IDs. Label all numbers as MCP-sourced; if a query failed, say so.

## Safety

- Read via MCP → propose → approval → mutate via scripts → update HISTORY.md.
- Never invent metrics or claim mutations without confirmation.
- Do not expose developer tokens, refresh tokens, or full credential paths.
- Pauses, budget cuts, bidding flips, primary-conversion changes: proposals only until approved.
- **Do not end a turn after a live Ads mutation without updating HISTORY.md.**

## Reference

- Account history (new account baseline + every change): [HISTORY.md](HISTORY.md)
- Sample `search_search` field lists: [queries.md](queries.md)
- Conversion P0 checklist: [`scripts/ads/CONVERSION_CLEANUP_CHECKLIST.md`](../../../scripts/ads/CONVERSION_CLEANUP_CHECKLIST.md)

Before recommending strategy on this account, read **HISTORY.md** — the account is new; early learning status and past keyword/RSA edits matter.
