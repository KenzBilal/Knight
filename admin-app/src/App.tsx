import { useState, useEffect, useRef } from 'react';
import { Titlebar } from './components/Titlebar';
import { Sidebar, type Tab } from './components/Sidebar';
import { Overview } from './components/Overview';
import { UsersModule } from './components/UsersModule';
import { OrgsModule } from './components/OrgsModule';
import { BillingModule } from './components/BillingModule';
import { PlansModule } from './components/PlansModule';
import { JobsModule } from './components/JobsModule';
import { LeadsModule } from './components/LeadsModule';
import { EmailsModule } from './components/EmailsModule';
import { TelegramModule } from './components/TelegramModule';
import { ActivityModule } from './components/ActivityModule';
import { ApiHubModule } from './components/ApiHubModule';
import { WorkerModule } from './components/WorkerModule';
import { LogViewer } from './components/LogViewer';
import { EnvironmentModule } from './components/EnvironmentModule';
import { SettingsModule } from './components/SettingsModule';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const api = window.electronAPI || (window as any).electronAPI;
    if (api?.getLogs) {
      api.getLogs().then((cached: string[]) => { if (cached) setLogs(cached); });
    }
    api?.onWorkerLog?.((msg: string) => setLogs(p => [...p, msg].slice(-2000)));
    api?.onWorkerError?.((msg: string) => setLogs(p => [...p, `[ERROR] ${msg}`].slice(-2000)));
    api?.onWorkerStatus?.((msg: string) => setLogs(p => [...p, `[STATUS] ${msg}`].slice(-2000)));
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview />;
      case 'activity': return <ActivityModule />;
      case 'users': return <UsersModule />;
      case 'orgs': return <OrgsModule />;
      case 'billing': return <BillingModule />;
      case 'plans': return <PlansModule />;
      case 'jobs': return <JobsModule />;
      case 'leads': return <LeadsModule />;
      case 'emails': return <EmailsModule />;
      case 'telegram': return <TelegramModule />;
      case 'api-hub': return <ApiHubModule />;
      case 'worker': return <WorkerModule />;
      case 'logs': return (
        <div className="flex flex-col h-full">
          <header className="h-14 border-b border-[#1a1a1a] flex items-center px-6 shrink-0">
            <h2 className="text-[15px] font-medium text-[#e0e0e0]">Log Viewer</h2>
            <span className="ml-3 text-[11px] text-[#444]">{logs.length} lines</span>
          </header>
          <div className="flex-1 p-4 overflow-hidden">
            <LogViewer logs={logs} />
          </div>
        </div>
      );
      case 'environment': return <EnvironmentModule />;
      case 'settings': return <SettingsModule />;
      default: return <Overview />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#121212] text-[#e0e0e0] font-sans">
      <Titlebar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active={activeTab} onChange={setActiveTab} />
        <main className="flex-1 bg-[#121212] flex flex-col overflow-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
