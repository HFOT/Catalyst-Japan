/* Catalyst Japan — Project Completion Dates
   Source: Google Sheets "Project Completions" (IOG official)
   https://docs.google.com/spreadsheets/d/1bfnWFa94Y7Zj0G7dtpo9W1nAYGovJbswipxiHT4UE3g
   Date Completed = close-out report accepted date

   Format: { projectId: { title, fund, status, requested, distributed, completed } }
   completed is "Mon YYYY" from the sheet, converted to YYYY-MM-15 for chart use */

window.CJ_COMPLETIONS = {
  // Fund 2
  "200007": { t:"Japan Cardano Governance Association", f:2, st:"complete", req:374, dist:374, completed:"2022-06-15" },

  // Fund 5
  "500026": { t:"Developer Evangelist Japan", f:5, st:"complete", req:19000, dist:19000, completed:"2023-09-15" },

  // Fund 6
  "600086": { t:"Japanese SPO community management", f:6, st:"complete", req:16830, dist:16830, completed:"2022-03-15" },
  "600071": { t:"Fostering Japanese young proposers", f:6, st:"complete", req:6370, dist:6370, completed:"2022-04-15" },

  // Fund 7
  "700104": { t:"Eastern Town Hall & Japan", f:7, st:"complete", req:3000, dist:3000, completed:"2022-04-15" },
  "700246": { t:"Sustainability Hub for Japan", f:7, st:"complete", req:5000, dist:5000, completed:"2022-05-15" },
  "700151": { t:"Japanese Ambassadors & Catalyst", f:7, st:"complete", req:6500, dist:6500, completed:"2022-06-15" },
  "700152": { t:"Japanese FUD / SCAM Buster 100", f:7, st:"complete", req:1500, dist:1500, completed:"2022-07-15" },
  "700167": { t:"Milkomeda Accelerator", f:7, st:"complete", req:50000, dist:50000, completed:"2022-07-15" },
  "700168": { t:"Milkomeda ADA Audit", f:7, st:"complete", req:0, dist:0, completed:"2022-08-15" },
  "700169": { t:"Milkomeda DAO Hackathon", f:7, st:"complete", req:0, dist:0, completed:"2022-10-15" },
  "700022": { t:"Atala Japanese Translation & CNFT", f:7, st:"complete", req:50000, dist:50000, completed:"2023-04-15" },
  "700245": { t:"Survey+Lobbying of Japanese Law", f:7, st:"complete", req:3000, dist:3000, completed:"2023-05-15" },
  "700153": { t:"Japanese Voter Survey - AIM", f:7, st:"complete", req:9000, dist:9000, completed:"2023-07-15" },
  "700170": { t:"Milkomeda documentation(JP,KR,ZH)", f:7, st:"complete", req:0, dist:0, completed:"2023-08-15" },
  "700205": { t:"PAB promotion in Japan", f:7, st:"complete", req:5000, dist:5000, completed:"2023-12-15" },
  "700171": { t:"Milkomeda SPO validator training", f:7, st:"complete", req:0, dist:0, completed:"2024-01-15" },

  // Fund 8
  "800111": { t:"CNFT Festival Japan Meets the West", f:8, st:"complete", req:15000, dist:15000, completed:"2022-07-15" },
  "800254": { t:"Milkomeda token bridge explorer", f:8, st:"complete", req:0, dist:0, completed:"2022-08-15" },
  "800250": { t:"Milkomeda for Cardano unity assets", f:8, st:"complete", req:0, dist:0, completed:"2022-09-15" },
  "800032": { t:"App store for Milkomeda", f:8, st:"complete", req:0, dist:0, completed:"2022-11-15" },
  "800249": { t:"Milkomeda docker fullnode setup", f:8, st:"complete", req:15000, dist:15000, completed:"2022-11-15" },
  "800220": { t:"Japanese Cardano Master Class", f:8, st:"complete", req:10000, dist:10000, completed:"2023-04-15" },
  "800251": { t:"Milkomeda Game", f:8, st:"complete", req:0, dist:0, completed:"2023-05-15" },
  "800339": { t:"TheGraph in Milkomeda", f:8, st:"complete", req:0, dist:0, completed:"2023-06-15" },
  "800225": { t:"Knowledge hub for Vietnam and Japan", f:8, st:"complete", req:14000, dist:14000, completed:"2023-07-15" },
  "800253": { t:"Milkomeda Mobile", f:8, st:"complete", req:25000, dist:25000, completed:"2023-08-15" },
  "800176": { t:"ERC721 & ERC-1155 for Milkomeda", f:8, st:"complete", req:20000, dist:20000, completed:"2024-01-15" },
  "800248": { t:"Milkomeda accelerator batch #2", f:8, st:"complete", req:75000, dist:75000, completed:"2024-06-15" },
  "800360": { t:"Web3 x Cardano ADA Cafe in Japan", f:8, st:"complete", req:50000, dist:50000, completed:"2024-06-15" },
  "800085": { t:"Cardano PR Initiative Japan", f:8, st:"complete", req:36000, dist:36000, completed:"2024-06-15" },
  "800300": { t:"Project Support Stake pool in Japan", f:8, st:"complete", req:6000, dist:6000, completed:"2023-12-15" },
  "800362": { t:"Win-Win Japan Expansion", f:8, st:"complete", req:15000, dist:15000, completed:"2025-05-15" },
  "800252": { t:"Milkomeda Hackathon", f:8, st:"dnf", req:0, dist:0, completed:"2025-09-15" },

  // Fund 9
  "900148": { t:"Milkomeda Djed", f:9, st:"complete", req:0, dist:0, completed:"2023-01-15" },
  "900067": { t:"CNFT Alliance: Japanese Community!", f:9, st:"complete", req:7500, dist:7500, completed:"2023-04-15" },
  "900022": { t:"Atala Integration with Milkomeda", f:9, st:"complete", req:0, dist:0, completed:"2023-06-15" },
  "900035": { t:"Cardano Bridges in Japanese", f:9, st:"complete", req:5800, dist:5800, completed:"2023-07-15" },
  "900149": { t:"Milkomeda Game #2", f:9, st:"complete", req:0, dist:0, completed:"2023-08-15" },
  "900214": { t:"WalletConnect for Cardano", f:9, st:"complete", req:0, dist:0, completed:"2023-08-15" },
  "900135": { t:"Liquid staking for Milkomeda / L2s", f:9, st:"complete", req:0, dist:0, completed:"2023-09-15" },
  "900125": { t:"Japanese Traditional Crafts NFT", f:9, st:"complete", req:51000, dist:51000, completed:"2023-12-15" },
  "900190": { t:"Service Marketplace for Japan, VN", f:9, st:"complete", req:24150, dist:24150, completed:"2023-12-15" },
  "900131": { t:"L-Earning Bazaar: Platform Building", f:9, st:"complete", req:0, dist:0, completed:"2024-03-15" },
  "900106": { t:"Fracada Addressing Audit", f:9, st:"complete", req:0, dist:0, completed:"2024-03-15" },
  "900132": { t:"L-Earning Bazaar: Web3 Integration", f:9, st:"complete", req:0, dist:0, completed:"2024-04-15" },
  "900197": { t:"Support dRep Japan and Vietnam", f:9, st:"complete", req:14500, dist:14500, completed:"2025-02-15" },

  // Fund 10
  "1000164": { t:"Socious: Decentralized Referral DAO", f:10, st:"complete", req:0, dist:0, completed:"2024-06-15" },
  "1000021": { t:"Cardano Asia TikTok Channel", f:10, st:"complete", req:0, dist:0, completed:"2024-06-15" },
  "1000030": { t:"Cardano For the Masses JP Book", f:10, st:"complete", req:0, dist:0, completed:"2024-07-15" },
  "1000165": { t:"Socious: Work History Verifiable Credentials", f:10, st:"complete", req:0, dist:0, completed:"2024-08-15" },
  "1000152": { t:"Catalyst survey in Japan", f:10, st:"complete", req:0, dist:0, completed:"2024-10-15" },
  "1000171": { t:"SPO JAPAN GUILD F10", f:10, st:"complete", req:0, dist:0, completed:"2024-12-15" },
  "1000083": { t:"Exhibit Largest Blockchain EXPO", f:10, st:"complete", req:0, dist:0, completed:"2025-04-15" },
  "1000056": { t:"Crypto magazine by Futaba", f:10, st:"complete", req:0, dist:0, completed:"2025-06-15" },
  "1000161": { t:"SJG TOOLS V2", f:10, st:"complete", req:0, dist:0, completed:"2025-11-15" },
  "1000022": { t:"Web3 Blockchain Center Tokushima", f:10, st:"complete", req:0, dist:0, completed:"2025-11-15" },
  "1000190": { t:"Winter Protocol", f:10, st:"complete", req:0, dist:0, completed:"2026-03-15" },

  // Fund 11
  "1100100": { t:"Community-Led Cardano Summits Japan", f:11, st:"complete", req:0, dist:0, completed:"2024-10-15" },
  "1100046": { t:"Cardano Asia TikTok Channel F11", f:11, st:"complete", req:0, dist:0, completed:"2024-10-15" },
  "1100156": { t:"High Quality JP Translations", f:11, st:"complete", req:0, dist:0, completed:"2025-01-15" },
  "1100060": { t:"Cardano Information Center Japan", f:11, st:"complete", req:0, dist:0, completed:"2025-10-15" },
  "1100115": { t:"dRep TV Hub", f:11, st:"complete", req:0, dist:0, completed:"2026-01-15" },

  // Fund 12
  "1200006": { t:"CASIA Cardano Asia TikTok+YouTube", f:12, st:"complete", req:0, dist:0, completed:"2025-06-15" },

  // Fund 13
  "1300036": { t:"Cardano Builder Fest Asia", f:13, st:"complete", req:0, dist:0, completed:"2025-06-15" },
  "1300173": { t:"SPO JAPAN GUILD F13", f:13, st:"complete", req:0, dist:0, completed:"2026-04-15" },

  // Fund 14
  "1400028": { t:"Cardano Japan Hub Restart", f:14, st:"complete", req:0, dist:0, completed:"2026-04-15" },
  "1400015": { t:"Bright Future Ethio Japan HS", f:14, st:"dnf", req:17540, dist:0, completed:"2026-01-15" },

  // ── Added 2026-05-16: matched via projectcatalyst.io GraphQL API ──
  // _lid = local proposal id (explicit binding to prevent spurious fuzzy matches)
  // Fund 2
  "57545":  { t:"Ouroboros over RINA", f:2, st:"complete", req:10700, dist:10700, completed:"2021-04-15", _lid:"dt-14" },

  // Fund 6
  "58703":  { t:"DID Solutions for Local Governments", f:6, st:"complete", req:10000, dist:10000, completed:"2022-07-15", _lid:"is-6" },
  "59054":  { t:"CPU/IOT development for fact data", f:6, st:"complete", req:80000, dist:80000, completed:"2023-08-15", _lid:"dt-11" },

  // Fund 7
  "61157":  { t:"Hardware wallet site / 10meetup JP", f:7, st:"complete", req:2000, dist:2000, completed:"2022-07-15", _lid:"co-18" },
  "60737":  { t:"Raspberry /SPO Project", f:7, st:"complete", req:100000, dist:100000, completed:"2022-12-15", _lid:"dt-12" },
  "60830":  { t:"Tokyo Cardano Summit", f:7, st:"complete", req:25000, dist:25000, completed:"2023-04-15", _lid:"em-9" },
  "60532":  { t:"Product Exhibition from Shikoku", f:7, st:"complete", req:5000, dist:5000, completed:"2023-12-15", _lid:"co-14" },
  "60537":  { t:"On line local Area shopping by ADA", f:7, st:"complete", req:5000, dist:5000, completed:"2023-12-15", _lid:"rw-11" },

  // Fund 8
  "62446":  { t:"Music live NFT platform", f:8, st:"complete", req:100000, dist:100000, completed:"2022-12-15", _lid:"rw-12" },
  "62447":  { t:"Sustainable Apparel Trace demo", f:8, st:"complete", req:100000, dist:100000, completed:"2022-12-15", _lid:"su-4" },
  "62448":  { t:"MetaDID experiment x Aizu Lab", f:8, st:"complete", req:50000, dist:50000, completed:"2023-02-15", _lid:"is-3" },
  "61971":  { t:"AtalaPRISM hackathon with devillage", f:8, st:"complete", req:100000, dist:100000, completed:"2023-05-15", _lid:"em-4" },
  "62487":  { t:"dRep's Code of Ethics+Bridges Asia", f:8, st:"complete", req:3800, dist:3800, completed:"2023-05-15", _lid:"gv-3" },
  "62699":  { t:"Onboarding East Asia Today F8", f:8, st:"complete", req:17000, dist:17000, completed:"2023-07-15", _lid:"co-8" },
  "62007":  { t:"Expands to 1000cities JP[PointSyst]", f:8, st:"complete", req:100000, dist:100000, completed:"2023-11-15", _lid:"co-16" },
  "62463":  { t:"Cotalker integration", f:8, st:"complete", req:100000, dist:100000, completed:"2023-11-15", _lid:"io-1" },
  "62466":  { t:"Farming incentive to move liquidity", f:8, st:"complete", req:90000, dist:90000, completed:"2023-12-15", _lid:"df-1" },
  "62465":  { t:"Bridge liquidity for top protocols", f:8, st:"complete", req:90000, dist:90000, completed:"2023-12-15", _lid:"df-5" },
  "62462":  { t:"Layer 3 scalability using zkRollups", f:8, st:"complete", req:75000, dist:75000, completed:"2024-06-15", _lid:"dt-15" },
  "62850":  { t:"DID Business Ideas Hackathon", f:8, st:"complete", req:30000, dist:30000, completed:"2024-12-15", _lid:"em-8" },

  // Fund 9
  "64241":  { t:"Rust SDK fix critical CBOR encoding", f:9, st:"complete", req:50000, dist:50000, completed:"2023-04-15", _lid:"dt-5" },
  "64690":  { t:"Oura v2 (db-sync replacement)", f:9, st:"complete", req:35000, dist:35000, completed:"2023-04-15", _lid:"dt-7" },
  "63826":  { t:"Recognize Impact through DIDs", f:9, st:"complete", req:69000, dist:69000, completed:"2023-05-15", _lid:"is-8" },
  "63932":  { t:"Decentralized Escrow for Remote Job", f:9, st:"complete", req:54400, dist:54400, completed:"2023-06-15", _lid:"df-3" },
  "64049":  { t:"Connecting Asian Voter and Proposer", f:9, st:"complete", req:15000, dist:15000, completed:"2023-07-15", _lid:"co-9" },
  "64052":  { t:"Onboarding East Asia Today F9", f:9, st:"complete", req:15000, dist:15000, completed:"2023-07-15", _lid:"co-17" },
  "64240":  { t:"Fast reindexable data format", f:9, st:"complete", req:50000, dist:50000, completed:"2023-11-15", _lid:"dt-10" },

  // ── Round 2: found via cross-fund search (proposals were in different funds than local FUND_MAP) ──
  // co-7,co-23,co-19,dt-13,dt-20,df-7,df-8,gv-2 — local FUND_MAP differs from actual Catalyst fund
  "58936":  { t:"Scale up Cardano by JPN Publication", f:6, st:"complete", req:9900,   dist:9900,   completed:"2023-12-15", _lid:"co-23" },
  "60551":  { t:"JP-Regional Revitalization Project",  f:7, st:"complete", req:10000,  dist:10000,  completed:"2023-12-15", _lid:"co-19" },
  "61159":  { t:"Introducing 100 Cardano Defi in JP",  f:7, st:"complete", req:1500,   dist:1500,   completed:"2022-07-15", _lid:"df-8" },
  "62008":  { t:"Expands to 1000cities in JP[APP]",    f:8, st:"complete", req:50000,  dist:50000,  completed:"2023-11-15", _lid:"co-7" },
  "62457":  { t:"Cardano Rust SDK Babbage",            f:8, st:"complete", req:30000,  dist:30000,  completed:"2022-08-15", _lid:"dt-20" },
  "62459":  { t:"Gnosis Safe UI",                      f:8, st:"complete", req:30000,  dist:30000,  completed:"2022-09-15", _lid:"dt-13" },
  "62474":  { t:"Chamber of Digital Commerce",         f:8, st:"complete", req:30000,  dist:30000,  completed:"2023-05-15", _lid:"gv-2" },
  "62894":  { t:"Self-hosted pricefeed for wallets",   f:8, st:"complete", req:45000,  dist:45000,  completed:"2023-06-15", _lid:"df-7" },

  // ── Round 3: status-mismatch proposals (local says progress/dnf, actually completed) ──
  "64138":  { t:"Scoring Social/Environmental Impact", f:9, st:"complete", req:48400,  dist:48400,  completed:"2023-06-15", _lid:"df-9" },
  "62454":  { t:"DeFi hackathon",                      f:8, st:"complete", req:40000,  dist:40000,  completed:"2025-09-15", _lid:"em-7" },
  "64247":  { t:"Milkomeda accelerator batch #3",      f:9, st:"complete", req:120000, dist:120000, completed:"2025-09-15", _lid:"rw-5" },
  "62464":  { t:"Milkomeda Hackathon",                 f:8, st:"complete", req:45000,  dist:45000,  completed:"2025-09-15", _lid:"em-11" },
  "64337":  { t:"Quality Assurance of Organic Foods",  f:9, st:"complete", req:10500,  dist:10500,  completed:"2025-09-15", _lid:"su-2" },
  "64111":  { t:"Sustainable Coffee to Earn",          f:9, st:"complete", req:50000,  dist:50000,  completed:"2025-09-15", _lid:"su-3" }
};
