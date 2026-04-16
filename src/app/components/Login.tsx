import { useState } from 'react';
import { useInventoryStore } from '../store';
import { Lock, Delete, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
    const [pin, setPin] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { login } = useInventoryStore();

    const handleNumberClick = (num: string) => {
        if (pin.length < 4) {
            setPin(p => p + num);
        }
    };

    const handleDelete = () => {
        setPin(p => p.slice(0, -1));
    };

    const handleLogin = async () => {
        if (pin.length !== 4) return;
        setIsLoggingIn(true);
        try {
            await login(pin);
            toast.success('Access Granted');
        } catch (err: any) {
            toast.error(err.message || 'Invalid PIN');
            setPin('');
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Auto-login when 4 digits are entered
    if (pin.length === 4 && !isLoggingIn) {
        handleLogin();
    }

    return (
        <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                
                <div className="text-center mb-6 sm:mb-10">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 mx-auto mb-4 animate-pulse">
                        <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter uppercase">StockSweep<span className="text-emerald-400">PNG</span></h1>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">Enter PIN to Access</p>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl transition-all">
                    <div className="flex justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
                        {[...Array(4)].map((_, i) => (
                            <div 
                                key={i} 
                                className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full transition-all duration-300 ${
                                    i < pin.length 
                                        ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)] scale-110' 
                                        : 'bg-slate-800'
                                }`}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num.toString())}
                                disabled={isLoggingIn}
                                className="h-14 sm:h-16 bg-slate-800 hover:bg-slate-700 text-xl sm:text-2xl font-black text-white rounded-2xl transition-all active:scale-95"
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleDelete}
                            disabled={isLoggingIn}
                            className="h-14 sm:h-16 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 flex items-center justify-center rounded-2xl transition-all active:scale-95"
                        >
                            <Delete size={20} />
                        </button>
                        <button
                            onClick={() => handleNumberClick('0')}
                            disabled={isLoggingIn}
                            className="h-14 sm:h-16 bg-slate-800 hover:bg-slate-700 text-xl sm:text-2xl font-black text-white rounded-2xl transition-all active:scale-95"
                        >
                            0
                        </button>
                        <button
                            onClick={handleLogin}
                            disabled={pin.length < 4 || isLoggingIn}
                            className={`h-14 sm:h-16 flex items-center justify-center rounded-2xl transition-all active:scale-95 ${
                                pin.length === 4 
                                    ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:bg-emerald-500' 
                                    : 'bg-slate-800/50 text-slate-600'
                            }`}
                        >
                            {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                        </button>
                    </div>
                </div>


            </div>
        </div>
    );
}
