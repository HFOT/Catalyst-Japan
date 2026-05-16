#!/usr/bin/env node
/* fetch-proposal-meta.js — Build window.PMETA = { id: { site, video[], pdf[], slides[], github[], x[], linkedin[], sources, ... } }
   Sources:
   1. catalystexplorer.com search → slug + projectcatalyst_io_link + users + catalyst_profiles
   2. projectcatalyst.io page __NEXT_DATA__ → description/aboutTeam/fullDetail/media/website
   3. Supabase (hutbpqou) poas + soms → close-out HTML content (richest source of links)
   Run: node fetch-proposal-meta.js
   Output: proposal-meta.js */

const fs = require('fs');

global.window = {};
require('./data.js');
const D = global.window.CJ_DATA;

const SB_BASE='https://hutbpqoulajxnzwykvrf.supabase.co/rest/v1';
const SB_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1dGJwcW91bGFqeG56d3lrdnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI0NTU5NTAsImV4cCI6MTk5ODAzMTk1MH0.ecs2bfAZzT0KwdsqrkAMpPWf0K1_pRvV1_4vK1_lCzI';
const SB_HDRS={'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY};

/* Local id → Supabase proposal_id (from fetch-milestones.js). Only F10+ */
const SBMAP={
  'co-1':[1089],'co-3':[201],'co-4':[237,989],'co-10':[1066],'co-12':[693],
  'co-13':[218],'co-22':[497],
  'dt-1':[584],'dt-9':[139],'dt-16':[28],'dt-21':[970],
  'em-1':[1043],'em-3':[149],'em-10':[621],'em-14':[358],'em-15':[997],
  'em-16':[852],'em-17':[1038],
  'is-2':[231],'is-7':[406],'is-10':[231],'is-11':[469],
  'df-2':[38],'df-10':[367],
  'ed-2':[96],'ed-3':[35],'ed-6':[227],'ed-1':[665],'ed-11':[122],
  'co-15':[1052],'co-19':[1067],'co-21':[851],
  'dt-8':[789],'dt-17':[120],
  'em-2':[739],'em-6':[791],
  'is-1':[1018],'is-4':[154],'is-12':[569],
  'gv-1':[493],
  'rw-1':[941],'rw-2':[1019],'rw-4':[325],'rw-5':[3],'rw-9':[646],
  'io-2':[144],
  'gf-1':[238],'gf-3':[43],
  'nf-2':[498],'nf-4':[432],'nf-5':[513],
  'su-1':[514]
};

/* ── helpers ── */
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function decodeEnt(s){return s ? s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'") : '';}

function classify(u){
  if(/youtube\.com|youtu\.be/i.test(u)) return 'youtube';
  if(/docs\.google\.com\/presentation/i.test(u)) return 'slides';
  if(/docs\.google\.com\/document/i.test(u)) return 'doc';
  if(/docs\.google\.com\/spreadsheets/i.test(u)) return 'sheet';
  if(/drive\.google\.com/i.test(u)) return 'drive';
  if(/github\.com/i.test(u)) return 'github';
  if(/(?:twitter\.com|x\.com)\//i.test(u)) return 'x';
  if(/linkedin\.com/i.test(u)) return 'linkedin';
  if(/medium\.com/i.test(u)) return 'medium';
  if(/(?:discord\.|t\.me\/|telegram\.|facebook\.com|instagram\.com)/i.test(u)) return 'social';
  if(/\.pdf(\?|$|#)/i.test(u)) return 'pdf';
  if(/notion\.so/i.test(u)) return 'notion';
  if(/figma\.com/i.test(u)) return 'figma';
  if(/ipfs\./i.test(u)) return 'ipfs';
  if(/cardanoscan|cexplorer|adastat|pool\.pm/i.test(u)) return 'onchain';
  if(/ideascale/i.test(u)) return 'ideascale';
  if(/projectcatalyst\.io/i.test(u)) return 'catalyst';
  if(/catalystexplorer/i.test(u)) return 'explorer';
  return 'web';
}

/* Filter out inline-image and tracking URLs */
function isJunk(u){
  return /lh\d+-us\.googleusercontent\.com/i.test(u)
    || /\/api\/project-og-image/i.test(u)
    || /cardano\.ideas\.[a-z]+\.com\/[a-z]\/?$/i.test(u)
    || /\.(?:png|jpg|jpeg|gif|webp|svg|ico)(\?|$)/i.test(u);
}

function extractUrls(html){
  if(!html) return [];
  const found = new Set();
  const re = /https?:\/\/[^\s"'<>)\]]+/g;
  let m;
  while ((m = re.exec(html))) {
    let u = decodeEnt(m[0]).replace(/[.,;:!?\])]+$/, '');
    if (u.length < 12 || u.length > 400) continue;
    if (isJunk(u)) continue;
    found.add(u);
  }
  return [...found];
}

function youtubeId(u){
  let m = u.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1].split('?')[0].split('&')[0];
  m = u.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1];
  m = u.match(/youtube\.com\/(?:embed|shorts)\/([a-zA-Z0-9_-]{6,})/);
  if (m) return m[1].split('?')[0].split('&')[0];
  return null;
}

/* ── network fetchers ── */
async function sbGet(path) {
  try {
    const r = await fetch(SB_BASE + path, { headers: SB_HDRS });
    if (!r.ok) return null;
    return r.json();
  } catch (e) { return null; }
}

async function ceSearch(label) {
  const url = 'https://www.catalystexplorer.com/api/proposals?search=' + encodeURIComponent(label) + '&limit=3';
  try {
    const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!r.ok) return null;
    const j = await r.json();
    const items = j.data || j;
    if (!Array.isArray(items) || !items.length) return null;
    // Best match
    const exact = items.find(i => i.title && i.title.toLowerCase() === label.toLowerCase());
    return exact || items[0];
  } catch (e) { return null; }
}

async function pcPage(url) {
  if (!url) return null;
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const html = await r.text();
    const nd = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    if (!nd) return null;
    const data = JSON.parse(nd[1]);
    return data.props.pageProps.data && data.props.pageProps.data.project || null;
  } catch (e) { return null; }
}

