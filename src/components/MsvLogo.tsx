/**
 * MSV Logo SVG components — recreated from brand artwork.
 * MsvLogoMark: oval medallion only (navbar, small contexts)
 * MsvLogo: full lockup with wordmark (hero, footer)
 */

const GOLD = '#B08D57';
const CREAM = '#E8DCC8';

// ── Daisy helper ────────────────────────────────────────────────────────────
function Daisy({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      {[0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = ((deg - 90) * Math.PI) / 180;
        const px = cx + Math.cos(rad) * r * 0.58;
        const py = cy + Math.sin(rad) * r * 0.58;
        return (
          <ellipse
            key={deg}
            cx={px}
            cy={py}
            rx={r * 0.3}
            ry={r * 0.62}
            fill={GOLD}
            transform={`rotate(${deg}, ${px}, ${py})`}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.32} fill={GOLD} />
    </g>
  );
}

// ── Full logo (460 × 680 viewBox) ───────────────────────────────────────────
export function MsvLogo({
  className = '',
  width = 220,
  theme = 'dark',
}: {
  className?: string;
  width?: number;
  theme?: 'dark' | 'light';
}) {
  const textColor = theme === 'dark' ? CREAM : '#1a1f1c';
  const height = Math.round(width * (680 / 460));

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 460 680"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="My Secret Vitality — Peptides"
    >
      {/* ── Oval frame ── */}
      <ellipse cx="230" cy="202" rx="152" ry="185" fill="none" stroke={GOLD} strokeWidth="2.2" />
      <ellipse cx="230" cy="202" rx="142" ry="175" fill="none" stroke={GOLD} strokeWidth="0.9" opacity="0.65" />

      {/* ── Daisies ── */}
      <Daisy cx={230} cy={17} r={13} />
      <Daisy cx={230} cy={387} r={13} />

      {/* ── Botanical stem ── */}
      <path
        d="M177,372 C173,342 174,310 181,278 C188,246 197,216 201,183 C205,152 205,120 209,90 C211,77 214,68 217,60"
        fill="none"
        stroke={CREAM}
        strokeWidth="2.1"
        strokeLinecap="round"
      />

      {/* Leaf pair 1 — bottom ~y=305 */}
      <path d="M181,305 C163,291 157,272 168,257 C178,245 192,256 187,274 Z" fill={CREAM} opacity="0.9" />
      <path d="M182,294 C197,278 208,261 202,246 C196,233 183,244 183,264 Z" fill={CREAM} opacity="0.85" />

      {/* Leaf pair 2 — ~y=245 */}
      <path d="M184,246 C166,233 160,213 172,200 C182,188 196,199 191,218 Z" fill={CREAM} opacity="0.88" />
      <path d="M185,234 C201,219 211,202 206,187 C200,174 188,185 187,205 Z" fill={CREAM} opacity="0.82" />

      {/* Leaf pair 3 — ~y=183 */}
      <path d="M187,184 C170,172 165,152 177,140 C187,130 200,141 196,159 Z" fill={CREAM} opacity="0.86" />
      <path d="M189,172 C205,158 216,142 210,128 C205,115 193,125 192,145 Z" fill={CREAM} opacity="0.80" />

      {/* Leaf pair 4 — top ~y=123 */}
      <path d="M192,124 C177,113 173,94 184,83 C194,73 207,84 202,102 Z" fill={CREAM} opacity="0.82" />
      <path d="M194,112 C209,98 220,83 215,69 C210,57 199,67 198,87 Z" fill={CREAM} opacity="0.74" />

      {/* ── Face / flowing hair line ── */}
      <path
        d="M268,65 C276,82 280,102 278,125 C276,144 270,156 270,172 C270,193 275,218 271,242 C267,264 257,282 253,304"
        fill="none"
        stroke={CREAM}
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.72"
      />

      {/* ── Closed eye with lashes ── */}
      <path
        d="M294,156 Q322,138 355,150"
        fill="none"
        stroke={CREAM}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Lashes sweeping upward */}
      <line x1="296" y1="154" x2="292" y2="142" stroke={CREAM} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="304" y1="150" x2="301" y2="138" stroke={CREAM} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="313" y1="146" x2="311" y2="133" stroke={CREAM} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="323" y1="143" x2="322" y2="130" stroke={CREAM} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="333" y1="143" x2="333" y2="130" stroke={CREAM} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="342" y1="144" x2="343" y2="131" stroke={CREAM} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="351" y1="148" x2="353" y2="136" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" />

      {/* ── Hand — shush gesture ── */}

      {/* Index finger (pointing straight up) */}
      <path
        d="M250,162 C248,147 248,130 249,113 C250,101 253,95 258,94 C263,93 267,99 267,112 C267,128 265,146 264,162"
        fill="none"
        stroke={CREAM}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Left side of palm / thumb side */}
      <path
        d="M250,162 C247,178 245,195 244,212 C243,228 244,244 245,260 C246,278 248,296 245,312 C242,324 234,330 224,327 C214,324 208,314 209,300 C210,287 218,276 222,263 C226,250 228,237 228,222 C228,208 226,194 227,180 C228,168 232,158 237,152"
        fill="none"
        stroke={CREAM}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Knuckle bumps — folded middle finger */}
      <path
        d="M264,168 C272,166 278,172 278,180 C278,188 271,192 264,189"
        fill="none"
        stroke={CREAM}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Ring finger */}
      <path
        d="M263,190 C272,188 278,195 277,204 C276,212 268,215 262,212"
        fill="none"
        stroke={CREAM}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Pinky */}
      <path
        d="M260,213 C268,212 273,218 272,227 C271,234 264,237 258,233"
        fill="none"
        stroke={CREAM}
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Bottom of palm (right side, connecting knuckles down) */}
      <path
        d="M258,233 C256,248 255,264 256,278 C257,292 260,306 257,318 C254,328 245,332 235,328"
        fill="none"
        stroke={CREAM}
        strokeWidth="1.9"
        strokeLinecap="round"
      />

      {/* Thumb */}
      <path
        d="M237,218 C228,214 220,208 220,197 C220,186 229,181 238,187 C245,192 248,204 246,215"
        fill="none"
        stroke={CREAM}
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      {/* Lip touch dot */}
      <circle cx="257" cy="162" r="3.2" fill={CREAM} opacity="0.78" />

      {/* ── Wordmark ── */}
      <text
        x="230"
        y="480"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="68"
        fontWeight="400"
        fill={textColor}
        letterSpacing="0.5"
      >
        My Secret
      </text>
      <text
        x="230"
        y="551"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="68"
        fontWeight="400"
        fill={textColor}
        letterSpacing="0.5"
      >
        Vitality
      </text>

      {/* ── Peptides rule ── */}
      <line x1="52" y1="585" x2="118" y2="585" stroke={GOLD} strokeWidth="1.5" />
      <text
        x="230"
        y="590"
        textAnchor="middle"
        fontFamily="'Helvetica Neue', Arial, sans-serif"
        fontSize="13"
        fontWeight="400"
        fill={GOLD}
        letterSpacing="6"
      >
        PEPTIDES
      </text>
      <line x1="342" y1="585" x2="408" y2="585" stroke={GOLD} strokeWidth="1.5" />
    </svg>
  );
}

