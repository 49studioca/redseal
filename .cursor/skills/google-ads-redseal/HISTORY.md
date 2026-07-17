# RedSeal Guide Google Ads — account history

**Purpose:** Reference for future agents/humans. This Ads account is **new**; treat early history as the baseline, not as long-run performance truth.

**Documented as of:** 2026-07-16  
**Timezone note:** Account currency CAD. Manager TZ America/Vancouver.

---

## Identity map

| Role                       | Name          | ID (digits only)                      | Formatted    |
| -------------------------- | ------------- | ------------------------------------- | ------------ |
| Manager                    | 49 Studio     | `6079555378`                          | 607-955-5378 |
| Client                     | RedSeal Guide | `7710616309`                          | 771-061-6309 |
| Site Ads tag               | —             | `AW-18254357419`                      | —            |
| Subscribe conversion label | Site `gtag`   | `AW-18254357419/FzzgCOWV2NEcEKvHrYBE` | —            |

**Access pattern:** User OAuth is not directly on RedSeal Guide. Queries/mutations must use:

- `customer_id` = `7710616309`
- `login-customer-id` / `GOOGLE_ADS_LOGIN_CUSTOMER_ID` = `6079555378`

Configured in `.cursor/mcp.json` for MCP. Scripts use `scripts/ads/_client.py`.

**Other Ads customers visible to the same login** (not RedSeal):

| ID           | Name                            | Notes       |
| ------------ | ------------------------------- | ----------- |
| `7264214890` | CELPIP (OLD-END APRIL 1, 2026)… | Client, CAD |
| `8641929017` | CELPIP (OLD-END JUNE 9 2026)    | Client, CAD |
| `4183784250` | CPT                             | Client, CAD |
| `6079555378` | 49 Studio                       | Manager     |

Do **not** change those accounts unless the user explicitly asks.

---

## Tooling setup (2026-07-16)

### Cursor MCP

- Server: official `google-ads-mcp` (read-only) via pipx from `git+https://github.com/googleads/google-ads-mcp.git`
- Project MCP file: `.cursor/mcp.json`
- Env: `GOOGLE_APPLICATION_CREDENTIALS`, `GOOGLE_PROJECT_ID=redseal-guide`, `GOOGLE_ADS_DEVELOPER_TOKEN` (from user env), `GOOGLE_ADS_LOGIN_CUSTOMER_ID=6079555378`
- Analytics remains separate: `analytics-mcp`

### Auth notes (pain points)

1. Default `gcloud` OAuth client **cannot** request Ads scopes → Google “This app is blocked”.
2. Web OAuth client type is **invalid** for ADC; must be **Desktop** client.
3. Successful ADC login used Desktop client JSON under `C:\Projects\CELPIPguide\redseal\client_secret_95555654124-….json`.
4. Credentials saved to `C:\Users\rezah\gcloud-config\application_default_credentials.json` (not the default Roaming path). MCP paths were updated to match.
5. Quota project set to `redseal-guide` (enabled Cloud Resource Manager when prompted).

### Mutation path

Official Ads MCP is **read-only**. Writes use Python `google-ads` + ADC + developer token + login customer (see `scripts/ads/`).

### Agent skill

- `.cursor/skills/google-ads-redseal/SKILL.md` — invoke with `@google-ads-redseal`
- `queries.md` — GAQL field patterns
- This file — account history
- `scripts/ads/CONVERSION_CLEANUP_CHECKLIST.md` — open P0 conversion work

---

## Campaign baseline at first audit (2026-07-16)

Single campaign found:

