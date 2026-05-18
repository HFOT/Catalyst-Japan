// Catalyst Japan Catalog — design tokens + atomic components + REAL data adapter.
// Reads window.CJ_DATA (from data.js), window.PDESC (from descriptions.js),
// and window.PMETA (from proposal-meta.js) and produces the PROPOSALS shape
// expected by catalog-views.jsx / catalog-shell.jsx.

// ---------- Design tokens (verbatim from handoff) ----------
const TOKENS = {
  bg: '#0a0a0c',
  panel: '#111114',
  panelHi: '#15151a',
  hairline: 'rgba(255,245,225,0.08)',
  hairlineStrong: 'rgba(255,245,225,0.14)',
  ink: '#ece6d8',
  inkDim: '#a8a299',
  inkMuted: '#6a655c',
  inkFaint: '#3e3a34',
  done: '#7dd6a3',
  active: '#f0c75e',
  stop: '#e87878',
  cat: {
    'COMMUNITY':  '#a4d59c',
    'IDENTITY':   '#b39df0',
    'REAL WORLD': '#7cc3e0',
    'EMERGING':   '#e5c46a',
    'DEV TECH':   '#ec8aa8',
    'MEDIA':      '#d8c8a8',
  },
  rainbow: ['#ff8a3d', '#ec8aa8', '#b39df0', '#7cc3e0', '#a4d59c', '#e5c46a'],
  serif: '"EB Garamond", "Noto Serif JP", "Times New Roman", serif',
  sans: '"Geist", "Inter", "Noto Sans JP", -apple-system, sans-serif',
  mono: '"Geist Mono", "JetBrains Mono", ui-monospace, monospace',
};

// ---------- Real-data adapter ----------
// Sector code → handoff category
const SECTOR_TO_CAT = {
  co: 'COMMUNITY',
  is: 'IDENTITY',
  rw: 'REAL WORLD',
  em: 'EMERGING',
  dt: 'DEV TECH',
  df: 'DEV TECH',
  ed: 'COMMUNITY',
  gv: 'REAL WORLD',
  io: 'DEV TECH',
  gf: 'EMERGING',
  nf: 'MEDIA',
  su: 'REAL WORLD',
  sc: 'DEV TECH',
};

// Status code → Japanese label used by the design
function stToJa(st) {
  if (st === 'complete') return '完了';
  if (st === 'dnf') return 'DNF';
  return '進行中';
}

// "Yohei Iwasaki" → "YI"
function makeInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  // single token — take first 2 chars, but keep CJK single-char
  const first = parts[0] || '?';
  return first.slice(0, 2).toUpperCase();
}

