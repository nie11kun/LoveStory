// Parses 'YYYY-MM-DD' as a local date (new Date() would treat it as UTC midnight)
const parseLocalDate = (dateString: string): Date => {
  const [y, m, d] = dateString.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

/**
 * Calculates the number of full days passed since a given date relative to now.
 * @param dateString The date string (e.g., '2026-03-25') to calculate from.
 * @returns The number of days passed.
 */
export const calculateDaysAgo = (dateString: string): number => {
  if (!dateString) return 0;
  
  const inputDate = parseLocalDate(dateString);
  const today = new Date();
  
  // Set times to midnight to ensure we only compare full days
  const d1 = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculates the number of days until the next yearly recurrence of a date.
 * @param dateString The anniversary date string (e.g., '2021-05-20').
 * @returns 0 when the anniversary is today, otherwise the days remaining.
 */
export const calculateDaysUntilAnniversary = (dateString: string): number => {
  if (!dateString) return 0;

  const inputDate = parseLocalDate(dateString);
  const today = new Date();
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let next = new Date(today.getFullYear(), inputDate.getMonth(), inputDate.getDate());
  if (next < d2) next = new Date(today.getFullYear() + 1, inputDate.getMonth(), inputDate.getDate());

  return Math.round((next.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
};

export const isVideoUrl = (url: string): boolean => /\.(mp4|webm|ogg|mov|m4v|hevc|h265)(\?|#|$)/i.test(url);
