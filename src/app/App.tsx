import { BrowserRouter, Routes, Route, NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { Home, Boxes, Package, ShoppingCart, BarChart3, Database, RefreshCcw, Loader2, ArrowRight } from 'lucide-react';

import { useInventoryStore } from './store';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { StockCount } from './components/StockCount';
import { RecordSale } from './components/RecordSale';
import { Reports } from './components/Reports';
import { SalesHistory } from './components/SalesHistory';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login } from './components/Login';
import { LogOut } from 'lucide-react';

function Layout() {
  const { currentUser, logout } = useInventoryStore();

  const allTabs = [
    { to: '/', icon: Home, label: 'Home', roles: ['admin'] },
    { to: '/count', icon: Boxes, label: 'Count', roles: ['admin'] },
    { to: '/products', icon: Package, label: 'Products', roles: ['admin'] },
    { to: '/sales', icon: ShoppingCart, label: 'Sales', roles: ['admin', 'cashier'] },
    { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin'] },
  ];

  const tabs = allTabs.filter(t => t.roles.includes(currentUser?.role || ''));

  return (
    <div className="h-[100dvh] w-full bg-black flex justify-center text-slate-50 font-sans select-none overflow-hidden">
      {/* Mobile App Proxy Frame - Fluid on small screens, framed on large */}
      <div className="flex flex-col w-full sm:max-w-lg h-full bg-slate-950 relative sm:border-x border-white/5 shadow-2xl">
      <div className="shrink-0 flex justify-between items-center px-6 pt-[calc(1.25rem+env(safe-area-inset-top))] pb-5 z-40 bg-slate-950/50 backdrop-blur-sm border-b border-white/5">
        {/* Branding - Global Cloud Status */}
        <div className="flex items-center gap-2">
           <div className={`p-1.5 rounded-lg border transition-all duration-500 ${
             !isOnline ? 'bg-red-500/10 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
             isLoading ? 'bg-amber-500/10 border-amber-500/20 animate-pulse' :
             'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
           }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" 
                className={!isOnline ? 'text-red-500' : isLoading ? 'text-amber-500' : 'text-emerald-500'}
              >
                <path d="M17.5 19c.7 0 1.3-.2 1.8-.7s.7-1.1.7-1.8c0-1.3-1-2.4-2.2-2.5C17.4 12.3 16.2 11 14.7 11c-1.3 0-2.4.9-2.7 2.1C11.5 13 11 13 10.5 13c-1.9 0-3.5 1.6-3.5 3.5S8.6 20 10.5 20h7"></path>
                <path d="M12 11V3"></path>
                <path d="m9 6 3-3 3 3"></path>
              </svg>
           </div>
           <div className="flex flex-col">
             <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-300 font-mono leading-none">StockSweep Cloud</span>
             <span className={`text-[8px] font-bold uppercase tracking-widest mt-1 ${
               !isOnline ? 'text-red-400' : isLoading ? 'text-amber-400' : 'text-emerald-400/60'
             }`}>
               {!isOnline ? 'Offline Mode' : isLoading ? 'Syncing...' : 'Connected'}
             </span>
           </div>
        </div>


        {/* User Auth Info - Balanced Pill */}
        {currentUser && (
            <div className="flex items-center gap-2.5 bg-slate-900 border border-white/5 pl-3 pr-1 py-1 rounded-full shadow-lg">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-100 leading-none mt-[1px]">{currentUser.username}</span>
                </div>
                <button 
                    onClick={logout} 
                    className="flex items-center justify-center w-8 h-8 text-red-500 hover:text-red-400 transition-colors bg-red-500/10 hover:bg-red-500/20 rounded-full border border-red-500/10" 
                    aria-label="Logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
            </div>
        )}
      </div>


      <div className="flex-1 overflow-y-auto pb-safe scroll-smooth mb-[70px]">
        <Outlet />
      </div>
      
      {/* High-End Mobile Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.6)] z-50 pt-1 pb-safe">
        <div className="flex justify-around items-center h-16 w-full">
          {tabs.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 relative ${
                  isActive
                    ? 'text-emerald-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-emerald-500/10' : ''}`}>
                    <Icon 
                      size={22} 
                      strokeWidth={isActive ? 2.5 : 2} 
                      className={isActive ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : ''} 
                    />
                  </div>
                  <span className={`text-[9px] font-bold tracking-tight uppercase mt-1 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    {label}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 w-8 h-1 bg-emerald-500 rounded-full blur-[1px]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
      </div>
    </div>
  );
}

function ConnectionGuard({ children }: { children: React.ReactNode }) {
    const { initialize, isLoading, error } = useInventoryStore();
    const [bypass, setBypass] = useState(false);

    useEffect(() => {
        initialize();
    }, [initialize]);

    if (isLoading && !bypass) {
        return (
            <div className="absolute inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center">
                <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-[2rem] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                    </div>
                    <Loader2 className="absolute top-0 right-0 w-8 h-8 text-emerald-400 animate-spin -translate-y-2 translate-x-2" />
                </div>
                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">StockSweep</h2>
                    <div className="flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Waking Up Cloud Services...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !bypass) {
        return (
            <div className="absolute inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-8 text-center space-y-8">
                <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center text-red-500 border border-red-500/20 shadow-2xl shadow-red-500/10">
                    <Database size={40} />
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Cloud Offline</h2>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                        We couldn't reach your Supabase cloud instance. Please check your data connection or Wi-Fi.
                    </p>
                    <code className="block bg-slate-900 p-3 rounded-xl text-[10px] text-red-400 font-mono border border-white/5 whitespace-pre-wrap break-all">
                        {error}
                    </code>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-xs transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
                    <button 
                        onClick={() => initialize()}
                        className="flex items-center justify-center gap-3 px-8 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-2xl"
                    >
                        <RefreshCcw size={20} className="animate-spin-slow" />
                        Retry Cloud Sync
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}


export default function App() {
  const { currentUser } = useInventoryStore();

  return (
    <ErrorBoundary>
        <ConnectionGuard>
            {!currentUser ? (
                <Login />
            ) : (
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            {/* Role-Based Routing */}
                            {currentUser.role === 'admin' ? (
                                <>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/count" element={<StockCount />} />
                                    <Route path="/products" element={<Inventory />} />
                                    <Route path="/sales" element={<RecordSale />} />
                                    <Route path="/reports" element={<Reports />} />
                                    <Route path="/history" element={<SalesHistory />} />
                                </>
                            ) : (
                                <>
                                    {/* Cashier strictly limited to Sales */}
                                    <Route path="/sales" element={<RecordSale />} />
                                    {/* Redirect all other paths to sales */}
                                    <Route path="*" element={<RecordSale />} />
                                </>
                            )}
                        </Route>
                    </Routes>

                    <Toaster 
                        position="top-center" 
                        theme="dark"
                        toastOptions={{
                        className: 'bg-slate-900 border-white/10 text-slate-50 font-medium rounded-2xl shadow-2xl',
                        success: {
                            className: 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400 border-l-4 border-l-emerald-500',
                        }
                        }}
                    />
                </BrowserRouter>
            )}
        </ConnectionGuard>
    </ErrorBoundary>
  );
}