export type Screen = 'lock' | 'timeline' | 'add' | 'album' | 'settings';

export interface Memory {
  id: string;
  title: string;
  date: string;
  description: string;
  images: string[];
  tags: string[];
  category: 'Travel' | 'Daily' | 'Wedding' | 'Anniversary';
  daysAgo: number;
}

export interface UserProfile {
  name: string;
  partnerName: string;
  anniversaryDate: string;
  avatarUrl: string;
}
