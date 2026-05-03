// Ilustrasi SVG isometrik kamar kos — dipakai di KamarCard & PhotoCarousel
// Tidak perlu props; semua warna mengikuti brand #1e1b4b

export function RoomPlaceholder({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const scale = size === "sm" ? 0.7 : size === "lg" ? 1.3 : 1;
  const w = Math.round(160 * scale);
  const h = Math.round(140 * scale);

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 160 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* ── lantai ── */}
      <ellipse cx="80" cy="118" rx="60" ry="14" fill="#1e1b4b" fillOpacity="0.07" />

      {/* ── dinding belakang kiri ── */}
      <path
        d="M22 82 L22 30 L80 12 L80 64 Z"
        fill="#1e1b4b"
        fillOpacity="0.10"
        stroke="#1e1b4b"
        strokeOpacity="0.18"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* ── dinding belakang kanan ── */}
      <path
        d="M80 12 L138 30 L138 82 L80 64 Z"
        fill="#1e1b4b"
        fillOpacity="0.06"
        stroke="#1e1b4b"
        strokeOpacity="0.14"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* ── lantai kamar ── */}
      <path
        d="M22 82 L80 64 L138 82 L80 100 Z"
        fill="#1e1b4b"
        fillOpacity="0.04"
        stroke="#1e1b4b"
        strokeOpacity="0.12"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* ── jendela dinding kiri ── */}
      <rect
        x="32"
        y="38"
        width="20"
        height="16"
        rx="2"
        fill="#c7d2fe"
        fillOpacity="0.5"
        stroke="#1e1b4b"
        strokeOpacity="0.2"
        strokeWidth="1"
        transform="skewY(18)"
      />
      {/* kaca jendela salib */}
      <line x1="42" y1="44" x2="42" y2="58" stroke="#1e1b4b" strokeOpacity="0.2" strokeWidth="0.8" transform="skewY(18)" />
      <line x1="32" y1="51" x2="52" y2="51" stroke="#1e1b4b" strokeOpacity="0.2" strokeWidth="0.8" transform="skewY(18)" />

      {/* ── pintu dinding kanan ── */}
      <path
        d="M98 55 L98 90 L118 84 L118 49 Z"
        fill="#1e1b4b"
        fillOpacity="0.13"
        stroke="#1e1b4b"
        strokeOpacity="0.22"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* kenop pintu */}
      <circle cx="101" cy="72" r="2" fill="#1e1b4b" fillOpacity="0.3" />

      {/* ── kasur / tempat tidur ── */}
      {/* badan kasur */}
      <path
        d="M34 94 L34 86 L66 76 L66 84 Z"
        fill="#e0e7ff"
        stroke="#1e1b4b"
        strokeOpacity="0.15"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* bantal */}
      <path
        d="M57 78 L57 74 L66 71 L66 75 Z"
        fill="#c7d2fe"
        stroke="#1e1b4b"
        strokeOpacity="0.15"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* rangka tempat tidur */}
      <path
        d="M30 96 L30 88 L34 86 L34 94 Z"
        fill="#1e1b4b"
        fillOpacity="0.12"
        strokeWidth="0"
      />
      <path
        d="M30 88 L34 86 L66 76 L62 78 Z"
        fill="#1e1b4b"
        fillOpacity="0.08"
        strokeWidth="0"
      />

      {/* ── meja belajar ── */}
      <path
        d="M86 88 L86 80 L108 74 L108 82 Z"
        fill="#ddd6c8"
        stroke="#1e1b4b"
        strokeOpacity="0.15"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* kaki meja */}
      <line x1="86" y1="88" x2="86" y2="94" stroke="#1e1b4b" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="108" y1="82" x2="108" y2="88" stroke="#1e1b4b" strokeOpacity="0.2" strokeWidth="1" />
      {/* buku di meja */}
      <rect x="90" y="73" width="5" height="7" rx="0.5" fill="#818cf8" fillOpacity="0.6" transform="skewY(-15)" />
      <rect x="96" y="71" width="5" height="7" rx="0.5" fill="#a5b4fc" fillOpacity="0.6" transform="skewY(-15)" />

      {/* ── lemari ── */}
      <path
        d="M44 68 L44 44 L58 40 L58 64 Z"
        fill="#c4b5a0"
        fillOpacity="0.4"
        stroke="#1e1b4b"
        strokeOpacity="0.15"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      {/* pintu lemari tengah */}
      <line x1="51" y1="42" x2="51" y2="66" stroke="#1e1b4b" strokeOpacity="0.15" strokeWidth="0.6" />
      {/* gagang lemari */}
      <circle cx="48" cy="55" r="1.2" fill="#1e1b4b" fillOpacity="0.25" />
      <circle cx="54" cy="53" r="1.2" fill="#1e1b4b" fillOpacity="0.25" />

      {/* ── garis grid lantai subtle ── */}
      <line x1="51" y1="82" x2="80" y2="72" stroke="#1e1b4b" strokeOpacity="0.05" strokeWidth="0.7" />
      <line x1="80" y1="72" x2="109" y2="82" stroke="#1e1b4b" strokeOpacity="0.05" strokeWidth="0.7" />
    </svg>
  );
}