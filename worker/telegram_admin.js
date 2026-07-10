// Knight worker/telegram_admin.js
// Admin Notifications + Inline Buttons via Supabase Realtime

import { createClient } from '@supabase/supabase-js';
import { Api } from 'telegram';
import { CallbackQuery } from 'telegram/events/CallbackQuery.js';
import OpenAI from 'openai';
import ws from 'ws';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws }
});

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// ─── Get Org Config ───────────────────────────────────────────────────────────
async function getOrgConfig(orgId) {
  const { data } = await supabase.from('org_config').select('*').eq('org_id', orgId).single();
  return data || {};
}

// ─── Generate Team Summary ────────────────────────────────────────────────────
async function generateTeamSummary(lead) {
  const chatText = (lead.chat_history || [])
    .map(m => `${m.role === 'assistant' ? 'Sales Rep' : 'Client'}: ${m.content}`)
    .join('\n');

  const prompt = `Extract the client details from the chat history below.

FORMAT TEMPLATE:
🚨 CLIENT-${lead.id.substring(0, 6).toUpperCase()} 🚨
👤 Name: <extract name or username>
📱 Phone: <extract phone or "Not provided">
🏢 Business: <extract business category>
🎯 What they need:
- <bullet 1 of what they need>
- <bullet 2>
- <bullet 3>
(Team, please initiate contact)

CHAT HISTORY:
${chatText}

Fill in the FORMAT TEMPLATE using the details from the CHAT HISTORY. Output ONLY the filled-in template without any other text.`;

  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are an executive assistant. Your job is to extract client details from chat logs and fill out templates.' },
      { role: 'user', content: prompt }
    ],
    model: 'meta-llama/llama-3.3-70b-instruct',
    temperature: 0.2,
    max_tokens: 300,
  });

  return completion.choices[0].message.content.trim();
}