// Stable hash from a string → 0..359
function nameHue(s) {
  let h = 0;
  for (let i = 0; i < (s || '').length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

// "600" (K ADA) or 4100 (K ADA) → "600K" / "4.1M"
function formatAdaK(adaK) {
  if (!adaK || adaK <= 0) return '—';
  if (adaK >= 1000) return (adaK / 1000).toFixed(adaK >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (adaK >= 100) return Math.round(adaK) + 'K';
  return adaK.toFixed(adaK >= 10 ? 0 : 1).replace(/\.0$/, '') + 'K';
}

// Build the link-count map from a PMETA entry. The handoff orders chips as in `links`.
function buildLinkCounts(meta) {
  const out = {};
  if (!meta) return out;
  if (meta.site) out.SITE = 1;
  if (meta.pdf && meta.pdf.length) out.PDF = meta.pdf.length;
  if (meta.slides && meta.slides.length) out.SLIDES = meta.slides.length;
  if (meta.github && meta.github.length) out.GH = meta.github.length;
  if (meta.x && meta.x.length) out.x = meta.x.length;
  if (meta.linkedin && meta.linkedin.length) out.in = meta.linkedin.length;
  if (meta.medium && meta.medium.length) out.M = meta.medium.length;
  if (meta.doc && meta.doc.length) out.DOC = meta.doc.length;
  if (meta.drive && meta.drive.length) out.DRIVE = meta.drive.length;
  if (meta.notion && meta.notion.length) out.NOTION = meta.notion.length;
  if (meta.figma && meta.figma.length) out.FIGMA = meta.figma.length;
  if (meta.videos && meta.videos.length) out.VIDEO = meta.videos.length;
  // Always offer a deep link to Catalyst Explorer if available
  if ((meta.catalyst && meta.catalyst.length) || (meta.explorer && meta.explorer.length)) out.EXPLORER = 1;
  return out;
}

// Resolve the best outbound link for a given chip kind (used by view-renderer click handlers)
function resolveLinkUrl(meta, kind) {
  if (!meta) return null;
  switch (kind) {
    case 'SITE':    return meta.site || null;
    case 'PDF':     return (meta.pdf || [])[0] || null;
    case 'SLIDES':  return (meta.slides || [])[0] || null;
    case 'GH':      return (meta.github || [])[0] || null;
    case 'x':       return (meta.x || [])[0] || null;
    case 'in':      return (meta.linkedin || [])[0] || null;
    case 'M':       return (meta.medium || [])[0] || null;
    case 'DOC':     return (meta.doc || [])[0] || null;
    case 'DRIVE':   return (meta.drive || [])[0] || null;
    case 'NOTION':  return (meta.notion || [])[0] || null;
    case 'FIGMA':   return (meta.figma || [])[0] || null;
    case 'VIDEO':   return (meta.videos && meta.videos[0] && meta.videos[0].url) || null;
    case 'EXPLORER':return (meta.catalyst && meta.catalyst[0]) || (meta.explorer && meta.explorer[0]) || null;
    default:        return null;
  }
}

// Domain of a URL, with leading "www." stripped, e.g. "anifie.com"
function urlDomain(u) {
  if (!u) return '';
  try {
    const h = new URL(u).hostname;
    return h.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

// Build a deduplicated team list from PMETA.team and the proposal's primary proposer.
// Each entry: { name, role, hue, hero }
function buildTeam(meta, primary) {
  const seen = new Set();
  const list = [];
  if (primary) {
    seen.add(primary.toLowerCase());
    list.push({ name: primary, role: 'proposer', hue: nameHue(primary), hero: null });
  }
  if (meta && Array.isArray(meta.team)) {
    meta.team.forEach(t => {
      const key = (t.name || '').toLowerCase();
      if (!key || seen.has(key)) return;
      seen.add(key);
      list.push({
        name: t.name,
        role: t.username ? '@' + t.username : 'team',
        hue: nameHue(t.name),
        hero: t.hero_img_url || null,
        linkedin: t.linkedin || null,
        twitter: t.twitter || null,
      });
    });
  }
  return list;
}

// Short plain-text excerpt of the problem statement from PDESC[id].p, HTML-stripped
function buildExcerpt(id) {
  const PDESC = window.PDESC || {};
  const pd = PDESC[id];
  if (!pd || !pd.p) return '';
  const txt = (pd.p || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!txt) return '';
  if (txt.length <= 110) return txt;
  return txt.slice(0, 108) + '…';
}

// Distinguish "report"-style PDF / Drive links — completion reports often live there
function buildReportLinks(meta) {
  if (!meta) return [];
  const out = [];
  if (meta.pdf) meta.pdf.forEach(u => out.push({ url: u, kind: 'PDF' }));
  if (meta.drive) meta.drive.forEach(u => out.push({ url: u, kind: 'DRIVE' }));
  if (meta.slides) meta.slides.forEach(u => out.push({ url: u, kind: 'SLIDES' }));
  return out;
}

// ---------- Build PROPOSALS array from real data ----------
function buildProposals() {
  const D = window.CJ_DATA;
  const PMETA = window.PMETA || {};
  if (!D) return [];
  const out = [];
  D.INDUSTRIES.forEach(ind => {
    ind.children.forEach(p => {
      const sectorPrefix = (p.id || '').split('-')[0];
      const cat = SECTOR_TO_CAT[sectorPrefix] || 'COMMUNITY';
      const adaK = p.u === 'ada' ? p.amt : p.amt / (p.adaPrice || 0.5);
      const meta = PMETA[p.id] || null;
      const hue = nameHue((p.by || p.id || '') + sectorPrefix);
      const team = buildTeam(meta, p.by || '');
      const excerpt = buildExcerpt(p.id);
      const reports = buildReportLinks(meta);
      const _unlistedSet = (window.UNLISTED_VIDEOS || []);
      const _skipSet     = (window.SKIP_VIDEOS || []);
      const _embedDisSet = (window.EMBED_DISABLED_VIDEOS || []);
      const _isUnlisted  = _unlistedSet.indexOf(p.id) !== -1;
      const _isSkipped   = _skipSet.indexOf(p.id) !== -1;
      const _isEmbedDis  = _embedDisSet.indexOf(p.id) !== -1;
      /* SKIP_VIDEOS: treat the proposal as if it has no linked video at all
         (thumbnail/play badge/click handler are all suppressed). Other media still counts. */
      const _hasVideo    = !!(meta && meta.videos && meta.videos.length) && !_isSkipped;
      out.push({
        id: p.id,
        f: 'F' + (p.fund || '?'),
        s: stToJa(p.st),
        cat,
        title: p.labelJa || p.label || '',
        title_en: p.label || '',
        proposer: p.by || '—',
        initials: makeInitials(p.by || sectorPrefix),
        amount: formatAdaK(adaK),
        /* Reference to the raw INDUSTRIES proposal — keeps .amt/.u/.adaPrice live so the
           catalog's amount component can reformat in JPY/USD/ADA and pick up host's
           price-mode mutations (recalcAll() updates adaPrice on the same object). */
        _raw: p,
        media: !!(meta && (_hasVideo || meta.slides && meta.slides.length || meta.pdf && meta.pdf.length || meta.site)),
        hasVideo: _hasVideo,
        /* Unlisted videos: keep the URL but skip the thumbnail so we can show a notice instead */
        unlistedVideo: _isUnlisted && !_isSkipped,
        /* Embed-disabled videos: keep URL, skip thumbnail, always open in new tab */
        embedDisabledVideo: _isEmbedDis && !_isSkipped,
        videoThumb: (_isSkipped || _isUnlisted || _isEmbedDis) ? null : (meta && meta.videos && meta.videos[0] ? meta.videos[0].thumb : null),
        videoUrl: _isSkipped ? null : (meta && meta.videos && meta.videos[0] ? meta.videos[0].url : null),
        site: meta && meta.site ? meta.site : null,
        siteDomain: urlDomain(meta && meta.site),
        team,
        excerpt,
        reports,
        report: reports[0] || null,
        explorer: meta && ((meta.catalyst && meta.catalyst[0]) || (meta.explorer && meta.explorer[0])) || null,
        links: buildLinkCounts(meta),
        meta,
        hue,
      });
    });
  });
  return out;
}

const PROPOSALS = buildProposals();

// Thumb pool — every unique YouTube thumbnail from proposals that actually have video.
// Used to "borrow" a muted/grayscale image for cards that have no video, so the
// no-video state has visual texture instead of a flat gradient.
const THUMB_POOL = (function () {
  const seen = new Set();
  const out = [];
  PROPOSALS.forEach(p => {
    if (p.videoThumb && !p.unlistedVideo && !seen.has(p.videoThumb)) {
      seen.add(p.videoThumb);
      out.push(p.videoThumb);
    }
  });
  return out;
})();

// Deterministic picker — same id always returns the same borrowed thumb,
// so the layout doesn't shuffle between renders.
function pickBorrowedThumb(id) {
  if (!THUMB_POOL.length) return null;
  let h = 0;
  const s = String(id || '');
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return THUMB_POOL[Math.abs(h) % THUMB_POOL.length];
}

// Aggregate fund counts from REAL data (used by sidebar Fund nav)
const _fundCounts = {};
PROPOSALS.forEach(p => { _fundCounts[p.f] = (_fundCounts[p.f] || 0) + 1; });
const FUND_ORDER = ['F14','F13','F12','F11','F10','F9','F8','F7','F6','F5','F4','F3','F2'];
const FUND_COUNTS = FUND_ORDER.reduce((acc, f) => { acc[f] = _fundCounts[f] || 0; return acc; }, {});

// Sidebar masthead totals
const TOTAL_COUNT = PROPOSALS.length;
const TOTAL_ADA_K = (function () {
  let s = 0;
  PROPOSALS.forEach(p => {
    // re-derive ADA-K from raw to keep precision (avoid double rounding)
    // but we don't have raw p here; use the source again
  });
  if (window.CJ_DATA) return window.CJ_DATA.totalAdaK || 0;
  return 0;
})();
const TOTAL_ADA_DISPLAY = (function () {
  const m = TOTAL_ADA_K / 1000;
  if (m >= 10) return m.toFixed(1).replace(/\.0$/, '') + 'M';
  return m.toFixed(2) + 'M';
})();

// ---------- Atomic components (verbatim from handoff except where noted) ----------

function StatusDot({ status, size = 6 }) {
  const color = status === '完了' ? TOKENS.done
              : status === '進行中' ? TOKENS.active
              : status === 'DNF' ? TOKENS.stop
              : TOKENS.inkMuted;
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size, borderRadius: '50%',
      background: color,
      boxShadow: `0 0 0 3px ${color}22`,
      flex: '0 0 auto',
    }} />
  );
}

function StatusChip({ status }) {
  const color = status === '完了' ? TOKENS.done
              : status === '進行中' ? TOKENS.active
              : status === 'DNF' ? TOKENS.stop
              : TOKENS.inkMuted;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      fontFamily: TOKENS.sans, fontSize: 10, letterSpacing: '0.12em',
      textTransform: 'uppercase', color,
      padding: '3px 8px 3px 7px',
      border: `1px solid ${color}33`,
      background: `${color}10`,
      borderRadius: 999,
    }}>
      <StatusDot status={status} size={5} />
      {status}
    </span>
  );
}

