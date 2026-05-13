// Fetch proposal descriptions from Catalyst Explorer API
// Run: node fetch-descriptions.js

const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Extract all proposal labels from the data
const re = /\{id:'([^']+)',label:'([^']+)'/g;
let m;
const proposals = [];
while ((m = re.exec(html)) !== null) {
  // Skip industry-level ids (no hyphen with number)
  if (/^[a-z]+-\d+$/.test(m[1])) {
    proposals.push({ id: m[1], label: m[2] });
  }
}
console.log('Found', proposals.length, 'proposals');

async function fetchOne(p, retries = 2) {
  const url = 'https://catalystexplorer.com/api/proposals?search=' + encodeURIComponent(p.label) + '&limit=3';
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const json = await r.json();
    const items = json.data || json;
    if (!Array.isArray(items) || items.length === 0) return null;
    // Try exact match first
    let found = items.find(i => i.title && i.title.toLowerCase() === p.label.toLowerCase());
    if (!found) found = items[0];
    return {
      problem: (found.problem || '').substring(0, 200),
      solution: (found.solution || '').substring(0, 200),
      link: found.link || null,
      slug: found.slug || null,
      hash: found.hash || null,
      id: found.id || null
    };
  } catch (e) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 2000));
      return fetchOne(p, retries - 1);
    }
    console.error('  FAIL:', p.label, e.message);
    return null;
  }
}

(async () => {
  const result = {};
  for (let i = 0; i < proposals.length; i++) {
    const p = proposals[i];
    process.stdout.write(`[${i + 1}/${proposals.length}] ${p.label.substring(0, 50)}... `);
    const data = await fetchOne(p);
    if (data) {
      result[p.id] = data;
      console.log('OK');
    } else {
      console.log('SKIP');
    }
    // Rate limit: 500ms between requests
    await new Promise(r => setTimeout(r, 500));
  }
  fs.writeFileSync('proposal-descriptions.json', JSON.stringify(result, null, 2));
  console.log('\nDone! Wrote', Object.keys(result).length, 'descriptions to proposal-descriptions.json');
})();
