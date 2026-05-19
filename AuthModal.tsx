import { format } from 'date-fns';

const COL_TZ = 'America/Bogota';

export interface ESPNMatch {
  id: string;
  sport: string;
  sportIcon: string;
  sportName: string;
  liga: string;
  ligaSlug: string;
  hora: string;
  dia: string;
  fecha: string;
  timestamp: number;
  local: {
    name: string;
    logo: string;
    score: string;
  };
  away: {
    name: string;
    logo: string;
    score: string;
  };
  periodo: number;
  tiempo: string;
  enVivo: boolean;
  finalizado: boolean;
}

export async function fetchESPN(url: string) {
  try {
    const secureUrl = url.replace(/^http:\/\//i, 'https://');
    const res = await fetch(secureUrl);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export function getESPNUrl(sport: string, league: string, date: string) {
  const base = 'https://site.api.espn.com/apis/site/v2/sports';
  if (sport === 'futbol') return `${base}/soccer/${league}/scoreboard?dates=${date}`;
  if (sport === 'nba') return `${base}/basketball/nba/scoreboard?dates=${date}`;
  if (sport === 'tenis') return `${base}/tennis/${league}/scoreboard?dates=${date}`;
  return null;
}

export function getESPNDateParam(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return format(d, 'yyyyMMdd');
}

export function formatMatchDateTime(dateStr: string) {
  if (!dateStr) return { hora: '', dia: '', fecha: '', timestamp: 0 };
  try {
    const d = new Date(dateStr);
    return {
      hora: format(d, 'HH:mm'),
      dia: format(d, 'EEEE'),
      fecha: format(d, 'dd MMM'),
      timestamp: d.getTime()
    };
  } catch (e) {
    return { hora: '', dia: '', fecha: '', timestamp: 0 };
  }
}
