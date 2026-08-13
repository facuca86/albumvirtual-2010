import React, { useEffect, useMemo, useRef, useState } from 'react';
import { db, doc, getDoc, setDoc, onSnapshot, arrayUnion } from './firebase_RSA2010';
import { playerNames } from './playerNames_RSA2010';
import { teamThemes } from './teamThemes_RSA2010';
import { albumConfig, codeToNumber, numberToCode } from './albumConfig_RSA2010';

const LOCAL_STORAGE_KEY         = `${albumConfig.id}_stickers`;
const LOCAL_STORAGE_DARK_KEY    = `${albumConfig.id}_darkMode`;
const LOCAL_STORAGE_HISTORY_KEY = `${albumConfig.id}_progressHistory`;

const ALBUM_OWNER    = albumConfig.owner;
const VIEW_PARAM     = new URLSearchParams(window.location.search).get('view');
const TOTAL_STICKERS = albumConfig.totalStickers;

const teams      = albumConfig.teams;
const teamData   = albumConfig.teamData;
const teamGroups = albumConfig.teamGroups;
const groups     = albumConfig.groups;

const progressDocRef        = db ? doc(db, 'albumProgress', albumConfig.id) : null;
const settingsDocRef        = db ? doc(db, 'albumSettings', albumConfig.id) : null;
const progressHistoryDocRef = db ? doc(db, 'albumProgressHistory', albumConfig.id) : null;

const formatDateTime = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Entradas guardadas antes de que existieran id/timestamp (versión previa de handleMarkProgress)
// reciben acá un id/timestamp derivado, de forma determinística, para no perderlas al mergear.
const parseDateLabel = (label) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/.exec(label || '');
  if (!m) return null;
  const [, d, mo, y, h, mi] = m;
  return new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi)).getTime();
};

const normalizeHistoryEntry = (entry) => {
  if (!entry || (entry.id && entry.timestamp)) return entry;
  return {
    ...entry,
    id: entry.id ?? `legacy-${entry.dateLabel}-${entry.completedCount}-${entry.remainingCount}`,
    timestamp: entry.timestamp ?? parseDateLabel(entry.dateLabel) ?? 0,
  };
};

const mergeHistoryEntries = (...lists) => {
  const byId = new Map();
  for (const raw of lists.flat()) {
    const entry = normalizeHistoryEntry(raw);
    if (entry && entry.id) byId.set(entry.id, entry);
  }
  return [...byId.values()].sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
};

const PROYECTOS = [
  {
    id: 'paniniWorldCup2026',
    label: 'Mundial 2026',
    url: 'https://facuca86.github.io/albumvirtual/',
    style: 'multicolor',
    totalStickers: 980,
  },
  {
    id: 'paniniWorldCup2022',
    label: 'Mundial 2022 · Qatar',
    url: 'https://facuca86.github.io/albumvirtual-2022/',
    style: 'qatar',
    totalStickers: 638,
  },
  {
    id: 'paniniCWC2025',
    label: 'Club World Cup 2025',
    url: 'https://facuca86.github.io/albumvirtual-cwc25/',
    style: 'cwc',
    totalStickers: 550,
  },
  {
    id: 'paniniRussia2018',
    label: 'Mundial 2018 · Rusia',
    url: 'https://facuca86.github.io/albumvirtual-2018/',
    style: 'russia',
    totalStickers: 670,
  },
  {
    id: 'paniniBrazil2014',
    label: 'Mundial 2014 · Brasil',
    url: 'https://facuca86.github.io/albumvirtual-2014/',
    style: 'brazil2014',
    totalStickers: 640,
  },
  {
    id: 'paniniSouthAfrica2010',
    label: 'Mundial 2010 · Sudáfrica',
    url: 'https://facuca86.github.io/albumvirtual-2010/',
    style: 'southafrica2010',
    totalStickers: 640,
  },
  {
    id: 'paniniGermany2006',
    label: 'Mundial 2006 · Alemania',
    url: 'https://facuca86.github.io/albumvirtual-2006/',
    style: 'germany2006',
    totalStickers: 597,
  },
];

const getProyectoStyle = (style) => {
  switch (style) {
    case 'multicolor':
      return { background: 'linear-gradient(135deg, #e53e3e, #dd6b20, #d69e2e, #38a169, #3182ce, #805ad5)', color: '#ffffff' };
    case 'qatar':
      return { backgroundColor: '#6B0F1A', border: '2px solid #B8860B', color: '#ffffff' };
    case 'cwc':
      return { backgroundColor: '#000000', border: '2px solid #B8860B', color: '#FFD700' };
    case 'russia':
      return { backgroundColor: '#0E4CAC', border: '2px solid #D52B1E', color: '#ffffff' };
    case 'brazil2014':
      return { backgroundColor: '#5FBFD8', border: '2px solid #9BC43A', color: '#2D7B2F' };
    case 'southafrica2010':
      return { backgroundColor: '#D6491F', border: '2px solid #B92714', color: '#F8E4B3' };
    case 'germany2006':
      return { backgroundColor: '#0A839C', border: '2px solid #066F88', color: '#ffffff' };
    default:
      return { backgroundColor: '#1e293b', color: '#ffffff' };
  }
};

const proyectosFiltrados = PROYECTOS.filter(p => p.id !== albumConfig.id);

const getThemeKey = (teamCode) =>
  albumConfig.sectionThemes[teamCode]?.themeKey ?? teamCode;

const getTeamGradientClass = (teamCode) => {
  const theme = albumConfig.sectionThemes[teamCode];
  if (theme?.solidBg) return theme.solidBg;
  const gradient = teamThemes[getThemeKey(teamCode)]?.gradient;
  return gradient ? `bg-gradient-to-r ${gradient}` : 'bg-white';
};

const getInnerPanelClass = (teamCode, darkMode = false) => {
  const inner = albumConfig.sectionThemes[teamCode]?.innerPanel;
  if (inner) return inner;
  return darkMode ? 'bg-[#6b2010]' : 'bg-[#f7f5f2]';
};

const isTeamDark = (teamCode) => teamThemes[getThemeKey(teamCode)]?.dark === true;

const TAILWIND_HEX = {
  'green-300':'#86efac','green-400':'#4ade80','green-500':'#22c55e','green-600':'#16a34a','green-700':'#15803d',
  'red-400':'#f87171','red-500':'#ef4444','red-600':'#dc2626',
  'blue-400':'#60a5fa','blue-500':'#3b82f6','blue-600':'#2563eb','blue-700':'#1d4ed8',
  'yellow-300':'#fde047','yellow-400':'#facc15','yellow-500':'#eab308','yellow-600':'#ca8a04',
  'amber-600':'#d97706','orange-400':'#fb923c','orange-500':'#f97316','orange-600':'#ea580c','orange-700':'#c2410c',
  'rose-400':'#fb7185',
  'sky-300':'#7dd3fc','sky-400':'#38bdf8','sky-500':'#0ea5e9',
  'slate-300':'#cbd5e1','slate-400':'#94a3b8','slate-800':'#1e293b','slate-900':'#0f172a',
  'black':'#000000','white':'#ffffff',
};

function getTeamCodes(team) {
  const section = albumConfig.specialSections[team];
  if (section) {
    if (section.stickers) return section.stickers.map(s => s.code);
    return Array.from({length: section.count}, (_, i) => `${section.codePrefix}${section.codeStart + i}`);
  }
  return Array.from({length: albumConfig.teamStickerCount}, (_, i) => `${team}${i + 1}`);
}

function getTeamConfettiColors(teamCode) {
  const gradient = teamThemes[getThemeKey(teamCode)]?.gradient || '';
  const colors = (gradient.match(/(?:from|via|to)-([^\s]+)/g) || [])
    .map(m => TAILWIND_HEX[m.replace(/^(?:from|via|to)-/, '')]).filter(Boolean);
  return colors.length >= 2 ? [...colors, '#ffffff'] : ['#D6491F','#F8E4B3','#B92714','#ffffff'];
}

