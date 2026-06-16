// Álbum Virtual — FIFA World Cup South Africa 2010

export const albumConfig = {

  // ── Identidad y almacenamiento ───────────────────────────────────────────────
  id: 'paniniSouthAfrica2010',
  owner: 'Facundo',
  title: 'ÁLBUM VIRTUAL SUDÁFRICA 2010',
  subtitle: 'FIFA WORLD CUP · SOUTH AFRICA',
  repetidasSubtitle: 'FIFA World Cup 2010 · Sudáfrica',
  exportFileName: 'panini2010_backup.json',

  // ── Conteo de figuritas ──────────────────────────────────────────────────────
  teamStickerCount: 19,   // figuritas por equipo (1 foto equipo + 1 escudo + 17 jugadores)
  totalStickers: 640,     // total incluyendo PANINI y FIFA
  promoCodePrefix: '__NONE__',  // sin sección promo en este álbum

  // ── Navegación ───────────────────────────────────────────────────────────────
  lastSectionCode: 'FINAL',

  // ── Figuritas brillantes especiales ──────────────────────────────────────────
  // Escudos: figurita 2 de cada equipo competidor (RSA2, MEX2, ..., CHI2)
  // Especiales: PANINI, FIFA, INTRO1-5, EXTRA4, FINAL1
  brillanteSpecialCodes: ['PANINI', 'FIFA', 'INTRO1', 'INTRO2', 'INTRO3', 'INTRO4', 'INTRO5', 'EXTRA4', 'FINAL1'],

  // ── Secciones especiales ─────────────────────────────────────────────────────
  specialSections: {
    INTRO: {
      count: 7,
      stickers: [
        { code: 'PANINI', label: 'PANINI',                  repetidasLabel: 'PANINI', type: 'panini',    horizontal: false },
        { code: 'FIFA',   label: 'Logo FIFA',               repetidasLabel: 'FIFA',   type: 'brillante', horizontal: false },
        { code: 'INTRO1', label: 'Trofeo Copa del Mundo',   repetidasLabel: 'INTRO1', type: 'brillante', horizontal: false },
        { code: 'INTRO2', label: 'Logotipo Oficial',        repetidasLabel: 'INTRO2', type: 'brillante', horizontal: false },
        { code: 'INTRO3', label: 'Logotipo Oficial',        repetidasLabel: 'INTRO3', type: 'brillante', horizontal: false },
        { code: 'INTRO4', label: 'Emblema Oficial',         repetidasLabel: 'INTRO4', type: 'brillante', horizontal: false },
        { code: 'INTRO5', label: 'Balón Oficial Jabulani',  repetidasLabel: 'INTRO5', type: 'brillante', horizontal: false },
      ],
    },
    ESTADIOS: {
      count: 20,
      stickers: [
        { code: 'EST1',  label: 'Cape Town · Green Point Stadium',         repetidasLabel: 'EST1',  type: 'estadio', horizontal: false, pair: true },
        { code: 'EST2',  label: 'Cape Town · Green Point Stadium',         repetidasLabel: 'EST2',  type: 'estadio', horizontal: false, pair: true },
        { code: 'EST3',  label: 'Durban · Durban Stadium',                 repetidasLabel: 'EST3',  type: 'estadio', horizontal: false, pair: true },
        { code: 'EST4',  label: 'Durban · Durban Stadium',                 repetidasLabel: 'EST4',  type: 'estadio', horizontal: false, pair: true },
        { code: 'EST5',  label: 'Johannesburg · Ellis Park Stadium',       repetidasLabel: 'EST5',  type: 'estadio', horizontal: false, pair: true },
        { code: 'EST6',  label: 'Johannesburg · Ellis Park Stadium',       repetidasLabel: 'EST6',  type: 'estadio', horizontal: false, pair: true },
        { code: 'EST7',  label: 'Johannesburg · Soccer City Stadium',      repetidasLabel: 'EST7',  type: 'estadio', horizontal: false, pair: true },
        { code: 'EST8',  label: 'Johannesburg · Soccer City Stadium',      repetidasLabel: 'EST8',  type: 'estadio', horizontal: false, pair: true },
        { code: 'EST9',  label: 'Bloemfontein · Free State Stadium',       repetidasLabel: 'EST9',  type: 'estadio', horizontal: false, pair: true },
        { code: 'EST10', label: 'Bloemfontein · Free State Stadium',       repetidasLabel: 'EST10', type: 'estadio', horizontal: false, pair: true },
        { code: 'EST11', label: 'Port Elizabeth · Nelson Mandela Bay',     repetidasLabel: 'EST11', type: 'estadio', horizontal: false, pair: true },
        { code: 'EST12', label: 'Port Elizabeth · Nelson Mandela Bay',     repetidasLabel: 'EST12', type: 'estadio', horizontal: false, pair: true },
        { code: 'EST13', label: 'Nelspruit · Mbombela Stadium',            repetidasLabel: 'EST13', type: 'estadio', horizontal: false, pair: true },
        { code: 'EST14', label: 'Nelspruit · Mbombela Stadium',            repetidasLabel: 'EST14', type: 'estadio', horizontal: false, pair: true },
        { code: 'EST15', label: 'Polokwane · Peter Mokaba Stadium',        repetidasLabel: 'EST15', type: 'estadio', horizontal: false, pair: true },
        { code: 'EST16', label: 'Polokwane · Peter Mokaba Stadium',        repetidasLabel: 'EST16', type: 'estadio', horizontal: false, pair: true },
        { code: 'EST17', label: 'Rustenburg · Royal Bafokeng Stadium',     repetidasLabel: 'EST17', type: 'estadio', horizontal: false, pair: true },
        { code: 'EST18', label: 'Rustenburg · Royal Bafokeng Stadium',     repetidasLabel: 'EST18', type: 'estadio', horizontal: false, pair: true },
        { code: 'EST19', label: 'Pretoria · Loftus Versfeld Stadium',      repetidasLabel: 'EST19', type: 'estadio', horizontal: false, pair: true },
        { code: 'EST20', label: 'Pretoria · Loftus Versfeld Stadium',      repetidasLabel: 'EST20', type: 'estadio', horizontal: false, pair: true },
      ],
    },
    EXTRAS: {
      count: 4,
      stickers: [
        { code: 'EXTRA1', label: 'Eslogan Oficial', repetidasLabel: 'EXTRA1', type: 'extra',     horizontal: false },
        { code: 'EXTRA2', label: 'Poster Oficial',  repetidasLabel: 'EXTRA2', type: 'extra',     horizontal: false },
        { code: 'EXTRA3', label: 'Poster Oficial',  repetidasLabel: 'EXTRA3', type: 'extra',     horizontal: false },
        { code: 'EXTRA4', label: 'Mascota',         repetidasLabel: 'EXTRA4', type: 'brillante', horizontal: false },
      ],
    },
    FINAL: {
      count: 1,
      stickers: [
        { code: 'FINAL1', label: 'Manos Copa del Mundo', repetidasLabel: 'FINAL1', type: 'brillante', horizontal: false },
      ],
    },
  },

  // ── Temas visuales de secciones especiales ────────────────────────────────────
  sectionThemes: {
    INTRO:    { themeKey: 'INTRO_RSA2010',    solidBg: null,            innerPanel: 'bg-[#3d0f04]' },
    ESTADIOS: { themeKey: 'ESTADIOS_RSA2010', solidBg: 'bg-[#1a4a1a]',  innerPanel: 'bg-[#0d2a0d]' },
    EXTRAS:   { themeKey: 'EXTRAS_RSA2010',   solidBg: null,            innerPanel: 'bg-[#3d1a00]' },
    FINAL:    { themeKey: 'FINAL_RSA2010',    solidBg: null,            innerPanel: 'bg-[#3d2200]' },
  },

  // ── Etiquetas en el buscador para secciones especiales ───────────────────────
  searchConfig: {
    INTRO:    { teamName: 'Intro',    teamFlag: '🏆' },
    ESTADIOS: { teamName: 'Estadios', teamFlag: '🏟️' },
    EXTRAS:   { teamName: 'Extras',   teamFlag: '🎭' },
    FINAL:    { teamName: 'Final',    teamFlag: '🏆' },
  },

  // ── Configuración de estadísticas ────────────────────────────────────────────
  statsConfig: [
    { key: 'INTRO_SPECIAL', emoji: '⭐', name: 'PANINI + FIFA',  fixedCodes: ['PANINI', 'FIFA'] },
    { key: 'INTRO',         emoji: '🏆', name: 'INTRO',          codePrefix: 'INTRO', codeStart: 1, count: 5 },
    { key: '__TEAMS__' },
    { key: 'ESTADIOS',      emoji: '🏟️', name: 'ESTADIOS',       codePrefix: 'EST',   codeStart: 1, count: 20 },
    { key: 'EXTRAS',        emoji: '🎭', name: 'EXTRAS',          codePrefix: 'EXTRA', codeStart: 1, count: 4 },
    { key: 'FINAL',         emoji: '🏆', name: 'FINAL',           fixedCodes: ['FINAL1'] },
  ],

  // ── Equipos competidores (en orden de grupos) ─────────────────────────────────
  competingTeams: [
    'RSA', 'MEX', 'URU', 'FRA',   // Grupo A
    'ARG', 'NGA', 'KOR', 'GRE',   // Grupo B
    'ENG', 'USA', 'ALG', 'SVN',   // Grupo C
    'GER', 'AUS', 'SRB', 'GHA',   // Grupo D
    'NED', 'DEN', 'JPN', 'CMR',   // Grupo E
    'ITA', 'PRY', 'NZL', 'SVK',   // Grupo F
    'BRA', 'PRK', 'CIV', 'POR',   // Grupo G
    'ESP', 'SUI', 'HON', 'CHI',   // Grupo H
  ],

  // ── Datos de todos los equipos ────────────────────────────────────────────────
  teamData: {
    INTRO:    { name: 'Intro',     federation: 'Opening Section',              flag: '🏆' },
    ESTADIOS: { name: 'Estadios',  federation: 'Estadios Sudáfrica 2010',      flag: '🏟️' },
    EXTRAS:   { name: 'Extras',    federation: 'Colección Especial',           flag: '🎭' },
    FINAL:    { name: 'Final',     federation: 'Copa del Mundo 2010',          flag: '🏆' },

    RSA: { name: 'Sudáfrica',       federation: 'South African Football Association',          flag: '🇿🇦' },
    MEX: { name: 'México',          federation: 'Federación Mexicana de Fútbol',               flag: '🇲🇽' },
    URU: { name: 'Uruguay',         federation: 'Asociación Uruguaya de Fútbol',               flag: '🇺🇾' },
    FRA: { name: 'Francia',         federation: 'Fédération Française de Football',            flag: '🇫🇷' },
    ARG: { name: 'Argentina',       federation: 'Asociación del Fútbol Argentino',             flag: '🇦🇷' },
    NGA: { name: 'Nigeria',         federation: 'Nigeria Football Federation',                 flag: '🇳🇬' },
    KOR: { name: 'Rep. de Corea',   federation: 'Korea Football Association',                  flag: '🇰🇷' },
    GRE: { name: 'Grecia',          federation: 'Hellenic Football Federation',                flag: '🇬🇷' },
    ENG: { name: 'Inglaterra',      federation: 'The Football Association',                    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    USA: { name: 'Estados Unidos',  federation: 'U.S. Soccer Federation',                      flag: '🇺🇸' },
    ALG: { name: 'Argelia',         federation: 'Fédération Algérienne de Football',           flag: '🇩🇿' },
    SVN: { name: 'Eslovenia',       federation: 'Football Association of Slovenia',            flag: '🇸🇮' },
    GER: { name: 'Alemania',        federation: 'Deutscher Fußball-Bund',                      flag: '🇩🇪' },
    AUS: { name: 'Australia',       federation: 'Football Australia',                          flag: '🇦🇺' },
    SRB: { name: 'Serbia',          federation: 'Fudbalski savez Srbije',                      flag: '🇷🇸' },
    GHA: { name: 'Ghana',           federation: 'Ghana Football Association',                  flag: '🇬🇭' },
    NED: { name: 'Países Bajos',    federation: 'Koninklijke Nederlandse Voetbalbond',         flag: '🇳🇱' },
    DEN: { name: 'Dinamarca',       federation: 'Dansk Boldspil-Union',                        flag: '🇩🇰' },
    JPN: { name: 'Japón',           federation: 'Japan Football Association',                  flag: '🇯🇵' },
    CMR: { name: 'Camerún',         federation: 'Fédération Camerounaise de Football',         flag: '🇨🇲' },
    ITA: { name: 'Italia',          federation: 'Federazione Italiana Giuoco Calcio',          flag: '🇮🇹' },
    PRY: { name: 'Paraguay',        federation: 'Asociación Paraguaya de Fútbol',              flag: '🇵🇾' },
    NZL: { name: 'Nueva Zelanda',   federation: 'New Zealand Football',                        flag: '🇳🇿' },
    SVK: { name: 'Eslovaquia',      federation: 'Slovak Football Association',                 flag: '🇸🇰' },
    BRA: { name: 'Brasil',          federation: 'Confederação Brasileira de Futebol',          flag: '🇧🇷' },
    PRK: { name: 'Corea del Norte', federation: 'Football Association of the DPR Korea',       flag: '🇰🇵' },
    CIV: { name: 'Costa de Marfil', federation: 'Fédération Ivoirienne de Football',           flag: '🇨🇮' },
    POR: { name: 'Portugal',        federation: 'Federação Portuguesa de Futebol',             flag: '🇵🇹' },
    ESP: { name: 'España',          federation: 'Real Federación Española de Fútbol',          flag: '🇪🇸' },
    SUI: { name: 'Suiza',           federation: 'Schweizerischer Fussballverband',             flag: '🇨🇭' },
    HON: { name: 'Honduras',        federation: 'Federación Nacional de Fútbol de Honduras',  flag: '🇭🇳' },
    CHI: { name: 'Chile',           federation: 'Federación de Fútbol de Chile',               flag: '🇨🇱' },
  },

  // ── Asignación de grupos ──────────────────────────────────────────────────────
  teamGroups: {
    RSA: { group: 'A', members: ['Sudáfrica',    'México',          'Uruguay',       'Francia'        ] },
    MEX: { group: 'A', members: ['Sudáfrica',    'México',          'Uruguay',       'Francia'        ] },
    URU: { group: 'A', members: ['Sudáfrica',    'México',          'Uruguay',       'Francia'        ] },
    FRA: { group: 'A', members: ['Sudáfrica',    'México',          'Uruguay',       'Francia'        ] },
    ARG: { group: 'B', members: ['Argentina',    'Nigeria',         'Rep. de Corea', 'Grecia'         ] },
    NGA: { group: 'B', members: ['Argentina',    'Nigeria',         'Rep. de Corea', 'Grecia'         ] },
    KOR: { group: 'B', members: ['Argentina',    'Nigeria',         'Rep. de Corea', 'Grecia'         ] },
    GRE: { group: 'B', members: ['Argentina',    'Nigeria',         'Rep. de Corea', 'Grecia'         ] },
    ENG: { group: 'C', members: ['Inglaterra',   'Estados Unidos',  'Argelia',       'Eslovenia'      ] },
    USA: { group: 'C', members: ['Inglaterra',   'Estados Unidos',  'Argelia',       'Eslovenia'      ] },
    ALG: { group: 'C', members: ['Inglaterra',   'Estados Unidos',  'Argelia',       'Eslovenia'      ] },
    SVN: { group: 'C', members: ['Inglaterra',   'Estados Unidos',  'Argelia',       'Eslovenia'      ] },
    GER: { group: 'D', members: ['Alemania',     'Australia',       'Serbia',        'Ghana'          ] },
    AUS: { group: 'D', members: ['Alemania',     'Australia',       'Serbia',        'Ghana'          ] },
    SRB: { group: 'D', members: ['Alemania',     'Australia',       'Serbia',        'Ghana'          ] },
    GHA: { group: 'D', members: ['Alemania',     'Australia',       'Serbia',        'Ghana'          ] },
    NED: { group: 'E', members: ['Países Bajos', 'Dinamarca',       'Japón',         'Camerún'        ] },
    DEN: { group: 'E', members: ['Países Bajos', 'Dinamarca',       'Japón',         'Camerún'        ] },
    JPN: { group: 'E', members: ['Países Bajos', 'Dinamarca',       'Japón',         'Camerún'        ] },
    CMR: { group: 'E', members: ['Países Bajos', 'Dinamarca',       'Japón',         'Camerún'        ] },
    ITA: { group: 'F', members: ['Italia',       'Paraguay',        'Nueva Zelanda', 'Eslovaquia'     ] },
    PRY: { group: 'F', members: ['Italia',       'Paraguay',        'Nueva Zelanda', 'Eslovaquia'     ] },
    NZL: { group: 'F', members: ['Italia',       'Paraguay',        'Nueva Zelanda', 'Eslovaquia'     ] },
    SVK: { group: 'F', members: ['Italia',       'Paraguay',        'Nueva Zelanda', 'Eslovaquia'     ] },
    BRA: { group: 'G', members: ['Brasil',       'Corea del Norte', 'Costa de Marfil','Portugal'      ] },
    PRK: { group: 'G', members: ['Brasil',       'Corea del Norte', 'Costa de Marfil','Portugal'      ] },
    CIV: { group: 'G', members: ['Brasil',       'Corea del Norte', 'Costa de Marfil','Portugal'      ] },
    POR: { group: 'G', members: ['Brasil',       'Corea del Norte', 'Costa de Marfil','Portugal'      ] },
    ESP: { group: 'H', members: ['España',       'Suiza',           'Honduras',      'Chile'          ] },
    SUI: { group: 'H', members: ['España',       'Suiza',           'Honduras',      'Chile'          ] },
    HON: { group: 'H', members: ['España',       'Suiza',           'Honduras',      'Chile'          ] },
    CHI: { group: 'H', members: ['España',       'Suiza',           'Honduras',      'Chile'          ] },
  },

  // ── Grupos del torneo ─────────────────────────────────────────────────────────
  groups: {
    A: { color: '#2D8653', teams: ['RSA', 'MEX', 'URU', 'FRA'] },
    B: { color: '#1B6BB5', teams: ['ARG', 'NGA', 'KOR', 'GRE'] },
    C: { color: '#C0392B', teams: ['ENG', 'USA', 'ALG', 'SVN'] },
    D: { color: '#7D3C98', teams: ['GER', 'AUS', 'SRB', 'GHA'] },
    E: { color: '#D35400', teams: ['NED', 'DEN', 'JPN', 'CMR'] },
    F: { color: '#1E8449', teams: ['ITA', 'PRY', 'NZL', 'SVK'] },
    G: { color: '#154360', teams: ['BRA', 'PRK', 'CIV', 'POR'] },
    H: { color: '#B7950B', teams: ['ESP', 'SUI', 'HON', 'CHI'] },
  },

};

// Orden completo de navegación del álbum
albumConfig.teams = [
  'INTRO', 'ESTADIOS', 'EXTRAS',
  ...albumConfig.competingTeams,
  'FINAL',
];

// ── Paleta general del álbum ──────────────────────────────────────────────────
export const albumPalette = {
  name: 'Sudáfrica 2010',
  primary: '#D6491F',
  secondary: '#F8E4B3',
  accent: '#B92714',
  headerBg: '#ffffff',
  headerBgDark: '#5a1a08',
  darkBase: '#3d0f04',
  darkCard: '#6b2010',
  text: '#1e293b',
  textDark: '#F8E4B3',
};

// ── Diccionarios bidireccionales código ↔ número ──────────────────────────────
export const codeToNumber = {};
export const numberToCode = {};

// Casos especiales fuera del contador
codeToNumber['PANINI'] = '000';
codeToNumber['FIFA']   = '00';
numberToCode['000']    = 'PANINI';
numberToCode['00']     = 'FIFA';

// Contador correlativo del 1 al 638
let _counter = 1;

// INTRO1..INTRO5
for (let i = 1; i <= 5; i++) {
  codeToNumber[`INTRO${i}`] = _counter;
  numberToCode[_counter]    = `INTRO${i}`;
  _counter++;
}

// EST1..EST20
for (let i = 1; i <= 20; i++) {
  codeToNumber[`EST${i}`] = _counter;
  numberToCode[_counter]  = `EST${i}`;
  _counter++;
}

// EXTRA1..EXTRA4
for (let i = 1; i <= 4; i++) {
  codeToNumber[`EXTRA${i}`] = _counter;
  numberToCode[_counter]    = `EXTRA${i}`;
  _counter++;
}

// Equipos en orden
const _teamsInOrder = [
  'RSA', 'MEX', 'URU', 'FRA',
  'ARG', 'NGA', 'KOR', 'GRE',
  'ENG', 'USA', 'ALG', 'SVN',
  'GER', 'AUS', 'SRB', 'GHA',
  'NED', 'DEN', 'JPN', 'CMR',
  'ITA', 'PRY', 'NZL', 'SVK',
  'BRA', 'PRK', 'CIV', 'POR',
  'ESP', 'SUI', 'HON', 'CHI',
];

for (const team of _teamsInOrder) {
  for (let i = 1; i <= 19; i++) {
    codeToNumber[`${team}${i}`] = _counter;
    numberToCode[_counter]      = `${team}${i}`;
    _counter++;
  }
}

// FINAL1
codeToNumber['FINAL1'] = _counter;
numberToCode[_counter] = 'FINAL1';
// _counter === 639 aquí, numberToCode[638] === 'FINAL1'
