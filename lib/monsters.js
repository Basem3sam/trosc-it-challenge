/* ---------- The monster roster (IT-themed enemies) ----------
   One per level; the LAST level always spawns the BOSS.
   Add/rename freely — each one is drawn by monsterSVG() below. */
export const ENEMIES = [
  {
    name: 'THE BUG',
    color: '#7ED957',
    shade: '#3F7D26',
    mouth: 'zigzag',
    extra: 'antenna',
  },
  {
    name: 'SPAM BOT',
    color: '#8FA6C4',
    shade: '#54688A',
    mouth: 'flat',
    extra: 'antenna',
    square: true,
  },
  { name: 'PHISHY', color: '#4DD0E1', shade: '#1F7E8C', mouth: 'fangs' },
  {
    name: 'NULL POINTER',
    color: '#E8E3F2',
    shade: '#8F84B0',
    mouth: 'zigzag',
    ghost: true,
  },
  {
    name: 'CACHE GOBLIN',
    color: '#FFD166',
    shade: '#A8781E',
    mouth: 'grin',
    extra: 'ears',
  },
  {
    name: 'FIREWALL FIEND',
    color: '#FF8C42',
    shade: '#A84E14',
    mouth: 'fangs',
    extra: 'horns',
  },
  {
    name: 'DATA DRAGON',
    color: '#B388FF',
    shade: '#5E35A8',
    mouth: 'fangs',
    extra: 'horns',
    spots: true,
  },
  {
    name: 'LOGIC GOBLIN',
    color: '#FF7EB6',
    shade: '#A82E6C',
    mouth: 'grin',
    extra: 'ears',
  },
  {
    name: 'MAL WORM',
    color: '#FF6FA5',
    shade: '#A82E58',
    mouth: 'zigzag',
    spots: true,
  },
];
export const BOSS = {
  name: 'KERNEL PANIC',
  color: '#FF4655',
  shade: '#8F1F2B',
  mouth: 'fangs',
  extra: 'crown',
  eyes: 3,
  boss: true,
};

/* Procedural monster drawing — body + shine + eyes (blink + ✕ dead-eyes) + mouth + extras */
export function monsterSVG(e) {
  const eyeY = 50;
  const xs = e.eyes === 3 ? [32, 48, 64] : e.eyes === 1 ? [48] : [38, 58];
  const r = e.eyes === 3 ? 5.5 : e.eyes === 1 ? 9 : 7;

  const eyesSvg = xs
    .map((x, idx) => {
      const d = r * 0.55;
      return `<g class="eye" style="animation-delay:${(idx * 0.37).toFixed(2)}s">
  <circle cx="${x}" cy="${eyeY}" r="${r}" fill="#FFF6F0"/>
  <circle class="pupil" cx="${x}" cy="${eyeY + 1.5}" r="${(r * 0.45).toFixed(1)}" fill="#1B0C10"/>
  <g class="deadeyes" stroke="#FF4655" stroke-width="2.6" stroke-linecap="round" fill="none">
    <line x1="${(x - d).toFixed(1)}" y1="${(eyeY - d).toFixed(1)}" x2="${(x + d).toFixed(1)}" y2="${(eyeY + d).toFixed(1)}"/>
    <line x1="${(x + d).toFixed(1)}" y1="${(eyeY - d).toFixed(1)}" x2="${(x - d).toFixed(1)}" y2="${(eyeY + d).toFixed(1)}"/>
  </g>
</g>`;
    })
    .join('');

  const mouth = {
    zigzag: `<path d="M36 68l6 5 6-5 6 5 6-5" fill="none" stroke="${e.shade}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`,
    grin: `<path d="M36 66q12 9 24 0" fill="none" stroke="${e.shade}" stroke-width="3" stroke-linecap="round"/>`,
    fangs: `<path d="M36 65q12 9 24 0" fill="none" stroke="${e.shade}" stroke-width="3" stroke-linecap="round"/><path d="M40 69l3 6 3-6Z" fill="#FFF6F0"/><path d="M50 69l3 6 3-6Z" fill="#FFF6F0"/>`,
    flat: `<line x1="38" y1="68" x2="58" y2="68" stroke="${e.shade}" stroke-width="3" stroke-linecap="round"/>`,
  }[e.mouth || 'zigzag'];

  const extras =
    {
      antenna: `<line x1="38" y1="34" x2="32" y2="18" stroke="${e.shade}" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="16" r="4" fill="${e.shade}"/><line x1="58" y1="34" x2="64" y2="18" stroke="${e.shade}" stroke-width="3" stroke-linecap="round"/><circle cx="64" cy="16" r="4" fill="${e.shade}"/>`,
      horns: `<path d="M32 38 20 16l16 12Z" fill="${e.shade}"/><path d="M64 38 76 16 60 28Z" fill="${e.shade}"/>`,
      ears: `<path d="M26 46 10 36l4 18Z" fill="${e.shade}"/><path d="M70 46 86 36l-4 18Z" fill="${e.shade}"/>`,
      crown: `<path d="M34 26V12l7 6 7-10 7 10 7-6v14Z" fill="#FFC53D" stroke="#C8941F" stroke-width="2" stroke-linejoin="round"/>`,
    }[e.extra] || '';

  const spots = e.spots
    ? `<circle cx="34" cy="38" r="4" fill="${e.shade}" opacity=".55"/><circle cx="62" cy="70" r="3.4" fill="${e.shade}" opacity=".55"/><circle cx="30" cy="66" r="2.8" fill="${e.shade}" opacity=".55"/>`
    : '';

  const body = e.ghost
    ? `<path d="M22 86V52a26 26 0 0 1 52 0v34l-8.6-6-8.7 6-8.7-6-8.7 6-8.7-6Z" fill="${e.color}" stroke="${e.shade}" stroke-width="2"/>`
    : e.square
      ? `<rect x="23" y="33" width="50" height="46" rx="12" fill="${e.color}" stroke="${e.shade}" stroke-width="2"/>`
      : `<ellipse cx="48" cy="57" rx="27" ry="25" fill="${e.color}" stroke="${e.shade}" stroke-width="2"/>`;

  const shine = `<ellipse cx="39" cy="${e.square ? 42 : 43}" rx="11" ry="6" fill="#FFF6F0" opacity=".22"/>`;

  return `<svg viewBox="0 0 96 96" aria-hidden="true">${body}${shine}${spots}${eyesSvg}${mouth}${extras}</svg>`;
}
