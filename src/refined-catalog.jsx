// Refined catalog — Apple Music / TV style, with Dark + Light theme support.
// Themes via React Context. Toggle lives in the top bar.

const { useState: useStateR, useMemo: useMemoR, useRef: useRefR, useContext: useCtx, createContext: createCtx } = React;

// ---------- Token sets ----------

const DARK = {
  mode: 'dark',
  bg: '#000000',
  panel: '#1c1c1e',
  elevated: '#2c2c2e',
  elevatedHi: '#3a3a3c',
  hairline: 'rgba(255,255,255,0.08)',
  hairlineStrong: 'rgba(255,255,255,0.16)',
  ink: '#ffffff',
  inkDim: '#a1a1a6',
  inkMuted: '#6e6e72',
  inkFaint: '#3a3a3c',
  accent: '#d4a04a',
  green: '#30d158',
  amber: '#ffd60a',
  red: '#ff453a',
  blue: '#0a84ff',
  purple: '#bf5af2',
  pink: '#ff375f',
  cat: {
    'COMMUNITY':  '#30d158',
    'IDENTITY':   '#bf5af2',
    'REAL WORLD': '#0a84ff',
    'EMERGING':   '#ffd60a',
    'DEV TECH':   '#ff375f',
  },
  topBarBg: 'rgba(0,0,0,0.6)',
  pillBg: 'rgba(0,0,0,0.4)',
  pillBorder: 'rgba(255,255,255,0.16)',
  pillText: '#ffffff',
  cardShadow: '0 8px 30px rgba(0,0,0,0.3)',
  buttonGhost: 'rgba(255,255,255,0.16)',
  buttonGhostBorder: 'rgba(255,255,255,0.18)',
  buttonGhostText: '#ffffff',
};

const LIGHT = {
  mode: 'light',
  bg: '#fbfbfd',
  panel: '#ffffff',
  elevated: '#f5f5f7',
  elevatedHi: '#e8e8ed',
  hairline: 'rgba(0,0,0,0.08)',
  hairlineStrong: 'rgba(0,0,0,0.18)',
  ink: '#1d1d1f',
  inkDim: '#6e6e73',
  inkMuted: '#86868b',
  inkFaint: '#d2d2d7',
  accent: '#9b6f1f',
  green: '#1ea14a',
  amber: '#b58722',
  red: '#d8362a',
  blue: '#0066cc',
  purple: '#8e3edc',
  pink: '#d61f4f',
  cat: {
    'COMMUNITY':  '#1ea14a',
    'IDENTITY':   '#8e3edc',
    'REAL WORLD': '#0066cc',
    'EMERGING':   '#b58722',
    'DEV TECH':   '#d61f4f',
  },
  topBarBg: 'rgba(251,251,253,0.75)',
  pillBg: 'rgba(0,0,0,0.45)',          // hero overlays still dark (legible over imagery)
  pillBorder: 'rgba(255,255,255,0.16)',
  pillText: '#ffffff',
  cardShadow: '0 4px 14px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
  buttonGhost: 'rgba(255,255,255,0.18)',
  buttonGhostBorder: 'rgba(255,255,255,0.22)',
  buttonGhostText: '#ffffff',
};

const COMMON = {
  display: '"Geist", "Noto Sans JP", -apple-system, sans-serif',
  body: '"Geist", "Noto Sans JP", -apple-system, sans-serif',
  mono: '"Geist Mono", ui-monospace, monospace',
  serif: '"Instrument Serif", "EB Garamond", "Noto Serif JP", serif',
  radius: 12,
  radiusLg: 18,
  radiusSm: 8,
};

Object.assign(DARK, COMMON);
Object.assign(LIGHT, COMMON);

const ThemeContext = createCtx(DARK);
const useT = () => useCtx(ThemeContext);

/* ---------- Lang context + translation table ---------- */
const LangContext = createCtx('ja');
const useLang = () => useCtx(LangContext);
const STRINGS = {
  /* Status filter */
  st_all:     { ja: 'すべて',  en: 'All' },
  st_active:  { ja: '進行中',  en: 'In Progress' },
  st_done:    { ja: '完了',    en: 'Completed' },
  st_dnf:     { ja: 'DNF',     en: 'DNF' },
  /* Search */
  search_ph:  { ja: '検索…',   en: 'Search…' },
  search_lbl: { ja: '検索',     en: 'Search' },
  /* Section header */
  sec_all:    { ja: 'すべてのプロポーザル', en: 'All Proposals' },
  sec_active: { ja: '進行中のプロポーザル', en: 'Active Proposals' },
  sec_done:   { ja: '完了したプロポーザル', en: 'Completed Proposals' },
  sec_dnf:    { ja: 'DNF / 停止のプロポーザル', en: 'DNF / Halted Proposals' },
  sec_in:     { ja: ' のプロポーザル', en: ' Proposals' },
  /* Sort */
  sort_amount: { ja: '金額順',     en: 'By Amount' },
  sort_fund:   { ja: 'Fund順',     en: 'By Fund' },
  sort_recent: { ja: '新着順',     en: 'Recent' },
  sort_media:  { ja: 'メディア順', en: 'With Media' },
  /* Toggles */
  group_fund: { ja: 'Fund別 ▾',   en: 'By Fund ▾' },
  only_open:  { ja: '未完了のみ ▾', en: 'Open only ▾' },
  /* Counts */
  total_req:  { ja: 'TOTAL REQUESTED', en: 'TOTAL REQUESTED' },
  proposals:  { ja: 'PROPOSALS · F2-F14', en: 'PROPOSALS · F2-F14' },
};
const T = (key, lang) => (STRINGS[key] && (STRINGS[key][lang] || STRINGS[key].ja)) || key;

// ---------- Atoms ----------

function ABackground({ hue, intensity = 'normal', thumbUrl, borrowedThumbUrl }) {
  // The image area always reads as a "media tile" with rich color, regardless of theme.
  // - thumbUrl       : real video thumbnail (full color, foreground)
  // - borrowedThumbUrl: thumbnail "borrowed" from another proposal to give the
  //                     no-video card visual texture. Heavily desaturated + dimmed
  //                     so it never reads as the project's own image.
  const a = intensity === 'rich' ? 0.22 : 0.16;
  const useBorrowed = !thumbUrl && !!borrowedThumbUrl;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `
        radial-gradient(140% 110% at 25% 20%, oklch(58% ${a * (useBorrowed ? 0.55 : 1)} ${hue}) 0%, transparent 55%),
        radial-gradient(120% 100% at 80% 90%, oklch(42% ${a * (useBorrowed ? 0.4 : 0.7)} ${(hue + 70) % 360}) 0%, transparent 55%),
        linear-gradient(135deg, oklch(${useBorrowed ? '16%' : '28%'} 0.06 ${hue}) 0%, oklch(${useBorrowed ? '10%' : '18%'} 0.04 ${(hue + 30) % 360}) 100%)
      `,
    }}>
      {/* Borrowed thumb: heavily desaturated, very low opacity, used purely as texture */}
      {useBorrowed && (
        <img
          src={borrowedThumbUrl}
          alt=""
          loading="lazy"
          onError={e => { e.currentTarget.style.display = 'none'; }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'grayscale(1) brightness(0.5) contrast(0.85)',
            opacity: 0.28,
            mixBlendMode: 'luminosity',
          }}
        />
      )}
      {/* Real thumb (full color) sits on top of the gradient base */}
      {thumbUrl && (
        <img
          src={thumbUrl}
          alt=""
          loading="lazy"
          onError={e => { e.currentTarget.style.display = 'none'; }}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            opacity: 0.95,
          }}
        />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '4px 4px',
        opacity: thumbUrl ? 0.2 : 0.5, mixBlendMode: 'overlay',
      }} />
    </div>
  );
}

function APlayBadge({ size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(255,255,255,0.18)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.22)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width={size * 0.34} height={size * 0.34} viewBox="0 0 12 12" fill="#fff">
        <path d="M3 1.5L10 6L3 10.5V1.5Z" />
      </svg>
    </div>
  );
}

function AStatusDot({ status, size = 7 }) {
  const t = useT();
  const m = { '完了': t.green, '進行中': t.amber, 'DNF': t.red };
  return (
    <span style={{
      display: 'inline-block', width: size, height: size, borderRadius: '50%',
      background: m[status] || t.inkMuted,
    }} />
  );
}

function AStatusPill({ status }) {
  const t = useT();
  // overlay on image — always dark glass for legibility. Fixed height for clean row rhythm.
  const m = { '完了': t.green, '進行中': t.amber, 'DNF': t.red };
  const color = m[status] || t.inkMuted;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      height: 24, padding: '0 10px 0 9px',
      fontFamily: t.body, fontSize: 11, fontWeight: 600,
      color: '#fff', lineHeight: 1,
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.16)',
      borderRadius: 999,
      letterSpacing: '0.02em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {status}
    </span>
  );
}

function AFundChip({ fund }) {
  const t = useT();
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      height: 24, padding: '0 9px', minWidth: 36,
      fontFamily: t.mono, fontSize: 10.5, fontWeight: 600,
      color: '#fff', lineHeight: 1,
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.16)',
      borderRadius: 999,
      letterSpacing: '0.04em',
    }}>{fund}</span>
  );
}

function AAvatar({ initials, hue, size = 22 }) {
  const t = useT();
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: t.body, fontSize: size * 0.42, fontWeight: 700,
      color: '#000',
      background: `oklch(78% 0.14 ${hue})`,
      flex: '0 0 auto',
    }}>{initials.slice(0, 2)}</span>
  );
}

/* ---------- Currency + price-mode contexts ----------
   Host's view-bar (index.html) posts {type:'currency-change'} and
   {type:'price-mode-change'} messages; the App listens, updates these
   contexts, and AAdaAmount reformats on the fly. */
const CurrencyContext = createCtx('ada');  // 'ada' | 'usd' | 'jpy'
const useCurrency = () => useCtx(CurrencyContext);
/* Bumped on price-mode change to force AAdaAmount to re-read p._raw.adaPrice
   (which the host mutates via recalcAll() before posting the message). */
const PriceTickContext = createCtx(0);
const usePriceTick = () => useCtx(PriceTickContext);

const USD_JPY = 150;  // rough conversion for display; host uses the same constant

function _fmtUsdK(usdK) {
  if (!usdK || usdK <= 0) return '—';
  if (usdK >= 1000) return ((usdK/1000).toFixed(usdK >= 10000 ? 0 : 1).replace(/\.0$/, '')) + 'M';
  if (usdK >= 100)  return Math.round(usdK) + 'K';
  return usdK.toFixed(usdK >= 10 ? 0 : 1).replace(/\.0$/, '') + 'K';
}
function _fmtJpyFromUsdK(usdK) {
  if (!usdK || usdK <= 0) return '—';
  const yen = usdK * 1000 * USD_JPY;
  if (yen >= 1e8) return (yen / 1e8).toFixed(yen >= 1e9 ? 0 : 1).replace(/\.0$/, '') + '億';
  if (yen >= 1e4) return Math.round(yen / 1e4) + '万';
  return Math.round(yen).toLocaleString();
}
function _fmtAdaK(adaK) {
  if (!adaK || adaK <= 0) return '—';
  if (adaK >= 1000) return (adaK / 1000).toFixed(adaK >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (adaK >= 100)  return Math.round(adaK) + 'K';
  return adaK.toFixed(adaK >= 10 ? 0 : 1).replace(/\.0$/, '') + 'K';
}

function AAdaAmount({ raw, amount, size = 14, color }) {
  const t = useT();
  const currency = useCurrency();
  /* eslint-disable-next-line no-unused-vars */
  const _tick = usePriceTick();  // dep only — re-reads raw.adaPrice on host price-mode change
  let symbol = '₳', display;
  if (raw) {
    /* Live-read amt/u/adaPrice from the INDUSTRIES reference so price-mode mutations show through */
    const adaPrice = raw.adaPrice || 0.5;
    const adaK = raw.u === 'ada' ? raw.amt : raw.amt / adaPrice;
    const usdK = raw.u === 'ada' ? raw.amt * adaPrice : raw.amt;
    if (currency === 'usd')      { symbol = '$'; display = _fmtUsdK(usdK); }
    else if (currency === 'jpy') { symbol = '¥'; display = _fmtJpyFromUsdK(usdK); }
    else                          { symbol = '₳'; display = _fmtAdaK(adaK); }
  } else {
    /* Legacy fallback: caller didn't pass raw → just render the pre-formatted ADA string */
    display = amount;
  }
  return (
    <span style={{
      fontFamily: t.mono, fontSize: size, fontWeight: 500,
      color: color || t.ink,
      letterSpacing: '-0.01em',
      display: 'inline-flex', alignItems: 'baseline', gap: 3,
    }}>
      <span style={{ color: color === '#fff' ? 'rgba(255,255,255,0.8)' : t.inkDim, fontSize: size * 0.78 }}>{symbol}</span>{display}
    </span>
  );
}

// Cinematic 6-panel hero with per-panel reveal styles + macro motions.
// Each panel uses different text-in animations for EN / title / desc.
// After reveal completes, the strip cycles through whole-strip macros
// (sweep, spotlight, wave) that gently animate all panels together.

// --- Text reveal primitive ---
function TextReveal({ text, style, progress, fontStyle }) {
  // progress: 0..1 — how much is revealed
  const chars = React.useMemo(() => Array.from(text), [text]);

  if (style === 'typewriter') {
    const count = Math.floor(progress * chars.length);
    const showing = chars.slice(0, count).join('');
    const showCursor = progress > 0.001 && progress < 0.999;
    return (
      <span style={fontStyle}>
        {showing}
        {showCursor && (
          <span style={{
            display: 'inline-block', width: '0.08em', height: '0.85em',
            background: 'currentColor', marginLeft: 2, verticalAlign: '-0.05em',
            animation: 'ch-cursor 0.7s steps(1) infinite',
          }} />
        )}
      </span>
    );
  }

  if (style === 'fadeChar') {
    return (
      <span style={fontStyle}>
        {chars.map((c, i) => {
          const start = i / Math.max(chars.length, 1);
          const cp = Math.max(0, Math.min(1, (progress - start * 0.7) * 4));
          return (
            <span key={i} style={{
              display: 'inline-block',
              opacity: cp,
              transition: 'none',
            }}>{c === ' ' ? '\u00a0' : c}</span>
          );
        })}
      </span>
    );
  }

  if (style === 'slideUp') {
    return (
      <span style={{ ...fontStyle, display: 'inline-block', overflow: 'hidden', paddingBottom: '0.1em' }}>
        {chars.map((c, i) => {
          const start = i * 0.6 / Math.max(chars.length, 1);
          const cp = Math.max(0, Math.min(1, (progress - start) * 3));
          return (
            <span key={i} style={{
              display: 'inline-block',
              opacity: cp,
              transform: `translateY(${(1 - cp) * 0.7}em)`,
            }}>{c === ' ' ? '\u00a0' : c}</span>
          );
        })}
      </span>
    );
  }

  if (style === 'scramble') {
    const pool = 'アカサタナハマヤラワABCD#日本0123';
    return (
      <span style={fontStyle}>
        {chars.map((c, i) => {
          const start = i * 0.5 / Math.max(chars.length, 1);
          const cp = Math.max(0, Math.min(1, (progress - start) * 3));
          if (cp >= 0.999) return <span key={i}>{c}</span>;
          if (cp <= 0.001) return <span key={i} style={{ opacity: 0 }}>{c}</span>;
          const seed = i * 7 + Math.floor(progress * 80);
          const scr = pool[seed % pool.length];
          return <span key={i} style={{ opacity: Math.max(0.4, cp), color: 'inherit' }}>{scr}</span>;
        })}
      </span>
    );
  }

  if (style === 'bigDrop') {
    // Whole text starts very big (and faded), settles into final size
    const scale = 1 + (1 - progress) * 1.5;
    return (
      <span style={{
        ...fontStyle,
        display: 'inline-block',
        transform: `scale(${scale})`,
        opacity: Math.min(1, progress * 1.5),
        transformOrigin: 'left center',
        letterSpacing: progress < 1 ? `${(1 - progress) * 0.3}em` : (fontStyle?.letterSpacing || 'normal'),
      }}>{text}</span>
    );
  }

  if (style === 'sweepMask') {
    return (
      <span style={{
        ...fontStyle, display: 'inline-block',
        clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
        position: 'relative',
      }}>
        {text}
      </span>
    );
  }

  if (style === 'splitCenter') {
    // Each char expands outward from center
    const mid = (chars.length - 1) / 2;
    return (
      <span style={fontStyle}>
        {chars.map((c, i) => {
          const dist = Math.abs(i - mid) / Math.max(mid, 1);
          const cp = Math.max(0, Math.min(1, (progress - dist * 0.5) * 3));
          return (
            <span key={i} style={{
              display: 'inline-block',
              opacity: cp,
              transform: `translateY(${(1 - cp) * (i < mid ? -1 : 1) * 0.3}em) scale(${0.4 + cp * 0.6})`,
              transformOrigin: 'center',
            }}>{c === ' ' ? '\u00a0' : c}</span>
          );
        })}
      </span>
    );
  }

  // default
  return <span style={fontStyle}>{text}</span>;
}

// --- Panels config — each panel uses a unique trio of reveal styles ---
// ---------- Panel mini-previews (SVG mockups of each view) ----------
// Each preview is sized 200×400 viewBox and rendered as a half-transparent layer
// in its panel. On hover the panel zooms (handled in the existing hover handler),
// which naturally enlarges the preview too.

function PanelPreview({ kind, hue, opacity = 0.4 }) {
  const accent = `oklch(82% 0.16 ${hue})`;
  const accent2 = `oklch(72% 0.16 ${(hue + 60) % 360})`;
  const ink = 'rgba(255,255,255,0.85)';
  const dim = 'rgba(255,255,255,0.32)';
  const faint = 'rgba(255,255,255,0.14)';
  const common = {
    position: 'absolute', top: 12, left: 8, right: 8, bottom: '46%',
    pointerEvents: 'none',
    opacity, transition: 'opacity .35s ease, transform .35s ease',
  };

  if (kind === 'sector') {
    /* Treemap: big root rect → branching sector rects */
    return (
      <svg viewBox="0 0 200 400" preserveAspectRatio="xMidYMid meet" style={common}>
        {/* root */}
        <rect x="14" y="36" width="80" height="42" rx="6" fill={ink} opacity="0.85" />
        <text x="54" y="62" fontFamily="Geist" fontWeight="700" fontSize="11" textAnchor="middle" fill="#0a0a0c">CATALYST</text>
        {/* spine */}
        <line x1="22" y1="78" x2="22" y2="370" stroke={faint} strokeWidth="1" />
        {/* sector cards */}
        {[100, 144, 188, 232, 276, 320].map((y, i) => {
          const w = [120, 110, 130, 100, 115, 105][i];
          const c = [accent, accent2, ink, dim, accent, accent2][i];
          return (
            <g key={i}>
              <line x1="22" y1={y + 14} x2="46" y2={y + 14} stroke={c} strokeWidth="1" opacity="0.5" />
              <rect x="46" y={y} width={w} height="28" rx="4" fill="rgba(255,255,255,0.08)" stroke={faint} />
              <rect x="46" y={y} width="3" height="28" fill={c} />
              <rect x="56" y={y + 7} width={w * 0.5} height="3" rx="1.5" fill={ink} opacity="0.7" />
              <rect x="56" y={y + 16} width={w * 0.35} height="2" rx="1" fill={dim} />
            </g>
          );
        })}
      </svg>
    );
  }

  if (kind === 'account') {
    /* Tree of proposers — same spine but with avatars */
    return (
      <svg viewBox="0 0 200 400" preserveAspectRatio="xMidYMid meet" style={common}>
        <rect x="14" y="36" width="80" height="42" rx="6" fill={ink} opacity="0.85" />
        <text x="54" y="62" fontFamily="Geist" fontWeight="700" fontSize="11" textAnchor="middle" fill="#0a0a0c">PROPOSER</text>
        <line x1="22" y1="78" x2="22" y2="370" stroke={faint} strokeWidth="1" />
        {[100, 144, 188, 232, 276, 320].map((y, i) => {
          const w = [128, 116, 124, 108, 132, 100][i];
          const accentList = [accent, accent2, accent, accent2, accent, accent2];
          return (
            <g key={i}>
              <line x1="22" y1={y + 14} x2="46" y2={y + 14} stroke={accentList[i]} strokeWidth="1" opacity="0.5" />
              <rect x="46" y={y} width={w} height="28" rx="4" fill="rgba(255,255,255,0.08)" stroke={faint} />
              <circle cx="58" cy={y + 14} r="9" fill={accentList[i]} opacity="0.75" />
              <rect x="72" y={y + 8} width={w * 0.4} height="3" rx="1.5" fill={ink} opacity="0.7" />
              <rect x="72" y={y + 16} width={w * 0.25} height="2" rx="1" fill={dim} />
            </g>
          );
        })}
      </svg>
    );
  }

  if (kind === 'timeline') {
    /* Fund strip + timeline rows */
    return (
      <svg viewBox="0 0 200 400" preserveAspectRatio="xMidYMid meet" style={common}>
        {/* fund column labels at top */}
        {['F2','F5','F7','F9','F11','F13'].map((f, i) => (
          <text key={f} x={20 + i * 30} y="50" fontFamily="Geist Mono" fontSize="9" fill={dim}>{f}</text>
        ))}
        {/* horizontal bars */}
        {[80, 120, 160, 200, 240, 280, 320].map((y, ri) => (
          <g key={ri}>
            {[0,1,2,3,4,5].map(ci => {
              const has = ((ri + ci * 3) % 4) !== 1;
              const wid = 22;
              const color = ci === ri % 6 ? accent : ((ri + ci) % 3 === 0 ? '#7dd6a3' : (ri % 2 ? '#f0c75e' : 'rgba(255,255,255,0.4)'));
              return has ? (
                <rect key={ci} x={18 + ci * 30} y={y} width={wid} height="6" rx="2" fill={color} opacity="0.85" />
              ) : (
                <rect key={ci} x={18 + ci * 30} y={y} width={wid} height="6" rx="2" fill={faint} />
              );
            })}
            {/* proposer name */}
            <rect x="18" y={y - 11} width="60" height="3" rx="1.5" fill={ink} opacity="0.55" />
          </g>
        ))}
      </svg>
    );
  }

  if (kind === 'network') {
    /* Node graph: nodes + connecting lines */
    const nodes = [
      { x: 100, y: 110, r: 22 },
      { x:  50, y: 170, r: 14 },
      { x: 150, y: 175, r: 16 },
      { x:  60, y: 240, r: 12 },
      { x: 110, y: 250, r: 18 },
      { x: 160, y: 250, r: 10 },
      { x:  80, y: 310, r: 13 },
      { x: 135, y: 320, r: 11 },
      { x:  40, y: 105, r: 9 },
      { x: 170, y: 110, r: 8 },
    ];
    const edges = [[0,1],[0,2],[0,4],[1,3],[1,4],[2,4],[2,5],[3,6],[4,6],[4,7],[5,7],[6,7],[0,8],[0,9],[1,8]];
    return (
      <svg viewBox="0 0 200 400" preserveAspectRatio="xMidYMid meet" style={common}>
        {/* edges */}
        {edges.map((e, i) => (
          <line key={i} x1={nodes[e[0]].x} y1={nodes[e[0]].y} x2={nodes[e[1]].x} y2={nodes[e[1]].y}
            stroke={dim} strokeWidth="0.8" opacity="0.7" />
        ))}
        {/* nodes */}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n.x} cy={n.y} r={n.r} fill={i === 0 ? accent : (i % 2 ? accent2 : ink)} opacity={i === 0 ? 0.9 : 0.7} />
            <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
          </g>
        ))}
      </svg>
    );
  }

  if (kind === 'chart') {
    /* Line chart + histogram */
    return (
      <svg viewBox="0 0 200 400" preserveAspectRatio="xMidYMid meet" style={common}>
        {/* axis gridlines */}
        {[90, 140, 190, 240, 290, 340].map((y, i) => (
          <line key={i} x1="14" y1={y} x2="186" y2={y} stroke={faint} strokeWidth="0.5" />
        ))}
        {/* histogram bars */}
        {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
          const h = 20 + (((i * 7 + 3) % 11) * 8);
          return <rect key={i} x={18 + i * 14} y={340 - h} width="10" height={h} rx="1" fill={accent2} opacity="0.55" />;
        })}
        {/* price line */}
        <path d="M14 200 L34 180 L54 220 L74 160 L94 130 L114 175 L134 110 L154 140 L174 95 L186 120"
          fill="none" stroke={accent} strokeWidth="2" />
        {/* dots on line */}
        {[[14,200],[54,220],[94,130],[134,110],[174,95]].map(([x,y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill={accent} />
        ))}
        {/* legend dots */}
        <circle cx="20" cy="60" r="3" fill={accent} />
        <rect x="28" y="58" width="22" height="3" rx="1" fill={ink} opacity="0.6" />
        <circle cx="60" cy="60" r="3" fill={accent2} opacity="0.6" />
        <rect x="68" y="58" width="22" height="3" rx="1" fill={ink} opacity="0.45" />
      </svg>
    );
  }

  if (kind === 'catalog') {
    /* Grid of poster cards (this view) */
    return (
      <svg viewBox="0 0 200 400" preserveAspectRatio="xMidYMid meet" style={common}>
        {[0,1,2,3,4,5,6,7,8].map(i => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 14 + col * 60;
          const y = 60 + row * 110;
          const c = [accent, accent2, ink, accent2, accent, ink, ink, accent2, accent][i];
          return (
            <g key={i}>
              <rect x={x} y={y} width="56" height="56" rx="6" fill={c} opacity="0.55" />
              <rect x={x + 4} y={y + 4} width="14" height="6" rx="2" fill="rgba(0,0,0,0.35)" />
              <circle cx={x + 28} cy={y + 28} r="6" fill="rgba(255,255,255,0.65)" />
              <rect x={x} y={y + 62} width="50" height="4" rx="2" fill={ink} opacity="0.7" />
              <rect x={x} y={y + 70} width="34" height="3" rx="1.5" fill={dim} />
            </g>
          );
        })}
      </svg>
    );
  }

  return null;
}

const PANEL_DEFS = [
  {
    num: '01', title: '業界別', title_en: 'By Sector', en: 'BY SECTOR', desc: '業種で分類', desc_en: 'Sorted by industry',
    hue: 28, href: 'sector',
    reveals: { en: 'typewriter', title: 'bigDrop',    desc: 'fadeChar' },
    emphasisIdx: 1, // 界
  },
  {
    num: '02', title: 'アカウント別', title_en: 'By Account', en: 'BY ACCOUNT', desc: '提案者で見る', desc_en: 'Browse by proposer',
    hue: 210, href: 'account',
    reveals: { en: 'fadeChar',   title: 'slideUp',    desc: 'typewriter' },
    emphasisIdx: 0, // ア
  },
  {
    num: '03', title: '時系列', title_en: 'Timeline', en: 'TIMELINE', desc: 'F2 から F14 まで', desc_en: 'From F2 to F14',
    hue: 320, href: 'timeline',
    reveals: { en: 'sweepMask',  title: 'splitCenter', desc: 'fadeChar' },
    emphasisIdx: 0, // 時
  },
  {
    num: '04', title: '関係図', title_en: 'Network', en: 'NETWORK', desc: '提案のつながり', desc_en: 'Proposal connections',
    hue: 140, href: 'network',
    reveals: { en: 'typewriter', title: 'scramble',   desc: 'slideUp' },
    emphasisIdx: 2, // 図
  },
  {
    num: '05', title: 'チャート', title_en: 'Chart', en: 'CHART', desc: '数字で俯瞰', desc_en: 'Overview in numbers',
    hue: 50, href: 'chart',
    reveals: { en: 'slideUp',    title: 'sweepMask',  desc: 'fadeChar' },
    emphasisIdx: 0, // チ
  },
  {
    num: '06', title: 'カタログ', title_en: 'Catalog', en: 'CATALOG', desc: 'メディア & リンク', desc_en: 'Media & links',
    hue: 280, href: 'catalog', current: true,
    reveals: { en: 'fadeChar',   title: 'splitCenter', desc: 'typewriter' },
    emphasisIdx: 1, // タ
  },
];

// Reveal timing (ms) per panel
// Era explainer overlays — three Fund-era cards that appear after the panel reveal
// to teach users what F2-F9 / F10-F12 / F13-F14 represent before the cinema turns
// into a nav. Each era plays full-width on top of all 6 panels.
const ERAS_HERO = [
  {
    label: 'F2 – F9',  period: '2020 / 06 – 2022 / 11', hue: 28,
    title: '黎明期', title_en: 'Dawn',
    sub: 'IdeaScale 時代', sub_en: 'The IdeaScale Era',
    body: 'IdeaScale で運用。Close-Out レポートは推奨に留まり、提出形式も自由。完了済でも現存する成果物が限定的。',
    body_en: 'Operated on IdeaScale. Close-out reports were optional with no fixed format. Even completed projects have limited surviving deliverables.',
  },
  {
    label: 'F10 – F12', period: '2023 / 04 – 2024 / 06', hue: 280,
    title: '制度化', title_en: 'Formalization',
    sub: 'Milestone 制度導入', sub_en: 'Milestone System Introduced',
    body: 'projectcatalyst.io へ移行。SoM / PoA の提出が義務化。Close-Out Report と Town Hall 動画が標準成果物に。',
    body_en: 'Migrated to projectcatalyst.io. SoM / PoA submissions became mandatory. Close-out reports and Town Hall videos became standard deliverables.',
  },
  {
    label: 'F13 – F14', period: '2024 / 10 – 2026 / 04', hue: 350,
    title: '混迷と停止', title_en: 'Turmoil & Pause',
    sub: 'Catalyst 見直し期', sub_en: 'Catalyst Under Review',
    body: 'Constitution 制定・DRep 投票が稼働するも、ガバナンス疲弊・参加減退で 2026 年現在 Catalyst は見直しのため停止中。次の運営フェーズ検討フェーズ。',
    body_en: 'The Constitution was ratified and DRep voting went live, but governance fatigue and declining participation led to Catalyst being paused for review as of 2026.',
  },
];
const ERA_DELAY = 1100;   // ms after REVEAL_END before the first era appears
const ERA_STEP  = 1600;   // ms between consecutive card reveals
const ERA_HOLD  = 1500;   // ms after last card before CTA appears
const ERAS_TOTAL_DUR = ERA_STEP * 3 + ERA_HOLD;  // total era sequence length

const REVEAL = {
  PANEL_STAGGER: 220,   /* was 580 — snappier cascade between panels */
  EN_DUR: 180,          /* was 380 */
  TITLE_DELAY: 80,      /* was 200 */
  TITLE_DUR: 380,       /* was 900 */
  DESC_DELAY: 260,      /* was 700 */
  DESC_DUR: 320,        /* was 700 */
};
const PANEL_TOTAL = REVEAL.DESC_DELAY + REVEAL.DESC_DUR;
const REVEAL_END = (PANEL_DEFS.length - 1) * REVEAL.PANEL_STAGGER + PANEL_TOTAL;

// --- Macro cycle ---
// Phase plan after reveal: rest → SWEEP → rest → SPOTLIGHT → rest → WAVE → rest → repeat
const MACROS = [
  { id: 'rest',      dur: 1800 },
  { id: 'sweep',     dur: 2400 },
  { id: 'rest',      dur: 1100 },
  { id: 'charPop',   dur: 3000 },
  { id: 'rest',      dur: 1100 },
  { id: 'spotlight', dur: 2800 },
  { id: 'rest',      dur: 1100 },
  { id: 'curtain',   dur: 2800 },
  { id: 'rest',      dur: 1100 },
  { id: 'wave',      dur: 2400 },
  { id: 'rest',      dur: 1100 },
  { id: 'mosaic',    dur: 3200 },
];
const MACRO_TOTAL = MACROS.reduce((s, m) => s + m.dur, 0);

