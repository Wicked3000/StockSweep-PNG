import { useState } from 'react';
import { Search, History, Calendar, Package, TrendingUp, ArrowLeft } from 'lucide-react';
import { useInventoryStore, formatKina, Sale } from '../store';
import { useNavigate } from 'react-router-dom';

export function SalesHistory() {
  const navigate = useNavigate();
  const { sales, products } = useInventoryStore();
  const [search, setSearch] = useState('');

  const filteredSales = sales.filter(s => 
    s.product_name.toLowerCase().includes(search.toLowerCase()) ||
    s.timestamp.includes(search)
  );

  const totalSalesCount = filteredSales.length;
  const totalRevenue = filteredSales.reduce((acc, s) => acc + Number(s.total_price), 0);
  const totalProfit = filteredSales.reduce((acc, s) => acc + (Number(s.total_price) - Number(s.cost_total || 0)), 0);

  return (
    <div className="flex flex-col p-6 space-y-6 animate-in slide-in-from-right-4 duration-700 min-h-full pb-32">
      <header className="flex items-center gap-4">
        <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 active:scale-90 transition-all"
            aria-label="Go back"
        >
            <ArrowLeft size={20} />
        </button>
        <div>
            <h1 className="text-2xl font-black text-white px-1 tracking-tight uppercase">Sales History</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Detailed transaction logs</p>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
         <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-xl font-black text-white">{formatKina(totalRevenue)}</p>
         </div>
         <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Profit</p>
            <p className="text-xl font-black text-white">{formatKina(totalProfit)}</p>
         </div>
      </div>

      {/* Search Bus */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product or date..."
          className="block w-full pl-11 pr-4 py-4 bg-slate-900 border border-white/5 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
        />
      </div>

      {/* Log List */}
      <div className="space-y-3">
        {filteredSales.map((sale) => {
          const profit = Number(sale.total_price) - Number(sale.cost_total || 0);
          const dateStr = new Date(sale.timestamp).toLocaleDateString();
          const timeStr = new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={sale.id} className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex gap-4 items-center group hover:bg-slate-800/80 transition-all">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 flex-shrink-0">
                    <History size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-100 truncate">{sale.product_name}</h3>
                        <span className="text-[10px] font-black text-emerald-400 ml-2">{formatKina(sale.total_price)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                            <Calendar size={10} />
                            <span>{dateStr} • {timeStr}</span>
                        </div>
                        <div className="text-[9px] font-black text-blue-500/80 italic">
                            Qty: {sale.quantity}
                        </div>
                    </div>
                    {/* Profit Badge */}
                    <div className="mt-2 flex items-center gap-1.5">
                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500/40" 
                                style={{ width: `${Math.min(100, (profit / Number(sale.total_price)) * 100)}%` }} 
                            />
                        </div>
                        <span className="text-[9px] font-bold text-blue-400">Profit: {formatKina(profit)}</span>
                    </div>
                </div>
            </div>
          );
        })}

        {filteredSales.length === 0 && (
            <div className="text-center py-20">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">No transactions found</p>
            </div>
        )}
      </div>
    </div>
  );
}