// ── Logo mark (oval medallion only — 80 × 100 viewBox) ──────────────────────
export function MsvLogoMark({ className = '', size = 40 }: { className?: string; size?: number }) {
  const h = Math.round(size * (100 / 80));
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 80 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="My Secret Vitality"
    >
      {/* Oval */}
      <ellipse cx="40" cy="50" rx="34" ry="44" fill="none" stroke={GOLD} strokeWidth="1.4" />
      <ellipse cx="40" cy="50" rx="30" ry="40" fill="none" stroke={GOLD} strokeWidth="0.6" opacity="0.6" />

      {/* Top daisy */}
      <Daisy cx={40} cy={6} r={5} />
      {/* Bottom daisy */}
      <Daisy cx={40} cy={94} r={5} />

      {/* Botanical stem */}
      <path
        d="M30,88 C28,78 29,68 31,57 C33,46 36,36 37,26 C38,19 38.5,14 39,11"
        fill="none"
        stroke={CREAM}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* Leaves simplified */}
      <path d="M30,65 C23,60 22,53 26,48 C30,44 35,48 33,56 Z" fill={CREAM} opacity="0.88" />
      <path d="M31,56 C37,50 40,44 38,38 C36,33 31,37 31,46 Z" fill={CREAM} opacity="0.82" />
      <path d="M32,46 C25,41 24,34 28,30 C32,26 37,30 35,38 Z" fill={CREAM} opacity="0.80" />
      <path d="M33,37 C39,31 43,25 40,20 C38,16 33,20 33,29 Z" fill={CREAM} opacity="0.74" />

      {/* Eye */}
      <path d="M44,33 Q53,27 63,32" fill="none" stroke={CREAM} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="46" y1="32" x2="44" y2="26" stroke={CREAM} strokeWidth="0.9" strokeLinecap="round" />
      <line x1="50" y1="29.5" x2="49" y2="23.5" stroke={CREAM} strokeWidth="0.9" strokeLinecap="round" />
      <line x1="55" y1="28.5" x2="55" y2="22.5" stroke={CREAM} strokeWidth="0.9" strokeLinecap="round" />
      <line x1="60" y1="30" x2="61" y2="24" stroke={CREAM} strokeWidth="0.8" strokeLinecap="round" />

      {/* Face line */}
      <path
        d="M46,17 C48,22 49,28 49,34 C49,40 47,46 47,53 C47,60 49,67 47,74"
        fill="none"
        stroke={CREAM}
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.65"
      />

      {/* Hand — index finger up */}
      <path
        d="M41,36 C40,30 40,25 41,20 C41.5,17 42.5,15.5 44,15.5 C45.5,15.5 46.5,17 46.5,20 C46.5,25 45.5,31 45,37"
        fill="none"
        stroke={CREAM}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Palm outline */}
      <path
        d="M41,37 C40,43 39,50 39,57 C39,64 40,71 38,77 C36,82 31,83 27,81 C23,79 22,73 23,67 C24,61 28,57 29,51 C30,45 30,39 31,35"
        fill="none"
        stroke={CREAM}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Folded finger bumps */}
      <path d="M45,40 C49,39 51,42 50,46 C49,50 45,51 43,49" fill="none" stroke={CREAM} strokeWidth="1" strokeLinecap="round" />
      <path d="M44,50 C48,49 50,53 49,57 C48,61 44,62 42,59" fill="none" stroke={CREAM} strokeWidth="1" strokeLinecap="round" />
      {/* Thumb */}
      <path d="M32,51 C28,49 25,46 26,41 C27,37 32,36 35,40 C37,43 37,49 35,52" fill="none" stroke={CREAM} strokeWidth="1" strokeLinecap="round" />
      {/* Lip dot */}
      <circle cx="43.5" cy="37" r="1.4" fill={CREAM} opacity="0.75" />
    </svg>
  );
}