| Field          | Value                                                                  |
| -------------- | ---------------------------------------------------------------------- |
| Name           | `Leads-Search`                                                         |
| Campaign ID    | `24036541858`                                                          |
| Status         | ENABLED / SERVING                                                      |
| Primary status | LEARNING                                                               |
| Channel        | SEARCH                                                                 |
| Bidding        | MAXIMIZE_CONVERSIONS (no target CPA)                                   |
| Daily budget   | $10 CAD (`10000000` micros)                                            |
| Networks       | Google Search **on**, Search partners **on**, **Display Network on**   |
| Geo            | Canada (`geoTargetConstants/2124`), presence                           |
| Payment        | CLICKS                                                                 |
| Ad group       | `Ad group 1` (`201252644551`), ENABLED, SEARCH_STANDARD, CPC bid $0.01 |
| Landing URL    | `https://www.redsealguide.com`                                         |

**Interpretation for a new account:** Learning + $10/day + Max Conv is expected early. Do not judge Smart Bidding quality until conversion signal is cleaned and volume exists (~30 purchases/month before tCPA).

---

## Keyword history

### Initial state (first audit)

- ~35 ENABLED **BROAD** keywords in one ad group
- Mix of electrician/309A **and** other trades (millwright, plumbing, carpenter, mechanic, automotive, hairstylist, heavy duty) plus generic “red seal …” terms

### Change 1 — electrician-only filter (2026-07-16)

Paused **19** non-electrician keywords. Kept **16** containing `electrician`, `309a`, or `electrical`.

**Kept (then still BROAD):**

- electrician exam / test / exam prep / study guide / exam practice test / practice test
- 309a electrician exam / 309a exam / 309a practice exam / 309a exam prep / 309a electrician exam preparation
- electrical contractor exam prep
- red seal electrician exam prep / exam / exam questions / practice exam

**Paused examples:** red seal millwright/plumbing/carpenter/mechanic/automotive/hairstylist/heavy duty; generic red seal exam / practice test / mock exam / trades list; canadian red seal exam; etc.

### Change 2 — match-type tighten (2026-07-16)

Broad cannot be updated in place. Recreated keywords:

- **Removed** 16 broad keywords
- **Created** 16 **PHRASE** + 6 **EXACT** duplicates for high intent:

Exact (+ phrase also kept):

- `electrician exam`
- `electrician practice test`
- `309a exam`
- `309a practice exam`
- `red seal electrician exam`
- `red seal electrician practice exam`

**Live after change:** 22 ENABLED keyword rows (phrase set + exact subset). No broad keywords enabled.

**2026 nuance for future agents:** Google often recommends Broad + Smart Bidding, but this account was early/low volume with dirty conversions — Phrase/Exact was the intentional safer choice. Revisit Broad only after **one clean primary conversion** and stable purchase volume.

---

## RSA / creative history

### Old RSA (paused)

| Field               | Value                                                                                                                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ad ID               | `816819058704`                                                                                                                                                                                                      |
| Status after change | **PAUSED**                                                                                                                                                                                                          |
| Issues              | Keyword-stuffed headlines (`red seal mock exam`, `technician red seal practice`); weak/odd copy (`Is Your SE Exam Prep Ready`); generic multi-trade framing; “Free Quote” description mismatch; empty display paths |

### New RSA (live)

| Field     | Value                                              |
| --------- | -------------------------------------------------- |
| Ad ID     | `817152074608`                                     |
| Status    | ENABLED (entered review on create)                 |
| Final URL | `https://www.redsealguide.com`                     |
| Paths     | `/electrician/309A`                                |
| Previous  | `817151597998` PAUSED (unique-description refresh) |

**Headlines (15):**

1. Red Seal Electrician Prep
2. 309A Exam Practice Tests
3. Pass Your Electrician Exam
4. Canadian Electrician Prep
5. Red Seal Exam Practice
6. 309A Mock Exams Online
7. Electrician Exam Questions
8. Study for Your Red Seal
9. AI Lessons for Electricians
10. Practice Tests and Flashcards
11. Built for Canadian Trades
12. Start Prep Today
13. Electrician Study Guide
14. RedSealGuide.com
15. Ace the 309A Exam

**Descriptions (4) — unique angles (2026-07-16 refresh):**

