import { Info } from 'lucide-react';
import { PageHeader } from './PageHeader';

export function SettingsModule() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Settings" subtitle="App configuration" />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6">
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-4">About</h3>
            <div className="space-y-3 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[#666]">App Name</span>
                <span className="text-[#e0e0e0]">Knight Admin Control Center</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Version</span>
                <span className="text-[#e0e0e0]">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Electron</span>
                <span className="text-[#e0e0e0]">41.x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">React</span>
                <span className="text-[#e0e0e0]">19.x</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl p-6">
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-4">Danger Zone</h3>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-[#1a0a0a] border border-[#2a1a1a]">
              <Info size={16} className="text-[#f87171] mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] text-[#e0e0e0]">Worker process is managed automatically.</p>
                <p className="text-[11px] text-[#666] mt-1">Use the Worker tab to start, stop, or restart the engine process.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
