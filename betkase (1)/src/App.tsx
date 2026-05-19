import { useState, useEffect, useMemo } from 'react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { Trophy, Target, TrendingUp, Calendar, LogOut, Crown, Search, RefreshCw, ChevronDown, CheckCircle2, AlertTriangle, Info, X, ShieldAlert, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Bet, Sport } from './types';
import { cn } from './lib/utils';
import { BetCard } from './components/BetCard';
import { AuthModal } from './components/AuthModal';
import { LiveMatches } from './components/LiveMatches';
import { AdminPanel } from './components/AdminPanel';
import { ProfileSection } from './components/ProfileSection';

// Constants
const ADMIN_EMAIL = "camargosantiago2003@gmail.com";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'pronosticos' | 'ligas' | 'partidos' | 'tendencias' | 'admin' | 'perfil'>('pronosticos');
  const [sportFilter, setSportFilter] = useState<Sport>('futbol');
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (u.email === ADMIN_EMAIL) {
          setIsAdmin(true);
        } else {
          const adminDoc = await getDoc(doc(db, 'admins', u.uid));
          setIsAdmin(adminDoc.exists() && adminDoc.data().isAdmin === true);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'bets'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bet));
      setBets(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00ff88] selection:text-black">
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#161616] px-6 py-4 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 group cursor-pointer"
          onClick={() => setActiveTab('pronosticos')}
        >
          <div className="w-10 h-10 bg-[#00ff88] rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform duration-300">
            <Trophy className="text-black w-6 h-6" />
          </div>
          <span className="text-3xl font-black tracking-tighter text-[#00ff88]">BETKASE</span>
        </div>

        <nav className="hidden xl:flex items-center gap-1 bg-[#111] p-1 rounded-2xl border border-[#222]">
          {(['pronosticos', 'ligas', 'partidos', 'tendencias', 'perfil'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap",
                activeTab === tab 
                  ? "bg-[#00ff88] text-black shadow-[0_0_20px_rgba(0,255,136,0.3)]" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {tab === 'pronosticos' && <div className="flex items-center gap-2"><Target size={16}/> Pronósticos</div>}
              {tab === 'ligas' && <div className="flex items-center gap-2"><Trophy size={16}/> Ligas</div>}
              {tab === 'partidos' && <div className="flex items-center gap-2"><Calendar size={16}/> Partidos</div>}
              {tab === 'tendencias' && <div className="flex items-center gap-2"><TrendingUp size={16}/> Tendencias</div>}
              {tab === 'perfil' && <div className="flex items-center gap-2"><UserIcon size={16}/> Perfil</div>}
            </button>
          ))}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300",
                activeTab === 'admin' ? "bg-red-500 text-white shadow-lg" : "text-red-400/60 hover:text-red-400 hover:bg-red-500/5"
              )}
            >
              <div className="flex items-center gap-2"><ShieldAlert size={16}/> ADMIN</div>
            </button>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {!user ? (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-2.5 bg-[#00ff88] text-black font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_4px_20px_rgba(0,255,136,0.2)]"
            >
              Ingresar
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500 font-medium leading-none mb-1">Cuenta Premium</p>
                <p className="text-sm font-bold truncate max-w-[150px]">{user.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2.5 bg-[#111] hover:bg-red-500/10 hover:text-red-500 border border-[#222] rounded-xl transition-all"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="xl:hidden fixed top-[72px] left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-b border-[#161616] flex justify-center overflow-x-auto scrollbar-hide">
        {(['pronosticos', 'ligas', 'partidos', 'tendencias'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-4 text-xs font-black whitespace-nowrap transition-all border-b-2 tracking-widest",
              activeTab === tab ? "border-[#00ff88] text-[#00ff88]" : "border-transparent text-gray-500"
            )}
          >
            {tab.toUpperCase()}
          </button>
        ))}
        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={cn(
              "px-6 py-4 text-xs font-black whitespace-nowrap transition-all border-b-2 tracking-widest",
              activeTab === 'admin' ? "border-red-500 text-red-500" : "border-transparent text-red-400/40"
            )}
          >
            ADMIN
          </button>
        )}
      </div>

      <main className={cn(
        "pt-24 md:pt-28 pb-20 max-w-7xl mx-auto px-6",
        activeTab !== 'pronosticos' && "pt-40 md:pt-48"
      )}>
        <AnimatePresence mode="wait">
          {activeTab === 'pronosticos' && (
            <motion.div
              key="pronosticos"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-24"
            >
              {/* Hero */}
              {!user && (
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-12 md:pt-20">
                  <div className="space-y-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ff88]/10 border border-[#00ff88]/20 rounded-full text-[#00ff88] text-xs font-black tracking-widest uppercase">
                      <TrendingUp size={14} /> La plataforma #1 en rentabilidad
                    </div>
                    <h1 className="text-6xl md:text-[100px] font-black leading-[0.85] tracking-tighter">
                      DOMINA EL <br />
                      <span className="text-[#00ff88] italic">MERCADO</span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                      Impulsamos tus apuestas con análisis de datos avanzado y pronósticos de expertos verificados. 
                    </p>
                    <div className="flex flex-wrap gap-6 pt-4">
                      <button 
                        onClick={() => setIsAuthModalOpen(true)}
                        className="group flex items-center gap-4 bg-white text-black px-8 py-5 rounded-3xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                      >
                        EMPEZAR GRATIS
                        <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button className="group flex items-center gap-4 bg-[#111] border border-[#222] text-white px-8 py-5 rounded-3xl font-black text-xl hover:bg-[#1a1a1a] transition-all">
                        <Crown className="text-yellow-500" />
                        VER PLANES
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 relative">
                    <div className="absolute inset-0 bg-[#00ff88]/10 blur-[120px] rounded-full -z-10" />
                    <div className="space-y-6 pt-12">
                      <div className="bg-[#111] p-8 rounded-[40px] border border-[#222] shadow-2xl">
                        <p className="text-4xl font-black text-[#00ff88] mb-1">87%</p>
                        <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">Ratio de éxito</p>
                      </div>
                      <div className="bg-[#111] p-8 rounded-[40px] border border-[#222] shadow-2xl">
                        <p className="text-4xl font-black text-white mb-1">+12k</p>
                        <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">Apostadores</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-[#00ff88] p-8 rounded-[40px] border border-white/10 shadow-2xl group">
                        <Trophy className="text-black mb-4 group-hover:scale-125 transition-transform" size={32} />
                        <p className="text-2xl font-black text-black leading-tight">PREMIO MAYOR 2026</p>
                      </div>
                      <div className="bg-[#111] p-8 rounded-[40px] border border-[#222] shadow-2xl">
                        <p className="text-4xl font-black text-yellow-500 mb-1">VIP</p>
                        <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">Canal exclusivo</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Live Matches Slider */}
              <LiveMatches />

              {/* Bets List */}
              <section className="space-y-12 pt-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-[#161616] pb-12">
                  <div>
                    <h2 className="text-5xl font-black tracking-tighter mb-6">ÚLTIMOS <span className="text-[#00ff88]">PICKS</span></h2>
                    <div className="flex flex-wrap gap-4">
                      {(['futbol', 'tenis', 'nba'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSportFilter(s)}
                          className={cn(
                            "px-8 py-3.5 rounded-2xl text-xs font-black tracking-widest transition-all border uppercase",
                            sportFilter === s 
                              ? "bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.1)] scale-105" 
                              : "bg-[#0a0a0a] text-gray-500 border-[#222] hover:border-white/20 hover:text-white"
                          )}
                        >
                          {s === 'futbol' && "Fútbol"}
                          {s === 'tenis' && "Tenis"}
                          {s === 'nba' && "NBA"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex bg-[#111] p-1 rounded-2xl border border-[#222]">
                    {['Todas', 'Ganadas', 'Pendientes'].map((f) => (
                      <button 
                        key={f}
                        className={cn(
                          "px-6 py-2.5 text-[10px] font-black rounded-xl transition-all uppercase tracking-widest",
                          f === 'Todas' ? "bg-[#222] text-white" : "text-gray-500 hover:text-white"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {bets.filter(b => b.sport === sportFilter).map((bet) => (
                    <BetCard key={bet.id} bet={bet} user={user} />
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'perfil' && user && (
            <motion.div key="perfil" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ProfileSection user={user} />
            </motion.div>
          )}

          {activeTab === 'perfil' && !user && (
            <motion.div key="perfil-guest" initial={{ opacity: 0 }} className="text-center py-20 px-6">
              <div className="bg-[#111] p-12 rounded-[40px] border border-[#222] max-w-xl mx-auto">
                <Lock className="mx-auto mb-6 text-gray-700" size={64} />
                <h2 className="text-4xl font-black mb-4">Sección Bloqueada</h2>
                <p className="text-gray-500 mb-10">Ingresa o regístrate para gestionar tu perfil y métodos de pago.</p>
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-[#00ff88] text-black px-10 py-4 rounded-2xl font-black shadow-xl"
                >
                  INGRESAR AHORA
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'admin' && isAdmin && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AdminPanel />
            </motion.div>
          )}

          {activeTab === 'ligas' && (
            <motion.div key="ligas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-black tracking-tighter">EXPLORAR <span className="text-[#00ff88]">LIGAS</span></h2>
                <p className="text-gray-500 font-medium">Accede a estadísticas detalladas por competición.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SOCCER_LEAGUES.map(league => (
                  <div 
                    key={league.slug} 
                    className="bg-[#111] p-8 rounded-[32px] border border-[#222] hover:border-[#00ff88]/30 transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[10px] font-black text-[#00ff88] tracking-widest uppercase mb-1">{league.country}</p>
                      <h3 className="text-xl font-bold">{league.name}</h3>
                    </div>
                    <Trophy className="text-gray-800 group-hover:text-[#00ff88] transition-colors" size={32} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'partidos' && (
            <motion.div key="partidos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <div className="bg-[#111] p-12 rounded-[40px] border border-[#222] text-center">
                 <Calendar size={64} className="mx-auto mb-6 text-[#00ff88]" />
                 <h2 className="text-5xl font-black tracking-tighter mb-4">HISTORIAL COMPLETO</h2>
                 <p className="text-gray-400 max-w-md mx-auto mb-10">
                   Consulta resultados pasados para analizar el rendimiento de tus equipos favoritos.
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-black/50 p-6 rounded-3xl border border-white/5">
                      <p className="text-3xl font-black text-[#00ff88]">5,432</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Partidos</p>
                    </div>
                    <div className="bg-black/50 p-6 rounded-3xl border border-white/5">
                      <p className="text-3xl font-black text-white">48</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ligas</p>
                    </div>
                    <div className="bg-black/50 p-6 rounded-3xl border border-white/5">
                      <p className="text-3xl font-black text-[#00ff88]">2.8</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Goles/P</p>
                    </div>
                 </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'tendencias' && (
            <motion.div key="tendencias" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
               <TrendingUp size={80} className="mx-auto mb-6 text-[#00ff88]" />
               <h2 className="text-6xl font-black tracking-tighter mb-4">TENDENCIAS</h2>
               <p className="text-gray-500 text-xl font-medium">Algoritmos predictivos basados en racha de equipos.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-[#161616] p-20 text-center text-gray-600 bg-black">
        <div className="flex justify-center gap-12 mb-12 flex-wrap">
          {(['Twitter', 'Telegram', 'Instagram', 'Soporte'] as const).map(link => (
             <span key={link} className="hover:text-white cursor-pointer transition-colors font-bold tracking-widest text-[10px] uppercase">{link}</span>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
            <Trophy className="text-gray-600 w-4 h-4" />
          </div>
          <span className="text-sm font-black tracking-tighter text-gray-500">BETKASE</span>
        </div>
        <p className="font-black tracking-[0.3em] text-[10px] text-gray-800 uppercase">Gana con los mejores · 2026 Premium Analysis</p>
      </footer>

      {/* Nav Helper Icons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        <button className="w-14 h-14 bg-[#00ff88] text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <Search size={24} />
        </button>
        <button className="w-14 h-14 bg-[#111] border border-[#222] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <ChevronDown size={24} />
        </button>
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
