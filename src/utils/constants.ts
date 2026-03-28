const runtimeConfig = (window as any).RUNTIME_CONFIG || {};

export const MAIN_PASSCODE = runtimeConfig.VITE_MAIN_PASSCODE || (import.meta as any).env.VITE_MAIN_PASSCODE || '1111';
export const ADD_PASSCODE = runtimeConfig.VITE_ADD_PASSCODE || (import.meta as any).env.VITE_ADD_PASSCODE || '2222';
export const UNLOCK_EXPIRY_MS = parseInt(runtimeConfig.VITE_UNLOCK_EXPIRY_MS || (import.meta as any).env.VITE_UNLOCK_EXPIRY_MS || '86400000', 10); // 1 day
