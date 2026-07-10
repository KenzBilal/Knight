# Lead Discovery

Knight finds businesses that need your services automatically.

## How It Works

1. **Enter your niche and location** - Tell Knight who to find
2. **Google Maps scraping** - Knight searches for matching businesses
3. **Website audit** - Each lead gets a 30+ point audit
4. **AI pitch generation** - Personalized pitches based on audit results
5. **Automated outreach** - Cold emails sent automatically

## Using Discovery

### From the Dashboard

1. Go to **Overview**
2. Enter your search query:
   - Format: `[niche] in [location]`
   - Examples:
     - "plumbers in Austin"
     - "restaurants in New York"
     - "dentists in London"
3. Click "Discover Leads"

### From the API

```bash
POST /api/discover
Content-Type: application/json

{
  "query": "plumbers in Austin"
}
```

## Understanding Results

Each discovered lead includes:

- **Company name** - Business name from Google Maps
- **Website** - Their website URL
- **Industry** - Business category
- **Lead score** - How much they need your help (0-100)
- **Audit results** - 30+ point website analysis
- **AI pitch** - Personalized outreach message

## Lead Score

The lead score indicates how much a business needs your services:

- **0-30** - Low need (good website)
- **30-60** - Medium need (some issues)
- **60-100** - High need (poor website, great opportunity)

## Limits

| Plan | Leads per month |
|------|-----------------|
| Free | 50 |
| Starter | Unlimited |
| Pro | Unlimited |
| Agency | Unlimited |

## Tips

- Be specific with your niche (e.g., "emergency plumbers" not just "plumbers")
- Include the city name for better results
- Run discovery weekly to find new leads