function getTeamForCode(code) {
  for (const [sectionCode, section] of Object.entries(albumConfig.specialSections)) {
    if (section.stickers) {
      if (section.stickers.some(s => s.code === code)) return sectionCode;
    } else {
      if (code.startsWith(section.codePrefix)) {
        const num = parseInt(code.slice(section.codePrefix.length));
        if (num >= section.codeStart && num < section.codeStart + section.count) return sectionCode;
      }
    }
  }
  const m = code.match(/^([A-Z]+)\d+$/);
  return (m && albumConfig.teamData[m[1]]) ? m[1] : null;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function PaniniAlbumRSA2010() {
  if (VIEW_PARAM === 'repetidas') return <RepeatidasView />;
  if (VIEW_PARAM === 'faltan') return <FaltanView />;

  const [currentView, setCurrentView]           = useState('home');
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [completed, setCompleted]               = useState({});
  const [showStats, setShowStats]               = useState(false);
  const [importMessage, setImportMessage]       = useState('');
  const [showQR, setShowQR]                     = useState(false);
  const [darkMode, setDarkMode]                 = useState(false);
  const [celebration, setCelebration]           = useState(null);
  const [justPastedCode, setJustPastedCode]     = useState(null);
  const [highlightCode, setHighlightCode]       = useState(null);
  const [searchOpen, setSearchOpen]             = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const isInitialLoad = useRef(true);
  const skipNextCloudSave = useRef(false);
  const [repetidasSelected, setRepetidasSelected] = useState(new Set());
  const [repetidasPending, setRepetidasPending] = useState([]);
  const [repetidasConfirmSelected, setRepetidasConfirmSelected] = useState(false);
  const [progressHistory, setProgressHistory]   = useState([]);
  const [showProgressHistory, setShowProgressHistory] = useState(false);
  const [progressMessage, setProgressMessage]   = useState('');
  const [otrosProyectosProgress, setOtrosProyectosProgress] = useState({});

  // ── Load progress ──────────────────────────────────────────────────────────
  useEffect(() => {
    const loadFromLocal = () => {
      try {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (parsed && typeof parsed === 'object') setCompleted(parsed);
        }
      } catch (_) {}
    };

    const loadProgress = async () => {
      try {
        if (progressDocRef) {
          const snap = await getDoc(progressDocRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data?.stickers && typeof data.stickers === 'object') {
              setCompleted(data.stickers);
              return;
            }
          }
        }
        loadFromLocal();
      } catch (error) {
        console.error('Error loading album progress from Firestore:', error);
        // No pudimos confirmar el estado real en la nube: si el respaldo local
        // dispara un guardado, no lo subamos a Firestore, para no pisar progreso
        // sincronizado desde otro dispositivo con datos locales viejos/incompletos.
        skipNextCloudSave.current = true;
        loadFromLocal();
      } finally {
        isInitialLoad.current = false;
      }
    };
    loadProgress();
  }, []);

  // ── Load dark mode ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        if (settingsDocRef) {
          const snap = await getDoc(settingsDocRef);
          if (snap.exists() && typeof snap.data()?.darkMode === 'boolean') {
            setDarkMode(snap.data().darkMode);
            return;
          }
        }
      } catch {}
      const local = localStorage.getItem(LOCAL_STORAGE_DARK_KEY);
      if (local !== null) setDarkMode(local === 'true');
    };
    loadDarkMode();
  }, []);

  // ── Load progress history ─────────────────────────────────────────────────
  useEffect(() => {
    const loadHistory = async () => {
      let localEntries = [];
      try {
        const localData = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
        if (localData) {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed)) localEntries = parsed;
        }
      } catch (_) {}

      let remoteEntries = null;
      try {
        if (progressHistoryDocRef) {
          const snap = await getDoc(progressHistoryDocRef);
          if (snap.exists() && Array.isArray(snap.data()?.entries)) {
            remoteEntries = snap.data().entries;
          }
        }
      } catch (error) {
        console.error('Error loading progress history from Firestore:', error);
      }

      if (remoteEntries === null) {
        setProgressHistory(localEntries.map(normalizeHistoryEntry));
        return;
      }

      const merged = mergeHistoryEntries(localEntries, remoteEntries);
      setProgressHistory(merged);
      try { localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(merged)); } catch (_) {}

      const remoteIds = new Set(remoteEntries.map(e => normalizeHistoryEntry(e).id));
      const missingFromCloud = merged.filter(e => !remoteIds.has(e.id));
      if (missingFromCloud.length > 0 && progressHistoryDocRef) {
        try { await setDoc(progressHistoryDocRef, { entries: arrayUnion(...missingFromCloud) }, { merge: true }); } catch (_) {}
      }
    };
    loadHistory();
  }, []);

  // ── Load progress of other projects (Otros Proyectos) ─────────────────────
  useEffect(() => {
    if (currentView !== 'otros-proyectos' || !db) return;
    let cancelled = false;
    const fetchProgress = async () => {
      // Se leen todos los álbumes en paralelo (no secuencial) y se usa el
      // `completedCount` ya calculado que cada álbum guarda junto con `stickers`,
      // para no tener que bajar el mapa completo de figuritas de cada uno.
      const entries = await Promise.all(
        proyectosFiltrados.map(async (proyecto) => {
          try {
            const snap = await getDoc(doc(db, 'albumProgress', proyecto.id));
            if (!snap.exists()) return [proyecto.id, null];
            const data = snap.data();
            const pegadas = typeof data?.completedCount === 'number'
              ? data.completedCount
              : Object.values(data?.stickers || {}).filter(v => v === true || v === 'repeated').length;
            return [proyecto.id, {
              pegadas,
              total: proyecto.totalStickers,
              pct: Math.round((pegadas / proyecto.totalStickers) * 100),
            }];
          } catch (_) {
            return [proyecto.id, null];
          }
        })
      );
      if (!cancelled) setOtrosProyectosProgress(Object.fromEntries(entries));
    };
    fetchProgress();
    return () => { cancelled = true; };
  }, [currentView]);

  // ── Save progress ──────────────────────────────────────────────────────────
  useEffect(() => {
    const saveProgress = async () => {
      if (isInitialLoad.current) return;
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(completed)); } catch (_) {}
      if (skipNextCloudSave.current) {
        skipNextCloudSave.current = false;
        return;
      }
      // completedCount se guarda ya calculado junto con stickers para que la vista
      // "Otros Proyectos" de otros álbumes no tenga que bajar el mapa completo de
      // stickers de este álbum y contarlo cliente-side en cada carga.
      const completedCountToSave = Object.entries(completed)
        .filter(([c, v]) => !c.startsWith(albumConfig.promoCodePrefix) && isCompletedSticker(v)).length;
      try {
        if (progressDocRef) await setDoc(progressDocRef, { stickers: completed, completedCount: completedCountToSave });
      } catch (error) {
        console.error('Error saving album progress to Firestore:', error);
      }
    };
    saveProgress();
  }, [completed]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const currentTeam     = teams[currentTeamIndex] || teams[0];
  const currentTeamInfo = teamData[currentTeam] || { name: currentTeam, federation: 'Federación Nacional de Fútbol', flag: '🏳️' };

  const stickerCount = albumConfig.specialSections[currentTeam]?.count ?? albumConfig.teamStickerCount;

  const isRepeatedSticker  = (v) => v === 'repeated';
  const isCompletedSticker = (v) => v === true || v === 'repeated';

  // ── Stickers memo ──────────────────────────────────────────────────────────
  const stickers = useMemo(() => {
    const section = albumConfig.specialSections[currentTeam];
    return Array.from({ length: stickerCount }, (_, i) => {
      const id = i + 1;
      let code, type, label, horizontal;

      if (section) {
        if (section.stickers) {
          const def = section.stickers[i];
          code = def.code; label = def.label; type = def.type; horizontal = def.horizontal;
        } else {
          code       = `${section.codePrefix}${section.codeStart + i}`;
          type       = section.type;
          horizontal = section.horizontal;
          label      = section.playerNamesKey
            ? (playerNames[section.playerNamesKey]?.[id - 1] || `Jugador ${id}`)
            : section.getLabel(id);
        }
      } else {
        // Figurita 1 = foto equipo (player), figurita 2 = escudo (brillante)
        code       = `${currentTeam}${id}`;
        type       = id === 2 ? 'brillante' : 'player';
        label      = playerNames[currentTeam]?.[id - 1] || (id === 2 ? 'Escudo' : id === 1 ? 'Equipo' : `Jugador ${id}`);
        horizontal = false;
      }

      return {
        id,
        code,
        completed:  isCompletedSticker(completed[code]),
        repeated:   isRepeatedSticker(completed[code]),
        type,
        label,
        horizontal,
      };
    });
  }, [currentTeam, completed, stickerCount]);

  // ── Toggle ─────────────────────────────────────────────────────────────────
  const toggleSticker = (code) => {
    const current = completed[code];
    let next;
    if (current === true)            next = { ...completed, [code]: 'repeated' };
    else if (current === 'repeated') { next = { ...completed }; delete next[code]; }
    else                             next = { ...completed, [code]: true };
    setCompleted(next);

    if (!current) {
      setJustPastedCode(code);
      setTimeout(() => setJustPastedCode(null), 450);

      const newCount = Object.entries(next)
        .filter(([c, v]) => !c.startsWith(albumConfig.promoCodePrefix) && isCompletedSticker(v)).length;
      if (newCount === TOTAL_STICKERS) {
        setTimeout(() => setCelebration({ type: 'album' }), 350);
        return;
      }

      const teamForCode = getTeamForCode(code);
      if (teamForCode) {
        const codes    = getTeamCodes(teamForCode);
        const wasComplete = codes.every(c => isCompletedSticker(completed[c]));
        const nowComplete = codes.every(c => isCompletedSticker(next[c]));
        if (nowComplete && !wasComplete) {
          setTimeout(() => setCelebration({ type: 'team', team: teamForCode }), 350);
        }
      }
    }
  };

  const toggleDarkMode = async () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    localStorage.setItem(LOCAL_STORAGE_DARK_KEY, String(newVal));
    if (settingsDocRef) {
      try { await setDoc(settingsDocRef, { darkMode: newVal }, { merge: true }); } catch (_) {}
    }
  };

  const nextTeam = () => {
    window.scrollTo(0, 0);
    if (currentTeam === albumConfig.lastSectionCode) { setCurrentView('home'); return; }
    setCurrentTeamIndex(prev => Math.min(prev + 1, teams.length - 1));
  };

  const prevTeam = () => {
    window.scrollTo(0, 0);
    setCurrentTeamIndex(prev => Math.max(prev - 1, 0));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(completed)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = albumConfig.exportFileName; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return;
        setCompleted(parsed);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        if (progressDocRef) { try { await setDoc(progressDocRef, { stickers: parsed }); } catch (_) {} }
        setImportMessage('✅ Progreso importado');
        setTimeout(() => setImportMessage(''), 2000);
      } catch (_) {}
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const completedCount    = Object.entries(completed).filter(([c,v]) => !c.startsWith(albumConfig.promoCodePrefix) && isCompletedSticker(v)).length;
  const repeatedCount     = Object.values(completed).filter(isRepeatedSticker).length;
  const completionPercent = Math.round((completedCount / TOTAL_STICKERS) * 100);
  const remainingPercent  = 100 - completionPercent;
  const remainingCount    = Math.max(TOTAL_STICKERS - completedCount, 0);

  const faltantesGrouped = useMemo(() => {
    const byTeam = {};
    for (const team of teams) {
      const missing = getTeamCodes(team).filter((code) => !isCompletedSticker(completed[code]));
      if (missing.length) byTeam[team] = missing;
    }
    return teams.filter(t => byTeam[t]).map(t => ({ team: t, info: teamData[t], codes: byTeam[t] }));
  }, [completed]);

  const handleMarkProgress = async () => {
    const now = new Date();
    const entry = {
      id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: now.getTime(),
      dateLabel: formatDateTime(now),
      percentCompleted: completionPercent,
      percentRemaining: remainingPercent,
      completedCount,
      remainingCount,
    };
    const nextHistory = [...progressHistory, entry];
    setProgressHistory(nextHistory);
    try { localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(nextHistory)); } catch (_) {}
    try {
      if (progressHistoryDocRef) await setDoc(progressHistoryDocRef, { entries: arrayUnion(entry) }, { merge: true });
    } catch (error) {
      console.error('Error saving progress history to Firestore:', error);
    }
    setProgressMessage('✅ Progreso marcado');
    setTimeout(() => setProgressMessage(''), 2000);
  };

  const selectionTeams = albumConfig.competingTeams;

  // Brillantes: escudos (figurita 2 de cada equipo) + especiales
  const shieldCodes    = selectionTeams.map(t => `${t}2`);
  const brilliantCodes = [...shieldCodes, ...albumConfig.brillanteSpecialCodes];
  const brilliantTotal          = brilliantCodes.length; // 41
  const brilliantCompletedCount = brilliantCodes.filter(c => isCompletedSticker(completed[c])).length;

  const selectionStats = useMemo(() => {
    const result = [];
    for (const item of albumConfig.statsConfig) {
      if (item.key === '__TEAMS__') {
        selectionTeams.forEach(team => {
          const codes = getTeamCodes(team);
          result.push({ key:team, emoji:albumConfig.teamData[team]?.flag||'🏳️', name:(albumConfig.teamData[team]?.name||team).toUpperCase(), total:codes.length, completed:codes.filter(c=>isCompletedSticker(completed[c])).length });
        });
      } else {
        const codes = item.fixedCodes || Array.from({length:item.count}, (_, i) => `${item.codePrefix}${item.codeStart + i}`);
        result.push({ key:item.key, emoji:item.emoji, name:item.name, total:codes.length, completed:codes.filter(c=>isCompletedSticker(completed[c])).length });
      }
    }
    return result;
  }, [completed, selectionTeams]);

  // ── Search ─────────────────────────────────────────────────────────────────
  const searchIndex = useMemo(() => {
    const entries = [];
    for (const teamCode of teams) {
      const section = albumConfig.specialSections[teamCode];
      const sc      = albumConfig.searchConfig?.[teamCode];
      if (section) {
        const codes = getTeamCodes(teamCode);
        codes.forEach((code, i) => {
          let label;
          if (section.stickers)            label = section.stickers[i].label;
          else if (section.playerNamesKey) label = playerNames[section.playerNamesKey]?.[i] || `Jugador ${i + 1}`;
          else                             label = section.getLabel(i + 1);
          entries.push({ code, label, team: teamCode, teamName: sc?.teamName || teamCode, teamFlag: sc?.teamFlag || '🏳️' });
        });
      } else {
        const info = albumConfig.teamData[teamCode];
        for (let id = 1; id <= albumConfig.teamStickerCount; id++) {
          entries.push({
            code:     `${teamCode}${id}`,
            label:    playerNames[teamCode]?.[id - 1] || (id === 2 ? 'Escudo' : id === 1 ? 'Equipo' : `Jugador ${id}`),
            team:     teamCode,
            teamName: info?.name || teamCode,
            teamFlag: info?.flag || '🏳️',
          });
        }
      }
    }
    return entries;
  }, [selectionTeams]);

  const searchResults = useMemo(() => {
    if (searchQuery.length < 2) return [];
    const q = searchQuery.trim();

    // Casos especiales por número
    if (q === '000') {
      const entry = searchIndex.find(e => e.code === 'PANINI');
      return entry ? [entry] : [];
    }
    if (q === '00') {
      const entry = searchIndex.find(e => e.code === 'FIFA');
      return entry ? [entry] : [];
    }
    if (/^\d+$/.test(q)) {
      const num  = parseInt(q, 10);
      const code = numberToCode[num];
      if (code) {
        const entry = searchIndex.find(e => e.code === code);
        return entry ? [entry] : [];
      }
      return [];
    }

    const ql = q.toLowerCase();
    return searchIndex.filter(e =>
      e.code.toLowerCase().startsWith(ql) ||
      e.label.toLowerCase().includes(ql) ||
      e.teamName.toLowerCase().includes(ql)
    ).slice(0, 6);
  }, [searchQuery, searchIndex]);

  const handleSearchSelect = (entry) => {
    setSearchOpen(false); setSearchQuery('');
    const teamIdx = teams.indexOf(entry.team);
    if (teamIdx >= 0) {
      window.scrollTo(0, 0);
      setCurrentTeamIndex(teamIdx);
      setCurrentView('album');
      setHighlightCode(entry.code);
      setTimeout(() => setHighlightCode(null), 3000);
    }
  };

  // ── currentTeamCompleted ───────────────────────────────────────────────────
  const currentTeamCompleted = stickers.filter(s => s.completed).length;

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-[#3d0f04] text-[#F8E4B3]' : 'bg-[#D6491F] text-slate-800'}`}>

      {/* ── HEADER ── */}
      <header className={`border-b shadow-sm sticky top-0 z-50 transition-colors duration-300 ${darkMode ? 'bg-[#5a1a08] border-[#6b2010]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4 flex flex-row gap-2 justify-between items-center">
          <div className="min-w-0">
            <h1 className={`text-lg sm:text-3xl font-black italic truncate ${darkMode ? 'text-[#F8E4B3]' : ''}`}>
              🇿🇦 {albumConfig.title}
            </h1>
            <p className={`hidden sm:block text-xs uppercase tracking-[0.3em] ${darkMode ? 'text-amber-300' : 'text-slate-500'}`}>
              {albumConfig.subtitle}
            </p>
            <div className={`mt-0.5 sm:mt-2 text-xs sm:text-sm font-black ${darkMode ? 'text-amber-400' : 'text-amber-800'}`}>
              {completionPercent}% COMPLETADO
            </div>
            <div className={`mt-1 sm:mt-2 h-2 sm:h-2.5 w-24 sm:w-56 rounded-full overflow-hidden ${darkMode ? 'bg-[#6b2010]' : 'bg-slate-200'}`}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 relative">
            {searchOpen && (
              <div className="relative flex items-center gap-1">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); } }}
                  placeholder="Código, número o jugador…"
                  className={`px-3 py-2 rounded-xl text-sm font-black border-2 w-36 sm:w-52 outline-none transition-all ${darkMode ? 'bg-[#6b2010] border-[#8b3020] text-[#F8E4B3] placeholder-amber-700' : 'bg-white border-slate-300 text-slate-800 placeholder-slate-400'}`}
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className={`font-black text-base leading-none px-1 ${darkMode ? 'text-amber-400' : 'text-slate-500'}`}>✕</button>
                {searchResults.length > 0 && (
                  <div className={`absolute top-full right-0 mt-1 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl shadow-2xl overflow-hidden z-[200] ${darkMode ? 'bg-[#5a1a08] border border-[#6b2010]' : 'bg-white border border-slate-200'}`}>
                    {searchResults.map(entry => (
                      <button key={entry.code} onClick={() => handleSearchSelect(entry)}
                        className={`w-full px-4 py-2.5 text-left flex items-center gap-3 border-b last:border-b-0 transition-colors ${darkMode ? 'border-[#6b2010] hover:bg-[#6b2010] text-[#F8E4B3]' : 'border-slate-100 hover:bg-slate-50'}`}>
                        <span className="text-xl leading-none shrink-0">{entry.teamFlag}</span>
                        <div className="min-w-0">
                          <div className={`font-black text-xs uppercase ${darkMode ? 'text-amber-400' : 'text-slate-400'}`}>
                            {codeToNumber[entry.code] !== undefined ? `#${codeToNumber[entry.code]}` : entry.code}
                          </div>
                          <div className="font-black text-sm truncate">{entry.label}</div>
                          <div className={`text-xs truncate ${darkMode ? 'text-amber-600' : 'text-slate-400'}`}>{entry.teamName}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button onClick={() => setSearchOpen(s => !s)} title="Buscar figurita"
              className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-colors duration-300 ${darkMode ? 'bg-[#F8E4B3] text-[#3d0f04]' : 'bg-slate-800 text-white'}`}>
              🔍
            </button>
            <button onClick={toggleDarkMode}
              className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-colors duration-300 ${darkMode ? 'bg-[#F8E4B3] text-[#3d0f04]' : 'bg-slate-800 text-white'}`}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setCurrentView('home')}
              className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base transition-colors duration-300 ${darkMode ? 'bg-[#F8E4B3] text-amber-800' : 'bg-amber-700 text-white'}`}>
              HOME
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">

        {/* HOME */}
        {currentView === 'home' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <button onClick={() => setCurrentView('groups')}
              className={`rounded-3xl p-8 shadow-xl text-left active:scale-95 transition-colors duration-300 ${darkMode ? 'bg-[#6b2010] text-[#F8E4B3]' : 'bg-white'}`}>
              <div className="text-3xl font-black italic uppercase">Explorar Álbum</div>
            </button>
            <button onClick={() => setCurrentView('teams')}
              className={`rounded-3xl p-8 shadow-xl text-left active:scale-95 transition-colors duration-300 ${darkMode ? 'bg-[#6b2010] text-[#F8E4B3]' : 'bg-white'}`}>
              <div className="text-3xl font-black italic uppercase">Índice</div>
            </button>
            <button onClick={() => setShowStats(true)}
              className={`rounded-3xl p-8 shadow-xl text-left active:scale-95 transition-colors duration-300 ${darkMode ? 'bg-[#6b2010] text-[#F8E4B3]' : 'bg-white'}`}>
              <div className="text-3xl font-black italic uppercase">Estadísticas</div>
            </button>
            <button onClick={() => setCurrentView('repetidas')} className={`rounded-3xl p-6 text-left font-black text-lg cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg ${darkMode ? 'bg-[#6b2010] text-[#F8E4B3]' : 'bg-white'}`}>
              🔁<br/>
              <span className="text-2xl">REPETIDAS</span><br/>
              <span className="text-sm font-medium opacity-70">Gestioná tus figuritas repetidas</span>
            </button>
            <button onClick={() => setCurrentView('faltan')}
              className={`rounded-3xl p-8 shadow-xl text-left active:scale-95 transition-colors duration-300 ${darkMode ? 'bg-[#6b2010] text-[#F8E4B3]' : 'bg-white'}`}>
              <div className="text-3xl font-black italic uppercase">Me Faltan</div>
            </button>
            <button onClick={() => setCurrentView('otros-proyectos')}
              className={`rounded-3xl p-8 shadow-xl text-left active:scale-95 transition-colors duration-300 ${darkMode ? 'bg-[#6b2010] text-[#F8E4B3]' : 'bg-white'}`}>
              <div className="text-3xl font-black italic uppercase">Otros Proyectos</div>
            </button>
          </div>
        )}

      {/* REPETIDAS INTERACTIVO */}
      {currentView === 'repetidas' && (() => {
        const repetidasGrouped = (() => {
          const byTeam = {};
          for (const [code, value] of Object.entries(completed)) {
            if (value !== 'repeated') continue;
            const team = getTeamForCode(code);
            if (!team) continue;
            if (!byTeam[team]) byTeam[team] = [];
            byTeam[team].push(code);
          }
          return teams.filter(t => byTeam[t]).map(t => ({ team: t, info: teamData[t], codes: byTeam[t] }));
        })();
        const totalRepetidas = Object.values(completed).filter(v => v === 'repeated').length;
        const handleToggle = (code) => {
          setRepetidasSelected(prev => {
            const next = new Set(prev);
            if (next.has(code)) next.delete(code); else next.add(code);
            return next;
          });
        };
        const handleConfirmar = () => {
          if (repetidasSelected.size === 0) return;
          if (!window.confirm(`¿Marcar ${repetidasSelected.size} figurita${repetidasSelected.size !== 1 ? 's' : ''} como pegadas? Pasarán de repetidas a pegadas.`)) return;
          const newCompleted = { ...completed };
          const confirmed = [];
          for (const code of repetidasSelected) {
            if (newCompleted[code] === 'repeated') { newCompleted[code] = true; confirmed.push(code); }
          }
          setCompleted(newCompleted);
          setRepetidasPending(prev => [...prev, ...confirmed]);
          setRepetidasSelected(new Set());
        };
        const handleGuardar = async () => {
          if (repetidasPending.length === 0) return;
          if (!window.confirm(`¿Confirmar? Se guardarán ${repetidasPending.length} cambio${repetidasPending.length !== 1 ? 's' : ''}.`)) return;
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(completed));
            if (progressDocRef) await setDoc(progressDocRef, { stickers: completed });
          } catch (err) { console.error(err); }
          setRepetidasPending([]);
        };
        const handleVolver = () => {
          if (repetidasSelected.size > 0 || repetidasPending.length > 0) {
            if (!window.confirm('Tenés cambios sin guardar. ¿Salir de todas formas?')) return;
          }
          setRepetidasSelected(new Set());
          setRepetidasPending([]);
          setCurrentView('home');
        };
        return (
          <div className={`rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto transition-colors duration-300 ${darkMode ? 'bg-[#6b2010] text-white' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-black italic uppercase">Repetidas</h2>
                <div className={`text-sm font-black mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{totalRepetidas} figurita{totalRepetidas !== 1 ? 's' : ''} repetida{totalRepetidas !== 1 ? 's' : ''}</div>
              </div>
              <button onClick={() => setShowQR(true)} className="bg-purple-600 text-white px-4 py-2 rounded-xl font-black text-sm">COMPARTIR QR</button>
            </div>
            {repetidasGrouped.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🙌</div>
                <div className="font-black text-xl">¡No hay repetidas!</div>
                <div className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cuando tengas figuritas repetidas aparecerán acá.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {repetidasGrouped.map(({ team, info, codes }) => (
                  <div key={team} className={`rounded-2xl p-4 ${darkMode ? 'bg-black/20' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl leading-none">{info?.flag || '🏳️'}</span>
                      <div>
                        <div className="font-black uppercase text-sm">{info?.name || team}</div>
                        <div className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{codes.filter(c => repetidasSelected.has(c)).length} / {codes.length} sel.</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {codes.map(code => {
                        const isSelected = repetidasSelected.has(code);
                        return (
                          <button key={code} onClick={() => handleToggle(code)}
                            className={`text-xs font-black px-3 py-1.5 rounded-xl transition-all active:scale-95 ${isSelected ? 'bg-slate-400 text-white' : 'bg-slate-600 text-white'}`}>
                            {isSelected ? '✓ ' : ''}{code}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {repetidasPending.length > 0 && (
              <div className={`mt-4 p-3 rounded-xl text-sm font-black ${darkMode ? 'bg-green-900 text-green-300' : 'bg-green-50 text-green-700'}`}>
                {repetidasPending.length} cambio{repetidasPending.length !== 1 ? 's' : ''} confirmado{repetidasPending.length !== 1 ? 's' : ''} — pendiente{repetidasPending.length !== 1 ? 's' : ''} de guardar
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              {repetidasSelected.size > 0 && (
                <button onClick={handleConfirmar} className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black">
                  CONFIRMAR ({repetidasSelected.size})
                </button>
              )}
              {repetidasPending.length > 0 ? (
                <button onClick={handleGuardar} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black">
                  GUARDAR ({repetidasPending.length})
                </button>
              ) : (
                <button disabled className="bg-slate-300 text-slate-500 px-6 py-3 rounded-2xl font-black cursor-not-allowed opacity-60">
                  SIN CAMBIOS
                </button>
              )}
              <button onClick={handleVolver} className={`px-6 py-3 rounded-2xl font-black ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-800'}`}>
                ← VOLVER
              </button>
            </div>
          </div>
        );
      })()}

      {/* ME FALTAN (solo lectura) */}
      {currentView === 'faltan' && (
        <div className={`rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto transition-colors duration-300 ${darkMode ? 'bg-[#6b2010] text-white' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black italic uppercase">Me Faltan</h2>
              <div className={`text-sm font-black mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{remainingCount} figuritas faltantes</div>
            </div>
          </div>
          {faltantesGrouped.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🏆</div>
              <div className="font-black text-xl">¡Álbum completo!</div>
              <div className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Ya tenés todas las figuritas.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {faltantesGrouped.map(({ team, info, codes }) => (
                <div key={team} className={`rounded-2xl p-4 ${darkMode ? 'bg-black/20' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl leading-none">{info?.flag || '🏳️'}</span>
                    <div>
                      <div className="font-black uppercase text-sm">{info?.name || team}</div>
                      <div className={`text-[10px] uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{codes.length} falta{codes.length !== 1 ? 'n' : ''}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {codes.map(code => {
                      const name = getPlayerNameForCode(code);
                      const num  = codeToNumber[code];
                      const label = num !== undefined ? `#${num}` : code;
                      return (
                        <span key={code} className="text-xs font-black px-3 py-1.5 rounded-xl bg-slate-500 text-white">
                          {label}{name !== code ? ` · ${name}` : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => setCurrentView('home')} className={`px-6 py-3 rounded-2xl font-black ${darkMode ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-800'}`}>
              ← VOLVER
            </button>
          </div>
        </div>
      )}

        {/* OTROS PROYECTOS */}
        {currentView === 'otros-proyectos' && (
          <div className={`rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto transition-colors duration-300 ${darkMode ? 'bg-[#6b2010] text-[#F8E4B3]' : 'bg-white'}`}>
            <h2 className="text-3xl font-black italic uppercase mb-6">Otros Proyectos</h2>
            <div className="flex flex-col gap-6">
              {proyectosFiltrados.map(proyecto => {
                const progress = otrosProyectosProgress[proyecto.id];
                return (
                  <button
                    key={proyecto.id}
                    onClick={() => { window.location.href = proyecto.url; }}
                    style={getProyectoStyle(proyecto.style)}
                    className="rounded-3xl p-8 shadow-xl text-left active:scale-95 transition-transform w-full font-black"
                  >
                    <div className="text-3xl font-black italic uppercase">{proyecto.label}</div>
                    {progress === undefined ? (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', overflow: 'hidden' }} />
                        <div style={{ fontSize: 11, marginTop: 3, opacity: 0.7, textAlign: 'right' }}>cargando...</div>
                      </div>
                    ) : progress && (
                      <div style={{ marginTop: 6 }}>
                        <div style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progress.pct}%`, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                        </div>
                        <div style={{ fontSize: 11, marginTop: 3, opacity: 0.85, textAlign: 'right' }}>
                          {progress.pct}% · {progress.pegadas} pegadas
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {(() => {
              // "Colección completa" incluye este álbum (host) más los que hayan
              // cargado bien desde Firebase. El promedio es el promedio simple de
              // % de cada álbum (no ponderado por cantidad de figuritas de cada uno).
              if (Object.keys(otrosProyectosProgress).length === 0) return null;
              const otherEntries = Object.values(otrosProyectosProgress).filter(Boolean);
              const allPercents = [completionPercent, ...otherEntries.map(p => p.pct)];
              const promedio = Math.round(allPercents.reduce((sum, pct) => sum + pct, 0) / allPercents.length);
              const totalPegadas = completedCount + otherEntries.reduce((sum, p) => sum + p.pegadas, 0);
              const totalFaltantes = remainingCount + otherEntries.reduce((sum, p) => sum + (p.total - p.pegadas), 0);
              return (
                <div className={`mt-6 px-4 py-2.5 rounded-xl text-xs leading-relaxed ${darkMode ? 'bg-white/5 text-white/70' : 'bg-black/5 text-slate-600'}`}>
                  * Colección completa · {promedio}% promedio · {totalPegadas.toLocaleString()} figuritas pegadas · {totalFaltantes.toLocaleString()} faltantes
                </div>
              );
            })()}
            <button
              onClick={() => setCurrentView('home')}
              className={`mt-6 px-6 py-3 rounded-2xl font-black transition-colors duration-300 ${darkMode ? 'bg-[#3d0f04] text-[#F8E4B3]' : 'bg-gray-200 text-gray-800'}`}
            >← VOLVER</button>
          </div>
        )}

        {/* STATS SELECCIONES */}
        {currentView === 'stats-selections' && (
          <div className={`rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto transition-colors duration-300 ${darkMode ? 'bg-[#6b2010] text-[#F8E4B3]' : 'bg-white'}`}>
            <h2 className="text-3xl font-black italic uppercase mb-6">Estadísticas Selecciones</h2>
            <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
              {selectionStats.map(item => {
                const isComplete = item.completed === item.total;
                return (
                  <div key={item.key} className={`font-black text-lg sm:text-xl flex items-center gap-2 ${isComplete ? 'text-green-500' : ''}`}>
                    <span>{item.emoji} {item.name}: {item.completed} / {item.total}</span>
                    {isComplete && <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wide">Completo</span>}
                  </div>
                );
              })}
            </div>
            <button onClick={() => { setCurrentView('home'); setShowStats(true); }}
              className="mt-6 bg-amber-700 text-white px-6 py-3 rounded-2xl font-black">VOLVER</button>
          </div>
        )}

        {/* ÍNDICE */}
        {currentView === 'teams' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {teams.map(team => (
              <button key={team}
                onClick={() => { setCurrentTeamIndex(teams.indexOf(team)); setCurrentView('album'); }}
                className={`rounded-2xl p-4 shadow font-black italic active:scale-95 transition-colors duration-300 flex items-center gap-2 ${darkMode ? 'bg-[#6b2010] text-[#F8E4B3]' : 'bg-white'}`}>
                <span>{teamData[team]?.flag || '🏳️'}</span>
                <span className="truncate">{teamData[team]?.name || team}</span>
              </button>
            ))}
          </div>
        )}

        {/* GRUPOS */}
        {currentView === 'groups' && (
          <div
            className="rounded-3xl p-4 sm:p-8 pb-24 sm:pb-8 shadow-xl"
            style={{ background: 'radial-gradient(ellipse at center, #D6491F, #F8E4B3, #B92714, #F5A623, #8B1500, #FFD700, #9B3000, #D98200)' }}
          >
            <div className="hidden lg:flex justify-between items-center mb-6">
              <button onClick={() => setCurrentView('home')} className="rounded-full px-6 py-3 shadow font-bold italic bg-white text-black">HOME</button>
              <h2 className="text-3xl font-black italic uppercase text-white drop-shadow-lg">GRUPOS</h2>
              <button onClick={() => { setCurrentTeamIndex(0); setCurrentView('album'); }} className="rounded-full px-6 py-3 shadow font-bold italic bg-white text-black">SIGUIENTE →</button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button onClick={() => { setCurrentTeamIndex(teams.indexOf('INTRO')); setCurrentView('album'); }}
                className="col-span-2 rounded-2xl p-4 font-black text-2xl sm:text-3xl active:scale-95 transition-transform"
                style={{ backgroundColor: '#FFD700', color: '#3d0f04' }}>
                INTRO
              </button>

              <button onClick={() => { setCurrentTeamIndex(teams.indexOf('ESTADIOS')); setCurrentView('album'); }}
                className="rounded-2xl p-4 font-black text-2xl sm:text-3xl active:scale-95 transition-transform"
                style={{ backgroundColor: '#1a4a1a', color: '#FFD700' }}>
                ESTADIOS
              </button>

              {Object.entries(groups).map(([letter, group]) => (
                <button key={letter}
                  onClick={() => { setCurrentTeamIndex(teams.indexOf(group.teams[0])); setCurrentView('album'); }}
                  className="rounded-2xl py-2 px-3 font-black active:scale-95 transition-transform text-left flex gap-2 items-center"
                  style={{ backgroundColor: group.color, color: '#ffffff' }}>
                  <span className="text-2xl sm:text-3xl font-black leading-none shrink-0">{letter}</span>
                  <div className="flex flex-col gap-0.5 text-sm leading-tight min-w-0">
                    {group.teams.map(team => (
                      <span key={team}>{teamData[team]?.flag||'🏳️'} {teamData[team]?.name||team}</span>
                    ))}
                  </div>
                </button>
              ))}

              <button onClick={() => { setCurrentTeamIndex(teams.indexOf('FINAL')); setCurrentView('album'); }}
                className="col-span-2 rounded-2xl p-4 font-black text-2xl sm:text-3xl active:scale-95 transition-transform"
                style={{ backgroundColor: '#B8860B', color: '#FFD700' }}>
                FINAL
              </button>
            </div>
          </div>
        )}

        {/* GRUPOS — mobile bottom nav */}
        {currentView === 'groups' && (
          <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg transition-colors duration-300 ${darkMode ? 'bg-[#5a1a08] border-[#6b2010]' : 'bg-white border-slate-200'}`}>
            <div className="flex">
              <button onClick={() => setCurrentView('home')}
                className={`flex-1 py-4 font-black italic text-sm border-r active:bg-slate-100 transition-colors ${darkMode ? 'border-[#6b2010] text-[#F8E4B3]' : 'border-slate-200'}`}>HOME</button>
              <div className={`flex-1 border-r ${darkMode ? 'border-[#6b2010]' : 'border-slate-200'}`} />
              <button onClick={() => { setCurrentTeamIndex(0); setCurrentView('album'); }}
                className={`flex-1 py-4 font-black italic text-sm active:bg-slate-100 transition-colors ${darkMode ? 'text-[#F8E4B3]' : ''}`}>SIGUIENTE →</button>
            </div>
          </div>
        )}

        {/* ÁLBUM */}
        {currentView === 'album' && (
          <AlbumPage
            currentTeam={currentTeam}
            currentTeamInfo={currentTeamInfo}
            stickers={stickers}
            stickerCount={stickerCount}
            currentTeamCompleted={currentTeamCompleted}
            darkMode={darkMode}
            toggleSticker={toggleSticker}
            justPastedCode={justPastedCode}
            highlightCode={highlightCode}
            teamGroups={teamGroups}
            groups={groups}
            teamData={teamData}
            onPrev={() => currentTeam === teams[0] ? setCurrentView('groups') : prevTeam()}
            onNext={nextTeam}
            onIndex={() => setCurrentView('teams')}
          />
        )}

        {/* ÁLBUM — mobile bottom nav */}
        {currentView === 'album' && (
          <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t shadow-lg transition-colors duration-300 ${darkMode ? 'bg-[#5a1a08] border-[#6b2010]' : 'bg-white border-slate-200'}`}>
            <div className="flex">
              <button onClick={() => currentTeam === teams[0] ? setCurrentView('groups') : prevTeam()}
                className={`flex-1 py-4 font-black italic text-sm border-r active:bg-slate-100 transition-colors ${darkMode ? 'border-[#6b2010] text-[#F8E4B3]' : 'border-slate-200'}`}>← ANTERIOR</button>
              <button onClick={() => setCurrentView('teams')}
                className={`flex-1 py-4 font-black uppercase text-sm border-r active:bg-slate-100 transition-colors ${darkMode ? 'border-[#6b2010] text-[#F8E4B3]' : 'border-slate-200'}`}>ÍNDICE</button>
              <button onClick={nextTeam}
                className={`flex-1 py-4 font-black italic text-sm active:bg-slate-100 transition-colors ${darkMode ? 'text-[#F8E4B3]' : ''}`}>
                {currentTeam === albumConfig.lastSectionCode ? 'HOME' : 'SIGUIENTE →'}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ── MODALES ── */}
      {showStats && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className={`rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-md transition-colors duration-300 ${darkMode ? 'bg-[#6b2010] text-[#F8E4B3]' : 'bg-white'}`}>
            <h3 className="text-2xl font-black italic uppercase mb-6">Estadísticas</h3>
            <div className="space-y-3 font-black">
              <div>Figuritas completadas: {completedCount} / {TOTAL_STICKERS}</div>
              <div>
                <div className="flex justify-between mb-1"><span>Progreso</span><span>{completionPercent}%</span></div>
                <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-[#3d0f04]' : 'bg-slate-200'}`}>
                  <div className="bg-amber-500 h-3 rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
                </div>
              </div>
              <div>Me faltan: {remainingCount}</div>
              <div>Brillantes: {brilliantCompletedCount} / {brilliantTotal}</div>
              <div>Repetidas: {repeatedCount}</div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={handleExport} className="bg-green-600 text-white px-6 py-3 rounded-2xl font-black">EXPORTAR</button>
              <label className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black cursor-pointer">
                IMPORTAR
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
              {importMessage && <span className="w-full text-green-600 font-black">{importMessage}</span>}
            </div>
            <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-[#3d0f04]' : 'border-slate-200'} flex flex-wrap gap-3`}>
              <button onClick={() => { setShowStats(false); setCurrentView('stats-selections'); }}
                className="bg-amber-700 text-white px-6 py-3 rounded-2xl font-black">Estadísticas Selecciones</button>
              <button onClick={handleMarkProgress}
                className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-black">Marcar Progreso</button>
              <button onClick={() => { setShowStats(false); setShowProgressHistory(true); }}
                className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-black">Ver Progreso</button>
              {progressMessage && <span className="w-full text-green-400 font-black">{progressMessage}</span>}
              <button onClick={() => setShowStats(false)}
                className={`px-6 py-3 rounded-2xl font-black ${darkMode ? 'bg-[#3d0f04] text-[#F8E4B3]' : 'bg-slate-300 text-slate-800'}`}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showProgressHistory && (
        <ProgressHistoryModal
          history={progressHistory}
          darkMode={darkMode}
          onClose={() => setShowProgressHistory(false)}
        />
      )}

      {showQR      && <QRModal onClose={() => setShowQR(false)} />}
      {celebration && <CelebrationModal celebration={celebration} teamData={teamData} teamThemes={teamThemes} getThemeKey={getThemeKey} getTeamConfettiColors={getTeamConfettiColors} onClose={() => setCelebration(null)} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// AlbumPage — vista de selección/sección
// ═══════════════════════════════════════════════════════════════════════════════
function AlbumPage({ currentTeam, currentTeamInfo, stickers, stickerCount, currentTeamCompleted,
  darkMode, toggleSticker, justPastedCode, highlightCode, teamGroups, groups, teamData,
  onPrev, onNext, onIndex }) {

  const isSpecial  = currentTeam in albumConfig.specialSections;
  const isDarkTeam = isTeamDark(currentTeam);

  const titleColor = isDarkTeam || isSpecial ? 'text-white drop-shadow-lg' : 'text-slate-800';

  return (
    <div className={`rounded-3xl px-4 pt-4 pb-24 sm:px-8 sm:pt-8 sm:pb-8 shadow-xl ${getTeamGradientClass(currentTeam)}`}>

      {/* Desktop nav */}
      <div className="hidden lg:flex justify-between items-center mb-8 gap-4">
        <button onClick={onPrev}
          className={`rounded-full px-6 py-3 shadow font-bold italic transition-colors duration-300 ${darkMode ? 'bg-[#5a1a08] text-[#F8E4B3] border border-[#6b2010]' : 'bg-white text-black'}`}>
          ← ANTERIOR
        </button>
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <h2 className={`text-3xl sm:text-5xl font-black italic uppercase break-words ${titleColor}`}>
              {currentTeamInfo.name}
            </h2>
            <button onClick={onIndex}
              className="bg-amber-700 text-white px-4 py-2 rounded-2xl font-black uppercase text-lg sm:text-2xl leading-none">
              INDICE
            </button>
          </div>
          <div className={`mt-2 text-sm uppercase tracking-[0.25em] ${isDarkTeam || isSpecial ? 'text-white/80' : 'text-slate-500'}`}>
            {currentTeamInfo.federation}
          </div>
          <div className={`mt-3 text-2xl font-black ${isDarkTeam || isSpecial ? 'text-white' : 'text-amber-700'}`}>
            {currentTeamCompleted}/{stickerCount}
          </div>
        </div>
        <button onClick={onNext}
          className={`rounded-full px-6 py-3 shadow font-bold italic transition-colors duration-300 ${darkMode ? 'bg-[#5a1a08] text-[#F8E4B3] border border-[#6b2010]' : 'bg-white text-black'}`}>
          {currentTeam === albumConfig.lastSectionCode ? 'HOME' : 'SIGUIENTE →'}
        </button>
      </div>

      {/* Mobile strip */}
      <div className="lg:hidden flex items-center gap-3 mb-4 px-3 py-2 bg-black/20 rounded-2xl">
        <span className="text-3xl leading-none">{currentTeamInfo.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="font-black italic uppercase text-base leading-none text-white truncate">
            {currentTeamInfo.name}
          </div>
          <div className="text-[10px] text-white/75 uppercase tracking-widest mt-0.5 truncate">
            {currentTeamInfo.federation}
          </div>
        </div>
        <div className="font-black text-sm text-white/90 shrink-0">{currentTeamCompleted}/{stickerCount}</div>
      </div>

      {/* Inner panel */}
      <div className={`overflow-hidden rounded-[2rem] border-4 transition-colors duration-300 ${darkMode ? 'border-[#6b2010] bg-[#6b2010]' : 'border-slate-200 bg-white'} grid lg:grid-cols-2`}>
        {currentTeam === 'INTRO' ? (
          <INTROPanel stickers={stickers} currentTeam={currentTeam} currentTeamInfo={currentTeamInfo}
            darkMode={darkMode} toggleSticker={toggleSticker} justPastedCode={justPastedCode} highlightCode={highlightCode} />
        ) : currentTeam === 'ESTADIOS' ? (
          <EstadiosPanel stickers={stickers} currentTeam={currentTeam}
            darkMode={darkMode} toggleSticker={toggleSticker} justPastedCode={justPastedCode} highlightCode={highlightCode} />
        ) : currentTeam === 'FINAL' ? (
          <FinalPanel stickers={stickers} currentTeam={currentTeam}
            darkMode={darkMode} toggleSticker={toggleSticker} justPastedCode={justPastedCode} highlightCode={highlightCode} />
        ) : (
          <TeamPanel stickers={stickers} currentTeam={currentTeam} currentTeamInfo={currentTeamInfo}
            darkMode={darkMode} toggleSticker={toggleSticker} justPastedCode={justPastedCode} highlightCode={highlightCode}
            teamGroups={teamGroups} groups={groups} teamData={teamData} />
        )}
      </div>
    </div>
  );
}

// ── INTRO Panel ───────────────────────────────────────────────────────────────
function INTROPanel({ stickers, currentTeam, currentTeamInfo, darkMode, toggleSticker, justPastedCode, highlightCode }) {
  const bgClass = getInnerPanelClass(currentTeam, darkMode);
  return (
    <>
      {/* Mobile: todos en grid */}
      <div className={`lg:hidden p-3 col-span-2 ${bgClass}`}>
        <div className="grid grid-cols-4 gap-2">
          {stickers.map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
        </div>
      </div>
      {/* Desktop izquierda: título + PANINI + FIFA */}
      <div className={`hidden lg:block p-8 border-r transition-colors duration-300 ${darkMode?'border-[#6b2010]':'border-slate-300'} ${bgClass}`}>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-2">
            <div className="text-4xl font-black uppercase leading-none mb-4 text-white">{currentTeamInfo.name}</div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-6xl">{currentTeamInfo.flag}</div>
              <div className="font-black uppercase text-sm leading-tight text-white/80">{currentTeamInfo.federation}</div>
            </div>
          </div>
          {stickers.slice(0, 2).map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
        </div>
      </div>
      {/* Desktop derecha: INTRO1–INTRO5 */}
      <div className={`hidden lg:block p-8 ${bgClass}`}>
        <div className="grid grid-cols-4 gap-4">
          {stickers.slice(2).map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
        </div>
      </div>
    </>
  );
}

// ── Estadios Panel ────────────────────────────────────────────────────────────
function EstadiosPanel({ stickers, currentTeam, darkMode, toggleSticker, justPastedCode, highlightCode }) {
  const bgClass = getInnerPanelClass(currentTeam, darkMode);
  const half    = Math.ceil(stickers.length / 4) * 2; // split in pairs
  return (
    <>
      {/* Mobile */}
      <div className={`lg:hidden col-span-2 p-3 ${bgClass}`}>
        <div className="text-2xl font-black uppercase text-white mb-3">ESTADIOS</div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({length: stickers.length / 2}, (_, i) => {
            const s1 = stickers[i * 2];
            const s2 = stickers[i * 2 + 1];
            return (
              <div key={s1.code} className="col-span-2 flex gap-1">
                <div className="flex-1 min-w-0">
                  <Sticker sticker={s1} currentTeam={currentTeam} onToggle={toggleSticker}
                    darkMode={darkMode} justPasted={justPastedCode===s1.code} highlighted={highlightCode===s1.code} />
                </div>
                <div className="flex-1 min-w-0">
                  <Sticker sticker={s2} currentTeam={currentTeam} onToggle={toggleSticker}
                    darkMode={darkMode} justPasted={justPastedCode===s2.code} highlighted={highlightCode===s2.code} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Desktop izquierda */}
      <div className={`hidden lg:block p-8 border-r transition-colors duration-300 ${darkMode?'border-[#6b2010]':'border-slate-300'} ${bgClass}`}>
        <div className="text-4xl font-black uppercase text-white mb-6">ESTADIOS</div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({length: half / 2}, (_, i) => {
            const s1 = stickers[i * 2];
            const s2 = stickers[i * 2 + 1];
            return (
              <div key={s1.code} className="col-span-2 flex gap-2">
                <div className="flex-1 min-w-0">
                  <Sticker sticker={s1} currentTeam={currentTeam} onToggle={toggleSticker}
                    darkMode={darkMode} justPasted={justPastedCode===s1.code} highlighted={highlightCode===s1.code} />
                </div>
                <div className="flex-1 min-w-0">
                  <Sticker sticker={s2} currentTeam={currentTeam} onToggle={toggleSticker}
                    darkMode={darkMode} justPasted={justPastedCode===s2.code} highlighted={highlightCode===s2.code} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Desktop derecha */}
      <div className={`hidden lg:block p-8 ${bgClass}`}>
        <div className="grid grid-cols-4 gap-4 mt-[4.5rem]">
          {Array.from({length: (stickers.length - half) / 2}, (_, i) => {
            const s1 = stickers[half + i * 2];
            const s2 = stickers[half + i * 2 + 1];
            return (
              <div key={s1.code} className="col-span-2 flex gap-2">
                <div className="flex-1 min-w-0">
                  <Sticker sticker={s1} currentTeam={currentTeam} onToggle={toggleSticker}
                    darkMode={darkMode} justPasted={justPastedCode===s1.code} highlighted={highlightCode===s1.code} />
                </div>
                <div className="flex-1 min-w-0">
                  <Sticker sticker={s2} currentTeam={currentTeam} onToggle={toggleSticker}
                    darkMode={darkMode} justPasted={justPastedCode===s2.code} highlighted={highlightCode===s2.code} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// ── Final Panel ───────────────────────────────────────────────────────────────
function FinalPanel({ stickers, currentTeam, darkMode, toggleSticker, justPastedCode, highlightCode }) {
  const bgClass = getInnerPanelClass(currentTeam, darkMode);
  return (
    <>
      {/* Mobile */}
      <div className={`lg:hidden col-span-2 p-3 ${bgClass}`}>
        <div className="text-2xl font-black uppercase text-yellow-400 mb-3">FINAL</div>
        <div className="grid grid-cols-4 gap-2">
          {stickers.map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
        </div>
      </div>
      {/* Desktop izquierda */}
      <div className={`hidden lg:block p-8 border-r transition-colors duration-300 ${darkMode?'border-[#6b2010]':'border-yellow-600'} ${bgClass}`}>
        <div className="text-4xl font-black uppercase text-yellow-400 mb-6">FINAL</div>
        <div className="grid grid-cols-4 gap-4">
          {stickers.map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
        </div>
      </div>
      {/* Desktop derecha — vacío */}
      <div className={`hidden lg:block p-8 ${bgClass}`} />
    </>
  );
}

// ── Team Panel ────────────────────────────────────────────────────────────────
function TeamPanel({ stickers, currentTeam, currentTeamInfo, darkMode, toggleSticker, justPastedCode,
  highlightCode, teamGroups, groups, teamData }) {

  const bgClass = getInnerPanelClass(currentTeam, darkMode);

  const GroupBox = () => {
    if (!teamGroups[currentTeam]) return null;
    const grpKey      = teamGroups[currentTeam].group;
    const grpTeams    = groups[grpKey]?.teams || [];
    const currentIdxInGroup = grpTeams.indexOf(currentTeam);
    const grpColor    = groups[grpKey]?.color || '#475569';
    return (
      <div className="border-2 rounded-2xl p-2 flex flex-col justify-center"
        style={darkMode ? {backgroundColor:'#3d0f04',borderColor:'#6b2010'} : {backgroundColor:'rgba(255,255,255,0.6)',borderColor:'#cbd5e1'}}>
        <div className="font-black uppercase text-[11px] mb-1.5 tracking-widest text-center"
          style={{ color: darkMode ? '#F8E4B3' : grpColor }}>
          GRUPO {grpKey}
        </div>
        <div className="flex flex-col gap-0.5">
          {teamGroups[currentTeam].members.map((member, i) => {
            const isCurrent = i === currentIdxInGroup;
            const flag      = teamData[grpTeams[i]]?.flag || '';
            return (
              <div key={i} className={`text-[9px] font-black uppercase leading-tight px-1.5 py-0.5 rounded flex items-center gap-1 ${
                isCurrent ? (darkMode?'bg-[#F8E4B3] text-[#3d0f04]':'bg-black text-white') : (darkMode?'text-amber-300':'text-slate-700')
              }`}>
                <span>{flag}</span><span>{member}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile */}
      <div className={`lg:hidden col-span-2 p-3 ${bgClass}`}>
        <div className="grid grid-cols-4 gap-2">
          {stickers.map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
          {teamGroups[currentTeam] && (
            <div className="col-span-3"><GroupBox /></div>
          )}
        </div>
      </div>

      {/* Desktop izquierda */}
      <div className={`p-3 sm:p-8 border-b lg:border-b-0 lg:border-r transition-colors duration-300 ${darkMode?'border-[#6b2010]':'border-slate-300'} ${bgClass} hidden lg:block`}>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <div className="col-span-2 hidden lg:block">
            <div className="text-3xl sm:text-5xl font-black uppercase leading-none mb-4 break-words">
              {currentTeamInfo.name}
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 text-center sm:text-left">
              <div className="text-5xl sm:text-6xl">{currentTeamInfo.flag}</div>
              <div className="font-black uppercase text-[10px] sm:text-sm leading-tight max-w-[180px]">
                {currentTeamInfo.federation}
              </div>
            </div>
          </div>
          {/* Figuritas 1–10 (foto equipo + escudo + jugadores 3-10) */}
          {stickers.slice(0, 10).map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
        </div>
      </div>

      {/* Desktop derecha */}
      <div className={`p-3 sm:p-8 ${bgClass} hidden lg:block`}>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {stickers.slice(10).map(s => (
            <Sticker key={s.code} sticker={s} currentTeam={currentTeam} onToggle={toggleSticker}
              darkMode={darkMode} justPasted={justPastedCode===s.code} highlighted={highlightCode===s.code} />
          ))}
          {teamGroups[currentTeam] && <GroupBox />}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Sticker component
// ═══════════════════════════════════════════════════════════════════════════════
function Sticker({ sticker, onToggle, currentTeam, darkMode = false, justPasted = false, highlighted = false }) {
  const isPlayerSticker    = sticker.type === 'player';
  const isBrillanteSticker = sticker.type === 'brillante';
  const isPaniniSticker    = sticker.type === 'panini';

  const decorColor = sticker.repeated ? '#94a3b8' : sticker.completed ? '#4ade80' : '#cbd5e1';
  const brillDecoColor = sticker.repeated ? '#94a3b8' : sticker.completed ? '#4ade80' : '#facc15';

  const svgStyle = { position:'absolute', top:'6%', left:'20%', width:'60%', opacity:0.5, pointerEvents:'none', zIndex:0 };

  const repeatedBg  = darkMode ? 'bg-slate-300 border-slate-400' : 'bg-slate-500 border-slate-500';
  const emptyBg     = darkMode ? 'bg-[#3d0f04] border-slate-600' : 'bg-white border-slate-300';
  const completedBg = darkMode ? 'bg-green-900 border-green-500' : 'bg-green-100 border-green-500';

  const brillanteEmptyBg     = darkMode ? 'border-yellow-500 bg-gradient-to-br from-yellow-900 to-amber-800' : 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-100';
  const brillanteCompletedBg = darkMode ? 'bg-green-900 border-yellow-400' : 'bg-green-100 border-yellow-400';

  const repeatedCodeClass  = darkMode ? 'text-slate-700 font-extrabold' : 'text-slate-100 font-extrabold';
  const repeatedLabelClass = darkMode ? 'text-slate-800 font-extrabold' : 'text-slate-100';

  const paniniStyle = isPaniniSticker && !sticker.repeated ? {
    background: 'linear-gradient(135deg, #c0c0c0, #f8f8f8, #a8a8a8, #e8e8e8, #c0c0c0)',
    borderColor: '#a0a0a0'
  } : undefined;

  const animClass = justPasted ? 'sticker-paste' : highlighted ? 'sticker-pulse' : '';

  const stickerNum = codeToNumber[sticker.code];
  const displayNum = stickerNum !== undefined ? String(stickerNum) : sticker.code;

  const getBgClass = () => {
    if (sticker.repeated) return repeatedBg;
    if (isPaniniSticker)  return '';
    if (isBrillanteSticker) return sticker.completed ? brillanteCompletedBg : brillanteEmptyBg;
    return sticker.completed ? completedBg : emptyBg;
  };

  return (
    <button
      onClick={() => onToggle(sticker.code)}
      style={paniniStyle}
      className={`relative border-2 rounded-xl sm:rounded-2xl p-2 sm:p-4 w-full flex items-center justify-center text-center transition active:opacity-60 aspect-[2/3] overflow-hidden ${getBgClass()} ${sticker.completed || sticker.repeated ? 'border-[4px] scale-[1.02]' : (isBrillanteSticker ? 'border-2' : 'border-2')} ${animClass}`}
    >
      {isPlayerSticker && (
        <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={svgStyle}>
          <circle cx="50" cy="35" r="22" fill={decorColor} />
          <path d="M 50 57 C 28 57 10 75 10 120 L 90 120 C 90 75 72 57 50 57 Z" fill={decorColor} />
        </svg>
      )}
      {isBrillanteSticker && (
        <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={svgStyle}>
          <path d="M 10 10 L 90 10 L 90 65 Q 90 105 50 118 Q 10 105 10 65 Z" fill={brillDecoColor} />
        </svg>
      )}
      <div style={{ position:'relative', zIndex:1 }}>
        <div className={`text-[9px] sm:text-xs uppercase break-all ${sticker.repeated ? repeatedCodeClass : sticker.completed ? 'text-black font-extrabold' : (isBrillanteSticker ? 'text-amber-600 font-black' : 'text-slate-400 font-black')}`}>
          {displayNum}
        </div>
        <div className={`italic uppercase text-[10px] sm:text-sm mt-1 leading-tight ${sticker.completed||sticker.repeated ? 'font-extrabold' : 'font-black'} ${
          sticker.repeated ? repeatedLabelClass : ''
        }`}>
          {sticker.label}
        </div>
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QRModal
// ═══════════════════════════════════════════════════════════════════════════════
function QRModal({ onClose }) {
  const qrRef = useRef(null);
  const url   = window.location.origin + window.location.pathname + '?view=repetidas';

  useEffect(() => {
    if (qrRef.current && window.QRCode) {
      new window.QRCode(qrRef.current, { text: url, width: 200, height: 200 });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-xs w-full">
        <h3 className="text-lg font-black italic uppercase">Figuritas Repetidas</h3>
        <div ref={qrRef} />
        <p className="text-xs text-slate-400 text-center break-all">{url}</p>
        <button onClick={onClose} className="bg-amber-700 text-white px-6 py-3 rounded-2xl font-black w-full">Cerrar</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ProgressHistoryModal
// ═══════════════════════════════════════════════════════════════════════════════
function ProgressHistoryModal({ history, darkMode, onClose }) {
  const rows = [...history].sort((a, b) => (a.timestamp ?? 0) - (b.timestamp ?? 0));
  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className={`rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl transition-colors duration-300 ${darkMode ? 'bg-[#6b2010] text-[#F8E4B3]' : 'bg-white'}`}>
        <h3 className="text-2xl font-black italic uppercase mb-6">Ver Progreso</h3>
        {rows.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📊</div>
            <div className="font-black text-xl">Todavía no hay registros de progreso</div>
            <div className={`mt-2 text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Usá "Marcar Progreso" para guardar una foto de tu avance.
            </div>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-auto rounded-2xl border border-slate-300/30">
            <table className="w-full text-sm">
              <thead className={`sticky top-0 ${darkMode ? 'bg-[#3d0f04]' : 'bg-slate-100'}`}>
                <tr className="text-left font-black uppercase text-xs">
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Hora</th>
                  <th className="px-3 py-2 text-right">% Completado</th>
                  <th className="px-3 py-2 text-right">% Faltante</th>
                  <th className="px-3 py-2 text-right">Pegadas</th>
                  <th className="px-3 py-2 text-right">Faltantes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry) => {
                  const [fecha, hora] = (entry.dateLabel || '').split(' ');
                  return (
                    <tr key={entry.id ?? entry.dateLabel} className={`border-t ${darkMode ? 'border-[#3d0f04]' : 'border-slate-200'}`}>
                      <td className="px-3 py-2 font-black whitespace-nowrap">{fecha}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{hora}</td>
                      <td className="px-3 py-2 text-right">{entry.percentCompleted}%</td>
                      <td className="px-3 py-2 text-right">{entry.percentRemaining}%</td>
                      <td className="px-3 py-2 text-right">{entry.completedCount}</td>
                      <td className="px-3 py-2 text-right">{entry.remainingCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={onClose}
            className={`px-6 py-3 rounded-2xl font-black ${darkMode ? 'bg-[#3d0f04] text-[#F8E4B3]' : 'bg-slate-300 text-slate-800'}`}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RepeatidasView
// ═══════════════════════════════════════════════════════════════════════════════
function getPlayerNameForCode(code) {
  for (const [, section] of Object.entries(albumConfig.specialSections)) {
    if (section.stickers) {
      const def = section.stickers.find(s => s.code === code);
      if (def) return def.repetidasLabel ?? def.label;
    } else {
      if (code.startsWith(section.codePrefix)) {
        const num = parseInt(code.slice(section.codePrefix.length));
        if (num >= section.codeStart && num < section.codeStart + section.count) {
          const i = num - section.codeStart;
          if (section.playerNamesKey) return playerNames[section.playerNamesKey]?.[i] || code;
          return section.getLabel(i + 1);
        }
      }
    }
  }
  const team = getTeamForCode(code);
  if (team) {
    const m = code.match(/^[A-Z]+(\d+)$/);
    if (m) {
      const id = parseInt(m[1]);
      return playerNames[team]?.[id - 1] || `Jugador ${id}`;
    }
  }
  return code;
}

function RepeatidasView() {
  const [stickerData, setStickerData] = useState(null);

  useEffect(() => {
    const loadFromLocal = () => {
      try {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        setStickerData(local ? JSON.parse(local) : {});
      } catch { setStickerData({}); }
    };

    const load = async () => {
      try {
        if (progressDocRef) {
          const snap = await getDoc(progressDocRef);
          if (snap.exists()) { setStickerData(snap.data()?.stickers || {}); return; }
        }
        loadFromLocal();
      } catch { loadFromLocal(); }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    if (!stickerData) return [];
    const byTeam = {};
    for (const [code, value] of Object.entries(stickerData)) {
      if (value !== 'repeated') continue;
      const team = getTeamForCode(code);
      if (!team) continue;
      if (!byTeam[team]) byTeam[team] = [];
      byTeam[team].push(code);
    }
    return teams.filter(t => byTeam[t]).map(t => ({ team:t, info:teamData[t], codes:byTeam[t] }));
  }, [stickerData]);

  if (!stickerData) {
    return (
      <div className="min-h-screen bg-[#D6491F] flex items-center justify-center">
        <div className="text-white font-black text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D6491F]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-lg font-black italic uppercase text-slate-800">Figuritas repetidas de {ALBUM_OWNER}</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{albumConfig.repetidasSubtitle}</p>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        {grouped.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-800">
            <div className="text-4xl mb-3">🙌</div>
            <div className="font-black text-xl">¡No hay repetidas!</div>
            <div className="text-slate-500 mt-2 text-sm">Cuando tengas figuritas repetidas aparecerán acá.</div>
          </div>
        ) : grouped.map(({ team, info, codes }) => (
          <div key={team} className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl leading-none">{info?.flag||'🏳️'}</span>
              <div>
                <div className="font-black uppercase text-sm text-slate-800">{info?.name||team}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{codes.length} repetida{codes.length!==1?'s':''}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {codes.map(code => {
                const name = getPlayerNameForCode(code);
                const num  = codeToNumber[code];
                const label = num !== undefined ? `#${num}` : code;
                return (
                  <span key={code} className="bg-slate-500 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                    {label}{name !== code ? ` · ${name}` : ''}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FaltanView
// ═══════════════════════════════════════════════════════════════════════════════
function FaltanView() {
  const [stickerData, setStickerData] = useState(null);

  useEffect(() => {
    const loadFromLocal = () => {
      try {
        const local = localStorage.getItem(LOCAL_STORAGE_KEY);
        setStickerData(local ? JSON.parse(local) : {});
      } catch { setStickerData({}); }
    };

    const load = async () => {
      try {
        if (progressDocRef) {
          const snap = await getDoc(progressDocRef);
          if (snap.exists()) { setStickerData(snap.data()?.stickers || {}); return; }
        }
        loadFromLocal();
      } catch { loadFromLocal(); }
    };
    load();
  }, []);

  const isCompletedSticker = (v) => v === true || v === 'repeated';

  const grouped = useMemo(() => {
    if (!stickerData) return [];
    const byTeam = {};
    for (const team of teams) {
      const missing = getTeamCodes(team).filter((code) => !isCompletedSticker(stickerData[code]));
      if (missing.length) byTeam[team] = missing;
    }
    return teams.filter(t => byTeam[t]).map(t => ({ team: t, info: teamData[t], codes: byTeam[t] }));
  }, [stickerData]);

  if (!stickerData) {
    return (
      <div className="min-h-screen bg-[#D6491F] flex items-center justify-center">
        <div className="text-white font-black text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D6491F]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-lg font-black italic uppercase text-slate-800">Figuritas que le faltan a {ALBUM_OWNER}</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{albumConfig.repetidasSubtitle}</p>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-5 space-y-3">
        {grouped.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center text-slate-800">
            <div className="text-4xl mb-3">🏆</div>
            <div className="font-black text-xl">¡Álbum completo!</div>
            <div className="text-slate-500 mt-2 text-sm">Ya tiene todas las figuritas.</div>
          </div>
        ) : grouped.map(({ team, info, codes }) => (
          <div key={team} className="bg-white rounded-2xl p-4 shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl leading-none">{info?.flag||'🏳️'}</span>
              <div>
                <div className="font-black uppercase text-sm text-slate-800">{info?.name||team}</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">{codes.length} falta{codes.length!==1?'n':''}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {codes.map(code => {
                const name = getPlayerNameForCode(code);
                const num  = codeToNumber[code];
                const label = num !== undefined ? `#${num}` : code;
                return (
                  <span key={code} className="bg-slate-500 text-white text-xs font-black px-2.5 py-1 rounded-lg">
                    {label}{name !== code ? ` · ${name}` : ''}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Confetti + CelebrationModal
// ═══════════════════════════════════════════════════════════════════════════════
function Confetti({ colors }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width  = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    const particles = Array.from({length:120}, () => ({
      x: Math.random()*W, y: -10-Math.random()*220,
      w: 7+Math.random()*10, h: 3+Math.random()*6,
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: Math.random()*Math.PI*2, rotSpeed: (Math.random()-0.5)*0.13,
      vx: (Math.random()-0.5)*3.5, vy: 2.5+Math.random()*3.5, alpha:1,
    }));
    let raf; const t0 = Date.now();
    const draw = () => {
      ctx.clearRect(0,0,W,H);
      const elapsed = Date.now()-t0;
      let alive = false;
      for (const p of particles) {
        p.x+=p.vx; p.y+=p.vy; p.rot+=p.rotSpeed;
        if (elapsed>1800) p.alpha=Math.max(0,p.alpha-0.016);
        if (p.alpha>0&&p.y<H+20) alive=true;
        ctx.save(); ctx.globalAlpha=p.alpha; ctx.translate(p.x,p.y); ctx.rotate(p.rot);
        ctx.fillStyle=p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
      }
      if (alive) raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{position:'fixed',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:190}} />;
}

function CelebrationModal({ celebration, teamData, teamThemes, getThemeKey, getTeamConfettiColors, onClose }) {
  const isAlbum   = celebration.type === 'album';
  const team      = celebration.team;
  const teamInfo  = team ? teamData[team] : null;
  const themeKey  = team ? getThemeKey(team) : null;
  const theme     = themeKey ? teamThemes[themeKey] : null;

  const gradientClass = isAlbum
    ? 'from-yellow-400 via-amber-500 to-red-700'
    : theme?.gradient || 'from-amber-500 to-yellow-600';

  const confettiColors = isAlbum
    ? ['#FFD700','#D6491F','#F8E4B3','#B92714','#ffffff']
    : getTeamConfettiColors(team);

  const isDark = isAlbum || theme?.dark;

  return (
    <div className="fixed inset-0 z-[160]">
      <Confetti colors={confettiColors} />
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className={`celebrate-card bg-gradient-to-br ${gradientClass} rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center`}
          onClick={e => e.stopPropagation()}
        >
          <div className="text-7xl mb-4 drop-shadow-lg select-none">{isAlbum ? '🏆' : teamInfo?.flag || '🏅'}</div>
          <div className={`text-4xl font-black italic uppercase mb-2 drop-shadow ${isDark ? 'text-white' : 'text-slate-800'}`}>¡Felicitaciones!</div>
          <div className={`text-xl font-black mb-8 ${isDark ? 'text-white/90' : 'text-slate-700'}`}>
            {isAlbum ? '¡Completaste el álbum!' : `¡Completaste ${teamInfo?.name || team}!`}
          </div>
          <button onClick={onClose}
            className={`px-10 py-4 rounded-2xl font-black text-xl shadow-lg active:scale-95 transition-transform ${isDark ? 'bg-white text-slate-800 hover:bg-slate-100' : 'bg-slate-800 text-white hover:bg-slate-700'}`}>
            ¡Gracias! 🎉
          </button>
        </div>
      </div>
    </div>
  );
}
