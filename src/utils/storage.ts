import { Character, ChatMessage, RealModeEncounter, Session, Bookmark, KeyHealthInfo, UserProfile } from '../types';
import { DEFAULT_CHARACTERS } from '../data/defaultCharacters';

const STORAGE_KEYS = {
  CHARACTERS: 'aip_characters_v3',
  ACTIVE_CHARACTER_ID: 'aip_active_char_id_v3',
  GLOBAL_MEMORIES: 'aip_global_memories_v3',
  API_KEYS: 'aip_api_keys_v3',
  KEY_HEALTH: 'aip_key_health_v3',
  USER_PROFILE: 'aip_user_profile_v3',
  USER_NAME: 'aip_user_name_v3',
  SELECTED_MODEL: 'aip_selected_model_v3',
  APP_LANGUAGE: 'aip_app_language_v3',
  REAL_ENCOUNTERS_PREFIX: 'aip_real_encounters_v3_',
};

const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Sky',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
  bio: 'Creative night owl, loves quiet coffee shops, good music, and deep late-night conversations.',
};

export function normalizeCharacter(c: any): Character {
  const sid = c.activeSessionId || c.sessions?.[0]?.id || `sess-${c.id || Date.now()}-1`;
  const defaultSessions: Session[] = [
    {
      id: sid,
      name: 'Chapter 1',
      createdAt: Date.now(),
      messages: Array.isArray(c.messages) ? c.messages : [],
    },
  ];

  return {
    id: c.id || `char-${Date.now()}`,
    name: c.name || 'Partner',
    avatar: c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    wallpaper: c.wallpaper || '',
    personality: c.personality || 'Sweet, thoughtful, and attentive.',
    backstory: c.backstory || 'A close companion who loves deep conversations.',
    speakingStyle: c.speakingStyle || 'Gentle and expressive.',
    relationship: c.relationship || 'Close Friend',
    traits: Array.isArray(c.traits) ? c.traits : ['Friendly', 'Thoughtful'],
    model: c.model || 'gemini-3.8-flash',
    systemPrompt: c.systemPrompt || '',
    customPrompt: c.customPrompt || '',
    memories: Array.isArray(c.memories) ? c.memories : [],
    level: typeof c.level === 'number' ? c.level : Math.floor((c.affection || 0) / 20) + 1,
    affection: typeof c.affection === 'number' ? c.affection : 20,
    trust: typeof c.trust === 'number' ? c.trust : 15,
    streak: typeof c.streak === 'number' ? c.streak : 1,
    lastChatDate: c.lastChatDate || null,
    liked: !!c.liked,
    bookmarks: Array.isArray(c.bookmarks) ? c.bookmarks : [],
    sessions: Array.isArray(c.sessions) && c.sessions.length > 0 ? c.sessions : defaultSessions,
    activeSessionId: sid,
    createdAt: c.createdAt || Date.now(),
    lastActivityTimestamp: c.lastActivityTimestamp || c.createdAt || Date.now(),
    isDefault: !!c.isDefault,
    hasChatted: typeof c.hasChatted === 'boolean' ? c.hasChatted : (c.sessions?.[0]?.messages?.length > 0 || c.id === 'char-reina'),
    initialChatGreeting: c.initialChatGreeting || '',
    initialMeetGreeting: c.initialMeetGreeting || '',
  };
}

