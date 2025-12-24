
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { User, AuctionStatus, HistoryItem } from './types.ts';
import { 
  Trophy, 
  Clock, 
  User as UserIcon, 
  AlertCircle,
  Play,
  Hammer,
  ChevronRight,
  Zap,
  Loader2,
  Timer as TimerIcon,
  ShieldCheck,
  Settings,
  Unlock
} from 'lucide-react';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbzHdvEXNSvOd_DG5glYC4uVNjaO-JOAfQbi4shsgyMwBqw9KkqSs6yl1GY268GOAtAp/exec'; 
const YOUTUBE_LIVE_ID = 'dQw4w9WgXcQ'; 

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [auction, setAuction] = useState<AuctionStatus & { productImg?: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  
  const serverOffsetRef = useRef<number>(0);

  useEffect(() => {
    if (localStorage.getItem('gamarra_admin_session') === 'true') {
      setIsAdmin(true);
    }
    const savedUser = localStorage.getItem('gamarra_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogoClick = () => {
    const newCount = adminClicks + 1;
    if (newCount >= 5) {
      setIsAdmin(true);
      localStorage.setItem('gamarra_admin_session', 'true');
      setAdminClicks(0);
      setError("MODO ADMINISTRADOR ACTIVADO");
      setTimeout(() => setError(null), 2000);
    } else {
      setAdminClicks(newCount);
      const timer = setTimeout(() => setAdminClicks(0), 2000);
      return () => clearTimeout(timer);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`${GAS_URL}?t=${Date.now()}`);
      const result = await response.json();
      if (result.success) {
        setAuction(result.data.status);
        setHistory(result.data.history);
        setIsConnected(true);
        if (result.serverTime) serverOffsetRef.current = result.serverTime - Date.now();
      }
    } catch (err) {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!auction || !auction.isActive || auction.isPaused || !auction.endTime) {
        setTimeLeft(0);
        return;
      }
      const adjustedNow = Date.now() + serverOffsetRef.current;
      const diff = Math.max(0, Math.floor((auction.endTime - adjustedNow) / 1000));
      setTimeLeft(diff);
    }, 250);
    return () => clearInterval(timer);
  }, [auction]);

  const handleAction = async (action: string, payload: any = {}) => {
    setLoading(true);
    try {
      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action, ...payload })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message);
        setTimeout(() => setError(null), 3000);
      }
      fetchData();
    } catch (err) {
      setError("Error de conexión");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const isAuctionOver = auction && !auction.isActive && auction.endTime > 0;
  const hasWinner = isAuctionOver && auction?.lastBidder !== 'Nadie';

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto shadow-2xl bg-slate-950 border-x border-white/5 font-sans relative overflow-hidden text-slate-100">
      
      <header className="bg-slate-900/80 backdrop-blur-md p-4 sticky top-0 z-50 border-b border-white/10 flex justify-between items-center">
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer active:scale-95 transition-transform select-none"
        >
          <div className="w-8 h-8 yape-bg rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="font-black italic text-lg tracking-tighter leading-none">GAMARRA GO!</h1>
            {isAdmin ? (
              <p className="text-[8px] font-black text-amber-400 tracking-[0.2em] uppercase flex items-center gap-1">
                <Unlock size={8} /> Panel Admin
              </p>
            ) : (
              <p className="text-[8px] font-bold text-purple-400 tracking-[0.2em] uppercase">Live Auction</p>
            )}
          </div>
        </div>
        {user && !isAdmin && (
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{user.name.split(' ')[0]}</span>
          </div>
        )}
        {isAdmin && (
          <button 
            onClick={() => { localStorage.removeItem('gamarra_admin_session'); setIsAdmin(false); }}
            className="text-[8px] font-black bg-white/10 px-2 py-1 rounded-md uppercase text-slate-400"
          >
            Salir
          </button>
        )}
      </header>

      <section className="relative aspect-video bg-black group shadow-2xl">
        <iframe className="w-full h-full opacity-60" src={`https://www.youtube.com/embed/${YOUTUBE_LIVE_ID}?autoplay=1&mute=1&controls=0&modestbranding=1`} title="Live" allow="autoplay; encrypted-media" />
        
        {hasWinner && (
          <div className="absolute inset-0 bg-purple-950/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-40">
            <Trophy size={60} className="text-amber-400 animate-bounce mb-2" />
            <h2 className="text-3xl font-black italic uppercase text-white leading-none">¡VENDIDO!</h2>
            <p className="text-amber-300 font-bold text-lg my-2 bg-white/10 px-4 py-1 rounded-full">{auction?.lastBidder}</p>
          </div>
        )}

        {auction?.isPaused && !hasWinner && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-30">
             <TimerIcon size={40} className="text-white/20 animate-spin-slow mb-3" />
             <h3 className="text-xl font-black italic uppercase tracking-widest text-white">Presentando Lote</h3>
          </div>
        )}
      </section>

      <main className="flex-1 p-4 space-y-4 bg-slate-950 overflow-y-auto pb-32">
        {auction ? (
          <>
            <div className="bg-slate-900 rounded-[2.5rem] p-5 border border-white/10 shadow-2xl">
               <div className="flex gap-4 items-center mb-6">
                 {auction.productImg ? (
                   <img src={auction.productImg} alt="Prod" className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
                 ) : (
                   <div className="w-20 h-20 rounded-2xl bg-white/5 animate-pulse" />
                 )}
                 <div className="flex-1">
                    <h2 className="text-xl font-black italic uppercase leading-tight">{auction.productName}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${auction.isActive ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                        {auction.isActive ? 'ACTIVO' : 'CERRADO'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">ID: {auction.productId}</span>
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 p-4 rounded-3xl border border-white/5 text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Precio Actual</p>
                    <p className="text-3xl font-black italic">S/ {auction.currentPrice}</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-3xl border border-white/5 text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Reloj</p>
                    <p className={`text-3xl font-black italic ${timeLeft < 10 && timeLeft > 0 ? 'text-red-500' : ''}`}>
                      {timeLeft}s
                    </p>
                  </div>
               </div>
               
               {!isAdmin && auction.isActive && !auction.isPaused && (
                 <div className="grid grid-cols-3 gap-2 mt-4 animate-in slide-in-from-bottom-2">
                    {[5, 10, 20].map(val => (
                      <button
                        key={val}
                        onClick={() => {
                          if (!user) { setIsRegistering(true); return; }
                          handleAction('bid', { name: user.name, amount: auction.currentPrice + val });
                        }}
                        disabled={loading}
                        className="bg-white text-slate-950 h-16 rounded-2xl flex flex-col items-center justify-center font-black active:scale-95 transition-all shadow-xl"
                      >
                        <span className="text-[8px] opacity-40">+S/</span>
                        <span className="text-lg italic">{val}</span>
                      </button>
                    ))}
                 </div>
               )}
            </div>

            <div className="space-y-2">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] text-center mb-4 italic">Cronología de Pujas</p>
               {history.length > 0 ? history.map((h, i) => (
                 <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border ${i === 0 ? 'bg-purple-500/10 border-purple-500/20' : 'bg-white/5 border-white/5 opacity-50'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${i === 0 ? 'bg-purple-600 text-white' : 'bg-slate-800'}`}>{h.bidder[0]}</div>
                    <div className="flex-1">
                       <p className="text-[10px] font-black uppercase tracking-tight">{h.bidder}</p>
                       <p className="text-[8px] font-bold text-slate-500">{h.time}</p>
                    </div>
                    <p className="font-black italic">S/ {h.amount}</p>
                 </div>
               )) : (
                 <div className="text-center py-4 opacity-20 text-[10px] font-bold uppercase italic">Esperando primera oferta...</div>
               )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 opacity-30">
            <Loader2 className="animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando Live...</p>
          </div>
        )}
      </main>

      {isAdmin && (
        <div className="fixed bottom-0 inset-x-0 bg-slate-900 p-4 border-t-2 border-amber-500/30 z-[100] flex flex-col gap-3 shadow-[0_-20px_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-300">
           <div className="flex items-center justify-center gap-2 mb-1">
             <Settings size={12} className="text-amber-500 animate-spin-slow" />
             <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Consola de Subasta</span>
           </div>
           
           <div className="flex gap-2">
              {!auction?.isActive && auction?.isPaused && (
                <button 
                  onClick={() => handleAction('admin_start')} 
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black italic uppercase py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
                >
                   {loading ? <Loader2 className="animate-spin" /> : <><Play fill="white" size={24} /> ¡ABRIR PUJA!</>}
                </button>
              )}

              {auction?.isActive && (
                <button 
                  onClick={() => handleAction('admin_close')} 
                  disabled={loading}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black italic uppercase py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
                >
                   {loading ? <Loader2 className="animate-spin" /> : <><Hammer size={24} /> ¡MARTILLAZO!</>}
                </button>
              )}

              {!auction?.isActive && !auction?.isPaused && (
                <button 
                  onClick={() => handleAction('admin_next')} 
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black italic uppercase py-5 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
                >
                   {loading ? <Loader2 className="animate-spin" /> : <>SIGUIENTE LOTE <ChevronRight size={24} /></>}
                </button>
              )}
           </div>
        </div>
      )}

      {isRegistering && !isAdmin && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-end justify-center p-4">
          <div className="bg-slate-900 w-full rounded-[3rem] p-10 border border-white/10 animate-in slide-in-from-bottom">
             <div className="text-center mb-8">
                <ShieldCheck className="mx-auto text-purple-500 mb-4" size={50} />
                <h2 className="text-3xl font-black italic uppercase">Regístrate</h2>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">Para poder participar en la subasta</p>
             </div>
             <form onSubmit={(e) => {
                e.preventDefault();
                const d = new FormData(e.currentTarget);
                const n = (d.get('name') as string).trim();
                const p = (d.get('phone') as string).trim();
                if(!n || !p) return;
                const u = { id: Date.now().toString(), name: n, phone: p, verified: true };
                setUser(u);
                localStorage.setItem('gamarra_user', JSON.stringify(u));
                setIsRegistering(false);
                handleAction('register', { name: u.name, phone: u.phone });
             }} className="space-y-4">
                <input name="name" required placeholder="Nombre y Apellido" className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 font-bold outline-none focus:border-purple-500" />
                <input name="phone" required type="tel" placeholder="WhatsApp" className="w-full bg-white/5 p-5 rounded-2xl border border-white/10 font-bold outline-none focus:border-purple-500" />
                <button type="submit" className="w-full yape-bg text-white font-black py-5 rounded-2xl text-xl italic uppercase shadow-xl">ENTRAR A LA SALA</button>
             </form>
          </div>
        </div>
      )}

      {error && (
        <div className={`fixed top-20 inset-x-6 z-[250] ${error.includes('ACTIVADO') ? 'bg-green-600' : 'bg-red-600'} text-white p-4 rounded-2xl flex items-center gap-3 shadow-2xl animate-in slide-in-from-top duration-300`}>
          <AlertCircle size={20} />
          <span className="text-[10px] font-black uppercase tracking-wider">{error}</span>
        </div>
      )}

      {!isConnected && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[110] bg-black/80 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
          <Loader2 className="animate-spin text-slate-400" size={12} />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Reconectando...</span>
        </div>
      )}
    </div>
  );
};

export default App;
