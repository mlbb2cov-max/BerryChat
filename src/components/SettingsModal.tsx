import React, { useState, useRef } from 'react';
import { Character, Session, AppLanguage } from '../types';
import {
  X,
  Settings,
  User,
  Key,
  ShieldCheck,
  Download,
  Upload,
  FileText,
  FileCode,
  Plus,
  Check,
  AlertCircle,
  Loader2,
  Database,
  Cpu,
  Globe,
  Info,
  Smartphone,
  Github,
  HeartHandshake,
  QrCode,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import {
  exportBackupData,
  importBackupData,
  exportSessionAsText,
  exportSessionAsMarkdown,
  saveCustomApiKeys,
  getCustomApiKeys,
  saveGlobalMemories,
  getGlobalMemories,
  saveStoredUserName,
  getStoredUserName,
  updateKeyHealth,
  saveSelectedModel,
  saveStoredLanguage,
} from '../utils/storage';
import { SUPPORTED_AI_MODELS } from '../utils/aiModels';
import { getTranslation } from '../utils/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCharacter: Character;
  activeSession: Session;
  onDataImported: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  onOpenDonate?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  activeCharacter,
  activeSession,
  onDataImported,
  selectedModel,
  onSelectModel,
  language,
  onLanguageChange,
  onOpenDonate,
}) => {
  const [userName, setUserName] = useState(getStoredUserName());
  // Strictly ensure NO pre-filled or hardcoded API keys exist:
  const [apiKeysText, setApiKeysText] = useState(getCustomApiKeys().join('\n'));
  const [currentModel, setCurrentModel] = useState(selectedModel || 'gemini-3.7-flash');
  const [currentLang, setCurrentLang] = useState<AppLanguage>(language || 'en');
  const [globalMemories, setGlobalMemories] = useState<string[]>(getGlobalMemories());
  const [newMemoryInput, setNewMemoryInput] = useState('');
  const [isTestingKeys, setIsTestingKeys] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; msg: string }>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileUploadRef = useRef<HTMLInputElement>(null);
  const t = getTranslation(currentLang);

  if (!isOpen) return null;

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredUserName(userName);

    const keys = apiKeysText
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 8);
    saveCustomApiKeys(keys);
    saveGlobalMemories(globalMemories);
    saveSelectedModel(currentModel);
    saveStoredLanguage(currentLang);

    onSelectModel(currentModel);
    onLanguageChange(currentLang);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleLanguageSwitch = (newLang: AppLanguage) => {
    setCurrentLang(newLang);
    onLanguageChange(newLang);
    saveStoredLanguage(newLang);
  };

  const handleModelChange = (modelId: string) => {
    setCurrentModel(modelId);
    onSelectModel(modelId);
    saveSelectedModel(modelId);
  };

  const handleAddGlobalMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryInput.trim()) return;
    const updated = [...globalMemories, newMemoryInput.trim()];
    setGlobalMemories(updated);
    saveGlobalMemories(updated);
    setNewMemoryInput('');
  };

  const handleRemoveGlobalMemory = (idx: number) => {
    const updated = globalMemories.filter((_, i) => i !== idx);
    setGlobalMemories(updated);
    saveGlobalMemories(updated);
  };

  const handleTestKeys = async () => {
    const keys = apiKeysText
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 8);

    if (keys.length === 0) {
      alert(currentLang === 'my' ? 'စစ်ဆေးရန် API သော့ ထည့်သွင်းပေးပါ' : 'Please enter at least one API key to test.');
      return;
    }

    setIsTestingKeys(true);
    const results: Record<string, { ok: boolean; msg: string }> = {};

    for (const key of keys) {
      try {
        const res = await fetch('/api/test-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, model: currentModel }),
        });
        const json = await res.json();
        if (res.ok && json.ok) {
          results[key] = {
            ok: true,
            msg: currentLang === 'my' ? 'အသုံးပြုနိုင်ပါသည် (Verified)' : 'Active & Verified',
          };
          updateKeyHealth(key, true);
        } else {
          results[key] = { ok: false, msg: json.error || 'Failed' };
          updateKeyHealth(key, false, json.error);
        }
      } catch (err: any) {
        results[key] = { ok: false, msg: err?.message || 'Network error' };
        updateKeyHealth(key, false, err?.message);
      }
    }

    setTestResults(results);
    setIsTestingKeys(false);
  };

  const handleExportJSON = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `berry_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTXT = () => {
    const txt = exportSessionAsText(activeCharacter, activeSession);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCharacter.name}_${activeSession.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMD = () => {
    const md = exportSessionAsMarkdown(activeCharacter, activeSession);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeCharacter.name}_${activeSession.name}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const ok = importBackupData(content);
        if (ok) {
          alert(currentLang === 'my' ? 'အရန်ဒေတာကို ပြန်လည်ရယူပြီးပါပြီ!' : 'Backup restored successfully!');
          onDataImported();
          onClose();
        } else {
          alert(currentLang === 'my' ? 'ဖိုင်ပုံစံ မှားယွင်းနေပါသည်။' : 'Failed to parse backup file. Make sure it is valid JSON.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-[#241b22] border border-[#3d2b38] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-label="Settings"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#3d2b38] flex items-center justify-between bg-[#2e222c]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#ff85a2]" />
            <h3 className="text-base font-bold text-white">{t.appSettings}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#a0909c] hover:text-white hover:bg-[#3d2b38] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Language Selection Section */}
          <div className="p-4 rounded-2xl bg-[#2e222c] border border-[#3d2b38] space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#ff85a2]" />
                <span>{t.languageSection}</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLanguageSwitch('en')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  currentLang === 'en'
                    ? 'bg-[#ff85a2]/20 border-[#ff85a2] text-white shadow-sm'
                    : 'bg-[#1a1218] border-[#3d2b38] text-[#a0909c] hover:text-white'
                }`}
              >
                <span>English</span>
                {currentLang === 'en' && <Check className="w-3.5 h-3.5 text-[#ff85a2]" />}
              </button>
              <button
                type="button"
                onClick={() => handleLanguageSwitch('my')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  currentLang === 'my'
                    ? 'bg-[#ff85a2]/20 border-[#ff85a2] text-white shadow-sm'
                    : 'bg-[#1a1218] border-[#3d2b38] text-[#a0909c] hover:text-white'
                }`}
              >
                <span>မြန်မာစာ (Myanmar)</span>
                {currentLang === 'my' && <Check className="w-3.5 h-3.5 text-[#ff85a2]" />}
              </button>
            </div>
          </div>

          {/* AI Model Selection Section */}
          <div className="p-4 rounded-2xl bg-[#2e222c] border border-[#3d2b38] space-y-3">
            <div>
              <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#ff85a2]" />
                <span>{t.aiModelSelection}</span>
              </label>
              <p className="text-[11px] text-[#a0909c] mt-0.5">{t.aiModelSubtitle}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {SUPPORTED_AI_MODELS.map((m) => {
                const isSelected = currentModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleModelChange(m.id)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#ff85a2]/15 border-[#ff85a2] shadow-sm'
                        : 'bg-[#1a1218] border-[#3d2b38] hover:border-[#ff85a2]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-white truncate">{m.name}</span>
                      {isSelected ? (
                        <span className="w-4 h-4 rounded-full bg-[#ff85a2] text-[#1a1218] flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#2e222c] text-[#a0909c]">
                          {m.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#a0909c] line-clamp-2 leading-relaxed">
                      {m.description[currentLang] || m.description.en}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom API Keys Management (Strictly NO pre-filled keys) */}
          <div className="p-4 rounded-2xl bg-[#2e222c] border border-[#3d2b38] space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#ff85a2]" />
                <span>{t.geminiApiKeys}</span>
              </label>
              <button
                type="button"
                onClick={handleTestKeys}
                disabled={isTestingKeys}
                className="px-3 py-1 rounded-xl bg-[#1a1218] hover:bg-[#3d2b38] border border-[#3d2b38] text-xs font-bold text-[#ff85a2] flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                {isTestingKeys ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5" />
                )}
                <span>{t.testKeys}</span>
              </button>
            </div>

            {/* Note stating no keys pre-filled as requested */}
            <div className="p-2.5 rounded-xl bg-[#1a1218]/80 border border-[#3d2b38] text-[11px] text-[#ff85a2] flex items-start gap-2">
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                {currentLang === 'my'
                  ? 'API သော့ကို ကြိုတင်ထည့်သွင်းမထားပါ။ မိမိ၏ ကိုယ်ပိုင် Gemini API သော့ကို အောက်တွင် ထည့်သွင်းအသုံးပြုနိုင်ပါသည်။'
                  : 'No API keys are pre-filled. Enter your private Google Gemini API key below to use your account.'}
              </span>
            </div>

            <textarea
              rows={3}
              value={apiKeysText}
              onChange={(e) => setApiKeysText(e.target.value)}
              placeholder={t.apiKeysPlaceholder}
              className="w-full px-3.5 py-2 rounded-xl bg-[#1a1218] border border-[#3d2b38] text-white text-xs font-mono focus:outline-none focus:border-[#ff85a2] resize-none"
            />

            {/* Test Results Display */}
            {Object.keys(testResults).length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[#3d2b38]">
                {Object.entries(testResults).map(([k, r]) => {
                  const result = r as { ok: boolean; msg: string };
                  return (
                    <div
                      key={k}
                      className="flex items-center justify-between text-xs px-2.5 py-1 rounded-lg bg-[#1a1218]"
                    >
                      <span className="font-mono text-[#a0909c] truncate max-w-[180px]">
                        {k.slice(0, 10)}...{k.slice(-4)}
                      </span>
                      <span
                        className={`flex items-center gap-1 font-semibold text-[11px] ${
                          result.ok ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {result.ok ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{result.msg}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Name */}
          <div className="p-4 rounded-2xl bg-[#2e222c] border border-[#3d2b38] space-y-2">
            <label className="block text-xs font-bold text-white flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#ff85a2]" />
              <span>{t.yourName}</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full px-3.5 py-2 rounded-xl bg-[#1a1218] border border-[#3d2b38] text-white text-sm focus:outline-none focus:border-[#ff85a2]"
            />
          </div>

          {/* Global Memory Database */}
          <div className="p-4 rounded-2xl bg-[#2e222c] border border-[#3d2b38] space-y-3">
            <label className="block text-xs font-bold text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#ff85a2]" />
              <span>{t.aboutYou}</span>
            </label>

            <form onSubmit={handleAddGlobalMemory} className="flex gap-2">
              <input
                type="text"
                value={newMemoryInput}
                onChange={(e) => setNewMemoryInput(e.target.value)}
                placeholder={currentLang === 'my' ? 'ဥပမာ - သီချင်းနားထောင်ရတာ ကြိုက်တယ်' : 'e.g. Loves listening to music'}
                className="flex-1 px-3.5 py-1.5 rounded-xl bg-[#1a1218] border border-[#3d2b38] text-white text-xs focus:outline-none focus:border-[#ff85a2]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-[#1a1218] hover:bg-[#3d2b38] border border-[#3d2b38] text-[#ff85a2] text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.save}</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {globalMemories.map((m, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-[#1a1218] border border-[#3d2b38] text-xs text-white flex items-center gap-1.5"
                >
                  <span>{m}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGlobalMemory(idx)}
                    className="text-[#a0909c] hover:text-red-400"
                    aria-label="Remove global memory"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Backup & Export Options */}
          <div className="p-4 rounded-2xl bg-[#2e222c] border border-[#3d2b38] space-y-3">
            <span className="block text-xs font-bold text-white">
              {t.backupData}
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-2.5 rounded-xl bg-[#1a1218] hover:bg-[#3d2b38] border border-[#3d2b38] text-xs text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-[#ff85a2]" />
                <span>{t.exportBackup}</span>
              </button>

              <input
                type="file"
                ref={fileUploadRef}
                onChange={handleImportFile}
                accept=".json"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileUploadRef.current?.click()}
                className="p-2.5 rounded-xl bg-[#1a1218] hover:bg-[#3d2b38] border border-[#3d2b38] text-xs text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4 text-sky-400" />
                <span>{t.importBackup}</span>
              </button>

              <button
                type="button"
                onClick={handleExportTXT}
                className="p-2.5 rounded-xl bg-[#1a1218] hover:bg-[#3d2b38] border border-[#3d2b38] text-xs text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{t.exportTxt}</span>
              </button>

              <button
                type="button"
                onClick={handleExportMD}
                className="p-2.5 rounded-xl bg-[#1a1218] hover:bg-[#3d2b38] border border-[#3d2b38] text-xs text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <FileCode className="w-4 h-4 text-purple-400" />
                <span>{t.exportMd}</span>
              </button>
            </div>
          </div>

          {/* Donate / Support Section (KBZPay) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#005baa]/20 via-[#2e222c] to-[#2e222c] border border-[#005baa]/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-[#ff85a2]" />
                <span>{currentLang === 'my' ? 'Barrychat ကို ထောက်ပံ့လှူဒါန်းရန် (KBZPay)' : 'Support & Donate to Barrychat (KBZPay)'}</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#005baa] text-white">
                KBZPay
              </span>
            </div>

            <p className="text-[11px] text-[#c0b0bc] leading-relaxed">
              {currentLang === 'my'
                ? 'Barrychat အက်ပ်ကို အခမဲ့ဆက်လက်ဖန်တီးနိုင်ရန် KBZPay ဖြင့် မေတ္တာဖြင့် ထောက်ပံ့လှူဒါန်းနိုင်ပါသည်။'
                : 'Help keep Barrychat free, fast, and continuously updated by donating via KBZPay.'}
            </p>

            <button
              type="button"
              onClick={() => {
                if (onOpenDonate) {
                  onOpenDonate();
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#005baa] hover:bg-[#004f94] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#005baa]/30 transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4" />
              <span>{currentLang === 'my' ? 'KBZPay QR Code ပုံကို ကြည့်ရန်' : 'View KBZPay QR Code & Details'}</span>
            </button>
          </div>

          {/* Progressive Web App (PWA) & GitHub Pages Section */}
          <div className="p-4 rounded-2xl bg-[#2e222c] border border-[#3d2b38] space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#ff85a2]" />
                <span>{currentLang === 'my' ? 'PWA နှင့် GitHub Pages တင်ဆင်ခြင်း' : 'PWA & GitHub Pages Hosting'}</span>
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1a1218] text-[#ff85a2] border border-[#ff85a2]/40">
                PWA Ready
              </span>
            </div>

            {/* Install Button component */}
            <PWAInstallButton language={currentLang} variant="full" />

            {/* GitHub Pages Setup Guide */}
            <div className="p-3 rounded-xl bg-[#1a1218]/80 border border-[#3d2b38] space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white font-bold">
                <Github className="w-4 h-4 text-white" />
                <span>{currentLang === 'my' ? 'GitHub Pages တွင် တင်နည်း (Hosting Guide)' : 'How to Host on GitHub Pages'}</span>
              </div>
              <p className="text-[11px] text-[#a0909c] leading-relaxed">
                {currentLang === 'my'
                  ? 'ဤပရောဂျက်တွင် GitHub Actions Workflow (.github/workflows/deploy.yml) ကို အသင့်ထည့်သွင်းပေးထားပါသည်။ GitHub သို့ Push လုပ်ပြီးနောက် Repository ၏ Settings > Pages တွင် Source ကို "GitHub Actions" ဟု ရွေးချယ်ပေးရုံဖြင့် အခမဲ့ Host ပြုလုပ်နိုင်ပါသည်။'
                  : 'Automated GitHub Actions workflow (.github/workflows/deploy.yml) is ready. Simply push this repo to GitHub, then in Settings > Pages, select "GitHub Actions" as the build source to go live!'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#3d2b38] bg-[#241b22] flex items-center justify-between">
          <div>
            {savedSuccess && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{t.settingsSavedMessage}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#2e222c] hover:bg-[#3d2b38] text-white text-xs font-semibold"
            >
              {t.close}
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#ff85a2] to-[#ff5a8a] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#ff5a8a]/20 hover:opacity-95"
            >
              <Check className="w-4 h-4" />
              <span>{t.saveSettings}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
