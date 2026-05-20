/* ============================================================
   Catalyst Japan Catalog — Mobile (DEV)
   ------------------------------------------------------------
   Standalone mobile entry point: catalog-mobile.html.
   Reuses src/catalog-data.jsx (PROPOSALS / FUND_ORDER / FUND_COUNTS / TOTAL_COUNT).
   Intentionally small (~500 lines) — the desktop's src/refined-catalog.jsx
   stays untouched; this is a separate, simpler surface tuned for phones.
   DEV badge in the header makes it clear this is in-progress.
   ============================================================ */

const { useState: useStateM, useMemo: useMemoM, useRef: useRefM, useEffect: useEffectM } = React;

// ---------- Tokens ----------
const M = {
  bg:        '#000000',
  panel:     '#0f0f12',
  elevated:  '#17171c',
  hairline:  'rgba(255,255,255,0.08)',
  hairlineStrong: 'rgba(255,255,255,0.16)',
  ink:       '#ffffff',
  inkDim:    '#a1a1a6',
  inkMuted:  '#6e6e72',
  accent:    '#d4a04a',
  blue:      '#0a84ff',
  purple:    '#bf5af2',
  green:     '#30d158',
  amber:     '#ffd60a',
  red:       '#ff453a',
  pink:      '#ff375f',
  cat: {
    'COMMUNITY':  '#30d158',
    'IDENTITY':   '#bf5af2',
    'REAL WORLD': '#0a84ff',
    'EMERGING':   '#ffd60a',
    'DEV TECH':   '#ff375f',
  },
  display: '"Geist","Noto Sans JP",-apple-system,system-ui,sans-serif',
  body:    '"Geist","Noto Sans JP",-apple-system,system-ui,sans-serif',
  mono:    '"Geist Mono",ui-monospace,monospace',
  serif:   '"Instrument Serif","Noto Serif JP",serif',
};

// ---------- Status pill ----------
function StatusPill({ status }) {
  const colors = {
    '完了':  { bg: 'rgba(48,209,88,0.18)',  bd: 'rgba(48,209,88,0.45)',  fg: '#67e189' },
    '進行中': { bg: 'rgba(255,214,10,0.18)', bd: 'rgba(255,214,10,0.45)', fg: '#ffe14f' },
    'DNF':    { bg: 'rgba(255,69,58,0.18)',  bd: 'rgba(255,69,58,0.45)',  fg: '#ff6b62' },
  };
  const c = colors[status] || colors['進行中'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px',
      background: c.bg, border: `1px solid ${c.bd}`,
      borderRadius: 999,
      fontFamily: M.body, fontSize: 10, fontWeight: 600,
      color: c.fg,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.fg }} />
      {status}
    </span>
  );
}

// ---------- Fund chip ----------
function FundChip({ fund }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 7px',
      background: M.elevated, border: `1px solid ${M.hairline}`,
      borderRadius: 999,
      fontFamily: M.mono, fontSize: 10, fontWeight: 600,
      color: M.inkDim, letterSpacing: '0.02em',
    }}>{fund}</span>
  );
}

// ---------- Header ----------
function Header({ devBadge = true, heroHidden = false, onReshowHero }) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      padding: 'calc(env(safe-area-inset-top,0px) + 14px) 16px 12px',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.92), rgba(0,0,0,0.78))',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${M.hairline}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, minWidth: 0 }}>
        <span style={{ fontFamily: M.body, fontSize: 17, fontWeight: 700, color: M.ink, letterSpacing: '-0.01em' }}>Catalyst</span>
        <span style={{ fontFamily: M.serif, fontStyle: 'italic', fontSize: 17, color: M.accent }}>日本</span>
        {devBadge && (
          <span style={{
            display: 'inline-block',
            marginLeft: 6,
            padding: '2px 7px',
            background: 'linear-gradient(135deg,#4d9fff,#b366ff)',
            color: '#fff',
            borderRadius: 5,
            fontFamily: M.mono, fontSize: 9, fontWeight: 700,
            letterSpacing: '0.12em',
            verticalAlign: 'middle',
          }}>MOBILE DEV</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {/* Re-show hint button — appears once the rotating hero has been dismissed.
            Lets the user pull the tips back without having to clear sessionStorage. */}
        {heroHidden && onReshowHero && (
          <button onClick={onReshowHero} title="ヒントを再表示" style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)', border: `1px solid ${M.hairline}`,
            color: M.inkDim,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M7 4v3M7 9.5v.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>
        )}
        <span style={{
          fontFamily: M.mono, fontSize: 10, color: M.inkMuted, letterSpacing: '0.06em',
        }}>{(window.TOTAL_COUNT || 0)} {' '}件</span>
      </div>
    </header>
  );
}

