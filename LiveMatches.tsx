import { useState, useEffect } from 'react';
import { fetchESPN, getESPNDateParam, ESPNMatch, formatMatchDateTime } from '../services/espn';
import { SOCCER_LEAGUES } from '../constants';
import { cn } from '../lib/utils';
import { RefreshCw, MapPin, Clock, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function LiveMatches() {
  const [matches, setMatches] = useState<ESPNMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [dayOffset, setDayOffset] = useState(0);

  const loadMatches = async () => {
    setLoading(true);
    const dateParam = getESPNDateParam(dayOffset);
    const allMatches: ESPNMatch[] = [];

    // Ligas de fútbol
    for (const league of SOCCER_LEAGUES.slice(0, 8)) {
      const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.slug}/scoreboard?dates=${dateParam}`;
      const data = await fetchESPN(url);
      if (data?.events) {
        data.events.forEach((ev: any) => {
          const comps = ev.competitions?.[0]?.competitors || [];
          if (comps.length < 2) return;
          const dt = formatMatchDateTime(ev.date);
          allMatches.push({
            id: ev.id,
            sport: 'soccer',
            sportIcon: '⚽',
            sportName: 'Fútbol',
            liga: league.name,
            ligaSlug: league.slug,
            hora: dt.hora,
            dia: dt.dia,
            fecha: dt.fecha,
            timestamp: dt.timestamp,
            local: { name: comps[0].team?.displayName || 'Local', logo: comps[0].team?.logo || '', score: comps[0].score || '-' },
            away: { name: comps[1].team?.displayName || 'Visitante', logo: comps[1].team?.logo || '', score: comps[1].score || '-' },
            periodo: ev.status?.period || 0,
            tiempo: ev.status?.displayClock || ev.status?.type?.description || '',
            enVivo: ev.status?.type?.state === 'in',
            finalizado: ev.status?.type?.state === 'post'
          });
        });
      }
    }
    setMatches(allMatches.sort((a, b) => a.timestamp - b.timestamp));
    setLoading(false);
  };

  useEffect(() => {
    loadMatches();
  }, [leagueFilter, dayOffset]);

  return (
    <section className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            PARTIDOS EN VIVO
          </h2>
          <p className="text-gray-500 font-medium mt-1">Sigue la acción minuto a minuto</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex bg-[#111] p-1 rounded-xl border border-[#222]">
            {[{ l: 'Hoy', o: 0 }, { l: 'Mañana', o: 1 }].map((d) => (
              <button
                key={d.o}
                onClick={() => setDayOffset(d.o)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                  dayOffset === d.o ? "bg-[#222] text-white" : "text-gray-500 hover:text-gray-300"
                )}
              >
                {d.l}
              </button>
            ))}
          </div>

          <select 
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value)}
            className="bg-[#111] border border-[#222] rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#00ff88]"
          >
            <option value="all">Todas las Ligas</option>
            {SOCCER_LEAGUES.map(l => (
              <option key={l.slug} value={l.slug}>{l.name}</option>
            ))}
          </select>

          <button 
            onClick={loadMatches}
            className="p-2.5 bg-[#111] border border-[#222] rounded-xl hover:text-[#00ff88] transition-colors"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-[#111] rounded-[32px] animate-pulse border border-[#222]" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-[#111] rounded-[32px] border border-dashed border-[#333] p-12 text-center">
          <p className="text-gray-500 font-bold">No hay partidos programados para este filtro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map(match => (
            <motion.div
              layout
              key={match.id}
              className={cn(
                "bg-[#111] rounded-[32px] border p-6 hover:border-[#00ff88]/30 transition-all",
                match.enVivo ? "border-red-500/30" : "border-[#222]"
              )}
            >
              <div className="flex justify-between items-center mb-6">
                {match.enVivo ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                    En Vivo
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-[#222] text-gray-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {match.hora}
                  </span>
                )}
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{match.liga}</span>
              </div>

              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex-1 text-center">
                  <img src={match.local.logo} className="w-12 h-12 mx-auto mb-2 object-contain" alt="" />
                  <p className="text-xs font-bold line-clamp-1">{match.local.name}</p>
                </div>
                <div className="text-center min-w-[80px]">
                  {match.enVivo ? (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl font-black text-[#00ff88]">{match.local.score}</span>
                      <span className="text-gray-500">-</span>
                      <span className="text-3xl font-black text-[#00ff88]">{match.away.score}</span>
                    </div>
                  ) : (
                    <span className="text-sm font-black text-white/20">VS</span>
                  )}
                </div>
                <div className="flex-1 text-center">
                  <img src={match.away.logo} className="w-12 h-12 mx-auto mb-2 object-contain" alt="" />
                  <p className="text-xs font-bold line-clamp-1">{match.away.name}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                  {match.enVivo ? match.tiempo : `${match.dia} · ${match.fecha}`}
                </span>
                <Trophy size={14} className="text-gray-700" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