function FundChip({ fund, variant = 'solid' }) {
  if (variant === 'ghost') {
    return (
      <span style={{
        fontFamily: TOKENS.mono, fontSize: 10, letterSpacing: '0.08em',
        color: TOKENS.inkDim,
        padding: '3px 7px',
        border: `1px solid ${TOKENS.hairlineStrong}`,
        borderRadius: 4,
      }}>{fund}</span>
    );
  }
  return (
    <span style={{
      fontFamily: TOKENS.mono, fontSize: 10.5, letterSpacing: '0.06em',
      color: TOKENS.ink,
      padding: '3px 7px',
      background: 'rgba(255,245,225,0.08)',
      border: `1px solid ${TOKENS.hairlineStrong}`,
      borderRadius: 4,
    }}>{fund}</span>
  );
}

function CategoryEyebrow({ cat, size = 10 }) {
  const color = TOKENS.cat[cat] || TOKENS.inkDim;
  return (
    <span style={{
      fontFamily: TOKENS.sans, fontSize: size,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color, fontWeight: 500,
      display: 'inline-flex', alignItems: 'center', gap: 6,
    }}>
      <span style={{ width: 14, height: 1, background: color, opacity: 0.6 }} />
      {cat}
    </span>
  );
}

function Avatar({ initials, hue = 220, size = 18, hero, title }) {
  const baseStyle = {
    width: size, height: size, borderRadius: '50%',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: TOKENS.sans, fontSize: size * 0.42, fontWeight: 600,
    color: '#0a0a0c',
    background: `oklch(78% 0.12 ${hue})`,
    flex: '0 0 auto',
    overflow: 'hidden',
  };
  if (hero) {
    return (
      <span title={title} style={baseStyle}>
        <img
          src={hero}
          alt=""
          onError={e => { e.currentTarget.style.display = 'none'; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </span>
    );
  }
  return (
    <span title={title} style={baseStyle}>{(initials || '').slice(0, 2)}</span>
  );
}

// Stack of small overlapping avatars (proposer + team) — compact "related people" indicator
function AvatarStack({ people, size = 20, max = 5 }) {
  if (!people || !people.length) return null;
  const shown = people.slice(0, max);
  const overflow = people.length - shown.length;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      {shown.map((t, i) => (
        <span key={t.name + i} style={{
          marginLeft: i === 0 ? 0 : -size * 0.35,
          border: `1.5px solid ${TOKENS.panel}`,
          borderRadius: '50%',
          display: 'inline-flex',
        }}>
          <Avatar initials={makeInitials(t.name)} hue={t.hue} size={size} hero={t.hero} title={t.name} />
        </span>
      ))}
      {overflow > 0 && (
        <span style={{
          marginLeft: -size * 0.35,
          width: size, height: size, borderRadius: '50%',
          border: `1.5px solid ${TOKENS.panel}`,
          background: TOKENS.panelHi,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: TOKENS.mono, fontSize: size * 0.38, color: TOKENS.inkDim,
        }} title={people.slice(max).map(t => t.name).join(', ')}>+{overflow}</span>
      )}
    </span>
  );
}

// External link button — small pill with a leading hairline and label.
// Used for SITE / REPORT call-outs that deserve more attention than a plain link chip.
function PrimaryLinkPill({ href, label, mono, title, color }) {
  const c = color || TOKENS.inkDim;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={title || label}
      onClick={e => e.stopPropagation()}
      onMouseEnter={e => { e.currentTarget.style.color = TOKENS.ink; e.currentTarget.style.borderColor = TOKENS.hairlineStrong; }}
      onMouseLeave={e => { e.currentTarget.style.color = c; e.currentTarget.style.borderColor = TOKENS.hairline; }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: mono ? TOKENS.mono : TOKENS.sans, fontSize: 10.5,
        letterSpacing: '0.04em',
        color: c,
        padding: '4px 8px',
        border: `1px solid ${TOKENS.hairline}`,
        borderRadius: 4,
        background: 'rgba(255,245,225,0.025)',
        textDecoration: 'none',
        maxWidth: '100%',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}
    >{label}</a>
  );
}