// ─── Setup Realtime Listener (Dashboard only) ────────────────────────────────
function setupRealtimeListener(orgId) {
  const processedApprovals = new Set();
  const processedRejections = new Set();

  supabase
    .channel(`admin-channel-${orgId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'telegram_leads', filter: `org_id=eq.${orgId}` },
      async (payload) => {
        const newStatus = payload.new.status;
        const lead = payload.new;

        // A. Lead was Approved
        if (newStatus === 'APPROVED' && !processedApprovals.has(lead.id)) {
          processedApprovals.add(lead.id);
          console.log(`[ADMIN REMOTE] Lead ${lead.id} approved via dashboard`);
        }

        // B. Lead was Rejected
        if (newStatus === 'REJECTED' && !processedRejections.has(lead.id)) {
          processedRejections.add(lead.id);
          console.log(`[ADMIN REMOTE] Lead ${lead.id} rejected via dashboard`);
        }
      }
    )
    .subscribe();
}

// ─── Init Admin Remote ────────────────────────────────────────────────────────
export async function initAdminRemote(client, orgId) {
  console.log(`[ADMIN REMOTE] Initializing for org: ${orgId}`);
  const config = await getOrgConfig(orgId);

  const adminUsername = config.telegram_admin_chat_id;
  const botToken = config.telegram_bot_token;

  // If no bot token, just set up Realtime for dashboard updates
  if (!adminUsername || !botToken) {
    console.log(`[ADMIN REMOTE] Org ${orgId}: No Telegram bot configured. Notifications will only appear in dashboard.`);
    setupRealtimeListener(orgId);
    return;
  }

  // Connect admin bot for this org
  let adminBot = null;
  try {
    const API_ID = parseInt(process.env.TELEGRAM_API_ID || '2040');
    const API_HASH = process.env.TELEGRAM_API_HASH || 'b18441a1ff607e10a989891a5462e627';
    const { TelegramClient } = await import('telegram');
    const { StringSession } = await import('telegram/sessions/index.js');
    adminBot = new TelegramClient(new StringSession(''), API_ID, API_HASH, { connectionRetries: 5 });
    await adminBot.start({ botAuthToken: botToken });
    console.log(`[ADMIN REMOTE] Admin Bot connected for org ${orgId}`);
  } catch (e) {
    console.warn(`[ADMIN REMOTE] Admin Bot failed to connect for org ${orgId}. Inline buttons disabled.`, e.message);
    adminBot = null;
    setupRealtimeListener(orgId);
    return;
  }

  // Listen for Supabase DB Changes
  const processedApprovals = new Set();
  const processedRejections = new Set();

  supabase
    .channel(`admin-channel-${orgId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'telegram_leads', filter: `org_id=eq.${orgId}` },
      async (payload) => {
        const newStatus = payload.new.status;
        const lead = payload.new;

        // A. Lead needs approval -> Send to Admin Telegram
        if (newStatus === 'NEEDS_APPROVAL' && !lead.admin_msg_id) {
          if (!adminUsername || !adminBot) return;
          try {
            const adminMsg = `**New Approval Request**\n👤 ${lead.full_name || lead.username}\n🏢 ${lead.category || 'Unknown'}\n💬 "${lead.ai_summary || 'Needs review'}"`;

            const { Button } = await import('telegram/tl/custom/button.js');
            const sent = await adminBot.sendMessage(adminUsername, {
              message: adminMsg,
              buttons: [
                [
                  Button.inline('✅ Approve', Buffer.from(`approve_${lead.id}`)),
                  Button.inline('❌ Decline', Buffer.from(`decline_${lead.id}`))
                ]
              ]
            });

            await supabase.from('telegram_leads').update({ admin_msg_id: sent.id }).eq('id', lead.id);
            console.log(`[ADMIN REMOTE] Sent approval request to ${adminUsername}`);
          } catch (e) {
            console.error('[ADMIN REMOTE] Failed to send approval request:', e.message);
          }
        }

        // B. Lead was Approved
        if (newStatus === 'APPROVED' && !processedApprovals.has(lead.id)) {
          processedApprovals.add(lead.id);
          try {
            if (adminUsername && lead.admin_msg_id && adminBot) {
              await adminBot.editMessage(adminUsername, {
                message: lead.admin_msg_id,
                text: `✅ **APPROVED**\n👤 ${lead.full_name || lead.username}\n🏢 ${lead.category || 'Unknown'}`,
                buttons: null
              }).catch(() => {});
            }

            try {
              await client.sendMessage(lead.chat_id, {
                message: "Great! Let me get our team to reach out with the next steps."
              });
            } catch (err) {
              console.warn(`[ADMIN REMOTE] Could not send handoff to ${lead.chat_id}: ${err.message}`);
            }

            await supabase.from('telegram_leads').update({ admin_msg_id: null }).eq('id', lead.id);
          } catch (e) {
            console.error('[ADMIN REMOTE] Error processing approval:', e.message);
          }
        }

        // C. Lead was Rejected
        if (newStatus === 'REJECTED' && !processedRejections.has(lead.id)) {
          processedRejections.add(lead.id);
          if (adminUsername && lead.admin_msg_id && adminBot) {
            await adminBot.editMessage(adminUsername, {
              message: lead.admin_msg_id,
              text: `❌ **DECLINED**\n👤 ${lead.full_name || lead.username}`,
              buttons: null
            }).catch(() => {});

            await supabase.from('telegram_leads').update({ admin_msg_id: null }).eq('id', lead.id);
          }
        }
      }
    )
    .subscribe();

  // Listen for Telegram Inline Button Clicks via Admin Bot
  adminBot.addEventHandler(async (event) => {
    const data = event.data.toString();
    if (!data.startsWith('approve_') && !data.startsWith('decline_')) return;

    const action = data.split('_')[0];
    const leadId = data.substring(action.length + 1);

    try {
      await supabase
        .from('telegram_leads')
        .update({ status: action === 'approve' ? 'APPROVED' : 'REJECTED' })
        .eq('id', leadId);

      await event.answer({ message: `Marked as ${action.toUpperCase()}` });
    } catch (e) {
      console.error('[ADMIN REMOTE] Callback Error:', e.message);
      await event.answer({ message: "Database error. Try dashboard." });
    }
  }, new CallbackQuery());

  console.log(`[ADMIN REMOTE] Inline button and Realtime handlers active for org ${orgId}`);
}
