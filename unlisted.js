/* ============================================================
   VIDEO LISTS — manual overrides for proposal video handling.
   ============================================================ */

/* (A) UNLISTED VIDEOS — YouTube 限定公開 のため、サムネを出さず
   「限定公開 / リンクからご確認ください」と表示する。
   リンクは生かしてあるので、本人や許可された人は開ける。 */
window.UNLISTED_VIDEOS = [
  'rw-9',     // 四国地域の社会実装 (Naoki Sakata)
  'co-4',     // SPOジャパンギルド (BTBF)
  'em-3',     // 日本最大ブロックチェーンEXPO出展 (Shusuke Wakuda)
  'ed-6',     // SJG TOOLS V2 — ステークプールTUIツール (BTBF)
  'em-14',    // 日本のカルダノサミット (Seira Yun / Socious)
  'dt-1',     // 統合型暗号資産会計システム (Kenta Takase)
  'co-19',    // 日本・地域活性化プロジェクト (MakotoHarada)
  'nf-5',     // 渋谷フェス 428FES CNFT展示 (Yuichiro Nomoto)
  'is-7',     // AtalaPrism SDK拡張 (Ben Tairea)
  'df-10',    // 分散型エスクロー＆紛争解決 (Seira Yun / Socious)
  'is-11',    // Atala PRISM 2.0用IDウォレット (Seira Yun / Socious)
  'rw-4',     // Cardano RWAローンチパッド (Yuri Kuriyama)
  'is-2',     // Socious: 検証可能な資格証明 (Seira Yun / Socious)
  'is-10',    // 職歴の検証可能な資格証明化 (Seira Yun / Socious) — is-2と同一動画
  'dt-21',    // Midnight向けスマートコントラクトライブラリ (Seira Yun / Socious)
];

/* (B) SKIP VIDEOS — 紐付いている YouTube 動画が完了報告ではない
   (または関連性が低い) ため、動画自体を表示しない。
   サムネ・再生ボタン・クリック動作すべて抑制。
   背景は通常のグラデーション、他のリンク (PDF/GitHub等) は維持。 */
window.SKIP_VIDEOS = [
  'su-1',     // 御朱印NFT 徳島 (ranket) — 表示動画が「日本一低い山で山開き」で完了報告と無関係
  'gv-7',     // 拡張二次資金調達 (F11) (Seira Yun) — 表示動画がレイキャビク大学のAI学術会議で無関係
];

/* (C) EMBED-DISABLED VIDEOS — 動画は正しい完了報告だが、所有者が
   「他サイトでの埋め込み再生」を無効にしている。in-page modal が
   エラーを出すため、サムネは出さず「YouTubeで開く」誘導に切替。
   クリックは新タブで YouTube に直接ジャンプ。 */
window.EMBED_DISABLED_VIDEOS = [
  'rw-3',     // AIRA: Hydraロイヤルティ地域活性化 (AIRA) — 埋め込み再生無効
  'rw-1',     // Lock'n': Hydra L2 IoT（ガチャガチャ）(bypp Inc.) — 埋め込み再生無効
];