// ---------- Search + chips ----------
function SearchAndFilters({
  query, setQuery,
  statusFilter, setStatusFilter,
  fundFilter, setFundFilter,
  catFilter, setCatFilter,
  cats,
}) {
  const fundOrder = (window.FUND_ORDER || []).filter(f => (window.FUND_COUNTS || {})[f] > 0);
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 9,
      padding: '8px 0 6px',
      background: M.bg,
    }}>
      {/* Search */}
      <div style={{ padding: '0 16px 8px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 14px',
          background: M.panel, border: `1px solid ${M.hairline}`,
          borderRadius: 12,
        }}>
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="5" cy="5" r="3.5" stroke={M.inkMuted} strokeWidth="1" />
            <path d="M7.6 7.6L10 10" stroke={M.inkMuted} strokeWidth="1" strokeLinecap="round" />
          </svg>
          <input
            value={query || ''}
            onChange={e => setQuery(e.target.value)}
            placeholder="提案を検索..."
            style={{
              flex: 1, minWidth: 0,
              border: 'none', background: 'transparent', outline: 'none',
              color: M.ink, fontFamily: M.body, fontSize: 14,
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              padding: 4, color: M.inkMuted, lineHeight: 0,
            }} aria-label="Clear">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Status chips */}
      <div className="hscroll" style={{ display: 'flex', gap: 6, padding: '0 16px 6px' }}>
        {['すべて', '進行中', '完了', 'DNF'].map(opt => {
          const active = statusFilter === opt;
          return (
            <Chip key={opt} active={active} onClick={() => setStatusFilter(opt)}>{opt}</Chip>
          );
        })}
      </div>

      {/* Fund chips */}
      <div className="hscroll" style={{ display: 'flex', gap: 6, padding: '0 16px 6px' }}>
        <Chip active={fundFilter === 'ALL'} onClick={() => setFundFilter('ALL')}>ALL</Chip>
        {fundOrder.map(f => (
          <Chip key={f} active={fundFilter === f} onClick={() => setFundFilter(f)} mono>
            {f}
          </Chip>
        ))}
      </div>

      {/* Category chips */}
      <div className="hscroll" style={{ display: 'flex', gap: 6, padding: '0 16px' }}>
        <Chip active={catFilter === 'ALL'} onClick={() => setCatFilter('ALL')}>カテゴリ ALL</Chip>
        {cats.map(c => (
          <Chip key={c.name} active={catFilter === c.name} onClick={() => setCatFilter(c.name)}
                accent={M.cat[c.name] || M.accent}>
            {c.name}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children, mono, accent }) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0,
      padding: '6px 12px',
      background: active ? (accent || M.ink) : 'transparent',
      color: active ? (accent ? '#fff' : '#0a0a0c') : M.inkDim,
      border: `1px solid ${active ? (accent || M.ink) : M.hairlineStrong}`,
      borderRadius: 999,
      fontFamily: mono ? M.mono : M.body,
      fontSize: mono ? 11 : 12,
      fontWeight: active ? 700 : 500,
      letterSpacing: mono ? '0.04em' : '0.005em',
      whiteSpace: 'nowrap',
      transition: 'background .15s, color .15s, border-color .15s',
    }}>{children}</button>
  );
}