function getMacroState(macroNow) {
  const t = macroNow % MACRO_TOTAL;
  let elapsed = 0;
  for (const m of MACROS) {
    if (t < elapsed + m.dur) return { id: m.id, p: (t - elapsed) / m.dur };
    elapsed += m.dur;
  }
  return { id: 'rest', p: 0 };
}

function panelMacroFx(panelIdx, macro, totalPanels) {
  const fx = { scale: 1, translateY: 0, brightness: 1, glow: 0, z: 1 };
  if (macro.id === 'rest') return fx;
  if (macro.id === 'sweep') {
    const ribbon = macro.p * (totalPanels + 0.6) - 0.3;
    const dist = Math.abs(panelIdx + 0.5 - ribbon);
    const intensity = Math.max(0, 1 - dist * 1.2);
    fx.scale = 1 + intensity * 0.05;
    fx.brightness = 1 + intensity * 0.55;
    fx.translateY = -intensity * 4;
    fx.glow = intensity;
    fx.z = intensity > 0.4 ? 2 : 1;
  } else if (macro.id === 'spotlight') {
    // Pseudo-random panel highlighted at each "step"
    const step = Math.floor(macro.p * 5);
    const seed = step * 13 + 7;
    const target = seed % totalPanels;
    const localP = (macro.p * 5) % 1;
    const intensity = Math.sin(localP * Math.PI);
    if (panelIdx === target) {
      fx.scale = 1 + intensity * 0.08;
      fx.brightness = 1 + intensity * 0.6;
      fx.glow = intensity;
      fx.z = 3;
    } else {
      fx.brightness = 1 - intensity * 0.25;
    }
  } else if (macro.id === 'wave') {
    const delay = panelIdx * 0.09;
    const phase = (macro.p - delay) * 2.2;
    const intensity = phase > 0 && phase < 1 ? Math.sin(phase * Math.PI) : 0;
    fx.scale = 1 + intensity * 0.04;
    fx.translateY = -intensity * 7;
    fx.brightness = 1 + intensity * 0.3;
    fx.glow = intensity * 0.6;
  } else if (macro.id === 'charPop') {
    // Sequential per-panel pop with brief hold
    const slot = 1 / totalPanels;
    const start = panelIdx * slot * 0.85;
    const localP = (macro.p - start) / slot;
    if (localP > 0 && localP < 1.4) {
      const intensity = localP < 1 ? Math.sin(localP * Math.PI) : 0;
      fx.scale = 1 + intensity * 0.03;
      fx.brightness = 1 + intensity * 0.4;
      fx.glow = intensity * 0.5;
      fx.z = intensity > 0.3 ? 3 : 1;
    }
  } else if (macro.id === 'curtain') {
    // First half: black curtain falls. Second half: lifts panel-by-panel L→R.
    if (macro.p < 0.35) {
      // covering — panels barely visible
      fx.brightness = 1 - macro.p / 0.35 * 0.8;
    } else {
      const reveal = (macro.p - 0.35) / 0.65;
      const myReveal = (reveal * totalPanels) - panelIdx;
      if (myReveal > 0) {
        const intensity = Math.min(1, myReveal * 1.8);
        fx.brightness = 0.2 + intensity * 0.8;
        fx.scale = 1 + (1 - intensity) * 0.04;
      } else {
        fx.brightness = 0.2;
      }
    }
  } else if (macro.id === 'mosaic') {
    // Subtle panel-level dimming while tiles dance on top
    const phase = Math.sin(macro.p * Math.PI);
    fx.brightness = 1 - phase * 0.4;
  }
  return fx;
}

// Char-level transforms for charPop macro
function charPopForPanel(panelIdx, macro, totalPanels) {
  if (macro.id !== 'charPop') return 0; // intensity 0
  const slot = 1 / totalPanels;
  const start = panelIdx * slot * 0.85;
  const localP = (macro.p - start) / slot;
  if (localP <= 0 || localP >= 1.4) return 0;
  if (localP < 1) return Math.sin(localP * Math.PI);
  return 0;
}

// Pre-generated tiles for the mosaic macro (one set per panel, deterministic)
function makeTiles(seed, count = 14) {
  const tiles = [];
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    tiles.push({
      x: rand() * 75,
      y: rand() * 70,
      w: 16 + rand() * 32,
      h: 14 + rand() * 26,
      delay: rand(),
      hueShift: (rand() - 0.5) * 60,
    });
  }
  return tiles;
}

// Curtain overlay — black panel that lifts to reveal content
function CurtainOverlay({ macro, panelIdx, totalPanels }) {
  if (macro.id !== 'curtain') return null;
  let cover = 0;
  if (macro.p < 0.35) cover = macro.p / 0.35;
  else {
    const reveal = (macro.p - 0.35) / 0.65;
    const myReveal = (reveal * totalPanels) - panelIdx;
    cover = Math.max(0, 1 - Math.min(1, myReveal * 1.8));
  }
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 4,
      background: '#000',
      clipPath: `inset(0 ${(1 - cover) * 100}% 0 0)`,
      pointerEvents: 'none',
      transition: 'clip-path .12s linear',
    }} />
  );
}

