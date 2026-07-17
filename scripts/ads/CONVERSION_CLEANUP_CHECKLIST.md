# RedSeal Guide — conversion cleanup checklist

Account: **RedSeal Guide** `771-061-6309` (manager **49 Studio** `607-955-5378`)  
Site conversion tag in code: `AW-18254357419/FzzgCOWV2NEcEKvHrYBE` (`Subscribe` via `track-purchase.ts`)

Goal: **one clean purchase/subscribe signal** for Smart Bidding. Multiple primary purchase actions train Maximize Conversions on noisy, duplicated events.

---

## Current problem (from Ads API audit)

| Conversion action                                 | Status  | Primary for goal | Issue                         |
| ------------------------------------------------- | ------- | ---------------- | ----------------------------- |
| RedSeal (web) purchase                            | ENABLED | Yes              | Keep candidate (GA4 purchase) |
| Purchase (Page load …/dashboard?checkout=success) | ENABLED | Yes              | Duplicate page-load purchase  |
| Purchase (Page load …) (1)                        | ENABLED | Yes              | Duplicate                     |
| Purchase (Page load …) (2)                        | ENABLED | Yes              | Duplicate                     |
| PURCHASE                                          | ENABLED | Yes              | Ambiguous custom event        |
| RedSeal (web) close_convert_lead                  | HIDDEN  | No               | Lead goal — leave off bidding |
| RedSeal (web) qualify_lead                        | HIDDEN  | No               | Lead goal — leave off bidding |

Site also fires Ads **Subscribe** (`send_to` label above) on successful checkout. Confirm in Ads UI whether that tag maps to a separate conversion action and whether it is primary.

---

## Checklist

### A. Decide the single source of truth

- [x] Chosen primary: **GA4 `RedSeal (web) purchase`** (`7685187760`)
- [x] Documented in HISTORY.md (2026-07-16)

### B. Google Ads UI — Goals / Conversions

- [x] Duplicate page-load / `PURCHASE` actions set to **REMOVED** (verified via API list)
- [x] Only **RedSeal (web) purchase** remains ENABLED + PRIMARY for bidding
- [x] Lead actions (`close_convert_lead`, `qualify_lead`) remain HIDDEN / secondary

### C. GA4 alignment

- [ ] In GA4 property linked to this Ads account, confirm a single `purchase` (or `subscribe`) event with value.
- [ ] Disable or stop exporting duplicate “page_view / checkout=success” conversions to Ads.
- [ ] In Ads ↔ GA4 link, only import the chosen purchase event as primary.

### D. Site tag hygiene (repo)

- [ ] Keep `gtag('config', 'AW-18254357419')` + Subscribe conversion on real checkout success only (`track-purchase.ts`).
- [ ] Do **not** add a second Ads conversion on the same success page load if GA4 purchase is already primary.
- [ ] Confirm `transaction_id` dedupe (`ga_purchase_tx_*`) is working in production.
- [ ] Verify Enhanced Conversions / first-party data settings if using broad match later.

### E. API limitation

- [x] Confirmed (2026-07-16): GA4-imported actions cannot change `include_in_conversions_metric` or status via Ads API — use UI / GA4 export settings.

### F. Campaign bidding after cleanup

- [ ] Campaign **Leads-Search** still on Maximize Conversions while learning.
- [ ] After cleanup, wait for learning to settle (avoid bidding edits for ~7 days unless spend is broken).
- [ ] When you have ~30 purchases / month, set a **Target CPA** from actual CPA (start ~10–20% above recent CPA).

### G. Verify

Run:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\rezah\gcloud-config\application_default_credentials.json"
$env:GOOGLE_ADS_DEVELOPER_TOKEN=<your token>
python scripts/ads/list_conversions.py
```

- [ ] Exactly **one** ENABLED purchase-like action shows `PRIMARY`.
- [ ] Duplicates are secondary or removed.
- [ ] Test a real or staging checkout once; confirm **one** conversion in Ads (not 2–4) for that `transaction_id`.

### H. Optional hardening

- [ ] Add conversion value rules only if plan prices differ and you want tROAS later.
- [ ] Exclude free/test accounts from conversion counting if they pollute learning.
- [ ] Weekly: search terms → add negatives via `add_negatives.py` (after stub is implemented).

---

## Done when

1. Bidding sees a single primary purchase/subscribe conversion.
2. Duplicate page-load purchase actions are secondary or gone.
3. A test checkout creates one Ads conversion row.
4. Leads-Search network settings are Search-only (use `set_network_settings.py` when implemented).
