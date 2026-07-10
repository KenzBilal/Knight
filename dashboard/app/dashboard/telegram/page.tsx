"use client";

export default function TelegramPage() {
  return (
    <div className="p-8">
      <h1 className="font-display text-2xl text-paper-100 mb-6">Telegram</h1>
      <div className="rounded-xl border border-line bg-ink-900 p-6">
        <h2 className="font-display text-lg text-paper-100 mb-3">Telegram Agent</h2>
        <p className="text-sm text-paper-400 mb-4">
          Connect a Telegram account to let Knight find leads in groups and handle sales conversations automatically.
        </p>
        <div className="rounded-lg bg-ink-950 border border-line p-4">
          <p className="text-sm text-paper-300 font-medium mb-1">Status: Not connected</p>
          <p className="text-xs text-paper-400">
            Go to Settings → Telegram to connect your account.
          </p>
        </div>
      </div>
    </div>
  );
}