// Mosaic overlay — randomized tiles pop in on top of the panel
function MosaicOverlay({ macro, panelIdx, hue, tiles }) {
  if (macro.id !== 'mosaic') return null;
  const phase = macro.p;
  // Each tile has its own appearance window
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 4, pointerEvents: 'none',
    }}>
      {tiles.map((tile, i) => {
        // Each tile appears at delay, lasts ~0.4, fades at end
        const tileStart = tile.delay * 0.5;
        const localP = (phase - tileStart) / 0.55;
        let opacity = 0;
        if (localP > 0 && localP < 1) {
          opacity = Math.min(1, localP * 3) * Math.min(1, (1 - localP) * 2.5);
        }
        if (phase > 0.85) {
          opacity *= Math.max(0, 1 - (phase - 0.85) / 0.15);
        }
        if (opacity < 0.02) return null;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${tile.x}%`, top: `${tile.y}%`,
            width: `${tile.w}%`, height: `${tile.h}%`,
            background: `oklch(${55 + tile.delay * 20}% 0.20 ${(hue + tile.hueShift + 360) % 360})`,
            opacity,
            mixBlendMode: 'screen',
          }} />
        );
      })}
      {/* Faint black backdrop while tiles play */}
      <div style={{
        position: 'absolute', inset: 0,
        background: '#000',
        opacity: 0.45 * Math.sin(phase * Math.PI),
        mixBlendMode: 'multiply',
      }} />
    </div>
  );
}

// Char-level title renderer — used after reveal completes, so we can
// apply per-char macro effects (e.g. CHAR_POP emphasis).
function TitleChars({ text, emphasisIdx, popIntensity, fontStyle, hue }) {
  const chars = React.useMemo(() => Array.from(text), [text]);
  return (
    <span style={fontStyle}>
      {chars.map((c, i) => {
        const isEmphasis = i === emphasisIdx;
        const isOther = popIntensity > 0.05 && !isEmphasis;
        const scale = isEmphasis ? 1 + popIntensity * 1.4 : isOther ? 1 - popIntensity * 0.18 : 1;
        const ty = isEmphasis ? -popIntensity * 6 : 0;
        const color = isEmphasis && popIntensity > 0.1
          ? `oklch(78% 0.22 ${(hue + 30) % 360})`
          : '#fff';
        return (
          <span key={i} style={{
            display: 'inline-block',
            transform: `scale(${scale}) translateY(${ty}px)`,
            color, opacity: isOther ? 1 - popIntensity * 0.5 : 1,
            transition: 'transform .25s cubic-bezier(.2,.7,.3,1), color .2s, opacity .2s',
            transformOrigin: 'center bottom',
            fontWeight: isEmphasis && popIntensity > 0.3 ? 900 : 'inherit',
          }}>{c}</span>
        );
      })}
    </span>
  );
}

function CinematicHero({ onSelect, activeFund, setActiveFund, activeCategory, setActiveCategory, activeNav, setActiveNav, query, setQuery, cats, statusFilter, setStatusFilter, visibleCount }) {
  const t = useT();
  const lang = useLang();
  const panels = PANEL_DEFS;
  // Deterministic per-panel tile layouts for the MOSAIC macro
  const panelTiles = React.useMemo(() => panels.map((p, i) => makeTiles(i * 173 + 41, 14)), [panels]);

  const [now, setNow] = useStateR(0);
  const [paused, setPaused] = useStateR(false);
  const [hovered, setHovered] = useStateR(null);
  /* heroPhase: 'cinema' → 'manifesto' (3-line manifesto reveal) → 'cta' (CTA overlay) → 'nav' (compact nav strip) */
  const [heroPhase, setHeroPhase] = useStateR('cinema');
  /* When the manifesto starts, record the timestamp so each line can stagger in cleanly. */
  const [manifestoStart, setManifestoStart] = useStateR(0);
  const startRef = useRefR(performance.now());
  const pauseAtRef = useRefR(0);
  /* replayId: incremented on replay to force the animation effect to re-run (resets lastTick) */
  const [replayId, setReplayId] = useStateR(0);

  React.useEffect(() => {
    let raf;
    let lastTick = 0;
    const tick = () => {
      if (!paused) {
        const elapsed = performance.now() - startRef.current;
        // throttle to ~30fps
        if (elapsed - lastTick > 30) {
          setNow(elapsed);
          lastTick = elapsed;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, replayId]);

  /* Era overlay timing — derived from the master clock */
  const sinceReveal = now - REVEAL_END;
  const sequenceLocal = sinceReveal - ERA_DELAY; /* ms into the era reveal sequence */
  const inEraSequence = sequenceLocal > 0;
  /* How many cards should be visible now (accumulative left → right) */
  const cardsRevealed = sequenceLocal < 0 ? 0 : Math.min(ERAS_HERO.length, Math.floor(sequenceLocal / ERA_STEP) + 1);
  const allRevealed = cardsRevealed >= ERAS_HERO.length;
  const erasDone = allRevealed && sequenceLocal > ERA_STEP * ERAS_HERO.length + ERA_HOLD;

  /* Auto-advance: cinema → manifesto (when eras finish) → cta (after manifesto plays out) */
  React.useEffect(() => {
    if (heroPhase === 'cinema' && erasDone) {
      setManifestoStart(performance.now());
      setHeroPhase('manifesto');
    }
  }, [now, heroPhase, erasDone]);
  React.useEffect(() => {
    if (heroPhase !== 'manifesto') return;
    /* Total manifesto duration ≈ 6.5s (3 lines × ~1.0s stagger + ~3.5s hold) */
    const id = setTimeout(() => setHeroPhase('cta'), 6500);
    return () => clearTimeout(id);
  }, [heroPhase]);

  const replay = () => {
    startRef.current = performance.now();
    pauseAtRef.current = 0;
    setPaused(false);
    setNow(0);
    setHeroPhase('cinema');
    setReplayId(r => r + 1);
  };

  const inReveal = now < REVEAL_END;
  const macroNow = inReveal ? 0 : now - REVEAL_END;
  /* Pause macros once we move past 'cinema' phase */
  const macro = (inReveal || heroPhase !== 'cinema') ? { id: 'rest', p: 0 } : getMacroState(macroNow);

  /* Compact nav mode */
  if (heroPhase === 'nav') {
    return <CompactHeroNav
      panels={panels}
      activeFund={activeFund}
      setActiveFund={setActiveFund}
      activeCategory={activeCategory}
      setActiveCategory={setActiveCategory}
      activeNav={activeNav}
      setActiveNav={setActiveNav}
      query={query}
      setQuery={setQuery}
      cats={cats}
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      visibleCount={visibleCount}
      onExpand={replay}
    />;
  }

  return (
    <div
      style={{
        position: 'relative', width: '100%', height: 460, flexShrink: 0,
        borderRadius: t.radiusLg, overflow: 'hidden',
        background: '#000',
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
        boxShadow: t.mode === 'light' ? '0 20px 50px rgba(0,0,0,0.18)' : 'none',
        isolation: 'isolate',
      }}
      onMouseLeave={() => setHovered(null)}
    >
      <style>{`
        @keyframes ch-cursor { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }
        @keyframes ch-pan { 0% { transform: scale(1.08) translate(2%, -1%); } 100% { transform: scale(1.08) translate(-2%, 1%); } }
        @keyframes ch-grain { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.32; } }
      `}</style>

      {panels.map((panel, i) => {
        // Reveal progress per panel/element
        const panelStart = i * REVEAL.PANEL_STAGGER;
        const local = now - panelStart;
        const enP    = Math.max(0, Math.min(1, local / REVEAL.EN_DUR));
        const titleP = Math.max(0, Math.min(1, (local - REVEAL.TITLE_DELAY) / REVEAL.TITLE_DUR));
        const descP  = Math.max(0, Math.min(1, (local - REVEAL.DESC_DELAY) / REVEAL.DESC_DUR));

        const isStarted = local > 0;
        const isAnimating = local > 0 && local < PANEL_TOTAL;
        const isComplete = local >= PANEL_TOTAL;

        // Macro transforms
        const fx = isComplete && !hovered ? panelMacroFx(i, macro, panels.length) : { scale: 1, translateY: 0, brightness: 1, glow: 0, z: 1 };
        const popIntensity = isComplete && !hovered ? charPopForPanel(i, macro, panels.length) : 0;

        // Hover overrides
        const isHovered = hovered === i;
        const scale = isHovered ? 1.06 : fx.scale;
        const translateY = isHovered ? -6 : fx.translateY;
        const brightness = isHovered ? 1.25 : fx.brightness;
        const glowAmount = isHovered ? 1 : fx.glow;
        const zIndex = isHovered ? 5 : fx.z;

        const overlayDark = !isStarted ? 0.85
                          : isAnimating ? 0.4
                          : 0.35;
        const filterFuture = !isStarted ? 'grayscale(0.85) brightness(0.45)' : 'none';

        return (
          <a
            key={panel.num}
            href={`#${panel.href}`}
            onClick={(e) => { e.preventDefault(); onSelect && onSelect(panel); }}
            onMouseEnter={() => isComplete && setHovered(i)}
            style={{
              position: 'relative', display: 'block',
              borderRight: i < panels.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              cursor: isComplete ? 'pointer' : 'default',
              overflow: 'hidden',
              textDecoration: 'none',
              color: 'inherit',
              transform: `translateY(${translateY}px) scale(${scale})`,
              filter: `brightness(${brightness})`,
              transition: paused || isHovered ? 'transform .25s cubic-bezier(.2,.7,.3,1), filter .25s' : 'transform .12s linear, filter .12s linear',
              zIndex,
              isolation: 'isolate',
            }}
          >
            {/* Gradient bg with slow pan */}
            <div style={{
              position: 'absolute', inset: '-8%',
              background: `
                radial-gradient(120% 110% at 30% 20%, oklch(60% 0.22 ${panel.hue}) 0%, transparent 55%),
                radial-gradient(120% 100% at 80% 90%, oklch(40% 0.16 ${(panel.hue + 70) % 360}) 0%, transparent 55%),
                linear-gradient(135deg, oklch(22% 0.10 ${panel.hue}) 0%, oklch(12% 0.06 ${(panel.hue + 30) % 360}) 100%)
              `,
              transform: 'scale(1.08)',
              animation: 'ch-pan 14s ease-in-out infinite alternate',
              animationDelay: `${i * -2}s`,
              filter: filterFuture,
              transition: 'filter .8s ease',
            }} />

            {/* Grain */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
              backgroundSize: '4px 4px', mixBlendMode: 'overlay',
              animation: 'ch-grain 3s ease-in-out infinite',
            }} />

            {/* Dark overlay (lightens after reveal) */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(180deg, rgba(0,0,0,${overlayDark * 0.55}) 0%, rgba(0,0,0,${overlayDark}) 100%)`,
              transition: 'background .6s ease',
            }} />

            {/* Macro glow */}
            {(glowAmount > 0.05) && (
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(80% 60% at 50% 55%, oklch(65% 0.22 ${panel.hue} / ${glowAmount * 0.45}), transparent 70%)`,
                pointerEvents: 'none',
              }} />
            )}

            {/* Mini-preview SVG mockup of what the linked view looks like.
                Rendered always; opacity ramps from reveal progress so it 'wakes up' with the panel.
                The future-grayscale filter on the bg layer naturally dims it before reveal too. */}
            <PanelPreview
              kind={panel.href}
              hue={panel.hue}
              opacity={isHovered ? 0.72 : (isComplete ? 0.35 : Math.max(0.08, descP * 0.32))}
            />

            {/* "You are here" tag */}
            {panel.current && isComplete && (
              <div style={{
                position: 'absolute', top: 16, left: 16, zIndex: 3,
                fontFamily: t.body, fontSize: 9, fontWeight: 700,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: '#fff', opacity: 0.95,
                padding: '3px 7px',
                background: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.22)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderRadius: 999,
              }}>You are here</div>
            )}

            {/* Number top-right */}
            <div style={{
              position: 'absolute', top: 16, right: 16,
              fontFamily: t.mono, fontSize: 12, fontWeight: 600,
              letterSpacing: '0.06em',
              color: '#fff', opacity: !isStarted ? 0.2 : 0.7,
              transition: 'opacity .5s ease',
            }}>{panel.num}<span style={{ opacity: 0.4 }}> / 06</span></div>

            {/* Content stack — bottom-anchored so the preview can occupy the top */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              padding: '24px 18px', gap: 10,
            }}>
              {/* EN tag */}
              <div style={{ minHeight: 14, color: `oklch(82% 0.16 ${panel.hue})` }}>
                <TextReveal
                  text={panel.en}
                  style={panel.reveals.en}
                  progress={enP}
                  fontStyle={{
                    fontFamily: t.body, fontSize: 10.5, fontWeight: 700,
                    letterSpacing: '0.22em', textTransform: 'uppercase',
                  }}
                />
              </div>

              {/* Title — big */}
              <div style={{ minHeight: 36, color: '#fff' }}>
                {isComplete ? (
                  <TitleChars
                    text={lang === 'en' ? (panel.title_en || panel.title) : panel.title}
                    emphasisIdx={panel.emphasisIdx}
                    popIntensity={popIntensity}
                    hue={panel.hue}
                    fontStyle={{
                      fontFamily: t.display, fontSize: 30, fontWeight: 700,
                      lineHeight: 1.08, letterSpacing: '-0.02em',
                    }}
                  />
                ) : (
                  <TextReveal
                    text={lang === 'en' ? (panel.title_en || panel.title) : panel.title}
                    style={panel.reveals.title}
                    progress={titleP}
                    fontStyle={{
                      fontFamily: t.display, fontSize: 30, fontWeight: 700,
                      lineHeight: 1.08, letterSpacing: '-0.02em',
                    }}
                  />
                )}
              </div>

              {/* Description */}
              <div style={{ minHeight: 16, color: 'rgba(255,255,255,0.85)' }}>
                <TextReveal
                  text={lang === 'en' ? (panel.desc_en || panel.desc) : panel.desc}
                  style={panel.reveals.desc}
                  progress={descP}
                  fontStyle={{
                    fontFamily: t.body, fontSize: 12.5, lineHeight: 1.4,
                  }}
                />
              </div>

              {/* (OPEN affordance removed — panels are display-only in this hero) */}
            </div>

            {/* Curtain + Mosaic overlays (only render during their macros) */}
            <CurtainOverlay macro={macro} panelIdx={i} totalPanels={panels.length} />
            <MosaicOverlay macro={macro} panelIdx={i} hue={panel.hue} tiles={panelTiles[i]} />
          </a>
        );
      })}

      {/* Controls */}
      <div style={{
        position: 'absolute', top: 16, right: 16, display: 'flex', gap: 6, zIndex: 10,
      }}>
        {/* SKIP → jump to nav mode (always visible during cinema/cta) */}
        <button
          onClick={() => setHeroPhase('nav')}
          style={{
            ...miniBtn, width: 'auto', padding: '0 12px', borderRadius: 999,
            fontFamily: t.body, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
            gap: 5,
          }}
          aria-label="Skip intro and go to control panel"
          title="動画を停止して操作パネルへ"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
            <path d="M2 1.5L7 6L2 10.5V1.5Z" />
            <rect x="8" y="2" width="2" height="8" />
          </svg>
          <span>SKIP</span>
        </button>
        {now > REVEAL_END * 0.5 && (
          <React.Fragment>
            <button
              onClick={() => setPaused(p => !p)}
              style={miniBtn}
              aria-label={paused ? 'Play' : 'Pause'}
            >
              {paused ? (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M3 1.5L10 6L3 10.5V1.5Z" />
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
                  <rect x="3" y="2" width="2.2" height="8" />
                  <rect x="6.8" y="2" width="2.2" height="8" />
                </svg>
              )}
            </button>
            <button onClick={replay} style={miniBtn} aria-label="Replay">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6a4 4 0 1 0 1-2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                <path d="M2 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </React.Fragment>
        )}
      </div>

      {/* Macro indicator (small) */}
      {!inReveal && macro.id !== 'rest' && (
        <div style={{
          position: 'absolute', bottom: 10, right: 14, zIndex: 4,
          fontFamily: t.mono, fontSize: 9, fontWeight: 600,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
        }}>
          ◉ {macro.id}
        </div>
      )}

      {/* Progress bar (during reveal) */}
      {inReveal && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0,
          zIndex: 4,
        }}>
          {panels.map((panel, i) => {
            const panelStart = i * REVEAL.PANEL_STAGGER;
            const local = now - panelStart;
            const p = Math.max(0, Math.min(1, local / PANEL_TOTAL));
            return (
              <div key={i} style={{
                height: 2, background: 'rgba(255,255,255,0.08)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0,
                  width: `${p * 100}%`,
                  background: `oklch(72% 0.18 ${panel.hue})`,
                  transition: 'width .1s linear',
                }} />
              </div>
            );
          })}
        </div>
      )}

      {/* Era explainer — 3 Fund-era cards accumulate LEFT → RIGHT over the panels.
          Each card slides into its column at its time slot; once all 3 are revealed the
          group holds briefly, then the heroPhase advances to 'cta' ("始めよう"). */}
      {heroPhase === 'cinema' && inEraSequence && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '36px 28px',
          pointerEvents: 'none',
          background: `radial-gradient(110% 90% at 50% 55%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.82) 75%)`,
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          animation: 'ch-fade-in .5s ease',
        }}>
          <style>{`@keyframes ch-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }`}</style>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 14,
            width: '100%', maxWidth: 1100,
          }}>
            {ERAS_HERO.map((era, idx) => {
              const revealed = idx < cardsRevealed;
              /* per-card local progress for animation */
              const cardStart = idx * ERA_STEP;
              const cardLocal = Math.max(0, Math.min(1, (sequenceLocal - cardStart) / 700));
              const opacity = revealed ? cardLocal : 0;
              const translateY = revealed ? (1 - cardLocal) * 18 : 24;
              const accent = `oklch(82% 0.16 ${era.hue})`;
              return (
                <div key={era.label} style={{
                  display: 'flex', flexDirection: 'column', gap: 10,
                  padding: '20px 22px',
                  background: `radial-gradient(120% 100% at 30% 0%, oklch(38% 0.18 ${era.hue} / 0.45), transparent 70%), rgba(0,0,0,0.6)`,
                  border: `1px solid oklch(72% 0.18 ${era.hue} / 0.45)`,
                  borderRadius: 14,
                  opacity, transform: `translateY(${translateY}px)`,
                  transition: 'opacity .65s ease, transform .65s cubic-bezier(.2,.7,.3,1)',
                  color: '#fff',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {/* Top accent strip */}
                  <span style={{
                    position: 'absolute', top: 0, left: 16, right: 16, height: 2,
                    background: `linear-gradient(90deg, transparent, ${accent}, oklch(82% 0.16 ${(era.hue+60)%360}), transparent)`,
                  }} />
                  <div style={{
                    fontFamily: t.body, fontSize: 9.5, fontWeight: 700,
                    letterSpacing: '0.28em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.55)',
                  }}>{'CHAPTER ' + String(idx + 1).padStart(2, '0')}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontFamily: t.display, fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1 }}>{era.label}</span>
                  </div>
                  <div style={{
                    fontFamily: t.display, fontSize: 32, fontWeight: 700,
                    color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.05,
                  }}>{lang === 'en' ? (era.title_en || era.title) : era.title}</div>
                  <div style={{
                    fontFamily: t.serif, fontStyle: 'italic', fontSize: 14,
                    color: accent, marginTop: -2,
                  }}>— {lang === 'en' ? (era.sub_en || era.sub) : era.sub}</div>
                  <div style={{
                    fontFamily: t.mono, fontSize: 10.5, color: 'rgba(255,255,255,0.55)',
                    letterSpacing: '0.06em',
                  }}>{era.period}</div>
                  <p style={{
                    margin: '4px 0 0',
                    fontFamily: t.body, fontSize: 12.5, lineHeight: 1.55,
                    color: 'rgba(255,255,255,0.82)',
                  }}>{lang === 'en' ? (era.body_en || era.body) : era.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === MANIFESTO — 3-line declaration shown between era explainers and the CTA ===
          A short cinematic statement of intent that frames what the catalog stands for. */}
      {heroPhase === 'manifesto' && (
        <div
          onClick={() => setHeroPhase('cta')}
          style={{
            position: 'absolute', inset: 0, zIndex: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            background: `
              radial-gradient(60% 70% at 50% 50%, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.92) 80%),
              linear-gradient(135deg, oklch(16% 0.10 280) 0%, oklch(8% 0.06 200) 100%)
            `,
            backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
            animation: 'mf-overlay-in .55s cubic-bezier(.2,.7,.3,1)',
            padding: 32,
          }}
        >
          <style>{`
            @keyframes mf-overlay-in { 0% { opacity: 0; } 100% { opacity: 1; } }
            @keyframes mf-orb-1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(6%,-4%) scale(1.12);} }
            @keyframes mf-orb-2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-5%,6%) scale(1.14);} }
            @keyframes mf-line-in { 0%{opacity:0; transform:translateY(14px); letter-spacing:0.08em;} 60%{letter-spacing:0;} 100%{opacity:1; transform:translateY(0); letter-spacing:-0.025em;} }
            @keyframes mf-rule-grow { 0%{transform:scaleX(0); opacity:0;} 100%{transform:scaleX(1); opacity:0.55;} }
            @keyframes mf-hint-in { 0%{opacity:0;} 100%{opacity:1;} }
          `}</style>

          {/* Soft drifting orbs for cinematic depth */}
          <div style={{
            position: 'absolute', top: '-15%', left: '-10%', width: '60%', height: '80%',
            background: 'radial-gradient(circle at 30% 40%, oklch(60% 0.24 280 / 0.4) 0%, transparent 60%)',
            filter: 'blur(20px)', mixBlendMode: 'plus-lighter',
            animation: 'mf-orb-1 11s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-25%', right: '-10%', width: '60%', height: '80%',
            background: 'radial-gradient(circle at 70% 60%, oklch(60% 0.22 200 / 0.4) 0%, transparent 60%)',
            filter: 'blur(20px)', mixBlendMode: 'plus-lighter',
            animation: 'mf-orb-2 13s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
          {/* Grain */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '3px 3px', mixBlendMode: 'overlay', pointerEvents: 'none',
          }} />

          {/* Manifesto lines */}
          <div style={{
            position: 'relative', zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26,
            color: '#fff', textAlign: 'center', maxWidth: 1100,
          }}>
            {/* Eyebrow */}
            <span style={{
              padding: '4px 14px',
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 999,
              fontFamily: t.body, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.32em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              animation: 'mf-hint-in .6s ease both',
            }}>{lang === 'en' ? 'Manifesto' : 'マニフェスト'}</span>

            {[
              { ja: <>本物なら、<span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>可視化</span>に歓喜する。</>,
                en: <>If you’re real, you <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>rejoice</span> in being seen.</> },
              { ja: <>価値は<span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>共有</span>されてこそ循環する。</>,
                en: <>Value only <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>circulates</span> when it’s shared.</> },
              { ja: <>材料は、<span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>ここに</span>揃えた。</>,
                en: <>The pieces are <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>already</span> here.</> },
            ].map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <span style={{
                    width: 80, height: 1, background: 'rgba(255,255,255,0.35)',
                    transformOrigin: 'center',
                    animation: `mf-rule-grow .6s ${0.55 + i * 1.0}s cubic-bezier(.2,.7,.3,1) both`,
                  }} />
                )}
                <div style={{
                  fontFamily: t.display,
                  fontSize: 52, fontWeight: 700,
                  letterSpacing: '-0.025em', lineHeight: 1.18,
                  textShadow: '0 6px 28px rgba(0,0,0,0.7)',
                  animation: `mf-line-in .9s ${0.5 + i * 1.0}s cubic-bezier(.2,.7,.3,1) both`,
                }}>{lang === 'en' ? line.en : line.ja}</div>
              </React.Fragment>
            ))}

            {/* Skip hint */}
            <span style={{
              marginTop: 22,
              fontFamily: t.mono, fontSize: 10, fontWeight: 600,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              animation: 'mf-hint-in 1.2s 3.8s ease both',
            }}>{lang === 'en' ? 'Click to continue' : 'クリックで先へ'}</span>
          </div>
        </div>
      )}

      {/* 始めよう CTA — overlays the whole hero once reveal + era explainers complete */}
      {heroPhase === 'cta' && (
        <div
          onClick={() => setHeroPhase('nav')}
          style={{
            position: 'absolute', inset: 0, zIndex: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            background: 'radial-gradient(60% 60% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.78) 100%)',
            backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
            animation: 'ch-fade-in .55s cubic-bezier(.2,.7,.3,1)',
          }}
        >
          <style>{`
            @keyframes ch-fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
            @keyframes ch-cta-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
          `}</style>
          <div style={{ textAlign: 'center', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            <div style={{
              fontFamily: t.body, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.32em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
            }}>{lang === 'en' ? 'Ready' : 'READY'}</div>
            <div style={{
              fontFamily: t.display, fontSize: 64, fontWeight: 700,
              letterSpacing: '-0.04em', lineHeight: 1.05,
              animation: 'ch-cta-pulse 2s ease-in-out infinite',
            }}>{lang === 'en' ? <>Let’s <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>begin</span>.</> : <>始め<span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>よう</span>。</>}</div>
            <div style={{
              fontFamily: t.serif, fontStyle: 'italic', fontSize: 16,
              color: 'rgba(255,255,255,0.7)', marginTop: -2,
            }}>{lang === 'en' ? 'Step into Catalyst Japan.' : 'Step into Catalyst Japan.'}</div>
            <div style={{
              marginTop: 14, padding: '10px 22px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.28)',
              borderRadius: 999, backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              fontFamily: t.body, fontSize: 12, fontWeight: 600,
              letterSpacing: '0.16em', textTransform: 'uppercase',
            }}>{lang === 'en' ? 'Open the catalog →' : 'カタログを開く →'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- CompactHeroNav: post-cinema persistent nav strip ----------
// Top row: 6 sibling-site switcher buttons (関連 — sector / account / timeline / network / chart / catalog).
// Bottom row: ALL + per-fund switcher buttons (F14 → F2), horizontally scrolling if needed.
// Click "expand" arrow on the right to restart the cinematic intro.

function CompactHeroNav({ panels, activeFund, setActiveFund, activeCategory, setActiveCategory, activeNav, setActiveNav, query, setQuery, cats, statusFilter, setStatusFilter, visibleCount, onExpand }) {
  const t = useT();
  const lang = useLang();
  const STATUS_LABELS = { 'すべて': T('st_all', lang), '進行中': T('st_active', lang), '完了': T('st_done', lang), 'DNF': T('st_dnf', lang) };
  const orderedFunds = (window.FUND_ORDER || []).filter(f => (window.FUND_COUNTS||{})[f] > 0);
  const totalCount = window.TOTAL_COUNT || 130;
  const totalAda = window.TOTAL_ADA_DISPLAY || '41.2M';
  const navItems = [
    { id: 'home',     label: lang === 'en' ? 'Home'        : 'ホーム',       icon: '⌂' },
    { id: 'featured', label: lang === 'en' ? 'Featured'    : 'おすすめ',     icon: '★' },
    { id: 'all',      label: lang === 'en' ? 'All Proposals': 'すべての提案', icon: '⊞' },
    { id: 'recent',   label: lang === 'en' ? 'Recent'      : '最近追加',     icon: '⏱' },
  ];
  /* Era tiles — each shows period + title + body, sized in proportion to fund-count length */
  const eraFunds = [
    { era: ERAS_HERO[0], funds: ['F2','F3','F4','F5','F6','F7','F8','F9'], span: 8 },
    { era: ERAS_HERO[1], funds: ['F10','F11','F12'], span: 3 },
    { era: ERAS_HERO[2], funds: ['F13','F14'], span: 2 },
  ];
  /* Check if any of the era's funds is currently active */
  const activeEraIdx = eraFunds.findIndex(ef => ef.funds.includes(activeFund));

  /* Shared row-wrapper style — tight packing */
  const rowWrap = {
    display: 'flex', alignItems: 'stretch', gap: 4,
  };
  /* Plain tile (used by header bar items) */
  const tile = (active, hue) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 12px',
    background: active
      ? (hue ? `oklch(72% 0.18 ${hue} / 0.16)` : t.elevatedHi)
      : t.elevated,
    border: `1px solid ${active ? (hue ? `oklch(72% 0.18 ${hue})` : t.hairlineStrong) : 'transparent'}`,
    borderRadius: 8,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    color: active ? t.ink : t.inkDim,
    fontFamily: t.body, fontSize: 12, fontWeight: 500,
    transition: 'background .12s, color .12s',
    flexShrink: 0,
  });

  /* MiniPanel — cinematic-style mini button (fund/category/etc). hue = 0..360, label, sub label, isActive */
  const MiniPanel = ({ hue, label, sub, isActive, onClick, href, title, badge, narrow }) => {
    const accent = `oklch(72% 0.16 ${hue})`;
    const accentLabel = `oklch(82% 0.16 ${hue})`;
    const isAnchor = !!href;
    const Tag = isAnchor ? 'a' : 'button';
    const sharedProps = isAnchor ? { href, onClick } : { onClick, type: 'button' };
    return (
      <Tag
        {...sharedProps}
        title={title}
        style={{
          position: 'relative',
          flex: '1 1 0', minWidth: 0,
          height: narrow ? 36 : 46,
          borderRadius: 8,
          overflow: 'hidden',
          textDecoration: 'none',
          color: '#fff',
          cursor: 'pointer',
          border: `1px solid ${isActive ? accent : 'rgba(255,255,255,0.06)'}`,
          transition: 'transform .15s, border-color .15s',
          padding: 0,
          background: 'transparent',
          fontFamily: 'inherit',
        }}
        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = accent; } }}
        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; } }}
      >
        {/* Cinematic gradient bg */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `
            radial-gradient(120% 110% at 30% 20%, oklch(58% 0.22 ${hue}) 0%, transparent 55%),
            radial-gradient(120% 100% at 80% 90%, oklch(38% 0.16 ${(hue + 70) % 360}) 0%, transparent 55%),
            linear-gradient(135deg, oklch(22% 0.10 ${hue}) 0%, oklch(12% 0.06 ${(hue + 30) % 360}) 100%)
          `,
        }} />
        {/* Grain */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '4px 4px', mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }} />
        {/* Dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%)',
          pointerEvents: 'none',
        }} />
        {/* Centered label + tiny count for favicon-level minis */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 1,
          padding: narrow ? '2px 4px' : '4px 6px',
        }}>
          <div style={{
            fontFamily: t.display, fontSize: narrow ? 11 : 13,
            fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1,
            color: '#fff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
          }}>{label}</div>
          {badge != null && (
            <div style={{
              fontFamily: t.mono, fontSize: narrow ? 8.5 : 9,
              color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em',
              lineHeight: 1,
            }}>{badge}</div>
          )}
        </div>
        {/* Active dot top-left */}
        {isActive && (
          <div style={{
            position: 'absolute', top: 5, left: 6,
            width: 6, height: 6, borderRadius: '50%',
            background: '#fff', boxShadow: '0 0 0 2px rgba(0,0,0,0.4)',
          }} />
        )}
      </Tag>
    );
  };

  /* Section frame wrapper — compact, label only on hover via title attribute */
  const Section = ({ label, children, columns }) => (
    <div title={label} style={{
      border: `1px solid ${t.hairline}`,
      borderRadius: 8,
      padding: 4,
      background: 'rgba(0,0,0,0.18)',
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: 3,
    }}>{children}</div>
  );

  /* Hue per fund (deterministic spread) */
  const fundHue = (f) => {
    if (f === 'ALL') return 220;
    const n = parseInt(f.replace('F', ''), 10) || 0;
    return (n * 27 + 10) % 360;
  };
  const huePerCat = { COMMUNITY: 140, 'REAL WORLD': 210, 'DEV TECH': 330, IDENTITY: 280, EMERGING: 55, MEDIA: 305 };
  /* Tiny glyph per VIEW sibling */
  const panelIcon = (href) => ({
    sector:   '◇', account: '◎', timeline: '◷',
    network:  '⌘', chart: '▰', catalog: '▤',
  })[href] || '◉';

  /* ============ SIMPLE LAYOUT ============ */
  const pill = (active, accent) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 13px',
    background: active ? (accent || t.elevatedHi) : 'transparent',
    border: `1px solid ${active ? (accent || t.hairlineStrong) : t.hairline}`,
    borderRadius: 999, cursor: 'pointer',
    color: active ? t.ink : t.inkDim,
    fontFamily: t.body, fontSize: 13, fontWeight: active ? 600 : 500,
    whiteSpace: 'nowrap', flexShrink: 0,
    transition: 'background .15s, color .15s, border-color .15s',
  });
  const rowLabel = {
    fontFamily: t.body, fontSize: 10.5, fontWeight: 700,
    color: t.inkMuted, letterSpacing: '0.22em', textTransform: 'uppercase',
    width: 80, flexShrink: 0,
  };
  const rowCount = {
    fontFamily: t.mono, fontSize: 11, color: t.inkMuted,
    letterSpacing: '0.06em', marginLeft: 'auto', flexShrink: 0,
  };

  return (
    <div style={{
      width: '100%', flexShrink: 0,
      position: 'relative',
      background: 'transparent',
      display: 'grid', gridTemplateColumns: '1fr 54%', gap: 14,
      padding: '4px 0 8px',
      animation: 'ch-fade-in .35s ease',
      alignItems: 'stretch',
    }}>
      <style>{`
        @keyframes ch-fade-in { 0% { opacity: 0; transform: translateY(6px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* LEFT column — all rows stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>

      {/* === ROW 1: top bar — Catalyst 日本 · search · nav · TOTAL · count === */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '0 6px',
      }}>
        {/* Catalyst 日本 / Catalyst Japan lockup + replay */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{ fontFamily: t.body, fontSize: 17, fontWeight: 700, color: t.ink, letterSpacing: '-0.01em' }}>Catalyst</span>
            <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontSize: 17, color: t.accent }}>{lang === 'en' ? 'Japan' : '日本'}</span>
          </div>
          <button
            onClick={onExpand}
            title={lang === 'en' ? 'Replay intro' : 'イントロを再生'}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 24, height: 24, padding: 0,
              background: 'transparent', border: `1px solid ${t.hairline}`,
              borderRadius: 6, cursor: 'pointer', color: t.inkMuted,
              transition: 'color .15s, border-color .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = t.ink; e.currentTarget.style.borderColor = t.hairlineStrong; }}
            onMouseLeave={e => { e.currentTarget.style.color = t.inkMuted; e.currentTarget.style.borderColor = t.hairline; }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6a4 4 0 1 0 1-2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M2 2v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Search pill (flex 1) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px',
          background: t.elevated, border: `1px solid ${t.hairline}`,
          borderRadius: 999,
          flex: 1, minWidth: 0, maxWidth: 420,
        }}>
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="5" cy="5" r="3.5" stroke={t.inkMuted} strokeWidth="1" />
            <path d="M7.6 7.6L10 10" stroke={t.inkMuted} strokeWidth="1" strokeLinecap="round" />
          </svg>
          <input
            value={query || ''}
            onChange={e => setQuery && setQuery(e.target.value)}
            placeholder={T('search_ph', lang)}
            style={{
              flex: 1, minWidth: 0,
              border: 'none', background: 'transparent', outline: 'none',
              color: t.ink, fontFamily: t.body, fontSize: 13,
            }}
          />
          <span style={{
            fontFamily: t.mono, fontSize: 9, color: t.inkMuted, opacity: 0.6,
            border: `1px solid ${t.hairline}`, padding: '1px 5px', borderRadius: 3,
            flexShrink: 0,
          }}>⌘K</span>
        </div>

        {/* TOTAL + props counter (nav buttons removed — RemoteBar already covers navigation) */}
        <div style={{ display: 'flex', gap: 22, alignItems: 'baseline', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: t.display, fontSize: 22, fontWeight: 700,
              color: t.ink, letterSpacing: '-0.02em', lineHeight: 1,
              display: 'inline-flex', alignItems: 'baseline', gap: 3,
            }}>
              <span style={{ color: t.inkDim, fontSize: 15, fontWeight: 500 }}>₳</span>
              {totalAda}
            </div>
            <div style={{
              fontFamily: t.body, fontSize: 9, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: t.inkMuted,
              marginTop: 3,
            }}>TOTAL REQUESTED</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: t.display, fontSize: 22, fontWeight: 700,
              color: t.ink, letterSpacing: '-0.02em', lineHeight: 1,
            }}>{totalCount}</div>
            <div style={{
              fontFamily: t.body, fontSize: 9, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase', color: t.inkMuted,
              marginTop: 3,
            }}>PROPOSALS · F2-F14</div>
          </div>
        </div>
      </div>

      {/* === ROW 2: masthead — h1 + tagline left, era pills right === */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 18,
        padding: '0 6px',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: t.body, fontSize: 9.5, fontWeight: 600,
            color: t.accent, letterSpacing: '0.22em', textTransform: 'uppercase',
            marginBottom: 6,
          }}>Project Catalyst · Japan</div>
          <h1 style={{
            margin: 0,
            fontFamily: t.display, fontSize: 42, fontWeight: 700,
            color: t.ink, lineHeight: 1.08, letterSpacing: '-0.035em',
            whiteSpace: 'nowrap',
          }}>
            {lang === 'en' ? (
              <>Explore <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: t.inkDim }}>Japan's </span>Cardano ecosystem.</>
            ) : (
              <>探求する、<span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: t.inkDim }}>日本の</span>Cardanoエコシステム。</>
            )}
          </h1>
          <RotatingTagline t={t} totalCount={totalCount} />
        </div>

      </div>

      {/* === ROW 3: STATUS — moved here from the (removed) ATopBar. Was redundant with the RemoteBar's view tabs. === */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' }}>
        <span style={rowLabel}>STATUS</span>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 2,
          padding: 3, background: t.elevated, borderRadius: 999,
          border: `1px solid ${t.hairline}`,
        }}>
          {['すべて', '進行中', '完了', 'DNF'].map(opt => {
            const active = statusFilter === opt;
            return (
              <button key={opt}
                onClick={() => setStatusFilter && setStatusFilter(opt)}
                style={{
                  display: 'inline-flex', alignItems: 'center',
                  padding: '4px 12px',
                  background: active ? t.ink : 'transparent',
                  color: active ? t.bg : t.inkDim,
                  border: 'none', borderRadius: 999, cursor: 'pointer',
                  fontFamily: t.body, fontSize: 12, fontWeight: active ? 700 : 500,
                  whiteSpace: 'nowrap',
                  transition: 'background .15s, color .15s',
                }}>{STATUS_LABELS[opt]}</button>
            );
          })}
        </div>
      </div>

      {/* === ROW 4: FUND === */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' }}>
        <span style={rowLabel}>FUND</span>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
          {[['ALL', totalCount], ...orderedFunds.map(f => [f, window.FUND_COUNTS[f]])].map(([f, c]) => {
            const active = activeFund === f;
            const hue = fundHue(f);
            const accent = `oklch(78% 0.18 ${hue})`;
            return (
              <button key={f}
                onClick={() => setActiveFund && setActiveFund(f)}
                style={{
                  ...pill(active, f === 'ALL' ? t.elevatedHi : `oklch(72% 0.18 ${hue} / 0.20)`),
                  borderColor: active ? (f === 'ALL' ? t.hairlineStrong : accent) : t.hairline,
                  fontFamily: t.mono,
                  fontSize: 11,
                  letterSpacing: '0.02em',
                }}>
                {f !== 'ALL' && (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: accent, opacity: active ? 1 : 0.7,
                  }} />
                )}
                <span style={{ fontWeight: active ? 700 : 600 }}>{f}</span>
                <span style={{ fontSize: 9, color: t.inkMuted, fontWeight: 400 }}>{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* === ROW 5: CATEGORY === */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 6px' }}>
        <span style={rowLabel}>CATEGORY</span>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
          {[{ name: 'ALL', count: totalCount, hue: 0 }, ...(cats || [])].map(c => {
            const active = activeCategory === c.name;
            const accent = c.name === 'ALL' ? null : `oklch(78% 0.18 ${c.hue})`;
            return (
              <button key={c.name}
                onClick={() => setActiveCategory && setActiveCategory(c.name)}
                style={{
                  ...pill(active, accent ? `oklch(72% 0.18 ${c.hue} / 0.20)` : t.elevatedHi),
                  borderColor: active ? (accent || t.hairlineStrong) : t.hairline,
                }}>
                {c.name !== 'ALL' && (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: accent, opacity: active ? 1 : 0.7,
                  }} />
                )}
                <span style={{ fontWeight: active ? 700 : 500, textTransform: c.name === 'ALL' ? 'none' : 'capitalize' }}>
                  {c.name === 'ALL' ? 'ALL' : c.name.toLowerCase().replace(/(^|\s)\S/g, m => m.toUpperCase())}
                </span>
                <span style={{ fontSize: 9, color: t.inkMuted, fontWeight: 400, fontFamily: t.mono }}>{c.count}</span>
              </button>
            );
          })}
        </div>
      </div>
      </div>{/* end LEFT column */}

      {/* RIGHT column — large looping cinema preview, fills full height */}
      <MiniCinemaLooper t={t} fullSize />
    </div>
  );
}

/* VideoCarousel — 3 vertical tiles cycling through proposals that have a YouTube videoUrl.
   Each tile shows the YT thumbnail as background + title overlay; tap = open in modal. */
function VideoCarousel({ t }) {
  const videosAll = React.useMemo(() =>
    (window.PROPOSALS || []).filter(p => p.videoUrl && p.videoThumb), []
  );
  const [tick, setTick] = useStateR(0);
  React.useEffect(() => {
    if (videosAll.length === 0) return;
    const id = setInterval(() => setTick(x => x + 1), 4500);
    return () => clearInterval(id);
  }, [videosAll.length]);

  if (videosAll.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.inkMuted, fontFamily: t.body, fontSize: 11 }}>動画なし</div>;
  }

  /* Three staggered indices */
  const slots = [tick % videosAll.length, (tick * 2 + 5) % videosAll.length, (tick * 3 + 13) % videosAll.length];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
      {slots.map((vi, slotIdx) => {
        const p = videosAll[vi];
        if (!p) return null;
        return (
          <button
            key={slotIdx + '-' + p.id}
            onClick={() => {
              const id = window.extractYouTubeId && window.extractYouTubeId(p.videoUrl);
              if (id && window.openVideoModal) { window.openVideoModal(id, p.videoUrl); return; }
              window.open(p.videoUrl, '_blank', 'noopener');
            }}
            title={p.title + ' — ' + (p.proposer || '')}
            style={{
              position: 'relative', overflow: 'hidden',
              flex: 1, minHeight: 0,
              width: '100%', textAlign: 'left',
              border: `1px solid rgba(255,255,255,0.06)`,
              borderRadius: 10, cursor: 'pointer',
              padding: 0, background: '#000',
              transition: 'transform .15s, border-color .15s',
              animation: `vc-fade-in .55s ease`,
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.borderColor = `oklch(72% 0.16 ${p.hue})`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
          >
            <style>{`@keyframes vc-fade-in { 0% { opacity: 0; transform: scale(1.04); } 100% { opacity: 1; transform: scale(1); } }`}</style>
            {/* Thumbnail bg */}
            <img
              src={p.videoThumb}
              alt=""
              loading="lazy"
              onError={e => { e.currentTarget.style.display = 'none'; }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Dark gradient for legibility */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.78) 100%)',
            }} />
            {/* Top-left: fund + status chip */}
            <div style={{
              position: 'absolute', top: 6, left: 8, display: 'flex', gap: 5,
              fontFamily: t.mono, fontSize: 9, fontWeight: 600,
            }}>
              <span style={{
                color: '#fff', padding: '2px 6px',
                background: 'rgba(0,0,0,0.55)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: 4, backdropFilter: 'blur(6px)',
              }}>{p.f}</span>
              <span style={{
                color: p.s === '完了' ? t.green : p.s === '進行中' ? t.amber : t.red,
                padding: '2px 6px',
                background: 'rgba(0,0,0,0.55)',
                border: `1px solid ${(p.s === '完了' ? t.green : p.s === '進行中' ? t.amber : t.red) + '66'}`,
                borderRadius: 4, backdropFilter: 'blur(6px)',
              }}>● {p.s}</span>
            </div>
            {/* Top-right: play badge */}
            <div style={{
              position: 'absolute', top: 6, right: 8,
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(0,0,0,0.55)',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="9" height="9" viewBox="0 0 12 12" fill="#fff">
                <path d="M3 1.5L10 6L3 10.5V1.5Z" />
              </svg>
            </div>
            {/* Bottom: title + proposer */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '8px 10px 9px',
            }}>
              <div style={{
                fontFamily: t.display, fontSize: 12.5, fontWeight: 700,
                color: '#fff', lineHeight: 1.2, letterSpacing: '-0.005em',
                display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{p.title}</div>
              <div style={{
                marginTop: 2,
                fontFamily: t.body, fontSize: 9.5, color: 'rgba(255,255,255,0.7)',
                display: 'flex', gap: 6, alignItems: 'baseline',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.proposer}</span>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
                <span style={{ fontFamily: t.mono, color: 'rgba(255,255,255,0.85)' }}>₳{p.amount}</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* MiniCinemaLooper — small looping preview of the cinematic intro.
   Replays the 6-panel staggered reveal forever; no era overlay, no CTA. */
function MiniCinemaLooper({ t, fullSize }) {
  const lang = useLang();
  const panels = PANEL_DEFS;
  /* English label for each panel — fall back to JA title if no 'en' field defined */
  const panelLabel = (p) => lang === 'en' ? ({
    sector: 'Sector', account: 'Accounts', timeline: 'Timeline',
    network: 'Network', chart: 'Chart', catalog: 'Catalog',
  })[p.href] || p.title : p.title;
  const [now, setNow] = useStateR(0);
  const startRef = useRefR(performance.now());
  /* Loop covers: panel reveal → brief hold → CONVERGE to the Panel-View icon (final freeze) */
  const POST_REVEAL_HOLD = 500;   /* short beat after the snappy reveal */
  const CONVERGE_DUR     = 500;   /* quick collapse into the icon */
  /* Compatibility aliases — keep the old switch-demo block harmless by parking it past the freeze */
  const HINT_START = REVEAL_END + POST_REVEAL_HOLD + CONVERGE_DUR;
  const HINT_END   = HINT_START; /* switch demo is now disabled; HINT block returns null */
  /* Panel-View promo — comes right after the converge transition */
  const PV_PROMO_DELAY = 0;
  const PV_PROMO_DUR   = 4500;
  const PV_PROMO_START = REVEAL_END + POST_REVEAL_HOLD + CONVERGE_DUR + PV_PROMO_DELAY;
  const LOOP_END       = PV_PROMO_START + PV_PROMO_DUR;

  /* Freeze the timeline mid-way through the Panel-View promo (before the fade-out begins)
     so the final state stays on screen as a persistent banner. */
  const PV_FREEZE_AT = LOOP_END - 600;
  React.useEffect(() => {
    let raf, lastTick = 0;
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      if (elapsed >= PV_FREEZE_AT) {
        /* Stop animating — leave `now` parked on the promo's peak frame */
        setNow(PV_FREEZE_AT);
        return;
      } else if (elapsed - lastTick > 50) {
        setNow(elapsed); lastTick = elapsed;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const containerStyle = fullSize ? {
    position: 'relative',
    width: '100%', height: '100%', minHeight: 280,
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
    borderRadius: 12, overflow: 'hidden',
    background: '#000',
    boxShadow: '0 8px 30px rgba(0,0,0,0.45)',
    border: `1px solid ${t.hairline}`,
    alignSelf: 'stretch',
  } : {
    position: 'relative',
    width: 320, height: 170,
    flexShrink: 0,
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)',
    borderRadius: 10, overflow: 'hidden',
    background: '#000',
    boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
    border: `1px solid ${t.hairline}`,
  };
  /* Typography sizes per mode. Full-size keeps title smaller so 6-char JP titles fit horizontally in narrow columns. */
  const TITLE_SIZE = fullSize ? 16 : 13;
  const EN_SIZE    = fullSize ? 8.5 : 6.5;
  const NUM_SIZE   = fullSize ? 9.5 : 7.5;

  return (
    <div style={containerStyle}>
      {panels.map((panel, i) => {
        const panelStart = i * REVEAL.PANEL_STAGGER;
        const local = now - panelStart;
        const enP    = Math.max(0, Math.min(1, local / REVEAL.EN_DUR));
        const titleP = Math.max(0, Math.min(1, (local - REVEAL.TITLE_DELAY) / REVEAL.TITLE_DUR));
        const isStarted = local > 0;
        return (
          <div key={i} style={{
            position: 'relative', overflow: 'hidden',
            borderRight: i < panels.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            background: `
              radial-gradient(120% 110% at 30% 20%, oklch(60% 0.22 ${panel.hue}) 0%, transparent 55%),
              radial-gradient(120% 100% at 80% 90%, oklch(40% 0.16 ${(panel.hue + 70) % 360}) 0%, transparent 55%),
              linear-gradient(135deg, oklch(22% 0.10 ${panel.hue}) 0%, oklch(12% 0.06 ${(panel.hue + 30) % 360}) 100%)
            `,
            filter: !isStarted ? 'grayscale(0.85) brightness(0.45)' : 'none',
            transition: 'filter .5s ease',
            isolation: 'isolate',
          }}>
            {/* Animated panning glow — adds life */}
            <div style={{
              position: 'absolute', inset: '-12%',
              background: `radial-gradient(60% 50% at 40% 30%, oklch(75% 0.25 ${panel.hue} / 0.45) 0%, transparent 70%)`,
              animation: `mini-pan-${i} 6s ease-in-out infinite alternate`,
              mixBlendMode: 'plus-lighter',
              opacity: 0.55,
              pointerEvents: 'none',
            }} />
            <style>{`@keyframes mini-pan-${i} { 0% { transform: translate(-6%, -4%) scale(1.05); } 100% { transform: translate(6%, 4%) scale(1.15); } }`}</style>

            {/* SVG mini-preview of the linked view (treemap / accounts / timeline / graph / chart / catalog grid) */}
            <div style={{
              position: 'absolute', top: fullSize ? 30 : 22, left: 4, right: 4,
              bottom: fullSize ? '40%' : '50%',
              pointerEvents: 'none',
              opacity: 0.5,
            }}>
              <PanelPreview kind={panel.href} hue={panel.hue} opacity={0.7} />
            </div>

            {/* grain */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '3px 3px', mixBlendMode: 'overlay', pointerEvents: 'none',
            }} />
            {/* dark gradient for legibility */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.78) 100%)',
              pointerEvents: 'none',
            }} />
            {/* Vertical rainbow accent on the right edge */}
            <div style={{
              position: 'absolute', top: '10%', bottom: '10%', right: 0, width: 2,
              background: `linear-gradient(180deg, transparent 0%, oklch(75% 0.20 ${panel.hue}) 30%, oklch(75% 0.20 ${(panel.hue + 60) % 360}) 70%, transparent 100%)`,
              opacity: 0.7, pointerEvents: 'none',
            }} />
            {/* number top-right */}
            <div style={{
              position: 'absolute', top: fullSize ? 8 : 5, right: fullSize ? 10 : 6,
              fontFamily: t.mono, fontSize: NUM_SIZE, fontWeight: 600,
              letterSpacing: '0.05em', color: 'rgba(255,255,255,0.7)',
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            }}>{panel.num}<span style={{ opacity: 0.4 }}>/06</span></div>
            {/* EN top-left */}
            <div style={{
              position: 'absolute', top: fullSize ? 8 : 5, left: fullSize ? 10 : 6,
              fontFamily: t.body, fontSize: EN_SIZE, fontWeight: 700,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: `oklch(82% 0.16 ${panel.hue})`,
              opacity: enP,
              maxWidth: 'calc(100% - 30px)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            }}>{panel.en}</div>
            {/* YOU ARE HERE — only on current (catalog) panel */}
            {panel.current && (
              <div style={{
                position: 'absolute', top: fullSize ? 26 : 18, left: fullSize ? 10 : 6,
                padding: '2px 6px',
                background: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.28)',
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                borderRadius: 999,
                fontFamily: t.body, fontSize: fullSize ? 7.5 : 6.5, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: '#fff',
              }}>You are here</div>
            )}
            {/* Title bottom — accent bar + horizontal text */}
            <div style={{
              position: 'absolute', bottom: fullSize ? 10 : 7,
              left: fullSize ? 10 : 6, right: fullSize ? 8 : 6,
              opacity: titleP,
              transform: titleP < 1 ? `translateY(${(1 - titleP) * 6}px)` : 'none',
              transition: 'transform .15s linear',
              display: 'flex', alignItems: 'flex-end', gap: 6,
            }}>
              {/* vertical accent bar before title */}
              <span style={{
                width: 3, alignSelf: 'stretch',
                background: `linear-gradient(180deg, oklch(78% 0.20 ${panel.hue}), oklch(78% 0.20 ${(panel.hue + 60) % 360}))`,
                borderRadius: 2,
                minHeight: TITLE_SIZE * 1.1,
              }} />
              <span style={{
                fontFamily: t.display, fontSize: TITLE_SIZE, fontWeight: 700,
                letterSpacing: '-0.02em', lineHeight: 1.08,
                color: '#fff',
                wordBreak: 'keep-all',
                overflowWrap: 'break-word',
                textShadow: '0 2px 8px rgba(0,0,0,0.55)',
              }}>{panelLabel(panel)}</span>
            </div>
          </div>
        );
      })}

      {/* (era explainer overlay removed — too noisy in the looping mini cinema) */}

      {/* === End-of-loop switch hint — tab strip + live preview demo === */}
      {(() => {
        const sinceHint = now - HINT_START;
        if (sinceHint <= 0 || now >= HINT_END) return null;
        const fadeIn  = Math.min(1, sinceHint / 320);
        const fadeOut = Math.min(1, Math.max(0, (HINT_END - now) / 360));
        const op = Math.min(fadeIn, fadeOut);

        const otherPanels = PANEL_DEFS.filter(p => !p.current);
        /* Real screenshot map. Drop PNG/JPG files into catalyst-japan/shots/ named:
           sector.png, account.png, timeline.png, network.png, chart.png
           — they auto-appear here. Missing files cleanly fall back to the gradient. */
        const SHOTS = (window.SHOTS) || {
          sector:   'shots/sector.png',
          account:  'shots/account.png',
          timeline: 'shots/timeline.png',
          network:  'shots/network.png',
          chart:    'shots/chart.png',
        };
        /* Per-view crop + zoom focus (Ken Burns style). Picked to highlight the
           most "this is what this view does" part of each screenshot. */
        const SHOT_FOCUS = {
          sector:   { pos: '34% 50%', scale: 1.35, drift: '6% 0%' },   /* Catalyst Japan bubble + fanning connections */
          account:  { pos: '38% 40%', scale: 1.4,  drift: '4% 4%' },   /* bubble + top proposer rows */
          timeline: { pos: '40% 30%', scale: 1.55, drift: '8% 0%' },   /* grid header + dcSpark/yutazzz rows */
          network:  { pos: '50% 48%', scale: 1.55, drift: '0% -4%' },  /* center cluster of nodes */
          chart:    { pos: '45% 55%', scale: 1.3,  drift: '6% 0%' },   /* price + accumulated curves */
        };
        const cycleTime = Math.max(0, sinceHint - TAB_CYCLE_LEAD);
        const activeIdx = Math.min(otherPanels.length - 1, Math.floor(cycleTime / TAB_CYCLE_DUR));
        const active = otherPanels[activeIdx];
        const intoTab = (cycleTime % TAB_CYCLE_DUR) / TAB_CYCLE_DUR;
        const swipeP  = Math.min(1, intoTab * 1.6);  /* 0→1 across first ~62% of each tab */

        const f = SHOT_FOCUS[active.href] || { pos: 'center', scale: 1.2, drift: '0% 0%' };
        const animName = `mini-shot-kb-${active.href}`;

        return (
          <div style={{
            position: 'absolute', inset: 0,
            pointerEvents: 'none', zIndex: 6,
            opacity: op,
            overflow: 'hidden',
          }}>
            <style>{`
              @keyframes mini-hint-arrow  { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
              @keyframes mini-hint-swap   { 0% { opacity: 0; transform: scale(0.97); } 100% { opacity: 1; transform: scale(1); } }
              @keyframes mini-hint-sweep  { 0% { transform: translateX(-100%); } 100% { transform: translateX(120%); } }
              @keyframes ${animName} {
                0%   { transform: scale(${f.scale}) translate(0%, 0%); }
                100% { transform: scale(${f.scale * 1.07}) translate(${f.drift.split(' ')[0]}, ${f.drift.split(' ')[1]}); }
              }
            `}</style>

            {/* === FULL-FRAME BACKGROUND === gradient + SVG fallback always rendered */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `
                radial-gradient(120% 100% at 30% 20%, oklch(45% 0.18 ${active.hue}) 0%, transparent 60%),
                radial-gradient(120% 100% at 80% 90%, oklch(28% 0.14 ${(active.hue + 70) % 360}) 0%, transparent 60%),
                linear-gradient(135deg, oklch(18% 0.08 ${active.hue}) 0%, oklch(10% 0.05 ${(active.hue + 30) % 360}) 100%)
              `,
            }}>
              <div style={{ position: 'absolute', inset: fullSize ? 18 : 10, opacity: 0.6 }}>
                <PanelPreview kind={active.href} hue={active.hue} opacity={0.92} />
              </div>
            </div>

            {/* === FULL-FRAME SCREENSHOT — covers the entire cinema frame === */}
            {SHOTS[active.href] && (
              <div
                key={active.href + '-' + activeIdx}
                style={{
                  position: 'absolute', inset: 0,
                  animation: 'mini-hint-swap .45s cubic-bezier(.2,.7,.3,1) both',
                }}
              >
                <img
                  src={SHOTS[active.href]}
                  alt={active.title}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    objectPosition: f.pos,
                    display: 'block',
                    transformOrigin: f.pos,
                    animation: `${animName} ${TAB_CYCLE_DUR + 500}ms ease-out both`,
                  }}
                  onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                />
              </div>
            )}

            {/* === Vignette + global darken so headline/tabs stay legible over real screenshots === */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `
                linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 28%, rgba(0,0,0,0.18) 60%, rgba(0,0,0,0.72) 100%),
                radial-gradient(120% 100% at 50% 50%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.45) 95%)
              `,
            }} />
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              boxShadow: `inset 0 0 80px oklch(20% 0.10 ${active.hue} / 0.5), inset 0 0 0 1px rgba(255,255,255,0.06)`,
            }} />

            {/* === Sweep light across the whole frame when entering each tab === */}
            <div
              key={'sweep-' + activeIdx}
              style={{
                position: 'absolute', top: 0, bottom: 0, width: '40%',
                background: `linear-gradient(90deg, transparent, oklch(85% 0.22 ${active.hue} / 0.32), transparent)`,
                animation: 'mini-hint-sweep .8s ease-out both',
                pointerEvents: 'none',
                mixBlendMode: 'plus-lighter',
              }}
            />

            {/* === FOREGROUND UI — arrow + headline + tab strip + footer chip === */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              padding: fullSize ? '18px 20px' : '10px 12px',
            }}>
              {/* Top: arrow + headline */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: fullSize ? 6 : 4,
              }}>
                <div style={{
                  fontFamily: t.mono, fontSize: fullSize ? 26 : 18, fontWeight: 800,
                  color: '#fff', lineHeight: 1,
                  textShadow: '0 4px 14px rgba(0,0,0,0.85)',
                  animation: 'mini-hint-arrow 1.3s ease-in-out infinite',
                }}>↑</div>
                <div style={{
                  fontFamily: t.display,
                  fontSize: fullSize ? 30 : 18,
                  fontWeight: 700,
                  color: '#fff', letterSpacing: '-0.025em',
                  lineHeight: 1, textAlign: 'center',
                  textShadow: '0 4px 16px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.7)',
                }}>{lang === 'en' ? 'Switch via tabs above' : '上のタブで切替'}</div>
              </div>

              {/* Mini tab strip mimicking RemoteBar */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: fullSize ? 4 : 3,
                padding: fullSize ? '4px' : '3px',
                background: 'rgba(0,0,0,0.7)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 999,
                alignSelf: 'center',
                marginTop: fullSize ? 12 : 8,
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.55)',
              }}>
                {otherPanels.map((p, i) => {
                  const isActive = i === activeIdx;
                  return (
                    <span key={p.href} style={{
                      padding: fullSize ? '5px 11px' : '3px 8px',
                      borderRadius: 999,
                      fontFamily: t.body, fontSize: fullSize ? 10.5 : 8,
                      fontWeight: isActive ? 700 : 600,
                      letterSpacing: '0.06em',
                      color: isActive ? '#000' : 'rgba(255,255,255,0.75)',
                      background: isActive ? '#fff' : 'transparent',
                      boxShadow: isActive ? `0 2px 10px oklch(75% 0.20 ${p.hue} / 0.7)` : 'none',
                      transition: 'all .25s ease',
                    }}>{panelLabel(p)}</span>
                  );
                })}
                <span style={{
                  padding: fullSize ? '5px 11px' : '3px 8px',
                  borderRadius: 999,
                  fontFamily: t.body, fontSize: fullSize ? 10.5 : 8,
                  fontWeight: 600, letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px dashed rgba(255,255,255,0.24)',
                }}>{lang === 'en' ? 'Catalog' : 'カタログ'}</span>
              </div>

              {/* Spacer pushes footer down */}
              <div style={{ flex: 1 }} />

              {/* Bottom row: active label (left) + progress dots (right) */}
              <div style={{
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                gap: 12, marginBottom: fullSize ? 8 : 5,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{
                    fontFamily: t.mono, fontSize: fullSize ? 9 : 7.5,
                    fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: `oklch(85% 0.18 ${active.hue})`,
                    textShadow: '0 1px 6px rgba(0,0,0,0.9)',
                  }}>{active.num} · {active.en}</span>
                  <span style={{
                    fontFamily: t.display, fontSize: fullSize ? 26 : 16, fontWeight: 700,
                    color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.05,
                    textShadow: '0 2px 12px rgba(0,0,0,0.92), 0 1px 2px rgba(0,0,0,0.7)',
                  }}>{panelLabel(active)}</span>
                </div>
                <div style={{
                  display: 'flex', gap: 4, alignItems: 'center',
                  padding: fullSize ? '5px 8px' : '3px 6px',
                  background: 'rgba(0,0,0,0.55)',
                  borderRadius: 999,
                  backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}>
                  {otherPanels.map((_, i) => (
                    <span key={i} style={{
                      width: i === activeIdx ? (fullSize ? 16 : 10) : (fullSize ? 5 : 4),
                      height: fullSize ? 4 : 3,
                      borderRadius: 2,
                      background: i === activeIdx ? '#fff' : 'rgba(255,255,255,0.3)',
                      transition: 'width .3s ease, background .3s ease',
                    }} />
                  ))}
                </div>
              </div>

              {/* Footer chip: current location */}
              <div style={{
                display: 'flex', justifyContent: 'center',
              }}>
                <div style={{
                  padding: fullSize ? '5px 12px' : '3px 9px',
                  background: 'rgba(0,0,0,0.65)',
                  border: '1px solid rgba(255,255,255,0.24)',
                  borderRadius: 999,
                  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                  fontFamily: t.body, fontSize: fullSize ? 9.5 : 7.5,
                  fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: '#fff',
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  boxShadow: '0 3px 12px rgba(0,0,0,0.55)',
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#7df0a8', boxShadow: '0 0 6px rgba(125,240,168,0.8)',
                  }} />
                  {lang === 'en' ? 'Currently — Catalog' : '現在地 — カタログ'}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* === Panel-View promo phase — final FROZEN frame of the loop ===
          Two columns side-by-side: LEFT = Panel View (targeted), RIGHT = Tabs (browse).
          Since the loop freezes mid-promo (PV_FREEZE_AT), this becomes a persistent CTA. */}
      {(() => {
        const sincePV = now - PV_PROMO_START;
        if (sincePV <= 0) return null;
        const fadeIn = Math.min(1, sincePV / 380);
        return (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 7,
            display: 'flex', flexDirection: fullSize ? 'row' : 'column',
            alignItems: fullSize ? 'stretch' : 'center',
            justifyContent: 'center',
            gap: fullSize ? 28 : 12,
            padding: fullSize ? '16px 32px 18px' : '12px 14px',
            background: 'radial-gradient(120% 100% at 50% 50%, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.94) 75%)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            opacity: fadeIn,
            pointerEvents: 'none',
          }}>
            <style>{`
              @keyframes pv-promo-icon-pop { 0%{opacity:0; transform:scale(0.4) rotate(-15deg);} 60%{transform:scale(1.2) rotate(6deg);} 100%{opacity:1; transform:scale(1) rotate(0);} }
              @keyframes pv-promo-card-pop { 0%{opacity:0; transform:translateY(14px) scale(0.85);} 100%{opacity:1; transform:translateY(0) scale(1);} }
              @keyframes pv-promo-line { 0%{stroke-dashoffset:60;} 100%{stroke-dashoffset:0;} }
              @keyframes pv-promo-pulse-strong { 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.5), 0 0 28px rgba(255,255,255,0.2);} 50%{box-shadow:0 0 0 14px rgba(255,255,255,0), 0 0 50px rgba(255,255,255,0.45);} }
              @keyframes pv-promo-arrow-bob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(4px);} }
              /* Convergence: each chip drops in from above (where the cinema panels were) and lands together */
              @keyframes pv-chip-converge { 0%{opacity:0; transform:translateY(-180px) scale(0.4);} 70%{transform:translateY(6px) scale(1.05);} 100%{opacity:1; transform:translateY(0) scale(1);} }
              /* Screenshot cycle — 5 images fading through in sequence (8s loop) */
              @keyframes ss-cycle-0 { 0%, 18% { opacity: 1; } 22%, 100% { opacity: 0; } }
              @keyframes ss-cycle-1 { 0%, 18% { opacity: 0; } 22%, 38% { opacity: 1; } 42%, 100% { opacity: 0; } }
              @keyframes ss-cycle-2 { 0%, 38% { opacity: 0; } 42%, 58% { opacity: 1; } 62%, 100% { opacity: 0; } }
              @keyframes ss-cycle-3 { 0%, 58% { opacity: 0; } 62%, 78% { opacity: 1; } 82%, 100% { opacity: 0; } }
              @keyframes ss-cycle-4 { 0%, 78% { opacity: 0; } 82%, 100% { opacity: 1; } }
              /* Tab "active" pill — synced with the screenshot cycle.
                 During each tab's window, background = white + text = black; otherwise transparent + dim text. */
              @keyframes tab-active-0 { 0%, 18% { background: #f5f1e8; color: #0a0a0c; font-weight: 700; } 22%, 100% { background: transparent; color: #85827b; font-weight: 500; } }
              @keyframes tab-active-1 { 0%, 18% { background: transparent; color: #85827b; font-weight: 500; } 22%, 38% { background: #f5f1e8; color: #0a0a0c; font-weight: 700; } 42%, 100% { background: transparent; color: #85827b; font-weight: 500; } }
              @keyframes tab-active-2 { 0%, 38% { background: transparent; color: #85827b; font-weight: 500; } 42%, 58% { background: #f5f1e8; color: #0a0a0c; font-weight: 700; } 62%, 100% { background: transparent; color: #85827b; font-weight: 500; } }
              @keyframes tab-active-3 { 0%, 58% { background: transparent; color: #85827b; font-weight: 500; } 62%, 78% { background: #f5f1e8; color: #0a0a0c; font-weight: 700; } 82%, 100% { background: transparent; color: #85827b; font-weight: 500; } }
              @keyframes tab-active-4 { 0%, 78% { background: transparent; color: #85827b; font-weight: 500; } 82%, 100% { background: #f5f1e8; color: #0a0a0c; font-weight: 700; } }
            `}</style>

          {/* ========== LEFT COLUMN: PANEL VIEW (targeted) ========== */}
          <div style={{
            position: 'relative',
            flex: fullSize ? '1 1 0' : 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 0,
            maxWidth: fullSize ? 380 : 280,
          }}>

            {/* Big headline */}
            <h3 style={{
              margin: 0,
              fontFamily: t.display,
              fontSize: fullSize ? 34 : 22, fontWeight: 700,
              color: '#fff', letterSpacing: '-0.025em',
              lineHeight: 1.1, textAlign: 'center',
              textShadow: '0 4px 16px rgba(0,0,0,0.85)',
              animation: 'pv-promo-card-pop .55s .15s ease both',
              maxWidth: fullSize ? 500 : 300,
            }}>
              {lang === 'en' ? (
                <>One proposal,<br/><span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.82)' }}>six</span> angles.</>
              ) : (
                <>1つの提案を、<br/><span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.82)' }}>6</span>つの視点で。</>
              )}
            </h3>

            {/* === KEY VISUAL: big grid icon front + center === */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: fullSize ? 8 : 6,
              marginTop: fullSize ? 16 : 12,
              animation: 'pv-promo-card-pop .55s .3s ease both',
            }}>
              {/* The big clickable icon (the actual panel-view button shown at scale) */}
              <div style={{
                position: 'relative',
                width: fullSize ? 72 : 52, height: fullSize ? 72 : 52,
                borderRadius: fullSize ? 14 : 10,
                background: '#fff',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#0a0a0c',
                animation: 'pv-promo-pulse-strong 1.6s ease-in-out infinite, pv-promo-icon-pop .5s .5s ease both',
              }}>
                <svg width={fullSize ? 36 : 26} height={fullSize ? 36 : 26} viewBox="0 0 12 12" fill="none">
                  <rect x="1.2" y="1.2" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="6.8" y="1.2" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="1.2" y="6.8" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
                  <rect x="6.8" y="6.8" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
              </div>
              {/* Caption directly under the icon */}
              <span style={{
                fontFamily: t.mono, fontSize: fullSize ? 9.5 : 7.5,
                fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.75)',
                animation: 'pv-promo-card-pop .5s .6s ease both',
              }}>{lang === 'en' ? 'This icon · on every card' : 'カード右下にあるこのアイコン'}</span>
            </div>

            {/* 6 colored chips — pushed to the bottom of the left column so they align
                with the bottom edge of the screenshot in the right column. */}
            <div style={{
              display: 'flex', gap: fullSize ? 5 : 4,
              marginTop: fullSize ? 'auto' : 8,
              paddingTop: fullSize ? 10 : 0,
              animation: 'pv-promo-card-pop .55s 1.0s ease both',
            }}>
              {[
                { hue: 28,  label: lang === 'en' ? 'Sct' : '業' },
                { hue: 210, label: lang === 'en' ? 'Acc' : 'ア' },
                { hue: 320, label: lang === 'en' ? 'Tml' : '時' },
                { hue: 140, label: lang === 'en' ? 'Net' : '関' },
                { hue: 50,  label: lang === 'en' ? 'Cht' : 'チ' },
                { hue: 200, label: lang === 'en' ? 'Lnk' : 'L' },
              ].map((m, i) => (
                <div key={i} style={{
                  width: fullSize ? 30 : 22, height: fullSize ? 42 : 30,
                  borderRadius: 5,
                  background: `linear-gradient(180deg, oklch(55% 0.20 ${m.hue}), oklch(25% 0.10 ${m.hue}))`,
                  border: `1px solid oklch(72% 0.20 ${m.hue} / 0.7)`,
                  boxShadow: `0 4px 14px oklch(50% 0.20 ${m.hue} / 0.55)`,
                  display: 'inline-flex', alignItems: 'flex-end', justifyContent: 'center',
                  paddingBottom: fullSize ? 4 : 3,
                  fontFamily: t.body, fontSize: fullSize ? 9 : 7,
                  fontWeight: 700, color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  /* Each chip drops from above with stagger — creates the "panels collapsing into chips" feel */
                  animation: `pv-chip-converge .55s ${0.15 + i * 0.08}s cubic-bezier(.34,1.36,.64,1) both`,
                }}>{m.label}</div>
              ))}
            </div>

          </div>{/* ====== END left column ====== */}

          {/* ===== Vertical divider between the two paths (hidden on small) ===== */}
          {fullSize && (
            <div style={{
              alignSelf: 'stretch', width: 1,
              background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)',
              animation: 'pv-promo-card-pop .55s .35s ease both',
            }} />
          )}

          {/* ========== RIGHT COLUMN: BROWSE all proposals — view by view ========== */}
          <div style={{
            position: 'relative',
            flex: fullSize ? '1 1 0' : 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 0,
            maxWidth: fullSize ? 440 : 280,
          }}>

            {/* headline */}
            <h3 style={{
              margin: 0,
              fontFamily: t.display,
              fontSize: fullSize ? 34 : 22, fontWeight: 700,
              color: '#fff', letterSpacing: '-0.025em',
              lineHeight: 1.1, textAlign: 'center',
              textShadow: '0 4px 16px rgba(0,0,0,0.85)',
              animation: 'pv-promo-card-pop .55s .5s ease both',
              maxWidth: fullSize ? 360 : 260,
            }}>
              {lang === 'en' ? (
                <>All proposals,<br/><span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.82)' }}>view</span> by view.</>
              ) : (
                <>全体を、<br/><span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.82)' }}>視点</span>ごとに。</>
              )}
            </h3>

            {/* Screenshot cycle window — pushed to the bottom of the column so it aligns
                with the chips on the left. marginTop: auto consumes the extra space above. */}
            <div style={{
              marginTop: fullSize ? 'auto' : 10,
              position: 'relative',
              width: fullSize ? 400 : 260,
              height: fullSize ? 200 : 120,
              borderRadius: 10,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.22)',
              background: '#000',
              boxShadow: '0 12px 36px rgba(0,0,0,0.6), 0 0 0 4px rgba(255,255,255,0.04)',
              animation: 'pv-promo-card-pop .55s .75s ease both',
            }}>
              {[
                { src: 'shots/sector.png',   hue: 28 },
                { src: 'shots/account.png',  hue: 210 },
                { src: 'shots/timeline.png', hue: 320 },
                { src: 'shots/network.png',  hue: 140 },
                { src: 'shots/chart.png',    hue: 50 },
              ].map((s, i) => (
                <img
                  key={i}
                  src={s.src}
                  alt=""
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'top center',
                    animation: `ss-cycle-${i} 8s linear infinite`,
                  }}
                />
              ))}
              {/* Top darken so the tab strip overlay is legible */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 45%)',
                pointerEvents: 'none',
                zIndex: 1,
              }} />
              {/* Tab strip — fills the FULL width of the screenshot, tabs share space evenly */}
              <div style={{
                position: 'absolute', top: fullSize ? 8 : 6,
                left: fullSize ? 8 : 6, right: fullSize ? 8 : 6,
                display: 'flex', alignItems: 'center', gap: 2,
                padding: 2,
                background: '#1c1c1f',
                border: '1px solid rgba(255,245,225,0.10)',
                borderRadius: 999,
                animation: 'pv-promo-card-pop .55s .6s ease both',
                zIndex: 3,
              }}>
                {(lang === 'en'
                  ? ['Sector', 'Accounts', 'Timeline', 'Network', 'Chart']
                  : ['業界別', 'アカウント', '時系列', '関係図', 'チャート']
                ).map((lbl, i) => (
                  <span key={i} style={{
                    flex: '1 1 0', minWidth: 0,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    height: fullSize ? 20 : 16,
                    padding: '0 4px',
                    borderRadius: 999,
                    fontFamily: t.body, fontSize: fullSize ? 10 : 8,
                    letterSpacing: '0.02em', lineHeight: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'clip',
                    /* Color/background/weight cycle via per-tab keyframe */
                    animation: `tab-active-${i} 8s linear infinite`,
                  }}>{lbl}</span>
                ))}
              </div>
              {/* "↑ 上のタブをクリック" caption — sits inside the image, directly below the tab strip */}
              <div style={{
                position: 'absolute',
                top: fullSize ? 34 : 28, left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 3,
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: fullSize ? '2px 8px' : '1px 6px',
                background: 'rgba(0,0,0,0.45)',
                border: '1px solid rgba(255,255,255,0.14)',
                borderRadius: 999,
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                fontFamily: t.body, fontSize: fullSize ? 9 : 7,
                fontWeight: 600, color: '#fff',
                whiteSpace: 'nowrap',
                animation: 'pv-promo-card-pop .55s .85s ease both',
              }}>
                <span style={{ animation: 'pv-promo-arrow-bob 1.6s ease-in-out infinite' }}>↑</span>
                {lang === 'en' ? 'Click the tabs above' : '上のタブをクリック'}
              </div>
              {/* Bottom vignette */}
              <div style={{
                position: 'absolute', inset: 0,
                boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)',
                pointerEvents: 'none',
              }} />
            </div>

          </div>{/* ====== END right column ====== */}
          </div>
        );
      })()}
    </div>
  );
}

/* Rotating tagline used inside the masthead panel — longer, more substantive lines */
function RotatingTagline({ t, totalCount }) {
  const lang = useLang();
  const taglines = lang === 'en' ? [
    `${totalCount} proposals adopted by the Japan community from F2 to F14 — videos, completion reports, GitHub repos, and SNS links all aggregated in one place.`,
    'Sector · Accounts · Timeline · Network · Chart — read the same dataset from six different angles. One click to jump to each source.',
    'Dawn (IdeaScale) → Institutionalization (Milestone system) → Turmoil & Pause (Catalyst under review in 2026). A 13-round overview of the journey and the present.',
    'Completion-report PDFs, Town Hall videos, GitHub repositories, X / LinkedIn profiles — factual information only, sourced from Catalyst Explorer & projectcatalyst.io.',
    'An unofficial community project. No affiliation with IOG, Cardano Foundation, or EMURGO. Not investment advice.',
  ] : [
    `F2 から F14 まで、日本コミュニティから採択された ${totalCount} 件のプロポーザル ─ 動画・完了レポート・GitHub・SNS まで関連リンクを集約。`,
    '業界別 ・ アカウント別 ・ 時系列 ・ 関係図 ・ チャート ─ 同じデータを 6 つの視点で読み解く。各サイトへワンクリックで遷移。',
    '黎明期 ( IdeaScale ) → 制度化 ( Milestone 制度導入 ) → 混迷と停止 ( 2026 年 Catalyst 見直し中 )。13 ラウンドの歩みと現在地を俯瞰。',
    '完了レポート PDF、Town Hall 動画、GitHub リポジトリ、X / LinkedIn プロフィール ─ Catalyst Explorer & projectcatalyst.io から事実情報のみ抽出。',
    '本サイトは非公式コミュニティプロジェクト。IOG ・ Cardano Foundation ・ EMURGO とは無関係。投資助言を目的としません。',
  ];
  const [idx, setIdx] = useStateR(0);
  React.useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % taglines.length), 5500);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      position: 'relative',
      fontFamily: t.body, fontSize: 12.5, color: t.inkDim, lineHeight: 1.55,
      minHeight: 40, marginTop: 4,
    }}>
      {taglines.map((line, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          opacity: i === idx ? 1 : 0,
          transform: i === idx ? 'translateY(0)' : 'translateY(6px)',
          transition: 'opacity .5s ease, transform .5s ease',
          pointerEvents: i === idx ? 'auto' : 'none',
        }}>{line}</div>
      ))}
    </div>
  );
}

const miniBtn = {
  width: 26, height: 26, borderRadius: '50%',
  background: 'rgba(0,0,0,0.45)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.18)',
  color: '#fff', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: 0,
};

function HeroCard({ p }) {
  const t = useT();
  return (
    <div style={{
      position: 'relative',
      width: '100%', height: 460, flexShrink: 0,
      borderRadius: t.radiusLg,
      overflow: 'hidden', cursor: 'pointer',
      isolation: 'isolate',
      boxShadow: t.mode === 'light' ? '0 20px 50px rgba(0,0,0,0.18)' : 'none',
    }}>
      <ABackground hue={p.hue} intensity="rich" />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.7) 100%)',
      }} />

      <div style={{
        position: 'absolute', top: 22, left: 22, right: 22,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          fontFamily: t.body, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: '#fff', opacity: 0.9,
        }}>FEATURED</span>
        <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
        <span style={{
          fontFamily: t.body, fontSize: 11, fontWeight: 600,
          color: '#fff', opacity: 0.85, letterSpacing: '0.05em',
        }}>{p.cat}</span>
        <div style={{ flex: 1 }} />
        <AFundChip fund={p.f} />
      </div>

      <div style={{
        position: 'absolute', left: 32, right: 32, bottom: 28,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32,
      }}>
        <div style={{ maxWidth: 580 }}>
          <div style={{
            fontFamily: t.display, fontSize: 38, fontWeight: 700,
            color: '#fff', lineHeight: 1.08,
            letterSpacing: '-0.025em',
            textWrap: 'balance', marginBottom: 14,
          }}>{p.title}</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
            fontFamily: t.body, fontSize: 14, color: '#fff', opacity: 0.85,
          }}>
            <AAvatar initials={p.initials} hue={p.hue} size={24} />
            <span style={{ fontWeight: 500 }}>{p.proposer}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <AStatusDot status={p.s} size={6} />
            <span style={{ fontWeight: 500 }}>{p.s}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <AAdaAmount raw={p._raw} amount={p.amount} size={14} color="#fff" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 22px',
            background: '#fff', color: '#000',
            border: 'none', borderRadius: 999,
            fontFamily: t.body, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', letterSpacing: '-0.005em',
            whiteSpace: 'nowrap',
          }}>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="#000"><path d="M3 1.5L10 6L3 10.5V1.5Z" /></svg>
            動画を見る
          </button>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 22px',
            background: t.buttonGhost,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            color: t.buttonGhostText,
            border: `1px solid ${t.buttonGhostBorder}`, borderRadius: 999,
            fontFamily: t.body, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', letterSpacing: '-0.005em',
            whiteSpace: 'nowrap',
          }}>
            詳細を見る
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Poster card ----------

function PosterCard({ p, size = 'md', fluid = false, onOpenPanelView }) {
  const t = useT();
  const lang = useLang();
  const displayTitle = lang === 'en' ? (p.title_en || p.title) : (p.title || p.title_en);
  const SIZES = {
    sm: { w: 200, ratio: '1 / 1', title: 14, sub: 12 },
    md: { w: 240, ratio: '1 / 1', title: 15, sub: 12.5 },
    lg: { w: 320, ratio: '4 / 3', title: 17, sub: 13 },
  };
  const cfg = SIZES[size];
  const widthStyle = fluid ? { width: '100%', minWidth: 0 } : { width: cfg.w, flexShrink: 0 };
  return (
    <div
      onClick={() => {
        if (p.videoUrl) {
          /* Unlisted / embed-disabled videos: skip the in-page modal (it would fail) and open the YouTube page directly in a new tab */
          if (p.unlistedVideo || p.embedDisabledVideo) {
            window.open(p.videoUrl, '_blank', 'noopener');
            return;
          }
          const vid = window.extractYouTubeId && window.extractYouTubeId(p.videoUrl);
          if (vid && window.openVideoModal) { window.openVideoModal(vid, p.videoUrl); return; }
          window.open(p.videoUrl, '_blank', 'noopener');
        } else if (p.explorer) {
          window.open(p.explorer, '_blank', 'noopener');
        }
      }}
      style={{
        ...widthStyle,
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
        /* Unified outer frame wraps image + text together */
        borderRadius: t.radius, overflow: 'hidden',
        border: `1px solid ${t.hairlineStrong}`,
        background: t.panel,
        boxShadow: t.cardShadow,
      }}
    >
      <div style={{
        position: 'relative', aspectRatio: cfg.ratio,
        overflow: 'hidden',
        background: t.panel,
        borderBottom: `1px solid ${t.hairline}`,
      }}>
        <ABackground hue={p.hue} thumbUrl={p.videoThumb} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.65) 100%)',
        }} />
        {/* Inner outline ring for additional contrast on bright thumbnails */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.18)',
        }} />
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 3 }}>
          <AStatusPill status={p.s} />
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3 }}>
          <AFundChip fund={p.f} />
        </div>
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 3,
          fontFamily: t.body, fontSize: 10.5, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: t.cat[p.cat] || '#fff', opacity: 0.95,
          textShadow: '0 1px 3px rgba(0,0,0,0.6)',
        }}>{p.cat}</div>
        {/* "No video" centered overlay — same layout family as unlisted / embed-disabled for visual consistency */}
        {!p.videoUrl && !p.unlistedVideo && !p.embedDisabledVideo && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 8, padding: 16,
            background: 'rgba(0,0,0,0.74)',
            backdropFilter: 'blur(2px)',
            pointerEvents: 'none',
          }}>
            {/* No-video badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 10px',
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.22)',
              borderRadius: 999,
            }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <rect x="1.5" y="3" width="7" height="6" rx="0.8" stroke="#fff" strokeWidth="1.2"/>
                <path d="M8.5 5.2l2-1.2v4l-2-1.2" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M2 2l8 8" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              <span style={{
                fontFamily: t.body, fontSize: 9, fontWeight: 700,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: '#fff',
              }}>{lang === 'en' ? 'No video' : '動画なし'}</span>
            </div>
            {/* Explanation text */}
            <div style={{
              fontFamily: t.body, fontSize: 11.5, lineHeight: 1.55,
              color: 'rgba(255,255,255,0.78)', textAlign: 'center',
              maxWidth: 220,
            }}>
              {lang === 'en' ? (
                <>No completion video.<br/>Check the other links.</>
              ) : (
                <>完了動画はありません<br/>他の資料をご確認ください</>
              )}
            </div>
          </div>
        )}
        {/* Unlisted / embed-disabled video notice — covers the media area with an explanation instead of a thumbnail */}
        {(p.unlistedVideo || p.embedDisabledVideo) && p.videoUrl && (() => {
          const isUnlisted = p.unlistedVideo;
          const badgeText = isUnlisted
            ? (lang === 'en' ? 'Unlisted' : '限定公開')
            : (lang === 'en' ? 'Embed Disabled' : '埋め込み無効');
          const bodyText = isUnlisted
            ? (lang === 'en' ? <>This video is unlisted.<br/>Open the link to view.</> : <>限定公開のため<br/>リンクからご確認ください</>)
            : (lang === 'en' ? <>Embedded playback is disabled.<br/>Open on YouTube to view.</> : <>埋め込み再生が無効です<br/>YouTube で再生してください</>);
          const ctaText = isUnlisted
            ? (lang === 'en' ? 'Open' : 'リンクを開く')
            : (lang === 'en' ? 'Open on YouTube' : 'YouTubeで開く');
          return (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: 16,
              background: 'rgba(0,0,0,0.78)',
              backdropFilter: 'blur(2px)',
              pointerEvents: 'none',
            }}>
              {/* Badge: lock for unlisted, external-link icon for embed-disabled */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: 999,
              }}>
                {isUnlisted ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <rect x="2.5" y="5.5" width="7" height="5" rx="1" stroke="#fff" strokeWidth="1.2" />
                    <path d="M4 5.5V4a2 2 0 1 1 4 0v1.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M6.5 1.5h4v4M10.5 1.5L5.5 6.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 7v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                )}
                <span style={{
                  fontFamily: t.body, fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: '#fff',
                }}>{badgeText}</span>
              </div>
              {/* Explanation text */}
              <div style={{
                fontFamily: t.body, fontSize: 11.5, lineHeight: 1.55,
                color: 'rgba(255,255,255,0.85)', textAlign: 'center',
                maxWidth: 220,
              }}>{bodyText}</div>
              {/* CTA hint */}
              <div style={{
                fontFamily: t.mono, fontSize: 9, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: t.accent || '#d4a04a',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                {ctaText} <span>↗</span>
              </div>
            </div>
          );
        })()}
        {p.videoUrl && (
          <div style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 3 }}>
            <APlayBadge size={36} />
          </div>
        )}
      </div>
      <div style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', gap: 8,
        padding: '14px 14px 14px',
        flex: 1,
      }}>
        {/* Title — larger, clearer hierarchy */}
        <div style={{
          fontFamily: t.display, fontSize: 16, fontWeight: 700,
          color: t.ink, lineHeight: 1.32, letterSpacing: '-0.02em',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', textWrap: 'pretty',
          minHeight: 42,  /* reserve 2 lines so cards align */
        }}>{displayTitle}</div>

        {/* Proposer line — larger, distinct from amount */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: t.body, fontSize: 13, color: t.inkDim,
          minWidth: 0,
        }}>
          <span style={{
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1, minWidth: 0, fontWeight: 500,
          }}>{p.proposer}</span>
        </div>

        {/* Amount on its own line — visual prominence */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          paddingTop: 2, paddingBottom: 2,
          borderTop: `1px solid ${t.hairline}`,
        }}>
          <span style={{
            fontFamily: t.mono, fontSize: 10, color: t.inkMuted,
            letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>{lang === 'en' ? 'Awarded' : '採択額'}</span>
          <AAdaAmount raw={p._raw} amount={p.amount} size={14} color={t.ink} />
        </div>

        {/* Team avatars + related count */}
        {p.team && p.team.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ATeamStack people={p.team} size={18} max={4} />
            <span style={{
              fontFamily: t.body, fontSize: 11, color: t.inkMuted,
              letterSpacing: '0.02em',
            }}>+{p.team.length - 1} {lang === 'en' ? 'related' : '関連'}</span>
          </div>
        )}

        {/* ── Row 1: small icon buttons (all fit in one line) ── */}
        <div style={{ marginTop: 'auto' }}>
          <LinkIconStrip p={p} hideReport />
        </div>

        {/* ── Row 2: 4 fixed-position badge slots (提案書 | MS | 動画 | 完了Report) ──
            Empty slots keep their space so layout is consistent across all cards. */}
        <LinkBadgeRow p={p} t={t} lang={lang} />

        {/* ── Row 3: panel view button only, right-aligned ── */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
          <button
            onClick={(e) => { e.stopPropagation(); if (onOpenPanelView) onOpenPanelView(p.id); }}
            title={lang === 'en' ? 'Open in panel view (1 proposal across all views)' : 'パネルビューで開く (1提案を全ビュー同時表示)'}
            style={{
              width: 32, height: 32,
              padding: 0,
              background: '#fff',
              border: 'none',
              borderRadius: 7,
              color: '#0a0a0c',
              cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              animation: 'pv-trigger-pulse 1.8s ease-in-out infinite',
              transition: 'transform .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            <svg width="15" height="15" viewBox="0 0 12 12" fill="none">
              <rect x="1.2" y="1.2" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="6.8" y="1.2" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="1.2" y="6.8" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="6.8" y="6.8" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------- Poster (LIST mode) — wide horizontal row ----------

function PosterListItem({ p, onOpenPanelView }) {
  const t = useT();
  const lang = useLang();
  const displayTitle = lang === 'en' ? (p.title_en || p.title) : (p.title || p.title_en);
  const handleClick = () => {
    if (p.videoUrl) {
      if (p.unlistedVideo || p.embedDisabledVideo) { window.open(p.videoUrl, '_blank', 'noopener'); return; }
      const vid = window.extractYouTubeId && window.extractYouTubeId(p.videoUrl);
      if (vid && window.openVideoModal) { window.openVideoModal(vid, p.videoUrl); return; }
      window.open(p.videoUrl, '_blank', 'noopener');
    } else if (p.explorer) {
      window.open(p.explorer, '_blank', 'noopener');
    }
  };
  /* Cell wrapper used by the right-side columns — stretches to row height so the
     left-side divider line spans full height (table-style), content vertically centered. */
  const Cell = ({ children, width, align = 'flex-start', last = false, noDivider = false }) => (
    <div style={{
      width, flexShrink: 0, alignSelf: 'stretch',
      display: 'flex', alignItems: 'center', justifyContent: align,
      padding: last ? '0 0 0 12px' : '0 12px',
      borderLeft: noDivider ? 'none' : `1px solid ${t.hairline}`,
    }}>{children}</div>
  );
  return (
    <div
      onClick={handleClick}
      style={{
        display: 'grid',
        /* thumb | title-block (flex) | team | links | amount | REPORT | PANEL VIEW
           — status pill + fund chip moved INTO the title block (above the title),
           freeing horizontal space and pairing them with the proposal context. */
        gridTemplateColumns: '176px minmax(0, 1fr) 90px 210px 110px 130px 86px',
        gap: 0, alignItems: 'stretch',
        padding: '10px 14px 10px 10px',
        borderRadius: 10,
        border: `1px solid ${t.hairline}`,
        background: t.panel,
        cursor: 'pointer',
        transition: 'background .15s, border-color .15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.hairlineStrong; e.currentTarget.style.background = t.elevated; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.hairline; e.currentTarget.style.background = t.panel; }}
    >
      {/* Thumb — wide landscape on the left (16:9-ish) */}
      <div style={{
        position: 'relative', width: 176, height: 99,
        borderRadius: 6, overflow: 'hidden',
        border: `1px solid ${t.hairlineStrong}`,
        background: t.panel,
      }}>
        <ABackground hue={p.hue} thumbUrl={p.videoThumb} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)' }} />
        {(p.unlistedVideo || p.embedDisabledVideo) && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.78)',
            fontFamily: t.body, fontSize: 8, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#fff',
          }}>{p.unlistedVideo ? (lang === 'en' ? 'Unlisted' : '限定公開') : (lang === 'en' ? 'Embed Off' : '埋込無効')}</div>
        )}
        {!p.videoUrl && !p.unlistedVideo && !p.embedDisabledVideo && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: t.body, fontSize: 7.5, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
          }}>{lang === 'en' ? 'No video' : '動画なし'}</div>
        )}
        {p.videoUrl && !p.unlistedVideo && !p.embedDisabledVideo && (
          <div style={{
            position: 'absolute', bottom: 4, right: 4,
            width: 18, height: 18, borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="#fff"><path d="M2 1l5 3-5 3V1Z"/></svg>
          </div>
        )}
      </div>

      {/* Title block — status pill + fund chip on top, then big title, then category · proposer */}
      <div style={{
        minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5,
        justifyContent: 'center',
        padding: '0 12px 0 14px',
      }}>
        {/* Status + Fund — sit above the title for at-a-glance triage */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <AStatusPill status={p.s} />
          <AFundChip fund={p.f} />
        </div>
        <div style={{
          fontFamily: t.display, fontSize: 17, fontWeight: 700,
          color: t.ink, letterSpacing: '-0.02em', lineHeight: 1.25,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{displayTitle}</div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: t.body, fontSize: 12, color: t.inkDim,
          minWidth: 0,
        }}>
          <span style={{
            fontFamily: t.body, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: (t.cat && t.cat[p.cat]) || t.inkMuted,
            flexShrink: 0,
          }}>{p.cat}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{p.proposer}</span>
        </div>
      </div>

      {/* === COL: Team — bigger avatars (22px) within the same row height === */}
      <Cell width={90} align="flex-start">
        {p.team && p.team.length > 1 ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <ATeamStack people={p.team} size={22} max={3} />
            <span style={{
              fontFamily: t.mono, fontSize: 11, fontWeight: 600,
              color: t.inkMuted, letterSpacing: '0.02em',
            }}>+{p.team.length - 1}</span>
          </div>
        ) : (
          <span style={{ fontFamily: t.mono, fontSize: 10, color: t.inkMuted, opacity: 0.5 }}>—</span>
        )}
      </Cell>

      {/* === COL: Links (report stays in its own dedicated column to the right) === */}
      <Cell width={210} align="flex-start">
        <div
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 26 }}
          onClick={(e) => e.stopPropagation()}
        >
          <LinkIconStrip p={p} hideReport />
        </div>
      </Cell>

      {/* === COL: Amount === */}
      <Cell width={110} align="flex-end">
        <div style={{
          display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-end',
          justifyContent: 'center', gap: 3,
        }}>
          <span style={{
            fontFamily: t.mono, fontSize: 8.5, fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: t.inkMuted, lineHeight: 1,
          }}>{lang === 'en' ? 'Awarded' : '採択額'}</span>
          <AAdaAmount raw={p._raw} amount={p.amount} size={14} color={t.ink} />
        </div>
      </Cell>

      {/* === COL: Completion report — dedicated column with the prominent green badge ===
          Stable position across rows; the column shows a "—" placeholder when no report,
          so the panel-view CTA to the right always lines up. */}
      <Cell width={130} align="flex-end">
        {(p.cr || p.report) && p.s === '完了' ? (
          <a
            href={p.cr || (p.report && p.report.url)}
            target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={lang === 'en' ? 'Completion Report' : '完了レポート'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              height: 26, padding: '0 11px',
              background: t.green ? (t.green + '22') : 'rgba(125,214,163,0.18)',
              border: `1px solid ${t.green ? (t.green + '55') : 'rgba(125,214,163,0.42)'}`,
              borderRadius: 999,
              fontFamily: t.body, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: t.green || '#7dd6a3',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>
            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
              <path d="M2.5 1h4l2 2v5.5a.5.5 0 0 1-.5.5h-5.5a.5.5 0 0 1-.5-.5V1.5a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/>
              <path d="M6 1v2.5h2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{lang === 'en' ? 'Report' : '完了レポート'}</span>
          </a>
        ) : (
          <span style={{ fontFamily: t.mono, fontSize: 10, color: t.inkMuted, opacity: 0.4 }}>—</span>
        )}
      </Cell>

      {/* === COL: BIG Panel-View trigger — white pulsing button, matches the grid card's CTA ===
          Sits as the absolute rightmost cell, AFTER the report column. */}
      <Cell width={86} align="center" last noDivider>
        <button
          onClick={(e) => { e.stopPropagation(); if (onOpenPanelView) onOpenPanelView(p.id); }}
          title={lang === 'en' ? 'Open in panel view (1 proposal across all views)' : 'パネルビューで開く (1提案を全ビュー同時表示)'}
          style={{
            width: 56, height: 44,
            padding: 0,
            background: '#fff',
            border: 'none',
            borderRadius: 8,
            color: '#0a0a0c',
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pv-trigger-pulse 1.8s ease-in-out infinite',
            transition: 'transform .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
        >
          <svg width="20" height="20" viewBox="0 0 12 12" fill="none">
            <rect x="1.2" y="1.2" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="6.8" y="1.2" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="1.2" y="6.8" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
            <rect x="6.8" y="6.8" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
          </svg>
        </button>
      </Cell>
    </div>
  );
}

// ---------- Poster (COMPACT mode) — small tile, thumb + 1-line title ----------

function PosterCompact({ p }) {
  const t = useT();
  const lang = useLang();
  const displayTitle = lang === 'en' ? (p.title_en || p.title) : (p.title || p.title_en);
  const handleClick = () => {
    if (p.videoUrl) {
      if (p.unlistedVideo || p.embedDisabledVideo) { window.open(p.videoUrl, '_blank', 'noopener'); return; }
      const vid = window.extractYouTubeId && window.extractYouTubeId(p.videoUrl);
      if (vid && window.openVideoModal) { window.openVideoModal(vid, p.videoUrl); return; }
      window.open(p.videoUrl, '_blank', 'noopener');
    } else if (p.explorer) {
      window.open(p.explorer, '_blank', 'noopener');
    }
  };
  return (
    <div
      onClick={handleClick}
      title={displayTitle + ' · ' + p.proposer + ' · ' + p.f + ' · ' + p.amount}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
        borderRadius: 8, overflow: 'hidden',
        border: `1px solid ${t.hairline}`,
        background: t.panel,
        transition: 'border-color .15s, transform .15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = t.hairlineStrong; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = t.hairline; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{
        position: 'relative', aspectRatio: '1 / 1',
        overflow: 'hidden',
        borderBottom: `1px solid ${t.hairline}`,
      }}>
        <ABackground hue={p.hue} thumbUrl={p.videoThumb} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
        {/* Fund chip — top-right, only one chip to keep it minimal */}
        <span style={{
          position: 'absolute', top: 5, right: 5,
          padding: '1px 5px',
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 4,
          fontFamily: t.mono, fontSize: 8, fontWeight: 700,
          color: '#fff',
          backdropFilter: 'blur(4px)',
        }}>{p.f}</span>
        {/* Status dot — top-left, just a colored dot */}
        <span style={{
          position: 'absolute', top: 7, left: 6,
          width: 6, height: 6, borderRadius: '50%',
          background: p.s === '完了' ? '#7dd6a3' : p.s === '進行中' ? '#e5a445' : '#d77',
          boxShadow: '0 0 4px rgba(0,0,0,0.6)',
        }} title={p.s} />
        {/* Unlisted/embed overlay (compact) */}
        {(p.unlistedVideo || p.embedDisabledVideo) && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.78)',
            fontFamily: t.body, fontSize: 8, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#fff', textAlign: 'center', padding: 4,
          }}>{p.unlistedVideo ? (lang === 'en' ? 'Unlisted' : '限定公開') : (lang === 'en' ? 'Embed Off' : '埋込無効')}</div>
        )}
        {/* "No video" indicator for compact mode — small bottom-left mark */}
        {!p.videoUrl && !p.unlistedVideo && !p.embedDisabledVideo && (
          <span style={{
            position: 'absolute', bottom: 4, left: 6,
            fontFamily: t.body, fontSize: 7.5, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.6)',
            textShadow: '0 1px 2px rgba(0,0,0,0.7)',
          }}>{lang === 'en' ? 'No video' : '動画なし'}</span>
        )}
        {/* Completion report mini badge — bottom-right of thumb */}
        {(p.cr || p.report) && p.s === '完了' && (
          <span style={{
            position: 'absolute', bottom: 4, right: 4,
            width: 16, height: 16, borderRadius: '50%',
            background: t.green ? (t.green + 'cc') : 'rgba(125,214,163,0.85)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#0a0a0c',
            fontFamily: t.mono, fontSize: 8, fontWeight: 800,
            boxShadow: '0 1px 3px rgba(0,0,0,0.55)',
          }} title={lang === 'en' ? 'Completion Report available' : '完了レポートあり'}>✓</span>
        )}
      </div>
      <div style={{ padding: '6px 8px 8px' }}>
        <div style={{
          fontFamily: t.display, fontSize: 11, fontWeight: 600,
          color: t.ink, lineHeight: 1.25, letterSpacing: '-0.01em',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minHeight: 27,
        }}>{displayTitle}</div>
      </div>
    </div>
  );
}

// ---------- HeroGuideTile — 2-column-wide featured tile for the top-row explanation video ----------

function HeroGuideTile({ lang, t, fillHeight = false, onOpenGuide }) {
  /* Click → opens the in-page walkthrough modal (built below).
     If you ever set window.GUIDE_VIDEO_URL, that takes priority and opens YouTube instead. */
  const GUIDE_VIDEO = (typeof window !== 'undefined' && window.GUIDE_VIDEO_URL) || null;
  const handleClick = () => {
    if (GUIDE_VIDEO) {
      const vid = window.extractYouTubeId && window.extractYouTubeId(GUIDE_VIDEO);
      if (vid && window.openVideoModal) { window.openVideoModal(vid, GUIDE_VIDEO); return; }
      window.open(GUIDE_VIDEO, '_blank', 'noopener');
      return;
    }
    if (onOpenGuide) onOpenGuide();
  };

  /* Auto-cycling preview — mirrors the 5 modal slides so the tile teases the content. */
  const totalCountForPreview   = (window.TOTAL_COUNT || 130);
  const totalAdaDispForPreview = (window.TOTAL_ADA_DISPLAY || '21.6M');
  const previews = lang === 'en' ? [
    { tag: '01 / 06', title: <>How to <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>read</span> this catalog.</>,
      body: `${totalCountForPreview} proposals · F2 → F14 · ${totalAdaDispForPreview} ₳ — filters, views, completion reports, and links in 1 minute.` },
    { tag: '02 / 06', title: <>Filter to <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>what you want</span>.</>,
      body: 'Three filter rows — STATUS / FUND / CATEGORY — combine freely to narrow down.' },
    { tag: '03 / 06', title: <>Three <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>display</span> modes.</>,
      body: 'Grid for visuals, List for horizontal scan, Compact for everything at a glance.' },
    { tag: '04 / 06', title: <>Anatomy of <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>a card</span>.</>,
      body: 'Status, fund, category, title, proposer, awarded ADA, links, and the green completion-report badge.' },
    { tag: '05 / 06', title: <>Four <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>video</span> states.</>,
      body: 'Public · Unlisted · Embed-off · No video — the card tells you which case it is.' },
    { tag: '06 / 06', title: <><span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>Panel</span> view.</>,
      body: 'Open one proposal across all 5 views at once — plus a Links panel that previews related sites side-by-side.' },
  ] : [
    { tag: '01 / 06', title: <>カタログの<span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>歩き方</span>。</>,
      body: `${totalCountForPreview} 件の採択提案 · F2→F14 · ${totalAdaDispForPreview} ₳。フィルタ・ビュー・完了レポートの使い方を 1 分で。` },
    { tag: '02 / 06', title: <>見たいものに<span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>絞り込む</span>。</>,
      body: 'STATUS / FUND / CATEGORY の 3 段フィルタ。自由に組み合わせて絞り込める。' },
    { tag: '03 / 06', title: <>3 つの<span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>表示</span>モード。</>,
      body: 'グリッド（ビジュアル）/ リスト（横並び）/ コンパクト（俯瞰）。好きな密度で見れる。' },
    { tag: '04 / 06', title: <>カードの<span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>読み方</span>。</>,
      body: 'ステータス・Fund・カテゴリ・提案者・採択額・リンク・完了レポート。右下の緑バッジが完了マーク。' },
    { tag: '05 / 06', title: <>動画の<span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>4 つの状態</span>。</>,
      body: '公開 / 限定公開 / 埋込無効 / 動画なし — カードの表示でどの状態か一目で分かる。' },
    { tag: '06 / 06', title: <><span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>パネル</span>ビュー。</>,
      body: '1つの提案を全5ビューで同時にハイライト表示。+「リンク確認」パネルで関連サイトを並べて開ける。' },
  ];
  const [previewIdx, setPreviewIdx] = useStateR(0);
  React.useEffect(() => {
    const id = setInterval(() => setPreviewIdx(i => (i + 1) % previews.length), 5500);
    return () => clearInterval(id);
  }, [previews.length]);
  const curPreview = previews[previewIdx];

  /* Build a montage from real proposal thumbnails + view screenshots.
     This makes the tile feel like a curated "trailer" of the catalog itself. */
  const pool = (typeof window !== 'undefined' && window.THUMB_POOL) || [];
  const VIEW_SHOTS = ['shots/sector.png', 'shots/account.png', 'shots/timeline.png', 'shots/network.png', 'shots/chart.png'];
  /* Pick 8 evenly-spaced thumbnails so it doesn't always show the same 8 */
  const mosaicThumbs = [];
  if (pool.length) {
    const step = Math.max(1, Math.floor(pool.length / 8));
    for (let i = 0, taken = 0; i < pool.length && taken < 8; i += step) {
      mosaicThumbs.push(pool[i]); taken++;
    }
  }
  while (mosaicThumbs.length < 8) mosaicThumbs.push(null);

  /* Totals (use globals if available — otherwise fall back to literals) */
  const totalCount   = (window.TOTAL_COUNT || 130);
  const totalAdaDisp = (window.TOTAL_ADA_DISPLAY || '21.6M');

  return (
    <div
      onClick={handleClick}
      style={{
        ...(fillHeight ? { width: '100%', height: '100%' } : { gridColumn: 'span 2' }),
        position: 'relative',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',  /* always clickable now (opens modal or video) */
        borderRadius: t.radius, overflow: 'hidden',
        border: `1px solid ${t.hairlineStrong}`,
        background: '#000',
        boxShadow: t.cardShadow,
        minHeight: fillHeight ? 320 : 240,
        isolation: 'isolate',
      }}
    >
      <style>{`
        @keyframes hero-guide-orb-1  { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(8%,-6%) scale(1.15);} }
        @keyframes hero-guide-orb-2  { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-6%,8%) scale(1.18);} }
        @keyframes hero-guide-sweep  { 0%{transform:translateX(-110%);} 60%{transform:translateX(120%);} 100%{transform:translateX(120%);} }
        @keyframes hero-guide-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.18), 0 8px 30px rgba(0,0,0,0.55);} 50%{box-shadow:0 0 0 12px rgba(255,255,255,0), 0 12px 38px rgba(0,0,0,0.7);} }
        @keyframes hero-mosaic-drift { 0%,100%{transform:scale(1.06) translate(0,0);} 50%{transform:scale(1.12) translate(2%,-1.5%);} }
        @keyframes hero-strip-slide  { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
        @keyframes hero-counter-glow { 0%,100%{text-shadow:0 0 0 rgba(255,255,255,0);} 50%{text-shadow:0 0 12px rgba(255,255,255,0.25);} }
        @keyframes guide-preview-in  { 0%{opacity:0; transform:translateY(6px);} 100%{opacity:1; transform:translateY(0);} }
      `}</style>

      {/* === LAYER 1: hue base + drifting orbs === */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden',
        background: 'linear-gradient(135deg, oklch(16% 0.10 280) 0%, oklch(9% 0.06 220) 100%)',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%', width: '70%', height: '90%',
          background: 'radial-gradient(circle at 30% 30%, oklch(60% 0.24 280 / 0.65) 0%, transparent 60%)',
          filter: 'blur(4px)', mixBlendMode: 'plus-lighter',
          animation: 'hero-guide-orb-1 9s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30%', right: '-10%', width: '70%', height: '90%',
          background: 'radial-gradient(circle at 70% 70%, oklch(60% 0.22 200 / 0.65) 0%, transparent 60%)',
          filter: 'blur(4px)', mixBlendMode: 'plus-lighter',
          animation: 'hero-guide-orb-2 11s ease-in-out infinite',
        }} />
      </div>

      {/* === LAYER 2: photo mosaic (real proposal thumbs, heavily dimmed) === */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: 2,
        opacity: 0.32,
        mixBlendMode: 'luminosity',
      }}>
        {mosaicThumbs.map((url, i) => (
          <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
            {url && (
              <img
                src={url}
                alt=""
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  filter: 'grayscale(1) contrast(0.85) brightness(0.7)',
                  animation: `hero-mosaic-drift ${8 + (i % 4) * 1.2}s ease-in-out infinite alternate`,
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* === LAYER 3: ticker strip of view screenshots (sector/account/timeline/network/chart) === */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '38%',
        height: 56, overflow: 'hidden',
        opacity: 0.5,
        maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)',
      }}>
        <div style={{
          display: 'flex', gap: 8, width: 'max-content',
          animation: 'hero-strip-slide 28s linear infinite',
        }}>
          {/* duplicated for seamless loop */}
          {[...VIEW_SHOTS, ...VIEW_SHOTS, ...VIEW_SHOTS].map((src, i) => (
            <div key={i} style={{
              width: 100, height: 56,
              borderRadius: 4, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.12)',
              flexShrink: 0,
            }}>
              <img src={src} alt=""
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  filter: 'saturate(1.1) brightness(0.85)',
                  display: 'block',
                }} />
            </div>
          ))}
        </div>
      </div>

      {/* === LAYER 4: noise grain + sweeping light === */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '3px 3px', mixBlendMode: 'overlay',
      }} />
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: '35%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          animation: 'hero-guide-sweep 7s ease-out infinite',
          mixBlendMode: 'plus-lighter',
        }} />
      </div>

      {/* === LAYER 5: darken (center heaviest, so the text panel sits clean) === */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `
          radial-gradient(80% 60% at 50% 50%, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 100%),
          linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.82) 100%)
        `,
      }} />

      {/* === LAYER 6: foreground — top eyebrow / middle (centered) / bottom strip === */}
      <div style={{
        position: 'relative', zIndex: 3,
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        padding: 18, minHeight: 0, flex: 1,
        rowGap: 14,
      }}>
        {/* Top eyebrow — Guide pill + auto-updating step indicator */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
          <span style={{
            padding: '3px 9px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: 999,
            fontFamily: t.body, fontSize: 9.5, fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: '#fff',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          }}>{lang === 'en' ? 'Guide' : 'ガイド'}</span>
          {/* Step indicator — moves through 1/5 → 5/5 alongside the preview cycle */}
          <span style={{
            fontFamily: t.mono, fontSize: 9, fontWeight: 700,
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.75)',
            transition: 'color .3s',
          }}>{curPreview.tag}</span>
          <span style={{
            fontFamily: t.mono, fontSize: 9, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
          }}>{lang === 'en' ? '· Catalyst Japan' : '· Catalyst Japan'}</span>
        </div>

        {/* === Middle row — glass panel + step dots, vertically centered === */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          gap: 12, minHeight: 0,
        }}>
        {/* Center: glass-morphic panel — title & body cross-fade as the preview cycles */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: 14,
          background: 'rgba(0,0,0,0.45)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 12,
          backdropFilter: 'blur(14px) saturate(140%)',
          WebkitBackdropFilter: 'blur(14px) saturate(140%)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
          minHeight: 92,
        }}>
          <div style={{
            flexShrink: 0,
            width: 58, height: 58, borderRadius: '50%',
            background: 'rgba(255,255,255,0.94)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            animation: 'hero-guide-pulse 2.4s ease-in-out infinite',
            color: '#0a0a0c',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4l13 8-13 8V4Z" />
            </svg>
          </div>
          {/* Re-keyed wrapper so each preview index triggers the entry animation */}
          <div
            key={previewIdx}
            style={{
              flex: 1, minWidth: 0,  /* takes all remaining width — no shrink-to-content */
              display: 'flex', flexDirection: 'column', gap: 4,
              animation: 'guide-preview-in .55s cubic-bezier(.2,.7,.3,1) both',
            }}
          >
            <h3 style={{
              margin: 0, width: '100%',
              fontFamily: t.display, fontSize: 22, fontWeight: 700,
              color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.1,
              textShadow: '0 2px 12px rgba(0,0,0,0.7)',
              overflow: 'hidden', wordBreak: 'break-word',
            }}>{curPreview.title}</h3>
            <p style={{
              margin: 0, width: '100%',
              fontFamily: t.body, fontSize: 11.5, lineHeight: 1.5,
              color: 'rgba(255,255,255,0.82)',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', wordBreak: 'break-word',
            }}>{curPreview.body}</p>
          </div>
        </div>

        {/* Step dots — visualizes the cycle position; clicking jumps to that preview */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 8px',
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.14)',
          borderRadius: 999,
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          alignSelf: 'flex-start',
        }} onClick={(e) => e.stopPropagation()}>
          {previews.map((_, i) => (
            <button key={i}
              onClick={() => setPreviewIdx(i)}
              title={previews[i].tag}
              style={{
                width: i === previewIdx ? 20 : 6, height: 6,
                borderRadius: 3,
                background: i === previewIdx ? '#fff' : 'rgba(255,255,255,0.32)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width .35s ease, background .25s ease',
              }} />
          ))}
        </div>
        </div>{/* end middle row (vertically centered) */}

        {/* Bottom: stats strip + CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 10, flexWrap: 'wrap',
        }}>
          {/* Stats: counts that emphasize scale */}
          <div style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 14,
            fontFamily: t.mono,
          }}>
            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
              <span style={{
                fontSize: 18, fontWeight: 700, color: '#fff',
                letterSpacing: '-0.01em', lineHeight: 1,
                animation: 'hero-counter-glow 4s ease-in-out infinite',
              }}>{totalCount}</span>
              <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{lang === 'en' ? 'proposals' : '提案'}</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>·</span>
            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1 }}>{totalAdaDisp}<span style={{ fontSize: 12, opacity: 0.6, marginLeft: 2 }}>₳</span></span>
              <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{lang === 'en' ? 'awarded' : '採択額'}</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>·</span>
            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1 }}>13</span>
              <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{lang === 'en' ? 'rounds' : 'ラウンド'}</span>
            </div>
          </div>

          {/* CTA */}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: t.body, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#fff',
            padding: '6px 13px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.28)',
            borderRadius: 999,
            backdropFilter: 'blur(10px)',
          }}>
            {lang === 'en' ? 'Watch' : '視聴する'} <span style={{ fontSize: 12 }}>→</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------- GuideWalkthroughModal — 5-slide in-page guide ----------

function GuideWalkthroughModal({ show, onClose, lang }) {
  const t = useT();
  const [step, setStep] = useStateR(0);

  /* Reset to first slide whenever modal opens; lock body scroll while open */
  React.useEffect(() => {
    if (show) {
      setStep(0);
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const onKey = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') setStep(s => Math.min(slides.length - 1, s + 1));
        if (e.key === 'ArrowLeft')  setStep(s => Math.max(0, s - 1));
      };
      window.addEventListener('keydown', onKey);
      return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
    }
  }, [show]);

  if (!show) return null;

  const totalCount   = (window.TOTAL_COUNT || 130);
  const totalAdaDisp = (window.TOTAL_ADA_DISPLAY || '21.6M');

  /* Local helpers for visual examples */
  const ExamplePill = ({ children, active }) => (
    <span style={{
      padding: '4px 12px',
      background: active ? t.ink : 'transparent',
      color: active ? t.bg : t.inkDim,
      border: 'none', borderRadius: 999,
      fontFamily: t.body, fontSize: 12, fontWeight: active ? 700 : 500,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
  const PillRow = ({ children }) => (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      padding: 3, background: t.elevated, borderRadius: 999,
      border: `1px solid ${t.hairline}`,
    }}>{children}</div>
  );

  const slides = [
    /* ───── Slide 1: What's inside ───── */
    {
      eyebrow: lang === 'en' ? 'Step 1 of 6' : '6 ステップ中 1',
      title: lang === 'en' ? 'What’s inside' : 'このカタログにあるもの',
      body: lang === 'en'
        ? 'Every Catalyst proposal funded by the Japan community, from Fund 2 through Fund 14. Real videos, completion reports, GitHub, X / LinkedIn — all linked back to the source.'
        : 'F2 から F14 まで、日本コミュニティから採択された Catalyst 提案の全件。動画、完了レポート、GitHub、X / LinkedIn まで、すべて元データへリンク。',
      visual: (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 36,
          padding: '20px 0',
        }}>
          {[
            { n: totalCount, label: lang === 'en' ? 'proposals' : '採択提案' },
            { n: totalAdaDisp + ' ₳', label: lang === 'en' ? 'awarded total' : '採択総額' },
            { n: '13', label: lang === 'en' ? 'funding rounds' : 'ファンドラウンド' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{
                fontFamily: t.display, fontSize: 42, fontWeight: 700,
                color: t.ink, letterSpacing: '-0.03em', lineHeight: 1,
              }}>{s.n}</span>
              <span style={{
                fontFamily: t.mono, fontSize: 10, fontWeight: 600,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: t.inkMuted,
              }}>{s.label}</span>
            </div>
          ))}
        </div>
      ),
    },
    /* ───── Slide 2: Filters — Status / Fund / Category ───── */
    {
      eyebrow: lang === 'en' ? 'Step 2 of 6' : '6 ステップ中 2',
      title: lang === 'en' ? 'Filter to what you want' : '見たいものに絞り込む',
      body: lang === 'en'
        ? 'Three rows of filters at the top: STATUS (in-progress, completed, DNF), FUND (F2 – F14), and CATEGORY (Community / Dev Tech / Real World …). Combine them freely.'
        : '上部に3段のフィルタ — STATUS（進行中・完了・DNF）/ FUND（F2–F14）/ CATEGORY（Community / Dev Tech / Real World …）。組み合わせ自由。',
      visual: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '12px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: t.mono, fontSize: 11, color: t.inkMuted, letterSpacing: '0.08em', width: 80 }}>STATUS</span>
            <PillRow>
              <ExamplePill>{T('st_all', lang)}</ExamplePill>
              <ExamplePill active>{T('st_active', lang)}</ExamplePill>
              <ExamplePill>{T('st_done', lang)}</ExamplePill>
              <ExamplePill>{T('st_dnf', lang)}</ExamplePill>
            </PillRow>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: t.mono, fontSize: 11, color: t.inkMuted, letterSpacing: '0.08em', width: 80 }}>FUND</span>
            <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
              {['ALL','F14','F13','F12','F11','F10','F9'].map((f, i) => (
                <span key={f} style={{
                  padding: '3px 10px',
                  background: i === 0 ? t.ink : t.elevated,
                  color: i === 0 ? t.bg : t.inkDim,
                  border: `1px solid ${i === 0 ? t.ink : t.hairline}`,
                  borderRadius: 999,
                  fontFamily: t.mono, fontSize: 10, fontWeight: i === 0 ? 700 : 500,
                  letterSpacing: '0.04em',
                }}>{f}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: t.mono, fontSize: 11, color: t.inkMuted, letterSpacing: '0.08em', width: 80 }}>CATEGORY</span>
            <div style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { n: 'ALL', c: t.ink },
                { n: 'Dev Tech', c: '#a85aff' },
                { n: 'Community', c: '#5ad6a0' },
                { n: 'Real World', c: '#5aa8ff' },
                { n: 'Identity', c: '#ff7eb3' },
              ].map((c, i) => (
                <span key={c.n} style={{
                  padding: '3px 10px',
                  background: i === 0 ? t.ink : 'transparent',
                  color: i === 0 ? t.bg : c.c,
                  border: `1px solid ${i === 0 ? t.ink : t.hairline}`,
                  borderRadius: 999,
                  fontFamily: t.body, fontSize: 10.5, fontWeight: i === 0 ? 700 : 600,
                }}>● {c.n}</span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    /* ───── Slide 3: Display modes ───── */
    {
      eyebrow: lang === 'en' ? 'Step 3 of 6' : '6 ステップ中 3',
      title: lang === 'en' ? '3 display modes' : '3つの表示モード',
      body: lang === 'en'
        ? 'Switch density with the toggle on the right side of the section header: Grid (visual), List (horizontal scan), Compact (everything at a glance).'
        : 'セクションヘッダー右側のトグルで密度を切替: グリッド（ビジュアル重視）/ リスト（横並びで一覧）/ コンパクト（最大密度で俯瞰）。',
      visual: (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18,
          padding: '12px 0',
        }}>
          {[
            { id: 'grid', label: lang === 'en' ? 'Grid' : 'グリッド',
              draw: <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:4 }}>
                {[0,1,2,3,4,5].map(i => <div key={i} style={{ aspectRatio:'1/1', background:t.elevated, borderRadius:3, border:`1px solid ${t.hairline}` }}/>)}
              </div>
            },
            { id: 'list', label: lang === 'en' ? 'List' : 'リスト',
              draw: <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                {[0,1,2,3].map(i => <div key={i} style={{ height:14, background:t.elevated, borderRadius:3, border:`1px solid ${t.hairline}`, display:'flex', alignItems:'center', paddingLeft:2 }}>
                  <span style={{width:10, height:10, background:t.hairlineStrong, borderRadius:2, marginRight:4 }} />
                </div>)}
              </div>
            },
            { id: 'compact', label: lang === 'en' ? 'Compact' : 'コンパクト',
              draw: <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:2 }}>
                {Array.from({length:15}).map((_,i) => <div key={i} style={{ aspectRatio:'1/1', background:t.elevated, borderRadius:2, border:`1px solid ${t.hairline}` }}/>)}
              </div>
            },
          ].map((m) => (
            <div key={m.id} style={{
              padding: 12,
              border: `1px solid ${t.hairlineStrong}`,
              borderRadius: 8,
              background: t.panel,
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6 }}>{m.draw}</div>
              <div style={{
                fontFamily: t.body, fontSize: 11, fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: t.ink, textAlign: 'center',
              }}>{m.label}</div>
            </div>
          ))}
        </div>
      ),
    },
    /* ───── Slide 4: Card anatomy ───── */
    {
      eyebrow: lang === 'en' ? 'Step 4 of 6' : '6 ステップ中 4',
      title: lang === 'en' ? 'Anatomy of a card' : 'カードの読み方',
      body: lang === 'en'
        ? 'Each card shows status, fund, category, title, proposer, awarded ADA, and links to the source material (site, GitHub, X, etc). Bottom-right: green badge means a completion report is filed.'
        : '各カードは ステータス・Fund・カテゴリ・タイトル・提案者・採択額・関連リンク（公式サイト・GitHub・X 等）を表示。右下の緑バッジは「完了レポートあり」のマーク。',
      visual: (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 24,
          padding: '8px 0', justifyContent: 'center',
        }}>
          {/* Mini card replica */}
          <div style={{
            position: 'relative',
            width: 220,
            display: 'flex', flexDirection: 'column',
            borderRadius: 10, overflow: 'hidden',
            border: `1px solid ${t.hairlineStrong}`,
            background: t.panel,
          }}>
            <div style={{
              position: 'relative', aspectRatio: '1 / 1',
              background: 'linear-gradient(135deg, oklch(40% 0.18 280), oklch(20% 0.10 200))',
              borderBottom: `1px solid ${t.hairline}`,
            }}>
              <span style={{ position:'absolute', top:8, left:8, padding:'2px 8px', background:'rgba(0,0,0,0.55)', borderRadius:999, fontFamily:t.body, fontSize:9, color:'#7dd6a3', fontWeight:700 }}>● 完了</span>
              <span style={{ position:'absolute', top:8, right:8, padding:'2px 8px', background:'rgba(0,0,0,0.55)', borderRadius:999, fontFamily:t.mono, fontSize:9, color:'#fff', fontWeight:700 }}>F13</span>
              <span style={{ position:'absolute', bottom:8, left:8, fontFamily:t.body, fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#a85aff' }}>DEV TECH</span>
            </div>
            <div style={{ padding:'12px', display:'flex', flexDirection:'column', gap:6, position:'relative' }}>
              <div style={{ fontFamily:t.display, fontSize:14, fontWeight:700, color:t.ink, lineHeight:1.3 }}>サンプル提案タイトル</div>
              <div style={{ fontFamily:t.body, fontSize:11, color:t.inkDim }}>提案者名</div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:`1px solid ${t.hairline}`, paddingTop:6 }}>
                <span style={{ fontFamily:t.mono, fontSize:9, color:t.inkMuted, letterSpacing:'0.1em' }}>{lang==='en'?'AWARDED':'採択額'}</span>
                <span style={{ fontFamily:t.mono, fontSize:13, color:t.ink, fontWeight:700 }}>250K ₳</span>
              </div>
              <div style={{ display:'flex', gap:4, paddingRight:90 }}>
                {[0,1,2,3].map(i => <span key={i} style={{ width:22, height:22, border:`1px solid ${t.hairlineStrong}`, borderRadius:5 }} />)}
              </div>
              <span style={{
                position:'absolute', bottom:10, right:10,
                padding:'3px 8px',
                background:'rgba(125,214,163,0.18)',
                border:'1px solid rgba(125,214,163,0.42)',
                borderRadius:999,
                fontFamily:t.body, fontSize:9, fontWeight:700, color:'#7dd6a3',
                letterSpacing:'0.1em', textTransform:'uppercase',
              }}>{lang==='en'?'Report':'完了レポート'}</span>
            </div>
          </div>

          {/* Callouts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: t.body, fontSize: 12, color: t.inkDim, minWidth: 0, flex: 1, maxWidth: 320 }}>
            {[
              { dot:'#7dd6a3', text: lang === 'en' ? 'Status: in progress / complete / DNF' : 'ステータス: 進行中 / 完了 / DNF' },
              { dot:'#fff',    text: lang === 'en' ? 'Fund number (F2 – F14)' : 'Fund 番号 (F2 – F14)' },
              { dot:'#a85aff', text: lang === 'en' ? 'Category (Dev / Community / RWA …)' : 'カテゴリ (Dev / Community / RWA …)' },
              { dot:t.ink,     text: lang === 'en' ? 'Awarded ADA amount' : '採択額 (ADA)' },
              { dot:t.inkDim,  text: lang === 'en' ? 'Favicon links: site, YouTube, GitHub, X, LinkedIn, Explorer' : 'ファビコンリンク: サイト / YouTube / GitHub / X / LinkedIn / Explorer' },
              { dot:'#7dd6a3', text: lang === 'en' ? 'Completion report (bottom-right, when filed)' : '完了レポート (右下、提出済みの場合)' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, marginTop: 6, flexShrink: 0 }} />
                <span>{c.text}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    /* ───── Slide 5: Video states ───── */
    {
      eyebrow: lang === 'en' ? 'Step 5 of 6' : '6 ステップ中 5',
      title: lang === 'en' ? '4 video states' : '動画の4つの状態',
      body: lang === 'en'
        ? 'Not every proposal has a watchable completion video. The card tells you which case it is.'
        : '完了動画は全提案にあるわけではない。カードの表示でどの状態か一目で分かる。',
      visual: (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
          padding: '12px 0',
        }}>
          {[
            { label: lang==='en'?'Public':'公開', sub: lang==='en'?'Watch in-page':'その場で再生', color: '#fff', bg: 'linear-gradient(135deg, oklch(40% 0.18 200), oklch(20% 0.10 280))', body: '▶' },
            { label: lang==='en'?'Unlisted':'限定公開', sub: lang==='en'?'Open link to view':'リンクからご確認ください', color: '#fff', bg: 'rgba(0,0,0,0.85)', body: '🔒' },
            { label: lang==='en'?'Embed off':'埋込無効', sub: lang==='en'?'Open on YouTube':'YouTube で再生', color: '#fff', bg: 'rgba(0,0,0,0.85)', body: '↗' },
            { label: lang==='en'?'No video':'動画なし', sub: lang==='en'?'Other media may exist':'他の資料を参照', color: 'rgba(255,255,255,0.6)', bg: 'oklch(15% 0.05 280)', body: '—' },
          ].map((v, i) => (
            <div key={i} style={{
              border: `1px solid ${t.hairlineStrong}`,
              borderRadius: 8, overflow: 'hidden',
              background: t.panel,
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{
                aspectRatio: '1 / 1',
                background: v.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, color: v.color,
              }}>{v.body}</div>
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span style={{ fontFamily: t.body, fontSize: 11, fontWeight: 700, color: t.ink, letterSpacing: '0.04em' }}>{v.label}</span>
                <span style={{ fontFamily: t.body, fontSize: 10, color: t.inkMuted, lineHeight: 1.35 }}>{v.sub}</span>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    /* ───── Slide 6: Panel view (cross-view exploration) ───── */
    {
      eyebrow: lang === 'en' ? 'Step 6 of 6' : '6 ステップ中 6',
      title: lang === 'en' ? 'Panel view — see one proposal across all views' : 'パネルビュー — 全ビューで1つの提案を見る',
      body: lang === 'en'
        ? 'Click the small grid icon on any card to open Panel View. The selected proposal is highlighted in every view (Sector, Accounts, Timeline, Network, Chart) plus a special Links panel that lets you preview linked sites side-by-side.'
        : '各カードの小さな格子アイコンをクリックでパネルビューが開く。選択した提案が全ビュー（業界別/アカウント別/時系列/関係図/チャート）で自動ハイライト、さらに「リンク確認」パネルで関連サイトを並べて確認できる。',
      visual: (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 12,
          padding: '8px 0',
        }}>
          {/* Big mock of the active panel area */}
          <div style={{
            position: 'relative',
            height: 140,
            borderRadius: 8,
            background: `linear-gradient(135deg, oklch(35% 0.18 280), oklch(18% 0.10 200))`,
            border: `1px solid ${t.hairlineStrong}`,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {/* Pulsing dot to suggest "highlighted in view" */}
            <style>{`@keyframes guide-pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.4),0 0 0 0 rgba(255,255,255,0);}50%{box-shadow:0 0 0 10px rgba(255,255,255,0.18),0 0 24px rgba(255,255,255,0.4);}}`}</style>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              animation: 'guide-pulse 1.6s ease-in-out infinite',
            }} />
            <span style={{
              position: 'absolute', bottom: 12, left: 14,
              padding: '4px 10px',
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid oklch(72% 0.18 280 / 0.6)`,
              borderRadius: 999,
              fontFamily: t.body, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.06em', color: '#fff',
            }}>{lang === 'en' ? 'Active view' : 'アクティブビュー'}</span>
          </div>
          {/* 6 mini panel chips at the bottom */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
            {[
              { label: lang === 'en' ? 'Sector'   : '業界別',     hue: 28,  active: true  },
              { label: lang === 'en' ? 'Accounts' : 'アカウント別', hue: 210, active: false },
              { label: lang === 'en' ? 'Timeline' : '時系列',     hue: 320, active: false },
              { label: lang === 'en' ? 'Network'  : '関係図',     hue: 140, active: false },
              { label: lang === 'en' ? 'Chart'    : 'チャート',    hue: 50,  active: false },
              { label: lang === 'en' ? 'Links'    : 'リンク',     hue: 200, active: false, isLinks: true },
            ].map((m, i) => (
              <div key={i} style={{
                height: 46,
                borderRadius: 6,
                border: m.active
                  ? `2px solid oklch(78% 0.20 ${m.hue})`
                  : `1px solid ${t.hairlineStrong}`,
                background: m.isLinks
                  ? `linear-gradient(135deg, oklch(28% 0.10 ${m.hue}), oklch(15% 0.06 ${(m.hue + 40) % 360}))`
                  : `linear-gradient(135deg, oklch(30% 0.14 ${m.hue}), oklch(15% 0.08 ${(m.hue + 60) % 360}))`,
                position: 'relative', overflow: 'hidden',
                transform: m.active ? 'translateY(-3px) scale(1.02)' : 'none',
                boxShadow: m.active
                  ? `0 8px 20px oklch(60% 0.20 ${m.hue} / 0.5), 0 0 0 3px oklch(72% 0.20 ${m.hue} / 0.18)`
                  : '0 2px 8px rgba(0,0,0,0.35)',
                display: 'flex', alignItems: 'flex-end',
                padding: '0 6px 4px',
              }}>
                {m.isLinks && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    style={{ position: 'absolute', top: 6, left: 8, color: 'rgba(255,255,255,0.65)' }}>
                    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                <span style={{
                  fontFamily: t.body, fontSize: 9, fontWeight: 700,
                  color: '#fff', letterSpacing: '0.04em',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                }}>{m.label}</span>
              </div>
            ))}
          </div>
          <div style={{
            fontFamily: t.body, fontSize: 11, lineHeight: 1.55,
            color: t.inkMuted, textAlign: 'center',
          }}>
            {lang === 'en'
              ? '← / → switches between panels.  Hover to preview, click to focus.'
              : '← / → でパネル切替。ホバーでプレビュー、クリックでフォーカス。'}
          </div>
        </div>
      ),
    },
  ];

  const cur = slides[step];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.78)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'guide-fade-in .25s ease',
      }}
    >
      <style>{`@keyframes guide-fade-in { 0%{opacity:0;} 100%{opacity:1;} }
              @keyframes guide-slide-in { 0%{opacity:0; transform:translateY(8px);} 100%{opacity:1; transform:translateY(0);} }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(960px, 100%)',
          maxHeight: '90vh',
          background: t.bg,
          borderRadius: 18,
          border: `1px solid ${t.hairlineStrong}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 22px',
          borderBottom: `1px solid ${t.hairline}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{
              fontFamily: t.mono, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: t.inkMuted,
            }}>{cur.eyebrow}</span>
            <span style={{ fontFamily: t.body, fontSize: 12, fontWeight: 500, color: t.inkDim }}>{lang === 'en' ? 'Catalyst Japan Catalog · Guide' : 'Catalyst Japan Catalog · ガイド'}</span>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: '50%',
            background: t.elevated, border: 'none', cursor: 'pointer',
            color: t.inkDim,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }} title={lang === 'en' ? 'Close (Esc)' : '閉じる (Esc)'}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Slide body */}
        <div key={step} style={{
          flex: 1, overflowY: 'auto',
          padding: '28px 32px',
          display: 'flex', flexDirection: 'column', gap: 18,
          animation: 'guide-slide-in .3s ease',
        }}>
          <h2 style={{
            margin: 0,
            fontFamily: t.display, fontSize: 28, fontWeight: 700,
            color: t.ink, letterSpacing: '-0.025em', lineHeight: 1.15,
          }}>{cur.title}</h2>
          <p style={{
            margin: 0,
            fontFamily: t.body, fontSize: 14, lineHeight: 1.6,
            color: t.inkDim, maxWidth: 700,
          }}>{cur.body}</p>
          <div style={{ marginTop: 4 }}>{cur.visual}</div>
        </div>

        {/* Footer: dots + nav */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 22px',
          borderTop: `1px solid ${t.hairline}`,
          background: t.panel,
        }}>
          <div style={{ display: 'inline-flex', gap: 6 }}>
            {slides.map((_, i) => (
              <button key={i}
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 22 : 8, height: 8,
                  borderRadius: 4,
                  background: i === step ? t.ink : t.hairlineStrong,
                  border: 'none', cursor: 'pointer',
                  transition: 'all .2s ease',
                }} />
            ))}
          </div>
          <div style={{ display: 'inline-flex', gap: 8 }}>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              style={{
                padding: '8px 14px', borderRadius: 999,
                background: 'transparent',
                border: `1px solid ${t.hairlineStrong}`,
                color: step === 0 ? t.inkMuted : t.ink,
                fontFamily: t.body, fontSize: 12, fontWeight: 600,
                cursor: step === 0 ? 'default' : 'pointer',
                opacity: step === 0 ? 0.5 : 1,
              }}>← {lang === 'en' ? 'Back' : '戻る'}</button>
            {step < slides.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                style={{
                  padding: '8px 16px', borderRadius: 999,
                  background: t.ink,
                  border: 'none',
                  color: t.bg,
                  fontFamily: t.body, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer',
                }}>{lang === 'en' ? 'Next' : '次へ'} →</button>
            ) : (
              <button onClick={onClose}
                style={{
                  padding: '8px 16px', borderRadius: 999,
                  background: t.ink,
                  border: 'none',
                  color: t.bg,
                  fontFamily: t.body, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer',
                }}>{lang === 'en' ? 'Got it' : '理解した'} ✓</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Team avatars (poster card-friendly) ----------

function ATeamStack({ people, size = 18, max = 4 }) {
  const t = useT();
  if (!people || !people.length) return null;
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {shown.map((tm, i) => (
        <span key={tm.name + i} style={{
          marginLeft: i === 0 ? 0 : -size * 0.36,
          border: `1.5px solid ${t.bg}`,
          borderRadius: '50%',
          display: 'inline-flex',
        }} title={tm.name}>
          <AAvatar initials={window.makeInitials ? window.makeInitials(tm.name) : (tm.name || '?').slice(0,2)} hue={tm.hue} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span style={{
          marginLeft: -size * 0.36,
          width: size, height: size, borderRadius: '50%',
          border: `1.5px solid ${t.bg}`,
          background: t.elevated,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: t.mono, fontSize: size * 0.4, color: t.inkDim,
        }} title={people.slice(max).map(tm => tm.name).join(', ')}>+{overflow}</span>
      )}
    </span>
  );
}

// ---------- Link icon strip (compact, theme-aware) ----------

/* Shared favicon helpers */
const _favUrl = (domain) => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
function FavImg({ domain, alt, size = 14 }) {
  return (
    <img src={_favUrl(domain)} alt={alt || ''} width={size} height={size}
      style={{ display: 'block', borderRadius: 2, objectFit: 'contain' }}
      onError={(e) => {
        const span = document.createElement('span');
        span.innerHTML = '<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.2"/><path d="M1.5 6h9M6 1.5c1.5 1.5 1.5 7.5 0 9M6 1.5c-1.5 1.5-1.5 7.5 0 9" stroke="currentColor" stroke-width="1.2"/></svg>';
        e.currentTarget.replaceWith(span.firstChild);
      }}
    />
  );
}

/* ── Row 1: small icon buttons (Site, GH, X, LinkedIn, CE, PC) ── */
function LinkIconStrip({ p, hideReport = false }) {
  const t = useT();
  const items = [];
  if (p.site) {
    const dom = (window.urlDomain && window.urlDomain(p.site)) || (p.siteDomain || 'example.com');
    items.push({ k: 'SITE', label: p.siteDomain || 'Site', url: p.site, domain: dom });
  }
  if (p.links && p.links.GH) items.push({ k: 'GH', label: 'GitHub', count: p.links.GH, url: window.resolveLinkUrl ? window.resolveLinkUrl(p.meta, 'GH') : null, domain: 'github.com' });
  if (p.links && p.links.x)  items.push({ k: 'X',  label: 'X', count: p.links.x,  url: window.resolveLinkUrl ? window.resolveLinkUrl(p.meta, 'x') : null,  domain: 'x.com' });
  if (p.links && p.links.in) items.push({ k: 'in', label: 'LinkedIn', count: p.links.in, url: window.resolveLinkUrl ? window.resolveLinkUrl(p.meta, 'in') : null, domain: 'linkedin.com' });
  if (p.ce || p.explorer) items.push({ k: 'CE', label: 'Catalyst Explorer', url: p.ce || p.explorer, domain: 'catalystexplorer.com' });
  if (p.pc) items.push({ k: 'PC', label: 'ProjectCatalyst.io', url: p.pc, domain: 'projectcatalyst.io' });
  if (!items.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, paddingTop: 2 }}>
      {items.map((it, i) => (
        <a
          key={it.k + i}
          href={it.url || '#'}
          target="_blank" rel="noopener noreferrer"
          onClick={(e) => { e.stopPropagation(); if (!it.url) e.preventDefault(); }}
          title={it.label + (it.count ? ' ×' + it.count : '')}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            minWidth: 26, height: 24, padding: it.count ? '0 6px' : '0',
            background: 'transparent', border: `1px solid ${t.hairlineStrong}`, borderRadius: 5,
            color: t.inkDim, textDecoration: 'none',
            fontFamily: t.mono, fontSize: 10, fontWeight: 600, lineHeight: 1,
            transition: 'all .15s',
            opacity: it.url ? 1 : 0.45, cursor: it.url ? 'pointer' : 'default',
          }}
          onMouseEnter={(e) => { if (!it.url) return; e.currentTarget.style.color = t.ink; e.currentTarget.style.borderColor = t.ink; e.currentTarget.style.background = t.elevated; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = t.inkDim; e.currentTarget.style.borderColor = t.hairlineStrong; e.currentTarget.style.background = 'transparent'; }}
        >
          <FavImg domain={it.domain} alt={it.label} />
          {it.count ? <span>×{it.count}</span> : null}
        </a>
      ))}
    </div>
  );
}

/* ── Row 2: fixed 4-slot badge grid (提案書 | マイルストーン | 完了動画 | 完了レポート) ──
   Empty slots keep their space — layout is consistent across ALL cards. */
function LinkBadgeRow({ p, t, lang }) {
  const isComplete = p.s === '完了';
  /* 完了動画・完了レポートは完了した提案のみ表示 */
  const reportUrl = isComplete ? (p.cr || (p.report && p.report.url) || null) : null;
  const cvUrl     = isComplete ? (p.cv || (p.videoUrl && !p.unlistedVideo && !p.embedDisabledVideo ? p.videoUrl : null)) : null;
  /* 3 fixed slots — always rendered, visible only when data exists */
  const slots = [
    /* IdeaScale(提案書) — サイト全404のため非表示 */
    { k: 'MS',  url: p.ms || null,      label: lang === 'en' ? 'Milestones': 'マイルストーン', domain: 'milestones.projectcatalyst.io' },
    { k: 'CV',  url: cvUrl,             label: p.cv ? (lang === 'en' ? 'Closeout Video' : '完了動画') : 'YouTube',
                                         domain: 'youtube.com' },
    { k: 'CR',  url: reportUrl,         label: lang === 'en' ? 'Report'    : '完了レポート',   domain: p.cr ? 'docs.google.com' : null, accent: true },
  ];
  const anyVisible = slots.some(s => s.url);
  if (!anyVisible) return null;
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3,
      paddingTop: 2,
    }}>
      {slots.map((s) => {
        if (!s.url) {
          /* Empty slot — invisible placeholder that keeps the grid position */
          return <div key={s.k} />;
        }
        const isGreen = s.accent;
        const bg    = isGreen ? (t.green ? t.green + '18' : 'rgba(125,214,163,0.12)') : (t.hairlineStrong + '44');
        const bgHov = isGreen ? (t.green ? t.green + '28' : 'rgba(125,214,163,0.22)') : (t.hairlineStrong + '88');
        const bdr   = isGreen ? (t.green ? t.green + '50' : 'rgba(125,214,163,0.38)') : t.hairlineStrong;
        const clr   = isGreen ? (t.green || '#7dd6a3') : t.inkDim;
        return (
          <a
            key={s.k}
            href={s.url}
            target="_blank" rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={s.label}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 3,
              height: 22, padding: '0 5px',
              background: bg, border: `1px solid ${bdr}`, borderRadius: 4,
              fontFamily: t.body, fontSize: 8, fontWeight: 700,
              letterSpacing: '0.04em',
              color: clr, textDecoration: 'none',
              transition: 'background .15s',
              whiteSpace: 'nowrap', overflow: 'hidden',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = bgHov; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = bg; }}
          >
            {s.domain
              ? <FavImg domain={s.domain} alt={s.label} size={12} />
              : <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 1h4l2 2v7.5a.5.5 0 0 1-.5.5h-5.5a.5.5 0 0 1-.5-.5V1.5a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1v2.5h2" stroke="currentColor" strokeWidth="1.2"/></svg>
            }
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</span>
          </a>
        );
      })}
    </div>
  );
}

// ---------- PanelViewModal — 5 live iframes of every view at once, all operable ----------

// ---------- PanelViewIntro — cinematic splash shown when opening Panel View ----------

function PanelViewIntro({ t, lang, proposal, views, onSkip }) {
  const displayTitle = lang === 'en' ? (proposal.title_en || proposal.title) : (proposal.title || proposal.title_en);
  /* Progress bar countdown — matches the parent's 6200ms auto-dismiss */
  const totalMs = 6200;
  const [progress, setProgress] = useStateR(0);
  React.useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = () => {
      const elapsed = performance.now() - start;
      const p = Math.min(1, elapsed / totalMs);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{
      flex: 1, minHeight: 0, position: 'relative',
      overflow: 'hidden',
      background: '#000',
      cursor: 'pointer',
    }}
    onClick={onSkip}
    title={lang === 'en' ? 'Click to start' : 'クリックで開始'}
    >
      <style>{`
        @keyframes pvi-orb-1 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(7%,-5%) scale(1.15);} }
        @keyframes pvi-orb-2 { 0%,100%{transform:translate(0,0) scale(1);} 50%{transform:translate(-6%,8%) scale(1.18);} }
        @keyframes pvi-fan-in { 0%{opacity:0; transform:translateY(20px) scale(0.8);} 100%{opacity:1; transform:translateY(0) scale(1);} }
        @keyframes pvi-title-in { 0%{opacity:0; transform:translateY(12px);} 100%{opacity:1; transform:translateY(0);} }
        @keyframes pvi-sub-in { 0%{opacity:0;} 100%{opacity:1;} }
        @keyframes pvi-sweep { 0%{transform:translateX(-110%);} 100%{transform:translateX(120%);} }
        @keyframes pvi-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.18), 0 8px 30px rgba(0,0,0,0.55);} 50%{box-shadow:0 0 0 10px rgba(255,255,255,0), 0 12px 38px rgba(0,0,0,0.7);} }
      `}</style>

      {/* Background: 2 drifting color orbs */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, oklch(15% 0.10 280) 0%, oklch(8% 0.06 220) 100%)',
      }}>
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%', width: '70%', height: '90%',
          background: 'radial-gradient(circle at 30% 30%, oklch(60% 0.24 280 / 0.55) 0%, transparent 60%)',
          filter: 'blur(8px)', mixBlendMode: 'plus-lighter',
          animation: 'pvi-orb-1 9s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-30%', right: '-10%', width: '70%', height: '90%',
          background: 'radial-gradient(circle at 70% 70%, oklch(60% 0.22 200 / 0.55) 0%, transparent 60%)',
          filter: 'blur(8px)', mixBlendMode: 'plus-lighter',
          animation: 'pvi-orb-2 11s ease-in-out infinite',
        }} />
        {/* grain */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '3px 3px', mixBlendMode: 'overlay',
        }} />
        {/* horizontal sweep */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, width: '35%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)',
          animation: 'pvi-sweep 7s ease-out infinite',
          mixBlendMode: 'plus-lighter',
        }} />
        {/* vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(80% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.5) 100%)',
        }} />
      </div>

      {/* Foreground content */}
      <div style={{
        position: 'relative', zIndex: 2,
        height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 32, gap: 22, textAlign: 'center',
      }}>
        {/* Eyebrow */}
        <span style={{
          padding: '4px 12px',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.28)',
          borderRadius: 999,
          fontFamily: t.body, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#fff',
          backdropFilter: 'blur(8px)',
          animation: 'pvi-title-in .5s ease both',
        }}>{lang === 'en' ? 'Panel View' : 'パネルビュー'}</span>

        {/* Big headline */}
        <h2 style={{
          margin: 0,
          fontFamily: t.display, fontSize: 44, fontWeight: 700,
          color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.05,
          textShadow: '0 4px 20px rgba(0,0,0,0.7)',
          animation: 'pvi-title-in .6s .1s ease both',
          maxWidth: 720,
        }}>
          {lang === 'en' ? (
            <>One proposal,<br/>
              <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>six</span> angles.</>
          ) : (
            <>1つの提案を、<br/>
              <span style={{ fontFamily: t.serif, fontStyle: 'italic', fontWeight: 400, color: 'rgba(255,255,255,0.78)' }}>6</span>つの視点で。</>
          )}
        </h2>

        {/* Proposal name chip */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '8px 16px',
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: 999,
          backdropFilter: 'blur(12px)',
          maxWidth: 720,
          animation: 'pvi-sub-in .8s .3s ease both',
        }}>
          <span style={{
            fontFamily: t.mono, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
          }}>{proposal.f}</span>
          <span style={{
            fontFamily: t.display, fontSize: 16, fontWeight: 600,
            color: '#fff', letterSpacing: '-0.015em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: 560,
          }}>{displayTitle}</span>
        </div>

        {/* 6 mini panel chips, fanning in with stagger */}
        <div style={{
          display: 'flex', gap: 10,
          marginTop: 8,
          maxWidth: 720, flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {views.map((v, i) => (
            <div key={v.id} style={{
              width: 100, height: 64,
              borderRadius: 8,
              position: 'relative', overflow: 'hidden',
              border: `1px solid oklch(72% 0.18 ${v.hue} / 0.6)`,
              background: v.shot
                ? `linear-gradient(135deg, oklch(32% 0.14 ${v.hue}), oklch(18% 0.08 ${(v.hue + 60) % 360}))`
                : `linear-gradient(135deg, oklch(28% 0.10 ${v.hue}), oklch(15% 0.06 ${(v.hue + 40) % 360}))`,
              boxShadow: `0 6px 20px oklch(40% 0.18 ${v.hue} / 0.35)`,
              animation: `pvi-fan-in .55s ${0.6 + i * 0.1}s cubic-bezier(.2,.7,.3,1) both`,
              display: 'flex', alignItems: 'flex-end',
              padding: '0 8px 6px',
            }}>
              {v.shot && (
                <img src={v.shot} alt="" style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover', opacity: 0.45,
                  filter: 'saturate(0.9) brightness(0.7)',
                }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              )}
              {!v.shot && (
                /* Links panel icon */
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  style={{ position: 'absolute', top: 8, left: 8, color: 'rgba(255,255,255,0.6)' }}>
                  <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              <span style={{
                position: 'relative', zIndex: 2,
                fontFamily: t.body, fontSize: 10, fontWeight: 700,
                color: '#fff', letterSpacing: '0.04em',
                textShadow: '0 1px 3px rgba(0,0,0,0.85)',
              }}>{v.label}</span>
            </div>
          ))}
        </div>

        {/* Subtext */}
        <p style={{
          margin: 0, marginTop: 4,
          fontFamily: t.body, fontSize: 13, lineHeight: 1.55,
          color: 'rgba(255,255,255,0.7)',
          maxWidth: 540,
          animation: 'pvi-sub-in 1s 1.3s ease both',
        }}>
          {lang === 'en'
            ? 'Each panel auto-focuses on this proposal. The Links panel previews related sites side-by-side.'
            : '各パネルは自動でこの提案にフォーカスします。「リンク確認」パネルでは関連サイトを並べて確認できます。'}
        </p>

        {/* "Start" button + countdown progress */}
        <div style={{
          marginTop: 14,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          animation: 'pvi-sub-in 1s 1.6s ease both',
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onSkip(); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 22px',
              background: 'rgba(255,255,255,0.95)',
              border: 'none', borderRadius: 999,
              color: '#0a0a0c',
              fontFamily: t.body, fontSize: 13, fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              animation: 'pvi-pulse 2.4s ease-in-out infinite',
            }}>
            {lang === 'en' ? 'Start exploring' : '探索を開始'} <span>→</span>
          </button>
          {/* Countdown bar */}
          <div style={{
            width: 140, height: 3,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.15)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress * 100}%`, height: '100%',
              background: 'rgba(255,255,255,0.7)',
              transition: 'width .1s linear',
            }} />
          </div>
          <span style={{
            fontFamily: t.mono, fontSize: 9, fontWeight: 600,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
          }}>{lang === 'en' ? 'Click anywhere to skip' : 'クリックでスキップ'}</span>
        </div>
      </div>
    </div>
  );
}

