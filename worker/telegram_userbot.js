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

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws }
});

const API_ID = parseInt(process.env.TELEGRAM_API_ID || '2040');
const API_HASH = process.env.TELEGRAM_API_HASH || 'b18441a1ff607e10a989891a5462e627';

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

// ─── Get All Orgs with Telegram Sessions ──────────────────────────────────────
async function getOrgsWithSessions() {
  const { data } = await supabase
    .from('org_config')
    .select('org_id, telegram_session')
    .not('telegram_session', 'is', null);
  return (data || []).filter(r => r.telegram_session);
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
    
    const orgsWithSessions = await getOrgsWithSessions();
    console.log(`[USERBOT] Found ${orgsWithSessions.length} org(s) with Telegram sessions`);

    if (orgsWithSessions.length === 0) {
      console.log('[USERBOT] No orgs with Telegram sessions. Waiting for connections...');
      // Keep process alive
      setInterval(() => {}, 60000);
      return;
    }

    // Connect each org's userbot
    for (const org of orgsWithSessions) {
      try {
        await connectOrgUserbot(org.org_id, org.telegram_session);
      } catch (err) {
        console.error(`[USERBOT] Failed to connect org ${org.org_id}:`, err.message);
      }
    }

    console.log('[USERBOT] All userbots connected. Listening for messages...');
    
    // Keep process alive
    setInterval(async () => {
      // Reconnect any disconnected orgs
      const currentOrgs = await getOrgsWithSessions();
      // TODO: Check which orgs are connected and reconnect if needed
    }, 60 * 60 * 1000); // Check every hour
    
    return;
  }

  // ─── Setup Mode ──────────────────────────────────────────────────────────────
  const orgId = orgIdArg;
  let sessionString = await loadSession(orgId);

  const session = new StringSession(sessionString);

  if (!API_ID || !API_HASH) {
    console.error('[USERBOT] ERROR: TELEGRAM_API_ID and TELEGRAM_API_HASH missing');
    process.exit(1);
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

    const replyFn = async (id, replyText) => {
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

    await processIncomingMessage(chatId, text, replyFn, orgId);
  }, new NewMessage({}));

  // ─── Listen to Group Messages (Sniper) ──────────────────────────────────────
  client.addEventHandler(async (event) => {
    const msg = event.message;
    if (msg.isPrivate) return;
    if (msg.date < botStartTime) return;

    const chatId = msg.senderId?.value || msg.senderId;
    const username = (await client.getEntity(chatId))?.username;
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

  // ─── Cleanup Cron (every 6 hours) ───────────────────────────────────────────
  setInterval(() => runCleanup(orgId), 6 * 60 * 60 * 1000);

  await runDailyHunt();
  console.log('[USERBOT] Initializing admin remote...');
  await initAdminRemote(client, orgId);

  console.log('[USERBOT] Userbot is running and listening for commands/messages.');

  setInterval(runDailyHunt, 24 * 60 * 60 * 1000);
}

// ─── Connect Single Org Userbot ──────────────────────────────────────────────
async function connectOrgUserbot(orgId, sessionString) {
  const session = new StringSession(sessionString);
  
  const client = new TelegramClient(session, API_ID, API_HASH, {
    connectionRetries: 5,
    retryDelay: 5000,
  });

  await client.connect();
  console.log(`[USERBOT] Connected for org: ${orgId}`);

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

    const replyFn = async (id, replyText) => {
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

    await processIncomingMessage(chatId, text, replyFn, orgId);
  }, new NewMessage({}));

  // Listen to group messages
  client.addEventHandler(async (event) => {
    const msg = event.message;
    if (msg.isPrivate) return;
    if (msg.date < botStartTime) return;

    const chatId = msg.senderId?.value || msg.senderId;
    const username = (await client.getEntity(chatId))?.username;
    const groupName = event.message.chat?.title || 'Unknown Group';
    const text = msg.text;

    await processSniperMessage(chatId, username, text, groupName, sendFn, orgId);
  }, new NewMessage({}));

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
