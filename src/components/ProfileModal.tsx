import React from 'react';
import { Character, AppMode } from '../types';
import {
  X,
  Heart,
  Flame,
  Award,
  Sparkles,
  BookOpen,
  Calendar,
  Star,
  MessageSquare,
  ShieldCheck,
  User,
  Edit3,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character | null;
  onOpenEdit: () => void;
  onStartConversation?: (character: Character, mode: AppMode) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  character,
  onOpenEdit,
  onStartConversation,
}) => {
  if (!isOpen || !character) return null;

  const handleStart = (mode: AppMode) => {
    onClose();
    if (onStartConversation) {
      onStartConversation(character, mode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#241b22] border border-[#3d2b38] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-label={`${character.name} Profile`}
      >
        {/* Header / Banner */}
        <div className="relative p-5 bg-[#2e222c] border-b border-[#3d2b38] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#ff85a2]" />
            <h2 className="text-base font-bold text-white">Character Profile</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#a0909c] hover:text-white hover:bg-[#3d2b38] transition-colors"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Avatar + Main Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="relative shrink-0">
              <img
                src={character.avatar}
                alt={character.name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[#ff85a2]/30 shadow-xl"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 ring-2 ring-[#241b22]" />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-black text-white">{character.name}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#ff85a2]/15 text-[#ff85a2] border border-[#ff85a2]/30 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>Level {character.level || 1}</span>
                </span>
                {character.isDefault && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1a1218] text-[#a0909c] border border-[#3d2b38] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#ff85a2]" />
                    <span>Official Companion</span>
                  </span>
                )}
              </div>

              {/* Relationship with User */}
              <div className="text-xs font-semibold text-[#ff85a2]">
                Relation with you: <span className="text-white font-bold">{character.relationship || 'Close Companion'}</span>
              </div>

              {/* Personality Summary */}
              <p className="text-xs text-[#a0909c] leading-relaxed">
                {character.personality}
              </p>
            </div>
          </div>

          {/* Character Traits */}
          {character.traits && character.traits.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#2e222c] border border-[#3d2b38] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Sparkles className="w-4 h-4 text-[#ff85a2]" />
                <span>Character Traits</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {character.traits.map((trait, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-[#1a1218] border border-[#3d2b38] text-xs font-medium text-[#e0d0dc]"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Affection & Streak Stats */}
          <div className="grid grid-cols-2 gap-3">
            {/* Affection Box */}
            <div className="p-3.5 rounded-2xl bg-[#2e222c] border border-[#3d2b38] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[#ff85a2] fill-[#ff85a2]" />
                  <span>Affection</span>
                </span>
                <span className="font-black text-[#ff85a2]">
                  {character.affection || 0}%
                </span>
              </div>
              <div className="w-full bg-[#1a1218] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#ff85a2] to-[#ff5a8a] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, character.affection || 0)}%` }}
                />
              </div>
              <p className="text-[10px] text-[#a0909c]">
                Increases as you chat & meet
              </p>
            </div>

            {/* Streak Box */}
            <div className="p-3.5 rounded-2xl bg-[#2e222c] border border-[#3d2b38] flex flex-col justify-between text-center">
              <div className="flex items-center justify-center text-amber-400 mb-0.5">
                <Flame className="w-5 h-5 fill-amber-400" />
              </div>
              <div className="text-lg font-black text-white">
                {character.streak || 1} Days
              </div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-[#a0909c]">
                Chat Streak
              </div>
            </div>
          </div>

          {/* Backstory & Speaking Style */}
          <div className="p-4 rounded-2xl bg-[#2e222c] border border-[#3d2b38] space-y-3 text-xs">
            <div>
              <span className="font-bold text-white block mb-1">
                Backstory
              </span>
              <p className="text-[#a0909c] leading-relaxed">
                {character.backstory || 'A gentle companion ready to connect with you.'}
              </p>
            </div>

            {character.speakingStyle && (
              <div className="pt-2 border-t border-[#3d2b38]">
                <span className="font-bold text-white block mb-1">
                  Speaking Style
                </span>
                <p className="text-[#a0909c] leading-relaxed">
                  {character.speakingStyle}
                </p>
              </div>
            )}
          </div>

          {/* Character Memories */}
          <div className="p-4 rounded-2xl bg-[#2e222c] border border-[#3d2b38] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-[#ff85a2]" />
              <span>Memories About Partner (Never Forgot)</span>
            </div>
            {character.memories && character.memories.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {character.memories.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-xl bg-[#1a1218] border border-[#3d2b38] text-xs text-[#c4b5c0]"
                  >
                    {m}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#a0909c]">
                No specific memories logged yet.
              </p>
            )}
          </div>
        </div>

        {/* Footer: Start Chat & Meet Buttons, plus Edit only if custom */}
        <div className="p-4 border-t border-[#3d2b38] bg-[#241b22] flex items-center justify-between gap-2">
          {!character.isDefault ? (
            <button
              onClick={() => {
                onClose();
                onOpenEdit();
              }}
              className="px-3.5 py-2 rounded-xl bg-[#2e222c] hover:bg-[#3d2b38] border border-[#3d2b38] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          ) : (
            <div className="text-[11px] text-[#a0909c] flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff85a2]" />
              <span>Official Companion</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStart('chat')}
              className="px-4 py-2 rounded-xl bg-[#2e222c] hover:bg-[#3d2b38] border border-[#3d2b38] hover:border-[#ff85a2]/60 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-[#ff85a2]" />
              <span>Chat Online</span>
            </button>

            <button
              onClick={() => handleStart('real')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff85a2] to-[#ff5a8a] text-white text-xs font-bold flex items-center gap-1.5 hover:opacity-95 shadow-md shadow-[#ff5a8a]/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Meet Up</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