function PanelViewModal({ show, proposal, onClose, lang }) {
  const t = useT();
  /* Single active view (0-5). Open defaults to 0; user switches via the mini-panel strip at the bottom. */
  const [activeIdx, setActiveIdx] = useStateR(0);
  /* For the "links" panel: which URL is currently open in the right iframe */
  const [selectedLink, setSelectedLink] = useStateR(null);
  /* Intro splash — shown for the first ~6 seconds when opening panel view */
  const [showIntro, setShowIntro] = useStateR(true);
  /* Shared controls — broadcast to all 5 iframes so they switch in sync.
     Theme & lang default to whatever the parent catalog is currently using so the
     iframes load matching the user's preference instead of always defaulting to dark/ja. */
  const [pvCurrency, setPvCurrency] = useStateR('ada');
  const [pvPriceMode, setPvPriceMode] = useStateR('submit');
  const [pvLang, setPvLang] = useStateR(lang);
  const [pvTheme, setPvTheme] = useStateR(t.mode === 'light' ? 'light' : 'dark');
  /* Keep pvLang / pvTheme in sync when the parent flips them (e.g. host toggles light mode while panel view is open) */
  React.useEffect(() => { setPvLang(lang); }, [lang]);
  React.useEffect(() => { setPvTheme(t.mode === 'light' ? 'light' : 'dark'); }, [t.mode]);

  /* Broadcast a message to every iframe inside the modal */
  const broadcastToPanels = React.useCallback((msg) => {
    try {
      const root = document.getElementById('panel-view-root');
      if (!root) return;
      root.querySelectorAll('iframe').forEach(f => {
        try { if (f.contentWindow) f.contentWindow.postMessage(msg, '*'); } catch (e) {}
      });
    } catch (e) {}
  }, []);

  const onChangeCurrency  = (v) => { setPvCurrency(v);  broadcastToPanels({ type: 'panel-set-currency',   value: v }); };
  const onChangePriceMode = (v) => { setPvPriceMode(v); broadcastToPanels({ type: 'panel-set-price-mode', value: v }); };
  const onChangeLang      = (v) => { setPvLang(v);      broadcastToPanels({ type: 'panel-set-lang',       value: v === 'en' ? 'en' : 'jp' }); };
  const onChangeTheme     = (v) => { setPvTheme(v);     broadcastToPanels({ type: 'panel-set-theme',      dark: v === 'dark' }); };

  React.useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setActiveIdx(0);
    setSelectedLink(null);
    setShowIntro(true);
    /* When embedded inside index.html, ask the host to hide its view-bar and expand the iframe
       to full viewport — Panel View has its own controls dock, so the host chrome is redundant. */
    try { if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'panel-view-open' }, '*'); } catch (e) {}
    /* Auto-dismiss the intro after a short cinematic moment */
    const autoEnd = setTimeout(() => setShowIntro(false), 6200);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(autoEnd);
      try { if (window.parent && window.parent !== window) window.parent.postMessage({ type: 'panel-view-close' }, '*'); } catch (e) {}
    };
  }, [show]);

  React.useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (showIntro) { if (e.key === 'Enter' || e.key === ' ') setShowIntro(false); return; }
      if (e.key === 'ArrowLeft')  setActiveIdx(i => (i + 5) % 6);
      if (e.key === 'ArrowRight') setActiveIdx(i => (i + 1) % 6);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show, showIntro]);

  if (!show || !proposal) return null;

  const views = [
    { id: 'sector',   label: lang === 'en' ? 'Sector'    : '業界別',     hue: 28,  shot: 'shots/sector.png' },
    { id: 'proposer', label: lang === 'en' ? 'Accounts'  : 'アカウント別', hue: 210, shot: 'shots/account.png' },
    { id: 'timeline', label: lang === 'en' ? 'Timeline'  : '時系列',     hue: 320, shot: 'shots/timeline.png' },
    { id: 'network',  label: lang === 'en' ? 'Network'   : '関係図',     hue: 140, shot: 'shots/network.png' },
    { id: 'chart',    label: lang === 'en' ? 'Chart'     : 'チャート',    hue: 50,  shot: 'shots/chart.png' },
    { id: 'links',    label: lang === 'en' ? 'Links'     : 'リンク確認',  hue: 200, shot: null, isCustom: true },
  ];
  const displayTitle = lang === 'en' ? (proposal.title_en || proposal.title) : (proposal.title || proposal.title_en);
  /* Iframe src — host index.html with view + highlight params. ?panel=1 is a hint for host to slim its chrome (handled in index.html).
     Include theme so the iframes match the catalog's current light/dark state on initial load (the host reads ?theme=). */
  const srcFor = (vid) => `index.html?view=${vid}&highlight=${encodeURIComponent(proposal.id)}&panel=1&lang=${pvLang === 'en' ? 'en' : 'jp'}&theme=${pvTheme === 'light' ? 'light' : 'dark'}`;

  return (
    <div id="panel-view-root" style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(5,5,8,0.95)',
      backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
      display: 'flex', flexDirection: 'column',
      animation: 'guide-fade-in .25s ease',
    }}>
      <style>{`@keyframes pv-fade-in { 0%{opacity:0; transform:scale(0.98);} 100%{opacity:1; transform:scale(1);} }`}</style>

      {/* === Top bar: slim — eyebrow label, layout toggle, close === */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '10px 18px',
        background: t.bg,
        borderBottom: `1px solid ${t.hairlineStrong}`,
      }}>
        <span style={{
          fontFamily: t.mono, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase', color: t.inkMuted,
        }}>{lang === 'en' ? 'Panel View' : 'パネルビュー'} · {proposal.f}</span>
        <div style={{ flex: 1 }} />

        {/* === SHARED CONTROLS DOCK — broadcasts to all 5 panels at once === */}
        {!showIntro && (() => {
          const RB = { bg: '#0d0d10', pill: '#1c1c1f', ink: '#f5f1e8', inkDim: '#85827b', hairline: 'rgba(255,245,225,0.07)' };
          const pillBtn = (active, extra={}) => ({
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            height: 24, padding: '0 11px',
            background: active ? RB.ink : 'transparent',
            color: active ? '#0a0a0c' : RB.ink,
            border: 'none', borderRadius: 999, cursor: 'pointer',
            fontFamily: t.body, fontSize: 11.5, fontWeight: active ? 700 : 500,
            letterSpacing: '0.04em',
            transition: 'background .15s, color .15s',
            ...extra,
          });
          const groupBox = {
            display: 'inline-flex', alignItems: 'center', gap: 2,
            height: 30, padding: 3,
            background: RB.pill,
            borderRadius: 999,
          };
          return (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 8px',
              background: RB.bg,
              border: `1px solid ${RB.hairline}`,
              borderRadius: 14,
              boxShadow: '0 4px 18px rgba(0,0,0,0.45)',
            }} title={lang === 'en' ? 'Apply to all 5 panels' : '5パネル共通'}>
              {/* Currency */}
              <div style={groupBox}>
                {[{id:'jpy',g:'¥'},{id:'usd',g:'$'},{id:'ada',g:'₳'}].map(c => (
                  <button key={c.id} onClick={() => onChangeCurrency(c.id)}
                    style={pillBtn(pvCurrency===c.id, { fontFamily: t.mono, fontSize: 13, padding: '0 11px', minWidth: 24 })}
                    title={c.id.toUpperCase()}>{c.g}</button>
                ))}
              </div>
              {/* Price mode */}
              <div style={groupBox}>
                {[{id:'submit',l:lang==='en'?'Submit':'提案時'},{id:'result',l:lang==='en'?'Result':'採択時'}].map(p => (
                  <button key={p.id} onClick={() => onChangePriceMode(p.id)}
                    style={pillBtn(pvPriceMode===p.id)}>{p.l}</button>
                ))}
              </div>
              {/* Language */}
              <div style={groupBox}>
                {[{id:'en',l:'EN'},{id:'ja',l:'JP'}].map(l => (
                  <button key={l.id} onClick={() => onChangeLang(l.id)}
                    style={pillBtn(pvLang===l.id, { fontFamily: t.mono, fontSize: 11, letterSpacing: '0.06em', minWidth: 28 })}>{l.l}</button>
                ))}
              </div>
              {/* Theme toggle */}
              <button
                onClick={() => onChangeTheme(pvTheme === 'dark' ? 'light' : 'dark')}
                title={lang === 'en' ? 'Toggle theme' : 'テーマ切替'}
                style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: RB.inkDim,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background .15s, color .15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = RB.ink; e.currentTarget.style.background = '#2a2a2f'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = RB.inkDim; e.currentTarget.style.background = 'transparent'; }}
              >
                {pvTheme === 'dark' ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="2.8" fill="currentColor" />
                    <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                      <line x1="7" y1="1.5" x2="7" y2="3" />
                      <line x1="7" y1="11" x2="7" y2="12.5" />
                      <line x1="1.5" y1="7" x2="3" y2="7" />
                      <line x1="11" y1="7" x2="12.5" y2="7" />
                    </g>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M11 9C8 9 5 6 5 3a4 4 0 1 0 6 6Z" fill="currentColor" />
                  </svg>
                )}
              </button>
            </div>
          );
        })()}

        <button onClick={onClose} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: t.elevated, border: 'none', cursor: 'pointer',
          color: t.ink,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }} title={lang === 'en' ? 'Close (Esc)' : '閉じる (Esc)'}>
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* === MAIN: intro splash OR large active panel === */}
      {showIntro ? (
        <PanelViewIntro
          t={t}
          lang={lang}
          proposal={proposal}
          views={views}
          onSkip={() => setShowIntro(false)}
        />
      ) : (
      <div style={{
        flex: 1, minHeight: 0,
        padding: 10, position: 'relative',
      }}>
        {(() => {
          const v = views[activeIdx];

          /* ── Custom panel: "Links" — proposal card on the left, link iframe on the right ── */
          if (v.isCustom && v.id === 'links') {
            return (
              <div key="links-panel" style={{
                position: 'relative',
                width: '100%', height: '100%',
                borderRadius: 10, overflow: 'hidden',
                border: `1px solid oklch(72% 0.18 ${v.hue} / 0.6)`,
                background: '#000',
                boxShadow: `0 14px 50px rgba(0,0,0,0.6), 0 0 0 2px oklch(72% 0.18 ${v.hue} / 0.35)`,
                display: 'flex', flexDirection: 'row',
                animation: 'pv-fade-in .3s ease',
              }}>
                {/* LEFT — proposal card with link interceptor */}
                <div
                  style={{
                    width: 300, flexShrink: 0,
                    padding: 16,
                    borderRight: `1px solid ${t.hairlineStrong}`,
                    background: t.bg,
                    overflowY: 'auto',
                    position: 'relative',
                  }}
                  onClickCapture={(e) => {
                    /* Intercept any anchor click → open in the right iframe instead of a new tab */
                    const a = e.target.closest && e.target.closest('a[href]');
                    if (a && a.href && !a.href.startsWith('javascript:')) {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedLink(a.href);
                    }
                  }}
                >
                  <PosterCard p={proposal} size="md" fluid />
                </div>

                {/* RIGHT — selected link iframe (or prompt) */}
                <div style={{
                  flex: 1, minWidth: 0,
                  display: 'flex', flexDirection: 'column',
                  background: '#000',
                }}>
                  {selectedLink ? (
                    <>
                      {/* URL bar */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px',
                        background: t.panel,
                        borderBottom: `1px solid ${t.hairlineStrong}`,
                      }}>
                        <span style={{
                          flex: 1, minWidth: 0,
                          fontFamily: t.mono, fontSize: 11,
                          color: t.inkDim,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>{selectedLink}</span>
                        <a
                          href={selectedLink} target="_blank" rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px',
                            background: t.elevated,
                            border: `1px solid ${t.hairlineStrong}`,
                            borderRadius: 999,
                            fontFamily: t.body, fontSize: 10.5, fontWeight: 600,
                            color: t.ink, textDecoration: 'none',
                            whiteSpace: 'nowrap',
                          }}
                          title={lang === 'en' ? 'Open in new tab' : '新タブで開く'}
                        >{lang === 'en' ? 'Open ↗' : '新タブで開く ↗'}</a>
                        <button onClick={() => setSelectedLink(null)} style={{
                          width: 26, height: 26, borderRadius: 6,
                          background: t.elevated, border: `1px solid ${t.hairlineStrong}`,
                          cursor: 'pointer', color: t.inkDim,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }} title={lang === 'en' ? 'Close' : '閉じる'}>
                          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                      <iframe
                        key={selectedLink}
                        src={selectedLink}
                        title="Selected link"
                        style={{
                          flex: 1, width: '100%',
                          border: 'none', display: 'block',
                          background: '#fff',
                        }}
                      />
                    </>
                  ) : (
                    /* Empty state — prompt to click a link */
                    <div style={{
                      flex: 1,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: 32, gap: 12, textAlign: 'center',
                    }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        color: 'rgba(255,255,255,0.6)',
                      }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                          <path d="M10 14L21 3M21 3h-7M21 3v7M14 21H5a2 2 0 0 1-2-2v-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div style={{
                        fontFamily: t.display, fontSize: 18, fontWeight: 700,
                        color: '#fff', letterSpacing: '-0.02em',
                      }}>{lang === 'en' ? 'Pick a link from the card' : '左のカードからリンクを選択'}</div>
                      <div style={{
                        fontFamily: t.body, fontSize: 12.5, lineHeight: 1.55,
                        color: 'rgba(255,255,255,0.6)', maxWidth: 360,
                      }}>
                        {lang === 'en'
                          ? 'Click any favicon, the report badge, or any link in the card on the left. The destination will open here instead of a new tab.'
                          : '左のカード内のファビコン、完了レポートバッジ、リンクをクリックすると、新タブではなくここに表示されます。'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          /* ── Standard panel: live iframe of the index.html view ── */
          return (
            <div key={activeIdx} style={{
              position: 'relative',
              width: '100%', height: '100%',
              borderRadius: 10, overflow: 'hidden',
              border: `1px solid oklch(72% 0.18 ${v.hue} / 0.6)`,
              background: '#000',
              boxShadow: `0 14px 50px rgba(0,0,0,0.6), 0 0 0 2px oklch(72% 0.18 ${v.hue} / 0.35)`,
              animation: 'pv-fade-in .3s ease',
            }}>
              {/* Active panel header */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.85), transparent)',
                pointerEvents: 'none',
              }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '4px 11px',
                  background: 'rgba(0,0,0,0.7)',
                  border: `1px solid oklch(72% 0.18 ${v.hue} / 0.7)`,
                  borderRadius: 999,
                  fontFamily: t.body, fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.08em', color: '#fff',
                  backdropFilter: 'blur(6px)',
                }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: `oklch(72% 0.18 ${v.hue})`,
                  }} />
                  {v.label}
                </span>
              </div>
              <iframe
                src={srcFor(v.id)}
                title={v.label}
                style={{
                  width: '100%', height: '100%',
                  border: 'none', display: 'block',
                  background: pvTheme === 'light' ? '#fbfbfd' : '#000',
                }}
              />
            </div>
          );
        })()}
      </div>
      )}

      {/* === BOTTOM: 5 mini panels in a row, selectable (hidden during intro splash) === */}
      {!showIntro && (
      <div style={{
        flexShrink: 0,
        padding: '10px 14px 14px',
        display: 'flex', gap: 10,
        background: t.bg,
        borderTop: `1px solid ${t.hairlineStrong}`,
      }}>
        {views.map((v, i) => {
          const isActive = i === activeIdx;
          return (
            <button key={v.id}
              onClick={() => setActiveIdx(i)}
              title={v.label}
              style={{
                flex: 1, height: 96,
                position: 'relative',
                borderRadius: 8, overflow: 'hidden',
                border: isActive
                  ? `2px solid oklch(78% 0.20 ${v.hue})`
                  : `1px solid ${t.hairlineStrong}`,
                background: '#000',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform .2s cubic-bezier(.2,.7,.3,1), border-color .2s, box-shadow .2s',
                transform: isActive ? 'translateY(-6px) scale(1.02)' : 'none',
                boxShadow: isActive
                  ? `0 12px 30px oklch(60% 0.20 ${v.hue} / 0.55), 0 0 0 4px oklch(72% 0.20 ${v.hue} / 0.18)`
                  : '0 4px 14px rgba(0,0,0,0.45)',
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.transform = 'translateY(-4px) scale(1.015)'; e.currentTarget.style.borderColor = t.ink; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = t.hairlineStrong; } }}
            >
              {/* Background: real screenshot for the standard views, or a gradient + icon for the custom Links panel */}
              {v.shot ? (
                <img
                  src={v.shot}
                  alt={v.label}
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'top center',
                    opacity: isActive ? 1 : 0.7,
                    filter: isActive ? 'none' : 'saturate(0.85) brightness(0.9)',
                    transition: 'opacity .2s, filter .2s',
                    display: 'block',
                  }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                /* Custom Links panel — gradient + chain-link icon */
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `
                    radial-gradient(120% 100% at 30% 30%, oklch(45% 0.18 ${v.hue}) 0%, transparent 60%),
                    linear-gradient(135deg, oklch(20% 0.10 ${v.hue}) 0%, oklch(12% 0.06 ${(v.hue + 40) % 360}) 100%)
                  `,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: isActive ? 1 : 0.7,
                  filter: isActive ? 'none' : 'saturate(0.9)',
                  transition: 'opacity .2s, filter .2s',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              {/* Darken + label */}
              <div style={{
                position: 'absolute', inset: 0,
                background: isActive
                  ? `linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.78) 100%)`
                  : 'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)',
              }} />
              <span style={{
                position: 'absolute', bottom: 8, left: 10, right: 10,
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: t.body, fontSize: 12, fontWeight: 700,
                letterSpacing: '0.04em', color: '#fff',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: `oklch(78% 0.20 ${v.hue})`,
                  boxShadow: isActive ? `0 0 8px oklch(78% 0.20 ${v.hue})` : 'none',
                  flexShrink: 0,
                }} />
                {v.label}
              </span>
              {/* Active indicator chip — top-right */}
              {isActive && (
                <span style={{
                  position: 'absolute', top: 6, right: 6,
                  padding: '2px 7px',
                  background: `oklch(78% 0.20 ${v.hue})`,
                  color: '#0a0a0c',
                  borderRadius: 999,
                  fontFamily: t.mono, fontSize: 8, fontWeight: 800,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>{lang === 'en' ? 'Active' : '表示中'}</span>
              )}
            </button>
          );
        })}
      </div>
      )}{/* end !showIntro for bottom mini-panel strip */}
    </div>
  );
}

