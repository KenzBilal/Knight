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
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSION_FILE = path.join(__dirname, 'session.txt');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws }
});

const API_ID = parseInt(process.env.TELEGRAM_API_ID || '2040');
const API_HASH = process.env.TELEGRAM_API_HASH || 'b18441a1ff607e10a989891a5462e627';

// ─── Load Session from File ───────────────────────────────────────────────────
function loadSession() {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      return fs.readFileSync(SESSION_FILE, 'utf8').trim();
    }
  } catch (e) {
    console.warn('[USERBOT] Could not read session file:', e.message);
  }
  return '';
}

// ─── Save Session to File ─────────────────────────────────────────────────────
function saveSession(sessionString) {
  fs.writeFileSync(SESSION_FILE, sessionString, 'utf8');
  console.log('[USERBOT] Session string saved to session.txt ✓');
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

// ─── Get All Org IDs ──────────────────────────────────────────────────────────
async function getAllOrgIds() {
  const { data } = await supabase.from('org_config').select('org_id');
  return (data || []).map(r => r.org_id);
}

// ─── Main Boot ────────────────────────────────────────────────────────────────
async function main() {
  const isSetup = process.argv.includes('--setup');

  let sessionString = loadSession();

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
    console.log('[USERBOT] First-time setup. You will receive an SMS code.');
    console.log('[USERBOT] This is the GLOBAL userbot — runs for ALL users.');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise(resolve => rl.question(q, resolve));

    await client.start({
      phoneNumber: async () => await ask('Enter your phone number (e.g. +91...): '),
      password: async () => await ask('2FA password (leave blank if none): '),
      phoneCode: async () => await ask('Enter SMS code: '),
      onError: (err) => console.error('[USERBOT] Auth error:', err.message),
    });

    const newSessionString = client.session.save();
    saveSession(newSessionString);
    rl.close();
    console.log('[USERBOT] ✓ Setup complete! Restart without --setup flag to run normally.');
    process.exit(0);
  }

  // ─── Normal Boot ────────────────────────────────────────────────────────────
  await client.connect();
  console.log('[USERBOT] ✓ Connected to Telegram (Global Userbot)');

  // Get all org IDs that have Telegram enabled
  const orgIds = await getAllOrgIds();
  console.log(`[USERBOT] Running for ${orgIds.length} org(s)`);

  // ─── Start Drip Engine for all orgs ─────────────────────────────────────────
  for (const orgId of orgIds) {
    startDripCron(sendMessage, orgId);
  }

  const botStartTime = Math.floor(Date.now() / 1000);

  // ─── Listen to Incoming DMs ─────────────────────────────────────────────────
  client.addEventHandler(async (event) => {
    const msg = event.message;
    if (!msg.isPrivate) return;
    if (msg.date < botStartTime) return;

    const chatId = msg.chatId?.value || msg.chatId;
    const text = msg.text;

    // Find which org this chat belongs to
    const { data: lead } = await supabase
      .from('telegram_leads')
      .select('org_id')
      .eq('chat_id', chatId)
      .single();

    const orgId = lead?.org_id || orgIds[0]; // fallback to first org

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

    // Run sniper for all orgs
    for (const orgId of orgIds) {
      await processSniperMessage(chatId, username, text, groupName, sendMessage, orgId);
    }
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
            // Process for all orgs
            for (const orgId of orgIds) {
              await processTelegramChannel(chat, participants, sendMessage, orgId);
            }
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
  setInterval(async () => {
    for (const orgId of orgIds) {
      await runCleanup(orgId);
    }
  }, 6 * 60 * 60 * 1000);

  await runDailyHunt();
  console.log('[USERBOT] Initializing admin remote for all orgs...');
  for (const orgId of orgIds) {
    await initAdminRemote(client, orgId);
  }

  console.log('[USERBOT] Global userbot is running and listening for commands/messages.');

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
