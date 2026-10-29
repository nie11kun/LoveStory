import React from 'react';
import { Heart } from 'lucide-react';

// Drifting hearts: [left %, size px, duration s, delay s, opacity]
const HEARTS: [number, number, number, number, number][] = [
  [8, 14, 16, 0, 0.35], [22, 10, 19, 5, 0.25], [38, 18, 22, 2, 0.2], [55, 12, 17, 8, 0.3],
  [70, 16, 20, 3, 0.25], [84, 11, 15, 10, 0.35], [93, 20, 24, 6, 0.18], [46, 9, 14, 12, 0.3],
];

/** Decorative hearts rising through the parent; the parent must be positioned and clip overflow. */
export const RisingHearts = ({ speed = 1, opacity = 1 }: { speed?: number; opacity?: number }) => (
  <div className="absolute inset-0 pointer-events-none" aria-hidden>
    {HEARTS.map(([left, size, d, delay, o], i) => (
      <Heart
        key={i}
        size={size}
        className="absolute -bottom-8 text-rose fill-rose animate-rise"
        style={{ left: `${left}%`, '--d': `${d / speed}s`, '--delay': `${delay / speed}s`, '--o': o * opacity } as React.CSSProperties}
      />
    ))}
  </div>
);
