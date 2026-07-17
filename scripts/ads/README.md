# RedSeal Google Ads scripts

Customer `7710616309` via manager login `6079555378`.

## Prerequisites

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\rezah\gcloud-config\application_default_credentials.json"
$env:GOOGLE_ADS_DEVELOPER_TOKEN=<token>
```

## Scripts

| Script                    | Status               | Purpose                           |
| ------------------------- | -------------------- | --------------------------------- |
| `list_conversions.py`     | Ready                | Read conversion actions           |
| `pause_keywords.py`       | Stub (lists matches) | Pause keywords by substring       |
| `add_negatives.py`        | Stub                 | Campaign negative keywords        |
| `set_network_settings.py` | Stub                 | Search partners / Display toggles |
| `update_rsa.py`           | Stub                 | RSA headline/description refresh  |

Mutating stubs require `--apply` and still raise until implemented. Default is dry-run.

After any successful live mutation, update [`.cursor/skills/google-ads-redseal/HISTORY.md`](../../.cursor/skills/google-ads-redseal/HISTORY.md) (changelog + section) in the same turn.

## Conversion cleanup

Follow [CONVERSION_CLEANUP_CHECKLIST.md](./CONVERSION_CLEANUP_CHECKLIST.md) before relying on Smart Bidding.

## Full account history

Baseline audit + every change (keywords, RSA, auth, open issues):  
[`.cursor/skills/google-ads-redseal/HISTORY.md`](../../.cursor/skills/google-ads-redseal/HISTORY.md)
