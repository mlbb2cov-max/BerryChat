import React, { useState, useEffect } from 'react';
import { AppMode, Character, ChatMessage, MessagePart, Bookmark, Session, UserProfile, AppLanguage, MeetEncounter } from './types';
import {
  getStoredCharacters,
  saveCharacters,
  getActiveCharacterId,
  setActiveCharacterId,
  getStoredUserProfile,
  saveStoredUserProfile,
  getGlobalMemories,
  getCustomApiKeys,
  normalizeCharacter,
  getChatSummary,
  getSelectedModel,
  saveSelectedModel,
  getStoredLanguage,
  saveStoredLanguage,
} from './utils/storage';
import { Header } from './components/Header';
import { HomeTab } from './components/HomeTab';
import { ChatTab } from './components/ChatTab';
import { ProfileTab } from './components/ProfileTab';
import { BottomNav, MainTab } from './components/BottomNav';
import { ChatModeView } from './components/ChatModeView';
import { RealModeView } from './components/RealModeView';
import { CharacterModal } from './components/CharacterModal';
import { ProfileModal } from './components/ProfileModal';
import { ChapterSheet } from './components/ChapterSheet';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { SettingsModal } from './components/SettingsModal';
import { DonateModal } from './components/DonateModal';
import { EncounterDetailModal } from './components/EncounterDetailModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { sendChatRequest } from './utils/geminiChatService';
import { AlertCircle, X } from 'lucide-react';
import { getTranslation } from './utils/i18n';