// ---------- FindInViewMenu — "show this proposal in another view" popover ----------

function FindInViewMenu({ proposalId, lang, onOpenPanelView }) {
  const t = useT();
  const handleClick = (e) => {
    e.stopPropagation();
    if (onOpenPanelView) onOpenPanelView(proposalId);
  };
  return (
    <button
      onClick={handleClick}
      title={lang === 'en' ? 'Open in panel view (5 views at once)' : 'パネルビューで開く (5ビュー同時表示)'}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 26, height: 26,
        padding: 0,
        background: 'transparent',
        border: `1px solid ${t.hairlineStrong}`,
        borderRadius: 6,
        color: t.inkDim,
        cursor: 'pointer',
        transition: 'all .15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = t.ink; e.currentTarget.style.borderColor = t.ink; e.currentTarget.style.background = t.elevated; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = t.inkDim; e.currentTarget.style.borderColor = t.hairlineStrong; e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Grid icon to suggest "5 panels at once" */}
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <rect x="1.2" y="1.2" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
        <rect x="6.8" y="1.2" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
        <rect x="1.2" y="6.8" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
        <rect x="6.8" y="6.8" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1"/>
      </svg>
    </button>
  );
}

// ---------- Section row ----------

function SectionRow({ title, subtitle, items, cardSize = 'md' }) {
  const t = useT();
  const scrollRef = useRefR(null);
  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 600, behavior: 'smooth' });
  };
  const iconBtn = {
    width: 32, height: 32, borderRadius: '50%',
    background: t.elevated, border: 'none', cursor: 'pointer',
    color: t.ink,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background .15s',
  };
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 16, paddingRight: 8, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, minWidth: 0 }}>
          <h2 style={{
            margin: 0, fontFamily: t.display, fontSize: 26, fontWeight: 700,
            color: t.ink, letterSpacing: '-0.025em',
          }}>{title}</h2>
          {subtitle && (
            <span style={{
              fontFamily: t.body, fontSize: 14, color: t.inkDim,
              fontWeight: 500, whiteSpace: 'nowrap',
            }}>{subtitle}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={() => scroll(-1)} style={iconBtn}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button onClick={() => scroll(1)} style={iconBtn}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button style={{
            ...iconBtn, width: 'auto', padding: '0 14px',
            fontSize: 13, fontWeight: 600, color: t.accent,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>すべて見る</button>
        </div>
      </header>
      <div
        ref={scrollRef}
        className="apl-scroll"
        style={{
          display: 'flex', gap: 18,
          overflowX: 'auto', overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          paddingBottom: 8, marginLeft: -2, paddingLeft: 2,
          scrollbarWidth: 'none',
        }}
      >
        {items.map(p => (
          <div key={p.id} style={{ scrollSnapAlign: 'start' }}>
            <PosterCard p={p} size={cardSize} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- Category card ----------

// ---------- Unified proposal section ----------
// Replaces the 3 horizontal-scrolling rows. One vertical grid, dynamic title,
// sort/group controls. Reads the same filters as the rest of the page.

function UnifiedProposalSection({ proposals, activeFund, activeCategory, statusFilter, onOpenGuide, onOpenPanelView }) {
  const lang = useLang();
  const t = useT();
  const [sortMode, setSortMode] = useStateR('amount'); /* amount | fund | recent | media */
  const [groupBy, setGroupBy] = useStateR('none');     /* none | fund */
  const [onlyIncomplete, setOnlyIncomplete] = useStateR(false);
  const [displayMode, setDisplayMode] = useStateR('grid'); /* grid | list | compact */

  /* Title reflects the active filter state */
  const title = useMemoR(() => {
    if (statusFilter && statusFilter !== 'すべて') {
      if (statusFilter === '進行中') return T('sec_active', lang);
      if (statusFilter === '完了')   return T('sec_done',   lang);
      if (statusFilter === 'DNF')    return T('sec_dnf',    lang);
    }
    if (activeCategory && activeCategory !== 'ALL') {
      return activeCategory + T('sec_in', lang);
    }
    if (activeFund && activeFund !== 'ALL') {
      return activeFund + T('sec_in', lang);
    }
    return T('sec_all', lang);
  }, [statusFilter, activeCategory, activeFund, lang]);

  const subtitle = useMemoR(() => {
    if (activeFund !== 'ALL' && activeCategory !== 'ALL') return activeFund + ' · ' + activeCategory;
    if (activeFund !== 'ALL')     return 'Fund ' + activeFund.replace('F', '#');
    if (activeCategory !== 'ALL') return lang === 'en' ? 'By category' : 'カテゴリ別';
    if (statusFilter !== 'すべて') return (lang === 'en' ? 'Status: ' : 'ステータス: ') + (lang === 'en' ? T(({'進行中':'st_active','完了':'st_done','DNF':'st_dnf'})[statusFilter] || 'st_all', lang) : statusFilter);
    return lang === 'en' ? 'F2 → F14 · all' : 'F2 → F14 全件';
  }, [activeFund, activeCategory, statusFilter, lang]);

  /* Filter + sort */
  const list = useMemoR(() => {
    let arr = proposals.slice();
    if (onlyIncomplete) arr = arr.filter(p => p.s !== '完了');
    if (sortMode === 'amount') {
      arr.sort((a, b) => {
        const av = parseAmount(a.amount), bv = parseAmount(b.amount);
        return bv - av;
      });
    } else if (sortMode === 'fund') {
      arr.sort((a, b) => {
        const af = parseInt((a.f || '').replace('F',''), 10) || 0;
        const bf = parseInt((b.f || '').replace('F',''), 10) || 0;
        if (bf !== af) return bf - af;
        return parseAmount(b.amount) - parseAmount(a.amount);
      });
    } else if (sortMode === 'recent') {
      /* recent = higher fund first, then alphabetical */
      arr.sort((a, b) => {
        const af = parseInt((a.f || '').replace('F',''), 10) || 0;
        const bf = parseInt((b.f || '').replace('F',''), 10) || 0;
        return bf - af;
      });
    } else if (sortMode === 'media') {
      arr.sort((a, b) => (b.media ? 1 : 0) - (a.media ? 1 : 0) || parseAmount(b.amount) - parseAmount(a.amount));
    }
    return arr;
  }, [proposals, sortMode, onlyIncomplete]);

  /* Optional grouping */
  const groups = useMemoR(() => {
    if (groupBy === 'fund') {
      const byF = {};
      list.forEach(p => { (byF[p.f] = byF[p.f] || []).push(p); });
      const order = (window.FUND_ORDER || []).filter(f => byF[f] && byF[f].length);
      return order.map(f => ({ label: f, items: byF[f] }));
    }
    return [{ label: null, items: list }];
  }, [list, groupBy]);

  const sortLabel = {
    amount: T('sort_amount', lang),
    fund:   T('sort_fund',   lang),
    recent: T('sort_recent', lang),
    media:  T('sort_media',  lang),
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <header style={{
        display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap',
      }}>
        <h2 style={{
          margin: 0,
          fontFamily: t.display, fontSize: 26, fontWeight: 700,
          color: t.ink, letterSpacing: '-0.025em',
        }}>{title}</h2>
        <span style={{
          fontFamily: t.body, fontSize: 14, fontWeight: 500,
          color: t.inkDim,
        }}>{subtitle}</span>
        <span style={{
          fontFamily: t.mono, fontSize: 11, color: t.inkMuted,
          letterSpacing: '0.06em',
        }}>{list.length}{lang === 'en' ? ' items' : ' 件'}</span>

        <span style={{ flex: 1 }} />

        {/* Display mode toggle — grid / list / compact */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 2,
          padding: 3, borderRadius: 999,
          background: t.elevated, border: `1px solid ${t.hairline}`,
        }} title={lang === 'en' ? 'Display mode' : '表示モード'}>
          {[
            { id: 'grid',    label: lang === 'en' ? 'Grid' : 'グリッド',
              icon: <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor"><rect x="1.5" y="1.5" width="4.5" height="4.5" rx="0.7"/><rect x="8" y="1.5" width="4.5" height="4.5" rx="0.7"/><rect x="1.5" y="8" width="4.5" height="4.5" rx="0.7"/><rect x="8" y="8" width="4.5" height="4.5" rx="0.7"/></svg>
            },
            { id: 'list',    label: lang === 'en' ? 'List' : 'リスト',
              icon: <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor"><rect x="1.5" y="2"  width="11" height="2.5" rx="0.7"/><rect x="1.5" y="5.75" width="11" height="2.5" rx="0.7"/><rect x="1.5" y="9.5" width="11" height="2.5" rx="0.7"/></svg>
            },
            { id: 'compact', label: lang === 'en' ? 'Compact' : 'コンパクト',
              icon: <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="2.6" height="2.6" rx="0.4"/><rect x="4.6" y="1" width="2.6" height="2.6" rx="0.4"/><rect x="8.2" y="1" width="2.6" height="2.6" rx="0.4"/><rect x="1" y="4.6" width="2.6" height="2.6" rx="0.4"/><rect x="4.6" y="4.6" width="2.6" height="2.6" rx="0.4"/><rect x="8.2" y="4.6" width="2.6" height="2.6" rx="0.4"/><rect x="1" y="8.2" width="2.6" height="2.6" rx="0.4"/><rect x="4.6" y="8.2" width="2.6" height="2.6" rx="0.4"/><rect x="8.2" y="8.2" width="2.6" height="2.6" rx="0.4"/></svg>
            },
          ].map(m => (
            <button key={m.id}
              onClick={() => setDisplayMode(m.id)}
              title={m.label}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 26,
                border: 'none', borderRadius: 999, cursor: 'pointer',
                background: displayMode === m.id ? t.ink : 'transparent',
                color: displayMode === m.id ? t.bg : t.inkDim,
                transition: 'background .15s, color .15s',
              }}>{m.icon}</button>
          ))}
        </div>

        {/* Sort selector */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 2,
          padding: 3, borderRadius: 999,
          background: t.elevated, border: `1px solid ${t.hairline}`,
        }}>
          {['amount', 'fund', 'recent', 'media'].map(m => (
            <button key={m}
              onClick={() => setSortMode(m)}
              title={'ソート: ' + sortLabel[m]}
              style={{
                padding: '4px 11px', border: 'none', borderRadius: 999, cursor: 'pointer',
                background: sortMode === m ? t.ink : 'transparent',
                color: sortMode === m ? t.bg : t.inkDim,
                fontFamily: t.body, fontSize: 11.5, fontWeight: sortMode === m ? 700 : 500,
                whiteSpace: 'nowrap',
              }}>{sortLabel[m]}</button>
          ))}
        </div>

        {/* Group toggle */}
        <button
          onClick={() => setGroupBy(g => g === 'fund' ? 'none' : 'fund')}
          title="Fund 別にグループ化"
          style={{
            padding: '5px 12px', borderRadius: 999, cursor: 'pointer',
            background: groupBy === 'fund' ? t.ink : t.elevated,
            color: groupBy === 'fund' ? t.bg : t.inkDim,
            border: `1px solid ${groupBy === 'fund' ? t.ink : t.hairline}`,
            fontFamily: t.body, fontSize: 11.5, fontWeight: groupBy === 'fund' ? 700 : 500,
            whiteSpace: 'nowrap',
          }}>{T('group_fund', lang)}</button>

        {/* Only-incomplete toggle */}
        <button
          onClick={() => setOnlyIncomplete(v => !v)}
          title={lang === 'en' ? 'Show only in-progress + halted' : '未完了 + 停止のみ表示'}
          style={{
            padding: '5px 12px', borderRadius: 999, cursor: 'pointer',
            background: onlyIncomplete ? t.ink : t.elevated,
            color: onlyIncomplete ? t.bg : t.inkDim,
            border: `1px solid ${onlyIncomplete ? t.ink : t.hairline}`,
            fontFamily: t.body, fontSize: 11.5, fontWeight: onlyIncomplete ? 700 : 500,
            whiteSpace: 'nowrap',
          }}>{T('only_open', lang)}</button>
      </header>

      {list.length === 0 ? (
        <div style={{
          padding: '40px 0', textAlign: 'center',
          fontFamily: t.serif, fontStyle: 'italic', fontSize: 15,
          color: t.inkMuted,
        }}>{lang === 'en' ? 'No proposals match the current filters.' : '条件に一致する提案がありません。'}</div>
      ) : (
        groups.map((g, gi) => (
          <div key={g.label || 'all'} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {g.label && (
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 12,
                paddingTop: gi > 0 ? 10 : 0,
              }}>
                <span style={{
                  fontFamily: t.display, fontSize: 22, fontWeight: 700,
                  color: t.ink, letterSpacing: '-0.02em',
                }}>{g.label}</span>
                <span style={{
                  fontFamily: t.body, fontSize: 12, color: t.inkDim,
                }}>{g.items.length} 件</span>
                <span style={{ flex: 1, height: 1, background: t.hairline }} />
              </div>
            )}
            {displayMode === 'list' ? (
              gi === 0 ? (
                /* First group in list mode: hero tile on the left, vertical list on the right.
                   Left column is a FIXED width so the hero never changes size as its preview text rotates. */
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '380px minmax(0, 1fr)',
                  gap: 14, alignItems: 'stretch',
                }}>
                  <div style={{ maxHeight: 720, width: 380, display: 'flex' }}>
                    <HeroGuideTile lang={lang} t={t} fillHeight onOpenGuide={onOpenGuide} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
                    {g.items.map(p => <PosterListItem key={p.id} p={p} onOpenPanelView={onOpenPanelView} />)}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {g.items.map(p => <PosterListItem key={p.id} p={p} onOpenPanelView={onOpenPanelView} />)}
                </div>
              )
            ) : displayMode === 'compact' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
                gap: 10,
              }}>
                {g.items.map(p => <PosterCompact key={p.id} p={p} />)}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gap: 22,
              }}>
                {/* Top-row hero: a 2×1 tile reserved for an explanation video.
                    Only shown on the very first group of the very first grid render. */}
                {gi === 0 && <HeroGuideTile lang={lang} t={t} onOpenGuide={onOpenGuide} />}
                {g.items.map(p => <PosterCard key={p.id} p={p} size="md" fluid onOpenPanelView={onOpenPanelView} />)}
              </div>
            )}
          </div>
        ))
      )}
    </section>
  );
}

