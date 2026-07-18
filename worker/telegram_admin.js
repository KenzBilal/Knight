// Knight worker/telegram_admin.js
// Dashboard-only lead status listener (no Telegram bot needed)

import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws }
});

// ─── Setup Realtime Listener ──────────────────────────────────────────────────
export function initAdminRemote(client, orgId) {
  console.log(`[ADMIN] Listening for lead status changes on org ${orgId}`);

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

        if (newStatus === 'APPROVED' && !processedApprovals.has(lead.id)) {
          processedApprovals.add(lead.id);
          console.log(`[ADMIN] Lead ${lead.id} (${lead.full_name || lead.username}) approved via dashboard`);
          if (processedApprovals.size > 1000) processedApprovals.clear();
        }

        if (newStatus === 'REJECTED' && !processedRejections.has(lead.id)) {
          processedRejections.add(lead.id);
          console.log(`[ADMIN] Lead ${lead.id} (${lead.full_name || lead.username}) rejected via dashboard`);
          if (processedRejections.size > 1000) processedRejections.clear();
        }
      }
    )
    .subscribe();
}
