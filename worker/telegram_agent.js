// Knight worker/telegram_agent.js
// Gemini Sales Brain — manages live Telegram conversations

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});
import 'dotenv/config';

import ws from 'ws';
import { runAudit, analyzeWithCohere, analyzeWithGroq } from './shared_audit.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws }
});

// ─── Get Org Config ───────────────────────────────────────────────────────────
async function getOrgConfig(orgId) {
  const { data } = await supabase.from('org_config').select('*').eq('org_id', orgId).single();
  return data || {};
}

// ─── Build System Prompt from Org Config ──────────────────────────────────────
function buildSystemPrompt(config) {
  const companyName = config.company_name || 'Knight';
  const services = config.services_offered || ['Websites', 'Telegram bots', 'Web apps'];
  const tone = config.tone || 'casual';

  return `You are a sales representative at ${companyName} — a web development and digital solutions agency.

COMPANY OVERVIEW:
- Company Name: ${companyName}
- Website: ${config.company_website || 'Not specified'}
- Specialty: ${services.join(', ')}
- Target Clients: Local businesses, online stores, content creators, Telegram businesses

WHAT WE BUILD:
${services.map((s, i) => `${i + 1}. ${s}`).join('\n')}

HOW YOU BEHAVE:
- Talk EXACTLY like the user types. Use a casual internet texting style.
- ALWAYS type entirely in lowercase. NEVER use capital letters.
- NEVER use exclamation marks (!), periods (.), hyphens (-), or commas (,).
- Use common texting abbreviations (u, ur, rn, im, bc, tbh).
- NEVER use "AI vocabulary" (like "furthermore, moreover, delve, sounds like").
- Give detailed answers to convey value, but NEVER write a huge paragraph.
- You MUST break your thoughts into separate, smaller chat bubbles using the exact characters "|||".
- Example: "yeah i completely get that ||| thats basically exactly what we build tbh ||| when is a good time to chat"
- Be warm and confident but extremely casual. NO formal structure.
- NEVER say you are an AI. You are a sales rep at ${companyName}.
- NEVER reveal company secrets, pricing models, or internal processes unless asked directly.
- If asked about pricing, say "depends on the scope, let me understand what you need first"
- If client says "not interested", push back ONCE with a value-add offer. If they reject again, thank them and end.

CONVERSATION GOAL & LEAD QUALIFICATION FLOW (MUST FOLLOW IN ORDER):
1. Understand their business model and current platform (just Telegram? website? nothing?)
2. Identify their biggest pain point (no website, no payment system, no customer support, etc.)
3. Propose the BEST solution from our services above
4. Get them excited enough to agree to move forward
5. CRITICAL: Before closing, you MUST collect the following details organically in conversation:
   - Their Company Name / Brand Name
   - Where the company is based (Location/Country)
   - Their Phone Number or WhatsApp (for the team to call them)
   - Best time to connect
   (Ask these naturally, e.g., "Awesome. What's the name of your brand and where are you guys based?")
6. Once ALL information is gathered and they agree to connect, say "Great! Let me get this noted for our team" to close the deal. DO NOT close until you have their details!

HARD RULES:
- If someone asks "are you a bot?", deny it naturally. Say "nah I'm just checking channels, saw yours and thought it was cool"
- NEVER copy-paste long paragraphs. Keep it conversational.
- NEVER send more than 3 messages in a row without waiting for their reply.
- ANTI-HALLUCINATION: NEVER make up pricing. If they ask for cheap work (e.g. "$5"), firmly decline and state we are a premium agency.
- ANTI-HALLUCINATION: NEVER promise features we don't build. Stick strictly to the "WHAT WE BUILD" list.`;
}