/* ── main fetch per proposal ── */
async function fetchOne(p) {
  const out = {
    sources: { ce: false, pc: false, sb: 0 },
    site: null,
    youtube: [],
    github: [],
    pdf: [],
    slides: [],
    doc: [],
    sheet: [],
    drive: [],
    x: [],
    linkedin: [],
    medium: [],
    social: [],
    notion: [],
    figma: [],
    ipfs: [],
    onchain: [],
    catalyst: [],
    explorer: [],
    ideascale: [],
    web: [],
    team: []
  };
  let allHtml = '';

  /* 1. Catalyst Explorer search */
  const ce = await ceSearch(p.label);
  if (ce) {
    out.sources.ce = true;
    if (ce.website && ce.website.startsWith('http')) out.site = ce.website;
    if (ce.link) allHtml += '\n' + ce.link;
    if (ce.ideascale_link) allHtml += '\n' + ce.ideascale_link;
    if (ce.projectcatalyst_io_link) allHtml += '\n' + ce.projectcatalyst_io_link;
    /* Build team from users */
    if (Array.isArray(ce.users)) {
      ce.users.forEach(u => {
        if (!u || !u.name) return;
        out.team.push({
          name: u.name,
          username: u.username || null,
          twitter: u.twitter || null,
          linkedin: u.linkedin || null,
          discord: u.discord || null,
          telegram: u.telegram || null,
          hero_img_url: u.hero_img_url || null
        });
      });
    }
    /* Also harvest URLs from social fields and content fields */
    ['problem','solution','pitch','experience','content','social_excerpt','ai_summary'].forEach(k => {
      if (ce[k]) allHtml += '\n' + ce[k];
    });
  }

  /* 2. projectcatalyst.io page (F10+) */
  if (ce && ce.projectcatalyst_io_link) {
    const pc = await pcPage(ce.projectcatalyst_io_link);
    if (pc) {
      out.sources.pc = true;
      if (!out.site && pc.website && pc.website.startsWith('http')) out.site = pc.website;
      ['description','summary','aboutTeam','fullDetail'].forEach(k => {
        if (pc[k]) allHtml += '\n' + pc[k];
      });
      if (pc.website) allHtml += '\n' + pc.website;
      if (pc.ideascaleUrl) allHtml += '\n' + pc.ideascaleUrl;
      if (Array.isArray(pc.media) && pc.media.length) {
        pc.media.forEach(m => {
          if (typeof m === 'string') allHtml += '\n' + m;
          else if (m && typeof m === 'object') allHtml += '\n' + JSON.stringify(m);
        });
      }
      if (Array.isArray(pc.submitters)) {
        pc.submitters.forEach(s => {
          if (!s || !s.name) return;
          /* dedup by name */
          if (!out.team.find(t => t.name === s.name)) {
            out.team.push({
              name: s.name,
              username: s.username || null,
              hero_img_url: s.avatarUrl || null
            });
          }
        });
      }
    }
  }

  /* 3. Supabase PoAs + SoMs (F10+ proposals with milestone data) */
  const sbIds = SBMAP[p.id];
  if (sbIds && sbIds.length) {
    for (const sbId of sbIds) {
      const poas = await sbGet('/poas?proposal_id=eq.' + sbId + '&select=content');
      const soms = await sbGet('/soms?proposal_id=eq.' + sbId + '&select=outputs,success_criteria,evidence');
      if (poas) {
        for (const r of poas) if (r.content) allHtml += '\n' + r.content;
        out.sources.sb += (poas||[]).length;
      }
      if (soms) {
        for (const r of soms) {
          if (r.outputs) allHtml += '\n' + r.outputs;
          if (r.success_criteria) allHtml += '\n' + r.success_criteria;
          if (r.evidence) allHtml += '\n' + r.evidence;
        }
      }
      await sleep(60);
    }
  }

  /* Extract & bucket URLs */
  const urls = extractUrls(allHtml);
  urls.forEach(u => {
    const t = classify(u);
    if (!out[t]) out[t] = [];
    out[t].push(u);
  });

  /* Dedup each bucket */
  for (const k of Object.keys(out)) {
    if (Array.isArray(out[k]) && k !== 'team' && k !== 'youtube') {
      out[k] = [...new Set(out[k])];
    }
  }

  /* Build YouTube records with thumbnails */
  const ytSeen = new Set();
  out.videos = [];
  out.youtube.forEach(u => {
    const id = youtubeId(u);
    if (!id || ytSeen.has(id)) return;
    ytSeen.add(id);
    out.videos.push({
      id,
      url: u,
      thumb: 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg'
    });
  });
  delete out.youtube;

  /* Pull linkedin info into team where possible (match by URL slug to name) */
  out.linkedin.forEach(li => {
    /* attach to first team member that doesn't already have a linkedin */
    const slot = out.team.find(t => !t.linkedin);
    if (slot) slot.linkedin = li;
  });

  /* Trim empty buckets */
  for (const k of Object.keys(out)) {
    if (Array.isArray(out[k]) && !out[k].length) delete out[k];
  }
  return out;
}

