import React, { useState } from 'react';
import { Character, AppMode, AppLanguage } from '../types';
import {
  MessageSquare,
  Sparkles,
  Settings,
  Search,
  X,
  ShieldCheck,
  Award,
  Info,
  Globe,
  HeartHandshake,
} from 'lucide-react';
import { getTranslation } from '../utils/i18n';
import { PWAInstallButton } from './PWAInstallButton';

interface HomeTabProps {
  characters: Character[];
  onSelectAndTalk: (character: Character, mode: AppMode) => void;
  onOpenCharacterProfile: (character: Character) => void;
  onOpenSettings: () => void;
  onOpenDonate?: () => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  characters,
  onSelectAndTalk,
  onOpenCharacterProfile,
  onOpenSettings,
  onOpenDonate,
  language,
  onLanguageChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const t = getTranslation(language);

  // Default characters are the official 6 characters (cannot be edited or deleted)
  const defaultCharacters = characters.filter((c) => c.isDefault);

  const filteredCharacters = defaultCharacters.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.personality || '').toLowerCase().includes(q) ||
      (c.relationship || '').toLowerCase().includes(q) ||
      (c.traits || []).some((tr) => tr.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1a1218] overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-3.5 bg-[#241b22]/95 backdrop-blur-md border-b border-[#3d2b38] shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src="/app-icon.png"
              alt="Barrychat"
              className="w-9 h-9 rounded-2xl object-cover shadow-md shadow-[#ff5a8a]/20 border border-white/10"
            />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-none">
                {t.appName}
              </h1>
              <p className="text-[11px] text-[#a0909c] font-medium mt-0.5">
                {t.appTagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Donate Button */}
            {onOpenDonate && (
              <button
                onClick={onOpenDonate}
                className="px-2.5 py-1 rounded-xl bg-[#005baa]/20 border border-[#005baa]/60 hover:bg-[#005baa] text-[#80c8ff] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                title={language === 'my' ? 'KBZPay ဖြင့် ထောက်ပံ့လှူဒါန်းရန်' : 'Donate with KBZPay'}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-[#ff85a2]" />
                <span className="hidden sm:inline">{language === 'my' ? 'လှူဒါန်းရန်' : 'Donate'}</span>
              </button>
            )}

            {/* Install PWA Button */}
            <PWAInstallButton language={language} variant="header" />

            {/* Quick Language Toggle */}
            <button
              onClick={() => onLanguageChange(language === 'en' ? 'my' : 'en')}
              className="px-2.5 py-1 rounded-xl bg-[#2e222c] border border-[#3d2b38] hover:border-[#ff85a2]/50 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
              title={language === 'en' ? 'Switch to Myanmar language' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-[#ff85a2]" />
              <span className="text-[11px]">{language === 'en' ? 'မြန်မာ' : 'EN'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-2xl text-[#a0909c] hover:text-white bg-[#2e222c] border border-[#3d2b38] hover:border-[#ff85a2]/50 transition-colors"
              title={t.settings}
              aria-label={t.settings}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="max-w-4xl mx-auto mt-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a0909c] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholderHome}
              className="w-full bg-[#2e222c] border border-[#3d2b38] rounded-2xl py-2 pl-10 pr-9 text-xs sm:text-sm text-white placeholder-[#a0909c] focus:outline-none focus:border-[#ff85a2] transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#a0909c] hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Characters Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 max-w-4xl w-full mx-auto pb-20">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#a0909c]">
              {t.officialCompanions}
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#ff85a2]/20 text-[#ff85a2] border border-[#ff85a2]/30">
              {defaultCharacters.length} {t.availableCount}
            </span>
          </div>
          <span className="text-[11px] text-[#a0909c] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ff85a2]" />
            <span>{t.permanentNote}</span>
          </span>
        </div>

        {filteredCharacters.length === 0 ? (
          <div className="py-16 text-center text-[#a0909c] space-y-2">
            <Search className="w-8 h-8 mx-auto text-[#a0909c]/60" />
            <p className="text-sm font-semibold text-white">{t.noCompanionsFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCharacters.map((char) => (
              <div
                key={char.id}
                className="group relative bg-[#241b22] border border-[#3d2b38] hover:border-[#ff85a2]/50 rounded-3xl p-4 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer"
                onClick={() => onOpenCharacterProfile(char)}
              >
                <div>
                  {/* Card Top: Avatar, Name, Relationship, Level */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={char.avatar}
                        alt={char.name}
                        className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#3d2b38] group-hover:ring-[#ff85a2] transition-all"
                      />
                      <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[#1a1218]">
                        <span className="block w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#241b22]" />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h2 className="text-base font-bold text-white group-hover:text-[#ff85a2] transition-colors truncate">
                          {char.name}
                        </h2>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg bg-[#2e222c] border border-[#3d2b38] text-white flex items-center gap-1">
                            <Award className="w-2.5 h-2.5 text-[#ff85a2]" />
                            <span>{t.level}{char.level || 1}</span>
                          </span>
                        </div>
                      </div>

                      {/* Relationship */}
                      <p className="text-xs font-semibold text-[#ff85a2] mt-0.5 truncate">
                        {char.relationship}
                      </p>

                      {/* Backstory short snippet */}
                      <p className="text-xs text-[#a0909c] line-clamp-2 mt-1.5 leading-relaxed">
                        {char.backstory}
                      </p>
                    </div>
                  </div>

                  {/* Traits Pills */}
                  {char.traits && char.traits.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[#3d2b38]/60">
                      {char.traits.map((trait, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-[#2e222c] border border-[#3d2b38] text-[11px] font-medium text-[#c4b5c0]"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions: View Profile, Chat Button, Meet Button */}
                <div
                  className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[#3d2b38]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onOpenCharacterProfile(char)}
                    className="text-xs text-[#a0909c] hover:text-white flex items-center gap-1 font-medium transition-colors px-2 py-1 rounded-xl hover:bg-[#2e222c]"
                    title="View Traits & Profile"
                  >
                    <Info className="w-3.5 h-3.5 text-[#ff85a2]" />
                    <span>{t.viewProfile}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Chat Online Button */}
                    <button
                      onClick={() => onSelectAndTalk(char, 'chat')}
                      className="px-3 py-1.5 rounded-xl bg-[#2e222c] hover:bg-[#3d2b38] border border-[#3d2b38] hover:border-[#ff85a2]/60 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                      title="Start texting online"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#ff85a2]" />
                      <span>{t.talkChat}</span>
                    </button>

                    {/* Meet Up Button */}
                    <button
                      onClick={() => onSelectAndTalk(char, 'real')}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ff85a2] to-[#ff5a8a] text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-95 shadow-md shadow-[#ff5a8a]/20 transition-all"
                      title="Meet in person"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.talkMeet}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