export default function App() {
  const [characters, setCharacters] = useState<Character[]>(() => getStoredCharacters());
  const [activeCharacterId, setActiveCharId] = useState<string>(() => getActiveCharacterId());
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<AppMode>('chat');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => getStoredUserProfile());
  const [selectedModel, setSelectedModel] = useState<string>(() => getSelectedModel());
  const [language, setLanguage] = useState<AppLanguage>(() => getStoredLanguage());

  // UI Modals & Drawers
  const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
  const [characterToEdit, setCharacterToEdit] = useState<Character | null>(null);
  const [profileModalCharacter, setProfileModalCharacter] = useState<Character | null>(null);
  const [isChapterSheetOpen, setIsChapterSheetOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [viewingEncounter, setViewingEncounter] = useState<MeetEncounter | null>(null);

  // Status, Affection, & Errors
  const [affectionNotification, setAffectionNotification] = useState<{
    delta: number;
    timestamp: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = getTranslation(language);

  // Active Character
  const activeCharacter: Character =
    characters.find((c) => c.id === activeCharacterId) ||
    characters[0] ||
    normalizeCharacter({ name: 'Companion' });

  // Active Session / Chapter
  const activeSession: Session =
    activeCharacter.sessions?.find((s) => s.id === activeCharacter.activeSessionId) ||
    activeCharacter.sessions?.[0] || {
      id: `sess-${activeCharacter.id}-1`,
      name: language === 'my' ? 'အခန်း ၁' : 'Chapter 1',
      createdAt: Date.now(),
      messages: [],
    };

  // Helper to format time & date strings
  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getFormattedDate = () => {
    const now = new Date();
    return now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const handleLanguageChange = (newLang: AppLanguage) => {
    setLanguage(newLang);
    saveStoredLanguage(newLang);
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    saveSelectedModel(modelId);
  };

  // Update specific character in state and storage
  const updateCharacter = (updater: (prev: Character) => Character) => {
    setCharacters((prevChars) => {
      const nextChars = prevChars.map((c) => {
        if (c.id === activeCharacter.id) {
          return updater(c);
        }
        return c;
      });
      saveCharacters(nextChars);
      return nextChars;
    });
  };

  const updateCharacterById = (id: string, updater: (prev: Character) => Character) => {
    setCharacters((prevChars) => {
      const nextChars = prevChars.map((c) => {
        if (c.id === id) {
          return updater(c);
        }
        return c;
      });
      saveCharacters(nextChars);
      return nextChars;
    });
  };

  // Progression logic (Affection, Trust, Streak, Level)
  const applyProgression = (c: Character, affectionDelta: number = 1): Character => {
    const newAffection = Math.min(100, Math.max(0, (c.affection || 0) + affectionDelta));
    const newTrust = Math.min(100, Math.max(0, (c.trust || 0) + 1));
    const newLevel = Math.floor(newAffection / 20) + 1;

    // Check streak
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastDateStr = c.lastChatDate ? c.lastChatDate.slice(0, 10) : null;
    let newStreak = c.streak || 1;

    if (lastDateStr !== todayStr) {
      if (lastDateStr) {
        const lastDate = new Date(lastDateStr);
        const today = new Date(todayStr);
        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
    }

    return {
      ...c,
      affection: newAffection,
      trust: newTrust,
      level: newLevel,
      streak: newStreak,
      lastChatDate: new Date().toISOString(),
      lastActivityTimestamp: Date.now(),
    };
  };

  // Start talking with a character (from Home, Chat list, or Character Profile)
  // Helper to extract recent chat messages to form the Meet Mode setting & conversational context
  const getChatContextForMeet = (char: Character): string => {
    const currSession =
      char.sessions?.find((s) => s.id === char.activeSessionId) ||
      char.sessions?.[0];
    const chatMsgs = (currSession?.messages || []).filter(
      (m) => m.mode === 'chat' && !m.isEncounterCard && m.role !== 'system'
    );
    if (chatMsgs.length === 0) return '';
    return chatMsgs
      .slice(-15)
      .map((m) => `${m.role === 'user' ? userProfile.name : char.name}: ${m.content}`)
      .join('\n');
  };

  // Trigger Meet Mode generation: creates setting, atmosphere and opening dialogue using chat context
  const triggerMeetEncounter = async (char: Character) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const chatContext = getChatContextForMeet(char);
      const res = await sendChatRequest({
        character: char,
        userName: userProfile.name,
        userBio: userProfile.bio,
        mode: 'real',
        language,
        messages: [],
        chatModeContext: chatContext || undefined,
        isOpeningScene: true,
        model: selectedModel || char.model || 'gemini-3.8-flash',
      });

      const rawText = res.text;
      if (!rawText) return;

      // Extract [SETTING: ...] tag
      let detectedSetting = '';
      const settingMatch = rawText.match(/\[SETTING:\s*([^\]\n]+)\]/i);
      if (settingMatch && settingMatch[1]) {
        detectedSetting = settingMatch[1].trim();
      }

      const cleanText = rawText.replace(/\[SETTING:\s*[^\]\n]+\]/gi, '').trim();

      const openingMsg: ChatMessage = {
        id: `msg-meet-${Date.now()}`,
        role: 'model',
        content: cleanText,
        parts: [{ text: cleanText }],
        timestamp: Date.now(),
        time: getFormattedTime(),
        date: getFormattedDate(),
        mode: 'real',
        read: true,
      };

      const newEncounter: MeetEncounter = {
        id: `meet-enc-${Date.now()}`,
        characterId: char.id,
        title: `${char.name} • ${detectedSetting ? detectedSetting.slice(0, 32) : 'In-Person Meet'}`,
        setting: detectedSetting || (language === 'my' ? 'နှစ်ဦးသီးသန့် တွေ့ဆုံသည့်နေရာ' : 'A cozy private place together'),
        startedAt: Date.now(),
        summary: '',
        messages: [openingMsg],
        status: 'active',
      };

      updateCharacterById(char.id, (c) => ({
        ...c,
        activeMeetEncounter: newEncounter,
        hasChatted: true,
        lastActivityTimestamp: Date.now(),
      }));
    } catch (err: any) {
      console.error('Meet mode initialization error:', err);
      setErrorMessage(err?.message || 'Error initializing Meet Mode.');
    } finally {
      setIsLoading(false);
    }
  };

  // End Meet Mode: creates an encounter card in chat history, archives encounter transcript, and returns to chat
  const handleEndMeetMode = () => {
    const encounter = activeCharacter.activeMeetEncounter;
    if (!encounter) {
      setActiveMode('chat');
      return;
    }

    const summaryText = language === 'my'
      ? `${activeCharacter.name} နှင့် ${encounter.setting} တွင် တွေ့ဆုံခဲ့ပြီး (${encounter.messages.length}) ကြိမ် အပြန်အလှန် စကားပြောဆိုခဲ့ပါသည်။`
      : `Met in person at ${encounter.setting}. Shared ${encounter.messages.length} heartfelt moments and memories together.`;

    const endedEncounter: MeetEncounter = {
      ...encounter,
      endedAt: Date.now(),
      status: 'ended',
      summary: encounter.summary || summaryText,
    };

    const encounterCardMsg: ChatMessage = {
      id: `enc-card-${endedEncounter.id}`,
      role: 'system',
      content: `In-Person Meet Encounter with ${activeCharacter.name}\n📍 ${endedEncounter.setting}\n${summaryText}`,
      timestamp: Date.now(),
      time: getFormattedTime(),
      date: getFormattedDate(),
      mode: 'chat',
      read: true,
      isEncounterCard: true,
      encounterId: endedEncounter.id,
      encounterTitle: endedEncounter.title,
      encounterSetting: endedEncounter.setting,
      encounterSummary: summaryText,
      encounterEndedAt: Date.now(),
    };

    const targetSessionId = activeCharacter.activeSessionId;

    updateCharacter((c) => {
      const updatedSessions = c.sessions.map((s) => {
        if (s.id === c.activeSessionId) {
          return { ...s, messages: [...(s.messages || []), encounterCardMsg] };
        }
        return s;
      });

      return {
        ...c,
        activeMeetEncounter: null,
        pastEncounters: [...(c.pastEncounters || []), endedEncounter],
        sessions: updatedSessions,
        lastActivityTimestamp: Date.now(),
      };
    });

    setActiveMode('chat');

    // Automatically have the character text the user upon getting back home from the meet
    triggerPostMeetFollowUp(activeCharacter, endedEncounter, targetSessionId);
  };

  // Proactively starts chatting through the messaging app right after arriving back home from in-person meet
  const triggerPostMeetFollowUp = async (
    char: Character,
    endedEncounter: MeetEncounter,
    targetSessionId: string
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const encounterDialogues = (endedEncounter.messages || [])
        .filter((m) => m.role === 'user' || m.role === 'model')
        .slice(-10)
        .map((m) => `${m.role === 'user' ? userProfile.name : char.name}: ${m.content}`)
        .join('\n');

      const realModeRecollection = `In-Person Meet Encounter with ${char.name}:
Location & Setting: ${endedEncounter.setting}
Key in-person moments, dialogues, and interactions that just happened:
${encounterDialogues || '(Heartfelt in-person presence and meeting together)'}
${endedEncounter.summary ? `Summary: ${endedEncounter.summary}` : ''}`;

      const res = await sendChatRequest({
        character: char,
        userName: userProfile.name,
        userBio: userProfile.bio,
        mode: 'chat',
        language,
        messages: [],
        realModeContext: realModeRecollection,
        isPostMeetFollowUp: true,
        model: selectedModel || char.model || 'gemini-3.8-flash',
      });

      const replyText = res.text;
      if (!replyText) return;

      const rawChunks = replyText
        .split(/\n\s*\n/)
        .map((chunk) => chunk.trim())
        .filter(Boolean);

      const chunks = rawChunks.length > 0 ? rawChunks : [replyText];

      const modelMsgs: ChatMessage[] = chunks.map((chunk, idx) => ({
        id: `msg-postmeet-${Date.now()}-${idx}`,
        role: 'model',
        content: chunk,
        parts: [{ text: chunk }],
        timestamp: Date.now() + idx * 300,
        time: getFormattedTime(),
        date: getFormattedDate(),
        mode: 'chat',
        read: true,
      }));

      updateCharacterById(char.id, (c) => {
        const progressed = applyProgression(c, res.affectionDelta);
        const updatedSessions = progressed.sessions.map((s) => {
          if (s.id === targetSessionId) {
            return {
              ...s,
              messages: [...(s.messages || []), ...modelMsgs],
            };
          }
          return s;
        });

        return {
          ...progressed,
          sessions: updatedSessions,
          lastActivityTimestamp: Date.now(),
        };
      });

      if (res.affectionDelta !== 0) {
        setAffectionNotification({ delta: res.affectionDelta, timestamp: Date.now() });
        setTimeout(() => {
          setAffectionNotification((prev) => (prev?.delta === res.affectionDelta ? null : prev));
        }, 3500);
      }
    } catch (err: any) {
      console.error('Post-meet text follow up error:', err);
      setErrorMessage(err?.message || 'Error generating post-meet text message.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open read-only encounter transcript
  const handleOpenEncounterDetail = (encounterId: string) => {
    const enc = (activeCharacter.pastEncounters || []).find((e) => e.id === encounterId);
    if (enc) {
      setViewingEncounter(enc);
    }
  };

  const handleStartConversation = (character: Character, mode: AppMode = 'chat') => {
    setActiveCharId(character.id);
    setActiveCharacterId(character.id);
    setActiveMode(mode);
    setIsConversationOpen(true);

    if (mode === 'real') {
      if (!character.activeMeetEncounter || (character.activeMeetEncounter.messages || []).length === 0) {
        triggerMeetEncounter(character);
      }
      return;
    }

    const charId = character.id;
    const currSession =
      character.sessions?.find((s) => s.id === character.activeSessionId) ||
      character.sessions?.[0];
    const sessionMessages = currSession?.messages || [];

    // Proactive conversation start if no messages yet
    if (sessionMessages.length === 0) {
      if (character.initialChatGreeting) {
        const chunks = character.initialChatGreeting
          .split(/\n\s*\n/)
          .map((s) => s.trim())
          .filter(Boolean);

        const initialMsgs: ChatMessage[] = (chunks.length > 0 ? chunks : [character.initialChatGreeting]).map(
          (chunk, idx) => ({
            id: `msg-init-${Date.now()}-${idx}`,
            role: 'model',
            content: chunk,
            parts: [{ text: chunk }],
            timestamp: Date.now() + idx * 300,
            time: getFormattedTime(),
            date: getFormattedDate(),
            mode: 'chat',
            read: true,
          })
        );

        updateCharacterById(charId, (c) => ({
          ...c,
          hasChatted: true,
          lastActivityTimestamp: Date.now(),
          sessions: (c.sessions || []).map((s) =>
            s.id === (c.activeSessionId || c.sessions[0]?.id)
              ? { ...s, messages: initialMsgs }
              : s
          ),
        }));
      } else {
        updateCharacterById(charId, (c) => ({
          ...c,
          hasChatted: true,
          lastActivityTimestamp: Date.now(),
        }));
        triggerProactiveGreeting(character, 'chat');
      }
    } else {
      updateCharacterById(charId, (c) => ({
        ...c,
        hasChatted: true,
        lastActivityTimestamp: Date.now(),
      }));
    }
  };

  // Handle Mode Change (Chat <-> Meet)
  const handleModeChange = (newMode: AppMode) => {
    if (activeMode === 'real' && newMode === 'chat') {
      if (activeCharacter.activeMeetEncounter && (activeCharacter.activeMeetEncounter.messages || []).length > 0) {
        handleEndMeetMode();
        return;
      }
      setActiveMode('chat');
      return;
    }

    setActiveMode(newMode);

    if (newMode === 'real') {
      if (!activeCharacter.activeMeetEncounter || (activeCharacter.activeMeetEncounter.messages || []).length === 0) {
        triggerMeetEncounter(activeCharacter);
      }
    }
  };

  // Proactive greeting trigger when character has no preset greeting
  const triggerProactiveGreeting = async (char: Character, mode: AppMode) => {
    setIsLoading(true);
    try {
      const res = await sendChatRequest({
        character: char,
        userName: userProfile.name,
        userBio: userProfile.bio,
        mode,
        language,
        messages: [],
        model: selectedModel || char.model || 'gemini-3.8-flash',
      });

      const replyText = res.text;
      if (!replyText) return;

      if (mode === 'chat') {
        const chunks = replyText
          .split(/\n\s*\n/)
          .map((c: string) => c.trim())
          .filter(Boolean);

        const msgs: ChatMessage[] = (chunks.length > 0 ? chunks : [replyText]).map(
          (chunk: string, idx: number) => ({
            id: `msg-proactive-${Date.now()}-${idx}`,
            role: 'model',
            content: chunk,
            parts: [{ text: chunk }],
            timestamp: Date.now() + idx * 300,
            time: getFormattedTime(),
            date: getFormattedDate(),
            mode: 'chat',
            read: true,
          })
        );

        updateCharacterById(char.id, (c) => ({
          ...c,
          lastActivityTimestamp: Date.now(),
          sessions: c.sessions.map((s) =>
            s.id === c.activeSessionId ? { ...s, messages: msgs } : s
          ),
        }));
      } else {
        const msg: ChatMessage = {
          id: `msg-meet-${Date.now()}`,
          role: 'model',
          content: replyText,
          parts: [{ text: replyText }],
          timestamp: Date.now(),
          time: getFormattedTime(),
          date: getFormattedDate(),
          mode: 'real',
          read: true,
        };

        updateCharacterById(char.id, (c) => ({
          ...c,
          lastActivityTimestamp: Date.now(),
          sessions: c.sessions.map((s) =>
            s.id === c.activeSessionId ? { ...s, messages: [msg] } : s
          ),
        }));
      }
    } catch (e) {
      console.error('Proactive greeting error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Message (in Chat Mode or Real Mode)
  const handleSendMessage = async (text: string, parts?: MessagePart[]) => {
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      parts: parts || [{ text }],
      timestamp: Date.now(),
      time: getFormattedTime(),
      date: getFormattedDate(),
      mode: activeMode,
      read: true,
    };

    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (activeMode === 'real') {
        // Meet Mode: Completely separate transcript from chat mode
        const currentEncounter = activeCharacter.activeMeetEncounter || {
          id: `meet-enc-${Date.now()}`,
          characterId: activeCharacter.id,
          title: `${activeCharacter.name} • In-Person Meet`,
          setting: language === 'my' ? 'နှစ်ဦးသီးသန့် တွေ့ဆုံသည့်နေရာ' : 'A cozy private place together',
          startedAt: Date.now(),
          summary: '',
          messages: [],
          status: 'active' as const,
        };

        const updatedEncounterMessages = [...(currentEncounter.messages || []), userMsg];

        // Store user's message immediately in the active meet encounter
        updateCharacter((c) => ({
          ...c,
          activeMeetEncounter: {
            ...currentEncounter,
            messages: updatedEncounterMessages,
          },
          lastActivityTimestamp: Date.now(),
        }));

        const chatContext = getChatContextForMeet(activeCharacter);

        const { text: replyText, affectionDelta } = await sendChatRequest({
          character: activeCharacter,
          userName: userProfile.name,
          userBio: userProfile.bio,
          mode: 'real',
          language,
          messages: updatedEncounterMessages
            .filter((m) => m.role === 'user' || m.role === 'model')
            .slice(-20)
            .map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'model',
              parts: m.parts || [{ text: m.content }],
              content: m.content,
              timestamp: m.timestamp,
              time: m.time,
              date: m.date,
              mode: m.mode,
            })),
          chatModeContext: chatContext || undefined,
          model: selectedModel || activeCharacter.model || 'gemini-3.8-flash',
        });

        const modelMsg: ChatMessage = {
          id: 'msg-' + (Date.now() + 1),
          role: 'model',
          content: replyText,
          parts: [{ text: replyText }],
          timestamp: Date.now(),
          time: getFormattedTime(),
          date: getFormattedDate(),
          mode: 'real',
          read: true,
        };

        updateCharacter((c) => {
          const progressed = applyProgression(c, affectionDelta);
          const enc = progressed.activeMeetEncounter || currentEncounter;
          return {
            ...progressed,
            activeMeetEncounter: {
              ...enc,
              messages: [...(enc.messages || []), modelMsg],
            },
            lastActivityTimestamp: Date.now(),
          };
        });

        if (affectionDelta !== 0) {
          setAffectionNotification({ delta: affectionDelta, timestamp: Date.now() });
          setTimeout(() => {
            setAffectionNotification((prev) => (prev?.delta === affectionDelta ? null : prev));
          }, 3500);
        }
      } else {
        // Chat Mode: Session messages
        const updatedMessages = [...(activeSession.messages || []), userMsg];

        // Store user's message immediately in the active chat session
        updateCharacter((c) => {
          const updatedSessions = c.sessions.map((s) => {
            if (s.id === c.activeSessionId) {
              return { ...s, messages: updatedMessages };
            }
            return s;
          });
          return {
            ...c,
            lastActivityTimestamp: Date.now(),
            sessions: updatedSessions,
          };
        });

        // Bridge memory: inject vivid recollection of the latest in-person meeting so the AI knows what happened!
        const pastMeets = activeCharacter.pastEncounters || [];
        const lastMeet = pastMeets[pastMeets.length - 1];
        let realModeRecollection = '';
        if (lastMeet) {
          const inPersonDialogue = (lastMeet.messages || [])
            .filter((m) => m.role === 'user' || m.role === 'model')
            .slice(-10)
            .map((m) => `${m.role === 'user' ? userProfile.name : activeCharacter.name}: ${m.content}`)
            .join('\n');

          realModeRecollection = `In-Person Meet Encounter with ${activeCharacter.name}:
Location & Setting: ${lastMeet.setting}
Key dialogue, actions, and moments from the physical meet:
${inPersonDialogue || '(Shared warm moments in person)'}
${lastMeet.summary ? `Summary: ${lastMeet.summary}` : ''}`;
        }

        const { text: replyText, affectionDelta } = await sendChatRequest({
          character: activeCharacter,
          userName: userProfile.name,
          userBio: userProfile.bio,
          mode: 'chat',
          language,
          messages: updatedMessages
            .filter((m) => m.role === 'user' || m.role === 'model')
            .slice(-20)
            .map((m) => ({
              id: m.id,
              role: m.role as 'user' | 'model',
              parts: m.parts || [{ text: m.content }],
              content: m.content,
              timestamp: m.timestamp,
              time: m.time,
              date: m.date,
              mode: m.mode,
            })),
          realModeContext: realModeRecollection || undefined,
          model: selectedModel || activeCharacter.model || 'gemini-3.8-flash',
        });

        const rawChunks = replyText
          .split(/\n\s*\n/)
          .map((chunk: string) => chunk.trim())
          .filter(Boolean);

        const chunks = rawChunks.length > 0 ? rawChunks : [replyText];

        const modelMsgs: ChatMessage[] = chunks.map((chunk: string, idx: number) => ({
          id: `msg-${Date.now()}-${idx}`,
          role: 'model',
          content: chunk,
          parts: [{ text: chunk }],
          timestamp: Date.now() + idx * 300,
          time: getFormattedTime(),
          date: getFormattedDate(),
          mode: 'chat',
          read: true,
        }));

        const finalMessages = [...updatedMessages, ...modelMsgs];

        updateCharacter((c) => {
          const progressed = applyProgression(c, affectionDelta);
          const updatedSessions = progressed.sessions.map((s) => {
            if (s.id === progressed.activeSessionId) {
              return { ...s, messages: finalMessages };
            }
            return s;
          });
          return {
            ...progressed,
            lastActivityTimestamp: Date.now(),
            sessions: updatedSessions,
          };
        });

        if (affectionDelta !== 0) {
          setAffectionNotification({ delta: affectionDelta, timestamp: Date.now() });
          setTimeout(() => {
            setAffectionNotification((prev) => (prev?.delta === affectionDelta ? null : prev));
          }, 3500);
        }
      }
    } catch (err: any) {
      console.error('Send error:', err);
      setErrorMessage(err?.message || 'Error communicating with AI companion.');
    } finally {
      setIsLoading(false);
    }
  };

  // Bookmark Toggle
  const handleBookmarkMessage = (msg: ChatMessage) => {
    updateCharacter((c) => {
      const currentBookmarks = c.bookmarks || [];
      const exists = currentBookmarks.some((b) => b.msgId === msg.id);

      let updatedBookmarks: Bookmark[];
      if (exists) {
        updatedBookmarks = currentBookmarks.filter((b) => b.msgId !== msg.id);
      } else {
        const newBm: Bookmark = {
          id: 'bm-' + Date.now(),
          msgId: msg.id,
          sessionId: activeSession.id,
          text: msg.content,
          date: msg.date || getFormattedDate(),
          time: msg.time || getFormattedTime(),
        };
        updatedBookmarks = [newBm, ...currentBookmarks];
      }

      return { ...c, bookmarks: updatedBookmarks };
    });
  };

  // Delete Message
  const handleDeleteMessage = (msgId: string) => {
    updateCharacter((c) => {
      const updatedSessions = c.sessions.map((s) => {
        if (s.id === c.activeSessionId) {
          return {
            ...s,
            messages: s.messages.filter((m) => m.id !== msgId),
          };
        }
        return s;
      });
      return { ...c, sessions: updatedSessions };
    });
  };

  // Edit Message
  const handleEditMessage = (msgId: string, newContent: string) => {
    updateCharacter((c) => {
      const updatedSessions = c.sessions.map((s) => {
        if (s.id === c.activeSessionId) {
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === msgId ? { ...m, content: newContent } : m
            ),
          };
        }
        return s;
      });
      return { ...c, sessions: updatedSessions };
    });
  };

  // Toggle Like Heart
  const handleToggleLike = () => {
    updateCharacter((c) => ({ ...c, liked: !c.liked }));
  };

  // Chapter selection
  const handleSelectSession = (sessionId: string) => {
    updateCharacter((c) => ({ ...c, activeSessionId: sessionId }));
  };

  // Chapter creation
  const handleCreateSession = (sessionName: string) => {
    const newSessionId = `sess-${activeCharacter.id}-${Date.now()}`;
    const newSession: Session = {
      id: newSessionId,
      name: sessionName,
      createdAt: Date.now(),
      messages: [],
    };

    updateCharacter((c) => ({
      ...c,
      sessions: [...c.sessions, newSession],
      activeSessionId: newSessionId,
    }));
  };

  // Chapter deletion (Allows users to delete chapters as requested)
  const handleDeleteSession = (sessionId: string) => {
    updateCharacter((c) => {
      const remainingSessions = (c.sessions || []).filter((s) => s.id !== sessionId);
      if (remainingSessions.length === 0) {
        const fallbackSession: Session = {
          id: `sess-${c.id}-${Date.now()}`,
          name: language === 'my' ? 'အခန်း ၁' : 'Chapter 1',
          createdAt: Date.now(),
          messages: [],
        };
        return {
          ...c,
          sessions: [fallbackSession],
          activeSessionId: fallbackSession.id,
        };
      }
      const nextActiveSessionId =
        c.activeSessionId === sessionId ? remainingSessions[0].id : c.activeSessionId;
      return {
        ...c,
        sessions: remainingSessions,
        activeSessionId: nextActiveSessionId,
      };
    });
  };

  // Save User Profile
  const handleSaveUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveStoredUserProfile(profile);
  };

  // Create or Update Custom Character
  const handleSaveCharacter = (charData: Partial<Character>) => {
    if (characterToEdit) {
      setCharacters((prev) => {
        const next = prev.map((c) => {
          if (c.id === characterToEdit.id) {
            return normalizeCharacter({ ...c, ...charData });
          }
          return c;
        });
        saveCharacters(next);
        return next;
      });
    } else {
      const newChar = normalizeCharacter({
        ...charData,
        id: `char-${Date.now()}`,
        createdAt: Date.now(),
        lastActivityTimestamp: Date.now(),
        isDefault: false,
        hasChatted: true,
      });
      const next = [newChar, ...characters];
      setCharacters(next);
      saveCharacters(next);
      setActiveCharId(newChar.id);
      setActiveCharacterId(newChar.id);
      setIsConversationOpen(true);
      setActiveMode('chat');
    }
  };

  // Delete Character
  const handleDeleteCharacter = (id: string) => {
    const char = characters.find((c) => c.id === id);
    if (!char) return;

    if (char.isDefault) {
      updateCharacterById(id, (c) => ({
        ...c,
        hasChatted: false,
        sessions: [
          {
            id: `sess-${c.id}-1`,
            name: language === 'my' ? 'အခန်း ၁' : 'Chapter 1',
            createdAt: Date.now(),
            messages: [],
          },
        ],
      }));
    } else {
      const remaining = characters.filter((c) => c.id !== id);
      setCharacters(remaining);
      saveCharacters(remaining);
      if (activeCharacterId === id && remaining.length > 0) {
        setActiveCharId(remaining[0].id);
        setActiveCharacterId(remaining[0].id);
      }
    }
  };

  // Compute unread count for bottom nav badge
  const unreadChatCount = characters.filter(
    (c) => c.hasChatted && (c.sessions?.[0]?.messages?.length || 0) > 0
  ).length;

  return (
    <div className="h-full w-full flex flex-col bg-[#1a1218] text-white font-sans overflow-hidden">
      {/* Top Header when inside an active conversation (Chat or Meet Mode) */}
      {isConversationOpen && (
        <Header
          activeMode={activeMode}
          onModeChange={handleModeChange}
          activeCharacter={activeCharacter}
          activeChapterName={activeMode === 'real' ? (activeCharacter.activeMeetEncounter?.title || activeSession.name) : activeSession.name}
          onBackToHome={() => setIsConversationOpen(false)}
          onOpenChapterSheet={() => setIsChapterSheetOpen(true)}
          onOpenBookmarks={() => setIsBookmarksOpen(true)}
          onOpenProfile={() => setProfileModalCharacter(activeCharacter)}
          onToggleLike={handleToggleLike}
          onOpenDonate={() => setIsDonateModalOpen(true)}
          onEndMeetMode={handleEndMeetMode}
          language={language}
        />
      )}

      {/* Error notification banner */}
      {errorMessage && (
        <div className="bg-rose-900/90 border-b border-rose-500 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md shrink-0 z-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-300" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="p-1 rounded-md hover:bg-rose-800 text-rose-200"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {isConversationOpen ? (
          activeMode === 'chat' ? (
            <ChatModeView
              character={activeCharacter}
              messages={activeSession.messages || []}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onBookmarkMessage={handleBookmarkMessage}
              onDeleteMessage={handleDeleteMessage}
              onEditMessage={handleEditMessage}
              affectionNotification={affectionNotification}
              onOpenDonate={() => setIsDonateModalOpen(true)}
              onOpenEncounterDetail={handleOpenEncounterDetail}
            />
          ) : (
            <RealModeView
              character={activeCharacter}
              messages={activeCharacter.activeMeetEncounter?.messages || []}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onBookmarkMessage={handleBookmarkMessage}
              onDeleteMessage={handleDeleteMessage}
              chapterName={activeCharacter.activeMeetEncounter?.title || activeSession.name}
              setting={activeCharacter.activeMeetEncounter?.setting}
              onEndMeetMode={handleEndMeetMode}
              language={language}
            />
          )
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeTab
                characters={characters}
                onSelectAndTalk={(char, mode) => handleStartConversation(char, mode)}
                onOpenCharacterProfile={(char) => setProfileModalCharacter(char)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenDonate={() => setIsDonateModalOpen(true)}
                language={language}
                onLanguageChange={handleLanguageChange}
              />
            )}

            {activeTab === 'chat' && (
              <ChatTab
                characters={characters}
                activeCharacterId={activeCharacterId}
                onOpenConversation={(char, mode) => handleStartConversation(char, mode)}
                onOpenCreateCharacter={() => {
                  setCharacterToEdit(null);
                  setIsCharacterModalOpen(true);
                }}
                onOpenEditCharacter={(char) => {
                  setCharacterToEdit(char);
                  setIsCharacterModalOpen(true);
                }}
                onDeleteCharacter={handleDeleteCharacter}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onGoToHome={() => setActiveTab('home')}
                language={language}
                onLanguageChange={handleLanguageChange}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileTab
                userProfile={userProfile}
                characters={characters}
                onSaveProfile={handleSaveUserProfile}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenDonate={() => setIsDonateModalOpen(true)}
                language={language}
                onLanguageChange={handleLanguageChange}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      {!isConversationOpen && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setIsConversationOpen(false);
          }}
          unreadChatCount={unreadChatCount}
          language={language}
        />
      )}

      {/* Modals & Drawers */}
      <CharacterModal
        isOpen={isCharacterModalOpen}
        onClose={() => {
          setIsCharacterModalOpen(false);
          setCharacterToEdit(null);
        }}
        characterToEdit={characterToEdit}
        onSave={handleSaveCharacter}
        onDelete={handleDeleteCharacter}
      />

      {/* Character Profile Modal */}
      <ProfileModal
        isOpen={!!profileModalCharacter}
        onClose={() => setProfileModalCharacter(null)}
        character={profileModalCharacter}
        onOpenEdit={() => {
          if (profileModalCharacter && !profileModalCharacter.isDefault) {
            setCharacterToEdit(profileModalCharacter);
            setIsCharacterModalOpen(true);
            setProfileModalCharacter(null);
          }
        }}
        onStartConversation={(char, mode) => {
          setProfileModalCharacter(null);
          handleStartConversation(char, mode);
        }}
      />

      <ChapterSheet
        isOpen={isChapterSheetOpen}
        onClose={() => setIsChapterSheetOpen(false)}
        sessions={activeCharacter.sessions || []}
        activeSessionId={activeCharacter.activeSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        onDeleteSession={handleDeleteSession}
        language={language}
      />

      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={activeCharacter.bookmarks || []}
        onSelectBookmark={(_bm) => {
          setIsBookmarksOpen(false);
        }}
        onDeleteBookmark={(bmId) => {
          updateCharacter((c) => ({
            ...c,
            bookmarks: (c.bookmarks || []).filter((b) => b.id !== bmId),
          }));
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeCharacter={activeCharacter}
        activeSession={activeSession}
        onDataImported={() => {
          setCharacters(getStoredCharacters());
          setUserProfile(getStoredUserProfile());
        }}
        selectedModel={selectedModel}
        onSelectModel={handleModelChange}
        language={language}
        onLanguageChange={handleLanguageChange}
        onOpenDonate={() => setIsDonateModalOpen(true)}
      />

      {/* KBZPay QR Donate Modal */}
      <DonateModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        language={language}
      />

      {/* Meet Encounter Detail Modal (Read-only view of archived Meet Mode) */}
      <EncounterDetailModal
        isOpen={!!viewingEncounter}
        encounter={viewingEncounter}
        character={activeCharacter}
        language={language}
        onClose={() => setViewingEncounter(null)}
      />

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator language={language} />
    </div>
  );
}