function LinkChip({ kind, count, href, title }) {
  const label = count && count > 1 ? `${kind} ×${count}` : kind;
  const style = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    fontFamily: TOKENS.mono, fontSize: 9.5, letterSpacing: '0.04em',
    color: TOKENS.inkDim,
    padding: '2px 6px',
    border: `1px solid ${TOKENS.hairline}`,
    borderRadius: 3,
    background: 'rgba(255,245,225,0.02)',
    textDecoration: 'none',
    cursor: href ? 'pointer' : 'default',
  };
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title || kind}
        onClick={e => e.stopPropagation()}
        onMouseEnter={e => { e.currentTarget.style.color = TOKENS.ink; e.currentTarget.style.borderColor = TOKENS.hairlineStrong; }}
        onMouseLeave={e => { e.currentTarget.style.color = TOKENS.inkDim; e.currentTarget.style.borderColor = TOKENS.hairline; }}
        style={style}
      >{label}</a>
    );
  }
  return <span style={style}>{label}</span>;
}

function AdaAmount({ amount, size = 14, align = 'right' }) {
  return (
    <span style={{
      fontFamily: TOKENS.mono, fontSize: size,
      color: TOKENS.ink, letterSpacing: '-0.01em',
      display: 'inline-flex', alignItems: 'baseline', gap: 3,
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
    }}>
      <span style={{ color: TOKENS.inkDim, fontSize: size * 0.78 }}>₳</span>
      {amount}
    </span>
  );
}

