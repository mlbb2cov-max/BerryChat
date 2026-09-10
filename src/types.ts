export type AppMode = 'chat' | 'real';
export type AppLanguage = 'en' | 'my';

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64
  };
}

export interface Bookmark {
  id: string;
  msgId: string;
  sessionId: string;
  text: string;
  date: string;
  time: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  parts?: MessagePart[];
  timestamp: number;
  time?: string;
  date?: string;
  mode: AppMode;
  read?: boolean;
  isEncounterCard?: boolean;
  encounterId?: string;
  encounterTitle?: string;
  encounterSetting?: string;
  encounterSummary?: string;
  encounterEndedAt?: number;
}

export interface Session {
  id: string;
  name: string;
  createdAt: number;
  messages: ChatMessage[];
}

export interface MeetEncounter {
  id: string;
  characterId: string;
  title: string;
  setting: string;
  startedAt: number;
  endedAt?: number;
  summary: string;
  messages: ChatMessage[];
  status: 'active' | 'ended';
}

export interface Character {
  id: string;
  name: string;
  avatar: string;
  wallpaper?: string;
  personality: string;
  backstory: string;
  speakingStyle: string;
  relationship: string;
  traits?: string[];
  model?: string;
  systemPrompt?: string;
  customPrompt?: string;
  memories?: string[];
  level: number;
  affection: number; // 0 to 100
  trust: number;     // 0 to 100
  streak: number;    // consecutive days
  lastChatDate?: string | null;
  liked?: boolean;
  bookmarks?: Bookmark[];
  sessions: Session[];
  activeSessionId: string;
  activeMeetEncounter?: MeetEncounter | null;
  pastEncounters?: MeetEncounter[];
  createdAt: number;
  lastActivityTimestamp?: number;
  isDefault?: boolean;
  hasChatted?: boolean;
  initialChatGreeting?: string;
  initialMeetGreeting?: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  bio: string;
}

export interface RealModeEncounter {
  id: string;
  characterId: string;
  title: string;
  startedAt: number;
  chatContextSnapshot: string;
  messages: ChatMessage[];
}

export interface KeyHealthInfo {
  lastUsed: number | null;
  successCount: number;
  failCount: number;
  lastError: string | null;
}