export function getStoredCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHARACTERS);
    let list: Character[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed.map(normalizeCharacter);
      }
    }

    // Ensure all 6 default characters exist
    const defaultIds = new Set(DEFAULT_CHARACTERS.map((dc) => dc.id));
    const mergedList: Character[] = [...list];

    // For any default character missing from storage, add it
    for (const defChar of DEFAULT_CHARACTERS) {
      const existing = mergedList.find((c) => c.id === defChar.id);
      if (!existing) {
        mergedList.push(defChar);
      } else {
        // Ensure default properties like isDefault and traits are kept up-to-date
        existing.isDefault = true;
        if (!existing.traits || existing.traits.length === 0) {
          existing.traits = defChar.traits;
        }
        if (!existing.initialChatGreeting) {
          existing.initialChatGreeting = defChar.initialChatGreeting;
        }
        if (!existing.initialMeetGreeting) {
          existing.initialMeetGreeting = defChar.initialMeetGreeting;
        }
      }
    }

    if (mergedList.length === 0) {
      saveCharacters(DEFAULT_CHARACTERS);
      return DEFAULT_CHARACTERS;
    }

    saveCharacters(mergedList);
    return mergedList;
  } catch (e) {
    console.error('Failed to load characters:', e);
    return DEFAULT_CHARACTERS;
  }
}

export function saveCharacters(characters: Character[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CHARACTERS, JSON.stringify(characters));
  } catch (e) {
    console.error('Failed to save characters:', e);
  }
}

export function getActiveCharacterId(): string {
  const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHARACTER_ID);
  if (stored) return stored;
  const chars = getStoredCharacters();
  return chars[0]?.id || 'char-reina';
}

export function setActiveCharacterId(id: string): void {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_CHARACTER_ID, id);
}

export function getStoredUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name || DEFAULT_USER_PROFILE.name,
        avatar: parsed.avatar || DEFAULT_USER_PROFILE.avatar,
        bio: parsed.bio || DEFAULT_USER_PROFILE.bio,
      };
    }
    // Check legacy username
    const legacyName = localStorage.getItem(STORAGE_KEYS.USER_NAME);
    if (legacyName) {
      return { ...DEFAULT_USER_PROFILE, name: legacyName };
    }
    return DEFAULT_USER_PROFILE;
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveStoredUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    localStorage.setItem(STORAGE_KEYS.USER_NAME, profile.name);
  } catch (e) {
    console.error('Failed to save user profile:', e);
  }
}

export function getStoredUserName(): string {
  return getStoredUserProfile().name;
}

export function saveStoredUserName(name: string): void {
  const current = getStoredUserProfile();
  saveStoredUserProfile({ ...current, name: name.trim() || 'Sky' });
}

export function getGlobalMemories(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GLOBAL_MEMORIES);
    return raw ? JSON.parse(raw) : ['Loves listening to music while talking', 'Prefers warm and friendly tone'];
  } catch {
    return [];
  }
}

export function saveGlobalMemories(memories: string[]): void {
  localStorage.setItem(STORAGE_KEYS.GLOBAL_MEMORIES, JSON.stringify(memories));
}

export function getCustomApiKeys(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_KEYS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomApiKeys(keys: string[]): void {
  localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys.filter((k) => k.length > 8)));
}

const VALID_FREE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
];

export function getSelectedModel(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
    if (stored && VALID_FREE_MODELS.includes(stored)) {
      return stored;
    }
    return 'gemini-3.8-flash';
  } catch {
    return 'gemini-3.8-flash';
  }
}

export function saveSelectedModel(model: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, model);
  } catch (e) {
    console.error('Failed to save selected model:', e);
  }
}

export function getStoredLanguage(): 'en' | 'my' {
  try {
    const lang = localStorage.getItem(STORAGE_KEYS.APP_LANGUAGE);
    return lang === 'my' ? 'my' : 'en';
  } catch {
    return 'en';
  }
}

export function saveStoredLanguage(lang: 'en' | 'my'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, lang);
  } catch (e) {
    console.error('Failed to save language:', e);
  }
}

export function getKeyHealthMap(): Record<string, KeyHealthInfo> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.KEY_HEALTH);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveKeyHealthMap(map: Record<string, KeyHealthInfo>): void {
  localStorage.setItem(STORAGE_KEYS.KEY_HEALTH, JSON.stringify(map));
}

