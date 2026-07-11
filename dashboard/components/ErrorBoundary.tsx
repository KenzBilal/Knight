"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-[#f87171]/[0.08] border border-[#f87171]/20 flex items-center justify-center mb-4">
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h3 className="font-display text-base font-600 text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-[#525252] mb-1 max-w-sm">
            An unexpected error occurred while rendering this page.
          </p>
          {this.state.error?.message && (
            <p className="text-xs font-mono text-[#3a3a3a] bg-white/[0.03] border border-white/[0.05] rounded px-3 py-2 max-w-md mb-6 break-all">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={this.handleRetry}
              className="btn-primary text-sm px-5 py-2"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-ghost text-sm px-5 py-2"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
