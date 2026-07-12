import puppeteer from 'puppeteer';
import { complete } from './ai_hub.js';
import dotenv from 'dotenv';

dotenv.config();

export async function fetchLighthouseData(url, attempt = 1) {
  const MAX_RETRIES = 3;
  const BACKOFF_MS = [5000, 15000, 45000];
  try {
    const encoded = encodeURIComponent(url);
    const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encoded}&strategy=mobile`;
    const res = await fetch(api);
    if ((res.status === 429 || res.status === 503) && attempt <= MAX_RETRIES) {
      const wait = BACKOFF_MS[attempt - 1] || BACKOFF_MS[BACKOFF_MS.length - 1];
      console.log(`[Lighthouse] Rate limited. Waiting ${wait / 1000}s before retry ${attempt}/${MAX_RETRIES}...`);
      await new Promise(r => setTimeout(r, wait));
      return fetchLighthouseData(url, attempt + 1);
    }
    if (!res.ok) {
      console.log(`[Lighthouse] HTTP ${res.status} — skipping.`);
      return null;
    }
    const data = await res.json();
    const score = data.lighthouseResult?.categories?.performance?.score * 100;
    return typeof score === 'number' && !isNaN(score) ? Math.round(score) : null;
  } catch (e) {
    console.error('[Lighthouse] Error:', e.message);
    return null;
  }
}

export async function runAudit(url) {
  console.log(`[Audit] Auditing ${url}...`);
  if (!url.startsWith('http')) url = 'https://' + url;

  const lighthousePromise = fetchLighthouseData(url);

  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const issues = [];
  let contacts = [];
  let title = '';
  let loadTimeMs = 0;

  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');

    const t0 = Date.now();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    loadTimeMs = Date.now() - t0;
    title = await page.title();

    const checks = await page.evaluate(() => {
      const r = {};
      r.hasH1 = !!document.querySelector('h1');
      r.h1Count = document.querySelectorAll('h1').length;
      r.hasMetaDesc = !!document.querySelector('meta[name="description"]');
      r.metaDescLength = document.querySelector('meta[name="description"]')?.content?.length || 0;
      r.hasTitle = !!document.title;
      r.titleLength = document.title?.length || 0;
      r.hasCanonical = !!document.querySelector('link[rel="canonical"]');
      r.hasOpenGraph = !!document.querySelector('meta[property^="og:"]');
      r.hasTwitterCard = !!document.querySelector('meta[name^="twitter:"]');
      r.hasStructuredData = !!document.querySelector('script[type="application/ld+json"]');
      const imgs = [...document.querySelectorAll('img')];
      r.totalImages = imgs.length;
      r.imagesWithoutAlt = imgs.filter(i => !i.alt || i.alt.trim() === '').length;
      r.hasLazyLoading = imgs.some(i => i.loading === 'lazy');
      r.scriptCount = document.querySelectorAll('script[src]').length;
      const html = document.documentElement.innerHTML;
      r.hasGoogleAnalytics = html.includes('google-analytics.com') || html.includes('gtag(') || html.includes('G-');
      r.hasGTM = html.includes('googletagmanager.com');
      r.hasFacebookPixel = html.includes('fbevents.js') || html.includes('fbq(');
      r.hasViewport = !!document.querySelector('meta[name="viewport"]');
      r.hasFavicon = !!(document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]'));
      r.hasSocialLinks = html.includes('facebook.com') || html.includes('instagram.com') || html.includes('linkedin.com');
      r.hasForms = !!document.querySelector('form');
      const body = document.body.innerText || '';
      r.wordCount = body.split(/\s+/).filter(Boolean).length;
      r.hasPhoneNumber = /(\+?\d[\d\s\-().]{7,}\d)/.test(body);

      r.isWordPress = !!document.querySelector('meta[name="generator"][content*="WordPress"]') || html.includes('/wp-content/');
      r.isShopify = !!window.Shopify || !!document.querySelector('script[src*="cdn.shopify.com"]');
      r.isWebflow = !!document.querySelector('html[data-wf-site]');
      r.isReact = !!document.querySelector('[data-reactroot]') || !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || html.includes('react-dom');
      r.isNextJs = !!document.querySelector('#__next') || !!window.__NEXT_DATA__;
      r.isJQuery = !!window.jQuery || html.includes('jquery.min.js');

      r.headings = Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim()).filter(t => t.length > 5).slice(0, 5);
      r.paragraphs = Array.from(document.querySelectorAll('p')).map(p => p.innerText.trim()).filter(t => t.length > 50).slice(0, 3);
      r.hasPricingSignals = html.includes('Pricing') || html.includes('Plans') || html.includes('$');

      r.hasPrivacyPolicy = Array.from(document.querySelectorAll('a')).some(a => a.innerText.toLowerCase().includes('privacy'));
      r.hasUnsecureForms = Array.from(document.querySelectorAll('form')).some(f => {
        const action = f.getAttribute('action');
        return !action || action.startsWith('http://');
      });

      r.hasBrokenLinks = Array.from(document.querySelectorAll('a')).some(a => {
        const h = a.getAttribute('href');
        return h === '#' || h === '' || h?.includes('javascript:void(0)');
      });
      const copyMatch = html.match(/(?:©|Copyright)\s*(20[0-2][0-9])/i);
      r.hasOutdatedCopyright = copyMatch ? parseInt(copyMatch[1]) < new Date().getFullYear() : false;
      r.hasPlaceholderText = html.toLowerCase().includes('lorem ipsum') || html.toLowerCase().includes('powered by shopify') || html.toLowerCase().includes('powered by wordpress');
      r.isHiring = html.toLowerCase().includes('we are hiring') || html.toLowerCase().includes('careers') || html.toLowerCase().includes('open positions');
      r.isHttpOnly = window.location.protocol === 'http:';
      r.missingAdaLabels = Array.from(document.querySelectorAll('input, button, textarea, select')).some(el => !el.hasAttribute('aria-label') && !el.id);

      const computedFont = window.getComputedStyle(document.body).fontFamily.toLowerCase();
      r.hasGenericFonts = computedFont.includes('times new roman') || computedFont === 'serif' || computedFont === '"times new roman", times, serif';

      return r;
    });

    if (!checks.hasH1) issues.push({ category: 'SEO', severity: 'high', issue: 'Missing H1 tag' });
    if (checks.h1Count > 1) issues.push({ category: 'SEO', severity: 'medium', issue: `Multiple H1 tags (${checks.h1Count})` });
    if (!checks.hasMetaDesc) issues.push({ category: 'SEO', severity: 'high', issue: 'Missing meta description' });
    if (checks.metaDescLength > 160) issues.push({ category: 'SEO', severity: 'low', issue: `Meta description too long (${checks.metaDescLength} chars)` });
    if (!checks.hasCanonical) issues.push({ category: 'SEO', severity: 'medium', issue: 'Missing canonical tag' });
    if (!checks.hasOpenGraph) issues.push({ category: 'SEO', severity: 'medium', issue: 'No Open Graph tags (bad social sharing)' });
    if (!checks.hasTwitterCard) issues.push({ category: 'SEO', severity: 'low', issue: 'No Twitter Card meta tags' });
    if (!checks.hasStructuredData) issues.push({ category: 'SEO', severity: 'medium', issue: 'No structured data / Schema.org' });
    if (!checks.hasTitle) issues.push({ category: 'SEO', severity: 'high', issue: 'Missing page title' });
    if (checks.titleLength > 60) issues.push({ category: 'SEO', severity: 'low', issue: `Page title too long (${checks.titleLength} chars)` });
    if (checks.imagesWithoutAlt > 0) issues.push({ category: 'Accessibility', severity: 'medium', issue: `${checks.imagesWithoutAlt} image(s) missing alt text` });
    if (!checks.hasViewport) issues.push({ category: 'Mobile', severity: 'high', issue: 'Missing viewport meta tag — not mobile friendly' });
    if (loadTimeMs > 5000) issues.push({ category: 'Performance', severity: 'high', issue: `Slow load time: ${(loadTimeMs / 1000).toFixed(1)}s` });
    else if (loadTimeMs > 3000) issues.push({ category: 'Performance', severity: 'medium', issue: `Load time: ${(loadTimeMs / 1000).toFixed(1)}s (could be faster)` });
    if (!checks.hasLazyLoading && checks.totalImages > 3) issues.push({ category: 'Performance', severity: 'low', issue: 'Images not lazy loaded' });
    if (checks.scriptCount > 10) issues.push({ category: 'Performance', severity: 'medium', issue: `Heavy page — ${checks.scriptCount} external scripts` });
    if (!checks.hasGoogleAnalytics && !checks.hasGTM) issues.push({ category: 'Analytics', severity: 'high', issue: 'No analytics tracking found' });
    if (!checks.hasFacebookPixel) issues.push({ category: 'Marketing', severity: 'high', issue: 'No Facebook Pixel found (cannot run retargeting ads)' });
    if (!checks.hasPrivacyPolicy) issues.push({ category: 'Security', severity: 'high', issue: 'Missing Privacy Policy link' });
    if (checks.hasUnsecureForms) issues.push({ category: 'Security', severity: 'high', issue: 'Unsecured form submission detected' });
    if (!checks.hasFavicon) issues.push({ category: 'Branding', severity: 'low', issue: 'No favicon' });
    if (!checks.hasSocialLinks) issues.push({ category: 'Social', severity: 'low', issue: 'No social media links' });
    if (!checks.hasForms) issues.push({ category: 'Conversion', severity: 'medium', issue: 'No lead capture form' });
    if (!checks.hasPhoneNumber) issues.push({ category: 'Contact', severity: 'low', issue: 'No phone number on page' });
    if (checks.hasBrokenLinks) issues.push({ category: 'UX', severity: 'high', issue: 'Broken links detected (e.g. href="#") — losing customers' });
    if (checks.hasOutdatedCopyright) issues.push({ category: 'Trust', severity: 'medium', issue: 'Outdated copyright year — site looks abandoned' });
    if (checks.hasPlaceholderText) issues.push({ category: 'Brand', severity: 'high', issue: 'Placeholder or template text found ("Lorem Ipsum" / "Powered by...")' });
    if (checks.isHiring) issues.push({ category: 'Sales Signal', severity: 'low', issue: 'Company is hiring (Has budget for web dev/marketing)' });
    if (checks.isHttpOnly) issues.push({ category: 'Security', severity: 'high', issue: 'Missing SSL (HTTP) — Google flags as Not Secure' });
    if (checks.missingAdaLabels) issues.push({ category: 'Legal', severity: 'high', issue: 'Missing ADA compliance tags (ARIA labels) — High risk of lawsuit' });
    if (checks.hasGenericFonts) issues.push({ category: 'Design', severity: 'medium', issue: 'Uses generic/default typography (Looks outdated/cheap)' });
    if (!url.includes('https')) issues.push({ category: 'Security', severity: 'high', issue: 'No HTTPS / SSL' });
    if (checks.wordCount < 300) issues.push({ category: 'Content', severity: 'medium', issue: `Thin content — only ${checks.wordCount} words` });

    const penalties = { high: 15, medium: 7, low: 3 };
    let score = 100;
    for (const i of issues) score -= (penalties[i.severity] || 0);
    score = Math.max(score, 0);

    console.log(`[Audit] Score: ${score} | Issues: ${issues.length}`);

    const mainContacts = await extractContacts(page);
    contacts.push(...mainContacts);

    const contactLinks = await page.$$eval('a', links =>
      links.map(a => ({ href: a.href, text: a.textContent?.toLowerCase().trim() }))
        .filter(a => a.href && (a.text?.includes('contact') || a.text?.includes('about') || a.text?.includes('team')))
        .slice(0, 2).map(a => a.href)
    );

    const rawText = await page.evaluate(() => document.body?.innerText || '').catch(() => '');

    await page.close();

    let extraContext = '';
    const subPagePromises = contactLinks.map(async (cu) => {
      let cp;
      try {
        cp = await browser.newPage();
        await cp.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36');
        await cp.goto(cu, { waitUntil: 'networkidle2', timeout: 15000 });
        const extractedContacts = await extractContacts(cp);
        const extraText = await cp.evaluate(() => (document.body?.innerText || '').substring(0, 1500));
        return { contacts: extractedContacts, text: extraText };
      } catch {
        return null;
      } finally {
        if (cp) await cp.close().catch(() => {});
      }
    });

    const subPageResults = await Promise.allSettled(subPagePromises);
    subPageResults.forEach(res => {
      if (res.status === 'fulfilled' && res.value) {
        contacts.push(...res.value.contacts);
        extraContext += '\n' + res.value.text;
      }
    });

    const seen = new Set();
    contacts = contacts.filter(c => {
      const key = c.email || c.linkedin || c.phone;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    await browser.close();

    const lighthouseScore = await lighthousePromise;
    if (lighthouseScore !== null) {
      if (lighthouseScore < 50) issues.push({ category: 'Performance', severity: 'high', issue: `Google officially scores this mobile site ${lighthouseScore}/100 (extremely poor)` });
      else if (lighthouseScore < 80) issues.push({ category: 'Performance', severity: 'medium', issue: `Google officially scores this mobile site ${lighthouseScore}/100 (needs improvement)` });
    }

    let techStack = 'Unknown/Custom';
    if (checks.isNextJs) techStack = 'Next.js (React)';
    else if (checks.isReact) techStack = 'React';
    else if (checks.isShopify) techStack = 'Shopify';
    else if (checks.isWebflow) techStack = 'Webflow';
    else if (checks.isWordPress) techStack = 'WordPress';
    else if (checks.isJQuery) techStack = 'Legacy jQuery';

    let semanticData = null;
    try {
      semanticData = await extractSemanticBusinessData(rawText);
    } catch (e) {
      console.error('[Audit] Semantic extraction failed:', e.message);
    }

    const businessContext = {
      headings: checks.headings || [],
      paragraphs: checks.paragraphs || [],
      hasPricing: checks.hasPricingSignals || false,
      semantic: semanticData
    };

    return { auditData: { url, title, score, loadTimeMs, ssl: url.includes('https'), issues, techStack, businessContext, summary: { totalIssues: issues.length, ...checks } }, contacts };

  } catch (e) {
    console.error('[Audit] Error:', e.message);
    await browser.close();
    return { auditData: { url, title, score: 10, loadTimeMs: 0, ssl: false, issues: [{ category: 'General', severity: 'high', issue: 'Site unreachable or timed out' }], summary: {} }, contacts: [] };
  }
}

export async function extractContacts(page) {
  return page.evaluate(() => {
    const emails = new Set();
    const linkedins = new Set();
    const phones = new Set();

    const html = document.documentElement.innerHTML;
    const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
    const htmlEmails = html.match(emailRegex) || [];
    htmlEmails.forEach(e => {
      const clean = e.toLowerCase().trim();
      if (
        !clean.includes('example') && !clean.includes('test@') &&
        !clean.endsWith('.png') && !clean.endsWith('.jpg') &&
        !clean.endsWith('.gif') && !clean.endsWith('.svg') &&
        !clean.includes('sentry') && !clean.includes('schema') &&
        !clean.includes('@2x') && !clean.includes('noreply') &&
        !clean.includes('no-reply') && !clean.includes('donotreply') &&
        !clean.includes('wordpress') && !clean.includes('woocommerce')
      ) emails.add(clean);
    });

    const body = document.body?.innerText || '';
    (body.match(emailRegex) || []).forEach(e => emails.add(e.toLowerCase()));

    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      const e = a.href.replace('mailto:', '').split('?')[0].trim().toLowerCase();
      if (e) emails.add(e);
    });

    document.querySelectorAll('a[href^="tel:"], a[href*="wa.me"], a[href*="api.whatsapp.com"]').forEach(a => {
      let p = '';
      if (a.href.includes('tel:')) {
        p = a.href.replace('tel:', '').trim();
      } else if (a.href.includes('wa.me/')) {
        p = a.href.split('wa.me/')[1].split('?')[0].replace(/[^0-9+]/g, '');
      } else if (a.href.includes('api.whatsapp.com/send')) {
        try {
          const url = new URL(a.href);
          p = url.searchParams.get('phone') || '';
        } catch (e) {}
      }
      if (p) phones.add(p);
    });

    document.querySelectorAll('a[href*="linkedin.com/in/"], a[href*="linkedin.com/company/"]').forEach(a => {
      linkedins.add(a.href);
    });

    const instagrams = new Set();
    document.querySelectorAll('a[href*="instagram.com/"]').forEach(a => {
      const href = a.href;
      if (!href.match(/instagram\.com\/(p\/|reel\/|explore|accounts|login|$)/)) {
        instagrams.add(href.split('?')[0].replace(/\/$/, ''));
      }
    });

    const contacts = [];
    const emailArr = [...emails].slice(0, 5);
    const linkedinArr = [...linkedins].slice(0, 3);
    const instagramArr = [...instagrams].slice(0, 3);
    const phoneArr = [...phones].slice(0, 3);

    emailArr.forEach((email, i) => contacts.push({ email, linkedin: linkedinArr[i] || null, instagram: instagramArr[i] || null, phone: phoneArr[i] || null }));
    linkedinArr.slice(emailArr.length).forEach((linkedin, i) => contacts.push({ email: null, linkedin, instagram: instagramArr[emailArr.length + i] || null, phone: phoneArr[emailArr.length + i] || null }));
    phoneArr.slice(contacts.length).forEach(phone => contacts.push({ email: null, linkedin: null, instagram: null, phone }));

    return contacts.slice(0, 5);
  });
}

export async function extractSemanticBusinessData(rawText) {
  const cleanText = rawText.replace(/\s+/g, ' ').trim().slice(0, 10000);
  const messages = [{
    role: 'user',
    content: `You are an expert business analyst. Read the following website text and extract exactly what this business does.

WEBSITE TEXT:
"""
${cleanText}
"""

Return a JSON object with exactly these keys:
- "companyName": string
- "industry": string
- "primaryService": string
- "targetAudience": string
- "uniqueSellingProposition": string`,
  }];

  console.log('[Semantic] Extracting business data...');
  const result = await complete('semantic_extract', messages, { responseFormat: 'json' });
  return JSON.parse(result.content);
}

export async function analyzeWithCohere(auditData) {
  console.log('[AI Hub] Analyzing with audit_pitch...');
  const issuesSummary = auditData.issues?.map(i => `[${i.severity.toUpperCase()}] ${i.category}: ${i.issue}`).join('\n') || 'None';

  const messages = [{
    role: 'user',
    content: `You are a sharp web agency consultant who closes clients by being specific.
  
  Website: ${auditData.url}
  Title: "${auditData.title}"
  Tech Stack: ${auditData.techStack}
  Company Name: ${auditData.businessContext.semantic?.companyName || 'Unknown'}
  Industry: ${auditData.businessContext.semantic?.industry || 'Unknown'}
  Primary Service: ${auditData.businessContext.semantic?.primaryService || 'Unknown'}
  Target Audience: ${auditData.businessContext.semantic?.targetAudience || 'Unknown'}
  Unique Value: ${auditData.businessContext.semantic?.uniqueSellingProposition || 'Unknown'}
  Core Content (Fallback): ${auditData.businessContext.headings.join(' | ')}
  Score: ${auditData.score}/100
  Load Time: ${(auditData.loadTimeMs / 1000).toFixed(1)}s
  SSL: ${auditData.ssl ? 'Yes' : 'NO'}
  
  Issues (${auditData.issues?.length || 0}):
  ${issuesSummary}
  
  Return a JSON object with:
  1. "companyName": name from URL/title
  2. "industry": specific industry (e.g. "Plumbing Services" not "Services")
  3. "leadScore": 1-100, lower = worse site = hotter lead
  4. "pitch": cold email max 180 words. You represent Knight, an AI sales agent platform. Reference their specific industry/niche and 1-2 specific technical issues. Sign off as "The Knight Team". Sound professional, direct, and confident. IMPORTANT: Do not use exact metrics or robotic numbers. Use natural human language like "your site is noticeably slow" or "we noticed your images aren't optimized".`,
  }];

  try {
    const result = await complete('audit_pitch', messages, { responseFormat: 'json' });
    return JSON.parse(result.content);
  } catch (e) {
    console.error('[AI Hub] audit_pitch failed:', e.message);
    return { companyName: auditData.url, pitch: 'AI analysis failed.', leadScore: 50 };
  }
}

export async function analyzeWithGroq(auditData) {
  console.log('[AI Hub] Generating internal suggestions...');
  const messages = [{
    role: 'user',
    content: `You are the lead technical strategist.
  We just audited a potential client's website: ${auditData.url}
  Tech Stack Detected: ${auditData.techStack}
  What they sell: ${auditData.businessContext.semantic?.primaryService || 'Unknown'}
  Score: ${auditData.score}/100.
  Issues found: ${auditData.issues?.map(i => i.issue).join(', ')}
  
  Write a ruthless, internal-only cheat sheet for the salesperson.
  Bulleted list of exact, concrete technical upgrades to sell them.
  
  Format:
  • Implement [Solution] to [Benefit]
  • Replace [Old Tech/Problem] with [New Tech/Solution] for [Benefit]
  • Fix [Specific Issue] to [Benefit]
  
  Rules:
  - Be blunt, highly technical, and specific.
  - No fluff, just 3-5 punchy bullet points.`,
  }];

  try {
    const result = await complete('internal_suggestions', messages);
    return result.content || 'No suggestions generated.';
  } catch (e) {
    console.error('[AI Hub] internal_suggestions failed:', e.message);
    return 'Error generating suggestions.';
  }
}