export function updateKeyHealth(key: string, success: boolean, errorMsg?: string | null): void {
  const health = getKeyHealthMap();
  const prev = health[key] || { lastUsed: null, successCount: 0, failCount: 0, lastError: null };
  health[key] = {
    lastUsed: Date.now(),
    successCount: success ? prev.successCount + 1 : prev.successCount,
    failCount: !success ? prev.failCount + 1 : prev.failCount,
    lastError: !success ? (errorMsg || 'Failed') : null,
  };
  saveKeyHealthMap(health);
}

export function getRealModeEncounters(characterId: string): RealModeEncounter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REAL_ENCOUNTERS_PREFIX + characterId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRealModeEncounters(characterId: string, encounters: RealModeEncounter[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.REAL_ENCOUNTERS_PREFIX + characterId, JSON.stringify(encounters));
  } catch (e) {
    console.error('Failed to save real encounters:', e);
  }
}

export function deleteCharacterData(characterId: string): void {
  try {
    const current = getStoredCharacters();
    const filtered = current.filter((c) => c.id !== characterId);
    saveCharacters(filtered);
    localStorage.removeItem(STORAGE_KEYS.REAL_ENCOUNTERS_PREFIX + characterId);
    if (getActiveCharacterId() === characterId && filtered.length > 0) {
      setActiveCharacterId(filtered[0].id);
    }
  } catch (e) {
    console.error('Failed to delete character data:', e);
  }
}

export function getChatSummary(messages: ChatMessage[]): string {
  if (!messages || messages.length === 0) {
    return 'No prior chat history yet. You agreed to meet up directly.';
  }
  return messages
    .slice(-10)
    .map((m) => `${m.role === 'user' ? 'User' : 'Character'}: ${m.content}`)
    .join('\n');
}

export function getRealModeSummary(encounters: RealModeEncounter[]): string {
  if (!encounters || encounters.length === 0) return '';
  const last = encounters[encounters.length - 1];
  if (!last || !last.messages.length) return '';
  return last.messages
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'User' : 'Character'}: ${m.content}`)
    .join('\n');
}

export function exportBackupData(): string {
  const data = {
    version: 3,
    exportedAt: new Date().toISOString(),
    characters: getStoredCharacters(),
    userName: getStoredUserName(),
    globalMemories: getGlobalMemories(),
    apiKeys: getCustomApiKeys(),
    keyHealth: getKeyHealthMap(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.characters && Array.isArray(parsed.characters)) {
      saveCharacters(parsed.characters.map(normalizeCharacter));
    }
    if (parsed.userName) saveStoredUserName(parsed.userName);
    if (parsed.globalMemories && Array.isArray(parsed.globalMemories)) {
      saveGlobalMemories(parsed.globalMemories);
    }
    if (parsed.apiKeys && Array.isArray(parsed.apiKeys)) {
      saveCustomApiKeys(parsed.apiKeys);
    }
    return true;
  } catch (e) {
    console.error('Failed to import backup:', e);
    return false;
  }
}

export function exportSessionAsText(character: Character, session: Session): string {
  let text = `${character.name} - ${session.name}\n`;
  text += `${'='.repeat(45)}\n\n`;
  session.messages.forEach((m) => {
    const speaker = m.role === 'user' ? 'You' : character.name;
    text += `[${m.date || 'Date'} ${m.time || ''}] ${speaker}:\n${m.content}\n\n`;
  });
  return text;
}

export function exportSessionAsMarkdown(character: Character, session: Session): string {
  let md = `# ${character.name} - ${session.name}\n\n`;
  md += `*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
  session.messages.forEach((m) => {
    if (m.role === 'user') {
      md += `**You** *(${m.date || ''} ${m.time || ''})*:\n\n${m.content}\n\n---\n\n`;
    } else {
      md += `> **${character.name}** *(${m.date || ''} ${m.time || ''})*:\n>\n> ${m.content.replace(/\n/g, '\n> ')}\n\n---\n\n`;
    }
  });
  return md;
}
