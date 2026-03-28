export type Screen = 'lock' | 'timeline' | 'add' | 'album' | 'settings' | 'detail' | 'edit' | 'passcode_verify' | 'profile';

export interface Memory {
  id: string;
  title: string;
  date: string;
  description: string;
  images: string[];
  tags: string[];
  daysAgo?: number;
}

export interface UserProfile {
  name: string;
  partnerName: string;
  anniversaryDate: string;
  avatarUrl: string;
  bgmUrl?: string;
  customTags?: string[];
}
