import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { PageHeader } from './PageHeader';

const ENV_KEYS = [
  'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY', 'RESEND_SENDER_EMAIL',
  'GEMINI_API_KEY', 'COHERE_API_KEY', 'GROQ_API_KEY', 'OPENROUTER_API_KEY',
  'TELEGRAM_API_ID', 'TELEGRAM_API_HASH',
];

export function EnvironmentModule() {
  const [envData, setEnvData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        if (window.electronAPI?.getEnv) {
          const data = await window.electronAPI.getEnv();
          setEnvData(data || {});
        }
      } catch {
        // Env unavailable
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      await window.electronAPI?.saveEnv(envData);
      setSaveMsg('Saved');
      setTimeout(() => setSaveMsg(null), 2000);
    } catch {
      setSaveMsg('Error saving');
    }
    setSaving(false);
  };

  const toggleShow = (key: string) => setShowValues(p => ({ ...p, [key]: !p[key] }));

  if (loading) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-[#555]">
        <div className="w-5 h-5 border-2 border-[#333] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[12px]">Loading environment...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Environment" subtitle="Worker configuration">
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-[11px] ${saveMsg === 'Saved' ? 'text-green-400' : 'text-red-400'}`}>{saveMsg}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#e0e0e0] text-[#121212] text-[12px] font-medium hover:bg-[#fff] transition-colors disabled:opacity-50"
          >
            <Save size={12} />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-3">
          {ENV_KEYS.map(key => (
            <div key={key} className="flex flex-col">
              <label className="text-[11px] font-medium text-[#555] mb-1 uppercase tracking-wider">{key}</label>
              <div className="relative">
                <input
                  type={showValues[key] ? 'text' : 'password'}
                  value={envData[key] || ''}
                  onChange={e => setEnvData(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-[#0d0d0d] border border-[#1a1a1a] rounded px-3 py-2 pr-10 text-[#e0e0e0] font-mono text-[12px] focus:border-[#333] focus:bg-[#111] outline-none transition-colors"
                />
                <button
                  onClick={() => toggleShow(key)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888]"
                >
                  {showValues[key] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
