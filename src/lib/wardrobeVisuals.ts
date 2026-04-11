type FashionMockKind =
  | 'bomber'
  | 'shirt'
  | 'tank'
  | 'trouser'
  | 'jean'
  | 'sneaker'
  | 'trench'
  | 'bag'
  | 'loafer';

function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function garmentMarkup(kind: FashionMockKind, garment: string, accent: string, hardware: string) {
  switch (kind) {
    case 'bomber':
      return `
        <path d="M178 112c22-10 62-10 84 0l16 35 42 26c10 6 12 20 5 31l-20 29-28-18v138c0 19-15 34-34 34H181c-19 0-34-15-34-34V215l-28 18-20-29c-7-11-5-25 5-31l42-26 32-35Z" fill="${garment}" />
        <path d="M199 112h42v58h-42z" fill="${accent}" opacity="0.7" />
        <path d="M150 203h140" stroke="${hardware}" stroke-width="6" stroke-linecap="round" opacity="0.35" />
      `;
    case 'shirt':
      return `
        <path d="M169 102c25-11 56-11 81 0l22 34 43 24c10 6 14 19 8 30l-19 34-33-19v149c0 19-15 34-34 34H183c-19 0-34-15-34-34V205l-33 19-19-34c-6-11-2-24 8-30l43-24 21-34Z" fill="${garment}" />
        <path d="M210 101v83" stroke="${hardware}" stroke-width="5" stroke-linecap="round" opacity="0.45" />
        <circle cx="210" cy="208" r="4.8" fill="${hardware}" opacity="0.55" />
        <circle cx="210" cy="240" r="4.8" fill="${hardware}" opacity="0.45" />
      `;
    case 'tank':
      return `
        <path d="M157 120c10-22 27-36 53-36h0c26 0 43 14 53 36l21 31v203c0 19-15 34-34 34H170c-19 0-34-15-34-34V151l21-31Z" fill="${garment}" />
        <path d="M179 120c8-17 18-26 31-26 13 0 23 9 31 26" stroke="${accent}" stroke-width="10" stroke-linecap="round" opacity="0.88" />
      `;
    case 'trouser':
      return `
        <path d="M149 91h122l-11 86-20 206h-44l8-126-27 126h-40l12-206-0-86Z" fill="${garment}" />
        <path d="M210 91v293" stroke="${accent}" stroke-width="6" opacity="0.3" />
      `;
    case 'jean':
      return `
        <path d="M150 91h120l-9 81-18 211h-47l7-130-34 130h-34l15-211-0-81Z" fill="${garment}" />
        <path d="M154 124h112" stroke="${accent}" stroke-width="5" opacity="0.42" />
        <circle cx="170" cy="114" r="4.5" fill="${hardware}" />
        <circle cx="250" cy="114" r="4.5" fill="${hardware}" />
      `;
    case 'sneaker':
      return `
        <path d="M110 265c18-21 36-37 66-44l53-12 43 36 56 12c12 3 21 15 21 28v20H88v-18c0-9 8-19 22-22Z" fill="${garment}" />
        <path d="M121 286h208" stroke="${accent}" stroke-width="10" stroke-linecap="round" />
        <path d="M176 236h53" stroke="${hardware}" stroke-width="5" stroke-linecap="round" opacity="0.48" />
      `;
    case 'trench':
      return `
        <path d="M177 94c22-11 54-11 76 0l24 37 33 20c13 8 17 25 8 38l-22 31-34-19v166c0 17-13 30-30 30H198c-17 0-30-13-30-30V201l-34 19-22-31c-9-13-5-30 8-38l33-20 24-37Z" fill="${garment}" />
        <path d="M210 113v214" stroke="${hardware}" stroke-width="6" stroke-linecap="round" opacity="0.34" />
        <path d="M168 218 252 180" stroke="${accent}" stroke-width="8" stroke-linecap="round" opacity="0.8" />
      `;
    case 'bag':
      return `
        <path d="M113 192c0-28 22-50 50-50h94c28 0 50 22 50 50v88c0 26-21 47-47 47H160c-26 0-47-21-47-47v-88Z" fill="${garment}" />
        <path d="M147 167c8-30 28-45 63-45 35 0 55 15 63 45" stroke="${hardware}" stroke-width="12" stroke-linecap="round" fill="none" />
        <rect x="166" y="205" width="88" height="46" rx="20" fill="${accent}" opacity="0.22" />
      `;
    default:
      return `
        <path d="M120 238c18-16 44-30 76-30h51c31 0 54 15 75 35l14 18c5 7 1 16-8 16H103c-10 0-14-10-8-17l25-22Z" fill="${garment}" />
        <path d="M135 271h167" stroke="${accent}" stroke-width="8" stroke-linecap="round" />
        <path d="M196 227h40" stroke="${hardware}" stroke-width="5" stroke-linecap="round" opacity="0.42" />
      `;
  }
}

export function createFashionMockImage({
  label,
  kind,
  backdrop,
  garment,
  accent,
  hardware,
}: {
  label: string;
  kind: FashionMockKind;
  backdrop: [string, string];
  garment: string;
  accent: string;
  hardware: string;
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="760" viewBox="0 0 420 480">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${backdrop[0]}" />
          <stop offset="100%" stop-color="${backdrop[1]}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="16%" r="78%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.95)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="rgba(17,18,23,0.16)" />
        </filter>
      </defs>
      <rect width="420" height="480" rx="36" fill="url(#bg)" />
      <rect x="26" y="24" width="368" height="432" rx="30" fill="rgba(255,255,255,0.28)" />
      <ellipse cx="210" cy="412" rx="116" ry="24" fill="rgba(17,18,23,0.08)" />
      <rect x="70" y="44" width="280" height="360" rx="26" fill="rgba(255,255,255,0.56)" filter="url(#shadow)" />
      <rect x="70" y="44" width="280" height="360" rx="26" fill="url(#glow)" />
      <g transform="translate(0 -6)">
        ${garmentMarkup(kind, garment, accent, hardware)}
      </g>
      <rect x="88" y="418" width="244" height="36" rx="18" fill="rgba(255,255,255,0.84)" />
      <text x="210" y="441" text-anchor="middle" font-family="Arial, sans-serif" font-size="17" fill="#17181c">${label}</text>
    </svg>
  `;

  return svgToDataUrl(svg);
}