1. Timed 309A mock exams that mirror test day and show where you are weak. _(format / diagnostics)_
2. Canadian Electrical Code only - no US NEC content mixed into lessons. _(Canadian differentiation)_
3. AI lessons and flashcards adapt to the topics you miss most often. _(product / personalization)_
4. Pick a plan and start electrician exam prep today on RedSealGuide. _(CTA / pricing)_

### Change — Ads recommendations: unique descriptions + sitelinks (2026-07-16)

Addressed Google Ads suggestions:

1. **Descriptions more unique** — new RSA `817152074608`; paused `817151597998`.
2. **More sitelinks** — added 4 ENABLED sitelinks (now **6** total ENABLED):

| Link text                             | URL                                |
| ------------------------------------- | ---------------------------------- |
| View Pricing                          | `/pricing`                         |
| 309A Exam Prep                        | `/trades/construction-electrician` |
| 442A Exam Prep                        | `/trades/industrial-electrician`   |
| Create Account                        | `/auth/signup`                     |
| Construction Electrician _(existing)_ | `/trades/construction-electrician` |
| Industrial Electrician _(existing)_   | `/trades/industrial-electrician`   |

Trades List remains PAUSED.

---

## Conversion history

### Baseline (first audit, 2026-07-16)

Five ENABLED purchase actions all PRIMARY — unsafe for Maximize Conversions.

### Change — conversion cleanup by user (2026-07-16)

User removed duplicate purchase conversions in Ads UI. Live verify via `list_conversions.py`:

| ID           | Name                                  | Status      | Primary | In conversions metric |
| ------------ | ------------------------------------- | ----------- | ------- | --------------------- |
| `7685187760` | **RedSeal (web) purchase**            | **ENABLED** | **Yes** | Yes                   |
| `7686010211` | Purchase (Page load checkout=success) | REMOVED     | —       | —                     |
| `7686010292` | Purchase (Page load…) (1)             | REMOVED     | —       | —                     |
| `7686451900` | Purchase (Page load…) (2)             | REMOVED     | —       | —                     |
| `7686384123` | PURCHASE                              | REMOVED     | —       | —                     |
| `7685187754` | RedSeal (web) close_convert_lead      | HIDDEN      | No      | excluded              |
| `7685187757` | RedSeal (web) qualify_lead            | HIDDEN      | No      | excluded              |

**Bidding primary (chosen):** GA4 `RedSeal (web) purchase` only.

**Site side:** Checkout still fires GA `purchase` / `subscribe` plus Ads Subscribe tag (`track-purchase.ts`). Confirm in UI that Subscribe is not also a primary (if it appears separately).

**API note:** GA4-imported actions could not be demoted via API; UI removal succeeded.

---

### Change — brand assets, Search-only, negatives (2026-07-16)

Applied high-impact hygiene for the new account:

| Item            | Result                                                                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Business name   | Linked `RedSeal Guide` as `BUSINESS_NAME` (asset `392890317471`) at campaign + customer                                                                                                                                    |
| Logo            | Uploaded square PNG from `https://www.redsealguide.com/redseal-logo.svg` → asset `394316355480` (`RedSeal Guide logo`); linked as **`BUSINESS_LOGO`** on `Leads-Search` (Search does not accept `LOGO` field type via API) |
| Display Network | **Off** (`target_content_network=false`); Google Search + Search partners still on                                                                                                                                         |
| Negatives       | 17 phrase negatives (other trades, jobs/salary, free pdf, reddit, etc.)                                                                                                                                                    |
| Sitelink        | Paused **Trades List** (`392884797036`); kept Construction Electrician + Industrial Electrician                                                                                                                            |
| Conversions     | Completed in UI — only `RedSeal (web) purchase` ENABLED                                                                                                                                                                    |

Local logo files: `scripts/ads/assets/redseal-logo.svg`, `redseal-logo-square-1200.png`.

---

## Open issues / next priorities (as of 2026-07-16, post conversion cleanup)

