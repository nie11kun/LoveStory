export const MAIN_PASSCODE = (import.meta as any).env.VITE_MAIN_PASSCODE || '4641';
export const ADD_PASSCODE = (import.meta as any).env.VITE_ADD_PASSCODE || '1234';
export const UNLOCK_EXPIRY_MS = parseInt((import.meta as any).env.VITE_UNLOCK_EXPIRY_MS || '86400000', 10); // 1 day
