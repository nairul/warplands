/* Card illustrations, drawn as silhouettes against an era-tinted sky (the sky itself is CSS on .art).
   Each entry is the inside of an SVG with viewBox 0 0 160 84. Shared classes, styled in index.html:
   k = near-black silhouette, m = dark mid-tone, s = stone, e = ember, y = warm light,
   b = blood, p = sickly green, w = pale (moon, bone), sm = smoke stroke, ln = thin dark stroke. */

const GROUND = '<path class="k" d="M0 70 Q30 64 62 68 T120 66 T160 68 V84 H0Z"/>';
const HILLS = '<path class="m" d="M0 62 Q25 52 50 58 T100 54 T160 56 V84 H0Z"/>';
const MOON = (x, y, r) => `<circle class="w" cx="${x}" cy="${y}" r="${r}" opacity=".85"/>`;
const SMOKE = (x, y) => `<path class="sm" d="M${x} ${y} q-4 -6 1 -11 t-1 -11 t3 -10"/>`;
const SPARKS = (pts) => pts.map(([x, y, r]) => `<circle class="e" cx="${x}" cy="${y}" r="${r || 1}"/>`).join('');

export const ART = {
  /* ---- Starting site ---- */
  homeland: `${HILLS}${SMOKE(52, 44)}${SMOKE(104, 40)}
    <path class="k" d="M18 70V54l10-9 10 9v16z"/><path class="k" d="M40 70V50l14-12 14 12v20z"/>
    <path class="k" d="M66 70V44l20-16 20 16v26z"/><path class="k" d="M100 70V52l12-10 12 10v18z"/><path class="k" d="M122 70V56l9-8 9 8v14z"/>
    <rect class="y" x="25" y="57" width="4" height="5"/><rect class="y" x="51" y="54" width="5" height="6"/><rect class="y" x="81" y="50" width="4" height="6"/>
    <rect class="y" x="89" y="50" width="4" height="6"/><path class="e" d="M83 70v-9a3 3 0 0 1 6 0v9z"/><rect class="y" x="109" y="57" width="4" height="5"/>
    ${GROUND}`,

  /* ---- Hamlet sites ---- */
  temple: `${MOON(124, 22, 9)}${HILLS}
    <path class="s" d="M44 70l6-20h60l6 20z"/><rect class="k" x="40" y="44" width="80" height="7" rx="1"/>
    <path class="b" d="M70 51v7q1 3 2 0v-7zM92 51v5q1 3 2 0v-5z"/>
    <rect class="w" x="50" y="34" width="3" height="10"/><rect class="w" x="107" y="34" width="3" height="10"/>
    <path class="y" d="M51.5 28q-3 4 0 6q3-2 0-6zM108.5 28q-3 4 0 6q3-2 0-6z"/>
    <circle class="b" cx="80" cy="40" r="5"/>${GROUND}`,


  church: `${MOON(30, 20, 7)}${HILLS}
    <path class="k" d="M58 70V40l22-14 22 14v30z"/><path class="k" d="M74 30V12h12v18z"/><path class="k" d="M74 12l6-10 6 10z"/>
    <rect class="k" x="79" y="-2" width="2" height="8"/><rect class="k" x="76.5" y="0" width="7" height="2"/>
    <circle class="y" cx="80" cy="44" r="6"/><path class="k" d="M80 38v12M74 44h12" stroke="#0b0806" stroke-width="1.5"/>
    <path class="e" d="M75 70V60a5 5 0 0 1 10 0v10z"/><rect class="y" x="64" y="48" width="3" height="8" rx="1.5"/><rect class="y" x="93" y="48" width="3" height="8" rx="1.5"/>
    ${GROUND}`,

  monolith: `${MOON(80, 18, 8)}${HILLS}
    <ellipse class="p" cx="80" cy="68" rx="46" ry="6" opacity=".35"/>
    <path class="k" d="M36 70q0-8 6-8t6 8zM112 70q0-8 6-8t6 8zM58 72q0-10 8-10t8 10zM86 72q0-10 8-10t8 10z"/>
    <path class="m" d="M41 70v-6h2v6zM117 70v-6h2v6z"/>
    <path class="s" d="M28 70l3-22h7l2 22zM120 70l2-24h7l3 24z"/><path class="s" d="M74 64l2-30h8l2 30z"/>
    ${SPARKS([[50, 40, 1.4], [66, 28, 1], [96, 30, 1.3], [108, 42, 1], [58, 52, 1], [100, 50, 1.2]]).replace(/class="e"/g, 'class="p"')}
    ${GROUND}`,

  farm: `${MOON(128, 20, 10)}
    <path class="m" d="M0 56q80-8 160 0v28H0z"/>
    <path class="ln" d="M0 62q80-6 160 0M0 67q80-5 160 0M0 72q80-4 160 0M0 77q80-3 160 0"/>
    <path class="k" d="M18 58V42l14-10 14 10v16z"/><rect class="y" x="29" y="46" width="6" height="6"/>
    ${[56, 64, 72, 80, 88, 96, 104].map((x, i) => `<path class="k" d="M${x} 70q1-12 0-22" stroke="#0b0806" stroke-width="1.4" fill="none"/><ellipse class="y" cx="${x}" cy="${46 - (i % 2) * 2}" rx="2" ry="5" opacity=".9"/>`).join('')}
    <path class="k" d="M0 78q80-6 160 0v6H0z"/>`,

  barracks: `${HILLS}
    <path class="k" d="M20 70l22-30 22 30zM96 70l22-30 22 30z"/><path class="e" d="M38 70l4-8 4 8zM114 70l4-8 4 8z"/>
    <rect class="k" x="66" y="44" width="28" height="26"/><path class="k" d="M62 44l18-12 18 12z"/><rect class="e" x="76" y="56" width="8" height="14"/>
    <path class="k" d="M44 40V10M116 40V10" stroke="#0b0806" stroke-width="2"/>
    <path class="b" d="M45 11h16l-4 5 4 5H45zM117 11h16l-4 5 4 5h-16z"/>
    ${[70, 74, 86, 90].map(x => `<path class="k" d="M${x} 70V30" stroke="#0b0806" stroke-width="1"/><path class="w" d="M${x - 1.5} 31l1.5-5 1.5 5z"/>`).join('')}
    ${GROUND}`,

  mine: `${HILLS}<path class="s" d="M30 70q10-44 50-48q40 4 50 48z"/>
    <path class="k" d="M58 70V42h44v28z"/><path class="m" d="M54 42h52v-5H54zM55 42v28h5V42zM100 42v28h5V42z"/>
    <path class="e" d="M66 70q14-20 28 0z" opacity=".55"/>
    <path class="k" d="M110 64h22l-3 6h-16z"/><circle class="k" cx="115" cy="71" r="2.5"/><circle class="k" cx="127" cy="71" r="2.5"/>
    <path class="s" d="M114 64l3-5h9l3 5z"/>
    <path class="k" d="M28 66l16-20" stroke="#0b0806" stroke-width="2.4"/><path class="k" d="M36 44q8-2 14 4q-7-1-12 0z"/>
    ${GROUND}`,

  market: `${HILLS}
    <path class="k" d="M10 70V44h40v26zM60 70V40h40v30zM110 70V44h40v26z"/>
    <path class="b" d="M6 44l8-10h32l8 10z"/><path class="y" d="M56 40l8-10h32l8 10z" opacity=".9"/><path class="e" d="M106 44l8-10h32l8 10z"/>
    <path class="ln" d="M16 34l-3 10M26 34l-1 10M36 34l1 10M66 30l-3 10M76 30l-1 10M86 30l1 10M116 34l-3 10M126 34l-1 10M136 34l1 10"/>
    <circle class="y" cx="20" cy="54" r="3"/><circle class="e" cx="30" cy="56" r="3"/><circle class="y" cx="40" cy="54" r="2.5"/>
    <rect class="s" x="66" y="50" width="10" height="8"/><rect class="s" x="80" y="52" width="12" height="6"/>
    <path class="w" d="M120 50h20v3h-20zM122 55h16v3h-16z" opacity=".6"/>
    <path class="k" d="M0 24q80 10 160 0" stroke="#0b0806" fill="none"/>
    ${[30, 55, 80, 105, 130].map(x => `<circle class="y" cx="${x}" cy="${26 + Math.abs(80 - x) * -0.04 + 3}" r="2"/>`).join('')}
    ${GROUND}`,

  fort: `${HILLS}
    ${Array.from({ length: 18 }, (_, i) => { const x = 4 + i * 9; return (i === 8 || i === 9) ? '' : `<path class="k" d="M${x} 70V${36 + (i % 3) * 3}l4-7 4 7V70z"/>`; }).join('')}
    <path class="k" d="M74 70V40h22v30z"/><path class="e" d="M77 70V48h16v22z" opacity=".75"/>
    <path class="k" d="M77 54h16M77 62h16M85 48v22" stroke="#0b0806" stroke-width="1.5"/>
    <path class="m" d="M0 52h160v3H0z" opacity=".8"/>${GROUND}`,

  mission: `${MOON(32, 18, 6)}${HILLS}
    <path class="k" d="M58 70V44h44v26z"/><path class="k" d="M50 46l30-22 30 22z"/><path class="k" d="M64 30l16-12 16 12z"/>
    <path class="e" d="M72 70V54a8 8 0 0 1 16 0v16z"/><circle class="y" cx="80" cy="58" r="3"/>
    <path class="k" d="M110 46v-6M50 46v-6" stroke="#0b0806" stroke-width="1.5"/><circle class="y" cx="110" cy="50" r="2.2"/><circle class="y" cx="50" cy="50" r="2.2"/>
    <path class="s" d="M74 84l3-14h6l3 14z" opacity=".7"/>${GROUND}`,

  ram: `${HILLS}
    <path class="k" d="M30 62l10-26h60l10 26z"/><path class="m" d="M40 36l-3 8h66l-3-8z"/>
    <path class="s" d="M14 52h106v6H14z"/><path class="w" d="M8 50l8-2v14l-8-2z"/>
    <circle class="k" cx="44" cy="66" r="6"/><circle class="k" cx="96" cy="66" r="6"/>
    <circle class="m" cx="44" cy="66" r="2"/><circle class="m" cx="96" cy="66" r="2"/>
    <path class="k" d="M128 70V30h20v40z"/><path class="k" d="M128 30h4v-5h4v5h4v-5h4v5h4"/>
    <path class="e" d="M126 46l-6 2 6 3-5 4 6 0" opacity=".9"/>${GROUND}`,

  castle: `${MOON(130, 20, 9)}${HILLS}
    <path class="k" d="M48 70V28h64v42z"/><path class="k" d="M48 28v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6"/>
    <path class="k" d="M36 70V40h14v30zM110 70V40h14v30z"/><path class="k" d="M36 40v-5h4v5h3v-5h4v5h3v-5M110 40v-5h4v5h3v-5h4v5h3v-5"/>
    <path class="k" d="M80 22V4" stroke="#0b0806" stroke-width="1.5"/><path class="b" d="M81 4h14l-4 4 4 4H81z"/>
    <rect class="y" x="62" y="36" width="3" height="7"/><rect class="y" x="95" y="36" width="3" height="7"/><rect class="y" x="78" y="40" width="4" height="8"/>
    <path class="e" d="M72 70V58a8 8 0 0 1 16 0v12z" opacity=".6"/>${GROUND}`,

  masons: `${HILLS}
    <path class="s" d="M40 70V50h80v20z"/><path class="ln" d="M40 60h80M60 50v10M90 50v10M75 60v10M105 60v10"/>
    <path class="m" d="M72 50l5-6h14l-3 6z"/>
    <path class="k" d="M98 44L124 14" stroke="#0b0806" stroke-width="3"/><path class="k" d="M116 8l14 10-5 6-14-10z"/>
    <path class="w" d="M84 46l-14-22" stroke="#d9d0c4" stroke-width="2.2"/><path class="w" d="M69 22l3-2 2 4-3 1z"/>
    ${SPARKS([[90, 40, 1.4], [96, 34, 1], [102, 42, 1.2], [86, 32, 0.9], [106, 36, 0.8], [94, 28, 0.7]])}
    ${GROUND}`,

  catapult: `${HILLS}
    <path class="k" d="M50 70l20-40h4l20 40h-6l-16-32-16 32z"/><path class="m" d="M44 66h56v4H44z"/>
    <path class="k" d="M72 34L128 8" stroke="#0b0806" stroke-width="3.2"/><path class="k" d="M72 34L58 42" stroke="#0b0806" stroke-width="3.2"/>
    <rect class="s" x="50" y="40" width="14" height="14"/><path class="ln" d="M128 8q2 10-4 16"/>
    <circle class="e" cx="124" cy="25" r="4"/><path class="y" d="M124 25l10-6M124 25l9 2" stroke="#ffc66b" stroke-width="1" opacity=".6"/>
    <circle class="k" cx="52" cy="70" r="4"/><circle class="k" cx="92" cy="70" r="4"/>${GROUND}`,


  healerhut: `${MOON(128, 18, 7)}${HILLS}${SMOKE(92, 30)}
    <path class="k" d="M52 70V48h56v22z"/><path class="m" d="M44 50q36-34 72 0q-6-3-12 0q-6-3-12 0q-6-3-12 0q-6-3-12 0q-6-3-12 0q-6-3-12 0z"/>
    <path class="k" d="M46 50q34-30 68 0" fill="none" stroke="#0b0806" stroke-width="2"/><rect class="k" x="88" y="26" width="6" height="14"/>
    <path class="y" d="M72 70V58a8 8 0 0 1 16 0v12z"/><circle class="e" cx="80" cy="64" r="2"/>
    <path class="k" d="M58 50v8M64 50v6M96 50v7M102 50v6" stroke="#0b0806" stroke-width="1"/>
    <path class="p" d="M56 57l2 4 2-4zM62 55l2 4 2-4zM94 56l2 4 2-4zM100 55l2 4 2-4z" opacity=".85"/>
    <path class="s" d="M114 68q6 6 14 0z"/><path class="sm" d="M118 64q-2-4 1-7M124 64q2-4-1-7" stroke-width="2"/>
    <path class="p" d="M30 70q2-10 8-12q-2 8-8 12zM36 70q4-8 10-8q-4 6-10 8z" opacity=".8"/>
    ${GROUND}`,

  /* ---- Hamlet events ---- */
  fertility: `<circle class="y" cx="80" cy="30" r="15"/>${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => { const r = a * Math.PI / 180; return `<path class="ln-y" d="M${80 + Math.cos(r) * 19} ${30 + Math.sin(r) * 19}L${80 + Math.cos(r) * 26} ${30 + Math.sin(r) * 26}"/>`; }).join('')}
    ${HILLS}
    ${[-14, -9, -4, 0, 4, 9, 14].map(o => `<path class="k" d="M80 72Q${80 + o * 0.4} 60 ${80 + o * 1.6} 44" stroke="#0b0806" stroke-width="1.6" fill="none"/><ellipse class="k" cx="${80 + o * 1.7}" cy="42" rx="2.4" ry="6" transform="rotate(${o * 2} ${80 + o * 1.7} 42)"/>`).join('')}
    <path class="e" d="M70 60h20v4H70z"/>${GROUND}`,

  radicalism: `${HILLS}
    <path class="k" d="M80 70V16" stroke="#0b0806" stroke-width="4"/><path class="k" d="M68 28h24" stroke="#0b0806" stroke-width="3"/>
    <path class="m" d="M76 22q4-4 8 0v22l-4 6-4-6z"/>
    <path class="e" d="M52 70q4-20 12-14q-2-14 10-20q-2 12 6 16q2-12 10-18q2 14 8 20q8-6 10 16z"/>
    <path class="y" d="M62 70q2-10 8-8q0-8 8-12q0 8 4 10q2-8 8-10q0 10 6 20z"/>
    <path class="k" d="M44 70l18-6 18 4 18-4 18 6z"/>
    ${SPARKS([[66, 30, 1], [94, 26, 1.2], [72, 18, 0.8], [100, 38, 0.9]])}${GROUND}`,

  fanaticism: `${HILLS}
    ${[[34, 0], [58, 4], [82, -2], [106, 3], [128, 0]].map(([x, dy]) => `<path class="k" d="M${x - 9} 72l3-22q6-5 12 0l3 22z"/><path class="k" d="M${x - 5} ${44 + dy}q5-9 10 0l-1 6h-8z"/>
      <path class="k" d="M${x + 6} ${52 + dy}l6-24" stroke="#0b0806" stroke-width="2"/><path class="e" d="M${x + 12} ${28 + dy}q-5-6 1-12q1 5 4 4q2 6-5 8z"/><circle class="y" cx="${x + 12.5}" cy="${25 + dy}" r="1.6"/>`).join('')}
    ${GROUND}`,

  onslaught: `${MOON(130, 18, 8)}
    <path class="m" d="M0 50q40-14 80-4t80 0v38H0z"/>
    ${Array.from({ length: 16 }, (_, i) => { const x = 6 + i * 10, y = 52 - Math.sin(i * 0.5) * 4; return `<path class="k" d="M${x} ${y + 20}V${y}" stroke="#0b0806" stroke-width="1.5"/><path class="w" d="M${x - 1.5} ${y + 1}l1.5-5 1.5 5z" opacity=".8"/><circle class="k" cx="${x + 2}" cy="${y + 10}" r="3"/>`; }).join('')}
    <path class="k" d="M40 46V20" stroke="#0b0806" stroke-width="1.5"/><path class="b" d="M41 20h12l-3 4 3 4H41z"/>
    <path class="k" d="M108 44V16" stroke="#0b0806" stroke-width="1.5"/><path class="b" d="M109 16h12l-3 4 3 4h-12z"/>
    <path class="k" d="M0 66q40-6 80-2t80-2v22H0z"/>`,

  pillage: `${HILLS}${SMOKE(54, 30)}${SMOKE(62, 34)}
    <path class="k" d="M30 70V44l24-18 24 18v26z"/><path class="e" d="M34 44q6-18 12-8q4-14 10-2q6-12 10 4q6-6 8 6z"/>
    <path class="y" d="M42 44q4-10 8-4q4-8 6 0q4-6 6 4z"/><rect class="e" x="48" y="52" width="10" height="18"/>
    <path class="k" d="M112 70l3-18h-6l4-14q6-4 10 0l3 14h-5l3 18z"/><circle class="k" cx="116" cy="34" r="5"/>
    <path class="k" d="M124 44l16-22" stroke="#0b0806" stroke-width="2.4"/><path class="w" d="M134 18q12 2 10 14q-6-6-12-8z"/>
    ${GROUND}`,

  display: `<path class="m" d="M10 20q16-14 36-6q14-12 34-4q16-12 36 0q20-6 36 10q-60 10-142 0z"/>
    <path class="y" d="M78 12l-7 10h5l-6 10 12-13h-5l5-7z"/><path class="y" d="M54 22l3 4M90 22l-3 4" stroke="#ffc66b" stroke-width="1.4"/>
    ${HILLS}
    <path class="k" d="M58 72l6-28q8-6 16 0l6 28z"/><circle class="k" cx="72" cy="38" r="5.5"/>
    <path class="k" d="M64 46L54 26M80 46l10-20" stroke="#0b0806" stroke-width="3"/>
    ${SPARKS([[70, 58, 1.4], [76, 62, 1], [66, 64, 1.1]])}${GROUND}`,

  siege: `<path class="m" d="M20 12q20-10 40-2q20-10 40 0q20-8 40 4q-60 8-120-2z"/>
    <path class="y" d="M82 10l-12 26h10l-14 34 26-40h-11l11-20z"/>
    ${HILLS}
    <ellipse class="e" cx="68" cy="70" rx="16" ry="4"/><ellipse class="y" cx="68" cy="70" rx="7" ry="2"/>
    ${SPARKS([[52, 60, 1.4], [58, 54, 1], [80, 56, 1.3], [86, 62, 1], [62, 50, 0.9], [76, 48, 0.8], [90, 52, 0.8]])}
    ${GROUND}`,

  /* ---- Hamlet attachments ---- */
  badomen: `<circle class="b" cx="112" cy="28" r="18"/>${HILLS}
    <path class="k" d="M0 46q30-6 60 0t70-4" stroke="#0b0806" stroke-width="3.5" fill="none"/><path class="k" d="M30 44l-8-12M90 44l6-14" stroke="#0b0806" stroke-width="2" fill="none"/>
    <path class="k" d="M58 44q-2-10 8-16q8-4 12 2l8-2-6 5q2 8-6 13l-14 4-12 10 4-9z"/>
    <circle class="e" cx="72" cy="31" r="1.2"/><path class="k" d="M66 44l-1 5M72 44l1 5" stroke="#0b0806" stroke-width="1.2"/>
    ${GROUND}`,

  plague: `${MOON(118, 20, 8)}${HILLS}
    <path class="k" d="M48 70q4-16 2-30l-12-12M50 40l14-16M50 54l-14-6M52 46l12 4" stroke="#0b0806" stroke-width="3.2" fill="none"/>
    <path class="k" d="M44 72q6-4 12 0"/>
    <ellipse class="p" cx="100" cy="64" rx="22" ry="5" opacity=".45"/>
    <path class="w" d="M92 62a8 7 0 1 1 16 0v4h-3v2h-10v-2h-3z"/><circle class="k" cx="97" cy="61" r="2"/><circle class="k" cx="103" cy="61" r="2"/>
    ${SPARKS([[90, 46, 1.6], [104, 40, 1.2], [112, 50, 1.4], [82, 54, 1], [98, 30, 1], [118, 38, 0.9]]).replace(/class="e"/g, 'class="p"')}
    ${GROUND}`,

  /* ---- Hamlet reactions ---- */
  misinfo: `${HILLS}
    <path class="w" d="M50 22q30-10 60 0q2 26-30 40q-32-14-30-40z"/>
    <path class="k" d="M58 30q7-5 14 0q-7 5-14 0zM88 30q7-5 14 0q-7 5-14 0z"/><path class="k" d="M68 46q12 6 24 0q-12 2-24 0z"/>
    <path class="k" d="M80 22v40" stroke="#0b0806" stroke-width="1.2" opacity=".7"/>
    <path class="k" d="M80 23q14-5 30-1q2 26-30 40z" opacity=".55"/>
    <path class="s" d="M120 18l-6 4 2 2 6-4zM115 23l-24 30 2 2 24-30z"/><path class="b" d="M93 53l-3 4 2 1z"/>
    ${GROUND}`,

  escape: `${MOON(30, 18, 7)}
    <path class="s" d="M0 70V20h160v50z"/>
    <path class="ln" d="M0 30h160M0 40h160M0 50h160M0 60h160M20 20v10M60 20v10M100 20v10M140 20v10M40 30v10M80 30v10M120 30v10M20 40v10M60 40v10M140 40v10M40 50v10M120 50v10M20 60v10M140 60v10"/>
    <path class="k" d="M66 70V50a14 14 0 0 1 28 0v20z"/><path class="y" d="M70 70V51a10 10 0 0 1 20 0v19z"/>
    <path class="k" d="M84 70V52l-12-2v20z" opacity=".85"/>
    <path class="k" d="M80 70l-2-10a2 2 0 0 1 4 0z"/>
    <path class="k" d="M0 70h160v14H0z"/><path class="y" d="M70 70l-10 14h40l-10-14z" opacity=".25"/>`,

  fodder: `${HILLS}
    ${[[26, 0], [50, 3], [74, -1], [98, 2], [122, 0], [140, 4]].map(([x, dy], i) => `<path class="k" d="M${x - 6} 72l2-18q4-3 8 0l2 18z"/><circle class="k" cx="${x}" cy="${47 + dy}" r="4"/>
      <path class="k" d="M${x + (i % 2 ? -6 : 6)} 70V${30 + dy}" stroke="#0b0806" stroke-width="1.6"/>
      <path class="ln" d="M${x + (i % 2 ? -9 : 3)} ${30 + dy}v-7M${x + (i % 2 ? -6 : 6)} ${30 + dy}v-8M${x + (i % 2 ? -3 : 9)} ${30 + dy}v-7M${x + (i % 2 ? -9 : 3)} ${30 + dy}h6"/>`).join('')}
    ${GROUND}`,
  /* ---- Township sites ---- */
  milbase: `${HILLS}
    <path class="k" d="M30 70V40h100v30z"/><path class="k" d="M24 42l56-20 56 20z"/>
    <rect class="e" x="72" y="50" width="16" height="20"/>
    ${[40, 52, 104, 116].map(x => `<rect class="y" x="${x}" y="48" width="5" height="7"/>`).join('')}
    <path class="k" d="M80 22V2" stroke="#0b0806" stroke-width="1.6"/><path class="b" d="M81 2h18l-5 5 5 5H81z"/>
    ${[10, 16, 144, 150].map(x => `<path class="k" d="M${x} 70V40" stroke="#0b0806" stroke-width="1.2"/><path class="w" d="M${x - 1.6} 41l1.6-6 1.6 6z"/>`).join('')}
    ${GROUND}`,

  library: `${MOON(132, 18, 7)}${HILLS}
    <path class="k" d="M36 70V30h88v40z"/><path class="k" d="M30 32l50-22 50 22z"/>
    ${[46, 62, 90, 106].map(x => `<path class="y" d="M${x} 62V46a4 4 0 0 1 8 0v16z"/>`).join('')}
    <circle class="y" cx="80" cy="24" r="5"/><path class="k" d="M80 19v10M75 24h10" stroke="#0b0806" stroke-width="1.2"/>
    <path class="e" d="M74 70V52a6 6 0 0 1 12 0v18z"/>
    <path class="w" d="M8 66l14-4 14 4v4H8z" opacity=".7"/><path class="ln" d="M22 62v8"/>
    ${GROUND}`,

  hospital: `${MOON(30, 18, 7)}${HILLS}
    <path class="k" d="M44 70V36h72v34z"/><path class="k" d="M38 38l42-18 42 18z"/>
    ${[52, 66, 88, 102].map(x => `<rect class="y" x="${x}" y="44" width="6" height="8"/>`).join('')}
    <path class="e" d="M72 70V56a8 8 0 0 1 16 0v14z"/>
    <path class="p" d="M128 70q-4-14 4-22q2 10 6 12q-2-10 6-16q2 14-4 26z" opacity=".8"/>
    <path class="w" d="M76 28h8v4h4v8h-4v4h-8v-4h-4v-8h4z" opacity=".75" transform="translate(0 -6) scale(1)"/>
    ${GROUND}`,

  sniper: `${MOON(124, 20, 9)}${HILLS}
    <path class="k" d="M30 70q4-30-2-60l6 2q4 30 2 58z"/><path class="k" d="M14 30q16-14 34 0q-10-2-17 0q-8-2-17 0z"/>
    <path class="k" d="M18 24q12-14 26 0z"/>
    <path class="k" d="M24 22h16v4H24z"/><circle class="k" cx="34" cy="16" r="3"/>
    <path class="k" d="M36 18q10 4 6 12" stroke="#0b0806" stroke-width="1.4" fill="none"/>
    <path class="ln-y" d="M44 16L118 40" stroke-dasharray="3 5" opacity=".7"/>
    <path class="k" d="M104 70l3-14h8l3 14zM111 56a3 3 0 1 0 .1 0z"/>
    ${GROUND}`,

  railroad: `${HILLS}
    <path class="s" d="M70 70l4-52h12l4 52z"/><path class="ln" d="M74 30h12M73 44h14M72 58h16"/>
    <path class="p" d="M78 24h4v6h-4zM77 38h6v4h-6zM79 50h2v6h-2z" opacity=".9"/>
    <path class="s" d="M30 70l2-14h8l2 14zM118 70l2-18h8l2 18z" opacity=".8"/>
    <path class="sm" d="M20 74q60-14 120 0" stroke-dasharray="2 6" opacity=".6"/>
    ${SPARKS([[80, 14, 1.4], [74, 10, 0.9], [86, 8, 1]]).replace(/class="e"/g, 'class="p"')}
    ${GROUND}`,

  mortar: `${HILLS}
    <path class="k" d="M54 70l8-56h36l8 56z"/><path class="m" d="M60 14h40v-6H60z"/>
    <path class="ln" d="M64 24h32M62 38h36M60 52h40"/>
    <path class="k" d="M98 20l36-6v6l-36 6z"/>
    ${[40, 120].map(x => `<circle class="k" cx="${x}" cy="70" r="6"/>`).join('')}
    <path class="k" d="M40 70h80" stroke="#0b0806" stroke-width="3"/>
    <rect class="e" x="74" y="30" width="12" height="6"/>
    ${GROUND}`,

  port: `${MOON(128, 18, 8)}
    <path class="m" d="M0 58h160v26H0z"/><path class="ln" d="M0 64q20-3 40 0t40 0t40 0t40 0M0 72q20-3 40 0t40 0t40 0t40 0" opacity=".6"/>
    <path class="k" d="M12 58h48v-6H12z"/><path class="k" d="M16 52V40M30 52V38M44 52V40" stroke="#0b0806" stroke-width="2"/>
    <path class="k" d="M84 62h52l-8 10H92z"/><path class="k" d="M108 62V20" stroke="#0b0806" stroke-width="2"/>
    <path class="w" d="M110 22q16 10 0 34z" opacity=".85"/><path class="w" d="M106 24q-14 10 0 32z" opacity=".6"/>
    <circle class="y" cx="24" cy="36" r="2.5"/>`,

  university: `${HILLS}
    <path class="k" d="M40 70V34h80v36z"/><path class="k" d="M32 36l48-24 48 24z"/>
    <path class="k" d="M74 14V2h12v12z"/><circle class="y" cx="80" cy="7" r="2.5"/>
    ${[50, 62, 74, 86, 98, 110].map(x => `<rect class="y" x="${x - 2}" y="42" width="4" height="10" opacity="${x % 24 ? 1 : 0.6}"/>`).join('')}
    <path class="e" d="M74 70V58a6 6 0 0 1 12 0v12z"/>
    <path class="w" d="M126 58l10-4 10 4-10 4z"/><path class="ln" d="M136 62v6"/>
    ${GROUND}`,

  depot: `${HILLS}
    <path class="k" d="M24 70V44h56v26z"/><path class="k" d="M20 46l32-14 32 14z"/>
    <rect class="s" x="92" y="54" width="18" height="16"/><rect class="s" x="112" y="58" width="14" height="12"/><rect class="s" x="98" y="40" width="16" height="14"/>
    <path class="ln" d="M92 54l18 16M110 54L92 70M112 58l14 12"/>
    <path class="k" d="M134 70l4-16h10l4 16z"/><ellipse class="k" cx="143" cy="54" rx="5" ry="2"/>
    <rect class="y" x="44" y="54" width="10" height="16"/>
    ${GROUND}`,

  spy: `${MOON(118, 18, 9)}
    <path class="k" d="M0 70V36h40v34zM44 70V24h36v46zM84 70V40h32v30zM120 70V30h40v40z"/>
    <path class="k" d="M44 24l18-10 18 10zM120 30l20-10 20 10z"/>
    <rect class="y" x="56" y="34" width="6" height="8"/><rect class="y" x="132" y="40" width="5" height="7"/>
    <path class="k" d="M92 40q4-10 10-6l2 6z"/><circle class="k" cx="98" cy="30" r="4"/>
    <path class="m" d="M90 40q8-8 16 0v8H90z"/>
    <path class="w" d="M104 38l8-4-1 3z"/>
    <path class="k" d="M0 70h160v14H0z"/>`,

  /* ---- Township events ---- */
  conversion: `<circle class="y" cx="132" cy="26" r="12" opacity=".8"/>${HILLS}
    <path class="sm" d="M10 72q40-16 80-12t70-10" stroke-dasharray="1 5" opacity=".7"/>
    ${[[30, 0], [50, 3], [70, 1], [90, -1], [110, 2]].map(([x, d]) => `<path class="k" d="M${x - 5} ${72 - d}l2-16q3-3 6 0l2 16z"/><circle class="k" cx="${x}" cy="${51 - d}" r="3.5"/><path class="k" d="M${x + 5} ${70 - d}l3-26" stroke="#0b0806" stroke-width="1.4"/>`).join('')}
    ${GROUND}`,

  shelling: `<path class="m" d="M0 14q40-10 80-4t80 0v8H0z"/>
    ${[[30, 10, 60, 52], [80, 6, 92, 50], [130, 12, 116, 56]].map(([x0, y0, x1, y1]) => `<path class="ln-y" d="M${x0} ${y0}Q${(x0 + x1) / 2} ${y0 - 6} ${x1} ${y1}" stroke-dasharray="2 4" opacity=".7"/><circle class="e" cx="${x1}" cy="${y1}" r="4"/>`).join('')}
    ${HILLS}
    <path class="k" d="M40 70V50h30v20zM94 70V46h26v24z"/><path class="e" d="M50 50q4-12 8-4q4-8 6 4z"/><path class="e" d="M100 46q4-10 7-2q4-6 6 2z"/>
    ${GROUND}`,

  blockade: `${MOON(130, 18, 7)}
    <path class="m" d="M0 56h160v28H0z"/>
    ${[20, 46, 72, 98, 124].map(x => `<path class="k" d="M${x} 62h22l-4 6h-14z"/><path class="k" d="M${x + 11} 62V40" stroke="#0b0806" stroke-width="1.6"/><path class="b" d="M${x + 12} 40h10l-3 3 3 3h-10z"/>`).join('')}
    <path class="k" d="M0 64q80 4 160 0" stroke="#0b0806" stroke-width="2" fill="none"/>`,

  lossfaith: `${HILLS}
    <path class="k" d="M58 70V36l22-14 22 14v34z"/><path class="k" d="M76 24V10h8v14z"/>
    <path class="w" d="M66 70V54a14 14 0 0 1 28 0v16z" opacity=".25"/>
    <path class="k" d="M66 50l28 20M94 50L66 70" stroke="#0b0806" stroke-width="3"/>
    <path class="b" d="M60 46l40 0" stroke="#9a1e14" stroke-width="2.5"/>
    <path class="w" d="M112 36q6-2 8 4q-6 0-8-4z" opacity=".5"/>
    ${GROUND}`,

  research: `<path class="y" d="M80 46l-40-30M80 46l40-30M80 46V8" stroke="#ffc66b" stroke-width="1" opacity=".5"/>
    <path class="k" d="M40 70l6-14h68l6 14z"/>
    <path class="w" d="M50 58q15-6 30 0q15-6 30 0v-14q-15-6-30 0q-15-6-30 0z"/>
    <path class="ln" d="M80 44v14M56 48q10-3 20 0M56 52q10-3 20 0M84 48q10-3 20 0M84 52q10-3 20 0"/>
    <circle class="y" cx="80" cy="32" r="6"/>
    ${SPARKS([[64, 24, 1.3], [96, 20, 1.1], [80, 14, 1], [70, 36, 0.8], [92, 34, 0.9]]).replace(/class="e"/g, 'class="y"')}
    ${GROUND}`,

  demolition: `${HILLS}${SMOKE(60, 34)}${SMOKE(100, 30)}
    <path class="k" d="M40 70V40h10v-8h12v10l8-6v34zM90 70V46l10-4v-8h14v36z"/>
    <path class="k" d="M70 70l4-24 10 4-2 20z" transform="rotate(12 76 58)"/>
    <path class="s" d="M58 70l6-6 8 6zM82 70l4-8 10 8zM108 70l3-4 5 4z"/>
    ${SPARKS([[74, 40, 1.4], [86, 44, 1], [66, 46, 1.2], [94, 38, 0.9]])}
    ${GROUND}`,

  revolt: `${HILLS}
    ${[[30, 0], [48, 4], [66, 1], [84, 3], [102, 0], [120, 2]].map(([x, d], i) => `<path class="k" d="M${x - 6} ${72}l2-18q4-3 8 0l2 18z"/><circle class="k" cx="${x}" cy="${49 + d}" r="4"/>
      <path class="k" d="M${x + 3} ${52 + d}l${i % 2 ? 6 : -4} -14" stroke="#0b0806" stroke-width="2.4"/>${i % 2 ? `<path class="e" d="M${x + 9} ${38 + d}q-4-6 1-11q1 5 4 4q1 5-5 7z"/>` : `<circle class="k" cx="${x - 1}" cy="${37 + d}" r="2.6"/>`}`).join('')}
    ${GROUND}`,

  /* ---- Township attachments ---- */
  fortify: `${HILLS}
    <path class="s" d="M50 70V30l30-12 30 12v40z"/>
    <path class="ln" d="M50 40h60M50 50h60M50 60h60M64 30v10M96 30v10M80 40v10M64 50v10M96 50v10M80 60v10"/>
    <path class="k" d="M66 24l14-6 14 6v38q-14 12-14 12t-14-12z"/><path class="y" d="M72 30l8-4 8 4v22q-8 8-8 8t-8-8z" opacity=".9"/>
    ${GROUND}`,

  sabotage: `<circle class="p" cx="80" cy="36" r="22" opacity=".18"/>${HILLS}
    <circle class="ln" cx="80" cy="36" r="18" stroke="#9bd13a" opacity=".8"/>
    <path class="p" d="M80 20l14 26H66z" fill="none" stroke="#a6d63f" stroke-width="2"/>
    <circle class="p" cx="80" cy="36" r="3"/>
    <path class="k" d="M62 70q4-10 18-10q14 0 18 10z"/>
    <path class="k" d="M54 70l12-16M106 70L94 54" stroke="#0b0806" stroke-width="2"/>
    ${GROUND}`,


  conscription: `${HILLS}
    ${[20, 34, 48, 62, 76, 90, 104, 118, 132].map((x, i) => `<path class="k" d="M${x - 5} 72l2-16q3-3 6 0l2 16z"/><circle class="k" cx="${x}" cy="${51 - (i % 2)}" r="3.5"/><path class="k" d="M${x + 4} 70V${30 + (i % 3) * 2}" stroke="#0b0806" stroke-width="1.2"/><path class="w" d="M${x + 2.5} ${31 + (i % 3) * 2}l1.5-5 1.5 5z"/>`).join('')}
    <path class="k" d="M146 72V20" stroke="#0b0806" stroke-width="1.6"/><path class="b" d="M147 20h12v12h-12z"/>
    ${GROUND}`,

  retrofit: `${HILLS}
    <path class="s" d="M46 70V28h68v42z"/>
    <path class="k" d="M40 70V24h8v46zM112 70V24h8v46z"/>
    <path class="k" d="M40 34h80M40 50h80M40 64h80" stroke="#0b0806" stroke-width="3"/>
    ${[44, 116].map(x => [30, 42, 56].map(y => `<circle class="w" cx="${x}" cy="${y}" r="1.6"/>`).join('')).join('')}
    <path class="k" d="M128 30l14 14-4 4-14-14z"/><path class="k" d="M130 44l-8 8" stroke="#0b0806" stroke-width="3"/>
    ${SPARKS([[122, 40, 1.2], [118, 46, 0.9], [126, 36, 0.8]])}
    ${GROUND}`,

  threat: `<circle class="b" cx="80" cy="34" r="20" opacity=".35"/>${HILLS}
    <path class="w" d="M66 28a14 13 0 1 1 28 0v8h-4v4H70v-4h-4z"/>
    <circle class="k" cx="74" cy="28" r="3.5"/><circle class="k" cx="86" cy="28" r="3.5"/><path class="k" d="M78 34l2-3 2 3z"/>
    <path class="b" d="M54 52l52-40M54 12l52 40" stroke="#9a1e14" stroke-width="4" stroke-linecap="round" opacity=".9"/>
    ${GROUND}`,

  /* ---- Township reactions ---- */
  martyr: `<circle class="y" cx="80" cy="22" r="14" opacity=".9"/>${[0, 40, 80, 120, 160, 200, 240, 280, 320].map(a => { const r = a * Math.PI / 180; return `<path class="ln-y" d="M${80 + Math.cos(r) * 18} ${22 + Math.sin(r) * 18}L${80 + Math.cos(r) * 26} ${22 + Math.sin(r) * 26}"/>`; }).join('')}
    ${HILLS}
    <path class="k" d="M72 72l2-22q6-4 12 0l2 22z"/><circle class="k" cx="80" cy="44" r="5"/>
    <path class="k" d="M74 52L62 40M86 52l12-12" stroke="#0b0806" stroke-width="3"/>
    <path class="w" d="M76 38q4-4 8 0" fill="none" stroke="#e6dccb" stroke-width="1.2"/>
    ${GROUND}`,

  outrage: `${HILLS}${SMOKE(52, 36)}
    <path class="k" d="M30 70V48l14-10 14 10v22z"/><path class="e" d="M32 48q4-12 8-4q3-8 7 0q3-6 8 4z"/>
    <path class="k" d="M98 72l3-20q6-4 12 0l3 20z"/><circle class="k" cx="107" cy="46" r="5"/>
    <path class="k" d="M112 52l14-16" stroke="#0b0806" stroke-width="2.4"/><path class="w" d="M124 30l6 0-2 8z"/>
    <path class="b" d="M100 38l-6-6M114 38l6-6M107 36v-8" stroke="#9a1e14" stroke-width="2" opacity=".9"/>
    ${GROUND}`,

  /* ---- City sites ---- */
  silo: `${HILLS}
    <path class="k" d="M58 70V30h44v40z"/><path class="k" d="M54 30v-6h8v6h8v-6h8v6h8v-6h8v6h8v-6h8v6"/>
    <path class="k" d="M66 22l26-10 4 4-26 10z"/><path class="k" d="M66 22l-4 6M92 12l2-6" stroke="#0b0806" stroke-width="2"/>
    <path class="ln" d="M66 18q14-10 30-4" opacity=".8"/>
    <path class="w" d="M96 13l22-8-20 12z"/>
    <rect class="y" x="76" y="40" width="8" height="10"/><path class="e" d="M74 70V58a6 6 0 0 1 12 0v12z"/>
    ${GROUND}`,

  robotics: `${HILLS}
    <ellipse class="s" cx="80" cy="64" rx="34" ry="8"/><path class="s" d="M46 64V56h68v8z"/>
    <ellipse class="k" cx="80" cy="56" rx="30" ry="6"/>
    <path class="y" d="M66 54q14-40 28 0z" opacity=".25"/>
    <ellipse class="y" cx="80" cy="56" rx="22" ry="3.5"/>
    ${SPARKS([[80, 36, 2], [72, 28, 1.4], [88, 22, 1.6], [80, 14, 1.2], [92, 40, 1], [68, 42, 1]]).replace(/class="e"/g, 'class="y"')}
    ${GROUND}`,

  radio: `${MOON(30, 20, 7)}${HILLS}
    <path class="k" d="M72 70l2-50h12l2 50z"/><path class="k" d="M68 22l12-10 12 10z"/>
    <rect class="y" x="78" y="28" width="4" height="8"/>
    <path class="k" d="M88 18l18-4v8l-18 0z"/><path class="k" d="M106 12l14-4v16l-14-4z"/>
    <path class="ln-y" d="M124 10q6 6 0 12M130 6q10 10 0 20" opacity=".8"/>
    <path class="b" d="M81 12h12l-3 3 3 3H81z"/>
    ${GROUND}`,

  arms: `${HILLS}${SMOKE(118, 26)}
    <path class="k" d="M24 70V40h92v30z"/><path class="k" d="M112 40V24h12v46h-8z"/>
    <path class="k" d="M24 40l18-10v10l18-10v10l18-10v10l18-10v10"/>
    <rect class="e" x="36" y="50" width="20" height="12"/><rect class="e" x="72" y="50" width="20" height="12"/>
    ${[132, 140, 148].map(x => `<path class="k" d="M${x} 70V44" stroke="#0b0806" stroke-width="1.4"/><path class="w" d="M${x - 2} 45l2-7 2 7z"/>`).join('')}
    <path class="w" d="M128 70l12-8 12 8z" opacity=".7"/>
    ${GROUND}`,

  bank: `${HILLS}
    <path class="s" d="M36 70V36h88v34z"/><path class="k" d="M30 38l50-22 50 22z"/>
    ${[46, 62, 92, 108].map(x => `<rect class="k" x="${x}" y="40" width="6" height="26"/>`).join('')}
    <rect class="k" x="74" y="48" width="12" height="18"/>
    <circle class="y" cx="80" cy="30" r="4"/>
    ${[[20, 66], [26, 66], [23, 61], [136, 66], [142, 66], [139, 61]].map(([x, y]) => `<ellipse class="y" cx="${x}" cy="${y}" rx="4" ry="2"/>`).join('')}
    ${GROUND}`,

  pplant: `${HILLS}
    <path class="k" d="M40 70V34h80v36z"/><path class="k" d="M52 34V14h10v20zM98 34V18h10v16z"/>
    <path class="e" d="M57 14q-6-10 0-14q2 6 4 4q2 6-4 10z"/><path class="e" d="M103 18q-6-8 0-12q2 6 4 4q2 4-4 8z"/>
    <path class="e" d="M60 70V52a20 20 0 0 1 40 0v18z"/><path class="y" d="M68 70V56a12 12 0 0 1 24 0v14z"/>
    <path class="k" d="M64 52h32M64 58h32M64 64h32" stroke="#0b0806" stroke-width="1.5" opacity=".7"/>
    ${GROUND}`,

  /* ---- City events ---- */
  airstrike: `<path class="m" d="M0 30q20-24 50-14q20-16 50-4q30-12 60 6v-18H0z"/>
    <path class="p" d="M30 26q20 10 40 0q20-10 40 0" fill="none" stroke="#a6d63f" stroke-width="2" opacity=".6"/>
    <path class="y" d="M46 24l-8 14h6l-8 16 16-20h-6l6-10z"/><path class="y" d="M112 22l-8 14h6l-8 16 16-20h-6l6-10z"/>
    ${HILLS}
    <path class="k" d="M24 70V54h20v16zM96 70V50h22v20z"/>
    ${SPARKS([[36, 54, 1.4], [104, 50, 1.4], [40, 58, 1], [112, 54, 1]])}
    ${GROUND}`,

  bioweapon: `${MOON(120, 18, 8)}${HILLS}
    <path class="p" d="M10 64q20-24 40-10q20-20 40-4q20-18 60 0v20H10z" opacity=".35"/>
    <path class="p" d="M20 66q20-14 40-6q20-12 40-2q20-10 50 4" fill="none" stroke="#a6d63f" stroke-width="2" opacity=".6"/>
    <path class="k" d="M40 70V54l10-8 10 8v16zM96 70V50l12-8 12 8v20z"/>
    <path class="w" d="M74 62a6 6 0 1 1 12 0v4h-12z"/><circle class="k" cx="78" cy="61" r="1.4"/><circle class="k" cx="82" cy="61" r="1.4"/>
    ${GROUND}`,

  archaeology: `${HILLS}
    <path class="k" d="M0 70h60l8 10h24l8-10h60v14H0z"/>
    <path class="m" d="M60 70l8 10h24l8-10z" opacity=".6"/>
    <path class="w" d="M70 76q4-4 8 0q4-4 8 0" fill="none" stroke="#e6dccb" stroke-width="2"/>
    <path class="y" d="M80 72l4 2-4 2-4-2z"/>
    <path class="k" d="M110 70l14-30" stroke="#0b0806" stroke-width="2.4"/><path class="k" d="M118 38q10-4 16 2q-8-1-14 2z"/>
    <path class="k" d="M30 70l3-18q5-4 10 0l3 18z"/><circle class="k" cx="38" cy="47" r="4"/>
    ${GROUND.replace('V84 H0Z', 'V70 H0Z')}`,

  ruthless: `${HILLS}
    <path class="s" d="M50 70l6-18h48l6 18z"/>
    <path class="b" d="M60 52h40v4H60z"/><path class="b" d="M66 56v8q1 3 2 0v-8zM90 56v6q1 3 2 0v-6z"/>
    <path class="k" d="M70 34q10-16 20 0v12H70z"/><circle class="b" cx="80" cy="30" r="4"/>
    <path class="k" d="M98 44l18-22" stroke="#0b0806" stroke-width="3"/><path class="w" d="M114 18l8-2-2 8z"/>
    ${GROUND}`,

  oil: `${HILLS}${SMOKE(40, 30)}${SMOKE(118, 26)}
    <path class="k" d="M10 70l10-26 6 6 8-14 8 34z"/><path class="k" d="M120 70l6-18 6 4 6-12 8 26z"/>
    <path class="m" d="M48 70q16-10 32-2q16-8 32 2z"/>
    <path class="k" d="M60 70l8-26M68 44l12 26M76 52h12" stroke="#0b0806" stroke-width="2"/>
    <path class="e" d="M90 70q2-10 6-6q2-6 6 0q2-4 4 6z"/>
    ${GROUND}`,

  dilemma: `${HILLS}
    <path class="k" d="M78 70V26h4v44z"/><path class="k" d="M44 30h72" stroke="#0b0806" stroke-width="3"/>
    <path class="k" d="M50 30l-8 16h16zM110 30l-8 16h16z" fill="none" stroke="#0b0806" stroke-width="1.4"/>
    <path class="k" d="M40 46q10 6 20 0zM100 46q10 6 20 0z"/>
    <path class="k" d="M44 44V36h12v8zM104 44l2-8 4 4 4-4 2 8z" />
    <path class="b" d="M42 54q8 4 16 0" fill="none" stroke="#9a1e14" stroke-width="2"/>
    <circle class="y" cx="80" cy="22" r="4"/>
    ${GROUND}`,

  surgical: `${MOON(124, 18, 9)}
    <path class="k" d="M0 70V34h44v36zM116 70V30h44v40z"/><path class="k" d="M44 70V44h28v26z"/>
    <path class="k" d="M84 20q4-6 10-4l4 6-6 4z"/><circle class="k" cx="90" cy="14" r="4"/>
    <path class="m" d="M82 22q8-6 16 0l4 18H78z"/>
    <path class="k" d="M84 40l-6 30M96 40l6 30" stroke="#0b0806" stroke-width="2.6"/>
    <path class="w" d="M100 24l14-6-12 10z"/><path class="w" d="M80 26l-10 4 8 2z" opacity=".8"/>
    <path class="b" d="M114 18q2 4 0 6" fill="none" stroke="#9a1e14" stroke-width="1.6"/>
    <path class="k" d="M0 70h160v14H0z"/>`,

  /* ---- City attachments and reaction ---- */
  compnet: `${HILLS}
    <path class="k" d="M30 70l20-34 4 2-20 34z"/><path class="k" d="M46 32q8-6 14 2q-8-2-12 2z"/>
    <path class="k" d="M108 70l-4-40h6l4 40z"/><path class="k" d="M98 28h22l-2 6h-18z"/>
    <path class="k" d="M66 70l14-28 4 2-14 28z"/><path class="k" d="M78 40l10-6 2 4-10 6z"/>
    ${SPARKS([[56, 30, 1.6], [92, 34, 1.4], [114, 24, 1.6], [62, 22, 1], [104, 18, 1.1], [86, 26, 0.9]]).replace(/class="e"/g, 'class="y"')}
    <path class="ln-y" d="M56 30q20-14 36 4M92 34q10-16 22-10" stroke-dasharray="2 4" opacity=".7"/>
    ${GROUND}`,

  sanctions: `${HILLS}
    <path class="k" d="M50 70V40l30-16 30 16v30z"/><path class="e" d="M70 70V54h20v16z" opacity=".5"/>
    <path class="b" d="M40 70V30h80v40" fill="none" stroke="#9a1e14" stroke-width="2.5" stroke-dasharray="6 4"/>
    <path class="w" d="M58 46l44 18M102 46L58 64" stroke="#e6dccb" stroke-width="3" opacity=".75"/>
    <circle class="b" cx="80" cy="18" r="5"/><path class="w" d="M77 18h6" stroke="#e6dccb" stroke-width="2"/>
    ${GROUND}`,

  trade: `<circle class="b" cx="80" cy="26" r="26" opacity=".35"/>${HILLS}${GROUND}
    <path class="k" d="M64 84l3-20h30l3 20z"/>
    <rect class="k" x="55" y="40" width="48" height="28" rx="9"/>
    <rect class="k" x="55" y="35" width="14" height="16" rx="6.5"/>
    <rect class="k" x="81" y="35" width="12" height="16" rx="6"/>
    <rect class="k" x="92" y="38" width="11" height="14" rx="5.5"/>
    <rect class="k" x="68.5" y="5" width="13" height="42" rx="6.5"/>
    <rect class="s" x="71" y="7.5" width="8" height="8" rx="3.5"/>
    <path d="M70.5 24h9M70.5 34h9" style="fill:none;stroke:#4a382b;stroke-width:1.2"/>
    <path d="M69 39v11M81 39v11M92.5 41v10" style="fill:none;stroke:#4a382b;stroke-width:1.4"/>
    <path class="b" d="M56 8l7 5M53 19h8M57 29l6-3M104 8l-7 5M107 19h-8M103 29l-6-3" stroke="#d2321f" stroke-width="2.6" stroke-linecap="round"/>`,


  /* ---- Empire sites ---- */
  ark: `<circle class="y" cx="80" cy="22" r="18" opacity=".35"/>${HILLS}
    <path class="k" d="M30 70V46h100v24z"/><path class="k" d="M44 46V30h72v16z"/><path class="k" d="M60 30V14h40v16z"/>
    <path class="k" d="M74 14l6-12 6 12z"/>
    ${[50, 66, 94, 110].map(x => `<rect class="y" x="${x}" y="36" width="4" height="6"/>`).join('')}${[36, 54, 72, 90, 108, 122].map(x => `<rect class="y" x="${x - 2}" y="52" width="4" height="6"/>`).join('')}
    <path class="e" d="M72 70V58a8 8 0 0 1 16 0v12z"/><circle class="y" cx="80" cy="22" r="3"/>
    ${GROUND}`,

  doomsday: `${HILLS}
    <path class="k" d="M20 70q10-30 40-36q20-4 30 6l10-4 6 6-10 6q4 10-6 20z"/>
    <path class="k" d="M88 36l12-14 4 6-8 12z"/><path class="k" d="M76 32l4-16 4 12z"/>
    <circle class="e" cx="98" cy="34" r="2"/>
    <path class="e" d="M104 42q20-8 56-4q-30 6-56 10z"/><path class="y" d="M104 44q20-4 50-2q-26 3-50 6z"/>
    ${SPARKS([[150, 40, 1.6], [140, 44, 1.2], [156, 36, 1]])}
    ${GROUND}`,

  forcefield: `${HILLS}
    <path class="y" d="M24 70a56 56 0 0 1 112 0" fill="none" stroke="#ffc66b" stroke-width="2" opacity=".85"/>
    <path class="y" d="M30 70a50 50 0 0 1 100 0z" opacity=".12"/>
    <path class="k" d="M56 70V48h48v22z"/><path class="k" d="M52 48l28-14 28 14z"/>
    <rect class="y" x="76" y="54" width="8" height="10"/>
    <path class="e" d="M120 28l-10 10" stroke="#ff7a1f" stroke-width="2"/><circle class="e" cx="118" cy="30" r="3"/>
    ${SPARKS([[112, 36, 1.2], [116, 40, 0.9], [108, 32, 0.9]]).replace(/class="e"/g, 'class="y"')}
    ${GROUND}`,

  alienweapon: `${HILLS}
    <path class="k" d="M40 70l8-24h64l8 24z"/><path class="k" d="M56 46l6-16h36l6 16z"/>
    <circle class="p" cx="80" cy="34" r="8" opacity=".9"/><circle class="k" cx="80" cy="34" r="3"/>
    <path class="k" d="M58 56h44" stroke="#0b0806" stroke-width="2"/>
    ${[46, 62, 98, 114].map(x => `<circle class="e" cx="${x}" cy="62" r="2"/>`).join('')}
    <path class="ln" d="M80 26V10M70 12l10 6 10-6" opacity=".8"/>
    ${SPARKS([[80, 8, 1.4], [72, 14, 1], [88, 14, 1]]).replace(/class="e"/g, 'class="p"')}
    ${GROUND}`,

  replicator: `${HILLS}
    <path class="s" d="M28 70l8-20h36l8 20z"/><path class="s" d="M80 70l8-20h36l8 20z" opacity=".7"/>
    <path class="w" d="M76 20v44" stroke="#e6dccb" stroke-width="2.5"/>
    <path class="k" d="M44 50V38l10-8 10 8v12zM96 50V38l10-8 10 8v12z"/>
    <path class="y" d="M50 50v-6h8v6zM102 50v-6h8v6z"/>
    <path class="e" d="M70 18q6-8 12 0" fill="none" stroke="#ff7a1f" stroke-width="2"/>
    ${SPARKS([[76, 30, 1.4], [76, 46, 1.2], [76, 58, 1]])}
    ${GROUND}`,

  /* ---- Empire events and attachment ---- */
  mindcontrol: `<circle class="p" cx="80" cy="30" r="22" opacity=".15"/>${HILLS}
    <path class="p" d="M80 30m-16 0a16 16 0 1 0 32 0a16 16 0 1 0 -32 0M80 30m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" fill="none" stroke="#a6d63f" stroke-width="1.6"/>
    <circle class="p" cx="80" cy="30" r="3"/>
    ${[[34, 0], [52, 2], [108, 1], [126, 3]].map(([x, d]) => `<path class="k" d="M${x - 6} 72l2-18q4-3 8 0l2 18z"/><circle class="k" cx="${x}" cy="${49 + d}" r="4"/><circle class="p" cx="${x + 1.5}" cy="${48 + d}" r="1"/>`).join('')}
    <path class="ln-y" d="M80 46L40 52M80 46L56 54M80 46l26 6M80 46l44 6" stroke="#a6d63f" stroke-dasharray="2 3" opacity=".7"/>
    ${GROUND}`,

  assimilation: `${HILLS}
    <path class="k" d="M60 70V40l20-14 20 14v30z"/><path class="e" d="M74 70V56h12v14z"/>
    <path class="k" d="M80 26V4" stroke="#0b0806" stroke-width="1.6"/><path class="b" d="M81 4h16l-4 5 4 5H81z"/>
    <path class="w" d="M60 20l-14-4M100 20l14-4" stroke="#e6dccb" stroke-width="1" opacity=".4"/>
    ${[[24, 0], [38, 2], [122, 1], [136, 2]].map(([x, d]) => `<path class="k" d="M${x - 5} 72l2-16q3-3 6 0l2 16z"/><circle class="k" cx="${x}" cy="${51 + d}" r="3.5"/><path class="k" d="M${x + (x < 80 ? 5 : -5)} 70l${x < 80 ? 6 : -6} -24" stroke="#0b0806" stroke-width="1.4"/>`).join('')}
    ${GROUND}`,

  brainemu: `<circle class="y" cx="80" cy="34" r="22"/>${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => { const r = a * Math.PI / 180; return `<path class="ln-y" d="M${80 + Math.cos(r) * 26} ${34 + Math.sin(r) * 26}L${80 + Math.cos(r) * 36} ${34 + Math.sin(r) * 36}"/>`; }).join('')}
    ${HILLS}
    <path class="k" d="M20 70V52l10-8 10 8v18zM44 70V48l12-10 12 10v22zM92 70V48l12-10 12 10v22zM120 70V52l10-8 10 8v18z"/>
    ${[28, 54, 100, 128].map(x => `<rect class="y" x="${x}" y="56" width="4" height="6"/>`).join('')}
    ${GROUND}`,

  nanobots: `${HILLS}
    <path class="k" d="M50 70V42l14-6v-8l16-6 16 6v8l14 6v28z" opacity=".95"/>
    <path class="m" d="M50 42h60" stroke="#231912" stroke-width="2"/>
    ${Array.from({ length: 26 }, (_, i) => { const x = 50 + ((i * 37) % 64), y = 20 + ((i * 23) % 44); return `<rect class="${i % 3 ? 's' : 'e'}" x="${x + (i % 5) * 6 - 10}" y="${y - (i % 4) * 4}" width="${2 + (i % 3)}" height="${2 + (i % 2)}"/>`; }).join('')}
    <path class="w" d="M110 30q16-10 30 4" fill="none" stroke="#e6dccb" stroke-width="1" opacity=".5" stroke-dasharray="2 3"/>
    ${GROUND}`,

  /* Oracle's Eye: a great watching eye hanging over a stone plinth, light raying out */
  oracle: `<circle class="y" cx="80" cy="32" r="30" opacity=".16"/>${HILLS}
    <path class="y" d="M80 32L44 6M80 32L116 6M80 32L36 32M80 32L124 32M80 32L50 54M80 32L110 54" stroke="#ffc66b" stroke-width="1.1" opacity=".55" fill="none"/>
    <path class="s" d="M64 72l4-14h24l4 14z"/><rect class="k" x="60" y="54" width="40" height="5" rx="1"/>
    <path class="k" d="M54 32q26-22 52 0q-26 22-52 0z"/>
    <path class="w" d="M58 32q22-16 44 0q-22 16-44 0z"/>
    <circle class="e" cx="80" cy="32" r="8"/><circle class="k" cx="80" cy="32" r="4"/><circle class="w" cx="82" cy="30" r="1.4"/>
    ${SPARKS([[52, 16, 1], [108, 14, 1.1], [44, 40, 0.9], [118, 42, 0.9]]).replace(/class="e"/g, 'class="y"')}
    ${GROUND}`,
  sentient: `<circle class="y" cx="80" cy="36" r="24" opacity=".2"/>${HILLS}
    <path class="k" d="M50 62l6-22h48l6 22z"/>
    <path class="m" d="M54 44q13-6 26 0q13-6 26 0v14q-13-6-26 0q-13-6-26 0z"/>
    <path class="ln" d="M80 44v14"/>
    <ellipse class="y" cx="80" cy="30" rx="10" ry="6"/><circle class="k" cx="80" cy="30" r="3.4"/><circle class="w" cx="81" cy="29" r="1"/>
    <path class="y" d="M66 28q14-14 28 0" fill="none" stroke="#ffc66b" stroke-width="1.4"/>
    ${SPARKS([[60, 22, 1.2], [100, 20, 1.2], [70, 14, 0.9], [92, 12, 0.9]]).replace(/class="e"/g, 'class="y"')}
    ${GROUND}`
};

