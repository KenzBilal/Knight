// Knight worker/telegram_hunter.js
// Autonomous Hunter — finds Telegram business leads via two strategies:
// Strategy A: Mass Extraction (Groq-generated keywords → join groups → extract members)
// Strategy B: Live Sniper (keyword listening in public groups)

import { createClient } from '@supabase/supabase-js';
import { nemotron as groq } from './nemotron_client.js';
import 'dotenv/config';

import ws from 'ws';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws }
});

// ─── Sniper Keywords ──────────────────────────────────────────────────────────
const SNIPER_KEYWORDS = [
  'need a website', 'need a web developer', 'looking for a developer',
  'need a web design', 'website developer needed', 'need someone to build',
  'looking for web dev', 'need a landing page', 'need an app built',
  'need a telegram bot', 'need a mini app', 'anyone build telegram bots',
];

// ─── Get Org Config ───────────────────────────────────────────────────────────
async function getOrgConfig(orgId) {
  const { data } = await supabase.from('org_config').select('*').eq('org_id', orgId).single();
  return data || {};
}

// ─── Check Daily DM Count ─────────────────────────────────────────────────────
async function getDailyDMCount(orgId) {
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
    .from('telegram_leads')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .gte('pitch_sent_at', today + 'T00:00:00Z');
  return count || 0;
}

// ─── Check if Lead Already Exists ─────────────────────────────────────────────
async function leadExists(chatId, orgId) {
  const { data } = await supabase
    .from('telegram_leads')
    .select('id')
    .eq('chat_id', chatId)
    .eq('org_id', orgId)
    .single();
  return !!data;
}

// ─── Save Lead to DB ──────────────────────────────────────────────────────────
async function saveLead({ chatId, username, fullName, phone, email, instagram, location, website, sourceGroup, category, orgId }) {
  const exists = await leadExists(chatId, orgId);
  if (exists) return null;

  const { data, error } = await supabase.from('telegram_leads').insert({
    org_id: orgId,
    chat_id: chatId,
    username,
    full_name: fullName,
    phone,
    email,
    instagram,
    location,
    website,
    source_group: sourceGroup,
    category,
    status: 'PENDING',
  }).select().single();

  if (error) console.error('[HUNTER] Failed to save lead:', error.message);
  return data;
}

// ─── Generate Daily Search Keywords (Groq) ────────────────────────────────────
export async function generateSearchKeywords() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const result = await groq.chat.completions.create({
    model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    messages: [{
      role: 'user',
      content: `Generate 10 diverse Telegram group search keywords for finding business owners.
Today is ${today}. Vary the niches: include some of these types: crypto signals, movies/series sharing, exam question banks, online stores, freelancers, coaching/courses, real estate, food delivery, clothing shops, travel agents, resellers.
Return ONLY a JSON array of strings. No explanation.
Example: ["crypto vip signals group", "NEET exam question bank", "dropshipping business owners"]`
    }],
    max_tokens: 200,
  });

  try {
    const content = result.choices[0].message.content.trim();
    const match = content.match(/\[.*\]/s);
    return match ? JSON.parse(match[0]) : [];
  } catch {
    return ['business owners telegram group', 'online store owners', 'telegram resellers'];
  }
}

// ─── Extract Contact Info from Telegram Bio/Posts ─────────────────────────────
export function extractContactInfo(text) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/\+?[0-9]{10,14}/);
  const instaMatch = text.match(/(?:instagram\.com\/|@)([a-zA-Z0-9._]{2,30})/i);
  const websiteMatch = text.match(/https?:\/\/(?!t\.me)[^\s]+/);
  const locationMatch = text.match(/(?:based in|location:|from|city:)\s*([A-Za-z ,]+)/i);

  return {
    email: emailMatch?.[0] || null,
    phone: phoneMatch?.[0] || null,
    instagram: instaMatch ? `@${instaMatch[1]}` : null,
    website: websiteMatch?.[0] || null,
    location: locationMatch?.[1]?.trim() || null,
  };
}

