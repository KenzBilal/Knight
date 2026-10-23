# Plans & Pricing

Knight's active plans, prices, checkout variants, and displayed features are
configured in the database and shown on the pricing page.

## Current application feature gates

The current runtime recognizes `free`, `starter`, and `max` plan identifiers.
Fallback monthly quotas are 50 leads and 50 emails for `free`, 1,000 of each
for `starter`, and unlimited for `max`. Configured plan records can override
quotas.

| Feature gate | Free | Starter | Max |
|--------------|------|---------|-----|
| AI pitch, webhooks, templates | No | Yes | Yes |
| Telegram, BYOK, drip, inbox | No | No | Yes |

Check the pricing page for current plan names, prices, and included features.

## Managing your subscription

1. Open **Billing** in the dashboard.
2. Choose an available plan and complete checkout through LemonSqueezy.
3. Use the subscription portal to change or cancel a subscription.

Plan changes are applied after Knight receives and processes the LemonSqueezy
webhook.
