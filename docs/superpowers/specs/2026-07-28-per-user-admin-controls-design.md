# Per-User Admin Controls — Design Spec

## Goal
Full per-user control from the analytics Users tab: feature toggles, plan override, usage reset, suspend/reactivate, and activity view.

## Database

### New table: `user_overrides`
```sql
CREATE TABLE user_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  org_id UUID NOT NULL,
  
  -- Feature kill switches (NULL = use org default, true = force enable, false = force disable)
  override_discovery BOOLEAN,
  override_osint BOOLEAN,
  override_ai_pitching BOOLEAN,
  override_webhooks BOOLEAN,
  override_auto_email BOOLEAN,
  override_telegram_userbot BOOLEAN,
  
  -- Plan override (NULL = use org plan)
  override_plan TEXT,  -- 'free', 'starter', 'max', 'enterprise'
  
  -- Usage overrides (NULL = use defaults)
  override_leads_limit INTEGER,
  override_emails_limit INTEGER,
  
  -- Account status
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  
  -- Audit trail
  overridden_by TEXT,  -- admin email
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### `GET /api/admin/users?email=...`
Search users by email (uses analytics_persons + user_overrides).

### `GET /api/admin/users/[userId]`
Get full user profile: person data + overrides + recent events + usage stats.

### `PATCH /api/admin/users/[userId]`
Update user overrides. Fields:
- `override_discovery`, `override_osint`, `override_ai_pitching`, `override_webhooks`, `override_auto_email`, `override_telegram_userbot` — boolean or null
- `override_plan` — string or null
- `override_leads_limit`, `override_emails_limit` — number or null
- `is_suspended` — boolean
- `suspension_reason` — string

### `POST /api/admin/users/[userId]/reset-usage`
Reset usage counters for leads and emails.

## Kill Switch Priority
```
User override (if not NULL) → Org flag → Global default (true)
```

Updated `check_feature_flag` RPC to accept optional `user_uuid` parameter, or check in API layer.

## Admin UI — Users Tab (replaced)

### Layout
```
┌─────────────────────────────────────────────────────────┐
│ [Search: _______________]           │  User Details      │
│                                    │                    │
│  Results:                          │  ┌──────────────┐  │
│  ┌──────────────────────────────┐  │  │ Avatar/Name  │  │
│  │ user@email.com   Max plan   │  │  │ Email        │  │
│  │ last seen: 2h ago           │  │  │ Plan: Max    │  │
│  ├──────────────────────────────┤  │  │ Status: OK   │  │
│  │ another@email.com  Free     │  │  └──────────────┘  │
│  │ last seen: 3d ago           │  │                    │
│  └──────────────────────────────┘  │  ┌──────────────┐  │
│                                    │  │ Feature      │  │
│                                    │  │ Toggles      │  │
│                                    │  │ ☑ Discovery  │  │
│                                    │  │ ☑ AI Pitch   │  │
│                                    │  │ ☑ Telegram   │  │
│                                    │  │ ☑ Webhooks   │  │
│                                    │  │ ☑ Auto Email │  │
│                                    │  │ ☑ OSINT      │  │
│                                    │  └──────────────┘  │
│                                    │                    │
│                                    │  ┌──────────────┐  │
│                                    │  │ Plan & Usage │  │
│                                    │  │ Plan: [▼Max] │  │
│                                    │  │ Leads: 45/∞  │  │
│                                    │  │ Emails: 32/∞ │  │
│                                    │  │ [Reset Usage]│  │
│                                    │  └──────────────┘  │
│                                    │                    │
│                                    │  ┌──────────────┐  │
│                                    │  │ Account      │  │
│                                    │  │ [Suspend]     │  │
│                                    │  │ [Delete]      │  │
│                                    │  └──────────────┘  │
│                                    │                    │
│                                    │  ┌──────────────┐  │
│                                    │  │ Activity Log │  │
│                                    │  │ (last 50)    │  │
│                                    │  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Feature Toggle UI
Each feature shows:
- **Org default** (grey indicator)
- **User override** (toggle that can be ON/OFF/Follow Org)
- When override is set, shows "Override: ON/OFF" badge

### Plan Override
- Dropdown: Free / Starter / Max / Enterprise / (Use Org Default)
- When overridden, shows "Override" badge

### Usage Reset
- Shows current usage vs limit
- "Reset" button with confirmation
- Resets `analytics_daily_stats` or usage counters

### Account Actions
- **Suspend**: Sets `is_suspended = true`, user gets 403 on all API calls
- **Delete**: Soft-deletes user (marks as deleted, doesn't remove data)

## Files to Create/Modify

### New files:
- `dashboard/app/api/admin/users/route.ts` — search users
- `dashboard/app/api/admin/users/[userId]/route.ts` — get/update overrides
- `dashboard/app/api/admin/users/[userId]/reset-usage/route.ts` — reset usage
- `dashboard/app/api/admin/users/[userId]/suspend/route.ts` — suspend/unsuspend

### Modified files:
- `dashboard/lib/kill-switches.ts` — check user overrides
- `admin-app/src/components/PostHogModule.tsx` — replace PersonsTab with full control panel

### Database migration:
- Create `user_overrides` table
- Add index on `user_id`
