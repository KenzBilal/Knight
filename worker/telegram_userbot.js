// Knight worker/telegram_userbot.js
// Per-Org Userbot Entry Point — each org connects their own Telegram phone number
// Uses gramjs (Telegram MTProto library)
//
// SETUP INSTRUCTIONS (when phone number is ready):
// 1. Run: node worker/telegram_userbot.js --setup --org=<org_id>
// 2. Enter your phone number when prompted
// 3. Enter the SMS code Telegram sends
// 4. Session string is saved to org_config DB automatically
// 5. Future restarts are fully automatic — no SMS needed ever again

import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import { NewMessage } from 'telegram/events/index.js';
import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import 'dotenv/config';

import { processIncomingMessage, startDripCron } from './telegram_agent.js';
import {
  generateSearchKeywords,
  processTelegramChannel,
  processSniperMessage,
  runCleanup,
} from './telegram_hunter.js';

import { initAdminRemote } from './telegram_admin.js';

import ws from 'ws';

// ─── Shared Reply Helper ──────────────────────────────────────────────────────
function createReplyFn(client, event, chatId) {
  return async (id, replyText) => {
    const rawChunks = replyText.split(/\|\|\||\n\n/);
    const chunks = rawChunks.map(c => c.trim()).filter(c => c.length > 0);

    await new Promise(r => setTimeout(r, 2000));

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const typeTime = Math.min(Math.max(chunk.length * 60, 2000), 6000);

      try {
        await client.invoke(new Api.messages.SetTyping({
          peer: chatId,
          action: new Api.SendMessageTypingAction()
        }));
      } catch (e) {
        console.warn('[USERBOT] Failed to set typing action:', e.message);
      }

      await new Promise(r => setTimeout(r, typeTime));

      if (i === 0) {
        await event.message.reply({ message: chunk });
      } else {
        await client.sendMessage(chatId, { message: chunk });
      }

      if (chunks.length > 1 && i < chunks.length - 1) {
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  };
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws }
});

const orgIntervals = new Map(); // orgId -> { cleanup, reconnect, dailyHunt }

if (!process.env.TELEGRAM_API_ID || !process.env.TELEGRAM_API_HASH) {
  console.log('[Telegram] Not connected — no API credentials');
  process.exit(0);
}

const API_ID = parseInt(process.env.TELEGRAM_API_ID);
const API_HASH = process.env.TELEGRAM_API_HASH;

// ─── Send Welcome Message via Knight Bot ─────────────────────────────────────
async function sendWelcomeMessage(orgId, userClient) {
  const botToken = process.env.KNIGHT_BOT_TOKEN;
  if (!botToken) return;

  try {
    // Check if welcome already sent
    const { data: config } = await supabase
      .from('org_config')
      .select('telegram_welcome_sent')
      .eq('org_id', orgId)
      .single();

    if (config?.telegram_welcome_sent) return;

    // Send via user's own account to their Saved Messages
    const me = await userClient.getMe();
    await userClient.sendMessage('me', {
      message: `Hey! Welcome to Knight 🚀

Your Telegram is now connected. Here's what I'll do for you:

• Find leads in Telegram groups automatically
• Respond to DMs with AI-powered conversations
• Send you approval requests when a lead is ready

You're all set — I'm already working.`,
    });

    // Mark as sent (ignore if column doesn't exist yet)
    try {
      await supabase.from('org_config').update({
        telegram_welcome_sent: true,
        updated_at: new Date().toISOString(),
      }).eq('org_id', orgId);
    } catch {}

    console.log(`[WELCOME] Sent welcome message for org ${orgId}`);
  } catch (e) {
    console.error(`[WELCOME] Failed to send welcome message for org ${orgId}:`, e.message);
  }
}

// ─── Load Session from DB ─────────────────────────────────────────────────────
async function loadSession(orgId) {
  const { data } = await supabase
    .from('org_config')
    .select('telegram_session')
    .eq('org_id', orgId)
    .single();
  return data?.telegram_session || '';
}

// ─── Save Session to DB ───────────────────────────────────────────────────────
async function saveSession(sessionString, orgId) {
  await supabase.from('org_config').update({
    telegram_session: sessionString,
    updated_at: new Date().toISOString(),
  }).eq('org_id', orgId);
  console.log(`[USERBOT] Session string saved to database for org ${orgId} ✓`);
}

// ─── Send Message Wrapper ─────────────────────────────────────────────────────
async function sendMessage(client, chatId, message) {
  try {
    const chunks = message.match(/.{1,200}(?:\s|$)/g) || [message];
    for (const chunk of chunks) {
      await client.sendMessage(chatId, { message: chunk.trim() });
      if (chunks.length > 1) await new Promise(r => setTimeout(r, 800));
    }
  } catch (err) {
    console.error(`[USERBOT] Failed to send to ${chatId}:`, err.message);
  }
}

