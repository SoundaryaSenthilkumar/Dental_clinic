// Editable logo mark. Replace this SVG with your brand mark; the clinic name comes from clinicConfig.js.
export default function Logo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false" className="logo-mark">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1677C8" />
          <stop offset="1" stopColor="#123456" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#logo-grad)" />
      <path
        d="M32 14c-5-4-14-4-17 3-2 5 0 11 3 17 3 7 4 17 8 17 4 0 4-8 6-8s2 8 6 8c4 0 5-10 8-17 3-6 5-12 3-17-3-7-12-7-17-3z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
