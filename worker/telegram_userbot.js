// Knight worker/telegram_userbot.js
// Userbot Entry Point — connect a real Telegram phone number
// Uses gramjs (Telegram MTProto library)
//
// SETUP INSTRUCTIONS (when phone number is ready):
// 1. Run: node worker/telegram_userbot.js --setup
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
  console.log('[USERBOT] Session string saved to database ✓');
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

// ─── Get Org ID from config ───────────────────────────────────────────────────
async function getOrgIdBySession(sessionString) {
  const { data } = await supabase
    .from('org_config')
    .select('org_id')
    .eq('telegram_session', sessionString)
    .single();
  return data?.org_id;
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

  // Get org_id from arg or try to detect from session
  let orgId = orgIdArg;
  let sessionString = '';

  if (orgId) {
    sessionString = await loadSession(orgId);
  }

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
    if (!orgId) {
      console.error('[USERBOT] ERROR: Cannot detect org. Please specify --org=<org_id>');
      process.exit(1);
    }

    console.log('[USERBOT] First-time setup. You will receive an SMS code.');
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
    console.log('[USERBOT] ✓ Setup complete! Restart without --setup flag to run normally.');
    process.exit(0);
  }

  // ─── Normal Boot ────────────────────────────────────────────────────────────
  await client.connect();
  console.log('[USERBOT] ✓ Connected to Telegram');

  // Auto-detect org_id from session if not provided
  if (!orgId) {
    orgId = await getOrgIdBySession(sessionString);
    if (!orgId) {
      console.error('[USERBOT] ERROR: Could not detect org_id from session. Set --org=<org_id>');
      process.exit(1);
    }
  }
  console.log(`[USERBOT] Running for org: ${orgId}`);

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
    console.log('[HUNTER] Starting daily hunt...');
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
  console.log('[USERBOT] Initializing components...');
  await initAdminRemote(client, orgId);

  console.log('[USERBOT] Userbot is running and listening for commands/messages.');

  setInterval(runDailyHunt, 24 * 60 * 60 * 1000);
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