// Thumbnail: real YouTube thumbnail if available; else colored gradient placeholder.
// When `videoUrl` is provided, the whole tile becomes a clickable link that opens
// the video in a modal (in-page YouTube embed) — falls back to opening in a new
// tab when modal cannot be opened (no JS available, etc.).
function Thumb({ hue = 220, hasMedia = true, ratio = '16 / 9', label, thumbUrl, videoUrl }) {
  if (!hasMedia) {
    return (
      <div style={{
        aspectRatio: ratio,
        background: TOKENS.panelHi,
        border: `1px solid ${TOKENS.hairline}`,
        borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: TOKENS.sans, fontSize: 10, letterSpacing: '0.22em',
        color: TOKENS.inkFaint, textTransform: 'uppercase',
      }}>
        {label || 'NO MEDIA'}
      </div>
    );
  }

  const Tag = videoUrl ? 'a' : 'div';
  const interactiveProps = videoUrl ? {
    href: videoUrl,
    target: '_blank',
    rel: 'noopener noreferrer',
    onClick: e => {
      e.stopPropagation();
      const vid = extractYouTubeId(videoUrl);
      if (vid) { e.preventDefault(); openVideoModal(vid, videoUrl); }
    },
    'aria-label': '動画を再生',
  } : {};

  return (
    <Tag {...interactiveProps} style={{
      aspectRatio: ratio,
      borderRadius: 6,
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${TOKENS.hairline}`,
      cursor: videoUrl ? 'pointer' : 'default',
      display: 'block',
      textDecoration: 'none',
      background: `
        radial-gradient(140% 90% at 20% 15%, oklch(58% 0.16 ${hue}) 0%, transparent 55%),
        radial-gradient(120% 100% at 85% 90%, oklch(45% 0.12 ${(hue+60)%360}) 0%, transparent 60%),
        linear-gradient(135deg, oklch(28% 0.08 ${hue}) 0%, oklch(18% 0.05 ${(hue+30)%360}) 100%)
      `,
    }}>
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
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '3px 3px',
        opacity: thumbUrl ? 0.18 : 0.4,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 40, height: 40, borderRadius: '50%',
        background: 'rgba(10,10,12,0.6)',
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,245,225,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 1.5L10 6L3 10.5V1.5Z" fill={TOKENS.ink} />
        </svg>
      </div>
    </Tag>
  );
}

// Extract YouTube video id from any common YT URL form
function extractYouTubeId(url) {
  if (!url) return null;
  let m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1].split(/[?&]/)[0];
  m = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];
  m = url.match(/youtube\.com\/(?:embed|shorts)\/([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1].split(/[?&]/)[0];
  return null;
}

// In-page YouTube modal (vanilla DOM — works regardless of React reconciliation)
function openVideoModal(videoId, fallbackUrl) {
  // Remove any existing modal
  const existing = document.getElementById('cat-video-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'cat-video-modal';
  overlay.style.cssText = [
    'position:fixed','inset:0','z-index:1000',
    'background:rgba(0,0,0,0.85)','backdrop-filter:blur(8px)',
    '-webkit-backdrop-filter:blur(8px)',
    'display:flex','align-items:center','justify-content:center',
    'padding:24px','cursor:pointer',
  ].join(';');

  const frame = document.createElement('div');
  frame.style.cssText = [
    'position:relative','width:min(960px, 92vw)','aspect-ratio:16/9',
    'background:#000','border-radius:10px','overflow:hidden',
    'border:1px solid rgba(255,245,225,0.14)',
    'box-shadow:0 30px 80px rgba(0,0,0,0.5)',
    'cursor:default',
  ].join(';');

  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', '閉じる');
  closeBtn.style.cssText = [
    'position:absolute','top:-12px','right:-12px','z-index:2',
    'width:34px','height:34px','border-radius:50%',
    'background:#111114','color:#ece6d8',
    'border:1px solid rgba(255,245,225,0.18)',
    'font-family:"Geist Mono", ui-monospace, monospace','font-size:18px','line-height:1',
    'cursor:pointer','padding:0','display:flex','align-items:center','justify-content:center',
  ].join(';');

  const openExt = document.createElement('a');
  openExt.href = fallbackUrl || ('https://www.youtube.com/watch?v=' + videoId);
  openExt.target = '_blank';
  openExt.rel = 'noopener noreferrer';
  openExt.textContent = 'YouTube で開く ↗';
  openExt.style.cssText = [
    'position:absolute','bottom:-30px','right:0',
    'font-family:"Geist", "Noto Sans JP", sans-serif',
    'font-size:11px','letter-spacing:0.04em',
    'color:rgba(255,245,225,0.55)','text-decoration:none',
  ].join(';');

  function close() {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', onKey);

  frame.appendChild(iframe);
  frame.appendChild(closeBtn);
  frame.appendChild(openExt);
  overlay.appendChild(frame);
  document.body.appendChild(overlay);
}

function RainbowFlow({ width = 800, height = 200, count = 60, origin = { x: 60, y: 100 } }) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const hue = 350 + t * 280;
    const endY = 20 + t * (height - 40);
    const endX = width;
    const cp1x = origin.x + (endX - origin.x) * 0.35;
    const cp1y = origin.y;
    const cp2x = origin.x + (endX - origin.x) * 0.65;
    const cp2y = endY;
    lines.push(
      <path
        key={i}
        d={`M${origin.x},${origin.y} C${cp1x},${cp1y} ${cp2x},${cp2y} ${endX},${endY}`}
        stroke={`oklch(72% 0.16 ${hue % 360})`}
        strokeWidth={0.7}
        fill="none"
        opacity={0.55}
      />
    );
  }
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {lines}
    </svg>
  );
}

function MastheadLockup({ scale = 1 }) {
  return (
    <div style={{
      fontFamily: TOKENS.serif,
      fontSize: 38 * scale,
      lineHeight: 1.05,
      color: TOKENS.ink,
      letterSpacing: '-0.015em',
      display: 'flex', alignItems: 'baseline', gap: 14 * scale,
    }}>
      <span style={{ fontWeight: 500 }}>Catalyst</span>
      <span style={{ fontStyle: 'italic', fontWeight: 400, color: TOKENS.inkDim }}>日本</span>
      <span style={{ fontWeight: 400 }}>Catalog</span>
    </div>
  );
}

function FilterRow({ label, options, active }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        fontFamily: TOKENS.sans, fontSize: 9.5, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: TOKENS.inkMuted,
        minWidth: 52,
      }}>{label}</span>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {options.map(opt => {
          const isActive = opt === active;
          return (
            <span key={opt} style={{
              fontFamily: TOKENS.sans, fontSize: 11.5,
              color: isActive ? TOKENS.bg : TOKENS.inkDim,
              background: isActive ? TOKENS.ink : 'transparent',
              padding: '4px 10px',
              borderRadius: 3,
              border: `1px solid ${isActive ? TOKENS.ink : TOKENS.hairline}`,
              fontWeight: isActive ? 600 : 400,
              letterSpacing: opt.length <= 3 ? '0.04em' : 0,
            }}>{opt}</span>
          );
        })}
      </div>
    </div>
  );
}

function Hairline({ marker, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      width: '100%',
    }}>
      {marker && (
        <span style={{
          fontFamily: TOKENS.mono, fontSize: 10,
          color: color || TOKENS.inkMuted,
          letterSpacing: '0.1em',
        }}>{marker}</span>
      )}
      <div style={{ flex: 1, height: 1, background: TOKENS.hairline }} />
    </div>
  );
}

Object.assign(window, {
  TOKENS, PROPOSALS, FUND_ORDER, FUND_COUNTS,
  TOTAL_COUNT, TOTAL_ADA_DISPLAY,
  THUMB_POOL, pickBorrowedThumb,
  resolveLinkUrl, makeInitials, nameHue, urlDomain,
  extractYouTubeId, openVideoModal,
  StatusDot, StatusChip, FundChip, CategoryEyebrow,
  Avatar, AvatarStack, PrimaryLinkPill,
  LinkChip, AdaAmount, Thumb, RainbowFlow,
  MastheadLockup, FilterRow, Hairline,
});