/* Parse amount string like "600K" / "4.1M" to numeric ADA-K */
function parseAmount(s) {
  if (!s) return 0;
  const m = String(s).match(/^([\d.]+)\s*([KM])?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const u = (m[2] || '').toUpperCase();
  if (u === 'M') return n * 1000;
  return n;
}

function CategoryCard({ name, count, hue }) {
  const t = useT();
  return (
    <div style={{
      position: 'relative', aspectRatio: '16 / 9',
      borderRadius: t.radius, overflow: 'hidden', cursor: 'pointer',
      isolation: 'isolate', boxShadow: t.cardShadow,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, oklch(58% 0.20 ${hue}) 0%, oklch(38% 0.15 ${(hue + 50) % 360}) 100%)`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.25) 100%)',
      }} />
      <div style={{
        position: 'absolute', top: 14, left: 16,
        fontFamily: t.display, fontSize: 18, fontWeight: 700,
        color: '#fff', letterSpacing: '-0.01em',
      }}>{name}</div>
      <div style={{
        position: 'absolute', bottom: 12, left: 16,
        fontFamily: t.mono, fontSize: 11, fontWeight: 600,
        color: '#fff', opacity: 0.85, letterSpacing: '0.05em',
      }}>{count} PROPOSALS</div>
      <div style={{ position: 'absolute', bottom: 12, right: 14, color: '#fff', opacity: 0.7 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M5 3L11 8L5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

// ---------- Sidebar ----------

function ASidebar({ activeNav, setActiveNav, activeFund, setActiveFund }) {
  const t = useT();
  const lang = useLang();
  const navItems = [
    { id: 'home',     label: lang === 'en' ? 'Home'         : 'ホーム',       icon: '⌂' },
    { id: 'featured', label: lang === 'en' ? 'Featured'     : 'おすすめ',     icon: '★' },
    { id: 'all',      label: lang === 'en' ? 'All Proposals': 'すべての提案', icon: '⊞' },
    { id: 'recent',   label: lang === 'en' ? 'Recent'       : '最近追加',     icon: '⏱' },
  ];
  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: t.bg,
      borderRight: `1px solid ${t.hairline}`,
      padding: '24px 14px 20px 18px',
      display: 'flex', flexDirection: 'column', gap: 24,
      overflow: 'auto',
    }}>
      <div style={{
        padding: '4px 8px',
        fontFamily: t.display, fontSize: 17, fontWeight: 700,
        color: t.ink, letterSpacing: '-0.02em',
        display: 'flex', alignItems: 'baseline', gap: 6,
      }}>
        Catalyst
        <span style={{
          fontFamily: t.serif, fontStyle: 'italic',
          color: t.accent, fontWeight: 400,
        }}>日本</span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: t.panel,
        border: `1px solid ${t.hairline}`,
        borderRadius: 8, padding: '7px 10px', margin: '0 4px',
      }}>
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4" stroke={t.inkDim} strokeWidth="1.4" />
          <path d="M9 9L12 12" stroke={t.inkDim} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: t.body, fontSize: 13, color: t.inkDim }}>検索</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navItems.map(item => {
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px',
                background: active ? t.elevated : 'transparent',
                border: 'none', borderRadius: 6, cursor: 'pointer',
                color: active ? t.ink : t.inkDim,
                fontFamily: t.body, fontSize: 13.5, fontWeight: 500,
                textAlign: 'left',
                transition: 'background .15s, color .15s',
              }}
            >
              <span style={{
                width: 18, textAlign: 'center', fontSize: 14,
                color: active ? t.accent : t.inkDim,
              }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </div>

      <div>
        <div style={{
          padding: '0 10px 10px 10px',
          fontFamily: t.body, fontSize: 11, fontWeight: 600,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: t.inkMuted,
        }}>FUNDS</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[['ALL', (window.TOTAL_COUNT || 130)], ...FUND_ORDER.filter(f => (FUND_COUNTS[f]||0) > 0).map(f => [f, FUND_COUNTS[f]])].map(([f, c]) => {
            const active = activeFund === f;
            return (
              <button
                key={f}
                onClick={() => setActiveFund(f)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '6px 10px',
                  background: active ? t.elevated : 'transparent',
                  border: 'none', borderRadius: 6, cursor: 'pointer',
                  color: active ? t.ink : t.inkDim,
                  fontFamily: t.body, fontSize: 13, fontWeight: 500,
                  letterSpacing: '0.01em', textAlign: 'left',
                }}
              >
                <span style={{ fontFamily: t.mono, fontWeight: active ? 600 : 500 }}>{f}</span>
                <span style={{ fontFamily: t.mono, fontSize: 11.5, color: t.inkMuted }}>{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <div style={{
        margin: '0 4px', padding: 14,
        background: t.panel,
        border: `1px solid ${t.hairline}`,
        borderRadius: 10,
      }}>
        <div style={{
          fontFamily: t.body, fontSize: 10.5, fontWeight: 600,
          color: t.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase',
          marginBottom: 8,
        }}>TOTAL</div>
        <div style={{
          fontFamily: t.display, fontSize: 24, fontWeight: 700,
          color: t.ink, letterSpacing: '-0.025em',
          display: 'inline-flex', alignItems: 'baseline', gap: 3,
        }}>
          <span style={{ color: t.inkDim, fontSize: 18, fontWeight: 500 }}>₳</span>{window.TOTAL_ADA_DISPLAY || '41.2M'}
        </div>
        <div style={{ marginTop: 2, fontFamily: t.body, fontSize: 12, color: t.inkDim }}>
          {window.TOTAL_COUNT || 130} proposals · F2–F14
        </div>
      </div>
    </aside>
  );
}

// ---------- Top bar ----------

/* ============================================================
   RemoteBar — matches the main Catalyst Japan site's dock /
   remote control style. Sits at the top of the catalog page,
   floating black pill with: view tabs (incl. カタログ active),
   currency, price-mode, language, theme, zoom, settings.
   ============================================================ */
function RemoteBar({ themeMode, toggleTheme, lang: langProp, setLang: setLangProp }) {
  const t = useT();
  /* Dark dock that mirrors the main Catalyst Japan family-site bottom remote */
  const RB = {
    bg: '#0d0d10',
    pill: '#1c1c1f',
    pillHi: '#2a2a2f',
    ink: '#f5f1e8',
    inkDim: '#85827b',
    inkMuted: '#5a5852',
    hairline: 'rgba(255,245,225,0.07)',
    hairlineStrong: 'rgba(255,245,225,0.15)',
    accent: '#d4a04a',
  };
  const [currency, setCurrency] = useStateR('ada');
  const [priceMode, setPriceMode] = useStateR('submit');
  /* Lang: use the App's lang if passed; else fall back to local state for standalone usage */
  const [localLang, setLocalLang] = useStateR('ja');
  const lang = (langProp !== undefined) ? langProp : localLang;
  const setLang = setLangProp || setLocalLang;
  const [zoom, setZoom] = useStateR(50);

  /* 6 view tabs — mirrors family-site dock with カタログ appended.
     Each link deep-links into index.html via ?view= so the user lands on the right mode.
     Pass current theme + lang in the URL so the new tab matches the catalog's current state. */
  const themeQS = (themeMode === 'light' ? 'light' : 'dark');
  const langQS  = (lang === 'en' ? 'en' : 'jp');
  const qs = (v) => `index.html?view=${v}&theme=${themeQS}&lang=${langQS}`;
  const views = [
    { id: 'sector',   label: lang === 'en' ? 'Sector'    : '業界別',     href: qs('sector') },
    { id: 'account',  label: lang === 'en' ? 'Accounts'  : 'アカウント別', href: qs('account') },
    { id: 'timeline', label: lang === 'en' ? 'Timeline'  : '時系列',     href: qs('timeline') },
    { id: 'network',  label: lang === 'en' ? 'Network'   : '関係図',     href: qs('network') },
    { id: 'chart',    label: lang === 'en' ? 'Chart'     : 'チャート',   href: qs('chart') },
    { id: 'catalog',  label: lang === 'en' ? 'Catalog'   : 'カタログ',   href: null, current: true },
  ];

  const pillBtn = (active, extraStyle = {}) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 12px',
    background: active ? RB.ink : 'transparent',
    color: active ? '#0a0a0c' : RB.inkDim,
    border: 'none', borderRadius: 999, cursor: 'pointer',
    fontFamily: t.body, fontSize: 12.5, fontWeight: active ? 700 : 500,
    whiteSpace: 'nowrap',
    transition: 'background .15s, color .15s',
    ...extraStyle,
  });
  const groupBox = {
    display: 'inline-flex', alignItems: 'center', gap: 2,
    background: RB.pill, borderRadius: 999, padding: 3,
  };
  const iconBtn = (active) => ({
    width: 30, height: 30, borderRadius: '50%',
    background: active ? RB.pillHi : 'transparent',
    color: active ? RB.ink : RB.inkDim,
    border: 'none', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13,
    transition: 'background .15s, color .15s',
  });

  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      padding: '14px 18px 10px',
      background: t.bg,
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 8px',
        background: RB.bg,
        border: `1px solid ${RB.hairline}`,
        borderRadius: 14,
        boxShadow: '0 6px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.4)',
        maxWidth: '100%', overflow: 'hidden',
      }}>
        {/* View tabs */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          {views.map(v => (
            v.current
              ? <span key={v.id} style={pillBtn(true)}>{v.label}</span>
              : <a key={v.id} href={v.href} target="_blank" rel="noopener noreferrer"
                  style={{ ...pillBtn(false), textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.color = RB.ink; }}
                  onMouseLeave={e => { e.currentTarget.style.color = RB.inkDim; }}
                >{v.label}</a>
          ))}
        </div>

        {/* Divider */}
        <span style={{ width: 1, height: 18, background: RB.hairline, margin: '0 4px' }} />

        {/* Currency group */}
        <div style={groupBox} role="group" aria-label="Currency">
          {[
            { id: 'jpy', glyph: '¥' },
            { id: 'usd', glyph: '$' },
            { id: 'ada', glyph: '₳' },
          ].map(c => (
            <button key={c.id} onClick={() => setCurrency(c.id)} title={c.id.toUpperCase()}
              style={{
                ...pillBtn(currency === c.id),
                background: currency === c.id ? RB.ink : 'transparent',
                color: currency === c.id ? '#0a0a0c' : RB.ink,
                padding: '4px 11px',
                fontFamily: t.mono, fontSize: 13,
              }}
            >{c.glyph}</button>
          ))}
        </div>

        {/* Price mode group */}
        <div style={groupBox} role="group" aria-label="Price mode">
          {[
            { id: 'submit', label: '提案時' },
            { id: 'result', label: '採択時' },
          ].map(p => (
            <button key={p.id} onClick={() => setPriceMode(p.id)} style={pillBtn(priceMode === p.id, { padding: '4px 10px' })}
            >{p.label}</button>
          ))}
        </div>

        {/* Language group */}
        <div style={groupBox} role="group" aria-label="Language">
          {[
            { id: 'en', label: 'EN' },
            { id: 'ja', label: 'JP' },
          ].map(l => (
            <button key={l.id} onClick={() => setLang(l.id)} style={pillBtn(lang === l.id, { padding: '4px 10px', fontFamily: t.mono, fontSize: 11, fontWeight: lang === l.id ? 700 : 500, letterSpacing: '0.04em' })}
            >{l.label}</button>
          ))}
        </div>

        {/* Theme toggle — pill-styled so it visually matches the EN/JP buttons and the
            full clickable area is obvious. Icon flips: sun in dark mode → moon in light mode. */}
        <button
          onClick={(e) => { e.stopPropagation(); if (toggleTheme) toggleTheme(); }}
          title={themeMode === 'dark' ? 'Light mode' : 'Dark mode'}
          aria-label="Toggle theme"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 30,
            padding: 0,
            background: RB.pill,
            color: RB.ink,
            border: 'none', borderRadius: 999, cursor: 'pointer',
            transition: 'background .15s, color .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = RB.pillHi; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = RB.pill; }}
        >
          {themeMode === 'dark' ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ pointerEvents: 'none' }}>
              <circle cx="7" cy="7" r="2.8" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                <line x1="7" y1="1.5" x2="7" y2="3" />
                <line x1="7" y1="11" x2="7" y2="12.5" />
                <line x1="1.5" y1="7" x2="3" y2="7" />
                <line x1="11" y1="7" x2="12.5" y2="7" />
              </g>
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ pointerEvents: 'none' }}>
              <path d="M11 9C8 9 5 6 5 3a4 4 0 1 0 6 6Z" fill="currentColor" />
            </svg>
          )}
        </button>

        <span style={{ width: 1, height: 18, background: RB.hairline, margin: '0 2px' }} />

        {/* Zoom slider */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 6px' }}>
          <button onClick={() => setZoom(z => Math.max(0, z - 10))} title="Zoom out"
            style={{ ...iconBtn(false), width: 22, height: 22, fontSize: 16, lineHeight: 1 }}>−</button>
          <div style={{
            position: 'relative', width: 76, height: 4,
            background: RB.pill, borderRadius: 2,
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${zoom}%`, background: RB.inkDim, borderRadius: 2,
            }} />
            <div style={{
              position: 'absolute', left: `${zoom}%`, top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 10, height: 10, borderRadius: '50%',
              background: RB.ink, border: `2px solid ${RB.bg}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
            }} />
          </div>
          <button onClick={() => setZoom(z => Math.min(100, z + 10))} title="Zoom in"
            style={{ ...iconBtn(false), width: 22, height: 22, fontSize: 14, lineHeight: 1 }}>+</button>
          {/* Default label removed — keeps the bar tighter; slider position conveys "default" visually */}
        </div>

        <span style={{ width: 1, height: 18, background: RB.hairline, margin: '0 2px' }} />

        {/* Settings */}
        <button title="Settings" style={iconBtn(false)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="1.6" fill="currentColor" />
            <path d="M7 1.5v1.8M7 10.7v1.8M2.6 2.6l1.3 1.3M10.1 10.1l1.3 1.3M1.5 7h1.8M10.7 7h1.8M2.6 11.4l1.3-1.3M10.1 3.9l1.3-1.3" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ATopBar({ themeMode, toggleTheme, statusFilter, setStatusFilter, resultCount }) {
  const t = useT();
  const navArrow = {
    width: 28, height: 28, borderRadius: '50%',
    background: t.elevated, border: 'none', cursor: 'pointer',
    color: t.ink,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 32px',
      borderBottom: `1px solid ${t.hairline}`,
      background: t.topBarBg,
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      <button style={navArrow}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button style={{ ...navArrow, opacity: 0.4 }}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
          <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div style={{ width: 1, height: 18, background: t.hairline, marginLeft: 4, marginRight: 4 }} />
      {['すべて', '進行中', '完了', 'DNF'].map((opt) => {
        const active = statusFilter === opt;
        return (
          <button key={opt}
            onClick={() => setStatusFilter && setStatusFilter(opt)}
            style={{
              padding: '6px 14px',
              background: active ? t.elevated : 'transparent',
              border: 'none', borderRadius: 999,
              color: active ? t.ink : t.inkDim,
              fontFamily: t.body, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', letterSpacing: '-0.005em',
              whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'background .15s, color .15s',
            }}>{opt}</button>
        );
      })}
      <div style={{ flex: 1, minWidth: 8 }} />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px 5px 8px',
          background: t.elevated,
          border: `1px solid ${t.hairline}`,
          borderRadius: 999, cursor: 'pointer',
          color: t.ink,
          fontFamily: t.body, fontSize: 12, fontWeight: 600,
          whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        {themeMode === 'dark' ? (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="3" fill="currentColor" />
              <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                <line x1="7" y1="1.5" x2="7" y2="3" />
                <line x1="7" y1="11" x2="7" y2="12.5" />
                <line x1="1.5" y1="7" x2="3" y2="7" />
                <line x1="11" y1="7" x2="12.5" y2="7" />
                <line x1="3" y1="3" x2="4" y2="4" />
                <line x1="10" y1="10" x2="11" y2="11" />
                <line x1="11" y1="3" x2="10" y2="4" />
                <line x1="4" y1="10" x2="3" y2="11" />
              </g>
            </svg>
            <span>Light</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 8.5C10.2 8.8 9.4 9 8.5 9C5.5 9 3 6.5 3 3.5C3 2.6 3.2 1.8 3.5 1C1.7 1.8 0.5 3.5 0.5 5.5C0.5 8.3 2.7 10.5 5.5 10.5C7.5 10.5 9.2 9.3 11 8.5Z" fill="currentColor" transform="translate(1, 1.5)" />
            </svg>
            <span>Dark</span>
          </>
        )}
      </button>

      <span style={{
        fontFamily: t.mono, fontSize: 12, color: t.inkDim,
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>{(resultCount != null ? resultCount : (PROPOSALS||[]).length)} PROPOSALS</span>
    </div>
  );
}

// ---------- Funds の歩み — 3-era explainer card row ----------

function FundEras() {
  const t = useT();
  const lang = useLang();
  const eras = [
    {
      label: 'F2 – F9',  period: '2020 / 06 – 2022 / 11',  hue: 28,
      title: lang === 'en' ? 'Dawn' : '黎明期',
      sub: lang === 'en' ? 'The IdeaScale Era' : 'IdeaScale 時代',
      body: lang === 'en'
        ? 'Operated on IdeaScale. Close-out reports were optional. About 60% of proposals in this catalog have no surviving deliverables.'
        : 'IdeaScale で運用。Close-Out レポートは推奨に留まり、現存する成果物が限定的。本カタログでも約 60% が「資料無し」。',
    },
    {
      label: 'F10 – F12', period: '2023 / 04 – 2024 / 06', hue: 280,
      title: lang === 'en' ? 'Formalization' : '制度化',
      sub: lang === 'en' ? 'Milestone System Introduced' : 'Milestone 制度導入',
      body: lang === 'en'
        ? 'Migrated to projectcatalyst.io. SoM / PoA submissions became mandatory. Close-out reports and Town Hall videos became standard deliverables.'
        : 'projectcatalyst.io へ移行。SoM / PoA の提出が義務化。Close-Out Report と Town Hall 動画が標準成果物として整備された。',
    },
    {
      label: 'F13 – F14', period: '2024 / 10 – 2026 / 04', hue: 350,
      title: lang === 'en' ? 'Turmoil & Pause' : '混迷と停止',
      sub: lang === 'en' ? 'Catalyst Under Review' : 'Catalyst 見直し期',
      body: lang === 'en'
        ? 'The Constitution was ratified and DRep voting went live, but governance fatigue and declining participation led to Catalyst being paused for review as of 2026.'
        : 'Constitution 制定・DRep 投票が稼働するも、ガバナンス疲弊・参加減退で 2026 年現在 Catalyst は見直しのため停止中。次の運営フェーズ検討フェーズ。',
    },
  ];

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
        <h2 style={{
          margin: 0, fontFamily: t.display, fontSize: 26, fontWeight: 700,
          color: t.ink, letterSpacing: '-0.025em',
        }}>{lang === 'en' ? 'Fund History' : 'Funds の歩み'}</h2>
        <span style={{
          fontFamily: t.body, fontSize: 14, fontWeight: 500, color: t.inkDim,
          whiteSpace: 'nowrap',
        }}>{lang === 'en' ? '13 rounds, F2 → F14' : 'F2 → F14 までの 13 ラウンド'}</span>
      </header>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14,
      }}>
        {eras.map(era => (
          <article key={era.label} style={{
            position: 'relative',
            background: t.panel,
            border: `1px solid ${t.hairline}`,
            borderRadius: t.radius,
            padding: '18px 18px 16px',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {/* Accent gradient strip at top */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(90deg, transparent 0%, oklch(72% 0.18 ${era.hue}) 40%, oklch(72% 0.18 ${(era.hue+90)%360}) 80%, transparent 100%)`,
            }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{
                fontFamily: t.display, fontSize: 24, fontWeight: 700,
                color: t.ink, letterSpacing: '-0.02em', lineHeight: 1,
              }}>{era.label}</span>
              <span style={{
                fontFamily: t.mono, fontSize: 10.5, color: t.inkMuted,
                letterSpacing: '0.04em',
              }}>{era.period}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{
                fontFamily: t.display, fontSize: 16, fontWeight: 600, color: t.ink,
              }}>{era.title}</span>
              <span style={{
                fontFamily: t.serif, fontStyle: 'italic', fontSize: 13,
                color: t.inkDim,
              }}>— {era.sub}</span>
            </div>
            <p style={{
              margin: 0,
              fontFamily: t.body, fontSize: 12.5, color: t.inkDim,
              lineHeight: 1.55,
            }}>{era.body}</p>
          </article>
        ))}
      </div>

      {/* (footer disclaimer removed — same notice is shown on the family-site dock) */}
    </section>
  );
}