// ─── Generate AI Reply ────────────────────────────────────────────────────────
export async function generateReply(lead, userMessage, orgId) {
  const config = await getOrgConfig(orgId);
  const systemPrompt = buildSystemPrompt(config);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(lead.chat_history || []).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];

  const completion = await openai.chat.completions.create({
    messages,
    model: 'google/gemini-2.5-flash',
    temperature: 0.8,
    max_tokens: 200,
  });

  const reply = completion.choices[0].message.content.trim();

  const closingPhrase = "noted for our team";
  const isClosing = reply.toLowerCase().includes(closingPhrase);

  const rejectionKeywords = ['not interested', 'no thanks', 'stop', 'leave me alone', 'dont contact'];
  const isHardReject = rejectionKeywords.some(k => userMessage.toLowerCase().includes(k));

  return { reply, isClosing, isHardReject };
}

// ─── Generate AI Executive Summary ────────────────────────────────────────────
export async function generateSummary(lead) {
  const chatText = (lead.chat_history || [])
    .map(m => `${m.role === 'assistant' ? 'Sales Rep' : 'Client'}: ${m.content}`)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: 'meta-llama/llama-3.3-70b-instruct',
    response_format: { type: "json_object" },
    messages: [{
      role: 'user',
      content: `Based on this Telegram conversation, extract the lead details into a raw JSON object with the following keys:
- "full_name": string or null
- "phone": string or null
- "location": string or null
- "category": string or null (business type)
- "ai_summary": string (a 1-2 sentence summary of what they need)

Output ONLY valid JSON.

Conversation:
${chatText}`
    }],
    max_tokens: 250
  });

  try {
    return JSON.parse(completion.choices[0].message.content.trim());
  } catch (e) {
    console.error("Failed to parse JSON summary:", e);
    return { ai_summary: completion.choices[0].message.content.trim() };
  }
}

