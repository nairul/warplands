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

  cauldron: `${HILLS}<path class="sm" d="M66 30q-5-8 2-14t0-12"/><path class="sm" d="M80 28q5-8-2-14t2-12"/><path class="sm" d="M94 30q-4-7 2-13"/>
    <path class="k" d="M52 40h56l-4 4q4 18-24 22q-28-4-24-22z"/><ellipse class="p" cx="80" cy="41" rx="26" ry="3"/>
    <circle class="p" cx="72" cy="36" r="2.5"/><circle class="p" cx="88" cy="34" r="1.8"/><circle class="p" cx="81" cy="31" r="1.2"/>
    <path class="k" d="M60 62l-6 8M100 62l6 8" stroke="#0b0806" stroke-width="3"/>
    <path class="e" d="M64 70q4-10 8-4q3-9 8 0q5-9 8 0q4-6 8 4z"/><path class="y" d="M72 70q3-6 5-2q3-6 6 0q2-4 5 2z"/>${GROUND}`,

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
    ${GROUND}`
};

