// Convert proposal-descriptions.json to compact JS for embedding
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('proposal-descriptions.json', 'utf8'));

// Build compact lookup using JSON.stringify for safe escaping
const obj = {};
for (const [id, d] of Object.entries(data)) {
  let prob = (d.problem || '').replace(/!\[.*?\]\(.*?\)/g, '').replace(/\n/g, ' ').trim();
  let sol = (d.solution || '').replace(/!\[.*?\]\(.*?\)/g, '').replace(/\n/g, ' ').trim();
  if (prob.length > 180) prob = prob.substring(0, 177) + '...';
  if (sol.length > 180) sol = sol.substring(0, 177) + '...';
  obj[id] = { p: prob, s: sol, u: d.link || '' };
}

const output = 'var PDESC=' + JSON.stringify(obj) + ';';
fs.writeFileSync('pdesc-embed.js', output);
console.log('Generated pdesc-embed.js with', Object.keys(obj).length, 'entries');
console.log('Size:', (output.length / 1024).toFixed(1), 'KB');
