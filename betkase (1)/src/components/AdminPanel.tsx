import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Bet, Team, Sport } from '../types';
import { Plus, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminPanel() {
  const [localTeam, setLocalTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [prediction, setPrediction] = useState('');
  const [odds, setOdds] = useState('');
  const [sport, setSport] = useState<Sport>('futbol');
  const [type, setType] = useState<'gratis' | 'premium'>('gratis');
  const [loading, setLoading] = useState(false);
  const [customTeams, setCustomTeams] = useState<Team[]>([]);

  useEffect(() => {
    const loadTeams = async () => {
      const snap = await getDocs(collection(db, 'teams'));
      setCustomTeams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team)));
    };
    loadTeams();
  }, []);

  const publishBet = async () => {
    if (!localTeam || !awayTeam || !prediction || !odds) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'bets'), {
        match: `${localTeam.name} vs ${awayTeam.name}`,
        prediction,
        odds,
        image: localTeam.logo,
        awayImage: awayTeam.logo,
        type,
        sport,
        status: 'active',
        result: null,
        createdAt: Date.now(),
      });
      setPrediction('');
      setOdds('');
      alert('Apuesta publicada con éxito');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const [syncing, setSyncing] = useState(false);

  const syncMatches = async () => {
    setSyncing(true);
    const dateParam = new Date().toISOString().split('T')[0].replace(/-/g, '');
    let total = 0;

    try {
      for (const league of SOCCER_LEAGUES.slice(0, 5)) {
        const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.slug}/scoreboard?dates=${dateParam}`;
        const data = await fetchESPN(url);
        
        if (data?.events) {
          for (const ev of data.events) {
            const comps = ev.competitions?.[0]?.competitors || [];
            if (comps.length < 2) continue;
            
            await addDoc(collection(db, 'bk_matches'), {
              espnId: ev.id,
              sport: 'futbol',
              leagueSlug: league.slug,
              leagueName: league.name,
              date: ev.date,
              homeTeamName: comps[0].team?.displayName || '',
              awayTeamName: comps[1].team?.displayName || '',
              homeTeamLogo: comps[0].team?.logo || '',
              awayTeamLogo: comps[1].team?.logo || '',
              homeScore: comps[0].score || null,
              awayScore: comps[1].score || null,
              syncedAt: Date.now()
            });
            total++;
          }
        }
      }
      alert(`Sincronización completada: ${total} partidos guardados.`);
    } catch (e) {
      console.error(e);
      alert('Error en la sincronización');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Sync Section */}
      <div className="bg-gradient-to-br from-blue-900/20 to-black p-8 rounded-[40px] border border-blue-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <RefreshCw className={cn("text-blue-400", syncing && "animate-spin")} size={32} />
            <div>
              <h3 className="text-xl font-black text-blue-400">Sincronización ESPN</h3>
              <p className="text-xs text-gray-500">Descarga los partidos de hoy a Firestore.</p>
            </div>
          </div>
          <button 
            onClick={syncMatches}
            disabled={syncing}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black tracking-tight transition-all disabled:opacity-50"
          >
            {syncing ? 'SINCRONIZANDO...' : 'INICIAR SINCRONIZACIÓN'}
          </button>
        </div>
      </div>
      <div className="bg-[#111] p-8 rounded-[40px] border border-[#222]">
        <div className="flex items-center gap-3 mb-8">
          <ShieldAlert className="text-[#00ff88]" />
          <h2 className="text-3xl font-black tracking-tight">Publicar Nueva Apuesta</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Equipo Local</label>
            <input 
              type="text"
              placeholder="Nombre Equipo Local"
              className="w-full bg-black border border-[#222] rounded-2xl p-4 outline-none focus:border-[#00ff88]"
              onChange={(e) => setLocalTeam({ name: e.target.value, logo: 'https://cdn-icons-png.flaticon.com/512/53/53254.png' })}
            />
            <input 
              type="text"
              placeholder="URL Logo Local"
              className="w-full bg-black border border-[#222] rounded-2xl p-4 outline-none focus:border-[#00ff88]"
              onChange={(e) => setLocalTeam(prev => prev ? {...prev, logo: e.target.value} : null)}
            />
          </div>
          <div className="space-y-4">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Equipo Visitante</label>
            <input 
              type="text"
              placeholder="Nombre Equipo Visitante"
              className="w-full bg-black border border-[#222] rounded-2xl p-4 outline-none focus:border-[#00ff88]"
              onChange={(e) => setAwayTeam({ name: e.target.value, logo: 'https://cdn-icons-png.flaticon.com/512/53/53254.png' })}
            />
            <input 
              type="text"
              placeholder="URL Logo Visitante"
              className="w-full bg-black border border-[#222] rounded-2xl p-4 outline-none focus:border-[#00ff88]"
              onChange={(e) => setAwayTeam(prev => prev ? {...prev, logo: e.target.value} : null)}
            />
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Pronóstico</label>
            <textarea 
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              className="w-full bg-black border border-[#222] rounded-2xl p-5 outline-none focus:border-[#00ff88] min-h-[100px]"
              placeholder="Ej: Victoria local y más de 2.5 goles..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Cuota</label>
              <input 
                value={odds}
                onChange={(e) => setOdds(e.target.value)}
                className="w-full bg-black border border-[#222] rounded-2xl p-4 outline-none focus:border-[#00ff88]"
                placeholder="1.85"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Deporte</label>
              <select 
                value={sport}
                onChange={(e) => setSport(e.target.value as Sport)}
                className="w-full bg-black border border-[#222] rounded-2xl p-4 outline-none focus:border-[#00ff88]"
              >
                <option value="futbol">Fútbol</option>
                <option value="tenis">Tenis</option>
                <option value="nba">NBA</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Tipo</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as 'gratis' | 'premium')}
                className="w-full bg-black border border-[#222] rounded-2xl p-4 outline-none focus:border-[#00ff88]"
              >
                <option value="gratis">Gratis</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={publishBet}
          disabled={loading}
          className="w-full bg-[#00ff88] text-black font-black py-5 rounded-2xl hover:brightness-110 shadow-xl"
        >
          {loading ? 'PUBLICANDO...' : 'PUBLICAR APUESTA'}
        </button>
      </div>
    </div>
  );
}
