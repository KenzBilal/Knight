import { spawn } from 'child_process';
import 'dotenv/config';

// 1. Env validation
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'COHERE_API_KEY', 'OPENROUTER_API_KEY'];
const missing = required.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`[Start] Fatal Error: Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

// 2. Import and run index.js engine directly
console.log('[Start] Booting core engine...');
import './index.js';

// 3. Spawn Telegram userbot if credentials exist
let telegramProcess = null;
let telegramRetries = 0;
const MAX_RETRIES = 3;

function startTelegram() {
  if (!process.env.TELEGRAM_API_ID || !process.env.TELEGRAM_API_HASH) {
    console.log('[Telegram] Not connected — no API credentials');
    return;
  }

  console.log('[Start] Spawning Telegram userbot...');
  telegramProcess = spawn('node', ['telegram_userbot.js'], {
    stdio: 'inherit',
    env: process.env
  });

  telegramProcess.on('close', (code) => {
    if (code === 0) {
      console.log('[Telegram] Exited cleanly (not connected).');
      return; // Clean exit, no retry
    }
    
    console.error(`[Telegram] Process crashed with code ${code}.`);
    if (telegramRetries < MAX_RETRIES) {
      telegramRetries++;
      console.log(`[Telegram] Restarting in 5s... (Attempt ${telegramRetries}/${MAX_RETRIES})`);
      setTimeout(startTelegram, 5000);
    } else {
      console.error('[Telegram] Max retries reached. Telegram will remain down.');
    }
  });
}

startTelegram();

// 4. Heartbeat logging
setInterval(() => {
  console.log(`[Heartbeat] Core: RUNNING | Telegram: ${telegramProcess && telegramProcess.exitCode === null ? 'RUNNING' : 'OFFLINE'}`);
}, 60000);

// 5. Graceful shutdown
function shutdown() {
  console.log('[Start] Shutting down gracefully...');
  if (telegramProcess) telegramProcess.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