/* ── main ── */
(async () => {
  const all = [];
  D.INDUSTRIES.forEach(ind => ind.children.forEach(p => {
    if (p.id) all.push({ id: p.id, label: p.label, labelJa: p.labelJa, fund: p.fund, by: p.by });
  }));
  console.error('Total Japan proposals:', all.length);

  const result = {};
  let okCount = 0;
  for (let i = 0; i < all.length; i++) {
    const p = all[i];
    process.stderr.write(`[${(i+1).toString().padStart(3)}/${all.length}] ${p.id.padEnd(6)} F${p.fund} ${(p.label||'').substring(0,55).padEnd(55)} ... `);
    const meta = await fetchOne(p);
    result[p.id] = meta;
    const counts = [];
    if (meta.site) counts.push('site');
    if (meta.videos) counts.push('vid:'+meta.videos.length);
    if (meta.pdf) counts.push('pdf:'+meta.pdf.length);
    if (meta.github) counts.push('gh:'+meta.github.length);
    if (meta.linkedin) counts.push('in:'+meta.linkedin.length);
    if (meta.x) counts.push('x:'+meta.x.length);
    if (meta.team && meta.team.length) counts.push('team:'+meta.team.length);
    process.stderr.write(`[ce=${meta.sources.ce?1:0}/pc=${meta.sources.pc?1:0}/sb=${meta.sources.sb}] ${counts.join(' ')}\n`);
    if (meta.sources.ce || meta.sources.pc || meta.sources.sb>0) okCount++;
    await sleep(450);  /* be nice to APIs */
  }

  /* Write output */
  const header = `/* Proposal meta links/media — generated by fetch-proposal-meta.js on ${new Date().toISOString().substring(0,10)}.
   Sources: catalystexplorer.com search + projectcatalyst.io page __NEXT_DATA__ + Supabase milestone PoAs/SoMs */
window.PMETA=`;
  const body = JSON.stringify(result, null, 0);
  fs.writeFileSync('proposal-meta.js', header + body + ';\n');

  console.error('\n========================================');
  console.error('OK:', okCount, '/', all.length);
  console.error('Output: proposal-meta.js  (' + body.length + ' chars)');
})();