// ─── Get All Orgs with Userbot Sessions ─────────────────────────────────────
async function getOrgsWithSessions() {
  const { data } = await supabase
    .from('org_config')
    .select('org_id, telegram_session')
    .not('telegram_session', 'is', null);
  const withSessions = (data || []).filter(r => r.telegram_session);

  // Filter to only max plan orgs
  const maxOrgs = [];
  for (const org of withSessions) {
    const { data: orgRow } = await supabase.from('orgs').select('plan').eq('id', org.org_id).single();
    if (orgRow?.plan === 'max') maxOrgs.push(org);
  }
  return maxOrgs;
}

// ─── Main Boot ────────────────────────────────────────────────────────────────
async function main() {
  const isSetup = process.argv.includes('--setup');
  const orgIdArg = process.argv.find(a => a.startsWith('--org='))?.split('=')[1];

  // For setup, we need the org_id
  if (!orgIdArg && isSetup) {
    console.error('[USERBOT] ERROR: --org=<org_id> is required for setup');
    process.exit(1);
  }

  if (!isSetup && !orgIdArg) {
    // Normal boot — connect all orgs with sessions
    console.log('[USERBOT] Starting per-org userbot manager...');
    
    const connectedOrgs = new Set();

    // Initial connection
    const orgsWithSessions = await getOrgsWithSessions();
    console.log(`[USERBOT] Found ${orgsWithSessions.length} org(s) with Telegram sessions`);

    for (const org of orgsWithSessions) {
      try {
        await connectOrgUserbot(org.org_id, org.telegram_session);
        connectedOrgs.add(org.org_id);
      } catch (err) {
        console.error(`[USERBOT] Failed to connect org ${org.org_id}:`, err.message);
        // Mark session as invalid
        await supabase.from('org_config').update({
          telegram_session_valid: false,
          updated_at: new Date().toISOString(),
        }).eq('org_id', org.org_id);
      }
    }

    console.log('[USERBOT] Initial connections done. Starting auto-reload...');

    // Auto-reload: check for new orgs every 30 seconds
    setInterval(async () => {
      try {
        const currentOrgs = await getOrgsWithSessions();
        for (const org of currentOrgs) {
          if (!connectedOrgs.has(org.org_id)) {
            console.log(`[USERBOT] New org detected: ${org.org_id}. Connecting...`);
            try {
              await connectOrgUserbot(org.org_id, org.telegram_session);
              connectedOrgs.add(org.org_id);
              console.log(`[USERBOT] Auto-connected org: ${org.org_id}`);
            } catch (err) {
              console.error(`[USERBOT] Failed to auto-connect org ${org.org_id}:`, err.message);
              await supabase.from('org_config').update({
                telegram_session_valid: false,
                updated_at: new Date().toISOString(),
              }).eq('org_id', org.org_id);
            }
          }
        }
      } catch (err) {
        console.error('[USERBOT] Auto-reload check failed:', err.message);
      }
    }, 30 * 1000); // Check every 30 seconds

    return;
  }

  // ─── Setup Mode ──────────────────────────────────────────────────────────────
  const orgId = orgIdArg;
  let sessionString = await loadSession(orgId);

  const session = new StringSession(sessionString);

  if (!API_ID || !API_HASH) {
    console.error('[USERBOT] ERROR: TELEGRAM_API_ID and TELEGRAM_API_HASH missing');
    process.exit(0);
  }

  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
    retryDelay: 5000,
  });

  // ─── First-time Setup ──────────────────────────────────────────────────────
  if (isSetup || !sessionString) {
    console.log(`[USERBOT] First-time setup for org: ${orgId}`);
    console.log('[USERBOT] You will receive an SMS code.');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise(resolve => rl.question(q, resolve));

    await client.start({
      phoneNumber: async () => await ask('Enter your phone number (e.g. +91...): '),
      password: async () => await ask('2FA password (leave blank if none): '),
      phoneCode: async () => await ask('Enter SMS code: '),
      onError: (err) => console.error('[USERBOT] Auth error:', err.message),
    });

    const newSessionString = client.session.save();
    await saveSession(newSessionString, orgId);
    rl.close();
    console.log('[USERBOT] ✓ Setup complete! Restart worker to run normally.');
    process.exit(0);
  }

  // ─── Normal Boot for single org ────────────────────────────────────────────
  await client.connect();
  console.log(`[USERBOT] ✓ Connected to Telegram for org: ${orgId}`);

  const sendFn = (chatId, msg) => sendMessage(client, chatId, msg);

  // ─── Start Drip Engine ──────────────────────────────────────────────────────
  startDripCron(sendFn, orgId);

  const botStartTime = Math.floor(Date.now() / 1000);

  // ─── Listen to Incoming DMs ─────────────────────────────────────────────────
  client.addEventHandler(async (event) => {
    const msg = event.message;
    if (!msg.isPrivate) return;
    if (msg.date < botStartTime) return;

    const chatId = msg.chatId?.value || msg.chatId;
    const text = msg.text;

    let senderUsername = null;
    let senderName = null;
    try {
      const entity = await client.getEntity(chatId);
      senderUsername = entity?.username || null;
      senderName = [entity?.firstName, entity?.lastName].filter(Boolean).join(' ') || null;
    } catch (e) {
      console.warn('[USERBOT] Failed to get sender entity:', e.message);
    }

    const replyFn = createReplyFn(client, event, chatId);

    await processIncomingMessage(chatId, text, replyFn, orgId, senderUsername, senderName);
  }, new NewMessage({}));

  // ─── Listen to Group Messages (Sniper) ──────────────────────────────────────
  client.addEventHandler(async (event) => {
    const msg = event.message;
    if (msg.isPrivate) return;
    if (msg.date < botStartTime) return;

    const chatId = msg.senderId?.value || msg.senderId;
    let username = null;
    try {
      const entity = await client.getEntity(chatId);
      username = entity?.username || null;
    } catch (e) {
      return;
    }
    const groupName = event.message.chat?.title || 'Unknown Group';
    const text = msg.text;

    await processSniperMessage(chatId, username, text, groupName, sendFn, orgId);
  }, new NewMessage({}));

  // ─── Daily Hunter ───────────────────────────────────────────────────────────
  const runDailyHunt = async () => {
    console.log(`[HUNTER] Starting daily hunt for org ${orgId}...`);
    const keywords = await generateSearchKeywords();
    console.log('[HUNTER] Keywords:', keywords);

    for (const keyword of keywords) {
      try {
        const results = await client.invoke({
          _: 'messages.searchGlobal',
          q: keyword,
          filter: { _: 'inputMessagesFilterEmpty' },
          minDate: 0, maxDate: 0, offsetRate: 0, offsetId: 0, limit: 5,
        });

        for (const chat of (results?.chats || [])) {
          try {
            const participants = await client.getParticipants(chat, { limit: 100 });
            await processTelegramChannel(chat, participants, sendFn, orgId);
          } catch (err) {
            console.warn(`[HUNTER] Could not get participants for ${chat.title}:`, err.message);
          }
        }
      } catch (err) {
        console.warn(`[HUNTER] Search failed for "${keyword}":`, err.message);
      }
    }
  };

  // Clear any existing intervals for this org before creating new ones
  if (orgIntervals.has(orgId)) {
    const old = orgIntervals.get(orgId);
    clearInterval(old.cleanup);
    clearInterval(old.dailyHunt);
    if (old.healthCheck) clearInterval(old.healthCheck);
  }

  const cleanupId = setInterval(() => runCleanup(orgId), 6 * 60 * 60 * 1000);

  await runDailyHunt();
  console.log('[USERBOT] Initializing admin remote...');
  await initAdminRemote(client, orgId);

  console.log('[USERBOT] Userbot is running and listening for commands/messages.');

  const dailyHuntId = setInterval(runDailyHunt, 24 * 60 * 60 * 1000);

  orgIntervals.set(orgId, { cleanup: cleanupId, dailyHunt: dailyHuntId });
}

