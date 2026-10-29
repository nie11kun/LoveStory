import { useEffect, useState } from 'react';

/**
 * Number of masonry columns for the current window width.
 * @param breakpoints Pairs of [minWidth, columns], checked from widest to narrowest.
 * @param fallback Columns below the smallest breakpoint.
 */
export const useColumnCount = (breakpoints: [number, number][], fallback = 1) => {
  const getCount = () => {
    if (typeof window === 'undefined') return fallback;
    const match = [...breakpoints].sort((a, b) => b[0] - a[0]).find(([minWidth]) => window.innerWidth >= minWidth);
    return match ? match[1] : fallback;
  };
  const [count, setCount] = useState(getCount);
  useEffect(() => {
    const onResize = () => setCount(getCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return count;
};

/** Deals items round-robin into columns so reading order stays left-to-right, row by row. */
export const toColumns = <T,>(items: T[], columnCount: number): T[][] => {
  const columns: T[][] = Array.from({ length: columnCount }, () => []);
  items.forEach((item, i) => columns[i % columnCount].push(item));
  return columns;
};
