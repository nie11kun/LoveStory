/**
 * Calculates the number of full days passed since a given date relative to now.
 * @param dateString The date string (e.g., '2026-03-25') to calculate from.
 * @returns The number of days passed.
 */
export const calculateDaysAgo = (dateString: string): number => {
  if (!dateString) return 0;
  
  const inputDate = new Date(dateString);
  const today = new Date();
  
  // Set times to midnight to ensure we only compare full days
  const d1 = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
  const d2 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
