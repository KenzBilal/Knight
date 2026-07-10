# Common Issues

Solutions to frequently encountered problems.

## Authentication

### "Unauthorized" error

**Cause:** Your session has expired or you're not logged in.

**Solution:**
1. Log out and log back in
2. Clear your browser cookies
3. Try a different browser

### Can't sign up

**Cause:** Email already registered or password too short.

**Solution:**
1. Try logging in instead
2. Use a different email address
3. Password must be at least 8 characters

## Discovery

### No leads found

**Cause:** Search query too specific or location too narrow.

**Solution:**
1. Broaden your search (e.g., "restaurants" instead of "Italian restaurants")
2. Try a larger area (e.g., "Austin" instead of "Downtown Austin")
3. Check if Google Maps has results for your query

### Discovery taking too long

**Cause:** Large search area or many results.

**Solution:**
1. Wait a few minutes for processing
2. Check the Prospects page for updates
3. The worker processes jobs in the background

## Email

### Emails not sending

**Cause:** Email domain not verified or Resend API key missing.

**Solution:**
1. Go to Settings → Email Domain
2. Verify your domain is verified
3. Check that RESEND_API_KEY is set in environment

### Emails going to spam

**Cause:** Domain reputation or missing authentication records.

**Solution:**
1. Verify all DNS records (SPF, DKIM, DMARC)
2. Wait 24-48 hours for DNS propagation
3. Check domain reputation at mail-tester.com

## Telegram

### Can't connect Telegram

**Cause:** Invalid phone number or session expired.

**Solution:**
1. Go to Telegram → Connect Telegram
2. Re-enter your phone number
3. Enter the new SMS code

### Telegram bot not responding

**Cause:** Bot token invalid or bot not started.

**Solution:**
1. Verify bot token in Settings → Telegram
2. Start a conversation with your bot on Telegram
3. Send /start to the bot

## Billing

### Can't upgrade plan

**Cause:** Payment method declined or checkout session expired.

**Solution:**
1. Try a different payment method
2. Clear browser cookies and try again
3. Contact your bank

### Subscription not activating

**Cause:** Webhook not received or processing delayed.

**Solution:**
1. Wait a few minutes
2. Check your email for confirmation
3. Contact support if issue persists

## Performance

### Dashboard loading slowly

**Cause:** Large amount of data or slow connection.

**Solution:**
1. Check your internet connection
2. Clear browser cache
3. Try a different browser

### Worker not processing jobs

**Cause:** Worker not running or crashed.

**Solution:**
1. Check PM2 status: `pm2 status`
2. Restart worker: `pm2 restart knight-worker`
3. Check logs: `pm2 logs knight-worker`

## Still Need Help?

Contact support at support@knight.com or visit our [contact page](https://knight.com/contact).