// ---------- Card ----------
function ProposalCard({ p, onOpen }) {
  return (
    <button
      onClick={() => onOpen(p)}
      style={{
        display: 'block', textAlign: 'left',
        width: '100%',
        marginBottom: 10,
        padding: 0,
        background: M.panel, border: `1px solid ${M.hairline}`,
        borderRadius: 14, overflow: 'hidden',
      }}>
      {/* Media area — thumbnail w/ gradient overlay + status + fund */}
      <div style={{
        position: 'relative', width: '100%', aspectRatio: '16 / 9',
        background: M.elevated, overflow: 'hidden',
      }}>
        {p.videoThumb && !p.unlistedVideo && !p.embedDisabledVideo ? (
          <img src={p.videoThumb} alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(120% 100% at 30% 20%, oklch(40% 0.16 ${p.hue || 200}) 0%, transparent 60%), linear-gradient(135deg, oklch(20% 0.10 ${p.hue || 200}) 0%, oklch(10% 0.06 ${(p.hue || 200) + 40}) 100%)`,
          }} />
        )}
        {/* Overlays — status, fund, no-video badges, etc. */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)' }} />
        <div style={{ position: 'absolute', top: 9, left: 9, display: 'inline-flex', gap: 5 }}>
          <StatusPill status={p.s} />
          <FundChip fund={p.f} />
        </div>
        {/* Video / unlisted / embed-disabled badge */}
        {p.videoUrl && (p.unlistedVideo || p.embedDisabledVideo) && (
          <div style={{
            position: 'absolute', top: 9, right: 9,
            padding: '2px 7px',
            background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999,
            fontFamily: M.body, fontSize: 8.5, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: '#fff',
          }}>{p.unlistedVideo ? '限定公開' : '埋込無効'}</div>
        )}
        {!p.videoUrl && !p.unlistedVideo && !p.embedDisabledVideo && (
          <div style={{
            position: 'absolute', top: 9, right: 9,
            padding: '2px 7px',
            background: 'rgba(0,0,0,0.45)',
            borderRadius: 999,
            fontFamily: M.body, fontSize: 8.5, fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.65)',
          }}>動画なし</div>
        )}
        {/* Play badge */}
        {p.videoUrl && !p.unlistedVideo && !p.embedDisabledVideo && (
          <div style={{
            position: 'absolute', bottom: 9, right: 9,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(0,0,0,0.65)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            <svg width="11" height="11" viewBox="0 0 8 8" fill="#fff"><path d="M2 1l5 3-5 3V1Z"/></svg>
          </div>
        )}
        {/* Amount lower-left */}
        <div style={{
          position: 'absolute', bottom: 9, left: 9,
          padding: '3px 8px',
          background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.16)',
          borderRadius: 6,
          fontFamily: M.mono, fontSize: 11, fontWeight: 600,
          color: '#fff',
          display: 'inline-flex', alignItems: 'baseline', gap: 3,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9 }}>₳</span>{p.amount}
        </div>
      </div>

      {/* Text area */}
      <div style={{ padding: '11px 14px 13px' }}>
        <div style={{
          fontFamily: M.body, fontSize: 9.5, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: M.cat[p.cat] || M.inkMuted,
          marginBottom: 5,
        }}>{p.cat}</div>
        <div style={{
          fontFamily: M.display, fontSize: 15, fontWeight: 700,
          color: M.ink, letterSpacing: '-0.015em', lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', marginBottom: 6,
        }}>{p.title}</div>
        <div style={{
          fontFamily: M.body, fontSize: 12, color: M.inkDim,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{p.proposer}</div>
      </div>
    </button>
  );
}

// ---------- Bottom-sheet detail ----------
function ProposalDetail({ p, onClose }) {
  useEffectM(() => {
    if (!p) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [p]);
  if (!p) return null;
  const playVideo = () => {
    if (!p.videoUrl) return;
    if (p.unlistedVideo || p.embedDisabledVideo) { window.open(p.videoUrl, '_blank', 'noopener'); return; }
    const vid = window.extractYouTubeId && window.extractYouTubeId(p.videoUrl);
    if (vid && window.openVideoModal) { window.openVideoModal(vid, p.videoUrl); return; }
    window.open(p.videoUrl, '_blank', 'noopener');
  };
  /* Build link items — favicons via Google's service, same pattern as desktop */
  const fav = (domain) => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  /* Order: IS → MS → CV → Video → Site → GH → X → LinkedIn → CE → PC */
  const linkItems = [];
  if (p.isLink)       linkItems.push({ k: 'IS',   label: 'IdeaScale', url: p.isLink, icon: fav('ideascale.com') });
  if (p.ms)           linkItems.push({ k: 'MS',   label: 'Milestones', url: p.ms, icon: fav('milestones.projectcatalyst.io') });
  if (p.cv)           linkItems.push({ k: 'CV',   label: '完了動画', url: p.cv, icon: fav('youtube.com') });
  if (p.videoUrl)     linkItems.push({ k: 'VIDEO', label: 'YouTube',   url: p.videoUrl, icon: fav('youtube.com'), onClick: playVideo });
  if (p.site)         linkItems.push({ k: 'SITE',  label: p.siteDomain || 'Site', url: p.site, icon: fav((window.urlDomain && window.urlDomain(p.site)) || p.siteDomain || 'example.com') });
  if (p.links && p.links.GH) linkItems.push({ k: 'GH', label: 'GitHub',   count: p.links.GH, url: window.resolveLinkUrl ? window.resolveLinkUrl(p.meta, 'GH') : null, icon: fav('github.com') });
  if (p.links && p.links.x)  linkItems.push({ k: 'X',  label: 'X',        count: p.links.x,  url: window.resolveLinkUrl ? window.resolveLinkUrl(p.meta, 'x') : null,  icon: fav('x.com') });
  if (p.links && p.links.in) linkItems.push({ k: 'in', label: 'LinkedIn', count: p.links.in, url: window.resolveLinkUrl ? window.resolveLinkUrl(p.meta, 'in') : null, icon: fav('linkedin.com') });
  if (p.ce || p.explorer) linkItems.push({ k: 'CE', label: 'Explorer', url: p.ce || p.explorer, icon: fav('catalystexplorer.com') });
  if (p.pc)           linkItems.push({ k: 'PC',   label: 'ProjectCatalyst', url: p.pc, icon: fav('projectcatalyst.io') });
  /* Bottom badge: completion report */
  const reportUrl = p.cr || (p.report && p.report.url) || null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        animation: 'cm-fade .2s ease',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
      <style>{`
        @keyframes cm-fade { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes cm-slide { 0% { transform: translateY(100%); } 100% { transform: translateY(0); } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: M.panel,
          borderRadius: '18px 18px 0 0',
          maxHeight: '92dvh',
          display: 'flex', flexDirection: 'column',
          animation: 'cm-slide .28s cubic-bezier(.2,.7,.3,1)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.22)' }} />
        </div>
        {/* Close in top-right */}
        <button onClick={onClose} aria-label="Close" style={{
          position: 'absolute', top: 16, right: 14,
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(255,255,255,0.10)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: M.ink,
        }}>
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', padding: '10px 16px 24px' }}>
          {/* Hero thumbnail (tap to play if video) */}
          <button
            onClick={playVideo}
            disabled={!p.videoUrl}
            style={{
              position: 'relative', display: 'block', textAlign: 'left',
              width: '100%', aspectRatio: '16 / 9',
              borderRadius: 12, overflow: 'hidden',
              background: M.elevated,
              padding: 0,
              border: `1px solid ${M.hairlineStrong}`,
              cursor: p.videoUrl ? 'pointer' : 'default',
            }}>
            {p.videoThumb && !p.unlistedVideo && !p.embedDisabledVideo ? (
              <img src={p.videoThumb} alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0,
                background: `radial-gradient(120% 100% at 30% 20%, oklch(40% 0.16 ${p.hue || 200}) 0%, transparent 60%), linear-gradient(135deg, oklch(20% 0.10 ${p.hue || 200}) 0%, oklch(10% 0.06 ${(p.hue || 200) + 40}) 100%)` }} />
            )}
            {p.videoUrl && !p.unlistedVideo && !p.embedDisabledVideo && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.6)', border: '2px solid #fff',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="20" height="20" viewBox="0 0 8 8" fill="#fff"><path d="M2 1l5 3-5 3V1Z"/></svg>
                </div>
              </div>
            )}
            {(p.unlistedVideo || p.embedDisabledVideo) && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.78)',
                fontFamily: M.body, fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: '#fff',
              }}>{p.unlistedVideo ? '限定公開 · リンクで開く' : '埋込無効 · YouTubeで開く'}</div>
            )}
          </button>

          {/* Title block */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 14, marginBottom: 6,
          }}>
            <StatusPill status={p.s} />
            <FundChip fund={p.f} />
            <span style={{
              fontFamily: M.body, fontSize: 9.5, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: M.cat[p.cat] || M.inkMuted, marginLeft: 4,
            }}>{p.cat}</span>
          </div>
          <h2 style={{
            margin: '0 0 6px',
            fontFamily: M.display, fontSize: 22, fontWeight: 700,
            color: M.ink, letterSpacing: '-0.02em', lineHeight: 1.25,
          }}>{p.title}</h2>
          <div style={{
            fontFamily: M.body, fontSize: 13, color: M.inkDim,
            marginBottom: 14,
          }}>{p.proposer}</div>

          {/* Amount + completion report row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px',
            background: M.elevated, border: `1px solid ${M.hairline}`,
            borderRadius: 10,
            marginBottom: 14,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: M.mono, fontSize: 8.5, fontWeight: 700,
                letterSpacing: '0.18em', textTransform: 'uppercase',
                color: M.inkMuted, marginBottom: 3,
              }}>採択額</div>
              <div style={{
                fontFamily: M.mono, fontSize: 18, fontWeight: 600,
                color: M.ink, display: 'inline-flex', alignItems: 'baseline', gap: 4,
              }}>
                <span style={{ color: M.inkDim, fontSize: 13 }}>₳</span>{p.amount}
              </div>
            </div>
            {(p.cr || p.report) && p.s === '完了' && (
              <a href={p.cr || (p.report && p.report.url)} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '7px 12px',
                  background: 'rgba(48,209,88,0.18)',
                  border: '1px solid rgba(48,209,88,0.55)',
                  borderRadius: 999,
                  fontFamily: M.body, fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: '#67e189', textDecoration: 'none',
                }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M3 1h4l2 2v7.5a.5.5 0 0 1-.5.5h-5.5a.5.5 0 0 1-.5-.5V1.5a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M7 1v2.5h2" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                完了レポート
              </a>
            )}
          </div>

          {/* Excerpt */}
          {p.excerpt && (
            <div style={{
              padding: 14,
              background: M.elevated, border: `1px solid ${M.hairline}`,
              borderRadius: 10,
              marginBottom: 14,
              fontFamily: M.body, fontSize: 13, lineHeight: 1.6, color: M.inkDim,
            }}>{p.excerpt}</div>
          )}

          {/* Links grid + completion report badge */}
          {(linkItems.length > 0 || reportUrl) && (
            <div>
              <div style={{
                fontFamily: M.mono, fontSize: 9, fontWeight: 700,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: M.inkMuted, marginBottom: 8,
              }}>関連リンク</div>
              {linkItems.length > 0 && (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6,
                }}>
                  {linkItems.map(it => (
                    it.onClick ? (
                      <button key={it.k} onClick={(e) => { e.stopPropagation(); it.onClick(); }}
                        style={linkBtnStyle()}>
                        {it.icon && <img src={it.icon} alt="" width="14" height="14" style={{ display: 'block', borderRadius: 2 }} />}
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
                        {it.count && <span style={{ color: M.inkMuted, fontSize: 10 }}>×{it.count}</span>}
                      </button>
                    ) : (
                      <a key={it.k} href={it.url || '#'} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => { e.stopPropagation(); if (!it.url) e.preventDefault(); }}
                        style={linkBtnStyle()}>
                        {it.icon && <img src={it.icon} alt="" width="14" height="14" style={{ display: 'block', borderRadius: 2 }} />}
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
                        {it.count && <span style={{ color: M.inkMuted, fontSize: 10 }}>×{it.count}</span>}
                      </a>
                    )
                  ))}
                </div>
              )}
              {/* Completion report badge — bottom, green bordered */}
              {reportUrl && (
                <a href={reportUrl} target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    marginTop: 8, padding: '9px 14px',
                    background: 'rgba(48,209,88,0.14)',
                    border: '1px solid rgba(48,209,88,0.42)',
                    borderRadius: 10,
                    color: '#67e189',
                    fontFamily: M.body, fontSize: 12, fontWeight: 700,
                    letterSpacing: '0.06em',
                    textDecoration: 'none',
                  }}>
                  {p.cr
                    ? <img src={fav('docs.google.com')} alt="" width="14" height="14" style={{ display: 'block', borderRadius: 2 }} />
                    : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 1h4l2 2v7.5a.5.5 0 0 1-.5.5h-5.5a.5.5 0 0 1-.5-.5V1.5a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.2"/><path d="M7 1v2.5h2" stroke="currentColor" strokeWidth="1.2"/></svg>
                  }
                  <span>完了レポート</span>
                </a>
              )}
            </div>
          )}

          {/* Team */}
          {p.team && p.team.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{
                fontFamily: M.mono, fontSize: 9, fontWeight: 700,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: M.inkMuted, marginBottom: 8,
              }}>チーム ({p.team.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p.team.map((tm, i) => (
                  <span key={i} style={{
                    padding: '5px 10px',
                    background: M.elevated, border: `1px solid ${M.hairline}`,
                    borderRadius: 999,
                    fontFamily: M.body, fontSize: 11, color: M.inkDim,
                  }}>
                    {tm.name} <span style={{ color: M.inkMuted, fontSize: 10 }}>({tm.role})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function linkBtnStyle(accent) {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '9px 12px',
    background: accent ? 'rgba(48,209,88,0.14)' : M.elevated,
    border: `1px solid ${accent ? 'rgba(48,209,88,0.42)' : M.hairlineStrong}`,
    borderRadius: 10,
    color: accent ? '#67e189' : M.ink,
    fontFamily: M.body, fontSize: 12, fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    minWidth: 0,
  };
}

// ============================================================
// HERO ROTATOR — 3 compact cards (welcome / panel-view promo / filter guide)
// auto-cycle, dots to switch, × to dismiss for the session
// ============================================================
function HeroRotator({ onClose, onJumpToList }) {
  const [idx, setIdx] = useStateM(0);
  const [paused, setPaused] = useStateM(false);
  const cards = [
    <WelcomeCard key="w" onCTA={onJumpToList} />,
    <PanelViewPromoCard key="p" />,
    <FilterGuideCard key="f" />,
  ];
  useEffectM(() => {
    if (paused) return;
    const t = setInterval(() => setIdx(i => (i + 1) % cards.length), 5500);
    return () => clearInterval(t);
  }, [paused]);
  return (
    <div style={{
      position: 'relative',
      margin: '0 12px 10px',
      borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${M.hairline}`,
      background: '#0a0a0e',
      minHeight: 168,
    }}
      onTouchStart={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      {/* Active card */}
      <div style={{ animation: 'cm-cardfade .4s ease', minHeight: 168, display: 'flex' }}>
        {cards[idx]}
      </div>
      {/* Top-right dismiss */}
      <button onClick={onClose} aria-label="ヒントを隠す" style={{
        position: 'absolute', top: 6, right: 6, zIndex: 5,
        width: 26, height: 26, borderRadius: '50%',
        background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.18)',
        color: '#fff', backdropFilter: 'blur(4px)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      {/* Bottom dots */}
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 5,
        zIndex: 4,
      }}>
        {cards.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} aria-label={'スライド ' + (i+1)}
            style={{
              width: i === idx ? 18 : 6, height: 6, padding: 0,
              borderRadius: 3, border: 'none',
              background: i === idx ? '#fff' : 'rgba(255,255,255,0.32)',
              transition: 'width .2s, background .2s',
            }} />
        ))}
      </div>
      <style>{`
        @keyframes cm-cardfade { 0% { opacity: 0; transform: translateY(4px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* Compact card primitive — left/right split, used as the base layout for all 3 hero cards */
function HeroCard({ left, right, bg }) {
  return (
    <div style={{
      position: 'relative', flex: 1, display: 'flex',
      padding: '14px 14px 24px',
      gap: 12,
      background: bg || M.panel,
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {left}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {right}
      </div>
    </div>
  );
}

// --- Card 1: Welcome / stats / "始めよう" CTA ---
function WelcomeCard({ onCTA }) {
  const total = window.TOTAL_COUNT || 130;
  const adaDisplay = window.TOTAL_ADA_DISPLAY || '21.6M';
  return (
    <HeroCard
      bg="radial-gradient(120% 100% at 20% 30%, oklch(35% 0.14 280) 0%, transparent 60%), linear-gradient(135deg, #0a0a14 0%, #14141c 100%)"
      left={
        <div>
          <div style={{
            fontFamily: M.mono, fontSize: 9, fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: M.accent, marginBottom: 6,
          }}>Catalyst · Japan</div>
          <div style={{
            fontFamily: M.display, fontSize: 16, fontWeight: 700,
            color: M.ink, letterSpacing: '-0.015em', lineHeight: 1.25,
            marginBottom: 6,
          }}>探求する、<br/><span style={{ fontFamily: M.serif, fontStyle: 'italic', fontWeight: 400, color: M.inkDim }}>日本の</span>エコシステム。</div>
          <button onClick={onCTA} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 12px',
            background: '#fff', color: '#0a0a0c',
            border: 'none', borderRadius: 999,
            fontFamily: M.body, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}>始めよう <span>→</span></button>
        </div>
      }
      right={
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
          width: '100%', maxWidth: 200,
        }}>
          <Stat n={total} label="提案" />
          <Stat n={adaDisplay} label="₳" mono />
          <Stat n="13" label="ラウンド" />
        </div>
      }
    />
  );
}
function Stat({ n, label, mono }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: mono ? M.mono : M.display, fontSize: 18, fontWeight: 700,
        color: M.ink, letterSpacing: '-0.02em', lineHeight: 1,
      }}>{n}</div>
      <div style={{
        fontFamily: M.mono, fontSize: 8, color: M.inkMuted,
        letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3,
      }}>{label}</div>
    </div>
  );
}

// --- Card 2: Panel-view promo (the user's left/right base) ---
function PanelViewPromoCard() {
  const panels = [
    { hue: 28,  label: '業界' },
    { hue: 210, label: 'アカ' },
    { hue: 320, label: '時系列' },
    { hue: 140, label: '関係' },
    { hue: 50,  label: 'チャート' },
  ];
  return (
    <HeroCard
      bg="radial-gradient(120% 100% at 80% 30%, oklch(30% 0.12 230) 0%, transparent 60%), linear-gradient(135deg, #0a0e14 0%, #14181c 100%)"
      left={
        <div>
          <div style={{
            fontFamily: M.display, fontSize: 15, fontWeight: 700,
            color: M.ink, letterSpacing: '-0.015em', lineHeight: 1.25,
            marginBottom: 8,
          }}>1つの提案を、<br/><span style={{ fontFamily: M.serif, fontStyle: 'italic', fontWeight: 400, color: M.inkDim }}>6</span>つの視点で。</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 8px 4px 5px',
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 8,
            fontFamily: M.body, fontSize: 10, fontWeight: 600,
            color: '#fff',
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 22, height: 22, borderRadius: 4, background: '#fff', color: '#0a0a0c',
            }}>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <rect x="1.2" y="1.2" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="6.8" y="1.2" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="1.2" y="6.8" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="6.8" y="6.8" width="4" height="4" rx="0.7" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
            </span>
            <span>カード右下のアイコン</span>
          </div>
        </div>
      }
      right={
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3,
          width: '100%', maxWidth: 180,
        }}>
          {panels.map((p, i) => (
            <div key={i} style={{
              aspectRatio: '1 / 1.4',
              borderRadius: 4, overflow: 'hidden',
              background: `radial-gradient(120% 110% at 30% 20%, oklch(55% 0.22 ${p.hue}) 0%, transparent 60%), linear-gradient(135deg, oklch(20% 0.10 ${p.hue}) 0%, oklch(12% 0.06 ${(p.hue + 30) % 360}) 100%)`,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              padding: '0 0 4px',
              fontFamily: M.body, fontSize: 7.5, fontWeight: 700,
              color: '#fff',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}>{p.label}</div>
          ))}
        </div>
      }
    />
  );
}

// --- Card 3: Filter guide ---
function FilterGuideCard() {
  return (
    <HeroCard
      bg="radial-gradient(120% 100% at 50% 20%, oklch(30% 0.10 30) 0%, transparent 60%), linear-gradient(135deg, #100d08 0%, #1a1610 100%)"
      left={
        <div>
          <div style={{
            fontFamily: M.display, fontSize: 15, fontWeight: 700,
            color: M.ink, letterSpacing: '-0.015em', lineHeight: 1.25,
            marginBottom: 8,
          }}>見たいものに<br/><span style={{ fontFamily: M.serif, fontStyle: 'italic', fontWeight: 400, color: M.accent }}>絞り込む。</span></div>
          <div style={{
            fontFamily: M.body, fontSize: 10.5, color: M.inkDim,
            lineHeight: 1.45,
          }}>STATUS / FUND / CATEGORY の 3 段フィルタ。<br/>自由に組み合わせて。</div>
        </div>
      }
      right={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, width: '100%', maxWidth: 160 }}>
          {[
            { label: 'STATUS', items: ['すべて', '進行中', '完了'], activeIdx: 1 },
            { label: 'FUND',   items: ['ALL', 'F12', 'F13', 'F14'], activeIdx: 2 },
            { label: 'CAT.',   items: ['ALL', 'COMMUNITY', 'REAL'],  activeIdx: 1 },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{
                fontFamily: M.mono, fontSize: 7, fontWeight: 700,
                letterSpacing: '0.14em', color: M.inkMuted,
                width: 36, flexShrink: 0,
              }}>{row.label}</span>
              <div style={{ display: 'flex', gap: 2, overflow: 'hidden' }}>
                {row.items.map((it, j) => (
                  <span key={j} style={{
                    padding: '2px 5px',
                    background: j === row.activeIdx ? '#fff' : 'rgba(255,255,255,0.08)',
                    color: j === row.activeIdx ? '#0a0a0c' : '#fff',
                    borderRadius: 999,
                    fontFamily: M.body, fontSize: 8, fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>{it}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      }
    />
  );
}

// ============================================================
// MOBILE DOCK — bottom control bar (currency / price mode / lang / theme)
// matches mobile.html's da-dock pattern for visual consistency across the
// future unified mobile experience
// ============================================================
function MobileDock({ currency, setCurrency, priceMode, setPriceMode, lang, setLang, theme, setTheme }) {
  const btn = (active, extra = {}) => ({
    minWidth: 28, height: 26,
    padding: '0 7px',
    border: 'none', borderRadius: 6,
    background: active ? '#fff' : 'transparent',
    color: active ? '#0a0a0c' : M.inkDim,
    fontFamily: M.body, fontSize: 11, fontWeight: active ? 700 : 500,
    lineHeight: 1, cursor: 'pointer',
    transition: 'background .12s, color .12s',
    ...extra,
  });
  const sep = () => <span style={{ width: 1, height: 14, background: M.hairline, margin: '0 5px', flexShrink: 0 }} />;
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 11,
      padding: '8px 12px calc(env(safe-area-inset-bottom, 0px) + 10px)',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0.95))',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderTop: `1px solid ${M.hairline}`,
      pointerEvents: 'auto',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '5px 7px',
        background: M.panel, border: `1px solid ${M.hairline}`,
        borderRadius: 999,
        boxShadow: '0 4px 18px rgba(0,0,0,0.5)',
      }}>
        {/* Currency */}
        {['ada', 'usd', 'jpy'].map(c => (
          <button key={c} onClick={() => setCurrency(c)}
            style={btn(currency === c, { fontFamily: M.mono, fontSize: 13 })}
            title={c.toUpperCase()}>
            {c === 'ada' ? '₳' : c === 'usd' ? '$' : '¥'}
          </button>
        ))}
        {sep()}
        {/* Price mode */}
        {[{ id: 'submit', l: '提案時' }, { id: 'result', l: '採択時' }].map(p => (
          <button key={p.id} onClick={() => setPriceMode(p.id)}
            style={btn(priceMode === p.id)}>{p.l}</button>
        ))}
        {/* Spacer */}
        <div style={{ flex: 1 }} />
        {/* Lang */}
        {[{ id: 'ja', l: '日' }, { id: 'en', l: 'EN' }].map(l => (
          <button key={l.id} onClick={() => setLang(l.id)}
            style={btn(lang === l.id, { fontFamily: M.mono, fontSize: 11, minWidth: 24 })}>{l.l}</button>
        ))}
        {/* Theme */}
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          style={{
            ...btn(false),
            width: 28, height: 26, padding: 0,
            color: M.inkDim,
          }}
          title="Toggle theme">
          {theme === 'dark' ? '☾' : '☀'}
        </button>
      </div>
    </div>
  );
}

// ---------- App ----------
function CatalogMobileApp() {
  const PROPOSALS = window.PROPOSALS || [];
  const [query, setQuery] = useStateM('');
  const [statusFilter, setStatusFilter] = useStateM('すべて');
  const [fundFilter, setFundFilter] = useStateM('ALL');
  const [catFilter, setCatFilter] = useStateM('ALL');
  const [selectedId, setSelectedId] = useStateM(null);
  /* HeroRotator: dismiss persists for the session so users aren't re-shown the
     tips every interaction. sessionStorage clears on tab close — fresh each visit. */
  const [heroVisible, setHeroVisible] = useStateM(() => {
    try { return sessionStorage.getItem('cm-hero-dismissed') !== '1'; } catch (e) { return true; }
  });
  /* MobileDock state — local for now; wiring to actual currency/price formatting will
     come once the mobile proposal card adopts the desktop's CurrencyContext pattern. */
  const [currency, setCurrency]   = useStateM('ada');
  const [priceMode, setPriceMode] = useStateM('submit');
  const [lang, setLang]           = useStateM('ja');
  const [theme, setTheme]         = useStateM('dark');

  const listRef = useRefM(null);

  const cats = useMemoM(() => {
    const m = {};
    PROPOSALS.forEach(p => { m[p.cat] = (m[p.cat] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, []);

  const visible = useMemoM(() => {
    const q = (query || '').toLowerCase().trim();
    return PROPOSALS.filter(p => {
      if (statusFilter !== 'すべて' && p.s !== statusFilter) return false;
      if (fundFilter !== 'ALL'    && p.f !== fundFilter) return false;
      if (catFilter !== 'ALL'    && p.cat !== catFilter) return false;
      if (q) {
        const hay = (p.title + ' ' + (p.title_en || '') + ' ' + (p.proposer || '')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }, [PROPOSALS, query, statusFilter, fundFilter, catFilter]);

  const selected = selectedId ? PROPOSALS.find(p => p.id === selectedId) : null;

  const dismissHero = () => {
    setHeroVisible(false);
    try { sessionStorage.setItem('cm-hero-dismissed', '1'); } catch (e) {}
  };
  const reshowHero = () => {
    setHeroVisible(true);
    try { sessionStorage.removeItem('cm-hero-dismissed'); } catch (e) {}
  };
  const jumpToList = () => {
    if (listRef.current) listRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', minHeight: '100dvh',
      /* Reserve space at the bottom for the fixed MobileDock so content + footer
         aren't hidden behind it. Tuned to dock height + safe-area inset. */
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)',
    }}>
      <Header devBadge heroHidden={!heroVisible} onReshowHero={reshowHero} />
      <SearchAndFilters
        query={query} setQuery={setQuery}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        fundFilter={fundFilter} setFundFilter={setFundFilter}
        catFilter={catFilter} setCatFilter={setCatFilter}
        cats={cats}
      />
      {/* Rotating hero — sits below search, above the list. Compact + dismissable. */}
      {heroVisible && <HeroRotator onClose={dismissHero} onJumpToList={jumpToList} />}
      <main ref={listRef} style={{ flex: 1, padding: '8px 12px 32px' }}>
        {/* Result count */}
        <div style={{
          padding: '4px 4px 10px',
          fontFamily: M.mono, fontSize: 10, color: M.inkMuted,
          letterSpacing: '0.06em',
        }}>{visible.length} 件</div>
        {visible.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: M.inkMuted,
            fontFamily: M.body, fontSize: 13,
          }}>該当する提案がありません</div>
        ) : (
          visible.map(p => <ProposalCard key={p.id} p={p} onOpen={(pp) => setSelectedId(pp.id)} />)
        )}
      </main>

      <ProposalDetail p={selected} onClose={() => setSelectedId(null)} />

      {/* Footer / disclaimer — same wording family as desktop */}
      <footer style={{
        padding: '12px 16px 14px',
        borderTop: `1px solid ${M.hairline}`,
        fontFamily: M.body, fontSize: 10, lineHeight: 1.55,
        color: M.inkMuted,
        background: M.bg,
      }}>
        ※ 本サイトは Catalyst Explorer / projectcatalyst.io の公開情報に基づく非公式の個人プロジェクトです。投資助言ではありません。
        <div style={{ marginTop: 6, fontFamily: M.mono, fontSize: 9, color: M.inkMuted, letterSpacing: '0.08em' }}>
          MOBILE DEV · v.2026.05
        </div>
      </footer>

      {/* Sticky bottom control dock — currency / price mode / lang / theme */}
      <MobileDock
        currency={currency} setCurrency={setCurrency}
        priceMode={priceMode} setPriceMode={setPriceMode}
        lang={lang} setLang={setLang}
        theme={theme} setTheme={setTheme}
      />
    </div>
  );
}

Object.assign(window, { CatalogMobileApp });