// ─── Connect Single Org Userbot ──────────────────────────────────────────────
async function connectOrgUserbot(orgId, sessionString) {
  // Check if telegram is still enabled before connecting
  const { data: config } = await supabase
    .from('org_config')
    .select('telegram_enabled, telegram_session')
    .eq('org_id', orgId)
    .single();

  if (!config?.telegram_enabled || !config?.telegram_session) {
    console.log(`[USERBOT] Skipping org ${orgId}: telegram disabled or no session`);
    return;
  }

  const session = new StringSession(sessionString);
  
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
    retryDelay: 5000,
  });

  await client.connect();
  console.log(`[USERBOT] Connected for org: ${orgId}`);

  // Mark session as valid in DB
  await supabase.from('org_config').update({
    telegram_session_valid: true,
    updated_at: new Date().toISOString(),
  }).eq('org_id', orgId);

  // Send welcome message if not already sent
  sendWelcomeMessage(orgId, client);

  const sendFn = (chatId, msg) => sendMessage(client, chatId, msg);

  // Start drip engine
  startDripCron(sendFn, orgId);

  const botStartTime = Math.floor(Date.now() / 1000);

  // Listen to DMs
  client.addEventHandler(async (event) => {
    const msg = event.message;
    if (!msg.isPrivate) return;
    if (msg.date < botStartTime) return;

    const chatId = msg.chatId?.value || msg.chatId;
    const text = msg.text;

    let senderUsername = null;
    let senderName = null;
    try {
      const entity = await client.getEntity(chatId);
      senderUsername = entity?.username || null;
      senderName = [entity?.firstName, entity?.lastName].filter(Boolean).join(' ') || null;
    } catch (e) {
      console.warn('[USERBOT] Failed to get sender entity:', e.message);
    }

    const replyFn = createReplyFn(client, event, chatId);

    await processIncomingMessage(chatId, text, replyFn, orgId, senderUsername, senderName);
  }, new NewMessage({}));

  // Listen to group messages
  client.addEventHandler(async (event) => {
    const msg = event.message;
    if (msg.isPrivate) return;
    if (msg.date < botStartTime) return;

    const chatId = msg.senderId?.value || msg.senderId;
    let username = null;
    try {
      const entity = await client.getEntity(chatId);
      username = entity?.username || null;
    } catch (e) {
      // Entity not cached — skip group sniper for this message
      return;
    }
    const groupName = event.message.chat?.title || 'Unknown Group';
    const text = msg.text;

    await processSniperMessage(chatId, username, text, groupName, sendFn, orgId);
  }, new NewMessage({}));

  // ─── Daily Hunter for dynamically-loaded orgs ────────────────────────────
  const runDailyHunt = async () => {
    console.log(`[HUNTER] Starting daily hunt for org ${orgId}...`);
    const keywords = await generateSearchKeywords();
    console.log('[HUNTER] Keywords:', keywords);

    for (const keyword of keywords) {
      try {
        const results = await client.invoke(
          new Api.messages.SearchGlobal({
            q: keyword,
            filter: new Api.InputMessagesFilterEmpty(),
            minDate: undefined,
            maxDate: undefined,
            offsetRate: 0,
            offsetPeer: new Api.InputPeerEmpty(),
            offsetId: 0,
            limit: 5,
          })
        );

        for (const chat of (results?.chats || [])) {
          try {
            const participants = await client.getParticipants(chat, { limit: 100 });
            await processTelegramChannel(chat, participants, sendFn, orgId);
          } catch (err) {
            console.warn(`[HUNTER] Could not get participants for ${chat.title}:`, err.message);
          }
        }
      } catch (err) {
        console.warn(`[HUNTER] Search failed for "${keyword}":`, err.message);
      }
      // Throttle between searches to avoid flood
      await new Promise(r => setTimeout(r, 3000));
    }
  };

  // Clear any existing intervals for this org before creating new ones
  if (orgIntervals.has(orgId)) {
    const old = orgIntervals.get(orgId);
    clearInterval(old.cleanup);
    clearInterval(old.dailyHunt);
    if (old.healthCheck) clearInterval(old.healthCheck);
  }

  const cleanupId = setInterval(() => runCleanup(orgId), 6 * 60 * 60 * 1000);
  const dailyHuntId = setInterval(runDailyHunt, 24 * 60 * 60 * 1000);

  // Health check: disconnect if telegram_enabled becomes false
  const healthCheckId = setInterval(async () => {
    try {
      const { data: cfg } = await supabase
        .from('org_config')
        .select('telegram_enabled, telegram_session')
        .eq('org_id', orgId)
        .single();

      if (!cfg?.telegram_enabled || !cfg?.telegram_session) {
        console.log(`[USERBOT] Org ${orgId} disabled or session cleared. Disconnecting...`);
        clearInterval(healthCheckId);
        clearInterval(cleanupId);
        clearInterval(dailyHuntId);
        orgIntervals.delete(orgId);
        await client.disconnect();
        await supabase.from('org_config').update({
          telegram_session_valid: false,
          updated_at: new Date().toISOString(),
        }).eq('org_id', orgId);
        console.log(`[USERBOT] Disconnected org ${orgId}`);
      }
    } catch (e) {
      console.warn(`[USERBOT] Health check error for ${orgId}:`, e.message);
    }
  }, 30_000);

  orgIntervals.set(orgId, { cleanup: cleanupId, dailyHunt: dailyHuntId, healthCheck: healthCheckId });

  // Run initial hunt
  runDailyHunt().catch(err => console.error(`[HUNTER] Initial hunt failed for org ${orgId}:`, err.message));

  // Initialize admin remote
  await initAdminRemote(client, orgId);
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on('SIGINT', async () => {
  console.log('[USERBOT] Shutting down gracefully...');
  process.exit(0);
});

main().catch(err => {
  console.error('[USERBOT] Fatal error:', err);
  process.exit(1);
});