// ---------- App ----------

function RefinedCatalogApp() {
  /* Pick up theme + lang + currency from URL params when launched embedded inside index.html.
     Falls back to dark / ja / ada when standalone. */
  const initParams = (() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const cur = p.get('currency');
      return {
        theme: p.get('theme') === 'light' ? 'light' : 'dark',
        lang:  p.get('lang')  === 'en'    ? 'en'    : 'ja',
        currency: cur === 'usd' ? 'usd' : cur === 'jpy' ? 'jpy' : 'ada',
      };
    } catch (e) { return { theme: 'dark', lang: 'ja', currency: 'ada' }; }
  })();

  const [themeMode, setThemeMode] = useStateR(initParams.theme);
  const [lang, setLang] = useStateR(initParams.lang);
  /* Currency mode for amount display — synced from host's ¥/$/₳ toggle via postMessage.
     priceTick bumps whenever the host posts a price-mode-change message: AAdaAmount reads
     it as a context value so it re-renders and picks up the freshly-mutated p._raw.adaPrice. */
  const [currency, setCurrency] = useStateR(initParams.currency);  // 'ada' | 'usd' | 'jpy'
  const [priceTick, setPriceTick] = useStateR(0);
  const t = themeMode === 'light' ? LIGHT : DARK;

  /* Listen for theme / lang / currency / price-mode changes sent from the host via postMessage */
  React.useEffect(() => {
    function onMsg(e) {
      if (!e || !e.data || typeof e.data !== 'object') return;
      if (e.data.type === 'theme-change') {
        setThemeMode(e.data.dark ? 'dark' : 'light');
      } else if (e.data.type === 'lang-change') {
        setLang(e.data.lang === 'en' ? 'en' : 'ja');
      } else if (e.data.type === 'currency-change') {
        const v = e.data.value;
        setCurrency(v === 'usd' ? 'usd' : v === 'jpy' ? 'jpy' : 'ada');
      } else if (e.data.type === 'price-mode-change') {
        /* Host has already mutated INDUSTRIES (recalcAll updates p.adaPrice on each proposal
           in place). Bumping the tick re-runs AAdaAmount which reads adaPrice live from p._raw. */
        setPriceTick(t => t + 1);
      }
    }
    window.addEventListener('message', onMsg);
    /* Expose lang globally for non-React code (e.g. RotatingTagline reads window.CJLang if it wants) */
    window.CJLang = lang;
    return () => window.removeEventListener('message', onMsg);
  }, [lang]);

  const [activeNav, setActiveNav] = useStateR('home');
  const [activeFund, setActiveFund] = useStateR('ALL');
  const [activeCategory, setActiveCategory] = useStateR('ALL');
  const [statusFilter, setStatusFilter] = useStateR('すべて');

  /* Featured = first proposal with a video (cinematic-friendly), else first 進行中 */
  const featured = PROPOSALS.find(p => p.videoUrl) || PROPOSALS.find(p => p.s === '進行中') || PROPOSALS[0];

  /* Filters applied to all rows */
  const visible = useMemoR(() => {
    return PROPOSALS.filter(p => {
      if (statusFilter !== 'すべて' && p.s !== statusFilter) return false;
      if (activeFund !== 'ALL' && p.f !== activeFund) return false;
      if (activeCategory !== 'ALL' && p.cat !== activeCategory) return false;
      return true;
    });
  }, [statusFilter, activeFund, activeCategory]);

  /* Sort helper: items with media first (more visual) */
  const mediaFirst = (a, b) => (b.media ? 1 : 0) - (a.media ? 1 : 0);

  const inProgress = useMemoR(() => visible.filter(p => p.s === '進行中').sort(mediaFirst).slice(0, 12), [visible]);
  const completed  = useMemoR(() => visible.filter(p => p.s === '完了').sort(mediaFirst).slice(0, 12), [visible]);
  const realWorld  = useMemoR(() => visible.filter(p => p.cat === 'REAL WORLD').slice(0, 10), [visible]);

  /* Dynamic category counts from real PROPOSALS (5 most populous) */
  const cats = useMemoR(() => {
    const huePerCat = { COMMUNITY: 140, 'REAL WORLD': 210, 'DEV TECH': 330, IDENTITY: 280, EMERGING: 55, MEDIA: 305 };
    const m = {};
    PROPOSALS.forEach(p => { m[p.cat] = (m[p.cat] || 0) + 1; });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, hue: huePerCat[name] || 200 }));
  }, []);

  const [query, setQuery] = useStateR('');
  const [showGuide, setShowGuide] = useStateR(false);
  const [panelProposalId, setPanelProposalId] = useStateR(null);
  const panelProposal = panelProposalId ? PROPOSALS.find(p => p.id === panelProposalId) : null;

  /* Detect embed mode (loaded inside index.html iframe). Used to:
     - hide own RemoteBar (host dock takes over)
     - leave space at the top for the host's fixed view-bar */
  const isEmbedded = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('embed') === '1';

  return (
    <ThemeContext.Provider value={t}>
    <LangContext.Provider value={lang}>
    <CurrencyContext.Provider value={currency}>
    <PriceTickContext.Provider value={priceTick}>
      <div style={{
        /* Use 100% of parent (#root). catalog.html sizes #root to 125vw × 125vh and scales it
           by 0.8 — so #root visually fills the viewport. Anchoring this div with 100vh would
           use the un-scaled browser viewport and leave a black strip at the bottom. */
        display: 'flex', height: '100%', width: '100%',
        minWidth: 1080,
        background: t.bg, color: t.ink,
        fontFamily: t.body,
        overflow: 'hidden',
      }}>
        <style>{`
          .apl-scroll::-webkit-scrollbar { display: none; }
          /* Pulse for the white Panel-View trigger on every card */
          @keyframes pv-trigger-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.35), 0 0 14px rgba(255,255,255,0.18); }
            50%      { box-shadow: 0 0 0 7px rgba(255,255,255,0),    0 0 26px rgba(255,255,255,0.32); }
          }
        `}</style>
        {/* Sidebar removed — its contents (logo, search, primary nav, totals, funds) now live inside CompactHeroNav */}
        <div style={{
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Hide own RemoteBar when embedded inside index.html (host dock takes over) */}
          {!isEmbedded && (
            <RemoteBar
              themeMode={themeMode}
              toggleTheme={() => setThemeMode(m => m === 'dark' ? 'light' : 'dark')}
              lang={lang}
              setLang={setLang}
            />
          )}
          <main style={{
            flex: 1, minHeight: 0, overflowY: 'auto',
            padding: '24px 160px 60px 160px',
            display: 'flex', flexDirection: 'column', gap: 44,
          }}>
            <CinematicHero
              activeFund={activeFund} setActiveFund={setActiveFund}
              activeCategory={activeCategory} setActiveCategory={setActiveCategory}
              activeNav={activeNav} setActiveNav={setActiveNav}
              query={query} setQuery={setQuery}
              cats={cats}
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              visibleCount={visible.length}
            />

            <UnifiedProposalSection
              proposals={visible}
              activeFund={activeFund}
              activeCategory={activeCategory}
              statusFilter={statusFilter}
              onOpenGuide={() => setShowGuide(true)}
              onOpenPanelView={(pid) => setPanelProposalId(pid)}
            />

            <footer style={{
              marginTop: 32, paddingTop: 28, paddingBottom: 28,
              borderTop: `1px solid ${t.hairline}`,
              display: 'flex', flexDirection: 'column', gap: 12,
              color: t.inkMuted,
              flexShrink: 0,
            }}>
              {/* Disclaimer — same wording as the family-site dock to keep consistency */}
              <div style={{
                fontFamily: t.body, fontSize: 11.5, lineHeight: 1.65,
                color: t.inkDim,
              }}>
                {lang === 'en' ? (
                  <>※ Data on this site is a factual record based on public information from Catalyst Explorer and projectcatalyst.io, and does not include independent evaluations, recommendations, or subjective judgments. Provided for research and experimental purposes only — not investment advice or solicitation of financial products. This is an unofficial personal project with no affiliation to any organization; accuracy and completeness are not guaranteed.</>
                ) : (
                  <>※ 本サイトに掲載されたデータは Catalyst Explorer および projectcatalyst.io の公開情報に基づく事実の記録であり、独自の評価・推奨・主観的判断は一切含みません。研究・実験目的でのみ提供されており、投資助言・金融商品の勧誘を目的としたものではありません。本サイトは非公式の個人プロジェクトであり、いかなる団体とも提携・関連はなく、正確性・完全性は保証されません。</>
                )}
              </div>
              {/* Tagline + version */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                fontSize: 12,
              }}>
                <div>Catalyst Japan Catalog · An independent index of community proposals.</div>
                <div style={{ fontFamily: t.mono }}>v.2026.05</div>
              </div>
            </footer>
          </main>
        </div>
      </div>
      {/* In-page guide walkthrough — opened from HeroGuideTile */}
      <GuideWalkthroughModal show={showGuide} onClose={() => setShowGuide(false)} lang={lang} />
      {/* Panel view — 5 live iframes of every view at once, opened from FindInViewMenu */}
      <PanelViewModal show={!!panelProposal} proposal={panelProposal} onClose={() => setPanelProposalId(null)} lang={lang} />
    </PriceTickContext.Provider>
    </CurrencyContext.Provider>
    </LangContext.Provider>
    </ThemeContext.Provider>
  );
}

Object.assign(window, { RefinedCatalogApp });
