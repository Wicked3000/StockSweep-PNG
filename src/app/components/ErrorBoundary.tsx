import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center p-8 bg-slate-950 text-center">
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-8 animate-pulse border border-red-500/20">
            <AlertTriangle size={48} />
          </div>
          
          <div className="max-w-xs space-y-4">
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">System Alert</h1>
            <p className="text-slate-500 font-medium leading-relaxed">
              The application encountered a runtime glitch. We've halted the process to protect your inventory data.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-12 flex items-center gap-3 px-8 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-2xl shadow-emerald-500/20"
          >
            <RefreshCcw size={20} />
            Recover System
          </button>
          
          <p className="absolute bottom-10 text-[9px] font-bold text-slate-800 uppercase tracking-widest px-10">
            StockSweep PNG Rugged Enterprise Edition v2.0
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