1. **P2 — Split ad groups** — Electrician vs 309A themed groups.
2. **P2 — Budget / learning** — $10/day may stay limited; raise only with clean conversion volume.
3. **P3 — tCPA** — after ~30 conversions/month.
4. **P3 — Search terms review** — weekly once spend accrues.
5. **Optional** — confirm site Subscribe tag is not a second primary in Ads UI.

**Done this pass:** Display off, negatives, business name, business logo, pause Trades List sitelink.

---

## Scripts inventory

| Path                                              | Status  | Role                                                  |
| ------------------------------------------------- | ------- | ----------------------------------------------------- |
| `scripts/ads/_client.py`                          | Ready   | Shared client + IDs                                   |
| `scripts/ads/list_conversions.py`                 | Ready   | List conversion actions                               |
| `scripts/ads/pause_keywords.py`                   | Stub    | Pause by substring                                    |
| `scripts/ads/add_negatives.py`                    | Stub    | Campaign negatives                                    |
| `scripts/ads/set_network_settings.py`             | Stub    | Network toggles                                       |
| `scripts/ads/update_rsa.py`                       | Stub    | RSA refresh helper                                    |
| `scripts/ads/README.md`                           | Ready   | How to run                                            |
| `scripts/ads/CONVERSION_CLEANUP_CHECKLIST.md`     | Ready   | Conversion P0 steps                                   |
| `scripts/ads/apply_important_fixes.py`            | Partial | Brand/network/negatives helper (conversions still UI) |
| `scripts/ads/assets/redseal-logo-square-1200.png` | Ready   | Source logo for Ads upload                            |

One-off mutation scripts used on 2026-07-16 (pause keywords / tighten match / fix RSA) were deleted after apply; recreate from this history if needed.

---

## Operating principles for future work

1. This account is **new** — prefer diagnosis + small controlled changes over aggressive automation.
2. Always read live via MCP before recommending; cite IDs. Skim this file first.
3. Propose → explicit approval → mutate via scripts (MCP cannot write).
4. Never invent spend/CPA/ROAS.
5. Electrician / 309A focus until user expands trades.
6. **Required:** after every applied change, update this file in the same turn:
   - Append a **Changelog** row
   - Patch the matching narrative section (keywords / RSA / conversions / open issues / scripts)
   - Add new IDs to identity/campaign tables when they appear
   - A mutation without a history update is incomplete

### How to append an entry

```markdown
### Change N — short title (YYYY-MM-DD)

- What: …
- IDs: …
- Before → after: …
- Why: …
```

Then add one Changelog table row for the same date.

---

## Changelog

| Date       | Change                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-07-16 | MCP + ADC auth setup; discovered RedSeal under 49 Studio                                                                                               |
| 2026-07-16 | First full audit of `Leads-Search`                                                                                                                     |
| 2026-07-16 | Paused 19 non-electrician keywords                                                                                                                     |
| 2026-07-16 | Replaced broad keywords with phrase + exact                                                                                                            |
| 2026-07-16 | New electrician RSA `817151597998`; paused `816819058704`                                                                                              |
| 2026-07-16 | Created Ads scripts, conversion checklist, `@google-ads-redseal` skill                                                                                 |
| 2026-07-16 | This history document created                                                                                                                          |
| 2026-07-16 | Skill hard-rule: must update HISTORY.md after every applied Ads change                                                                                 |
| 2026-07-16 | Noted gap: no business name/logo linked; campaign has sitelinks only; IMAGE `392715301973` unlinked                                                    |
| 2026-07-16 | Applied brand assets (BUSINESS_NAME + BUSINESS_LOGO `394316355480`), Display off, 17 negatives, paused Trades List sitelink; conversions still UI-only |
| 2026-07-16 | User removed duplicate purchases in UI — only `RedSeal (web) purchase` (`7685187760`) ENABLED primary                                                  |
| 2026-07-16 | Unique RSA descriptions (`817152074608`); +4 sitelinks (Pricing, 309A, 442A, Create Account); 6 ENABLED sitelinks total                                |