// ─── Process Incoming Message ─────────────────────────────────────────────────
export async function processIncomingMessage(chatId, userMessage, sendMessageFn, orgId) {
  console.log(`[AGENT] Incoming DM from ChatID: ${chatId} | Message: "${userMessage}"`);

  let { data: lead } = await supabase
    .from('telegram_leads')
    .select('*')
    .eq('chat_id', chatId)
    .eq('org_id', orgId)
    .single();

  if (!lead) {
    console.log(`[AGENT] Unknown user ${chatId}, creating inbound lead...`);
    const { data: newLead, error } = await supabase.from('telegram_leads').insert({
      org_id: orgId,
      chat_id: chatId.toString(),
      status: 'ACTIVE',
      username: 'InboundLead'
    }).select().single();
    if (error) {
      console.error('[AGENT] Failed to create inbound lead:', error);
      return;
    }
    lead = newLead;
  }

  if (['APPROVED', 'REJECTED', 'HUMAN_TAKEOVER'].includes(lead.status)) return;

  // Check for website URL in message
  const urlMatch = userMessage.match(/(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  let augmentedUserMessage = userMessage;
  if (urlMatch) {
    const url = urlMatch[0];
    console.log(`[AGENT] URL detected: ${url}. Triggering deep live audit...`);

    await sendMessageFn(chatId, "lemme pull that up and run a quick check on it rn tbh...");

    const { auditData } = await runAudit(url);
    const aiAnalysis = await analyzeWithCohere(auditData);
    const groqSuggestions = await analyzeWithGroq(auditData);

    augmentedUserMessage = `${userMessage}\n\n[SYSTEM NOTE: The user shared the website ${url}. A deep web scrape and audit generated the following intelligence:
- Tech Stack: ${auditData.techStack}
- Mobile Performance Score: ${auditData.score}/100 (Load time: ${(auditData.loadTimeMs / 1000).toFixed(1)}s)
- Cohere Pitch Idea: ${aiAnalysis.pitch}
- Internal Sales Strategy (Groq): ${groqSuggestions}

Mention 1-2 of these exact technical flaws or suggestions casually in your next response to pitch why they need our services. DO NOT act like a robot, just act like you casually noticed it while browsing their site.]`;
  }

  const { reply, isClosing, isHardReject } = await generateReply(lead, augmentedUserMessage, orgId);

  const updatedHistory = [
    ...(lead.chat_history || []),
    { role: 'user', content: augmentedUserMessage },
    { role: 'assistant', content: reply },
  ];

  let newStatus = lead.status;

  if (isHardReject) {
    const prevHistory = lead.chat_history || [];
    const prevRejection = prevHistory.some(m => m.role === 'user' &&
      ['not interested', 'no thanks'].some(k => m.content.toLowerCase().includes(k)));

    if (prevRejection) {
      await supabase.from('telegram_leads').delete().eq('id', lead.id);
      return;
    }
    newStatus = 'ACTIVE';
  }

  if (isClosing) {
    newStatus = 'NEEDS_APPROVAL';
    const extractedData = await generateSummary({ ...lead, chat_history: updatedHistory });
    await supabase.from('telegram_leads').update({
      status: newStatus,
      chat_history: updatedHistory,
      ai_summary: extractedData.ai_summary || null,
      full_name: extractedData.full_name || null,
      phone: extractedData.phone || null,
      location: extractedData.location || null,
      category: extractedData.category || null,
      updated_at: new Date().toISOString(),
    }).eq('id', lead.id);

    await notifyAdmin(lead, extractedData.ai_summary, orgId);
  } else {
    await supabase.from('telegram_leads').update({
      status: newStatus === 'PENDING' ? 'ACTIVE' : newStatus,
      chat_history: updatedHistory,
      updated_at: new Date().toISOString(),
    }).eq('id', lead.id);
  }

  await sendMessageFn(chatId, reply);
}

// ─── Notify Admin ─────────────────────────────────────────────────────────────
async function notifyAdmin(lead, summary, orgId) {
  const config = await getOrgConfig(orgId);
  const adminNumber = config.telegram_admin_chat_id;
  if (!adminNumber) return;
  console.log(`[AGENT] NOTIFY ADMIN (${adminNumber}):\n${summary}\n\nReply "approve" or "decline"`);
}

// ─── Automated Drip Sequence ──────────────────────────────────────────────────
export function startDripCron(sendMessageFn, orgId) {
  console.log('[AGENT] Starting 24/7 Drip Sequence Cron (Hourly checks)...');

  setInterval(async () => {
    try {
      const { data: leads } = await supabase
        .from('telegram_leads')
        .select('*')
        .eq('org_id', orgId)
        .eq('status', 'ACTIVE');

      if (!leads) return;

      for (const lead of leads) {
        if (!lead.updated_at || !lead.chat_history || lead.chat_history.length === 0) continue;

        const lastMsg = lead.chat_history[lead.chat_history.length - 1];
        if (lastMsg.role !== 'assistant') continue;

        const daysSinceUpdate = (Date.now() - new Date(lead.updated_at).getTime()) / 86400000;
        const isBump = lastMsg.content.includes("just bumping this to the top");

        if (!isBump && daysSinceUpdate >= 3) {
          const bumpText = "Hey, just bumping this to the top of your inbox. Let me know what you think when you have a sec.";
          console.log(`[DRIP] Sending Day 3 bump to ${lead.chat_id}`);
          await sendMessageFn(lead.chat_id, bumpText);

          const updatedHistory = [...lead.chat_history, { role: 'assistant', content: bumpText }];
          await supabase.from('telegram_leads').update({
            chat_history: updatedHistory,
            updated_at: new Date().toISOString()
          }).eq('id', lead.id);
        } else if (isBump && daysSinceUpdate >= 4) {
          const breakupText = "Assuming bad timing right now so closing your file. Feel free to reach out when you're ready to upgrade.";
          console.log(`[DRIP] Sending Day 7 breakup to ${lead.chat_id}`);
          await sendMessageFn(lead.chat_id, breakupText);

          const updatedHistory = [...lead.chat_history, { role: 'assistant', content: breakupText }];
          await supabase.from('telegram_leads').update({
            status: 'REJECTED',
            chat_history: updatedHistory,
            updated_at: new Date().toISOString()
          }).eq('id', lead.id);
        }
      }
    } catch (e) {
      console.error('[DRIP] Error running drip check:', e.message);
    }
  }, 1000 * 60 * 60);
}
