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
function Header({ devBadge = true }) {
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
  const linkItems = [];
  if (p.site)         linkItems.push({ k: 'SITE',  label: p.siteDomain || 'Site', url: p.site, icon: fav((window.urlDomain && window.urlDomain(p.site)) || p.siteDomain || 'example.com') });
  if (p.report)       linkItems.push({ k: 'DOC',   label: p.s === '完了' ? '完了レポート' : 'Doc', url: p.report.url, accent: p.s === '完了' });
  if (p.videoUrl)     linkItems.push({ k: 'VIDEO', label: 'YouTube',   url: p.videoUrl, icon: fav('youtube.com'), onClick: playVideo });
  if (p.links && p.links.GH) linkItems.push({ k: 'GH', label: 'GitHub',   count: p.links.GH, url: window.resolveLinkUrl ? window.resolveLinkUrl(p.meta, 'GH') : null, icon: fav('github.com') });
  if (p.links && p.links.x)  linkItems.push({ k: 'X',  label: 'X',        count: p.links.x,  url: window.resolveLinkUrl ? window.resolveLinkUrl(p.meta, 'x') : null,  icon: fav('x.com') });
  if (p.links && p.links.in) linkItems.push({ k: 'in', label: 'LinkedIn', count: p.links.in, url: window.resolveLinkUrl ? window.resolveLinkUrl(p.meta, 'in') : null, icon: fav('linkedin.com') });
  if (p.explorer)     linkItems.push({ k: 'EX',  label: 'Explorer', url: p.explorer, icon: fav('catalystexplorer.com') });

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
            {p.report && p.s === '完了' && (
              <a href={p.report.url} target="_blank" rel="noopener noreferrer"
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

          {/* Links grid */}
          {linkItems.length > 0 && (
            <div>
              <div style={{
                fontFamily: M.mono, fontSize: 9, fontWeight: 700,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: M.inkMuted, marginBottom: 8,
              }}>関連リンク</div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6,
              }}>
                {linkItems.map(it => (
                  it.onClick ? (
                    <button key={it.k} onClick={(e) => { e.stopPropagation(); it.onClick(); }}
                      style={linkBtnStyle(it.accent)}>
                      {it.icon && <img src={it.icon} alt="" width="14" height="14" style={{ display: 'block', borderRadius: 2 }} />}
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
                      {it.count && <span style={{ color: M.inkMuted, fontSize: 10 }}>×{it.count}</span>}
                    </button>
                  ) : (
                    <a key={it.k} href={it.url || '#'} target="_blank" rel="noopener noreferrer"
                      onClick={(e) => { e.stopPropagation(); if (!it.url) e.preventDefault(); }}
                      style={linkBtnStyle(it.accent)}>
                      {it.icon && <img src={it.icon} alt="" width="14" height="14" style={{ display: 'block', borderRadius: 2 }} />}
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
                      {it.count && <span style={{ color: M.inkMuted, fontSize: 10 }}>×{it.count}</span>}
                    </a>
                  )
                ))}
              </div>
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

// ---------- App ----------
function CatalogMobileApp() {
  const PROPOSALS = window.PROPOSALS || [];
  const [query, setQuery] = useStateM('');
  const [statusFilter, setStatusFilter] = useStateM('すべて');
  const [fundFilter, setFundFilter] = useStateM('ALL');
  const [catFilter, setCatFilter] = useStateM('ALL');
  const [selectedId, setSelectedId] = useStateM(null);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <Header devBadge />
      <SearchAndFilters
        query={query} setQuery={setQuery}
        statusFilter={statusFilter} setStatusFilter={setStatusFilter}
        fundFilter={fundFilter} setFundFilter={setFundFilter}
        catFilter={catFilter} setCatFilter={setCatFilter}
        cats={cats}
      />
      <main style={{ flex: 1, padding: '8px 12px 32px' }}>
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
        padding: '12px 16px calc(env(safe-area-inset-bottom,0px) + 18px)',
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
    </div>
  );
}

Object.assign(window, { CatalogMobileApp });
