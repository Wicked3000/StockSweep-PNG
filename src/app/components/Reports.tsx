import { useInventoryStore, formatKina } from '../store';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Boxes, TrendingUp, History, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Reports() {
  const navigate = useNavigate();
  const { sales, getInventoryValue, getTodaySales, getTodayProfit } = useInventoryStore();

  // Prepare data for "Sales Last 7 Days" chart
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  const chartData = getLast7Days().map(date => {
    const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    const daySales = sales
      .filter(s => s.timestamp.startsWith(date))
      .reduce((acc, s) => acc + Number(s.total_price), 0);
    
    return { name: dayLabel, sales: daySales };
  });

  const totalRevenue = sales.reduce((acc, s) => acc + Number(s.total_price), 0);

  const kpis = [
    { label: 'Total Revenue', value: formatKina(totalRevenue), icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Today Profit', value: formatKina(getTodayProfit()), icon: TrendingUp, color: 'text-blue-400' },
    { label: 'Inventory Value', value: formatKina(getInventoryValue()), icon: Boxes, color: 'text-slate-400' },
  ];

  return (
    <div className="flex flex-col p-6 space-y-6 animate-in fade-in duration-700">
      <header>
        <h1 className="text-2xl font-black text-white px-1 tracking-tight">Financial Reports</h1>
      </header>

      {/* KPI Scroll - following image style with currency K */}
      <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
        {kpis.map((kpi, i) => (
          <div key={i} className="min-w-[160px] bg-slate-900 border border-white/5 p-4 rounded-2xl flex flex-col space-y-2">
            <kpi.icon size={16} className={kpi.color} />
            <div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</p>
               <p className="text-lg font-black text-white tabular-nums">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Card */}
      <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 space-y-6">
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1">Sales Last 7 Days</h2>
        
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} 
                dy={10}
              />
              <YAxis 
                hide 
                domain={[0, 'dataMax + 10']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  borderColor: '#ffffff1a', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  color: '#fff'
                }}
                itemStyle={{ color: '#10b981' }}
                formatter={(value: number) => [formatKina(value), 'Sales']}
                cursor={{ stroke: '#ffffff22', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSales)" 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Link to Detailed Logs */}
      <button 
        onClick={() => navigate('/history')}
        className="w-full bg-slate-900 border border-white/5 p-6 rounded-[2rem] flex items-center justify-between group hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
      >
        <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <History size={24} />
            </div>
            <div className="text-left">
                <p className="text-sm font-bold text-white tracking-tight">View Detailed Transaction Logs</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Audit every sale recorded</p>
            </div>
        </div>
        <ArrowRight size={20} className="text-slate-600 group-hover:text-white transition-colors" />
      </button>

      <div className="flex-1">
         <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em] mb-4 text-center">Financial data accurate to XAMPP Master</p>
      </div>
    </div>
  );
}
