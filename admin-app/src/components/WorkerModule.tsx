import { useState, useEffect } from 'react';
import { Cpu, Play, Square, RotateCcw } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { StatCard } from './StatCard';
import { LogViewer } from './LogViewer';

export function WorkerModule() {
  const [status, setStatus] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadStatus() {
    setLoading(true);
    if (window.electronAPI?.workerStatus) {
      const s = await window.electronAPI.workerStatus();
      setStatus(s);
    }
    if (window.electronAPI?.getLogs) {
      const cached = await window.electronAPI.getLogs();
      if (cached) setLogs(cached.slice(-100));
    }
    setLoading(false);
  }

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const api = window.electronAPI;
    api?.onWorkerLog?.((msg: string) => setLogs(p => [...p, msg].slice(-200)));
    api?.onWorkerError?.((msg: string) => setLogs(p => [...p, `[ERROR] ${msg}`].slice(-200)));
    api?.onWorkerStatus?.((msg: string) => setLogs(p => [...p, `[STATUS] ${msg}`].slice(-200)));
  }, []);

  const handleRestart = async () => {
    await window.electronAPI?.workerRestart();
    setTimeout(loadStatus, 1000);
  };

  const handleStop = async () => {
    await window.electronAPI?.workerStop();
    setTimeout(loadStatus, 1000);
  };

  const memMB = status?.memory ? (status.memory.heapUsed / 1024 / 1024).toFixed(1) : '0';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Worker" subtitle="Engine process control">
        <div className="flex items-center gap-2">
          <button onClick={loadStatus} className="text-[11px] text-[#555] hover:text-[#aaa] transition-colors">
            Refresh
          </button>
          <button onClick={handleRestart} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1a1a1a] text-[#e0e0e0] text-[12px] hover:bg-[#222] transition-colors border border-[#2a2a2a]">
            <RotateCcw size={12} /> Restart
          </button>
          <button onClick={handleStop} className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2a0a0a] text-[#f87171] text-[12px] hover:bg-[#3a1a1a] transition-colors border border-[#3a1a1a]">
            <Square size={12} /> Stop
          </button>
        </div>
      </PageHeader>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Status" value={status?.isRunning ? 'Running' : 'Stopped'} icon={<Cpu size={16} />} color={status?.isRunning ? '#4ade80' : '#f87171'} />
          <StatCard label="PID" value={status?.pid || 'N/A'} icon={<Play size={16} />} />
          <StatCard label="Memory" value={`${memMB} MB`} icon={<Cpu size={16} />} />
          <StatCard label="Uptime" value={status?.uptime ? `${Math.floor(status.uptime / 60)}m` : 'N/A'} icon={<Cpu size={16} />} />
        </div>

        <div>
          <h3 className="text-[11px] uppercase tracking-wider text-[#555] font-medium mb-3">Live Logs</h3>
          <LogViewer logs={logs} maxHeight="400px" />
        </div>
      </div>
    </div>
  );
}
