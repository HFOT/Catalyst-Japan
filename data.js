/* Catalyst Japan — Shared data module
   Used by both index.html (PC) and mobile.html (mobile).
   Sets window.CJ_DATA with all proposal/sector/proposer data.
   ================================================================ */
(function(){
'use strict';
var ADA_USD=0.75, USD_JPY=150;

var INDUSTRIES=[
  {id:'community',label:'Community & Outreach',ja:'コミュニティ & アウトリーチ',hue:200,children:[
    {id:'co-1',label:'AI chat platform with Fujitsu',amt:600,u:'ada',st:'progress',ch:'Cardano Use Cases'},
    {id:'co-2',label:'Web3 Blockchain Center Tokushima',amt:240,u:'ada',st:'complete',ch:'Development & Infrastructure'},
    {id:'co-3',label:'Onboard Japanese Big IP holders',amt:291,u:'ada',st:'progress',ch:'Developer Ecosystem'},
    {id:'co-4',label:'SPO JAPAN GUILD',amt:253,u:'ada',st:'complete',ch:'SPO Tools & Community'},
    {id:'co-5',label:'Cardano PR Initiative Japan',amt:36,u:'usd',st:'complete',ch:'Miscellaneous Challenge'},
    {id:'co-6',label:'PAB promotion in Japan',amt:5,u:'usd',st:'complete',ch:'Connecting Japan'},
    {id:'co-7',label:'Expands to 1000cities in JP [APP]',amt:50,u:'usd',st:'complete',ch:'Grow East Asia'},
    {id:'co-8',label:'Onboarding East Asia Today',amt:17,u:'usd',st:'complete',ch:'Grow East Asia'},
    {id:'co-9',label:'Connecting Asian Voter and Proposer',amt:15,u:'usd',st:'complete',ch:'New Member Onboarding'},
    {id:'co-10',label:'ADA Adoption with Ashiya Pool',amt:32,u:'ada',st:'progress',ch:'Cardano Open: Ecosystem'},
    {id:'co-11',label:'Cardano Information Center Japan',amt:200,u:'ada',st:'complete',ch:'Cardano Open: Ecosystem'},
    {id:'co-12',label:'Japanese LLC DAO (1M people)',amt:100,u:'ada',st:'progress',ch:'Cardano Open: Ecosystem'},
    {id:'co-13',label:'Catalyst survey in Japan',amt:75,u:'ada',st:'complete',ch:'Catalyst Open'},
    {id:'co-14',label:'Product Exhibition from Shikoku',amt:5,u:'usd',st:'complete',ch:'Connecting Japan'},
    {id:'co-15',label:'Project Support Stake pool JP',amt:6,u:'usd',st:'complete',ch:'Scale-UP Community Hubs'},
    {id:'co-16',label:'Expands to 1000cities JP [PointSyst]',amt:100,u:'usd',st:'complete',ch:'Business Solutions'},
    {id:'co-17',label:'Onboarding East Asia Today (2)',amt:15,u:'usd',st:'complete',ch:'New Member Onboarding'},
    {id:'co-18',label:'Hardware wallet site / 10meetup JP',amt:2,u:'usd',st:'complete',ch:'Scale-UP Community Hubs'},
    {id:'co-19',label:'JP-Regional Revitalization Project',amt:10,u:'usd',st:'complete',ch:'Scale-UP Community Hubs'},
    {id:'co-20',label:'Fostering Japanese young proposers',amt:6.37,u:'usd',st:'complete',ch:'Proposer outreach'},
    {id:'co-21',label:'Cardano Builder Asia Network',amt:100,u:'ada',st:'progress',ch:'Community & Cardano'},
    {id:'co-22',label:'Promotion of Japanese Cardano Products',amt:200,u:'ada',st:'progress',ch:'Cardano Open: Ecosystem'},
    {id:'co-23',label:'Scale up Cardano by JPN Publication',amt:9.9,u:'usd',st:'complete',ch:'Scale-UP Community Hubs'}
  ]},
  {id:'devtools',label:'Development & Tools',ja:'開発 & ツール',hue:260,children:[
    {id:'dt-1',label:'All-in-one crypto accounting system',amt:155,u:'ada',st:'progress',ch:'Cardano Use Cases: MVP'},
    {id:'dt-2',label:'Milkomeda accelerator batch #2',amt:75,u:'usd',st:'complete',ch:'The Great Migration'},
    {id:'dt-3',label:'ERC721 & ERC-1155 for Milkomeda',amt:20,u:'usd',st:'complete',ch:'Cross-Chain Collaboration'},
    {id:'dt-4',label:'Milkomeda Mobile',amt:25,u:'usd',st:'complete',ch:'DApps and Integrations'},
    {id:'dt-5',label:'Rust SDK fix critical CBOR encoding',amt:50,u:'usd',st:'complete',ch:'Developer Ecosystem'},
    {id:'dt-6',label:'Milkomeda docker fullnode setup',amt:15,u:'usd',st:'complete',ch:'Open Source Dev Ecosystem'},
    {id:'dt-7',label:'db-sync replacement in Oura',amt:35,u:'usd',st:'complete',ch:'Open Source Dev Ecosystem'},
    {id:'dt-8',label:'Social platform blockchain auth (offline)',amt:300,u:'ada',st:'progress',ch:'Cardano Use Cases: MVP'},
    {id:'dt-9',label:'Atala Tech Deployment Blueprint',amt:550,u:'ada',st:'complete',ch:'Atala PRISM'},
    {id:'dt-10',label:'Fast reindexable data format',amt:50,u:'usd',st:'complete',ch:'Developer Ecosystem'},
    {id:'dt-11',label:'CPU/IOT development for fact data',amt:80,u:'usd',st:'complete',ch:'Developer Ecosystem'},
    {id:'dt-12',label:'Raspberry / SPO Project',amt:100,u:'usd',st:'complete',ch:'New SPO Business'},
    {id:'dt-13',label:'Gnosis Safe UI',amt:30,u:'usd',st:'complete',ch:'Open Source Dev Ecosystem'},
    {id:'dt-14',label:'Ouroboros over RINA',amt:10.7,u:'usd',st:'complete',ch:'Challenge'},
    {id:'dt-15',label:'Layer 3 scalability zkRollups',amt:75,u:'usd',st:'complete',ch:'Cardano scaling'},
    {id:'dt-16',label:'Fracada Addressing Audit',amt:15,u:'usd',st:'complete',ch:'Dapps & Integrations'},
    {id:'dt-17',label:'CIP Editor time (Sebastien)',amt:20,u:'usd',st:'complete',ch:'Open Standards'},
    {id:'dt-18',label:'TheGraph in Milkomeda',amt:20,u:'usd',st:'complete',ch:'DApps and Integrations'},
    {id:'dt-19',label:'App store for Milkomeda',amt:20,u:'usd',st:'complete',ch:'Developer Ecosystem'},
    {id:'dt-20',label:'Cardano Rust SDK Babbage',amt:30,u:'usd',st:'complete',ch:'Open Source Dev Ecosystem'},
    {id:'dt-21',label:'Smart Contract Library for Midnight',amt:200,u:'ada',st:'progress',ch:'Developer Ecosystem'}
  ]},
  {id:'events',label:'Events & Marketing',ja:'イベント & マーケティング',hue:330,children:[
    {id:'em-1',label:'Cardano Japan Hub Restart',amt:50.6,u:'ada',st:'complete',ch:'Cardano Open: Ecosystem'},
    {id:'em-2',label:'Organising events Japan (news)',amt:100,u:'ada',st:'progress',ch:'Cardano Open: Ecosystem'},
    {id:'em-3',label:'Exhibit Largest Blockchain EXPO (JP)',amt:267,u:'ada',st:'complete',ch:'Developer Ecosystem'},
    {id:'em-4',label:'AtalaPRISM hackathon × devillage',amt:100,u:'usd',st:'complete',ch:'Accelerate DID'},
    {id:'em-5',label:'Exhibit Largest BlockChainEXPO (JP) F3',amt:7.25,u:'usd',st:'complete',ch:'Scale-UP Community Hubs'},
    {id:'em-6',label:'Token use case Multi Address wallet eUTXO',amt:85,u:'ada',st:'complete',ch:'Cardano Use Cases'},
    {id:'em-7',label:'DeFi hackathon',amt:40,u:'usd',st:'dnf',ch:'DApps and Integrations'},
    {id:'em-8',label:'DID Business Ideas Hackathon',amt:30,u:'usd',st:'complete',ch:'Grow East Asia'},
    {id:'em-9',label:'Tokyo Cardano Summit',amt:25,u:'usd',st:'complete',ch:'Connecting Japan'},
    {id:'em-10',label:'Cardano SPT (Special Promo Taskforce)',amt:100,u:'ada',st:'complete',ch:'Cardano Open: Ecosystem'},
    {id:'em-11',label:'Milkomeda Hackathon',amt:45,u:'usd',st:'dnf',ch:'Miscellaneous Challenge'},
    {id:'em-12',label:'Exhibit Largest BlockChainEXPO (JP) 2022',amt:80,u:'usd',st:'complete',ch:'Scale-UP Community Hubs'},
    {id:'em-13',label:'Exhibit Largest BlockChainEXPO (JP) 2021',amt:80,u:'usd',st:'complete',ch:'Scale-UP Community Hubs'},
    {id:'em-14',label:'Cardano Summits in Japan',amt:198,u:'ada',st:'complete',ch:'Community & Cardano'},
    {id:'em-15',label:'Tech for Impact Summit 2025',amt:100,u:'ada',st:'complete',ch:'Community & Cardano'},
    {id:'em-16',label:'Cardano Builder Fest Asia',amt:99,u:'ada',st:'complete',ch:'Community & Cardano'},
    {id:'em-17',label:'Cardano at SusHiTech Tokyo',amt:60,u:'ada',st:'progress',ch:'Community & Cardano'}
  ]},
  {id:'identity',label:'Identity & Security',ja:'アイデンティティ & セキュリティ',hue:165,children:[
    {id:'is-1',label:'Token-Incentivized Mental Health DID',amt:100,u:'ada',st:'progress',ch:'Cardano Use Cases'},
    {id:'is-2',label:'Socious: Verifiable Credentials',amt:354,u:'ada',st:'complete',ch:'Atala PRISM'},
    {id:'is-3',label:'MetaDID experiment × Aizu Lab',amt:50,u:'usd',st:'complete',ch:'Accelerate DID'},
    {id:'is-4',label:'Enterprise DID Solution',amt:978,u:'ada',st:'complete',ch:'Atala PRISM'},
    {id:'is-5',label:'Atala Integration with Milkomeda',amt:46.1,u:'usd',st:'complete',ch:'Dapps & Integrations'},
    {id:'is-6',label:'DID Solutions for Local Governments',amt:10,u:'usd',st:'complete',ch:'Atala PRISM DID'},
    {id:'is-7',label:'Grow AtalaPrism SDK',amt:74.8,u:'ada',st:'complete',ch:'Cardano Open: Developers'},
    {id:'is-8',label:'Recognize Impact through DIDs',amt:69,u:'usd',st:'complete',ch:'Dapps & Integrations'},
    {id:'is-9',label:'Japanese FUD / SCAM Buster 100',amt:1.5,u:'usd',st:'complete',ch:'Disarm cyber disinfo'},
    {id:'is-10',label:'Work History as Verifiable Credentials',amt:354,u:'ada',st:'complete',ch:'Atala PRISM'},
    {id:'is-11',label:'Identity Wallet for Atala PRISM 2.0',amt:315,u:'ada',st:'complete',ch:'Atala PRISM'},
    {id:'is-12',label:'Atala Wallet SDK Mass Adoption',amt:489,u:'ada',st:'complete',ch:'Atala PRISM'}
  ]},
  {id:'defi',label:'DeFi',ja:'DeFi',hue:150,children:[
    {id:'df-1',label:'Farming incentive to move liquidity',amt:90,u:'usd',st:'complete',ch:'The Great Migration'},
    {id:'df-2',label:'Liquid staking for Milkomeda / L2s',amt:100,u:'usd',st:'complete',ch:'Dapps & Integrations'},
    {id:'df-3',label:'Decentralized Escrow for Remote Job',amt:54.4,u:'usd',st:'complete',ch:'Developer Ecosystem'},
    {id:'df-4',label:'Milkomeda Djed',amt:40,u:'usd',st:'complete',ch:'Dapps & Integrations'},
    {id:'df-5',label:'Bridge liquidity for top protocols',amt:90,u:'usd',st:'complete',ch:'The Great Migration'},
    {id:'df-6',label:'Impact lending for the unbanked',amt:63.6,u:'usd',st:'complete',ch:'Dapps & Integrations'},
    {id:'df-7',label:'Self-hosted pricefeed for wallets',amt:45,u:'usd',st:'complete',ch:'DApps and Integrations'},
    {id:'df-8',label:'Introducing 100 Cardano Defi in JP',amt:1.5,u:'usd',st:'complete',ch:'Scale-UP Community Hubs'},
    {id:'df-9',label:'Scoring Social/Environmental Impact',amt:48.4,u:'usd',st:'progress',ch:'Dapps & Integrations'},
    {id:'df-10',label:'Decentralized Escrow & Dispute Resolution',amt:316,u:'ada',st:'complete',ch:'Dapps & Integrations'}
  ]},
  {id:'education',label:'Education',ja:'教育',hue:45,children:[
    {id:'ed-1',label:'Enhancing L-Earning Bazaar Platform',amt:244,u:'ada',st:'progress',ch:'Cardano Use Cases'},
    {id:'ed-2',label:'Cardano For the M₳sses — Japanese Book',amt:74.7,u:'ada',st:'complete',ch:'Catalyst Open'},
    {id:'ed-3',label:'L-Earning Bazaar: Platform Building',amt:80,u:'usd',st:'complete',ch:'Dapps & Integrations'},
    {id:'ed-4',label:'Cardano Bridges in Japanese',amt:5.8,u:'usd',st:'complete',ch:'Grow East Asia'},
    {id:'ed-5',label:'Japanese Cardano Master Class',amt:10,u:'usd',st:'complete',ch:'Film + Media'},
    {id:'ed-6',label:'SJG TOOLS V2 — Stake Pool TUI Tool',amt:218,u:'ada',st:'complete',ch:'SPO Tools & Community'},
    {id:'ed-7',label:'L-Earning Bazaar: Web3 Integration',amt:80,u:'usd',st:'complete',ch:'Dapps & Integrations'},
    {id:'ed-8',label:'Cardano Start Guide',amt:9.6,u:'usd',st:'dnf',ch:'Dapps & Integrations'},
    {id:'ed-9',label:'Atala Japanese Translation & CNFT',amt:50,u:'usd',st:'complete',ch:'Accelerate DID'},
    {id:'ed-10',label:'Impact Accounting Project-Based Learning',amt:100,u:'ada',st:'complete',ch:'Developer Ecosystem'},
    {id:'ed-11',label:'Crypto Magazine by Futaba-Sha',amt:250,u:'ada',st:'complete',ch:'Developer Ecosystem'}
  ]},
  {id:'governance',label:'Governance',ja:'ガバナンス',hue:40,children:[
    {id:'gv-1',label:'Policy advocacy for DAO ecosystem',amt:200,u:'ada',st:'complete',ch:'Cardano Open: Ecosystem'},
    {id:'gv-2',label:'Chamber of Digital Commerce',amt:30,u:'usd',st:'complete',ch:'Lobbying for legislation'},
    {id:'gv-3',label:"dRep's Code of Ethics + Bridges Asia",amt:3.8,u:'usd',st:'complete',ch:'Community Advisor'},
    {id:'gv-4',label:'Socious: Decentralized Referral DAO',amt:346,u:'ada',st:'complete',ch:'DAOs ❤ Cardano'},
    {id:'gv-5',label:'Survey + Lobbying of Japanese Law',amt:3,u:'usd',st:'complete',ch:'Lobbying for legislation'},
    {id:'gv-6',label:'Extended Quadratic Funding (F10)',amt:496,u:'ada',st:'complete',ch:'Dapps & Integrations'},
    {id:'gv-7',label:'Extended Quadratic Funding (F11)',amt:98,u:'ada',st:'complete',ch:'Open Source'},
    {id:'gv-8',label:'Extended Quadratic Funding (F13)',amt:496,u:'ada',st:'complete',ch:'Open Source'}
  ]},
  {id:'realworld',label:'Real World Applications',ja:'リアルワールド応用',hue:20,children:[
    {id:'rw-1',label:"Lock'n': Hydra L2 IoT (GachaGacha)",amt:300,u:'ada',st:'progress',ch:'Cardano Use Cases'},
    {id:'rw-2',label:'IPDC Blockchain via Broadcasting Waves',amt:100,u:'ada',st:'progress',ch:'Cardano Use Cases'},
    {id:'rw-3',label:'AIRA: Hydra Loyalty Regional Revitalization',amt:698,u:'ada',st:'dnf',ch:'Cardano Use Cases'},
    {id:'rw-4',label:'Cardano RWA Launch Pad',amt:299,u:'ada',st:'progress',ch:'Cardano Use Cases'},
    {id:'rw-5',label:'Milkomeda Accelerator batch #3',amt:120,u:'usd',st:'dnf',ch:'The Great Migration'},
    {id:'rw-6',label:'WalletConnect for Cardano',amt:200,u:'usd',st:'complete',ch:'Dapps & Integrations'},
    {id:'rw-7',label:'MIRAI Memories Bank — Project Echoes',amt:98.5,u:'ada',st:'progress',ch:'Cardano Use Cases'},
    {id:'rw-8',label:'Winter Protocol: Traceability & RWA',amt:200,u:'ada',st:'complete',ch:'Developer Ecosystem'},
    {id:'rw-9',label:'Social implementation Shikoku region',amt:2000,u:'ada',st:'progress',ch:'Cardano Partners'},
    {id:'rw-10',label:'Vacancy to Vitality: DAO & RWAs Homes',amt:190,u:'ada',st:'progress',ch:'Cardano Use Cases: MVP'},
    {id:'rw-11',label:'Online local area shopping by ADA',amt:5,u:'usd',st:'complete',ch:'Connecting Japan'},
    {id:'rw-12',label:'Music live NFT platform',amt:100,u:'usd',st:'complete',ch:'DApps and Integrations'}
  ]},
  {id:'interop',label:'Interoperability',ja:'相互運用性',hue:220,children:[
    {id:'io-1',label:'Cotalker integration',amt:100,u:'usd',st:'complete',ch:'Business Solutions'},
    {id:'io-2',label:'Create message signing standard',amt:0.535,u:'usd',st:'complete',ch:'Challenge'},
    {id:'io-3',label:'Milkomeda token bridge explorer',amt:50,u:'usd',st:'complete',ch:'Developer Ecosystem'}
  ]},
  {id:'gamefi',label:'GameFi',ja:'GameFi',hue:305,children:[
    {id:'gf-1',label:'Sports Crowdfunding Funclub app',amt:380,u:'ada',st:'complete',ch:'Products & Integrations'},
    {id:'gf-2',label:'Milkomeda Game',amt:40,u:'usd',st:'complete',ch:'DApps and Integrations'},
    {id:'gf-3',label:'Milkomeda Game #2',amt:80,u:'usd',st:'complete',ch:'Dapps & Integrations'}
  ]},
  {id:'nft',label:'NFT',ja:'NFT',hue:280,children:[
    {id:'nf-1',label:'Legendary Humanity: Fashion Platform',amt:298,u:'ada',st:'progress',ch:'Cardano Use Cases'},
    {id:'nf-2',label:'cNFTs as admission tickets',amt:41.2,u:'ada',st:'dnf',ch:'Cardano Use Cases'},
    {id:'nf-3',label:'Japanese Traditional Crafts NFT',amt:51,u:'usd',st:'complete',ch:'Dapps & Integrations'},
    {id:'nf-4',label:'Masu Photo Project: CNFT Art',amt:200,u:'ada',st:'progress',ch:'Cardano Open: Ecosystem'},
    {id:'nf-5',label:'SHIBUYA FES 428FES CNFT Exhibition',amt:73.7,u:'ada',st:'complete',ch:'Cardano Open: Ecosystem'}
  ]},
  {id:'sustainability',label:'Sustainability',ja:'サステナビリティ',hue:120,children:[
    {id:'su-1',label:'Shrine Stamp NFT Tokushima',amt:235,u:'ada',st:'progress',ch:'Cardano Use Cases'},
    {id:'su-2',label:'Quality Assurance of Organic Foods',amt:10.5,u:'usd',st:'dnf',ch:'Grow East Asia'},
    {id:'su-3',label:'Sustainable Coffee to Earn',amt:50,u:'usd',st:'dnf',ch:'Grow Africa'},
    {id:'su-4',label:'Sustainable Apparel Trace demo',amt:100,u:'usd',st:'complete',ch:'DApps and Integrations'}
  ]},
  {id:'smartcontract',label:'Smart Contracts',ja:'スマートコントラクト',hue:240,children:[
    {id:'sc-1',label:'Solve asset fractionalization',amt:90,u:'usd',st:'complete',ch:'Cross-Chain Collaboration'}
  ]}
];

var JA_LABELS={
  'co-1':'富士通とのAIチャットプラットフォーム','co-2':'Web3ブロックチェーンセンター徳島',
  'co-3':'日本の大手IP保有者オンボーディング','co-4':'SPOジャパンギルド',
  'co-5':'Cardano PRイニシアチブ日本','co-6':'PABの日本プロモーション',
  'co-7':'日本1000都市展開 [アプリ]','co-8':'東アジアオンボーディング',
  'co-9':'アジアの有権者と提案者を繋ぐ','co-10':'芦屋プールによるADA普及',
  'co-11':'Cardano情報センター日本','co-12':'日本合同会社DAO（100万人）',
  'co-13':'日本のCatalyst調査','co-14':'四国からの製品展示会',
  'co-15':'ステークプール支援プロジェクトJP','co-16':'日本1000都市展開 [ポイントシステム]',
  'co-17':'東アジアオンボーディング (2)','co-18':'ハードウェアウォレットサイト / 10ミートアップJP',
  'co-19':'日本・地域活性化プロジェクト','co-20':'日本の若手提案者育成',
  'co-21':'Cardanoビルダー・アジアネットワーク','co-22':'日本のCardano製品プロモーション',
  'co-23':'日本メディアによるCardano拡大',
  'dt-1':'統合型暗号資産会計システム','dt-2':'Milkomedaアクセラレーター第2期',
  'dt-3':'Milkomeda向けERC721 & ERC-1155','dt-4':'Milkomedaモバイル',
  'dt-5':'Rust SDK重大CBORエンコーディング修正','dt-6':'Milkomeda Dockerフルノードセットアップ',
  'dt-7':'Ouraによるdb-sync代替','dt-8':'SNSブロックチェーン認証（オフライン）',
  'dt-9':'Atala技術展開ブループリント','dt-10':'高速再インデックスデータ形式',
  'dt-11':'CPU/IoTファクトデータ開発','dt-12':'ラズベリーパイ / SPOプロジェクト',
  'dt-13':'Gnosis Safe UI','dt-14':'RINA上のOuroboros',
  'dt-15':'レイヤー3スケーラビリティ zkRollups','dt-16':'Fracadaアドレッシング監査',
  'dt-17':'CIPエディター業務（Sebastien）','dt-18':'Milkomeda上のTheGraph',
  'dt-19':'Milkomeda向けアプリストア','dt-20':'Cardano Rust SDK Babbage対応',
  'dt-21':'Midnight向けスマートコントラクトライブラリ',
  'em-1':'Cardanoジャパンハブ再始動','em-2':'日本でのイベント開催（ニュース）',
  'em-3':'日本最大ブロックチェーンEXPO出展','em-4':'AtalaPRISMハッカソン × devillage',
  'em-5':'日本最大ブロックチェーンEXPO出展 F3','em-6':'トークンユースケース マルチアドレスウォレット eUTXO',
  'em-7':'DeFiハッカソン','em-8':'DIDビジネスアイデアハッカソン',
  'em-9':'東京カルダノサミット','em-10':'Cardano SPT（特別プロモタスクフォース）',
  'em-11':'Milkomedaハッカソン','em-12':'日本最大ブロックチェーンEXPO出展 2022',
  'em-13':'日本最大ブロックチェーンEXPO出展 2021','em-14':'日本のカルダノサミット',
  'em-15':'テック・フォー・インパクトサミット 2025','em-16':'Cardanoビルダーフェスト・アジア',
  'em-17':'SusHiTech東京でのCardano',
  'is-1':'トークンインセンティブ型メンタルヘルスDID','is-2':'Socious: 検証可能な資格証明',
  'is-3':'MetaDID実験 × 会津ラボ','is-4':'エンタープライズDIDソリューション',
  'is-5':'AtalaとMilkomedaの統合','is-6':'自治体向けDIDソリューション',
  'is-7':'AtalaPrism SDK拡張','is-8':'DIDによるインパクト認証',
  'is-9':'日本のFUD/詐欺バスター100','is-10':'職歴の検証可能な資格証明化',
  'is-11':'Atala PRISM 2.0用IDウォレット','is-12':'Atalaウォレット SDK大規模普及',
  'df-1':'流動性移行のファーミングインセンティブ','df-2':'Milkomeda/L2向けリキッドステーキング',
  'df-3':'リモートワーク向け分散型エスクロー','df-4':'Milkomeda Djed',
  'df-5':'主要プロトコル向けブリッジ流動性','df-6':'銀行口座を持たない人向けインパクト融資',
  'df-7':'ウォレット用セルフホスト価格フィード','df-8':'日本で100のCardano DeFiを紹介',
  'df-9':'社会/環境インパクトスコアリング','df-10':'分散型エスクロー＆紛争解決',
  'ed-1':'L-Earning Bazaarプラットフォーム強化','ed-2':'Cardano For the M₳sses — 日本語版',
  'ed-3':'L-Earning Bazaar: プラットフォーム構築','ed-4':'Cardano Bridges 日本語版',
  'ed-5':'日本語Cardanoマスタークラス','ed-6':'SJG TOOLS V2 — ステークプールTUIツール',
  'ed-7':'L-Earning Bazaar: Web3統合','ed-8':'Cardanoスタートガイド',
  'ed-9':'Atala日本語翻訳 & CNFT','ed-10':'インパクト会計プロジェクト型学習',
  'ed-11':'双葉社による暗号資産マガジン',
  'gv-1':'DAOエコシステムの政策提言','gv-2':'デジタルコマース会議所',
  'gv-3':'dRepの倫理規定 + ブリッジズアジア','gv-4':'Socious: 分散型リファラルDAO',
  'gv-5':'日本法調査 + ロビー活動','gv-6':'拡張二次資金調達 (F10)',
  'gv-7':'拡張二次資金調達 (F11)','gv-8':'拡張二次資金調達 (F13)',
  'rw-1':"Lock'n': Hydra L2 IoT（ガチャガチャ）",'rw-2':'放送波によるIPDCブロックチェーン',
  'rw-3':'AIRA: Hydraロイヤルティ地域活性化','rw-4':'Cardano RWAローンチパッド',
  'rw-5':'Milkomedaアクセラレーター第3期','rw-6':'Cardano向けWalletConnect',
  'rw-7':'MIRAIメモリーズバンク — プロジェクトエコーズ','rw-8':'ウィンタープロトコル: トレーサビリティ & RWA',
  'rw-9':'四国地域の社会実装','rw-10':'空き家を活力へ: DAO & RWA住宅',
  'rw-11':'ADAによるオンライン地域ショッピング','rw-12':'音楽ライブNFTプラットフォーム',
  'io-1':'Cotalker統合','io-2':'メッセージ署名標準の策定',
  'io-3':'Milkomedaトークンブリッジエクスプローラー',
  'gf-1':'スポーツクラウドファンディング ファンクラブアプリ','gf-2':'Milkomedaゲーム','gf-3':'Milkomedaゲーム #2',
  'nf-1':'レジェンダリー・ヒューマニティ: ファッションプラットフォーム','nf-2':'cNFTによる入場チケット',
  'nf-3':'日本伝統工芸NFT','nf-4':'マスフォトプロジェクト: CNFTアート',
  'nf-5':'渋谷フェス 428FES CNFT展示',
  'su-1':'御朱印NFT 徳島','su-2':'有機食品の品質保証',
  'su-3':'サステナブルコーヒー・トゥ・アーン','su-4':'サステナブルアパレル追跡デモ',
  'sc-1':'資産分割化の解決'
};

var PROPOSERS={
  'co-1':'Yohei Iwasaki','co-2':'MakotoHarada','co-3':'Yuri Kuriyama','co-4':'BTBF',
  'co-5':'FTanaka','co-6':'ranket','co-7':'Symons Corp','co-8':'Eastern Townhall (Yuta)',
  'co-9':'Eastern Townhall (Yuta)','co-10':'Mallen Chiyari','co-11':'Takatoshi Ohata',
  'co-12':'Kotaro Motoshima','co-13':{name:'ranket',role:'提案者'},'co-14':'MakotoHarada',
  'co-15':'ranket','co-16':'Symons Corp','co-17':'Eastern Townhall (Yuta)','co-18':'yutazzz',
  'co-19':'MakotoHarada','co-20':'ISSA',
  'dt-1':'Kenta Takase','dt-2':'dcSpark','dt-3':'dcSpark','dt-4':'dcSpark','dt-5':'dcSpark',
  'dt-6':'dcSpark','dt-7':'TxPipe','dt-8':'Jun Hamada','dt-9':'zenGate Global','dt-10':'TxPipe',
  'dt-11':'Osamu Takahashi','dt-12':'Dow','dt-13':'dcSpark','dt-14':'jason.clark.durham',
  'dt-15':'dcSpark','dt-16':'dcSpark','dt-17':'Sebastien Guillemot','dt-18':'dcSpark',
  'dt-19':'dcSpark','dt-20':'dcSpark',
  'em-1':'Pacific Meta','em-2':'Hiroto Harada','em-3':'Shusuke Wakuda','em-4':'Drew Wallin',
  'em-5':'Shusuke Wakuda','em-6':'Mineko Enomoto','em-7':'dcSpark','em-8':'Metafrontier.inc',
  'em-9':'dispatching','em-10':'Toshitaka Ueda','em-11':'dcSpark','em-12':'Shusuke Wakuda',
  'em-13':'Shusuke Wakuda',
  'is-1':'Mineko Enomoto','is-2':'Seira Yun (Socious)','is-3':{name:'ranket',role:'共同提案'},
  'is-4':'zenGate Global','is-5':'Seira Yun (Socious)','is-6':'kuni','is-7':'Ben Tairea',
  'is-8':'Seira Yun (Socious)','is-9':'yutazzz',
  'gv-1':'Kuniaki Abe','gv-2':'dcSpark','gv-3':'yutazzz','gv-4':'Seira Yun (Socious)','gv-5':'yutazzz',
  'df-1':'dcSpark','df-2':'dcSpark','df-3':'Seira Yun (Socious)','df-4':'dcSpark','df-5':'dcSpark',
  'df-6':'Seira Yun (Socious)','df-7':'TxPipe','df-8':'Eastern Townhall (Yuta)',
  'ed-1':'Yuri Kuriyama','ed-2':'yutazzz','ed-3':'Yuri Kuriyama','ed-4':'Leo King',
  'ed-5':'Joseph J','ed-6':'BTBF','ed-7':'Yuri Kuriyama','ed-8':'Leo King','ed-9':'ranket',
  'rw-1':'bypp Inc.','rw-2':'Jun Hamada','rw-3':'AIRA','rw-4':'Yuri Kuriyama','rw-5':'dcSpark',
  'rw-6':'dcSpark','rw-7':'Jun Hamada','rw-8':'zenGate Global','rw-9':'Naoki Sakata',
  'rw-10':'Chris Dai','rw-11':'MakotoHarada','rw-12':'yutazzz',
  'io-1':'dcSpark','io-2':'Sebastien Guillemot','io-3':'dcSpark',
  'gf-1':{name:'ranket',role:'提案者'},'gf-2':'dcSpark','gf-3':'dcSpark',
  'nf-1':'Yuri Kuriyama','nf-2':'Shusuke Wakuda','nf-3':'MakotoHarada',
  'nf-4':'Kei Masuo (FOMUS)','nf-5':'Yuichiro Nomoto',
  'su-1':'ranket','su-2':'ISSA','su-3':'Toshimasa Yagi','su-4':'yutazzz',
  'sc-1':'dcSpark',
  'co-21':'Seira Yun (Socious)','dt-21':'Seira Yun (Socious)',
  'em-14':'Seira Yun (Socious)','em-15':'Seira Yun (Socious)',
  'em-16':'Seira Yun (Socious)','em-17':'Seira Yun (Socious)',
  'is-10':'Seira Yun (Socious)','is-11':'Seira Yun (Socious)','is-12':'Seira Yun (Socious)',
  'df-9':'Seira Yun (Socious)','df-10':'Seira Yun (Socious)',
  'ed-10':'Seira Yun (Socious)',
  'gv-6':'Seira Yun (Socious)','gv-7':'Seira Yun (Socious)','gv-8':'Seira Yun (Socious)',
  'co-22':'ranket','co-23':'ranket','ed-11':'ranket'
};

var TEAMS={
  'co-2':['ranket:共同提案'],'co-3':['Yujin Katsuta:共同提案','jpg.store:共同提案'],
  'df-2':['Sebastien Guillemot:共同提案','nicoarqueros:共同提案'],
  'co-8':['yutazzz:運営'],'co-9':['yutazzz:運営'],
  'co-11':['ranket:共同提案'],
  'co-12':['Daisuke Miyashita:共同提案','yutazzz:共同提案','Yuri Kuriyama:共同提案'],
  'co-14':['ranket:共同提案'],'co-17':['yutazzz:運営'],'co-19':['ranket:共同提案'],
  'co-23':['yutazzz:共同提案'],
  'dt-2':['nicoarqueros:共同提案'],'dt-3':['nicoarqueros:共同提案'],
  'dt-4':['nicoarqueros:共同提案'],'dt-5':['nicoarqueros:共同提案','Sebastien Guillemot:共同提案'],
  'dt-6':['nicoarqueros:共同提案'],'dt-13':['nicoarqueros:共同提案'],
  'dt-15':['nicoarqueros:共同提案'],'dt-16':['Sebastien Guillemot:共同提案'],
  'dt-17':['nicoarqueros:共同提案','dcSpark:共同提案'],
  'dt-18':['nicoarqueros:共同提案'],'dt-19':['nicoarqueros:共同提案'],
  'dt-20':['nicoarqueros:共同提案'],
  'df-1':['nicoarqueros:共同提案'],'df-4':['nicoarqueros:共同提案','Sebastien Guillemot:共同提案'],
  'df-5':['nicoarqueros:共同提案'],
  'ed-2':['Ha Nguyen:共同提案'],
  'ed-3':['yutazzz:共同提案','Raz:共同提案','ranket:共同提案','Ryu Goto:共同提案','miyatake:共同提案','socialtaka:共同提案'],
  'ed-5':['dispatching:共同提案'],
  'ed-7':['Raz:共同提案','ranket:共同提案','yutazzz:共同提案','Ryu Goto:共同提案','socialtaka:共同提案'],
  'ed-9':['shusuke wakuda:共同提案','toshiaki.miyatake:共同提案','AKYO:共同提案','yutazzz:共同提案','kuni:共同提案','Drew Wallin:共同提案'],
  'ed-11':['yutazzz:共同提案','kazunori asahi:共同提案'],
  'em-3':['yutazzz:共同提案','kuni:共同提案','Yuri Kuriyama:共同提案','dcSpark:共同提案','Sebastien Guillemot:共同提案'],
  'em-4':['kuni:共同提案','toshiaki.miyatake:共同提案','mamimu.goo.forever:共同提案'],
  'em-5':['Yuri Kuriyama:共同提案','yutazzz:共同提案'],
  'em-9':['Joseph J:共同提案'],'em-11':['nicoarqueros:共同提案'],
  'em-12':['kuni:共同提案','Dow:共同提案','yutazzz:共同提案','ISSA:共同提案','AKYO:共同提案','Yuri Kuriyama:共同提案'],
  'em-13':['yutazzz:共同提案','Yuri Kuriyama:共同提案'],
  'em-14':['yutazzz:共同提案','zenGate Global:共同提案'],
  'em-16':['Cardano Vietnam:共同提案','Mesh JS SDK:共同提案','Cardano Builder Asia:共同提案','SIDAN Lab:共同提案'],
  'gf-1':['Akitsugu Ohno:共同提案','須ノ又 誠:共同提案'],
  'gf-2':['nicoarqueros:共同提案'],'gf-3':['nicoarqueros:共同提案','Sebastien Guillemot:共同提案'],
  'io-1':['nicoarqueros:共同提案'],'io-3':['nicoarqueros:共同提案'],
  'is-5':['dcSpark:共同提案'],'is-8':['nick:共同提案'],
  'nf-1':['masa M:共同提案'],'nf-3':['ranket:アドバイザー'],
  'nf-5':['shusuke wakuda:共同提案','Yuri Kuriyama:共同提案'],
  'rw-4':['masa M:共同提案','佐々木大輔:共同提案','オークス遥:共同提案'],
  'rw-5':['nicoarqueros:共同提案','Sebastien Guillemot:共同提案'],
  'rw-6':['nicoarqueros:共同提案','Sebastien Guillemot:共同提案'],
  'rw-9':['Yuri Kuriyama:共同提案','yutazzz:アドバイザー','Kotaro Motoshima:法務'],
  'rw-11':['ranket:共同提案'],'rw-12':['Metafrontier.inc:共同提案'],
  'su-4':['Metafrontier.inc:共同提案'],'dt-12':['Shigeo Haga:共同提案','Osamu TAKAHASHI:共同提案'],
  'ed-1':['Nicolas Ayotte:共同提案'],'em-7':['nicoarqueros:共同提案'],
  'gv-2':['nicoarqueros:共同提案'],'nf-2':['Yuri Kuriyama:共同提案','yutazzz:共同提案'],
  'rw-8':['Daniel Friedman:共同提案'],'sc-1':['nicoarqueros:共同提案','Sebastien Guillemot:共同提案'],
  'co-4':['柳原_日本壱プール:共同提案','AKYO:共同提案'],
  'co-5':['Drew Wallin:共同提案','kuni:共同提案'],
  'ed-6':['AKYO:共同提案','柳原_日本壱プール:共同提案'],
  'gv-1':['yutazzz:共同提案'],'dt-1':['nobuhisa abe:共同提案'],
  'dt-9':['darrello:共同提案','Daniel Friedman:共同提案'],
  'dt-11':['Shigeo Haga:共同提案'],'dt-8':['Hideki Takeshi:共同提案'],
  'is-6':['yutazzz:共同提案','yama:共同提案'],
  'rw-10':['kento honda:共同提案','Yi Liu:CTO','KOKO:DAO設計'],
  'co-21':['Cardano Vietnam:共同提案','SIDAN Lab:共同提案','Cardano Builder Asia:共同提案','Mesh JS SDK:共同提案'],
  'su-1':['Shakudo Yamashita:実行者'],'su-2':['平山紘昭:共同提案'],
  'is-7':['mix irving:共同提案','Engie Matene:共同提案'],
  'dt-7':['nicoarqueros:共同提案'],'dt-10':['nicoarqueros:共同提案','Sebastien Guillemot:共同提案']
};

var FUND_MAP={
  'co-1':14,'co-2':12,'co-3':12,'co-4':12,'co-5':7,'co-6':7,'co-7':7,'co-8':8,
  'co-9':9,'co-10':14,'co-11':12,'co-12':12,'co-13':12,'co-14':7,'co-15':9,'co-16':10,
  'co-17':9,'co-18':7,'co-19':9,'co-20':6,
  'dt-1':12,'dt-2':9,'dt-3':7,'dt-4':7,'dt-5':10,'dt-6':9,'dt-7':9,'dt-8':12,
  'dt-9':12,'dt-10':10,'dt-11':6,'dt-12':7,'dt-13':9,'dt-14':2,'dt-15':10,
  'dt-16':9,'dt-17':10,'dt-18':7,'dt-19':10,'dt-20':9,
  'em-1':12,'em-2':12,'em-3':12,'em-4':8,'em-5':9,'em-6':12,'em-7':7,'em-8':8,
  'em-9':7,'em-10':12,'em-11':7,'em-12':9,'em-13':9,
  'is-1':14,'is-2':12,'is-3':8,'is-4':12,'is-5':10,'is-6':6,'is-7':12,'is-8':10,'is-9':7,
  'df-1':8,'df-2':10,'df-3':10,'df-4':10,'df-5':8,'df-6':10,'df-7':7,'df-8':9,
  'ed-1':12,'ed-2':10,'ed-3':9,'ed-4':9,'ed-5':8,'ed-6':10,'ed-7':9,'ed-8':9,'ed-9':7,
  'gv-1':12,'gv-2':9,'gv-3':8,'gv-4':7,'gv-5':7,
  'rw-1':13,'rw-2':14,'rw-3':13,'rw-4':13,'rw-5':9,'rw-6':10,'rw-7':14,'rw-8':12,
  'rw-9':12,'rw-10':13,'rw-11':7,'rw-12':8,
  'io-1':10,'io-2':2,'io-3':10,
  'gf-1':12,'gf-2':7,'gf-3':10,
  'nf-1':11,'nf-2':11,'nf-3':9,'nf-4':12,'nf-5':11,
  'su-1':11,'su-2':9,'su-3':9,'su-4':8,
  'sc-1':7,
  'co-21':13,'dt-21':13,
  'em-14':11,'em-15':13,'em-16':13,'em-17':14,
  'is-10':10,'is-11':11,'is-12':12,
  'df-9':9,'df-10':11,
  'ed-10':11,
  'gv-6':10,'gv-7':11,'gv-8':13,
  'co-22':14,'co-23':9,'ed-11':12
};
/* 提案提出時期 (提案者が予算を組んだ時点) */
var FUND_SUBMIT_DATES={
  2:'01-12-2020', 3:'11-01-2021', 4:'01-04-2021',
  5:'15-06-2021', 6:'01-09-2021', 7:'15-11-2021',
  8:'01-03-2022', 9:'15-06-2022', 10:'01-07-2023', 11:'20-11-2023',
  12:'01-05-2024', 13:'01-10-2024', 14:'01-08-2025'
};
/* 採択結果発表時期 */
var FUND_RESULT_DATES={
  2:'15-01-2021', 3:'01-04-2021', 4:'02-07-2021',
  5:'09-08-2021', 6:'15-11-2021', 7:'10-02-2022',
  8:'01-06-2022', 9:'01-10-2022', 10:'01-10-2023', 11:'08-02-2024',
  12:'16-07-2024', 13:'15-01-2025', 14:'10-10-2025'
};
/* 投票期間 (vs=投票開始, ve=投票終了) */
var FUND_VOTE_DATES={
  3:{vs:'19-02-2021',ve:'05-03-2021'}, 4:{vs:'15-06-2021',ve:'28-06-2021'},
  5:{vs:'22-07-2021',ve:'05-08-2021'}, 6:{vs:'07-10-2021',ve:'21-10-2021'},
  7:{vs:'20-01-2022',ve:'03-02-2022'}, 8:{vs:'21-04-2022',ve:'05-05-2022'},
  9:{vs:'05-09-2022',ve:'19-09-2022'}, 10:{vs:'31-08-2023',ve:'14-09-2023'},
  11:{vs:'25-01-2024',ve:'08-02-2024'}, 12:{vs:'27-06-2024',ve:'11-07-2024'},
  13:{vs:'28-11-2024',ve:'12-12-2024'}, 14:{vs:'22-09-2025',ve:'06-10-2025'}
};
/* フォールバック値 (API失敗時) */
var FUND_SUBMIT_PRICES={2:0.17,3:0.17,4:1.30,5:1.40,6:3.10,7:2.00,8:0.85,9:0.55,10:0.29,11:0.38,12:0.45,13:0.35,14:0.75};
var FUND_RESULT_PRICES={2:0.35,3:1.20,4:1.30,5:1.50,6:2.10,7:1.10,8:0.60,9:0.38,10:0.27,11:0.55,12:0.42,13:0.68,14:0.85};
/* アクティブな価格セット (デフォルト=提案時) */
var FUND_PRICES={}; for(var _k in FUND_SUBMIT_PRICES) FUND_PRICES[_k]=FUND_SUBMIT_PRICES[_k];
var _priceMode='submit'; /* 'submit' | 'result' */

var CLASSIFY={
  'dt-2':'co','dt-3':'co','dt-4':'co','dt-5':'co','dt-6':'co','dt-7':'co',
  'dt-9':'co','dt-10':'co','dt-13':'co','dt-14':'co','dt-15':'co','dt-16':'co',
  'dt-17':'co','dt-18':'co','dt-19':'co','dt-20':'co',
  'em-4':'co','em-7':'co','em-11':'co','gv-2':'co',
  'df-1':'co','df-2':'co','df-4':'co','df-5':'co','df-7':'co',
  'rw-5':'co','rw-6':'co','rw-8':'co',
  'io-1':'co','io-2':'co','io-3':'co',
  'gf-2':'co','gf-3':'co','sc-1':'co',
  'is-3':'co','is-4':'co','is-5':'co','is-7':'co',
  'co-8':'co','co-9':'co','co-17':'co','df-8':'co',
  'rw-9':'co','rw-12':'co','em-14':'co','em-16':'co','co-21':'co','su-4':'co',
  'dt-14':'bridge','em-4':'bridge',
  'co-3':'bridge','rw-4':'bridge','nf-1':'bridge','su-1':'bridge'
};

var LINKS={
  'co-4':{url:'https://spojapanguild.net',x:'https://x.com/SPO_JAPAN_GUILD',yt:'https://youtube.com/@spojapanguild'},
  'co-2':{url:'https://web3bc-tokushima.jp',report:true},
  'co-7':{url:'https://milkomeda.com',report:true},
  'co-11':{report:true},'co-12':{x:'https://x.com/llc_dao'},
  'co-21':{url:'https://socious.io',x:'https://x.com/SociousDAO'},
  'dt-1':{url:'https://bstream.io'},
  'dt-2':{url:'https://milkomeda.com',x:'https://x.com/Milkomeda_com'},
  'dt-5':{url:'https://github.com/nicksax/cardano-rust-sdk'},
  'dt-7':{url:'https://github.com/txpipe/oura',x:'https://x.com/txaboratorios'},
  'dt-9':{url:'https://zengate.global',report:true},
  'dt-21':{url:'https://midnight.network'},
  'em-3':{yt:'https://youtube.com/@CatalystJP',report:true},
  'em-4':{yt:'https://youtube.com/@CatalystJP',report:true},
  'em-6':{report:true},'em-10':{x:'https://x.com/CardanoSPT'},
  'em-14':{url:'https://cardanosummitjapan.com',yt:'https://youtube.com/@CatalystJP',report:true},
  'em-15':{report:true},
  'em-16':{url:'https://cardanobuilderfest.com',report:true},
  'is-2':{url:'https://socious.io',x:'https://x.com/SociousDAO',report:true},
  'is-4':{url:'https://zengate.global',report:true},
  'is-7':{url:'https://github.com/nicksax/atala-prism-sdk'},
  'is-8':{url:'https://socious.io',report:true},
  'is-10':{url:'https://socious.io',report:true},
  'is-11':{url:'https://socious.io'},'is-12':{url:'https://socious.io'},
  'df-3':{url:'https://socious.io',report:true},'df-6':{url:'https://socious.io'},
  'df-10':{url:'https://socious.io',report:true},
  'gv-1':{report:true},'gv-4':{url:'https://socious.io',report:true},
  'gv-6':{url:'https://eqf.io',report:true},'gv-7':{url:'https://eqf.io',report:true},
  'gv-8':{url:'https://eqf.io'},
  'ed-1':{url:'https://learningbazaar.io',report:true},
  'ed-2':{url:'https://cardanoformasses.com',x:'https://x.com/yutazzz',report:true},
  'ed-6':{url:'https://github.com/btbf/sjg-tools',x:'https://x.com/btbf_stake',report:true},
  'rw-1':{url:'https://bypp.me',x:'https://x.com/bypp_inc'},
  'rw-2':{x:'https://x.com/JunHamada_IPDC'},
  'rw-4':{url:'https://rwa-launchpad.io'},
  'rw-6':{url:'https://walletconnect.com',report:true},
  'rw-8':{url:'https://zengate.global',report:true},
  'rw-9':{url:'https://shikoku-cardano.jp',yt:'https://youtube.com/@shikoku-cardano',report:true},
  'gf-1':{url:'https://funclub.app',x:'https://x.com/funclub_app'},
  'nf-1':{url:'https://legendaryhumanity.com',x:'https://x.com/LegendaryH_NFT'},
  'nf-3':{report:true},'nf-5':{report:true},'su-1':{report:true},
  'ed-10':{url:'https://socious.io',report:true}
};

/* ---- Merge all lookup data into INDUSTRIES ---- */
var i,j,p,entry,lk;
for(i=0;i<INDUSTRIES.length;i++){
  for(j=0;j<INDUSTRIES[i].children.length;j++){
    p=INDUSTRIES[i].children[j];
    /* Japanese label */
    if(JA_LABELS[p.id]) p.labelJa=JA_LABELS[p.id];
    /* Sector back-reference */
    p.sectorId=INDUSTRIES[i].id;
    p.sectorLabel=INDUSTRIES[i].label;
    p.sectorJa=INDUSTRIES[i].ja;
    p.sectorHue=INDUSTRIES[i].hue;
    /* Proposer */
    entry=PROPOSERS[p.id];
    if(entry){
      if(typeof entry==='string'){p.by=entry;p.role='提案者';}
      else{p.by=entry.name;p.role=entry.role||'提案者';}
    }
    /* Team */
    if(TEAMS[p.id]){
      p.team=TEAMS[p.id].map(function(t){var s=t.split(':');return{name:s[0],role:s[1]||''}});
    }
    /* Fund */
    p.fund=FUND_MAP[p.id]||0;
    p.adaPrice=FUND_PRICES[p.fund]||ADA_USD;
    /* Classification */
    p.cls=CLASSIFY[p.id]||'main';
    /* Links */
    lk=LINKS[p.id];
    if(lk){p.url=lk.url;p.x=lk.x;p.yt=lk.yt;p.report=lk.report;}
  }
}

/* ---- Computed stats per industry ---- */
var totalFunded=0,totalCompleted=0,totalProgress=0,totalDnf=0,totalUsdK=0;
var proposerSet={},fundSet={};
for(i=0;i<INDUSTRIES.length;i++){
  var ind=INDUSTRIES[i],ok=0,wip=0,dn=0,secK=0;
  for(j=0;j<ind.children.length;j++){
    p=ind.children[j];
    var uK=p.u==='ada'?p.amt*p.adaPrice:p.amt;
    if(p.st==='complete'){ok++;totalCompleted++;}
    else if(p.st==='progress'){wip++;totalProgress++;}
    else{dn++;totalDnf++;}
    totalFunded++;totalUsdK+=uK;secK+=uK;
    if(p.fund)fundSet[p.fund]=true;
    if(p.by)proposerSet[p.by]=true;
  }
  ind._ok=ok;ind._wip=wip;ind._dnf=dn;ind._total=ok+wip+dn;ind._usdK=secK;
}

/* ---- Export ---- */
var DATA={
  INDUSTRIES:INDUSTRIES,
  JA_LABELS:JA_LABELS,
  ADA_USD:ADA_USD,
  USD_JPY:USD_JPY,
  FUND_PRICES:FUND_PRICES,
  FUND_SUBMIT_PRICES:FUND_SUBMIT_PRICES,
  FUND_RESULT_PRICES:FUND_RESULT_PRICES,
  FUND_SUBMIT_DATES:FUND_SUBMIT_DATES,
  FUND_RESULT_DATES:FUND_RESULT_DATES,
  priceMode:_priceMode,
  totalFunded:totalFunded,
  totalCompleted:totalCompleted,
  totalProgress:totalProgress,
  totalDnf:totalDnf,
  totalUsdK:totalUsdK,
  proposerCount:Object.keys(proposerSet).length,
  sectorCount:INDUSTRIES.length,
  funds:Object.keys(fundSet).map(Number).sort(function(a,b){return a-b})
};
window.CJ_DATA=DATA;

/* ---- Live price fetch (CoinGecko free API) ---- */
function recalcTotals(){
  var src=_priceMode==='result'?FUND_RESULT_PRICES:FUND_SUBMIT_PRICES;
  for(var k in src) FUND_PRICES[k]=src[k];
  var tf=0,tc=0,tp=0,td=0,tu=0;
  for(var i=0;i<INDUSTRIES.length;i++){
    var ind=INDUSTRIES[i],ok=0,wip=0,dn=0,secK=0;
    for(var j=0;j<ind.children.length;j++){
      var p=ind.children[j];
      p.adaPrice=FUND_PRICES[p.fund]||ADA_USD;
      var uK=p.u==='ada'?p.amt*p.adaPrice:p.amt;
      if(p.st==='complete'){ok++;tc++;}
      else if(p.st==='progress'){wip++;tp++;}
      else{dn++;td++;}
      tf++;tu+=uK;secK+=uK;
    }
    ind._ok=ok;ind._wip=wip;ind._dnf=dn;ind._total=ok+wip+dn;ind._usdK=secK;
  }
  DATA.totalFunded=tf;DATA.totalCompleted=tc;DATA.totalProgress=tp;DATA.totalDnf=td;DATA.totalUsdK=tu;
  DATA.FUND_PRICES=FUND_PRICES;DATA.priceMode=_priceMode;
}

/* 価格モード切替 */
function setPriceMode(mode){
  _priceMode=mode;DATA.priceMode=mode;
  recalcTotals();
  if(window._cjPriceCallback) window._cjPriceCallback();
}
window._cjSetPriceMode=setPriceMode;

/* 1) 現在のADA価格 + USD/JPYを取得 */
function fetchCurrentPrice(){
  return fetch('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd,jpy')
    .then(function(r){return r.json()}).then(function(d){
      if(d&&d.cardano){
        if(d.cardano.usd){ADA_USD=d.cardano.usd;DATA.ADA_USD=ADA_USD;}
        if(d.cardano.jpy&&d.cardano.usd){USD_JPY=d.cardano.jpy/d.cardano.usd;DATA.USD_JPY=USD_JPY;}
        console.log('[CJ] Current ADA=$'+ADA_USD+' USD/JPY='+USD_JPY.toFixed(1));
      }
    });
}

/* 2) 両セットのFund価格を取得 (提案時 + 採択時) */
function fetchFundPrices(){
  var allDates={};
  var sf=Object.keys(FUND_SUBMIT_DATES);
  var rf=Object.keys(FUND_RESULT_DATES);
  for(var i=0;i<sf.length;i++) allDates['s:'+sf[i]]=FUND_SUBMIT_DATES[sf[i]];
  for(var j=0;j<rf.length;j++) allDates['r:'+rf[j]]=FUND_RESULT_DATES[rf[j]];
  var keys=Object.keys(allDates);
  var done=0,total=keys.length;
  keys.forEach(function(key,idx){
    setTimeout(function(){
      var date=allDates[key];
      var parts=key.split(':');
      var type=parts[0],fund=parts[1];
      fetch('https://api.coingecko.com/api/v3/coins/cardano/history?date='+date+'&localization=false')
        .then(function(r){return r.json()}).then(function(d){
          if(d&&d.market_data&&d.market_data.current_price){
            var p=d.market_data.current_price.usd;
            if(p){
              if(type==='s'){FUND_SUBMIT_PRICES[fund]=p;DATA.FUND_SUBMIT_PRICES=FUND_SUBMIT_PRICES;}
              else{FUND_RESULT_PRICES[fund]=p;DATA.FUND_RESULT_PRICES=FUND_RESULT_PRICES;}
              console.log('[CJ] F'+fund+' '+( type==='s'?'submit':'result')+' ('+date+'): $'+p.toFixed(4));
            }
          }
        }).catch(function(){/* use fallback */})
        .finally(function(){
          done++;
          if(done>=total){
            recalcTotals();
            console.log('[CJ] All fund prices updated (submit+result)');
            if(window._cjPriceCallback) window._cjPriceCallback();
          }
        });
    }, idx*500);
  });
}

/* 起動: 現在価格→Fund価格の順 */
fetchCurrentPrice()
  .then(function(){fetchFundPrices();})
  .catch(function(e){
    console.log('[CJ] Price fetch failed, using defaults',e);
    fetchFundPrices();
  });

})();
