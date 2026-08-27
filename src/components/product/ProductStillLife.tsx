import type { ProductShape, ProductVisual } from "@/lib/commerce/types";

interface ProductStillLifeProps {
  title: string;
  visual: ProductVisual;
  className?: string;
}

function Shape({ shape, accent }: { shape: ProductShape; accent: string }) {
  switch (shape) {
    case "ring":
      return (
        <circle
          cx="120"
          cy="140"
          r="42"
          fill="none"
          stroke={accent}
          strokeWidth="18"
        />
      );
    case "rope":
      return (
        <path
          d="M40 150 C80 90, 120 210, 160 130 S220 90, 200 160"
          fill="none"
          stroke={accent}
          strokeWidth="14"
          strokeLinecap="round"
        />
      );
    case "harness":
      return (
        <g fill="none" stroke={accent} strokeWidth="10" strokeLinecap="round">
          <ellipse cx="120" cy="130" rx="46" ry="36" />
          <path d="M74 130 Q120 210 166 130" />
        </g>
      );
    case "bed":
      return (
        <ellipse cx="120" cy="150" rx="70" ry="36" fill={accent} opacity="0.85" />
      );
    case "raised-bed":
      return (
        <g stroke={accent} fill="none" strokeWidth="8" strokeLinecap="round">
          <rect x="50" y="110" width="140" height="40" rx="4" fill={accent} opacity="0.35" />
          <path d="M58 150 V190 M182 150 V190" />
        </g>
      );
    case "bowl":
    case "slow-bowl":
    case "dish":
      return (
        <g fill={accent}>
          <ellipse cx="120" cy="128" rx="48" ry="14" opacity="0.35" />
          <path d="M72 128 Q120 188 168 128" opacity="0.9" />
        </g>
      );
    case "mice":
      return (
        <g fill={accent}>
          <ellipse cx="88" cy="150" rx="16" ry="11" />
          <ellipse cx="120" cy="138" rx="16" ry="11" />
          <ellipse cx="154" cy="152" rx="16" ry="11" />
        </g>
      );
    case "wand":
      return (
        <g stroke={accent} fill="none" strokeWidth="6" strokeLinecap="round">
          <path d="M50 200 L170 70" />
          <path d="M170 70 C190 60, 200 90, 188 108" />
        </g>
      );
    case "column":
      return <rect x="98" y="70" width="44" height="140" rx="4" fill={accent} />;
    case "panel":
      return <rect x="70" y="70" width="100" height="140" rx="4" fill={accent} opacity="0.85" />;
    case "perch":
      return (
        <g>
          <rect x="48" y="148" width="144" height="14" rx="2" fill={accent} />
          <rect x="64" y="118" width="112" height="30" rx="8" fill={accent} opacity="0.5" />
        </g>
      );
    case "cave":
      return (
        <path d="M60 190 Q120 40 180 190 Z" fill={accent} opacity="0.85" />
      );
    case "puzzle":
      return (
        <g fill={accent}>
          <rect x="55" y="110" width="130" height="70" rx="6" opacity="0.35" />
          <rect x="68" y="124" width="30" height="42" rx="3" />
          <rect x="105" y="124" width="30" height="42" rx="3" />
          <rect x="142" y="124" width="30" height="42" rx="3" />
        </g>
      );
    default:
      return <circle cx="120" cy="140" r="36" fill={accent} />;
  }
}

export function ProductStillLife({ title, visual, className }: ProductStillLifeProps) {
  return (
    <svg
      viewBox="0 0 240 300"
      className={className}
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="240" height="300" fill={visual.background} />
      <Shape shape={visual.shape} accent={visual.accent} />
    </svg>
  );
}
