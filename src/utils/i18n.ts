import { AppLanguage } from '../types';

export const TRANSLATIONS = {
  en: {
    // Navigation
    navHome: 'Home',
    navChat: 'Chat',
    navProfile: 'Profile',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    search: 'Search',
    settings: 'Settings',
    language: 'Language',
    model: 'AI Model',
    selectModel: 'Select Model',
    active: 'Active',
    level: 'Lv.',
    msgs: 'msgs',

    // Home Tab
    appName: 'Berry',
    appTagline: 'Choose a companion to start talking',
    officialCompanions: 'Official Companions',
    availableCount: 'Available',
    permanentNote: 'Permanent companion profiles',
    searchPlaceholderHome: 'Search companions by name, personality, or trait...',
    talkChat: 'Chat',
    talkMeet: 'Meet',
    viewProfile: 'Profile',
    noCompanionsFound: 'No companions found matching your search.',

    // Chat Tab
    chatsTitle: 'Chats',
    addCharacter: 'Add Character',
    searchChats: 'Search conversations...',
    noChatsTitle: 'No active chats yet',
    noChatsDesc: 'Start a conversation with an official companion from the Home tab or create your own custom companion!',
    browseCompanions: 'Browse Companions',
    recent: 'Recent',
    official: 'Official',
    custom: 'Custom',
    deleteChatConfirmTitle: 'Delete Character & Chat?',
    deleteChatConfirmDesc: 'Are you sure you want to delete this character and all conversation history? This cannot be undone.',
    noMessagesYet: 'No messages yet',

    // Header
    chatMode: 'Chat',
    meetMode: 'Meet',
    chapters: 'Chapters',
    bookmarks: 'Bookmarks',
    profileBtn: 'Profile & Stats',
    backToHome: 'Back to all messages',

    // Chapter Sheet
    storyChapters: 'Story Chapters',
    createNewChapter: 'Create New Chapter',
    deleteChapter: 'Delete Chapter',
    deleteChapterConfirm: 'Are you sure you want to delete this chapter and its messages?',
    chapter: 'Chapter',

    // Profile Tab
    myProfile: 'My Profile',
    profileSubtitle: 'Manage your identity shared with AI companions',
    yourName: 'Your Name',
    namePlaceholder: 'e.g. Sky',
    aboutYou: 'About You (Shared with AI Companions)',
    aboutYouPlaceholder: 'Share your interests, hobbies, work, and lifestyle so companions know you deeply...',
    saveProfile: 'Save Profile',
    profileSaved: 'Profile saved & synced with AI!',
    changePhoto: 'Change Photo',
    totalCompanions: 'Companions',
    totalMessages: 'Messages',
    savedBookmarks: 'Bookmarks',
    settingsAndBackups: 'App Settings & Backups',

    // Settings Modal
    appSettings: 'Application Settings',
    aiModelSelection: 'AI Model Selection',
    aiModelSubtitle: 'Choose which Gemini model powers your conversations:',
    geminiApiKeys: 'Gemini API Keys',
    apiKeysNotice: 'No pre-filled keys. Enter your private Gemini API key (one per line):',
    apiKeysPlaceholder: 'Enter your Gemini API key (AIza...)...',
    testKeys: 'Verify Keys',
    languageSection: 'Language / ဘာသာစကား',
    saveSettings: 'Save Settings',
    settingsSavedMessage: 'Settings saved successfully!',
    backupData: 'Data Management & Backup',
    exportBackup: 'Export Backup (JSON)',
    importBackup: 'Import Backup (JSON)',
    exportTxt: 'Export Chat (.TXT)',
    exportMd: 'Export Chat (.MD)',
    clearKeyPlaceholder: 'No API key pre-filled. Enter key to use.',

    // Chat / Real Mode
    typeMessage: 'Type a message...',
    send: 'Send',
    aiTyping: 'typing...',
    openingScene: 'Arriving at meeting scene...',
  },
  my: {
    // Navigation
    navHome: 'ပင်မ',
    navChat: 'စကားပြော',
    navProfile: 'ပရိုဖိုင်',

    // Common
    save: 'သိမ်းမည်',
    cancel: 'မလုပ်တော့ပါ',
    delete: 'ဖျက်မည်',
    edit: 'ပြင်ဆင်မည်',
    close: 'ပိတ်မည်',
    search: 'ရှာဖွေရန်',
    settings: 'ဆက်တင်များ',
    language: 'ဘာသာစကား',
    model: 'AI မော်ဒယ်',
    selectModel: 'မော်ဒယ်ရွေးချယ်ရန်',
    active: 'လက်ရှိ',
    level: 'အဆင့်',
    msgs: 'စောင်',

    // Home Tab
    appName: 'Berry',
    appTagline: 'စကားပြောရန် အဖော်တစ်ဦးကို ရွေးချယ်ပါ',
    officialCompanions: 'တရားဝင် အဖော်များ',
    availableCount: 'ယောက် ရှိသည်',
    permanentNote: 'အမြဲတမ်း ပရိုဖိုင်များ (ဖျက်၍မရပါ)',
    searchPlaceholderHome: 'အမည်၊ စရိုက် သို့မဟုတ် ဝိသေသဖြင့် ရှာဖွေပါ...',
    talkChat: 'စာပို့မည်',
    talkMeet: 'တွေ့ဆုံမည်',
    viewProfile: 'ပရိုဖိုင်',
    noCompanionsFound: 'သင်ရှာဖွေသော အဖော်ကို ရှာမတွေ့ပါ။',

    // Chat Tab
    chatsTitle: 'စကားပြောခန်းများ',
    addCharacter: 'ဇာတ်ကောင်အသစ်',
    searchChats: 'စကားပြောခန်းများကို ရှာဖွေပါ...',
    noChatsTitle: 'စကားပြောခန်း မရှိသေးပါ',
    noChatsDesc: 'ပင်မစာမျက်နှာမှ အဖော်တစ်ဦးနှင့် စကားစတင်ပြောပါ သို့မဟုတ် ကိုယ်ပိုင်ဇာတ်ကောင်အသစ် ဖန်တီးပါ!',
    browseCompanions: 'အဖော်များကို ကြည့်မည်',
    recent: 'လတ်တလော',
    official: 'တရားဝင်',
    custom: 'စိတ်ကြိုက်',
    deleteChatConfirmTitle: 'ဇာတ်ကောင်နှင့် စကားပြောမှတ်တမ်း ဖျက်မည်လား?',
    deleteChatConfirmDesc: 'ဤဇာတ်ကောင်နှင့် စကားပြောမှတ်တမ်းအားလုံးကို ဖျက်ရန် သေချာပါသလား? ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ပြင်ဆင်၍ မရပါ။',
    noMessagesYet: 'မက်ဆေ့ခ်ျ မရှိသေးပါ',

    // Header
    chatMode: 'စာပို့မုဒ်',
    meetMode: 'တွေ့ဆုံမုဒ်',
    chapters: 'အခန်းများ',
    bookmarks: 'မှတ်သားချက်များ',
    profileBtn: 'ပရိုဖိုင်နှင့် အခြေအနေ',
    backToHome: 'စကားပြောခန်းများသို့ ပြန်သွားမည်',

    // Chapter Sheet
    storyChapters: 'ဇာတ်လမ်း အခန်းများ',
    createNewChapter: 'အခန်းအသစ် ဖန်တီးမည်',
    deleteChapter: 'အခန်း ဖျက်မည်',
    deleteChapterConfirm: 'ဤအခန်းနှင့် ၎င်းအတွင်းရှိ မက်ဆေ့ခ်ျများကို ဖျက်ရန် သေချာပါသလား?',
    chapter: 'အခန်း',

    // Profile Tab
    myProfile: 'ကျွန်ုပ်၏ ပရိုဖိုင်',
    profileSubtitle: 'AI အဖော်များ သိရှိစေရန် သင့်ကိုယ်ရေးအချက်အလက်များကို ပြင်ဆင်ပါ',
    yourName: 'သင့်အမည်',
    namePlaceholder: 'ဥပမာ - Sky',
    aboutYou: 'သင့်အကြောင်း (AI အဖော်များနှင့် မျှဝေရန်)',
    aboutYouPlaceholder: 'AI အဖော်များ သင့်ကို ပိုမိုရင်းနှီးစွာ နားလည်နိုင်ရန် သင့်ဝါသနာ၊ စရိုက် သို့မဟုတ် နေထိုင်မှုပုံစံကို မျှဝေပါ...',
    saveProfile: 'ပရိုဖိုင် သိမ်းမည်',
    profileSaved: 'ပရိုဖိုင် သိမ်းဆည်းပြီး AI နှင့် ချိတ်ဆက်ပြီးပါပြီ!',
    changePhoto: 'ဓာတ်ပုံ ပြောင်းမည်',
    totalCompanions: 'အဖော်များ',
    totalMessages: 'မက်ဆေ့ခ်ျများ',
    savedBookmarks: 'မှတ်သားချက်များ',
    settingsAndBackups: 'ဆက်တင်များနှင့် အရန်သိမ်းမှုများ',

    // Settings Modal
    appSettings: 'အက်ပ် ဆက်တင်များ',
    aiModelSelection: 'AI မော်ဒယ် ရွေးချယ်မှု',
    aiModelSubtitle: 'စကားပြောဆိုရန် အသုံးပြုလိုသော Gemini မော်ဒယ်ကို ရွေးချယ်ပါ:',
    geminiApiKeys: 'Gemini API သော့များ',
    apiKeysNotice: 'API သော့ကို ကြိုတင်ထည့်မထားပါ။ သင်၏ ကိုယ်ပိုင် Gemini API သော့ကို ထည့်သွင်းပါ (တစ်လိုင်းလျှင် တစ်ခု)-',
    apiKeysPlaceholder: 'သင်၏ Gemini API သော့ကို ဤနေရာတွင် ထည့်ပါ (AIza...)...',
    testKeys: 'သော့ စစ်ဆေးမည်',
    languageSection: 'ဘာသာစကား / Language',
    saveSettings: 'ဆက်တင်များ သိမ်းမည်',
    settingsSavedMessage: 'ဆက်တင်များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!',
    backupData: 'ဒေတာစီမံခန့်ခွဲမှုနှင့် အရန်သိမ်းခြင်း',
    exportBackup: 'အရန်ဒေတာ ထုတ်ယူမည် (JSON)',
    importBackup: 'အရန်ဒေတာ ပြန်ထည့်မည် (JSON)',
    exportTxt: 'စကားပြောမှတ်တမ်း ထုတ်ယူမည် (.TXT)',
    exportMd: 'စကားပြောမှတ်တမ်း ထုတ်ယူမည် (.MD)',
    clearKeyPlaceholder: 'API သော့ ကြိုတင်ထည့်မထားပါ',

    // Chat / Real Mode
    typeMessage: 'မက်ဆေ့ခ်ျ ရိုက်ထည့်ပါ...',
    send: 'ပို့မည်',
    aiTyping: 'စာရိုက်နေသည်...',
    openingScene: 'တွေ့ဆုံရာနေရာသို့ ရောက်ရှိနေပါသည်...',
  },
};

export function getTranslation(lang?: string | AppLanguage) {
  if (lang === 'my') return TRANSLATIONS.my;
  return TRANSLATIONS.en;
}
