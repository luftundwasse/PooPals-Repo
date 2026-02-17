
export interface PoopRecord {
  id: string;
  timestamp: string;
}

export interface UserProfile {
  id: string;
  nickname: string;
  joinedDate: string;
  poopCount: number;
  lastActive?: string;
  motto?: string;
  // Gamification Fields
  currentStreak?: number;
  lastLogDate?: string;
  badges?: string[]; // IDs of unlocked badges
  // Weekly Refresh Fields
  weeklyCount: number;
  lastResetDate?: string; // ISO string of the last Sunday reset applied
  // History
  logs?: Record<string, PoopRecord>;
}

export interface LeaderboardEntry extends UserProfile {
  isCurrentUser?: boolean;
}

export interface GlobalState {
  users: UserProfile[];
  lastGlobalUpdate: string;
}