// ─── Strategy A: Mass Group Extraction ────────────────────────────────────────
export async function processTelegramChannel(channel, participants, sendPitchFn, orgId) {
  const config = await getOrgConfig(orgId);
  const dailyLimit = config.daily_email_limit || 20;
  let dmCount = await getDailyDMCount(orgId);

  const bio = channel.about || '';
  const channelName = channel.title || '';

  const contacts = extractContactInfo(bio);

  if (contacts.website) {
    console.log(`[HUNTER] Bio website found: ${contacts.website} → routing to main scraper`);
    await supabase.from('jobs').insert({
      org_id: orgId,
      type: 'SCRAPE',
      status: 'PENDING',
      payload: { target: contacts.website, source: 'telegram_bio' },
    });
  }

  const category = await categorizeChannel(channelName, bio);

  for (const participant of participants) {
    if (dmCount >= dailyLimit) {
      console.log(`[HUNTER] Daily limit (${dailyLimit}) reached. Stopping.`);
      break;
    }

    const chatId = participant.id?.value || participant.id;
    if (!chatId) continue;

    const lead = await saveLead({
      chatId,
      username: participant.username,
      fullName: `${participant.firstName || ''} ${participant.lastName || ''}`.trim(),
      ...contacts,
      sourceGroup: channelName,
      category,
      orgId,
    });

    if (lead) {
      const clientName = participant.firstName || participant.username || '';
      const pitch = await generateInitialPitch(category, channelName, clientName, orgId);
      await sendPitchFn(chatId, pitch);

      await supabase.from('telegram_leads').update({
        status: 'ACTIVE',
        pitch_sent_at: new Date().toISOString(),
      }).eq('id', lead.id);

      dmCount++;
      console.log(`[HUNTER] Pitched ${participant.username || chatId} (${category}) [${dmCount}/${dailyLimit}]`);

      const delay = (30 + Math.random() * 15) * 60 * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

// ─── Strategy B: Live Sniper ─────────────────────────────────────────────────
export async function processSniperMessage(chatId, username, message, groupName, sendPitchFn, orgId) {
  const lowerMsg = message.toLowerCase();
  const isSniper = SNIPER_KEYWORDS.some(k => lowerMsg.includes(k));
  if (!isSniper) return;

  const exists = await leadExists(chatId, orgId);
  if (exists) return;

  console.log(`[SNIPER] Triggered! "${message.substring(0, 60)}" in ${groupName}`);

  const lead = await saveLead({
    chatId,
    username,
    sourceGroup: groupName,
    category: 'Sniper Lead',
    orgId,
  });

  if (lead) {
    const config = await getOrgConfig(orgId);
    const companyName = config.company_name || 'Knight';
    const greeting = username ? `Hey @${username}!` : `Hey!`;
    const pitch = `${greeting} Saw your message about needing a developer. We build ${config.services_offered?.join(', ') || 'websites, Telegram bots, and mini apps'} at ${companyName}. Might be exactly what you need — what are you trying to build?`;
    await sendPitchFn(chatId, pitch);

    await supabase.from('telegram_leads').update({
      status: 'ACTIVE',
      pitch_sent_at: new Date().toISOString(),
    }).eq('id', lead.id);

    console.log(`[SNIPER] Pitched @${username} (Sniper Override)`);
  }
}

// ─── Categorize Channel ───────────────────────────────────────────────────────
async function categorizeChannel(name, bio) {
  try {
    const result = await groq.chat.completions.create({
      model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
      messages: [{
        role: 'user',
        content: `Categorize this Telegram channel in 2-3 words:
Name: ${name}
Bio: ${bio}
Return ONLY the category, nothing else. Examples: "Crypto Signals", "Movie Sharing", "Exam Question Bank", "Online Clothing Store", "Coaching/Courses"`
      }],
      max_tokens: 20,
    });
    return result.choices[0].message.content.trim();
  } catch {
    return 'Unknown Business';
  }
}

// ─── Generate Initial Pitch ───────────────────────────────────────────────────
async function generateInitialPitch(category, groupName, clientName, orgId) {
  const config = await getOrgConfig(orgId);
  const companyName = config.company_name || 'Knight';
  const services = config.services_offered?.join(', ') || 'websites, Telegram bots, and web apps';
  const namePrompt = clientName ? `\nClient Name/Username: ${clientName}` : '';

  const result = await groq.chat.completions.create({
    model: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    messages: [{
      role: 'user',
      content: `You are a sales rep from ${companyName}. Write a very short, casual, human-sounding first message (max 3 lines) to the admin of a Telegram channel.

Channel Type: ${category}
Channel Name: ${groupName}${namePrompt}
Services: ${services}

The message should:
1. Acknowledge their Telegram presence naturally
2. Hint at a specific problem they might have (based on their category)
3. Open the conversation with a question
4. If the Client Name is provided, use it naturally in your greeting

Do NOT mention you found them on Telegram. Do NOT be salesy. Sound like a human.
Return ONLY the message, nothing else.`
    }],
    max_tokens: 100,
  });
  return result.choices[0].message.content.trim();
}

// ─── Auto-Cleanup: Delete ghosts ──────────────────────────────────────────────
export async function runCleanup(orgId) {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data: ghosts } = await supabase
    .from('telegram_leads')
    .select('id')
    .eq('org_id', orgId)
    .eq('status', 'ACTIVE')
    .lt('updated_at', threeDaysAgo);

  if (ghosts?.length) {
    const ids = ghosts.map(g => g.id);
    await supabase.from('telegram_leads').delete().in('id', ids);
    console.log(`[CLEANUP] Deleted ${ids.length} ghosted leads`);
  }
}

console.log('[HUNTER] Module loaded. Waiting for Userbot connection...');
