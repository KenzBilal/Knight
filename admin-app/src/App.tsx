import { useState, useEffect, Component, type ReactNode } from 'react';
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
import { TeamModule } from './components/TeamModule';
import { ToastContainer } from './components/Toast';

// ─── ERROR BOUNDARY ──────────────────────────────────────────────────────────
interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string;
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: (error: Error, reset: () => void) => ReactNode },
  ErrorState
> {
  state: ErrorState = { hasError: false, error: null, errorInfo: '' };

  static getDerivedStateFromError(error: Error): Partial<ErrorState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary]', error.message, errorInfo?.componentStack);
    this.setState({ errorInfo: errorInfo?.componentStack || '' });
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorInfo: '' });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="text-red-400 text-[14px] font-medium mb-2">Something went wrong</div>
          <div className="text-[#666] text-[12px] mb-4 max-w-md">{this.state.error.message}</div>
          {this.state.errorInfo && (
            <pre className="text-[10px] text-[#444] bg-[#0a0a0a] border border-[#1a1a1a] rounded p-3 max-w-2xl overflow-auto text-left mb-4 max-h-40">
              {this.state.errorInfo}
            </pre>
          )}
          <button
            onClick={this.reset}
            className="px-4 py-1.5 rounded bg-[#1a1a1a] text-[#e0e0e0] text-[12px] hover:bg-[#222] transition-colors border border-[#2a2a2a]"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [logs, setLogs] = useState<string[]>([]);
  const [ipcReady, setIpcReady] = useState(false);
  const [ipcError, setIpcError] = useState<string | null>(null);

  // Expose setActiveTab for keyboard shortcuts
  const setActiveTabSafe = (tabOrFn: Tab | ((prev: Tab) => Tab)) => {
    if (typeof tabOrFn === 'function') {
      setActiveTab(tabOrFn);
    } else {
      setActiveTab(tabOrFn);
    }
  };

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) {
      setIpcError('Electron IPC not available — run via Electron, not browser');
      return;
    }
    setIpcReady(true);

    // Load cached logs
    api.getLogs?.().then((result: any) => {
      const cached = result?.data || result;
      if (Array.isArray(cached)) setLogs(cached.slice(-500));
    }).catch((err: any) => console.error('[App] Failed to load cached logs:', err));

    // Subscribe to live logs
    const unsubLog = api.onWorkerLog?.((msg: string) => {
      setLogs(p => [...p, msg].slice(-2000));
    });
    const unsubError = api.onWorkerError?.((msg: string) => {
      setLogs(p => [...p, `[ERROR] ${msg}`].slice(-2000));
    });
    const unsubStatus = api.onWorkerStatus?.((msg: string) => {
      setLogs(p => [...p, `[STATUS] ${msg}`].slice(-2000));
    });

    // Subscribe to keyboard shortcuts from main process
    const unsubToggleLogs = api.onToggleLogs?.(() => {
      setActiveTabSafe(prev => prev === 'logs' ? 'overview' : 'logs');
    });

    return () => {
      unsubLog?.();
      unsubError?.();
      unsubStatus?.();
      unsubToggleLogs?.();
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <Overview />;
      case 'activity': return <ActivityModule />;
      case 'users': return <UsersModule />;
      case 'orgs': return <OrgsModule />;
      case 'billing': return <BillingModule />;
      case 'plans': return <PlansModule />;
      case 'team': return <TeamModule />;
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

  if (ipcError) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#121212] text-[#e0e0e0]">
        <div className="text-red-400 text-[14px] font-medium mb-3">Connection Error</div>
        <div className="text-[#666] text-[12px] mb-6 max-w-md text-center">{ipcError}</div>
        <div className="text-[#444] text-[11px]">Make sure you are running: npm run dev</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen overflow-hidden bg-[#121212] text-[#e0e0e0] font-sans" style={{ zoom: '1.08' }}>
        <Titlebar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar active={activeTab} onChange={setActiveTab} />
          <main className="flex-1 bg-[#121212] flex flex-col overflow-hidden">
            <ErrorBoundary key={activeTab}>
              {renderContent()}
            </ErrorBoundary>
          </main>
        </div>
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}
