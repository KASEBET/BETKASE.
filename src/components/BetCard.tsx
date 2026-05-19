import { motion } from 'motion/react';
import { Bet } from '../types';
import { cn } from '../lib/utils';
import { TrendingUp, Lock } from 'lucide-react';

interface BetCardProps {
  bet: Bet;
  user: any;
}

export function BetCard({ bet, user }: BetCardProps) {
  const isPremiumLocked = bet.type === 'premium' && !user;
  
  const parts = bet.match.split(' vs ');
  const localName = parts[0] || 'Local';
  const awayName = parts[1] || 'Visitante';

  return (
    <motion.div 
      layout
      className="group bg-gradient-to-br from-[#111] to-[#0a0a0a] rounded-[32px] border border-[#222] overflow-hidden hover:border-[#00ff88]/50 transition-all duration-500"
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <span className={cn(
            "px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase",
            bet.type === 'premium' ? "bg-[#FFD700] text-black" : "bg-[#00ff88] text-black"
          )}>
            {bet.type === 'premium' ? "💎 PREMIUM" : "🎁 GRATIS"}
          </span>
          {bet.result && (
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase",
              bet.result === 'win' ? "bg-[#00ff88]/20 text-[#00ff88]" : 
              bet.result === 'loss' ? "bg-red-500/20 text-red-500" :
              "bg-orange-500/20 text-orange-500"
            )}>
              {bet.result === 'win' ? "🏆 GANADA" : bet.result === 'loss' ? "❌ PERDIDA" : "⚠️ ANULADA"}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 mb-8 bg-black/40 p-4 rounded-3xl border border-white/5">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-14 h-14 bg-[#1a1a1a] rounded-2xl p-2.5 border border-white/5 flex items-center justify-center">
              {bet.image ? (
                <img src={bet.image} alt="Local" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-[#333] rounded-lg animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-500 text-center line-clamp-1">{localName}</span>
          </div>
          <span className="text-xl font-black text-[#00ff88] italic">VS</span>
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-14 h-14 bg-[#1a1a1a] rounded-2xl p-2.5 border border-white/5 flex items-center justify-center">
              {bet.awayImage ? (
                <img src={bet.awayImage} alt="Away" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-[#333] rounded-lg animate-pulse" />
              )}
            </div>
            <span className="text-[10px] font-bold text-gray-500 text-center line-clamp-1">{awayName}</span>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-4 line-clamp-2 leading-tight">{bet.match}</h3>
        
        <div className="relative">
          <p className={cn(
            "text-gray-400 text-sm mb-8 leading-relaxed line-clamp-3",
            isPremiumLocked && "blur-sm select-none"
          )}>
            {bet.prediction}
          </p>
          {isPremiumLocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl">
              <div className="text-center bg-[#111] p-4 rounded-2xl border border-[#222] shadow-2xl">
                <Lock className="mx-auto mb-2 text-[#FFD700]" size={20} />
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">Contenido Premium</p>
                <p className="text-[8px] text-gray-400 mt-1">Regístrate para ver</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div>
            <p className="text-[10px] font-black text-gray-500 tracking-widest uppercase mb-1">Cuota</p>
            <p className="text-2xl font-black text-[#00ff88] leading-none">{bet.odds}</p>
          </div>
          <button className="p-4 bg-[#111] hover:bg-[#222] border border-[#222] rounded-2xl transition-all group-hover:border-[#00ff88]/30">
            <TrendingUp size={20} className="group-hover:text-[#00ff88] transition-colors" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
