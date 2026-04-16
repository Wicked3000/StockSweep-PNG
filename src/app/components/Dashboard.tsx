import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryStore, formatKina } from '../store';
import { Package, Calculator, TrendingUp, AlertTriangle, ScanLine, ShoppingCart, History, FileText, X } from 'lucide-react';

export function Dashboard() {
  const navigate = useNavigate();
  const { products, getInventoryValue, getTodaySales, getTodayProfit, getLowStockCount, currentUser } = useInventoryStore();
  const [showZReport, setShowZReport] = useState(false);

  const stats = [
    { 
      label: 'Total Products', 
      value: products.length, 
      icon: Package, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    { 
      label: 'Inventory Value', 
      value: formatKina(getInventoryValue()), 
      icon: Calculator, 
      color: 'text-emerald-400', 
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    },
    { 
      label: 'Today Profit', 
      value: formatKina(getTodayProfit()), 
      icon: TrendingUp, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    { 
      label: 'Low Stock', 
      value: getLowStockCount(), 
      icon: AlertTriangle, 
      color: 'text-red-400', 
      bg: 'bg-red-500/10',
      border: 'border-red-500/20'
    },
  ];

  return (
    <div className="flex flex-col p-6 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          StockSweep <span className="text-emerald-400 px-2 bg-emerald-500/10 rounded-lg">PNG</span>
        </h1>
        <p className="text-slate-500 font-medium text-sm px-1 italic">Enterprise Performance, PNG Ruggedness</p>
      </header>

      {/* KPI Grid - Responsive for all mobile screens */}
      <div className="grid grid-cols-1 min-[340px]:grid-cols-2 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`${stat.bg} ${stat.border} border rounded-2xl p-4 space-y-2 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-lg`}
          >
            <div className="flex justify-between items-start">
              <stat.icon className={`${stat.color} w-5 h-5 opacity-80`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 opacity-80 truncate">{stat.label}</p>
              <p className="text-lg min-[340px]:text-xl font-black text-slate-100 truncate">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>


      {/* Primary Action Buttons */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/count')}
          className="group relative flex items-center justify-between bg-blue-600 hover:bg-blue-500 p-6 rounded-2xl shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all duration-300 active:scale-95 overflow-hidden border border-blue-400/30"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-white/10 rounded-xl">
              <ScanLine size={24} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-wide uppercase">Start Stock Count</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/sales')}
          className="group relative flex items-center justify-between bg-emerald-600 hover:bg-emerald-500 p-6 rounded-2xl shadow-[0_4px_20px_rgba(5,150,105,0.3)] transition-all duration-300 active:scale-95 overflow-hidden border border-emerald-400/30"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-white/10 rounded-xl">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-wide uppercase">Record Sale</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/history')}
          className="group relative flex items-center justify-between bg-slate-900 hover:bg-slate-800 p-6 rounded-2xl border border-white/5 transition-all duration-300 active:scale-95 overflow-hidden shadow-lg"
        >
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <History size={24} />
            </div>
            <span className="text-lg font-bold text-slate-300 tracking-wide uppercase">Sales History</span>
          </div>
        </button>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowZReport(true)}
            className="group relative flex items-center justify-between bg-purple-600/20 hover:bg-purple-600/30 p-6 rounded-2xl border border-purple-500/30 transition-all duration-300 active:scale-95 overflow-hidden shadow-lg"
          >
            <div className="flex items-center space-x-4 relative z-10">
              <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                <FileText size={24} />
              </div>
              <span className="text-lg font-bold text-purple-300 tracking-wide uppercase">Close Register (Z-Report)</span>
            </div>
          </button>
        )}
      </div>

      {/* Quick Access List Placeholder */}
      <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-4 mt-2">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Alerts</p>
        {getLowStockCount() > 0 ? (
          <div className="flex items-center space-x-3 text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">
            <AlertTriangle size={18} />
            <span className="text-sm font-semibold">You have {getLowStockCount()} items needing restock.</span>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-600 italic text-sm">Everything is running smoothly...</div>
        )}
      </div>

      {/* Z-Report Modal */}
      {showZReport && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur flex p-4 items-center justify-center">
            <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl max-w-sm w-full animate-in zoom-in-95 shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-purple-400">Z-Report</h2>
                    <button onClick={() => setShowZReport(false)} className="text-slate-500 hover:text-white p-2">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6 text-center">
                    <div className="p-6 bg-slate-950 rounded-2xl border border-white/5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Today's Total Sales</p>
                        <p className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">{formatKina(getTodaySales())}</p>
                    </div>

                    <div className="p-6 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Expected Cash In Drawer</p>
                        <p className="text-4xl font-black text-white">{formatKina(getTodaySales())}</p>
                    </div>

                    <button 
                        onClick={() => window.print()} 
                        className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-colors"
                    >
                        <FileText size={20} />
                        Print Z-Report
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
