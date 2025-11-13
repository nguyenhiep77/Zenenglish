import React from 'react';
import { Word, Sentence, Level, ListeningExercise, ReadingText, GrammarTopic, Conversation, ConversationLine, DictationExercise } from './types';

// --- ICON COMPONENTS ---
type IconProps = React.ComponentProps<'svg'>;

export const VocabularyIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

export const SentencesIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);

export const FlashcardIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25v9a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-15A2.25 2.25 0 002.25 8.25z" />
    </svg>
);

export const MinigamesIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h3m-3 12h3m-10.5-6h18M3.75 6.75h.008v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM4.125 12h.008v.008H4.125V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.008v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM19.875 6.75h.008v.008h-.008V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM20.25 12h.008v.008h-.008V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM19.875 17.25h.008v.008h-.008v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
);

export const MicrophoneIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />
    </svg>
);

export const StatsIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

export const ReviewIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const BookIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
);

export const AITutorIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.25 21.75l-.648-1.178a3.375 3.375 0 00-2.455-2.456L12 17.25l1.178-.648a3.375 3.375 0 002.455-2.456L16.25 13.5l.648 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.648a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
);

export const AIConversationIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 016 0v8.25a3 3 0 01-3 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const LightIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

export const DarkIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

export const UserAvatarIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);

export const NotificationIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);

export const HomeIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
    </svg>
);

export const BackIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

export const SpeakerIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
);

export const InfoIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);

export const ListeningIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75v10.5m-7.5-10.5v10.5m4.5-4.5h-1.5m1.5 0V9.75m0 7.5V15m-4.5 0h1.5m-1.5 0V9.75m0 7.5V15m-1.5 3.75a3 3 0 116 0 3 3 0 01-6 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const ReadingIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 9.75h3m-3 3h3" />
    </svg>
);

export const GrammarIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

export const SendIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);

export const HistoryIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.696L7.985 5.644m0 0l-3.182 3.182M7.985 5.644L11.166 2.462m3.689 9.348L16.023 9.348" />
    </svg>
);

export const TranslateIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
  </svg>
);

export const SwapIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25v8.25A2.25 2.25 0 0118 21H7.5a2.25 2.25 0 01-2.25-2.25v-2.25m10.5-6.75h-6.75" />
  </svg>
);


// --- DATA ---
// Helper to generate Google Translate TTS URL for both words and sentences
const createTtsApiUrl = (text: string, lang: string = 'en') => `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

// --- VOCABULARY DATA ---
const OXFORD_3000_RAW: Omit<Word, 'audioUrl'>[] = [
  // A1 Level (Beginner)
  { id: 4, word: 'book', ipa: '/bʊk/', meaning: 'sách', level: Level.A1, example: { en: 'I am reading a good book.', vi: 'Tôi đang đọc một cuốn sách hay.' } },
  { id: 5, word: 'school', ipa: '/skuːl/', meaning: 'trường học', level: Level.A1, example: { en: 'The children are at school.', vi: 'Bọn trẻ đang ở trường.' } },
  { id: 6, word: 'student', ipa: '/ˈstjuːdnt/', meaning: 'học sinh', level: Level.A1, example: { en: 'She is a student at a local college.', vi: 'Cô ấy là sinh viên một trường cao đẳng địa phương.' } },
  { id: 7, word: 'teacher', ipa: '/ˈtiːtʃər/', meaning: 'giáo viên', level: Level.A1, example: { en: 'My teacher is very kind.', vi: 'Giáo viên của tôi rất tốt bụng.' } },
  { id: 8, word: 'friend', ipa: '/frend/', meaning: 'bạn bè', level: Level.A1, example: { en: 'He is my best friend.', vi: 'Anh ấy là bạn thân nhất của tôi.' } },
  { id: 9, word: 'family', ipa: '/ˈfæməli/', meaning: 'gia đình', level: Level.A1, example: { en: 'I have a large family.', vi: 'Tôi có một gia đình lớn.' } },
  { id: 10, word: 'house', ipa: '/haʊs/', meaning: 'nhà', level: Level.A1, example: { en: 'They live in a beautiful house.', vi: 'Họ sống trong một ngôi nhà đẹp.' } },
  { id: 11, word: 'cat', ipa: '/kæt/', meaning: 'con mèo', level: Level.A1, example: { en: 'The cat is sleeping on the sofa.', vi: 'Con mèo đang ngủ trên ghế sofa.' } },
  { id: 12, word: 'dog', ipa: '/dɒɡ/', meaning: 'con chó', level: Level.A1, example: { en: 'My dog loves to play fetch.', vi: 'Con chó của tôi thích chơi trò nhặt đồ vật.' } },
  { id: 13, word: 'food', ipa: '/fuːd/', meaning: 'thức ăn', level: Level.A1, example: { en: 'What kind of food do you like?', vi: 'Bạn thích loại thức ăn nào?' } },
  { id: 14, word: 'water', ipa: '/ˈwɔːtər/', meaning: 'nước', level: Level.A1, example: { en: 'Please drink plenty of water.', vi: 'Hãy uống nhiều nước.' } },
  { id: 15, word: 'time', ipa: '/taɪm/', meaning: 'thời gian', level: Level.A1, example: { en: 'What time is it?', vi: 'Bây giờ là mấy giờ?' } },
  { id: 16, word: 'money', ipa: '/ˈmʌni/', meaning: 'tiền', level: Level.A1, example: { en: 'I need to save more money.', vi: 'Tôi cần tiết kiệm nhiều tiền hơn.' } },
  { id: 17, word: 'love', ipa: '/lʌv/', meaning: 'tình yêu', level: Level.A1, example: { en: 'Love makes the world go round.', vi: 'Tình yêu làm cho thế giới quay.' } },
  { id: 18, word: 'happy', ipa: '/ˈhæpi/', meaning: 'hạnh phúc', level: Level.A1, example: { en: 'She looks very happy today.', vi: 'Hôm nay trông cô ấy rất hạnh phúc.' } },
  { id: 19, word: 'sad', ipa: '/sæd/', meaning: 'buồn', level: Level.A1, example: { en: 'He was sad to hear the news.', vi: 'Anh ấy đã buồn khi nghe tin.' } },
  { id: 20, word: 'big', ipa: '/bɪɡ/', meaning: 'to', level: Level.A1, example: { en: 'That is a very big dog.', vi: 'Đó là một con chó rất to.' } },
  { id: 21, word: 'small', ipa: '/smɔːl/', meaning: 'nhỏ', level: Level.A1, example: { en: 'This is a small town.', vi: 'Đây là một thị trấn nhỏ.' } },
  { id: 22, word: 'good', ipa: '/ɡʊd/', meaning: 'tốt', level: Level.A1, example: { en: 'This is a good movie.', vi: 'Đây là một bộ phim hay.' } },
  { id: 23, word: 'bad', ipa: '/bæd/', meaning: 'tệ', level: Level.A1, example: { en: 'The weather is bad today.', vi: 'Thời tiết hôm nay tệ quá.' } },
  { id: 24, word: 'name', ipa: '/neɪm/', meaning: 'tên', level: Level.A1, example: { en: 'What is your name?', vi: 'Tên bạn là gì?' } },
  { id: 25, word: 'day', ipa: '/deɪ/', meaning: 'ngày', level: Level.A1, example: { en: 'Have a nice day!', vi: 'Chúc bạn một ngày tốt lành!' } },
  { id: 26, word: 'night', ipa: '/naɪt/', meaning: 'đêm', level: Level.A1, example: { en: 'Good night, sleep well.', vi: 'Chúc ngủ ngon.' } },
  { id: 27, word: 'people', ipa: '/ˈpiːpl/', meaning: 'người', level: Level.A1, example: { en: 'There are many people here.', vi: 'Có rất nhiều người ở đây.' } },
  { id: 28, word: 'man', ipa: '/mæn/', meaning: 'đàn ông', level: Level.A1, example: { en: 'He is a tall man.', vi: 'Anh ấy là một người đàn ông cao.' } },
  { id: 29, word: 'woman', ipa: '/ˈwʊmən/', meaning: 'phụ nữ', level: Level.A1, example: { en: 'She is a smart woman.', vi: 'Cô ấy là một người phụ nữ thông minh.' } },
  { id: 30, word: 'child', ipa: '/tʃaɪld/', meaning: 'đứa trẻ', level: Level.A1, example: { en: 'The child is playing in the park.', vi: 'Đứa trẻ đang chơi trong công viên.' } },
  { id: 31, word: 'yes', ipa: '/jes/', meaning: 'vâng, có', level: Level.A1, example: { en: 'Yes, I can help you.', vi: 'Vâng, tôi có thể giúp bạn.' } },
  { id: 32, word: 'no', ipa: '/nəʊ/', meaning: 'không', level: Level.A1, example: { en: 'No, thank you.', vi: 'Không, cảm ơn.' } },
  { id: 33, word: 'eat', ipa: '/iːt/', meaning: 'ăn', level: Level.A1, example: { en: 'What do you want to eat?', vi: 'Bạn muốn ăn gì?' } },
  { id: 34, word: 'drink', ipa: '/drɪŋk/', meaning: 'uống', level: Level.A1, example: { en: 'I want to drink some water.', vi: 'Tôi muốn uống một chút nước.' } },
  { id: 35, word: 'go', ipa: '/ɡəʊ/', meaning: 'đi', level: Level.A1, example: { en: 'Let\'s go to the beach.', vi: 'Chúng ta hãy đi ra biển.' } },
  { id: 36, word: 'see', ipa: '/siː/', meaning: 'nhìn, thấy', level: Level.A1, example: { en: 'I can see the mountains.', vi: 'Tôi có thể thấy những ngọn núi.' } },
  { id: 37, word: 'like', ipa: '/laɪk/', meaning: 'thích', level: Level.A1, example: { en: 'I like this song.', vi: 'Tôi thích bài hát này.' } },
  { id: 38, word: 'want', ipa: '/wɒnt/', meaning: 'muốn', level: Level.A1, example: { en: 'I want a new phone.', vi: 'Tôi muốn một chiếc điện thoại mới.' } },
  { id: 39, word: 'have', ipa: '/hæv/', meaning: 'có', level: Level.A1, example: { en: 'I have a question.', vi: 'Tôi có một câu hỏi.' } },
  { id: 40, word: 'work', ipa: '/wɜːk/', meaning: 'làm việc', level: Level.A1, example: { en: 'I have to work today.', vi: 'Hôm nay tôi phải làm việc.' } },
  { id: 41, word: 'study', ipa: '/ˈstʌdi/', meaning: 'học', level: Level.A1, example: { en: 'You need to study hard.', vi: 'Bạn cần phải học chăm chỉ.' } },
  { id: 42, word: 'live', ipa: '/lɪv/', meaning: 'sống', level: Level.A1, example: { en: 'Where do you live?', vi: 'Bạn sống ở đâu?' } },
  { id: 43, word: 'car', ipa: '/kɑː(r)/', meaning: 'xe hơi', level: Level.A1, example: { en: 'He drives a red car.', vi: 'Anh ấy lái một chiếc xe hơi màu đỏ.' } },
  { id: 44, word: 'city', ipa: '/ˈsɪti/', meaning: 'thành phố', level: Level.A1, example: { en: 'Hanoi is a big city.', vi: 'Hà Nội là một thành phố lớn.' } },
  { id: 45, word: 'country', ipa: '/ˈkʌntri/', meaning: 'đất nước', level: Level.A1, example: { en: 'Vietnam is a beautiful country.', vi: 'Việt Nam là một đất nước xinh đẹp.' } },
  { id: 46, word: 'job', ipa: '/dʒɒb/', meaning: 'công việc', level: Level.A1, example: { en: 'He is looking for a new job.', vi: 'Anh ấy đang tìm một công việc mới.' } },
  { id: 47, word: 'music', ipa: '/ˈmjuːzɪk/', meaning: 'âm nhạc', level: Level.A1, example: { en: 'I enjoy listening to music.', vi: 'Tôi thích nghe nhạc.' } },
  { id: 48, word: 'phone', ipa: '/fəʊn/', meaning: 'điện thoại', level: Level.A1, example: { en: 'My phone is ringing.', vi: 'Điện thoại của tôi đang đổ chuông.' } },
  { id: 49, word: 'red', ipa: '/red/', meaning: 'màu đỏ', level: Level.A1, example: { en: 'She is wearing a red dress.', vi: 'Cô ấy đang mặc một chiếc váy màu đỏ.' } },
  { id: 50, word: 'blue', ipa: '/bluː/', meaning: 'màu xanh da trời', level: Level.A1, example: { en: 'The sky is blue.', vi: 'Bầu trời màu xanh.' } },
  { id: 51, word: 'ability', ipa: '/əˈbɪləti/', meaning: 'khả năng', level: Level.A2, example: { en: 'She has the ability to manage a large team.', vi: 'Cô ấy có khả năng quản lý một đội ngũ lớn.' } },
  { id: 52, word: 'able', ipa: '/ˈeɪbl/', meaning: 'có thể', level: Level.A2, example: { en: 'Will you be able to come to the party?', vi: 'Bạn có thể đến dự tiệc không?' } },
  { id: 53, word: 'travel', ipa: '/ˈtrævl/', meaning: 'du lịch', level: Level.A2, example: { en: 'I love to travel to different countries.', vi: 'Tôi thích đi du lịch đến các quốc gia khác nhau.' } },
  { id: 54, word: 'believe', ipa: '/bɪˈliːv/', meaning: 'tin tưởng', level: Level.A2, example: { en: 'I believe you can do it.', vi: 'Tôi tin bạn có thể làm được.' } },
  { id: 55, word: 'build', ipa: '/bɪld/', meaning: 'xây dựng', level: Level.A2, example: { en: 'They are planning to build a new house.', vi: 'Họ đang có kế hoạch xây một ngôi nhà mới.' } },
  { id: 56, word: 'business', ipa: '/ˈbɪznəs/', meaning: 'kinh doanh', level: Level.A2, example: { en: 'She started her own business last year.', vi: 'Cô ấy đã bắt đầu kinh doanh riêng vào năm ngoái.' } },
  { id: 57, word: 'account', ipa: '/əˈkaʊnt/', meaning: 'tài khoản', level: Level.A2, example: { en: 'I need to check my bank account.', vi: 'Tôi cần kiểm tra tài khoản ngân hàng của mình.' } },
  { id: 58, word: 'advice', ipa: '/ədˈvaɪs/', meaning: 'lời khuyên', level: Level.A2, example: { en: 'Can you give me some advice?', vi: 'Bạn có thể cho tôi một vài lời khuyên được không?' } },
  { id: 59, word: 'article', ipa: '/ˈɑːrtɪkl/', meaning: 'bài báo', level: Level.A2, example: { en: 'I read an interesting article today.', vi: 'Hôm nay tôi đã đọc một bài báo thú vị.' } },
  { id: 60, word: 'careful', ipa: '/ˈkeəfl/', meaning: 'cẩn thận', level: Level.A2, example: { en: 'Be careful when you cross the street.', vi: 'Hãy cẩn thận khi bạn qua đường.' } },
  { id: 61, word: 'century', ipa: '/ˈsentʃəri/', meaning: 'thế kỷ', level: Level.A2, example: { en: 'We are living in the 21st century.', vi: 'Chúng ta đang sống ở thế kỷ 21.' } },
  { id: 62, word: 'chance', ipa: '/tʃæns/', meaning: 'cơ hội', level: Level.A2, example: { en: 'This is your last chance.', vi: 'Đây là cơ hội cuối cùng của bạn.' } },
  { id: 63, word: 'decide', ipa: '/dɪˈsaɪd/', meaning: 'quyết định', level: Level.A2, example: { en: 'I can\'t decide what to wear.', vi: 'Tôi không thể quyết định mặc gì.' } },
  { id: 64, word: 'describe', ipa: '/dɪˈskraɪb/', meaning: 'mô tả', level: Level.A2, example: { en: 'Can you describe the man you saw?', vi: 'Bạn có thể mô tả người đàn ông bạn đã thấy không?' } },
  { id: 65, word: 'different', ipa: '/ˈdɪfrənt/', meaning: 'khác biệt', level: Level.A2, example: { en: 'They have very different opinions.', vi: 'Họ có những ý kiến rất khác nhau.' } },
  { id: 66, word: 'difficult', ipa: '/ˈdɪfɪkəlt/', meaning: 'khó khăn', level: Level.A2, example: { en: 'This exam is very difficult.', vi: 'Kỳ thi này rất khó.' } },
  { id: 67, word: 'early', ipa: '/ˈɜːli/', meaning: 'sớm', level: Level.A2, example: { en: 'I have to wake up early tomorrow.', vi: 'Tôi phải dậy sớm vào ngày mai.' } },
  { id: 68, word: 'easy', ipa: '/ˈiːzi/', meaning: 'dễ dàng', level: Level.A2, example: { en: 'The test was quite easy.', vi: 'Bài kiểm tra khá dễ.' } },
  { id: 69, word: 'experience', ipa: '/ɪkˈspɪəriəns/', meaning: 'kinh nghiệm', level: Level.A2, example: { en: 'He has a lot of experience in marketing.', vi: 'Anh ấy có nhiều kinh nghiệm trong lĩnh vực marketing.' } },
  { id: 70, word: 'famous', ipa: '/ˈfeɪməs/', meaning: 'nổi tiếng', level: Level.A2, example: { en: 'She is a famous singer.', vi: 'Cô ấy là một ca sĩ nổi tiếng.' } },
  { id: 71, word: 'future', ipa: '/ˈfjuːtʃə(r)/', meaning: 'tương lai', level: Level.A2, example: { en: 'What are your plans for the future?', vi: 'Kế hoạch của bạn cho tương lai là gì?' } },
  { id: 72, word: 'health', ipa: '/helθ/', meaning: 'sức khỏe', level: Level.A2, example: { en: 'Health is more important than wealth.', vi: 'Sức khỏe quan trọng hơn của cải.' } },
  { id: 73, word: 'important', ipa: '/ɪmˈpɔːtnt/', meaning: 'quan trọng', level: Level.A2, example: { en: 'It is important to be honest.', vi: 'Thật thà là điều quan trọng.' } },
  { id: 74, word: 'information', ipa: '/ˌɪnfəˈmeɪʃn/', meaning: 'thông tin', level: Level.A2, example: { en: 'I need more information about the product.', vi: 'Tôi cần thêm thông tin về sản phẩm.' } },
  { id: 75, word: 'language', ipa: '/ˈlæŋɡwɪdʒ/', meaning: 'ngôn ngữ', level: Level.A2, example: { en: 'English is an international language.', vi: 'Tiếng Anh là một ngôn ngữ quốc tế.' } },
  { id: 76, word: 'accept', ipa: '/əkˈsept/', meaning: 'chấp nhận', level: Level.B1, example: { en: 'He accepted the job offer.', vi: 'Anh ấy đã chấp nhận lời mời làm việc.' } },
  { id: 77, word: 'challenge', ipa: '/ˈtʃælɪndʒ/', meaning: 'thử thách', level: Level.B1, example: { en: 'This new project is a big challenge.', vi: 'Dự án mới này là một thử thách lớn.' } },
  { id: 78, word: 'character', ipa: '/ˈkærəktər/', meaning: 'tính cách, nhân vật', level: Level.B1, example: { en: 'He has a very strong character.', vi: 'Anh ấy có một tính cách rất mạnh mẽ.' } },
  { id: 79, word: 'develop', ipa: '/dɪˈveləp/', meaning: 'phát triển', level: Level.B1, example: { en: 'The company needs to develop new products.', vi: 'Công ty cần phát triển các sản phẩm mới.' } },
  { id: 80, word: 'education', ipa: '/ˌedʒuˈkeɪʃn/', meaning: 'giáo dục', level: Level.B1, example: { en: 'Education is the key to success.', vi: 'Giáo dục là chìa khóa thành công.' } },
  { id: 81, word: 'achieve', ipa: '/əˈtʃiːv/', meaning: 'đạt được', level: Level.B1, example: { en: 'You can achieve anything if you work hard.', vi: 'Bạn có thể đạt được bất cứ điều gì nếu bạn làm việc chăm chỉ.' } },
  { id: 82, word: 'affect', ipa: '/əˈfekt/', meaning: 'ảnh hưởng', level: Level.B1, example: { en: 'The weather can affect your mood.', vi: 'Thời tiết có thể ảnh hưởng đến tâm trạng của bạn.' } },
  { id: 83, word: 'attention', ipa: '/əˈtenʃn/', meaning: 'sự chú ý', level: Level.B1, example: { en: 'May I have your attention, please?', vi: 'Xin quý vị vui lòng chú ý.' } },
  { id: 84, word: 'available', ipa: '/əˈveɪləbl/', meaning: 'có sẵn', level: Level.B1, example: { en: 'Are there any rooms available?', vi: 'Có phòng nào còn trống không?' } },
  { id: 85, word: 'benefit', ipa: '/ˈbenɪfɪt/', meaning: 'lợi ích', level: Level.B1, example: { en: 'What are the benefits of exercise?', vi: 'Lợi ích của việc tập thể dục là gì?' } },
  { id: 86, word: 'career', ipa: '/kəˈrɪə(r)/', meaning: 'sự nghiệp', level: Level.B1, example: { en: 'She wants a career in medicine.', vi: 'Cô ấy muốn có một sự nghiệp trong ngành y.' } },
  { id: 87, word: 'communicate', ipa: '/kəˈmjuːnɪkeɪt/', meaning: 'giao tiếp', level: Level.B1, example: { en: 'It is important to communicate effectively.', vi: 'Giao tiếp hiệu quả là điều quan trọng.' } },
  { id: 88, word: 'compare', ipa: '/kəmˈpeə(r)/', meaning: 'so sánh', level: Level.B1, example: { en: 'Don\'t compare yourself to others.', vi: 'Đừng so sánh bản thân với người khác.' } },
  { id: 89, word: 'confidence', ipa: '/ˈkɒnfɪdəns/', meaning: 'sự tự tin', level: Level.B1, example: { en: 'He has a lot of confidence in his abilities.', vi: 'Anh ấy rất tự tin vào khả năng của mình.' } },
  { id: 90, word: 'culture', ipa: '/ˈkʌltʃə(r)/', meaning: 'văn hóa', level: Level.B1, example: { en: 'It\'s interesting to learn about different cultures.', vi: 'Thật thú vị khi tìm hiểu về các nền văn hóa khác nhau.' } },
  { id: 91, word: 'decision', ipa: '/dɪˈsɪʒn/', meaning: 'quyết định', level: Level.B1, example: { en: 'It was a difficult decision to make.', vi: 'Đó là một quyết định khó khăn.' } },
  { id: 92, word: 'effort', ipa: '/ˈefət/', meaning: 'nỗ lực', level: Level.B1, example: { en: 'Your effort will pay off.', vi: 'Nỗ lực của bạn sẽ được đền đáp.' } },
  { id: 93, word: 'goal', ipa: '/ɡəʊl/', meaning: 'mục tiêu', level: Level.B1, example: { en: 'My goal is to finish the project by Friday.', vi: 'Mục tiêu của tôi là hoàn thành dự án trước thứ Sáu.' } },
  { id: 94, word: 'improve', ipa: '/ɪmˈpruːv/', meaning: 'cải thiện', level: Level.B1, example: { en: 'I want to improve my English skills.', vi: 'Tôi muốn cải thiện kỹ năng tiếng Anh của mình.' } },
  { id: 95, word: 'knowledge', ipa: '/ˈnɒlɪdʒ/', meaning: 'kiến thức', level: Level.B1, example: { en: 'Knowledge is power.', vi: 'Kiến thức là sức mạnh.' } },
  { id: 96, word: 'community', ipa: '/kəˈmjuːnəti/', meaning: 'cộng đồng', level: Level.B2, example: { en: 'We need to support our local community.', vi: 'Chúng ta cần hỗ trợ cộng đồng địa phương của mình.' } },
  { id: 97, word: 'environment', ipa: '/ɪnˈvaɪrənmənt/', meaning: 'môi trường', level: Level.B2, example: { en: 'We must protect the environment.', vi: 'Chúng ta phải bảo vệ môi trường.' } },
  { id: 98, word: 'government', ipa: '/ˈɡʌvərnmənt/', meaning: 'chính phủ', level: Level.B2, example: { en: 'The government has announced new policies.', vi: 'Chính phủ đã công bố các chính sách mới.' } },
  { id: 99, word: 'academic', ipa: '/ˌækəˈdemɪk/', meaning: 'thuộc về học thuật', level: Level.B2, example: { en: 'She has a strong academic background.', vi: 'Cô ấy có nền tảng học thuật vững chắc.' } },
  { id: 100, word: 'agreement', ipa: '/əˈɡriːmənt/', meaning: 'sự đồng ý, hợp đồng', level: Level.B2, example: { en: 'They signed a peace agreement.', vi: 'Họ đã ký một hiệp định hòa bình.' } },
  { id: 101, word: 'approach', ipa: '/əˈproʊtʃ/', meaning: 'tiếp cận', level: Level.B2, example: { en: 'We need a new approach to the problem.', vi: 'Chúng ta cần một cách tiếp cận mới cho vấn đề này.' } },
  { id: 102, word: 'balance', ipa: '/ˈbæləns/', meaning: 'sự cân bằng', level: Level.B2, example: { en: 'It\'s important to have a work-life balance.', vi: 'Việc có sự cân bằng giữa công việc và cuộc sống là rất quan trọng.' } },
  { id: 103, word: 'behavior', ipa: '/bɪˈheɪvjər/', meaning: 'hành vi', level: Level.B2, example: { en: 'His behavior was unacceptable.', vi: 'Hành vi của anh ta là không thể chấp nhận được.' } },
  { id: 104, word: 'budget', ipa: '/ˈbʌdʒɪt/', meaning: 'ngân sách', level: Level.B2, example: { en: 'We need to stick to the budget.', vi: 'Chúng ta cần phải tuân thủ ngân sách.' } },
  { id: 105, word: 'calculate', ipa: '/ˈkælkjuleɪt/', meaning: 'tính toán', level: Level.B2, example: { en: 'Can you calculate the total cost?', vi: 'Bạn có thể tính tổng chi phí được không?' } },
  { id: 106, word: 'consequence', ipa: '/ˈkɒnsɪkwəns/', meaning: 'hậu quả', level: Level.B2, example: { en: 'Every action has a consequence.', vi: 'Mọi hành động đều có hậu quả của nó.' } },
  { id: 107, word: 'critical', ipa: '/ˈkrɪtɪkl/', meaning: 'quan trọng, chỉ trích', level: Level.B2, example: { en: 'It is critical to follow the instructions carefully.', vi: 'Việc làm theo hướng dẫn một cách cẩn thận là rất quan trọng.' } },
  { id: 108, word: 'economy', ipa: '/ɪˈkɒnəmi/', meaning: 'nền kinh tế', level: Level.B2, example: { en: 'The country\'s economy is growing rapidly.', vi: 'Nền kinh tế của đất nước đang phát triển nhanh chóng.' } },
  { id: 109, word: 'evidence', ipa: '/ˈevɪdəns/', meaning: 'bằng chứng', level: Level.B2, example: { en: 'The police found evidence at the crime scene.', vi: 'Cảnh sát đã tìm thấy bằng chứng tại hiện trường vụ án.' } },
  { id: 110, word: 'global', ipa: '/ˈɡləʊbl/', meaning: 'toàn cầu', level: Level.B2, example: { en: 'Climate change is a global issue.', vi: 'Biến đổi khí hậu là một vấn đề toàn cầu.' } },
  { id: 111, word: 'impact', ipa: '/ˈɪmpækt/', meaning: 'tác động', level: Level.B2, example: { en: 'Technology has a huge impact on our lives.', vi: 'Công nghệ có tác động rất lớn đến cuộc sống của chúng ta.' } },
  { id: 112, word: 'policy', ipa: '/ˈpɒləsi/', meaning: 'chính sách', level: Level.B2, example: { en: 'The company has a strict no-smoking policy.', vi: 'Công ty có chính sách cấm hút thuốc nghiêm ngặt.' } },
  { id: 113, word: 'research', ipa: '/rɪˈsɜːtʃ/', meaning: 'nghiên cứu', level: Level.B2, example: { en: 'Scientists are conducting research on a new vaccine.', vi: 'Các nhà khoa học đang tiến hành nghiên cứu về một loại vắc-xin mới.' } },
  { id: 114, word: 'solution', ipa: '/səˈluːʃn/', meaning: 'giải pháp', level: Level.B2, example: { en: 'We need to find a solution to this problem.', vi: 'Chúng ta cần tìm một giải pháp cho vấn đề này.' } },
  { id: 115, word: 'technology', ipa: '/tekˈnɒlədʒi/', meaning: 'công nghệ', level: Level.B2, example: { en: 'Modern technology makes life easier.', vi: 'Công nghệ hiện đại làm cho cuộc sống dễ dàng hơn.' } },
  { id: 116, word: 'capable', ipa: '/ˈkeɪpəbl/', meaning: 'có khả năng', level: Level.C1, example: { en: 'She is capable of handling the situation.', vi: 'Cô ấy có khả năng xử lý tình huống.' } },
  { id: 117, word: 'analyze', ipa: '/ˈænəlaɪz/', meaning: 'phân tích', level: Level.C1, example: { en: 'The scientists will analyze the data.', vi: 'Các nhà khoa học sẽ phân tích dữ liệu.' } },
  { id: 118, word: 'significant', ipa: '/sɪɡˈnɪfɪkənt/', meaning: 'quan trọng, đáng kể', level: Level.C1, example: { en: 'There has been a significant increase in sales.', vi: 'Đã có sự gia tăng đáng kể về doanh số.' } },
  { id: 119, word: 'acquire', ipa: '/əˈkwaɪər/', meaning: 'đạt được, thu được', level: Level.C1, example: { en: 'He acquired a reputation for being difficult.', vi: 'Anh ta đã có được tiếng là người khó tính.' } },
  { id: 120, word: 'coherent', ipa: '/kəʊˈhɪərənt/', meaning: 'mạch lạc', level: Level.C1, example: { en: 'She proposed a coherent plan for the new project.', vi: 'Cô ấy đã đề xuất một kế hoạch mạch lạc cho dự án mới.' } },
  { id: 121, word: 'comprehensive', ipa: '/ˌkɒmprɪˈhensɪv/', meaning: 'toàn diện', level: Level.C1, example: { en: 'The report provides a comprehensive overview of the issue.', vi: 'Báo cáo cung cấp một cái nhìn tổng quan toàn diện về vấn đề này.' } },
  { id: 122, word: 'crucial', ipa: '/ˈkruːʃl/', meaning: 'cốt yếu, quan trọng', level: Level.C1, example: { en: 'It is crucial that we act now.', vi: 'Việc chúng ta hành động ngay bây giờ là rất quan trọng.' } },
  { id: 123, word: 'diverse', ipa: '/daɪˈvɜːs/', meaning: 'đa dạng', level: Level.C1, example: { en: 'The city has a diverse population.', vi: 'Thành phố có một dân số đa dạng.' } },
  { id: 124, word: 'elaborate', ipa: '/ɪˈlæbəreɪt/', meaning: 'giải thích chi tiết', level: Level.C1, example: { en: 'Could you elaborate on that point?', vi: 'Bạn có thể giải thích chi tiết hơn về điểm đó được không?' } },
  { id: 125, word: 'inevitable', ipa: '/ɪnˈevɪtəbl/', meaning: 'không thể tránh khỏi', level: Level.C1, example: { en: 'Change is an inevitable part of life.', vi: 'Thay đổi là một phần không thể tránh khỏi của cuộc sống.' } },
  { id: 126, word: 'justify', ipa: '/ˈdʒʌstɪfaɪ/', meaning: 'biện minh', level: Level.C1, example: { en: 'How can you justify your actions?', vi: 'Làm thế nào bạn có thể biện minh cho hành động của mình?' } },
  { id: 127, word: 'perspective', ipa: '/pəˈspektɪv/', meaning: 'góc nhìn', level: Level.C1, example: { en: 'Try to see things from a different perspective.', vi: 'Hãy thử nhìn mọi việc từ một góc nhìn khác.' } },
  { id: 128, word: 'sophisticated', ipa: '/səˈfɪstɪkeɪtɪd/', meaning: 'tinh vi, phức tạp', level: Level.C1, example: { en: 'The company uses sophisticated technology.', vi: 'Công ty sử dụng công nghệ tinh vi.' } },
  { id: 129, word: 'sustain', ipa: '/səˈsteɪn/', meaning: 'duy trì', level: Level.C1, example: { en: 'We need to sustain economic growth.', vi: 'Chúng ta cần duy trì tăng trưởng kinh tế.' } },
  { id: 130, word: 'vulnerable', ipa: '/ˈvʌlnərəbl/', meaning: 'dễ bị tổn thương', level: Level.C1, example: { en: 'The elderly are vulnerable to the flu.', vi: 'Người già dễ bị nhiễm cúm.' } },
  { id: 131, word: 'advocate', ipa: '/ˈædvəkeɪt/', meaning: 'ủng hộ', level: Level.B2, example: { en: 'She is a strong advocate for animal rights.', vi: 'Cô ấy là người ủng hộ mạnh mẽ cho quyền động vật.' } },
  { id: 132, word: 'alternative', ipa: '/ɔːlˈtɜːnətɪv/', meaning: 'sự thay thế', level: Level.B2, example: { en: 'Is there a cheaper alternative to this medication?', vi: 'Có giải pháp thay thế nào rẻ hơn cho loại thuốc này không?' } },
  { id: 133, word: 'assess', ipa: '/əˈses/', meaning: 'đánh giá', level: Level.B2, example: { en: 'We need to assess the impact on the environment.', vi: 'Chúng ta cần đánh giá tác động đối với môi trường.' } },
  { id: 134, word: 'assume', ipa: '/əˈsjuːm/', meaning: 'cho rằng', level: Level.B2, example: { en: 'I assume you know what you\'re doing.', vi: 'Tôi cho rằng bạn biết mình đang làm gì.' } },
  { id: 135, word: 'authority', ipa: '/ɔːˈθɒrəti/', meaning: 'chính quyền, quyền lực', level: Level.B2, example: { en: 'Only the manager has the authority to sign the contract.', vi: 'Chỉ có giám đốc mới có thẩm quyền ký hợp đồng.' } },
  { id: 136, word: 'bias', ipa: '/ˈbaɪəs/', meaning: 'thành kiến', level: Level.C1, example: { en: 'The news report showed a clear bias towards the government.', vi: 'Bản tin cho thấy sự thiên vị rõ ràng đối với chính phủ.' } },
  { id: 137, word: 'capacity', ipa: '/kəˈpæsəti/', meaning: 'năng lực, sức chứa', level: Level.B2, example: { en: 'The stadium has a seating capacity of 50,000.', vi: 'Sân vận động có sức chứa 50,000 chỗ ngồi.' } },
  { id: 138, word: 'cease', ipa: '/siːs/', meaning: 'ngừng', level: Level.C1, example: { en: 'The company ceased operations last year.', vi: 'Công ty đã ngừng hoạt động vào năm ngoái.' } },
  { id: 139, word: 'circumstance', ipa: '/ˈsɜːkəmstæns/', meaning: 'hoàn cảnh', level: Level.B2, example: { en: 'Under normal circumstances, you would need to pay a fee.', vi: 'Trong hoàn cảnh bình thường, bạn sẽ cần phải trả một khoản phí.' } },
  { id: 140, word: 'clarify', ipa: '/ˈklærəfaɪ/', meaning: 'làm rõ', level: Level.B2, example: { en: 'Could you clarify your last point?', vi: 'Bạn có thể làm rõ điểm cuối cùng của mình không?' } },
  { id: 141, word: 'collaborate', ipa: '/kəˈlæbəreɪt/', meaning: 'hợp tác', level: Level.B2, example: { en: 'The two companies will collaborate on the new project.', vi: 'Hai công ty sẽ hợp tác trong dự án mới.' } },
  { id: 142, word: 'component', ipa: '/kəmˈpəʊnənt/', meaning: 'thành phần', level: Level.B2, example: { en: 'Trust is a vital component of a healthy relationship.', vi: 'Lòng tin là một thành phần quan trọng của một mối quan hệ lành mạnh.' } },
  { id: 143, word: 'concept', ipa: '/ˈkɒnsept/', meaning: 'khái niệm', level: Level.B1, example: { en: 'It is a difficult concept to understand.', vi: 'Đó là một khái niệm khó hiểu.' } },
  { id: 144, word: 'conclude', ipa: '/kənˈkluːd/', meaning: 'kết luận', level: Level.B2, example: { en: 'The report concludes that the new policy is effective.', vi: 'Báo cáo kết luận rằng chính sách mới có hiệu quả.' } },
  { id: 145, word: 'conduct', ipa: '/kənˈdʌkt/', meaning: 'tiến hành', level: Level.B2, example: { en: 'The researchers will conduct an experiment.', vi: 'Các nhà nghiên cứu sẽ tiến hành một thí nghiệm.' } },
  { id: 146, word: 'conflict', ipa: '/ˈkɒnflɪkt/', meaning: 'xung đột', level: Level.B2, example: { en: 'There is a major conflict between the two countries.', vi: 'Có một cuộc xung đột lớn giữa hai nước.' } },
  { id: 147, word: 'consent', ipa: '/kənˈsent/', meaning: 'sự đồng ý', level: Level.C1, example: { en: 'You must have your parents\' consent to go on the trip.', vi: 'Bạn phải có sự đồng ý của bố mẹ để đi chuyến đi này.' } },
  { id: 148, word: 'considerable', ipa: '/kənˈsɪdərəbl/', meaning: 'đáng kể', level: Level.B2, example: { en: 'The project requires a considerable amount of time.', vi: 'Dự án đòi hỏi một lượng thời gian đáng kể.' } },
  { id: 149, word: 'consist', ipa: '/kənˈsɪst/', meaning: 'bao gồm', level: Level.B1, example: { en: 'The team consists of four people.', vi: 'Đội bao gồm bốn người.' } },
  { id: 150, word: 'constant', ipa: '/ˈkɒnstənt/', meaning: 'liên tục', level: Level.B2, example: { en: 'The machine is in constant use.', vi: 'Máy móc được sử dụng liên tục.' } },
  { id: 151, word: 'constitute', ipa: '/ˈkɒnstɪtjuːt/', meaning: 'cấu thành', level: Level.C1, example: { en: 'Women constitute a large part of the workforce.', vi: 'Phụ nữ chiếm một phần lớn lực lượng lao động.' } },
  { id: 152, word: 'construct', ipa: '/kənˈstrʌkt/', meaning: 'xây dựng', level: Level.B2, example: { en: 'They plan to construct a new bridge.', vi: 'Họ có kế hoạch xây dựng một cây cầu mới.' } },
  { id: 153, word: 'consult', ipa: '/kənˈsʌlt/', meaning: 'tư vấn', level: Level.B2, example: { en: 'You should consult a doctor about your symptoms.', vi: 'Bạn nên hỏi ý kiến bác sĩ về các triệu chứng của mình.' } },
  { id: 154, word: 'consume', ipa: '/kənˈsjuːm/', meaning: 'tiêu thụ', level: Level.B2, example: { en: 'This car consumes a lot of fuel.', vi: 'Chiếc xe này tiêu thụ rất nhiều nhiên liệu.' } },
  { id: 155, word: 'contemporary', ipa: '/kənˈtempərəri/', meaning: 'đương đại', level: Level.B2, example: { en: 'The gallery specializes in contemporary art.', vi: 'Phòng trưng bày chuyên về nghệ thuật đương đại.' } },
  { id: 156, word: 'context', ipa: '/ˈkɒntekst/', meaning: 'bối cảnh', level: Level.B1, example: { en: 'You should consider the context of the situation.', vi: 'Bạn nên xem xét bối cảnh của tình huống.' } },
  { id: 157, word: 'contract', ipa: '/ˈkɒntrækt/', meaning: 'hợp đồng', level: Level.B1, example: { en: 'He signed a three-year contract with the company.', vi: 'Anh ấy đã ký hợp đồng ba năm với công ty.' } },
  { id: 158, word: 'contradict', ipa: '/ˌkɒntrəˈdɪkt/', meaning: 'mâu thuẫn', level: Level.C1, example: { en: 'The witness\'s statement contradicts the evidence.', vi: 'Lời khai của nhân chứng mâu thuẫn với bằng chứng.' } },
  { id: 159, word: 'contribute', ipa: '/kənˈtrɪbjuːt/', meaning: 'đóng góp', level: Level.B2, example: { en: 'Everyone can contribute to a better society.', vi: 'Mọi người đều có thể đóng góp cho một xã hội tốt đẹp hơn.' } },
  { id: 160, word: 'controversy', ipa: '/ˈkɒntrəvɜːsi/', meaning: 'sự tranh cãi', level: Level.B2, example: { en: 'The new law caused a lot of controversy.', vi: 'Luật mới đã gây ra rất nhiều tranh cãi.' } },
  { id: 161, word: 'convention', ipa: '/kənˈvenʃn/', meaning: 'hội nghị, tục lệ', level: Level.B2, example: { en: 'It is a social convention to shake hands.', vi: 'Bắt tay là một tục lệ xã hội.' } },
  { id: 162, word: 'core', ipa: '/kɔː(r)/', meaning: 'cốt lõi', level: Level.B2, example: { en: 'The core of the problem is a lack of funding.', vi: 'Cốt lõi của vấn đề là thiếu kinh phí.' } },
  { id: 163, word: 'corporate', ipa: '/ˈkɔːpərət/', meaning: 'thuộc công ty', level: Level.B2, example: { en: 'The company has a strong corporate culture.', vi: 'Công ty có văn hóa doanh nghiệp mạnh mẽ.' } },
  { id: 164, word: 'correspond', ipa: '/ˌkɒrəˈspɒnd/', meaning: 'tương ứng', level: Level.C1, example: { en: 'The results correspond with our predictions.', vi: 'Kết quả tương ứng với dự đoán của chúng tôi.' } },
  { id: 165, word: 'couple', ipa: '/ˈkʌpl/', meaning: 'cặp đôi, một vài', level: Level.A2, example: { en: 'I have a couple of questions.', vi: 'Tôi có một vài câu hỏi.' } },
  { id: 166, word: 'create', ipa: '/kriˈeɪt/', meaning: 'tạo ra', level: Level.A2, example: { en: 'She likes to create her own clothes.', vi: 'Cô ấy thích tự tạo quần áo cho mình.' } },
  { id: 167, word: 'credit', ipa: '/ˈkredɪt/', meaning: 'tín dụng', level: Level.B1, example: { en: 'I bought this car on credit.', vi: 'Tôi đã mua chiếc xe này bằng tín dụng.' } },
  { id: 168, word: 'criteria', ipa: '/kraɪˈtɪəriə/', meaning: 'tiêu chí', level: Level.B2, example: { en: 'What are the criteria for selecting the winner?', vi: 'Tiêu chí để chọn người chiến thắng là gì?' } },
  { id: 169, word: 'decade', ipa: '/ˈdekeɪd/', meaning: 'thập kỷ', level: Level.B2, example: { en: 'The company has grown a lot in the last decade.', vi: 'Công ty đã phát triển rất nhiều trong thập kỷ qua.' } },
  { id: 170, word: 'decline', ipa: '/dɪˈklaɪn/', meaning: 'suy giảm, từ chối', level: Level.B2, example: { en: 'There has been a decline in sales this year.', vi: 'Doanh số bán hàng đã giảm trong năm nay.' } },
  { id: 171, word: 'deduce', ipa: '/dɪˈdjuːs/', meaning: 'suy luận', level: Level.C1, example: { en: 'From the evidence, we can deduce that he is guilty.', vi: 'Từ bằng chứng, chúng ta có thể suy ra rằng anh ta có tội.' } },
  { id: 172, word: 'define', ipa: '/dɪˈfaɪn/', meaning: 'định nghĩa', level: Level.B1, example: { en: 'Can you define this word for me?', vi: 'Bạn có thể định nghĩa từ này cho tôi được không?' } },
  { id: 173, word: 'demonstrate', ipa: '/ˈdemənstreɪt/', meaning: 'chứng minh, thể hiện', level: Level.B2, example: { en: 'The study demonstrates the importance of exercise.', vi: 'Nghiên cứu chứng tỏ tầm quan trọng của việc tập thể dục.' } },
  { id: 174, word: 'denote', ipa: '/dɪˈnəʊt/', meaning: 'biểu thị', level: Level.C1, example: { en: 'The red flag denotes danger.', vi: 'Lá cờ đỏ biểu thị sự nguy hiểm.' } },
  { id: 175, word: 'deprive', ipa: '/dɪˈpraɪv/', meaning: 'tước đoạt', level: Level.C1, example: { en: 'The new law will deprive many people of their rights.', vi: 'Luật mới sẽ tước đi quyền lợi của nhiều người.' } },
  { id: 176, word: 'derive', ipa: '/dɪˈraɪv/', meaning: 'bắt nguồn từ', level: Level.C1, example: { en: 'The word derives from Latin.', vi: 'Từ này có nguồn gốc từ tiếng Latin.' } },
  { id: 177, word: 'design', ipa: '/dɪˈzaɪn/', meaning: 'thiết kế', level: Level.A2, example: { en: 'She wants to design clothes.', vi: 'Cô ấy muốn thiết kế quần áo.' } },
  { id: 178, word: 'despite', ipa: '/dɪˈspaɪt/', meaning: 'mặc dù', level: Level.B1, example: { en: 'He went to work despite being sick.', vi: 'Anh ấy đã đi làm mặc dù bị ốm.' } },
  { id: 179, word: 'detect', ipa: '/dɪˈtekt/', meaning: 'phát hiện', level: Level.B2, example: { en: 'The system can detect any movement.', vi: 'Hệ thống có thể phát hiện bất kỳ chuyển động nào.' } },
  { id: 180, word: 'deviate', ipa: '/ˈdiːvieɪt/', meaning: 'lệch hướng', level: Level.C1, example: { en: 'We should not deviate from the original plan.', vi: 'Chúng ta không nên đi chệch khỏi kế hoạch ban đầu.' } },
  { id: 181, word: 'device', ipa: '/dɪˈvaɪs/', meaning: 'thiết bị', level: Level.B1, example: { en: 'This device can measure your heart rate.', vi: 'Thiết bị này có thể đo nhịp tim của bạn.' } },
  { id: 182, word: 'differentiate', ipa: '/ˌdɪfəˈrenʃieɪt/', meaning: 'phân biệt', level: Level.C1, example: { en: 'It is difficult to differentiate between the two products.', vi: 'Thật khó để phân biệt giữa hai sản phẩm.' } },
  { id: 183, word: 'dimension', ipa: '/daɪˈmenʃn/', meaning: 'kích thước, khía cạnh', level: Level.B2, example: { en: 'The problem has an international dimension.', vi: 'Vấn đề có một khía cạnh quốc tế.' } },
  { id: 184, word: 'diminish', ipa: '/dɪˈmɪnɪʃ/', meaning: 'giảm bớt', level: Level.C1, example: { en: 'The company\'s profits have diminished in recent years.', vi: 'Lợi nhuận của công ty đã giảm sút trong những năm gần đây.' } },
  { id: 185, word: 'abroad', ipa: '/əˈbrɔːd/', meaning: 'ở nước ngoài', level: Level.A2, example: { en: 'She wants to study abroad next year.', vi: 'Cô ấy muốn đi du học vào năm tới.' } },
  { id: 186, word: 'accident', ipa: '/ˈæksɪdənt/', meaning: 'tai nạn', level: Level.A2, example: { en: 'There was a car accident on the main road.', vi: 'Đã có một vụ tai nạn xe hơi trên đường chính.' } },
  { id: 187, word: 'address', ipa: '/əˈdres/', meaning: 'địa chỉ', level: Level.A2, example: { en: 'What is your current address?', vi: 'Địa chỉ hiện tại của bạn là gì?' } },
  { id: 188, word: 'advertisement', ipa: '/ədˈvɜːtɪsmənt/', meaning: 'quảng cáo', level: Level.A2, example: { en: 'I saw an advertisement for a new phone.', vi: 'Tôi đã thấy một quảng cáo cho một chiếc điện thoại mới.' } },
  { id: 189, word: 'amazing', ipa: '/əˈmeɪzɪŋ/', meaning: 'kinh ngạc', level: Level.A2, example: { en: 'The view from the top was amazing.', vi: 'Quang cảnh từ trên đỉnh thật kinh ngạc.' } },
  { id: 190, word: 'apartment', ipa: '/əˈpɑːtmənt/', meaning: 'căn hộ', level: Level.A2, example: { en: 'They live in a small apartment in the city.', vi: 'Họ sống trong một căn hộ nhỏ ở thành phố.' } },
  { id: 191, word: 'appear', ipa: '/əˈpɪə(r)/', meaning: 'xuất hiện', level: Level.A2, example: { en: 'A strange man appeared at the door.', vi: 'Một người đàn ông lạ mặt xuất hiện ở cửa.' } },
  { id: 192, word: 'arrive', ipa: '/əˈraɪv/', meaning: 'đến', level: Level.A2, example: { en: 'What time did you arrive at the airport?', vi: 'Bạn đã đến sân bay lúc mấy giờ?' } },
  { id: 193, word: 'attend', ipa: '/əˈtend/', meaning: 'tham dự', level: Level.B1, example: { en: 'Are you going to attend the meeting?', vi: 'Bạn có định tham dự cuộc họp không?' } },
  { id: 194, word: 'autumn', ipa: '/ˈɔːtəm/', meaning: 'mùa thu', level: Level.A2, example: { en: 'The leaves turn brown in autumn.', vi: 'Lá chuyển sang màu nâu vào mùa thu.' } },
  { id: 195, word: 'advantage', ipa: '/ədˈvɑːntɪdʒ/', meaning: 'lợi thế', level: Level.B1, example: { en: 'Her experience gave her an advantage over other candidates.', vi: 'Kinh nghiệm đã mang lại cho cô ấy một lợi thế so với các ứng viên khác.' } },
  { id: 196, word: 'afford', ipa: '/əˈfɔːd/', meaning: 'có đủ khả năng', level: Level.B1, example: { en: 'I can\'t afford to buy a new car.', vi: 'Tôi không đủ khả năng mua một chiếc xe hơi mới.' } },
  { id: 197, word: 'aim', ipa: '/eɪm/', meaning: 'mục tiêu', level: Level.B1, example: { en: 'The aim of the project is to increase sales.', vi: 'Mục tiêu của dự án là tăng doanh số.' } },
  { id: 198, word: 'ambition', ipa: '/æmˈbɪʃn/', meaning: 'tham vọng', level: Level.B1, example: { en: 'Her ambition is to become a doctor.', vi: 'Tham vọng của cô ấy là trở thành một bác sĩ.' } },
  { id: 199, word: 'announce', ipa: '/əˈnaʊns/', meaning: 'thông báo', level: Level.B1, example: { en: 'They will announce the winner tomorrow.', vi: 'Họ sẽ công bố người chiến thắng vào ngày mai.' } },
  { id: 200, word: 'anxious', ipa: '/ˈæŋkʃəs/', meaning: 'lo lắng', level: Level.B1, example: { en: 'She was anxious about the exam.', vi: 'Cô ấy lo lắng về kỳ thi.' } },
  { id: 201, word: 'apply', ipa: '/əˈplaɪ/', meaning: 'ứng tuyển, áp dụng', level: Level.B1, example: { en: 'He decided to apply for the job.', vi: 'Anh ấy đã quyết định ứng tuyển vào công việc đó.' } },
  { id: 202, word: 'appointment', ipa: '/əˈpɔɪntmənt/', meaning: 'cuộc hẹn', level: Level.B1, example: { en: 'I have a doctor\'s appointment at 3 PM.', vi: 'Tôi có một cuộc hẹn với bác sĩ lúc 3 giờ chiều.' } },
  { id: 203, word: 'appreciate', ipa: '/əˈpriːʃieɪt/', meaning: 'đánh giá cao', level: Level.B1, example: { en: 'I really appreciate your help.', vi: 'Tôi thực sự đánh giá cao sự giúp đỡ của bạn.' } },
  { id: 204, word: 'approve', ipa: '/əˈpruːv/', meaning: 'phê duyệt', level: Level.B1, example: { en: 'The manager approved my request.', vi: 'Giám đốc đã phê duyệt yêu cầu của tôi.' } },
  { id: 205, word: 'arrange', ipa: '/əˈreɪndʒ/', meaning: 'sắp xếp', level: Level.B1, example: { en: 'Can you arrange a meeting for next week?', vi: 'Bạn có thể sắp xếp một cuộc họp vào tuần tới không?' } },
  { id: 206, word: 'ashamed', ipa: '/əˈʃeɪmd/', meaning: 'xấu hổ', level: Level.B1, example: { en: 'He was ashamed of his behavior.', vi: 'Anh ấy xấu hổ về hành vi của mình.' } },
  { id: 207, word: 'atmosphere', ipa: '/ˈætməsfɪə(r)/', meaning: 'bầu không khí', level: Level.B1, example: { en: 'The hotel had a friendly atmosphere.', vi: 'Khách sạn có một bầu không khí thân thiện.' } },
  { id: 208, word: 'attack', ipa: '/əˈtæk/', meaning: 'tấn công', level: Level.B1, example: { en: 'The army launched a surprise attack.', vi: 'Quân đội đã phát động một cuộc tấn công bất ngờ.' } },
  { id: 209, word: 'attitude', ipa: '/ˈætɪtjuːd/', meaning: 'thái độ', level: Level.B1, example: { en: 'He has a positive attitude towards his work.', vi: 'Anh ấy có thái độ tích cực đối với công việc của mình.' } },
  { id: 210, word: 'attractive', ipa: '/əˈtræktɪv/', meaning: 'hấp dẫn', level: Level.B1, example: { en: 'She wore an attractive dress.', vi: 'Cô ấy mặc một chiếc váy hấp dẫn.' } },
  { id: 211, word: 'audience', ipa: '/ˈɔːdiəns/', meaning: 'khán giả', level: Level.B1, example: { en: 'The audience clapped loudly.', vi: 'Khán giả đã vỗ tay rất lớn.' } },
  { id: 212, word: 'avoid', ipa: '/əˈvɔɪd/', meaning: 'tránh', level: Level.B1, example: { en: 'You should avoid eating fatty foods.', vi: 'Bạn nên tránh ăn đồ ăn nhiều dầu mỡ.' } },
  { id: 213, word: 'background', ipa: '/ˈbæɡraʊnd/', meaning: 'lý lịch, nền', level: Level.B1, example: { en: 'She has a background in marketing.', vi: 'Cô ấy có kinh nghiệm trong lĩnh vực marketing.' } },
  { id: 214, word: 'basic', ipa: '/ˈbeɪsɪk/', meaning: 'cơ bản', level: Level.B1, example: { en: 'You need to learn the basic rules.', vi: 'Bạn cần phải học các quy tắc cơ bản.' } },
  { id: 215, word: 'absolutely', ipa: '/ˌæbsəˈluːtli/', meaning: 'hoàn toàn', level: Level.B2, example: { en: 'You are absolutely right.', vi: 'Bạn hoàn toàn đúng.' } },
  { id: 216, word: 'abuse', ipa: '/əˈbjuːs/', meaning: 'lạm dụng', level: Level.B2, example: { en: 'He was arrested for drug abuse.', vi: 'Anh ta đã bị bắt vì lạm dụng ma túy.' } },
  { id: 217, word: 'accurate', ipa: '/ˈækjərət/', meaning: 'chính xác', level: Level.B2, example: { en: 'The report must be accurate.', vi: 'Báo cáo phải chính xác.' } },
  { id: 218, word: 'acknowledge', ipa: '/əkˈnɒlɪdʒ/', meaning: 'thừa nhận', level: Level.B2, example: { en: 'He acknowledged his mistake.', vi: 'Anh ấy đã thừa nhận sai lầm của mình.' } },
  { id: 219, word: 'adapt', ipa: '/əˈdæpt/', meaning: 'thích nghi', level: Level.B2, example: { en: 'We need to adapt to the new situation.', vi: 'Chúng ta cần phải thích nghi với tình hình mới.' } },
  { id: 220, word: 'admire', ipa: '/ədˈmaɪə(r)/', meaning: 'ngưỡng mộ', level: Level.B2, example: { en: 'I admire her for her courage.', vi: 'Tôi ngưỡng mộ cô ấy vì lòng dũng cảm của cô ấy.' } },
  { id: 221, word: 'admission', ipa: '/ədˈmɪʃn/', meaning: 'sự thừa nhận, vé vào cửa', level: Level.B2, example: { en: 'Admission to the museum is free.', vi: 'Vé vào cửa bảo tàng là miễn phí.' } },
  { id: 222, word: 'adopt', ipa: '/əˈdɒpt/', meaning: 'nhận nuôi, áp dụng', level: Level.B2, example: { en: 'They decided to adopt a child.', vi: 'Họ đã quyết định nhận nuôi một đứa trẻ.' } },
  { id: 223, word: 'advanced', ipa: '/ədˈvɑːnst/', meaning: 'tiên tiến', level: Level.B2, example: { en: 'This is an advanced course for experienced students.', vi: 'Đây là một khóa học nâng cao dành cho sinh viên có kinh nghiệm.' } },
  { id: 224, word: 'affair', ipa: '/əˈfeə(r)/', meaning: 'vụ việc', level: Level.B2, example: { en: 'The government is dealing with a serious affair.', vi: 'Chính phủ đang giải quyết một vụ việc nghiêm trọng.' } },
  { id: 225, word: 'agency', ipa: '/ˈeɪdʒənsi/', meaning: 'đại lý', level: Level.B2, example: { en: 'She works for a travel agency.', vi: 'Cô ấy làm việc cho một đại lý du lịch.' } },
  { id: 226, word: 'agenda', ipa: '/əˈdʒendə/', meaning: 'chương trình nghị sự', level: Level.B2, example: { en: 'What is on the agenda for today\'s meeting?', vi: 'Chương trình nghị sự cho cuộc họp hôm nay là gì?' } },
  { id: 227, word: 'aggressive', ipa: '/əˈɡresɪv/', meaning: 'hung hăng', level: Level.B2, example: { en: 'He has a very aggressive style of playing.', vi: 'Anh ấy có một phong cách chơi rất hung hăng.' } },
  { id: 228, word: 'aid', ipa: '/eɪd/', meaning: 'sự giúp đỡ', level: Level.B2, example: { en: 'They provided humanitarian aid to the refugees.', vi: 'Họ đã cung cấp viện trợ nhân đạo cho những người tị nạn.' } },
  { id: 229, word: 'alcohol', ipa: '/ˈælkəhɒl/', meaning: 'rượu, cồn', level: Level.B2, example: { en: 'You should not drink alcohol and drive.', vi: 'Bạn không nên uống rượu và lái xe.' } },
  { id: 230, word: 'alter', ipa: '/ˈɔːltə(r)/', meaning: 'thay đổi', level: Level.B2, example: { en: 'We had to alter our plans.', vi: 'Chúng tôi đã phải thay đổi kế hoạch của mình.' } },
  { id: 231, word: 'annual', ipa: '/ˈænjuəl/', meaning: 'hàng năm', level: Level.B2, example: { en: 'The company holds an annual conference.', vi: 'Công ty tổ chức một hội nghị hàng năm.' } },
  { id: 232, word: 'apparent', ipa: '/əˈpærənt/', meaning: 'rõ ràng', level: Level.B2, example: { en: 'It was apparent that she was not happy.', vi: 'Rõ ràng là cô ấy không vui.' } },
  { id: 233, word: 'appeal', ipa: '/əˈpiːl/', meaning: 'sự hấp dẫn, lời kêu gọi', level: Level.B2, example: { en: 'The campaign has a strong appeal to young people.', vi: 'Chiến dịch có sức hấp dẫn mạnh mẽ đối với giới trẻ.' } },
  { id: 234, word: 'arise', ipa: '/əˈraɪz/', meaning: 'nảy sinh', level: Level.B2, example: { en: 'A new problem has arisen.', vi: 'Một vấn đề mới đã nảy sinh.' } },
  { id: 235, word: 'absorb', ipa: '/əbˈsɔːb/', meaning: 'hấp thụ', level: Level.C1, example: { en: 'Plants absorb carbon dioxide.', vi: 'Thực vật hấp thụ carbon dioxide.' } },
  { id: 236, word: 'abstract', ipa: '/ˈæbstrækt/', meaning: 'trừu tượng', level: Level.C1, example: { en: 'This is an abstract painting.', vi: 'Đây là một bức tranh trừu tượng.' } },
  { id: 237, word: 'absurd', ipa: '/əbˈsɜːd/', meaning: 'vô lý', level: Level.C1, example: { en: 'The story was completely absurd.', vi: 'Câu chuyện hoàn toàn vô lý.' } },
  { id: 238, word: 'abundant', ipa: '/əˈbʌndənt/', meaning: 'dồi dào', level: Level.C1, example: { en: 'The country has abundant natural resources.', vi: 'Đất nước có nguồn tài nguyên thiên nhiên dồi dào.' } },
  { id: 239, word: 'accompany', ipa: '/əˈkʌmpəni/', meaning: 'đi cùng', level: Level.C1, example: { en: 'He will accompany her to the party.', vi: 'Anh ấy sẽ đi cùng cô ấy đến bữa tiệc.' } },
  { id: 240, word: 'accumulate', ipa: '/əˈkjuːmjəleɪt/', meaning: 'tích lũy', level: Level.C1, example: { en: 'She has accumulated a large fortune.', vi: 'Bà ấy đã tích lũy được một gia tài lớn.' } },
  { id: 241, word: 'accusation', ipa: '/ˌækjuˈzeɪʃn/', meaning: 'sự buộc tội', level: Level.C1, example: { en: 'He denied the accusations against him.', vi: 'Anh ta đã phủ nhận những lời buộc tội chống lại mình.' } },
  { id: 242, word: 'accuse', ipa: '/əˈkjuːz/', meaning: 'buộc tội', level: Level.C1, example: { en: 'She accused him of stealing her money.', vi: 'Cô ấy buộc tội anh ta ăn cắp tiền của cô ấy.' } },
  { id: 243, word: 'acquisition', ipa: '/ˌækwɪˈzɪʃn/', meaning: 'sự mua lại', level: Level.C1, example: { en: 'The company announced a new acquisition.', vi: 'Công ty đã công bố một thương vụ mua lại mới.' } },
  { id: 244, word: 'adjacent', ipa: '/əˈdʒeɪsnt/', meaning: 'liền kề', level: Level.C1, example: { en: 'They live in the adjacent house.', vi: 'Họ sống ở ngôi nhà liền kề.' } },
  { id: 245, word: 'adjust', ipa: '/əˈdʒʌst/', meaning: 'điều chỉnh', level: Level.B2, example: { en: 'You need to adjust the settings.', vi: 'Bạn cần điều chỉnh cài đặt.' } },
  { id: 246, word: 'administer', ipa: '/ədˈmɪnɪstə(r)/', meaning: 'quản lý', level: Level.C1, example: { en: 'The government will administer the new program.', vi: 'Chính phủ sẽ quản lý chương trình mới.' } },
  { id: 247, word: 'admiration', ipa: '/ˌædməˈreɪʃn/', meaning: 'sự ngưỡng mộ', level: Level.C1, example: { en: 'She has a great admiration for his work.', vi: 'Cô ấy rất ngưỡng mộ công việc của anh ấy.' } },
  { id: 248, word: 'adverse', ipa: '/ˈædvɜːs/', meaning: 'bất lợi', level: Level.C1, example: { en: 'The drug has no adverse side effects.', vi: 'Thuốc không có tác dụng phụ bất lợi.' } },
  { id: 249, word: 'affection', ipa: '/əˈfekʃn/', meaning: 'tình cảm', level: Level.C1, example: { en: 'She has a deep affection for her children.', vi: 'Bà ấy có tình cảm sâu sắc với con cái của mình.' } },
  { id: 250, word: 'alien', ipa: '/ˈeɪliən/', meaning: 'người ngoài hành tinh, xa lạ', level: Level.B2, example: { en: 'The concept was alien to me.', vi: 'Khái niệm đó xa lạ với tôi.' } },
  { id: 251, word: 'allegedly', ipa: '/əˈledʒɪdli/', meaning: 'được cho là', level: Level.C1, example: { en: 'He was allegedly involved in the crime.', vi: 'Anh ta được cho là có liên quan đến vụ án.' } },
  { id: 252, word: 'alliance', ipa: '/əˈlaɪəns/', meaning: 'liên minh', level: Level.C1, example: { en: 'The two countries formed a strong alliance.', vi: 'Hai nước đã thành lập một liên minh vững chắc.' } },
  { id: 253, word: 'allocate', ipa: '/ˈæləkeɪt/', meaning: 'phân bổ', level: Level.C1, example: { en: 'The government will allocate more funds for education.', vi: 'Chính phủ sẽ phân bổ thêm kinh phí cho giáo dục.' } },
  { id: 254, word: 'alongside', ipa: '/əˌlɒŋˈsaɪd/', meaning: 'bên cạnh', level: Level.B2, example: { en: 'He worked alongside his father.', vi: 'Anh ấy đã làm việc cùng với cha mình.' } },
  { id: 255, word: 'amend', ipa: '/əˈmend/', meaning: 'sửa đổi', level: Level.C1, example: { en: 'The law was amended to include new provisions.', vi: 'Luật đã được sửa đổi để bao gồm các điều khoản mới.' } },
  { id: 256, word: 'analogy', ipa: '/əˈnælədʒi/', meaning: 'sự tương tự', level: Level.C1, example: { en: 'He drew an analogy between the human brain and a computer.', vi: 'Anh ấy đã đưa ra một sự tương tự giữa bộ não con người và một máy tính.' } },
  { id: 257, word: 'ancestor', ipa: '/ˈænsestə(r)/', meaning: 'tổ tiên', level: Level.B2, example: { en: 'My ancestors came from Ireland.', vi: 'Tổ tiên của tôi đến từ Ireland.' } },
  { id: 258, word: 'anticipate', ipa: '/ænˈtɪsɪpeɪt/', meaning: 'đoán trước', level: Level.C1, example: { en: 'We anticipate that sales will increase.', vi: 'Chúng tôi dự đoán rằng doanh số sẽ tăng.' } },
  { id: 259, word: 'anxiety', ipa: '/æŋˈzaɪəti/', meaning: 'sự lo lắng', level: Level.B2, example: { en: 'He suffers from anxiety.', vi: 'Anh ấy bị chứng lo âu.' } },
  { id: 260, word: 'apology', ipa: '/əˈpɒlədʒi/', meaning: 'lời xin lỗi', level: Level.B1, example: { en: 'He made an apology for his behavior.', vi: 'Anh ấy đã xin lỗi vì hành vi của mình.' } },
  { id: 261, word: 'apparatus', ipa: '/ˌæpəˈreɪtəs/', meaning: 'thiết bị', level: Level.C1, example: { en: 'The lab is equipped with modern apparatus.', vi: 'Phòng thí nghiệm được trang bị các thiết bị hiện đại.' } },
  { id: 262, word: 'applicable', ipa: '/əˈplɪkəbl/', meaning: 'có thể áp dụng', level: Level.C1, example: { en: 'The rule is not applicable in this case.', vi: 'Quy tắc này không thể áp dụng trong trường hợp này.' } },
  { id: 263, word: 'arbitrary', ipa: '/ˈɑːbɪtrəri/', meaning: 'tùy tiện', level: Level.C1, example: { en: 'The decision was arbitrary and unfair.', vi: 'Quyết định này là tùy tiện và không công bằng.' } },
  { id: 264, word: 'architectural', ipa: '/ˌɑːkɪˈtektʃərəl/', meaning: 'thuộc kiến trúc', level: Level.C1, example: { en: 'The building is an architectural masterpiece.', vi: 'Tòa nhà là một kiệt tác kiến trúc.' } },
  { id: 265, word: 'archive', ipa: '/ˈɑːkaɪv/', meaning: 'lưu trữ', level: Level.C1, example: { en: 'The documents are kept in an archive.', vi: 'Các tài liệu được lưu giữ trong một kho lưu trữ.' } },
  { id: 266, word: 'arena', ipa: '/əˈriːnə/', meaning: 'đấu trường', level: Level.B2, example: { en: 'The concert was held in a large arena.', vi: 'Buổi hòa nhạc được tổ chức tại một đấu trường lớn.' } },
  { id: 267, word: 'aspiration', ipa: '/ˌæspəˈreɪʃn/', meaning: 'khát vọng', level: Level.C1, example: { en: 'She has aspirations to become a writer.', vi: 'Cô ấy có khát vọng trở thành một nhà văn.' } },
  { id: 268, word: 'assemble', ipa: '/əˈsembl/', meaning: 'lắp ráp', level: Level.B2, example: { en: 'He assembled the furniture himself.', vi: 'Anh ấy đã tự lắp ráp đồ đạc.' } },
  { id: 269, word: 'asset', ipa: '/ˈæset/', meaning: 'tài sản', level: Level.B2, example: { en: 'Her knowledge of languages is a real asset.', vi: 'Kiến thức về ngôn ngữ của cô ấy là một tài sản thực sự.' } },
  { id: 270, word: 'assign', ipa: '/əˈsaɪn/', meaning: 'giao', level: Level.B2, example: { en: 'The teacher assigned us a new project.', vi: 'Giáo viên đã giao cho chúng tôi một dự án mới.' } },
  { id: 271, word: 'assurance', ipa: '/əˈʃʊərəns/', meaning: 'sự đảm bảo', level: Level.C1, example: { en: 'He gave me an assurance that it would not happen again.', vi: 'Anh ấy đã cho tôi một sự đảm bảo rằng điều đó sẽ không xảy ra nữa.' } },
  { id: 272, word: 'attain', ipa: '/əˈteɪn/', meaning: 'đạt được', level: Level.C1, example: { en: 'She attained her goal of becoming a doctor.', vi: 'Cô ấy đã đạt được mục tiêu trở thành bác sĩ.' } },
  { id: 273, word: 'attribute', ipa: '/əˈtrɪbjuːt/', meaning: 'cho là do', level: Level.B2, example: { en: 'He attributed his success to hard work.', vi: 'Anh ấy cho rằng thành công của mình là do làm việc chăm chỉ.' } },
  { id: 274, word: 'auction', ipa: '/ˈɔːkʃn/', meaning: 'đấu giá', level: Level.B2, example: { en: 'The painting was sold at auction.', vi: 'Bức tranh đã được bán đấu giá.' } },
  { id: 275, word: 'barely', ipa: '/ˈbeəli/', meaning: 'hầu như không', level: Level.B2, example: { en: 'I could barely hear what she was saying.', vi: 'Tôi hầu như không thể nghe thấy cô ấy đang nói gì.' } },
  { id: 276, word: 'barrier', ipa: '/ˈbæriə(r)/', meaning: 'rào cản', level: Level.B2, example: { en: 'Language can be a barrier to communication.', vi: 'Ngôn ngữ có thể là một rào cản trong giao tiếp.' } },
  { id: 277, word: 'battle', ipa: '/ˈbætl/', meaning: 'trận chiến', level: Level.B2, example: { en: 'The two armies fought a fierce battle.', vi: 'Hai đội quân đã chiến đấu một trận chiến ác liệt.' } },
  { id: 278, word: 'belief', ipa: '/bɪˈliːf/', meaning: 'niềm tin', level: Level.B1, example: { en: 'She has a strong belief in herself.', vi: 'Cô ấy có một niềm tin mạnh mẽ vào bản thân.' } },
  { id: 279, word: 'bid', ipa: '/bɪd/', meaning: 'trả giá', level: Level.B2, example: { en: 'He made a bid for the painting.', vi: 'Anh ấy đã trả giá cho bức tranh.' } },
  { id: 280, word: 'bond', ipa: '/bɒnd/', meaning: 'mối liên kết', level: Level.B2, example: { en: 'There is a strong bond between them.', vi: 'Có một mối liên kết mạnh mẽ giữa họ.' } },
  { id: 281, word: 'boundary', ipa: '/ˈbaʊndri/', meaning: 'ranh giới', level: Level.B2, example: { en: 'The river forms the boundary between the two countries.', vi: 'Con sông tạo thành ranh giới giữa hai nước.' } },
  { id: 282, word: 'brief', ipa: '/briːf/', meaning: 'ngắn gọn', level: Level.B1, example: { en: 'He gave a brief summary of the report.', vi: 'Anh ấy đã đưa ra một bản tóm tắt ngắn gọn của báo cáo.' } },
  { id: 283, word: 'broadcast', ipa: '/ˈbrɔːdkɑːst/', meaning: 'phát sóng', level: Level.B2, example: { en: 'The concert was broadcast live.', vi: 'Buổi hòa nhạc được phát sóng trực tiếp.' } },
  { id: 284, word: 'bubble', ipa: '/ˈbʌbl/', meaning: 'bong bóng', level: Level.B2, example: { en: 'The children were blowing bubbles.', vi: 'Bọn trẻ đang thổi bong bóng.' } },
  { id: 285, word: 'burden', ipa: '/ˈbɜːdn/', meaning: 'gánh nặng', level: Level.B2, example: { en: 'He became a burden to his family.', vi: 'Anh ấy đã trở thành gánh nặng cho gia đình.' } },
  { id: 286, word: 'cabinet', ipa: '/ˈkæbɪnət/', meaning: 'tủ', level: Level.B2, example: { en: 'The documents are kept in a locked cabinet.', vi: 'Các tài liệu được giữ trong một chiếc tủ bị khóa.' } },
  { id: 287, word: 'campaign', ipa: '/kæmˈpeɪn/', meaning: 'chiến dịch', level: Level.B1, example: { en: 'They launched a new advertising campaign.', vi: 'Họ đã phát động một chiến dịch quảng cáo mới.' } },
  { id: 288, word: 'capture', ipa: '/ˈkæptʃə(r)/', meaning: 'bắt giữ', level: Level.B2, example: { en: 'The police captured the escaped prisoner.', vi: 'Cảnh sát đã bắt giữ tù nhân trốn thoát.' } },
  { id: 289, word: 'cast', ipa: '/kɑːst/', meaning: 'dàn diễn viên', level: Level.B2, example: { en: 'The movie has an excellent cast.', vi: 'Bộ phim có một dàn diễn viên xuất sắc.' } },
  { id: 290, word: 'category', ipa: '/ˈkætəɡəri/', meaning: 'hạng mục', level: Level.A2, example: { en: 'The books are divided into different categories.', vi: 'Những cuốn sách được chia thành các hạng mục khác nhau.' } },
  { id: 291, word: 'channel', ipa: '/ˈtʃænl/', meaning: 'kênh', level: Level.B1, example: { en: 'What channel is the movie on?', vi: 'Bộ phim đang chiếu trên kênh nào?' } },
  { id: 292, word: 'chapter', ipa: '/ˈtʃæptə(r)/', meaning: 'chương', level: Level.B1, example: { en: 'I read the first chapter of the book.', vi: 'Tôi đã đọc chương đầu tiên của cuốn sách.' } },
  { id: 293, word: 'characteristic', ipa: '/ˌkærəktəˈrɪstɪk/', meaning: 'đặc điểm', level: Level.B2, example: { en: 'What are the main characteristics of this product?', vi: 'Những đặc điểm chính của sản phẩm này là gì?' } },
  { id: 294, word: 'chart', ipa: '/tʃɑːt/', meaning: 'biểu đồ', level: Level.B1, example: { en: 'The chart shows the sales figures for this year.', vi: 'Biểu đồ cho thấy số liệu bán hàng trong năm nay.' } },
  { id: 295, word: 'chief', ipa: '/tʃiːf/', meaning: 'trưởng', level: Level.B2, example: { en: 'He is the chief executive of the company.', vi: 'Ông ấy là giám đốc điều hành của công ty.' } },
  { id: 296, word: 'cite', ipa: '/saɪt/', meaning: 'trích dẫn', level: Level.C1, example: { en: 'He cited several sources in his report.', vi: 'Anh ấy đã trích dẫn một số nguồn trong báo cáo của mình.' } },
  { id: 297, word: 'civil', ipa: '/ˈsɪvl/', meaning: 'dân sự', level: Level.B2, example: { en: 'They got married in a civil ceremony.', vi: 'Họ đã kết hôn trong một buổi lễ dân sự.' } },
  { id: 298, word: 'classic', ipa: '/ˈklæsɪk/', meaning: 'kinh điển', level: Level.B1, example: { en: 'This is a classic novel.', vi: 'Đây là một cuốn tiểu thuyết kinh điển.' } },
  { id: 299, word: 'client', ipa: '/ˈklaɪənt/', meaning: 'khách hàng', level: Level.B1, example: { en: 'She has a meeting with a new client.', vi: 'Cô ấy có một cuộc họp với một khách hàng mới.' } },
  { id: 300, word: 'climate', ipa: '/ˈklaɪmət/', meaning: 'khí hậu', level: Level.B1, example: { en: 'The country has a warm climate.', vi: 'Đất nước có khí hậu ấm áp.' } },
  { id: 301, word: 'colleague', ipa: '/ˈkɒliːɡ/', meaning: 'đồng nghiệp', level: Level.B1, example: { en: 'I went to lunch with my colleagues.', vi: 'Tôi đã đi ăn trưa với các đồng nghiệp của mình.' } },
  { id: 302, word: 'collect', ipa: '/kəˈlekt/', meaning: 'sưu tầm', level: Level.A2, example: { en: 'He collects stamps.', vi: 'Anh ấy sưu tầm tem.' } },
  { id: 303, word: 'comfort', ipa: '/ˈkʌmfət/', meaning: 'sự thoải mái', level: Level.B1, example: { en: 'She found comfort in her family.', vi: 'Cô ấy đã tìm thấy sự thoải mái trong gia đình mình.' } },
  { id: 304, word: 'comment', ipa: '/ˈkɒment/', meaning: 'bình luận', level: Level.B1, example: { en: 'He made a positive comment about my work.', vi: 'Anh ấy đã đưa ra một bình luận tích cực về công việc của tôi.' } },
  { id: 305, word: 'commercial', ipa: '/kəˈmɜːʃl/', meaning: 'thương mại', level: Level.B1, example: { en: 'This is a commercial area.', vi: 'Đây là một khu vực thương mại.' } },
  { id: 306, word: 'commit', ipa: '/kəˈmɪt/', meaning: 'cam kết', level: Level.B2, example: { en: 'He committed a serious crime.', vi: 'Anh ta đã phạm một tội ác nghiêm trọng.' } },
  { id: 307, word: 'complain', ipa: '/kəmˈpleɪn/', meaning: 'phàn nàn', level: Level.B1, example: { en: 'She complained about the noise.', vi: 'Cô ấy đã phàn nàn về tiếng ồn.' } },
  { id: 308, word: 'complex', ipa: '/ˈkɒmpleks/', meaning: 'phức tạp', level: Level.B1, example: { en: 'This is a complex problem.', vi: 'Đây là một vấn đề phức tạp.' } },
  { id: 309, word: 'concentrate', ipa: '/ˈkɒnsntreɪt/', meaning: 'tập trung', level: Level.B1, example: { en: 'I can\'t concentrate with all this noise.', vi: 'Tôi không thể tập trung với tất cả tiếng ồn này.' } },
  { id: 310, word: 'confident', ipa: '/ˈkɒnfɪdənt/', meaning: 'tự tin', level: Level.B1, example: { en: 'She is confident about her abilities.', vi: 'Cô ấy tự tin vào khả năng của mình.' } },
  { id: 311, word: 'connect', ipa: '/kəˈnekt/', meaning: 'kết nối', level: Level.A2, example: { en: 'The bridge connects the two cities.', vi: 'Cây cầu kết nối hai thành phố.' } },
  { id: 312, word: 'conscious', ipa: '/ˈkɒnʃəs/', meaning: 'có ý thức', level: Level.B2, example: { en: 'He was conscious of being watched.', vi: 'Anh ấy có ý thức về việc bị theo dõi.' } },
  { id: 313, word: 'contact', ipa: '/ˈkɒntækt/', meaning: 'liên lạc', level: Level.A2, example: { en: 'Please contact me if you have any questions.', vi: 'Vui lòng liên hệ với tôi nếu bạn có bất kỳ câu hỏi nào.' } },
  { id: 314, word: 'contain', ipa: '/kənˈteɪn/', meaning: 'chứa', level: Level.B1, example: { en: 'The box contains old photographs.', vi: 'Chiếc hộp chứa những bức ảnh cũ.' } },
  { id: 315, word: 'continue', ipa: '/kənˈtɪnjuː/', meaning: 'tiếp tục', level: Level.A2, example: { en: 'Please continue with your work.', vi: 'Vui lòng tiếp tục công việc của bạn.' } },
  { id: 316, word: 'creative', ipa: '/kriˈeɪtɪv/', meaning: 'sáng tạo', level: Level.B1, example: { en: 'She is a very creative person.', vi: 'Cô ấy là một người rất sáng tạo.' } },
  { id: 317, word: 'crime', ipa: '/kraɪm/', meaning: 'tội phạm', level: Level.B1, example: { en: 'He was convicted of a serious crime.', vi: 'Anh ta đã bị kết án một tội ác nghiêm trọng.' } },
  { id: 318, word: 'critic', ipa: '/ˈkrɪtɪk/', meaning: 'nhà phê bình', level: Level.B2, example: { en: 'The movie received good reviews from the critics.', vi: 'Bộ phim đã nhận được những đánh giá tốt từ các nhà phê bình.' } },
  { id: 319, word: 'cultural', ipa: '/ˈkʌltʃərəl/', meaning: 'thuộc văn hóa', level: Level.B1, example: { en: 'They organized a cultural event.', vi: 'Họ đã tổ chức một sự kiện văn hóa.' } },
  { id: 320, word: 'currency', ipa: '/ˈkʌrənsi/', meaning: 'tiền tệ', level: Level.B1, example: { en: 'What is the currency of Japan?', vi: 'Tiền tệ của Nhật Bản là gì?' } },
  { id: 321, word: 'current', ipa: '/ˈkʌrənt/', meaning: 'hiện tại', level: Level.B1, example: { en: 'What is your current job?', vi: 'Công việc hiện tại của bạn là gì?' } },
  { id: 322, word: 'dangerous', ipa: '/ˈdeɪndʒərəs/', meaning: 'nguy hiểm', level: Level.A2, example: { en: 'It is dangerous to swim in this river.', vi: 'Bơi ở con sông này rất nguy hiểm.' } },
  { id: 323, word: 'department', ipa: '/dɪˈpɑːtmənt/', meaning: 'phòng ban', level: Level.A2, example: { en: 'She works in the sales department.', vi: 'Cô ấy làm việc ở phòng kinh doanh.' } },
  { id: 324, word: 'dictionary', ipa: '/ˈdɪkʃənri/', meaning: 'từ điển', level: Level.A2, example: { en: 'You can look up the word in a dictionary.', vi: 'Bạn có thể tra từ trong từ điển.' } },
  { id: 325, word: 'difference', ipa: '/ˈdɪfrəns/', meaning: 'sự khác biệt', level: Level.A2, example: { en: 'There is a big difference between the two.', vi: 'Có một sự khác biệt lớn giữa hai cái.' } },
  { id: 326, word: 'direct', ipa: '/daɪˈrekt/', meaning: 'trực tiếp', level: Level.A2, example: { en: 'This is a direct flight to New York.', vi: 'Đây là một chuyến bay thẳng đến New York.' } },
  { id: 327, word: 'direction', ipa: '/daɪˈrekʃn/', meaning: 'phương hướng', level: Level.A2, example: { en: 'Which direction is the station?', vi: 'Ga ở hướng nào?' } },
  { id: 328, word: 'discuss', ipa: '/dɪˈskʌs/', meaning: 'thảo luận', level: Level.A2, example: { en: 'We need to discuss this problem.', vi: 'Chúng ta cần thảo luận về vấn đề này.' } },
  { id: 329, word: 'driver', ipa: '/ˈdraɪvə(r)/', meaning: 'tài xế', level: Level.A1, example: { en: 'He is a bus driver.', vi: 'Anh ấy là tài xế xe buýt.' } },
  { id: 330, word: 'during', ipa: '/ˈdjʊərɪŋ/', meaning: 'trong suốt', level: Level.A2, example: { en: 'He fell asleep during the movie.', vi: 'Anh ấy đã ngủ gật trong suốt bộ phim.' } },
  { id: 331, word: 'evening', ipa: '/ˈiːvnɪŋ/', meaning: 'buổi tối', level: Level.A1, example: { en: 'What are you doing this evening?', vi: 'Bạn sẽ làm gì vào tối nay?' } },
  { id: 332, word: 'exact', ipa: '/ɪɡˈzækt/', meaning: 'chính xác', level: Level.A2, example: { en: 'What is the exact time?', vi: 'Thời gian chính xác là mấy giờ?' } },
  { id: 333, word: 'expensive', ipa: '/ɪkˈspensɪv/', meaning: 'đắt', level: Level.A2, example: { en: 'This is a very expensive car.', vi: 'Đây là một chiếc xe rất đắt tiền.' } },
  { id: 334, word: 'explain', ipa: '/ɪkˈspleɪn/', meaning: 'giải thích', level: Level.A2, example: { en: 'Can you explain this to me?', vi: 'Bạn có thể giải thích điều này cho tôi được không?' } },
  { id: 335, word: 'fantastic', ipa: '/fænˈtæstɪk/', meaning: 'tuyệt vời', level: Level.A2, example: { en: 'We had a fantastic time.', vi: 'Chúng tôi đã có một khoảng thời gian tuyệt vời.' } },
  { id: 336, word: 'feel', ipa: '/fiːl/', meaning: 'cảm thấy', level: Level.A1, example: { en: 'How are you feeling today?', vi: 'Hôm nay bạn cảm thấy thế nào?' } },
  { id: 337, word: 'flight', ipa: '/flaɪt/', meaning: 'chuyến bay', level: Level.A2, example: { en: 'Our flight was delayed.', vi: 'Chuyến bay của chúng tôi đã bị hoãn.' } },
  { id: 338, word: 'friendly', ipa: '/ˈfrendli/', meaning: 'thân thiện', level: Level.A1, example: { en: 'She is a very friendly person.', vi: 'Cô ấy là một người rất thân thiện.' } },
  { id: 339, word: 'fun', ipa: '/fʌn/', meaning: 'vui vẻ', level: Level.A1, example: { en: 'We had a lot of fun at the party.', vi: 'Chúng tôi đã có rất nhiều niềm vui ở bữa tiệc.' } },
  { id: 340, word: 'funny', ipa: '/ˈfʌni/', meaning: 'buồn cười', level: Level.A2, example: { en: 'He told a funny joke.', vi: 'Anh ấy đã kể một câu chuyện cười.' } },
  { id: 341, word: 'group', ipa: '/ɡruːp/', meaning: 'nhóm', level: Level.A1, example: { en: 'A group of students were waiting outside.', vi: 'Một nhóm học sinh đang đợi ở bên ngoài.' } },
  { id: 342, word: 'boring', ipa: '/ˈbɔːrɪŋ/', meaning: 'nhàm chán', level: Level.A2, example: { en: 'The movie was very boring.', vi: 'Bộ phim rất nhàm chán.' } },
  { id: 343, word: 'brilliant', ipa: '/ˈbrɪliənt/', meaning: 'xuất sắc', level: Level.B1, example: { en: 'She gave a brilliant performance.', vi: 'Cô ấy đã có một màn trình diễn xuất sắc.' } },
  { id: 344, word: 'camera', ipa: '/ˈkæmərə/', meaning: 'máy ảnh', level: Level.A1, example: { en: 'He took a photo with his new camera.', vi: 'Anh ấy đã chụp một bức ảnh bằng máy ảnh mới của mình.' } },
  { id: 345, word: 'cheap', ipa: '/tʃiːp/', meaning: 'rẻ', level: Level.A2, example: { en: 'This is a cheap restaurant.', vi: 'Đây là một nhà hàng rẻ tiền.' } },
  { id: 346, word: 'cinema', ipa: '/ˈsɪnəmə/', meaning: 'rạp chiếu phim', level: Level.A1, example: { en: 'Let\'s go to the cinema tonight.', vi: 'Chúng ta hãy đi xem phim tối nay.' } },
  { id: 347, word: 'clothes', ipa: '/kləʊðz/', meaning: 'quần áo', level: Level.A1, example: { en: 'She is wearing new clothes.', vi: 'Cô ấy đang mặc quần áo mới.' } },
  { id: 348, word: 'conversation', ipa: '/ˌkɒnvəˈseɪʃn/', meaning: 'cuộc trò chuyện', level: Level.A2, example: { en: 'We had a long conversation.', vi: 'Chúng tôi đã có một cuộc trò chuyện dài.' } },
  { id: 349, word: 'correct', ipa: '/kəˈrekt/', meaning: 'đúng', level: Level.A2, example: { en: 'That is the correct answer.', vi: 'Đó là câu trả lời đúng.' } },
  { id: 350, word: 'delicious', ipa: '/dɪˈlɪʃəs/', meaning: 'ngon', level: Level.A2, example: { en: 'The food was delicious.', vi: 'Thức ăn rất ngon.' } },
  { id: 351, word: 'blame', ipa: '/bleɪm/', meaning: 'đổ lỗi', level: Level.B1, example: { en: 'Don\'t blame me for your mistakes.', vi: 'Đừng đổ lỗi cho tôi vì những sai lầm của bạn.' } },
  { id: 352, word: 'borrow', ipa: '/ˈbɒrəʊ/', meaning: 'vay, mượn', level: Level.B1, example: { en: 'Can I borrow your pen?', vi: 'Tôi có thể mượn bút của bạn được không?' } },
  { id: 353, word: 'calm', ipa: '/kɑːm/', meaning: 'bình tĩnh', level: Level.B1, example: { en: 'You need to stay calm.', vi: 'Bạn cần phải giữ bình tĩnh.' } },
  { id: 354, word: 'cause', ipa: '/kɔːz/', meaning: 'nguyên nhân', level: Level.B1, example: { en: 'What was the cause of the accident?', vi: 'Nguyên nhân của vụ tai nạn là gì?' } },
  { id: 355, word: 'celebrate', ipa: '/ˈselɪbreɪt/', meaning: 'kỷ niệm', level: Level.B1, example: { en: 'We are going to celebrate her birthday.', vi: 'Chúng tôi sẽ tổ chức sinh nhật cho cô ấy.' } },
  { id: 356, word: 'certain', ipa: '/ˈsɜːtn/', meaning: 'chắc chắn', level: Level.B1, example: { en: 'Are you certain about that?', vi: 'Bạn có chắc chắn về điều đó không?' } },
  { id: 357, word: 'charge', ipa: '/tʃɑːdʒ/', meaning: 'phí', level: Level.B1, example: { en: 'There is a charge for admission.', vi: 'Có một khoản phí vào cửa.' } },
  { id: 358, word: 'charity', ipa: '/ˈtʃærəti/', meaning: 'từ thiện', level: Level.B1, example: { en: 'She works for a charity.', vi: 'Cô ấy làm việc cho một tổ chức từ thiện.' } },
  { id: 359, word: 'choice', ipa: '/tʃɔɪs/', meaning: 'sự lựa chọn', level: Level.B1, example: { en: 'You have a choice.', vi: 'Bạn có một sự lựa chọn.' } },
  { id: 360, word: 'circle', ipa: '/ˈsɜːkl/', meaning: 'vòng tròn', level: Level.A2, example: { en: 'They sat in a circle.', vi: 'Họ ngồi thành một vòng tròn.' } },
  { id: 361, word: 'claim', ipa: '/kleɪm/', meaning: 'yêu cầu, tuyên bố', level: Level.B2, example: { en: 'He claimed that he was innocent.', vi: 'Anh ta tuyên bố rằng mình vô tội.' } },
  { id: 362, word: 'behave', ipa: '/bɪˈheɪv/', meaning: 'cư xử', level: Level.B1, example: { en: 'He behaved very badly.', vi: 'Anh ấy đã cư xử rất tệ.' } },
  { id: 363, word: 'bill', ipa: '/bɪl/', meaning: 'hóa đơn', level: Level.A2, example: { en: 'Can I have the bill, please?', vi: 'Cho tôi xin hóa đơn được không?' } },
  { id: 364, word: 'birthday', ipa: '/ˈbɜːθdeɪ/', meaning: 'sinh nhật', level: Level.A1, example: { en: 'Happy birthday!', vi: 'Chúc mừng sinh nhật!' } },
  { id: 365, word: 'armed', ipa: '/ɑːmd/', meaning: 'vũ trang', level: Level.B2, example: { en: 'The police were armed.', vi: 'Cảnh sát đã được vũ trang.' } },
  { id: 366, word: 'aspect', ipa: '/ˈæspekt/', meaning: 'khía cạnh', level: Level.B2, example: { en: 'We need to consider every aspect of the problem.', vi: 'Chúng ta cần xem xét mọi khía cạnh của vấn đề.' } },
  { id: 367, word: 'assert', ipa: '/əˈsɜːt/', meaning: 'khẳng định', level: Level.C1, example: { en: 'He asserted his innocence.', vi: 'Anh ấy đã khẳng định mình vô tội.' } },
  { id: 368, word: 'assist', ipa: '/əˈsɪst/', meaning: 'giúp đỡ', level: Level.B2, example: { en: 'She assisted him with his work.', vi: 'Cô ấy đã giúp đỡ anh ấy trong công việc của anh ấy.' } },
  { id: 369, word: 'assumption', ipa: '/əˈsʌmpʃn/', meaning: 'giả định', level: Level.B2, example: { en: 'Your assumption is wrong.', vi: 'Giả định của bạn là sai.' } },
  { id: 370, word: 'attach', ipa: '/əˈtætʃ/', meaning: 'đính kèm', level: Level.B1, example: { en: 'I have attached a copy of the report.', vi: 'Tôi đã đính kèm một bản sao của báo cáo.' } },
  { id: 371, word: 'aware', ipa: '/əˈweə(r)/', meaning: 'nhận thức', level: Level.B2, example: { en: 'Are you aware of the problem?', vi: 'Bạn có nhận thức được vấn đề không?' } },
  { id: 372, word: 'ban', ipa: '/bæn/', meaning: 'cấm', level: Level.B2, example: { en: 'There is a ban on smoking in public places.', vi: 'Có lệnh cấm hút thuốc ở những nơi công cộng.' } },
  { id: 373, word: 'heavy', ipa: '/ˈhevi/', meaning: 'nặng', level: Level.A2, example: { en: 'This box is too heavy to lift.', vi: 'Cái hộp này quá nặng để nâng lên.' } },
  { id: 374, word: 'hobby', ipa: '/ˈhɒbi/', meaning: 'sở thích', level: Level.A2, example: { en: 'My hobby is collecting stamps.', vi: 'Sở thích của tôi là sưu tầm tem.' } },
  { id: 375, word: 'holiday', ipa: '/ˈhɒlədeɪ/', meaning: 'kỳ nghỉ', level: Level.A2, example: { en: 'We are going on holiday to Spain.', vi: 'Chúng tôi sẽ đi nghỉ ở Tây Ban Nha.' } },
  { id: 376, word: 'hospital', ipa: '/ˈhɒspɪtl/', meaning: 'bệnh viện', level: Level.A2, example: { en: 'He was taken to the hospital after the accident.', vi: 'Anh ấy được đưa đến bệnh viện sau vụ tai nạn.' } },
  { id: 377, word: 'hotel', ipa: '/həʊˈtel/', meaning: 'khách sạn', level: Level.A2, example: { en: 'They booked a room at a five-star hotel.', vi: 'Họ đã đặt một phòng tại một khách sạn năm sao.' } },
  { id: 378, word: 'hour', ipa: '/ˈaʊə(r)/', meaning: 'giờ', level: Level.A2, example: { en: 'The meeting will last for one hour.', vi: 'Cuộc họp sẽ kéo dài trong một giờ.' } },
  { id: 379, word: 'idea', ipa: '/aɪˈdɪə/', meaning: 'ý tưởng', level: Level.A2, example: { en: 'She came up with a brilliant idea for the project.', vi: 'Cô ấy đã nảy ra một ý tưởng tuyệt vời cho dự án.' } },
  { id: 380, word: 'inside', ipa: '/ɪnˈsaɪd/', meaning: 'bên trong', level: Level.A2, example: { en: 'Please wait inside the building.', vi: 'Vui lòng đợi bên trong tòa nhà.' } },
  { id: 381, word: 'interesting', ipa: '/ˈɪntrəstɪŋ/', meaning: 'thú vị', level: Level.A2, example: { en: 'I read an interesting book last week.', vi: 'Tuần trước tôi đã đọc một cuốn sách thú vị.' } },
  { id: 382, word: 'invite', ipa: '/ɪnˈvaɪt/', meaning: 'mời', level: Level.A2, example: { en: 'Did you invite him to the party?', vi: 'Bạn đã mời anh ấy đến bữa tiệc chưa?' } },
  { id: 383, word: 'island', ipa: '/ˈaɪlənd/', meaning: 'hòn đảo', level: Level.A2, example: { en: 'They spent their vacation on a tropical island.', vi: 'Họ đã trải qua kỳ nghỉ của mình trên một hòn đảo nhiệt đới.' } },
  { id: 384, word: 'kitchen', ipa: '/ˈkɪtʃɪn/', meaning: 'nhà bếp', level: Level.A2, example: { en: 'My mother is cooking in the kitchen.', vi: 'Mẹ tôi đang nấu ăn trong bếp.' } },
  { id: 385, word: 'late', ipa: '/leɪt/', meaning: 'muộn', level: Level.A2, example: { en: 'He was late for the meeting.', vi: 'Anh ấy đã đến muộn cuộc họp.' } },
  { id: 386, word: 'left', ipa: '/left/', meaning: 'bên trái', level: Level.A2, example: { en: 'Turn left at the next corner.', vi: 'Rẽ trái ở góc tiếp theo.' } },
  { id: 387, word: 'library', ipa: '/ˈlaɪbrəri/', meaning: 'thư viện', level: Level.A2, example: { en: 'I need to return these books to the library.', vi: 'Tôi cần trả lại những cuốn sách này cho thư viện.' } },
  { id: 388, word: 'listen', ipa: '/ˈlɪsn/', meaning: 'nghe', level: Level.A2, example: { en: 'Please listen carefully to the instructions.', vi: 'Vui lòng lắng nghe kỹ hướng dẫn.' } },
  { id: 389, word: 'lose', ipa: '/luːz/', meaning: 'mất', level: Level.A2, example: { en: 'Be careful not to lose your keys.', vi: 'Hãy cẩn thận đừng làm mất chìa khóa.' } },
  { id: 390, word: 'lucky', ipa: '/ˈlʌki/', meaning: 'may mắn', level: Level.A2, example: { en: 'You are very lucky to have such good friends.', vi: 'Bạn thật may mắn khi có những người bạn tốt như vậy.' } },
  { id: 391, word: 'meal', ipa: '/miːl/', meaning: 'bữa ăn', level: Level.A2, example: { en: 'We had a delicious meal at the restaurant.', vi: 'Chúng tôi đã có một bữa ăn ngon tại nhà hàng.' } },
  { id: 392, word: 'meet', ipa: '/miːt/', meaning: 'gặp gỡ', level: Level.A2, example: { en: 'Nice to meet you.', vi: 'Rất vui được gặp bạn.' } },
  { id: 393, word: 'message', ipa: '/ˈmesɪdʒ/', meaning: 'tin nhắn', level: Level.A2, example: { en: 'I sent him a text message.', vi: 'Tôi đã gửi cho anh ấy một tin nhắn văn bản.' } },
  { id: 394, word: 'minute', ipa: '/ˈmɪnɪt/', meaning: 'phút', level: Level.A2, example: { en: 'I will be ready in a few minutes.', vi: 'Tôi sẽ sẵn sàng trong vài phút nữa.' } },
  { id: 395, word: 'modern', ipa: '/ˈmɒdn/', meaning: 'hiện đại', level: Level.A2, example: { en: 'The city has a lot of modern buildings.', vi: 'Thành phố có rất nhiều tòa nhà hiện đại.' } },
  { id: 396, word: 'moment', ipa: '/ˈməʊmənt/', meaning: 'khoảnh khắc', level: Level.A2, example: { en: 'Could you wait for a moment, please?', vi: 'Bạn có thể đợi một lát được không?' } },
  { id: 397, word: 'mountain', ipa: '/ˈmaʊntən/', meaning: 'núi', level: Level.A2, example: { en: 'They went hiking in the mountains.', vi: 'Họ đã đi bộ đường dài trên núi.' } },
  { id: 398, word: 'museum', ipa: '/mjuˈziːəm/', meaning: 'bảo tàng', level: Level.A2, example: { en: 'The museum is full of interesting exhibits.', vi: 'Bảo tàng có rất nhiều hiện vật thú vị.' } },
  { id: 399, word: 'newspaper', ipa: '/ˈnjuːzpeɪpə(r)/', meaning: 'báo', level: Level.A2, example: { en: 'I read the newspaper every morning.', vi: 'Tôi đọc báo mỗi buổi sáng.' } },
  { id: 400, word: 'north', ipa: '/nɔːθ/', meaning: 'phía bắc', level: Level.A2, example: { en: 'The wind is coming from the north.', vi: 'Gió đang thổi từ phía bắc.' } },
  { id: 401, word: 'office', ipa: '/ˈɒfɪs/', meaning: 'văn phòng', level: Level.A2, example: { en: 'She works in a big office.', vi: 'Cô ấy làm việc trong một văn phòng lớn.' } },
  { id: 402, word: 'often', ipa: '/ˈɒfn/', meaning: 'thường xuyên', level: Level.A2, example: { en: 'I often go to the cinema.', vi: 'Tôi thường xuyên đi xem phim.' } },
  { id: 403, word: 'online', ipa: '/ˌɒnˈlaɪn/', meaning: 'trực tuyến', level: Level.A2, example: { en: 'I do most of my shopping online.', vi: 'Tôi mua sắm hầu hết trực tuyến.' } },
  { id: 404, word: 'opposite', ipa: '/ˈɒpəzɪt/', meaning: 'đối diện', level: Level.A2, example: { en: 'The bank is opposite the supermarket.', vi: 'Ngân hàng ở đối diện siêu thị.' } },
  { id: 405, word: 'outside', ipa: '/ˌaʊtˈsaɪd/', meaning: 'bên ngoài', level: Level.A2, example: { en: 'The children are playing outside.', vi: 'Bọn trẻ đang chơi ở bên ngoài.' } },
  { id: 406, word: 'parent', ipa: '/ˈpeərənt/', meaning: 'cha mẹ', level: Level.A2, example: { en: 'I live with my parents.', vi: 'Tôi sống với cha mẹ của tôi.' } },
  { id: 407, word: 'party', ipa: '/ˈpɑːti/', meaning: 'bữa tiệc', level: Level.A2, example: { en: 'Are you coming to the party tonight?', vi: 'Bạn có đến bữa tiệc tối nay không?' } },
  { id: 408, word: 'perfect', ipa: '/ˈpɜːfɪkt/', meaning: 'hoàn hảo', level: Level.A2, example: { en: 'Your English is perfect.', vi: 'Tiếng Anh của bạn thật hoàn hảo.' } },
  { id: 409, word: 'photograph', ipa: '/ˈfəʊtəɡrɑːf/', meaning: 'ảnh', level: Level.A2, example: { en: 'He took a photograph of the sunset.', vi: 'Anh ấy đã chụp một bức ảnh hoàng hôn.' } },
  { id: 410, word: 'piece', ipa: '/piːs/', meaning: 'mảnh', level: Level.A2, example: { en: 'Would you like a piece of cake?', vi: 'Bạn có muốn một miếng bánh không?' } },
  { id: 411, word: 'absence', ipa: '/ˈæbsəns/', meaning: 'sự vắng mặt', level: Level.B1, example: { en: 'His absence was noticed by everyone.', vi: 'Sự vắng mặt của anh ấy đã được mọi người chú ý.' } },
  { id: 412, word: 'access', ipa: '/ˈækses/', meaning: 'truy cập', level: Level.B1, example: { en: 'You need a password to access the system.', vi: 'Bạn cần mật khẩu để truy cập hệ thống.' } },
  { id: 413, word: 'accommodation', ipa: '/əˌkɒməˈdeɪʃn/', meaning: 'chỗ ở', level: Level.B1, example: { en: 'The price includes flights and accommodation.', vi: 'Giá đã bao gồm vé máy bay và chỗ ở.' } },
  { id: 414, word: 'according to', ipa: '/əˈkɔːdɪŋ tuː/', meaning: 'theo như', level: Level.B1, example: { en: 'According to the weather forecast, it will rain tomorrow.', vi: 'Theo dự báo thời tiết, ngày mai trời sẽ mưa.' } },
  { id: 415, word: 'accountant', ipa: '/əˈkaʊntənt/', meaning: 'kế toán', level: Level.B1, example: { en: 'My sister is an accountant.', vi: 'Chị tôi là một kế toán viên.' } },
  { id: 416, word: 'actually', ipa: '/ˈæktʃuəli/', meaning: 'thực ra', level: Level.B1, example: { en: 'Actually, I think you\'re wrong.', vi: 'Thực ra, tôi nghĩ bạn đã sai.' } },
  { id: 417, word: 'ad', ipa: '/æd/', meaning: 'quảng cáo', level: Level.B1, example: { en: 'I saw an ad for a new car on TV.', vi: 'Tôi đã xem một quảng cáo xe hơi mới trên TV.' } },
  { id: 418, word: 'addition', ipa: '/əˈdɪʃn/', meaning: 'sự thêm vào', level: Level.B1, example: { en: 'In addition to his salary, he also receives a bonus.', vi: 'Ngoài lương, anh ấy còn nhận được tiền thưởng.' } },
  { id: 419, word: 'admit', ipa: '/ədˈmɪt/', meaning: 'thừa nhận', level: Level.B1, example: { en: 'He admitted that he had made a mistake.', vi: 'Anh ấy đã thừa nhận rằng mình đã mắc sai lầm.' } },
  { id: 420, word: 'adult', ipa: '/ˈædʌlt/', meaning: 'người lớn', level: Level.B1, example: { en: 'This movie is for adults only.', vi: 'Bộ phim này chỉ dành cho người lớn.' } },
  { id: 421, word: 'adventure', ipa: '/ədˈventʃə(r)/', meaning: 'cuộc phiêu lưu', level: Level.B1, example: { en: 'He wrote a book about his adventures in Africa.', vi: 'Ông đã viết một cuốn sách về những cuộc phiêu lưu của mình ở châu Phi.' } },
  { id: 422, word: 'advertise', ipa: '/ˈædvətaɪz/', meaning: 'quảng cáo', level: Level.B1, example: { en: 'The company is advertising its new product.', vi: 'Công ty đang quảng cáo sản phẩm mới của mình.' } },
  { id: 423, word: 'agent', ipa: '/ˈeɪdʒənt/', meaning: 'đại lý', level: Level.B1, example: { en: 'I spoke to an agent about my flight.', vi: 'Tôi đã nói chuyện với một đại lý về chuyến bay của mình.' } },
  { id: 424, word: 'ahead', ipa: '/əˈhed/', meaning: 'phía trước', level: Level.B1, example: { en: 'He was walking ahead of us.', vi: 'Anh ấy đang đi trước chúng tôi.' } },
  { id: 425, word: 'airline', ipa: '/ˈeəlaɪn/', meaning: 'hãng hàng không', level: Level.B1, example: { en: 'Which airline did you fly with?', vi: 'Bạn đã bay với hãng hàng không nào?' } },
  { id: 426, word: 'alarm', ipa: '/əˈlɑːm/', meaning: 'báo thức', level: Level.B1, example: { en: 'I set the alarm for 6 AM.', vi: 'Tôi đã đặt báo thức lúc 6 giờ sáng.' } },
  { id: 427, word: 'album', ipa: '/ˈælbəm/', meaning: 'album', level: Level.B1, example: { en: 'She has a new album coming out soon.', vi: 'Cô ấy sắp cho ra mắt một album mới.' } },
  { id: 428, word: 'allow', ipa: '/əˈlaʊ/', meaning: 'cho phép', level: Level.B1, example: { en: 'Smoking is not allowed here.', vi: 'Hút thuốc không được phép ở đây.' } },
  { id: 429, word: 'almost', ipa: '/ˈɔːlməʊst/', meaning: 'hầu như', level: Level.B1, example: { en: 'I have almost finished my work.', vi: 'Tôi đã gần như hoàn thành công việc của mình.' } },
  { id: 430, word: 'alone', ipa: '/əˈləʊn/', meaning: 'một mình', level: Level.B1, example: { en: 'She lives alone.', vi: 'Cô ấy sống một mình.' } },
  { id: 431, word: 'although', ipa: '/ɔːlˈðəʊ/', meaning: 'mặc dù', level: Level.B1, example: { en: 'Although it was raining, we went for a walk.', vi: 'Mặc dù trời mưa, chúng tôi vẫn đi dạo.' } },
  { id: 432, word: 'among', ipa: '/əˈmʌŋ/', meaning: 'giữa', level: Level.B1, example: { en: 'He was standing among his friends.', vi: 'Anh ấy đang đứng giữa những người bạn của mình.' } },
  { id: 433, word: 'amount', ipa: '/əˈmaʊnt/', meaning: 'số lượng', level: Level.B1, example: { en: 'We have a large amount of work to do.', vi: 'Chúng tôi có một lượng lớn công việc phải làm.' } },
  { id: 434, word: 'ancient', ipa: '/ˈeɪnʃənt/', meaning: 'cổ xưa', level: Level.B1, example: { en: 'This is an ancient building.', vi: 'Đây là một tòa nhà cổ.' } },
  { id: 435, word: 'anniversary', ipa: '/ˌænɪˈvɜːsəri/', meaning: 'ngày kỷ niệm', level: Level.B1, example: { en: 'It is our wedding anniversary today.', vi: 'Hôm nay là ngày kỷ niệm ngày cưới của chúng tôi.' } },
  { id: 436, word: 'apart', ipa: '/əˈpɑːt/', meaning: 'cách xa', level: Level.B1, example: { en: 'They live far apart.', vi: 'Họ sống cách xa nhau.' } },
  { id: 437, word: 'apologize', ipa: '/əˈpɒlədʒaɪz/', meaning: 'xin lỗi', level: Level.B1, example: { en: 'You should apologize to her.', vi: 'Bạn nên xin lỗi cô ấy.' } },
  { id: 438, word: 'application', ipa: '/ˌæplɪˈkeɪʃn/', meaning: 'đơn xin', level: Level.B1, example: { en: 'I have sent my application for the job.', vi: 'Tôi đã gửi đơn xin việc của mình.' } },
  { id: 439, word: 'argue', ipa: '/ˈɑːɡjuː/', meaning: 'tranh cãi', level: Level.B1, example: { en: 'They are always arguing.', vi: 'Họ luôn tranh cãi.' } },
  { id: 440, word: 'argument', ipa: '/ˈɑːɡjumənt/', meaning: 'cuộc tranh cãi', level: Level.B1, example: { en: 'We had an argument about money.', vi: 'Chúng tôi đã có một cuộc tranh cãi về tiền bạc.' } },
  { id: 441, word: 'army', ipa: '/ˈɑːmi/', meaning: 'quân đội', level: Level.B1, example: { en: 'He joined the army.', vi: 'Anh ấy đã gia nhập quân đội.' } },
  { id: 442, word: 'arrest', ipa: '/əˈrest/', meaning: 'bắt giữ', level: Level.B1, example: { en: 'The police arrested him for theft.', vi: 'Cảnh sát đã bắt giữ anh ta vì tội trộm cắp.' } },
  { id: 443, word: 'arrival', ipa: '/əˈraɪvl/', meaning: 'sự đến', level: Level.B1, example: { en: 'We waited for his arrival.', vi: 'Chúng tôi đã chờ đợi sự xuất hiện của anh ấy.' } },
  { id: 444, word: 'athlete', ipa: '/ˈæθliːt/', meaning: 'vận động viên', level: Level.B1, example: { en: 'He is a professional athlete.', vi: 'Anh ấy là một vận động viên chuyên nghiệp.' } },
  { id: 445, word: 'attempt', ipa: '/əˈtempt/', meaning: 'nỗ lực', level: Level.B1, example: { en: 'He made an attempt to escape.', vi: 'Anh ta đã cố gắng trốn thoát.' } },
  { id: 446, word: 'attract', ipa: '/əˈtrækt/', meaning: 'thu hút', level: Level.B1, example: { en: 'The city attracts a lot of tourists.', vi: 'Thành phố thu hút rất nhiều khách du lịch.' } },
  { id: 447, word: 'author', ipa: '/ˈɔːθə(r)/', meaning: 'tác giả', level: Level.B1, example: { en: 'He is my favorite author.', vi: 'Ông là tác giả yêu thích của tôi.' } },
  { id: 448, word: 'average', ipa: '/ˈævərɪdʒ/', meaning: 'trung bình', level: Level.B1, example: { en: 'The average age of the students is 20.', vi: 'Tuổi trung bình của sinh viên là 20.' } },
  { id: 449, word: 'award', ipa: '/əˈwɔːd/', meaning: 'giải thưởng', level: Level.B1, example: { en: 'She won an award for her acting.', vi: 'Cô đã giành được một giải thưởng cho diễn xuất của mình.' } },
  { id: 450, word: 'awful', ipa: '/ˈɔːfl/', meaning: 'kinh khủng', level: Level.B1, example: { en: 'The weather was awful.', vi: 'Thời tiết thật kinh khủng.' } },
  { id: 451, word: 'band', ipa: '/bænd/', meaning: 'ban nhạc', level: Level.A2, example: { en: 'My favorite band is playing tonight.', vi: 'Ban nhạc yêu thích của tôi sẽ biểu diễn tối nay.' } },
  { id: 452, word: 'bargain', ipa: '/ˈbɑːɡən/', meaning: 'món hời', level: Level.B1, example: { en: 'This dress was a real bargain.', vi: 'Chiếc váy này là một món hời thực sự.' } },
  { id: 453, word: 'abandon', ipa: '/əˈbændən/', meaning: 'bỏ rơi', level: Level.B2, example: { en: 'The child had been abandoned by his parents.', vi: 'Đứa trẻ đã bị cha mẹ bỏ rơi.' } },
  { id: 454, word: 'account for', ipa: '/əˈkaʊnt fɔː(r)/', meaning: 'chiếm, giải thích cho', level: Level.B2, example: { en: 'Students account for the vast majority of our customers.', vi: 'Sinh viên chiếm phần lớn khách hàng của chúng tôi.' } },
  { id: 455, word: 'about', ipa: '/əˈbaʊt/', meaning: 'về, khoảng', level: Level.A1, example: { en: 'What is the book about?', vi: 'Cuốn sách này nói về cái gì?' } },
  { id: 456, word: 'above', ipa: '/əˈbʌv/', meaning: 'ở trên', level: Level.A1, example: { en: 'The plane flew above the clouds.', vi: 'Máy bay bay trên những đám mây.' } },
  { id: 457, word: 'across', ipa: '/əˈkrɒs/', meaning: 'ngang qua', level: Level.A1, example: { en: 'He walked across the street.', vi: 'Anh ấy đi bộ ngang qua đường.' } },
  { id: 458, word: 'action', ipa: '/ˈækʃn/', meaning: 'hành động', level: Level.A2, example: { en: 'We must take action to solve the problem.', vi: 'Chúng ta phải hành động để giải quyết vấn đề.' } },
  { id: 459, word: 'activity', ipa: '/ækˈtɪvəti/', meaning: 'hoạt động', level: Level.A2, example: { en: 'There are many activities for children.', vi: 'Có rất nhiều hoạt động cho trẻ em.' } },
  { id: 460, word: 'actor', ipa: '/ˈæktə(r)/', meaning: 'diễn viên nam', level: Level.A1, example: { en: 'He is a famous actor.', vi: 'Anh ấy là một diễn viên nổi tiếng.' } },
  { id: 461, word: 'add', ipa: '/æd/', meaning: 'thêm vào', level: Level.A1, example: { en: 'Add some sugar to your tea.', vi: 'Thêm một chút đường vào trà của bạn.' } },
  { id: 462, word: 'afraid', ipa: '/əˈfreɪd/', meaning: 'sợ hãi', level: Level.A1, example: { en: 'She is afraid of spiders.', vi: 'Cô ấy sợ nhện.' } },
  { id: 463, word: 'after', ipa: '/ˈɑːftə(r)/', meaning: 'sau khi', level: Level.A1, example: { en: 'Let\'s go for a walk after dinner.', vi: 'Hãy đi dạo sau bữa tối.' } },
  { id: 464, word: 'afternoon', ipa: '/ˌɑːftəˈnuːn/', meaning: 'buổi chiều', level: Level.A1, example: { en: 'I will see you this afternoon.', vi: 'Tôi sẽ gặp bạn vào chiều nay.' } },
  { id: 465, word: 'again', ipa: '/əˈɡen/', meaning: 'lại, lần nữa', level: Level.A1, example: { en: 'Can you say that again, please?', vi: 'Bạn có thể nói lại điều đó được không?' } },
  { id: 466, word: 'age', ipa: '/eɪdʒ/', meaning: 'tuổi', level: Level.A1, example: { en: 'What is your age?', vi: 'Bạn bao nhiêu tuổi?' } },
  { id: 467, word: 'ago', ipa: '/əˈɡəʊ/', meaning: 'cách đây', level: Level.A1, example: { en: 'I met him two years ago.', vi: 'Tôi đã gặp anh ấy hai năm trước.' } },
  { id: 468, word: 'agree', ipa: '/əˈɡriː/', meaning: 'đồng ý', level: Level.A2, example: { en: 'I agree with you.', vi: 'Tôi đồng ý với bạn.' } },
  { id: 469, word: 'air', ipa: '/eə(r)/', meaning: 'không khí', level: Level.A1, example: { en: 'The air is very fresh here.', vi: 'Không khí ở đây rất trong lành.' } },
  { id: 470, word: 'airport', ipa: '/ˈeəpɔːt/', meaning: 'sân bay', level: Level.A2, example: { en: 'I need to go to the airport.', vi: 'Tôi cần đến sân bay.' } },
  { id: 471, word: 'all', ipa: '/ɔːl/', meaning: 'tất cả', level: Level.A1, example: { en: 'All the students passed the exam.', vi: 'Tất cả học sinh đều đã qua kỳ thi.' } },
  { id: 472, word: 'also', ipa: '/ˈɔːlsəʊ/', meaning: 'cũng', level: Level.A1, example: { en: 'She is a doctor and also a writer.', vi: 'Cô ấy là một bác sĩ và cũng là một nhà văn.' } },
  { id: 473, word: 'always', ipa: '/ˈɔːlweɪz/', meaning: 'luôn luôn', level: Level.A1, example: { en: 'He is always late.', vi: 'Anh ấy luôn luôn đến muộn.' } },
  { id: 474, word: 'and', ipa: '/ənd/', meaning: 'và', level: Level.A1, example: { en: 'I like tea and coffee.', vi: 'Tôi thích trà và cà phê.' } },
  { id: 475, word: 'angry', ipa: '/ˈæŋɡri/', meaning: 'tức giận', level: Level.A1, example: { en: 'He was angry with me.', vi: 'Anh ấy đã tức giận với tôi.' } },
  { id: 476, word: 'animal', ipa: '/ˈænɪml/', meaning: 'động vật', level: Level.A1, example: { en: 'What is your favorite animal?', vi: 'Động vật yêu thích của bạn là gì?' } },
  { id: 477, word: 'another', ipa: '/əˈnʌðə(r)/', meaning: 'khác', level: Level.A1, example: { en: 'Can I have another cup of coffee?', vi: 'Tôi có thể uống một tách cà phê khác không?' } },
  { id: 478, word: 'answer', ipa: '/ˈɑːnsə(r)/', meaning: 'câu trả lời', level: Level.A1, example: { en: 'Do you know the answer?', vi: 'Bạn có biết câu trả lời không?' } },
  { id: 479, word: 'any', ipa: '/ˈeni/', meaning: 'bất kỳ', level: Level.A1, example: { en: 'Do you have any questions?', vi: 'Bạn có câu hỏi nào không?' } },
  { id: 480, word: 'anyone', ipa: '/ˈeniwʌn/', meaning: 'bất kỳ ai', level: Level.A1, example: { en: 'Is there anyone at home?', vi: 'Có ai ở nhà không?' } },
  { id: 481, word: 'anything', ipa: '/ˈeniθɪŋ/', meaning: 'bất cứ điều gì', level: Level.A1, example: { en: 'Do you want anything to drink?', vi: 'Bạn có muốn uống gì không?' } },
  { id: 482, word: 'apple', ipa: '/ˈæpl/', meaning: 'quả táo', level: Level.A1, example: { en: 'An apple a day keeps the doctor away.', vi: 'Mỗi ngày một quả táo giúp tránh xa bác sĩ.' } },
  { id: 483, word: 'area', ipa: '/ˈeəriə/', meaning: 'khu vực', level: Level.A2, example: { en: 'This is a residential area.', vi: 'Đây là một khu dân cư.' } },
  { id: 484, word: 'arm', ipa: '/ɑːm/', meaning: 'cánh tay', level: Level.A1, example: { en: 'He broke his arm.', vi: 'Anh ấy đã bị gãy tay.' } },
  { id: 485, word: 'around', ipa: '/əˈraʊnd/', meaning: 'xung quanh', level: Level.A1, example: { en: 'The children were running around.', vi: 'Bọn trẻ đang chạy xung quanh.' } },
  { id: 486, word: 'ask', ipa: '/ɑːsk/', meaning: 'hỏi', level: Level.A1, example: { en: 'Can I ask you a question?', vi: 'Tôi có thể hỏi bạn một câu hỏi được không?' } },
  { id: 487, word: 'at', ipa: '/æt/', meaning: 'tại', level: Level.A1, example: { en: 'I am at the office.', vi: 'Tôi đang ở văn phòng.' } },
  { id: 488, word: 'aunt', ipa: '/ɑːnt/', meaning: 'cô, dì', level: Level.A1, example: { en: 'My aunt is coming to visit.', vi: 'Dì của tôi sắp đến thăm.' } },
  { id: 489, word: 'away', ipa: '/əˈweɪ/', meaning: 'xa', level: Level.A1, example: { en: 'He is away on holiday.', vi: 'Anh ấy đi nghỉ xa.' } },
  { id: 490, word: 'baby', ipa: '/ˈbeɪbi/', meaning: 'em bé', level: Level.A1, example: { en: 'The baby is sleeping.', vi: 'Em bé đang ngủ.' } },
  { id: 491, word: 'back', ipa: '/bæk/', meaning: 'lưng, phía sau', level: Level.A1, example: { en: 'I will be back in a minute.', vi: 'Tôi sẽ quay lại trong một phút nữa.' } },
  { id: 492, word: 'bag', ipa: '/bæɡ/', meaning: 'túi', level: Level.A1, example: { en: 'My bag is heavy.', vi: 'Túi của tôi nặng.' } },
  { id: 493, word: 'ball', ipa: '/bɔːl/', meaning: 'quả bóng', level: Level.A1, example: { en: 'The boy is playing with a ball.', vi: 'Cậu bé đang chơi với một quả bóng.' } },
  { id: 494, word: 'banana', ipa: '/bəˈnɑːnə/', meaning: 'quả chuối', level: Level.A1, example: { en: 'Monkeys like bananas.', vi: 'Khỉ thích chuối.' } },
  { id: 495, word: 'bank', ipa: '/bæŋk/', meaning: 'ngân hàng', level: Level.A2, example: { en: 'I need to go to the bank.', vi: 'Tôi cần đến ngân hàng.' } },
  { id: 496, word: 'bath', ipa: '/bɑːθ/', meaning: 'bồn tắm', level: Level.A1, example: { en: 'I am going to have a bath.', vi: 'Tôi sẽ đi tắm.' } },
  { id: 497, word: 'bathroom', ipa: '/ˈbɑːθruːm/', meaning: 'phòng tắm', level: Level.A1, example: { en: 'Where is the bathroom?', vi: 'Phòng tắm ở đâu?' } },
  { id: 498, word: 'be', ipa: '/biː/', meaning: 'thì, là, ở', level: Level.A1, example: { en: 'I want to be a doctor.', vi: 'Tôi muốn trở thành một bác sĩ.' } },
  { id: 499, word: 'beach', ipa: '/biːtʃ/', meaning: 'bãi biển', level: Level.A2, example: { en: 'Let\'s go to the beach.', vi: 'Chúng ta hãy ra biển.' } },
  { id: 500, word: 'beautiful', ipa: '/ˈbjuːtɪfl/', meaning: 'xinh đẹp', level: Level.A1, example: { en: 'She is a beautiful woman.', vi: 'Cô ấy là một người phụ nữ xinh đẹp.' } },
  { id: 501, word: 'because', ipa: '/bɪˈkɒz/', meaning: 'bởi vì', level: Level.A1, example: { en: 'I am happy because you are here.', vi: 'Tôi hạnh phúc vì bạn ở đây.' } },
  { id: 502, word: 'become', ipa: '/bɪˈkʌm/', meaning: 'trở thành', level: Level.A2, example: { en: 'He wants to become a pilot.', vi: 'Anh ấy muốn trở thành một phi công.' } },
  { id: 503, word: 'bed', ipa: '/bed/', meaning: 'giường', level: Level.A1, example: { en: 'It\'s time to go to bed.', vi: 'Đã đến giờ đi ngủ.' } },
  { id: 504, word: 'bedroom', ipa: '/ˈbedruːm/', meaning: 'phòng ngủ', level: Level.A1, example: { en: 'My bedroom is small.', vi: 'Phòng ngủ của tôi nhỏ.' } },
  { id: 505, word: 'before', ipa: '/bɪˈfɔː(r)/', meaning: 'trước khi', level: Level.A1, example: { en: 'Please wash your hands before eating.', vi: 'Vui lòng rửa tay trước khi ăn.' } },
  { id: 506, word: 'begin', ipa: '/bɪˈɡɪn/', meaning: 'bắt đầu', level: Level.A2, example: { en: 'The class begins at 9 AM.', vi: 'Lớp học bắt đầu lúc 9 giờ sáng.' } },
  { id: 507, word: 'behind', ipa: '/bɪˈhaɪnd/', meaning: 'phía sau', level: Level.A1, example: { en: 'The cat is behind the tree.', vi: 'Con mèo ở sau cái cây.' } },
  { id: 508, word: 'below', ipa: '/bɪˈləʊ/', meaning: 'bên dưới', level: Level.A2, example: { en: 'Please see the notes below.', vi: 'Vui lòng xem các ghi chú bên dưới.' } },
  { id: 509, word: 'best', ipa: '/best/', meaning: 'tốt nhất', level: Level.A1, example: { en: 'He is my best friend.', vi: 'Anh ấy là bạn thân nhất của tôi.' } },
  { id: 510, word: 'better', ipa: '/ˈbetə(r)/', meaning: 'tốt hơn', level: Level.A1, example: { en: 'I feel much better today.', vi: 'Hôm nay tôi cảm thấy tốt hơn nhiều.' } },
  { id: 511, word: 'between', ipa: '/bɪˈtwiːn/', meaning: 'ở giữa', level: Level.A1, example: { en: 'The shop is between the bank and the library.', vi: 'Cửa hàng ở giữa ngân hàng và thư viện.' } },
  { id: 512, word: 'bicycle', ipa: '/ˈbaɪsɪkl/', meaning: 'xe đạp', level: Level.A1, example: { en: 'He rides his bicycle to school.', vi: 'Anh ấy đạp xe đến trường.' } },
  { id: 513, word: 'bird', ipa: '/bɜːd/', meaning: 'con chim', level: Level.A1, example: { en: 'The bird is singing.', vi: 'Con chim đang hót.' } },
  { id: 514, word: 'black', ipa: '/blæk/', meaning: 'màu đen', level: Level.A1, example: { en: 'She has black hair.', vi: 'Cô ấy có mái tóc đen.' } },
  { id: 515, word: 'blog', ipa: '/blɒɡ/', meaning: 'trang blog', level: Level.A2, example: { en: 'She writes a blog about food.', vi: 'Cô ấy viết một blog về ẩm thực.' } },
  { id: 516, word: 'blonde', ipa: '/blɒnd/', meaning: 'tóc vàng', level: Level.A1, example: { en: 'She has blonde hair.', vi: 'Cô ấy có mái tóc vàng.' } },
  { id: 517, word: 'body', ipa: '/ˈbɒdi/', meaning: 'cơ thể', level: Level.A1, example: { en: 'You need to take care of your body.', vi: 'Bạn cần chăm sóc cơ thể của mình.' } },
  { id: 518, word: 'boat', ipa: '/bəʊt/', meaning: 'thuyền', level: Level.A2, example: { en: 'We went for a ride in a boat.', vi: 'Chúng tôi đã đi dạo bằng thuyền.' } },
  { id: 519, word: 'both', ipa: '/bəʊθ/', meaning: 'cả hai', level: Level.A2, example: { en: 'I like both of them.', vi: 'Tôi thích cả hai.' } },
  { id: 520, word: 'bottle', ipa: '/ˈbɒtl/', meaning: 'chai', level: Level.A1, example: { en: 'I have a bottle of water.', vi: 'Tôi có một chai nước.' } },
  { id: 521, word: 'box', ipa: '/bɒks/', meaning: 'hộp', level: Level.A1, example: { en: 'What is in the box?', vi: 'Có gì trong hộp vậy?' } },
  { id: 522, word: 'boy', ipa: '/bɔɪ/', meaning: 'cậu bé', level: Level.A1, example: { en: 'He is a smart boy.', vi: 'Cậu bé ấy thật thông minh.' } },
  { id: 523, word: 'bread', ipa: '/bred/', meaning: 'bánh mì', level: Level.A1, example: { en: 'I like to eat bread for breakfast.', vi: 'Tôi thích ăn bánh mì vào bữa sáng.' } },
  { id: 524, word: 'break', ipa: '/breɪk/', meaning: 'làm vỡ, nghỉ giải lao', level: Level.A2, example: { en: 'Let\'s take a break.', vi: 'Chúng ta hãy nghỉ giải lao.' } },
  { id: 525, word: 'breakfast', ipa: '/ˈbrekfəst/', meaning: 'bữa sáng', level: Level.A1, example: { en: 'What did you have for breakfast?', vi: 'Bạn đã ăn gì cho bữa sáng?' } },
  { id: 526, word: 'bring', ipa: '/brɪŋ/', meaning: 'mang', level: Level.A2, example: { en: 'Please bring me a glass of water.', vi: 'Vui lòng mang cho tôi một ly nước.' } },
  { id: 527, word: 'brother', ipa: '/ˈbrʌðə(r)/', meaning: 'anh em trai', level: Level.A1, example: { en: 'He is my older brother.', vi: 'Anh ấy là anh trai tôi.' } },
  { id: 528, word: 'brown', ipa: '/braʊn/', meaning: 'màu nâu', level: Level.A1, example: { en: 'She has brown eyes.', vi: 'Cô ấy có đôi mắt màu nâu.' } },
  { id: 529, word: 'bus', ipa: '/bʌs/', meaning: 'xe buýt', level: Level.A1, example: { en: 'I go to school by bus.', vi: 'Tôi đi học bằng xe buýt.' } },
  { id: 530, word: 'but', ipa: '/bʌt/', meaning: 'nhưng', level: Level.A1, example: { en: 'I want to go, but I am busy.', vi: 'Tôi muốn đi, nhưng tôi bận.' } },
  { id: 531, word: 'buy', ipa: '/baɪ/', meaning: 'mua', level: Level.A1, example: { en: 'I need to buy some milk.', vi: 'Tôi cần mua một ít sữa.' } },
  { id: 532, word: 'by', ipa: '/baɪ/', meaning: 'bằng', level: Level.A1, example: { en: 'I came here by train.', vi: 'Tôi đến đây bằng tàu hỏa.' } },
  { id: 533, word: 'cafe', ipa: '/ˈkæfeɪ/', meaning: 'quán cà phê', level: Level.A2, example: { en: 'Let\'s meet at the cafe.', vi: 'Chúng ta hãy gặp nhau ở quán cà phê.' } },
  { id: 534, word: 'cake', ipa: '/keɪk/', meaning: 'bánh ngọt', level: Level.A1, example: { en: 'This cake is delicious.', vi: 'Chiếc bánh này ngon.' } },
  { id: 535, word: 'call', ipa: '/kɔːl/', meaning: 'gọi điện', level: Level.A1, example: { en: 'I will call you later.', vi: 'Tôi sẽ gọi cho bạn sau.' } },
  { id: 536, word: 'can', ipa: '/kən/', meaning: 'có thể', level: Level.A1, example: { en: 'I can swim.', vi: 'Tôi có thể bơi.' } },
  { id: 537, word: 'capital', ipa: '/ˈkæpɪtl/', meaning: 'thủ đô', level: Level.A2, example: { en: 'Hanoi is the capital of Vietnam.', vi: 'Hà Nội là thủ đô của Việt Nam.' } },
  { id: 538, word: 'card', ipa: '/kɑːd/', meaning: 'thẻ', level: Level.A2, example: { en: 'I paid by credit card.', vi: 'Tôi đã thanh toán bằng thẻ tín dụng.' } },
  { id: 539, word: 'carry', ipa: '/ˈkæri/', meaning: 'mang', level: Level.A2, example: { en: 'Can you help me carry this bag?', vi: 'Bạn có thể giúp tôi mang chiếc túi này không?' } },
  { id: 540, word: 'change', ipa: '/tʃeɪndʒ/', meaning: 'thay đổi', level: Level.A2, example: { en: 'I need to change my clothes.', vi: 'Tôi cần thay quần áo.' } },
  { id: 541, word: 'chat', ipa: '/tʃæt/', meaning: 'trò chuyện', level: Level.A2, example: { en: 'I had a chat with my friend.', vi: 'Tôi đã trò chuyện với bạn tôi.' } },
  { id: 542, word: 'check', ipa: '/tʃek/', meaning: 'kiểm tra', level: Level.A2, example: { en: 'Please check your email.', vi: 'Vui lòng kiểm tra email của bạn.' } },
  { id: 543, word: 'cheese', ipa: '/tʃiːz/', meaning: 'phô mai', level: Level.A1, example: { en: 'I like to eat cheese.', vi: 'Tôi thích ăn phô mai.' } },
  { id: 544, word: 'chicken', ipa: '/ˈtʃɪkɪn/', meaning: 'gà', level: Level.A1, example: { en: 'We had chicken for dinner.', vi: 'Chúng tôi đã ăn gà cho bữa tối.' } },
  { id: 545, word: 'choose', ipa: '/tʃuːz/', meaning: 'chọn', level: Level.A2, example: { en: 'You have to choose one.', vi: 'Bạn phải chọn một.' } },
  { id: 546, word: 'class', ipa: '/klɑːs/', meaning: 'lớp học', level: Level.A1, example: { en: 'What time is your class?', vi: 'Lớp học của bạn mấy giờ?' } },
  { id: 547, word: 'classroom', ipa: '/ˈklɑːsruːm/', meaning: 'phòng học', level: Level.A1, example: { en: 'The students are in the classroom.', vi: 'Học sinh đang ở trong phòng học.' } },
  { id: 548, word: 'clean', ipa: '/kliːn/', meaning: 'sạch sẽ', level: Level.A1, example: { en: 'The room is very clean.', vi: 'Căn phòng rất sạch sẽ.' } },
  { id: 549, word: 'clock', ipa: '/klɒk/', meaning: 'đồng hồ', level: Level.A1, example: { en: 'The clock is on the wall.', vi: 'Đồng hồ ở trên tường.' } },
  { id: 550, word: 'close', ipa: '/kləʊz/', meaning: 'đóng', level: Level.A1, example: { en: 'Please close the door.', vi: 'Vui lòng đóng cửa.' } },
  { id: 551, word: 'coffee', ipa: '/ˈkɒfi/', meaning: 'cà phê', level: Level.A1, example: { en: 'I drink coffee every morning.', vi: 'Tôi uống cà phê mỗi buổi sáng.' } },
  { id: 552, word: 'cold', ipa: '/kəʊld/', meaning: 'lạnh', level: Level.A1, example: { en: 'It is cold today.', vi: 'Hôm nay trời lạnh.' } },
  { id: 553, word: 'college', ipa: '/ˈkɒlɪdʒ/', meaning: 'trường cao đẳng', level: Level.A2, example: { en: 'He is studying at a college.', vi: 'Anh ấy đang học tại một trường cao đẳng.' } },
  { id: 554, word: 'come', ipa: '/kʌm/', meaning: 'đến', level: Level.A1, example: { en: 'Please come here.', vi: 'Vui lòng đến đây.' } },
  { id: 555, word: 'computer', ipa: '/kəmˈpjuːtə(r)/', meaning: 'máy tính', level: Level.A1, example: { en: 'I use my computer for work and study.', vi: 'Tôi sử dụng máy tính của mình cho công việc và học tập.' } },
  { id: 556, word: 'email', ipa: '/ˈiːmeɪl/', meaning: 'thư điện tử', level: Level.A1, example: { en: 'Please send me an email with the details.', vi: 'Vui lòng gửi cho tôi một email với các chi tiết.' } },
  { id: 557, word: 'internet', ipa: '/ˈɪntənet/', meaning: 'mạng internet', level: Level.A2, example: { en: 'You can find anything on the internet.', vi: 'Bạn có thể tìm thấy bất cứ thứ gì trên internet.' } },
  { id: 558, word: 'website', ipa: '/ˈwebsaɪt/', meaning: 'trang web', level: Level.A2, example: { en: 'The company has a new website.', vi: 'Công ty có một trang web mới.' } },
  { id: 559, word: 'photo', ipa: '/ˈfəʊtəʊ/', meaning: 'bức ảnh', level: Level.A1, example: { en: 'She took a beautiful photo of the sunset.', vi: 'Cô ấy đã chụp một bức ảnh hoàng hôn tuyệt đẹp.' } },
  { id: 560, word: 'video', ipa: '/ˈvɪdiəʊ/', meaning: 'video', level: Level.A1, example: { en: 'Let\'s watch a video on YouTube.', vi: 'Chúng ta hãy xem một video trên YouTube.' } },
  { id: 561, word: 'game', ipa: '/ɡeɪm/', meaning: 'trò chơi', level: Level.A1, example: { en: 'Do you want to play a game?', vi: 'Bạn có muốn chơi một trò chơi không?' } },
  { id: 562, word: 'sport', ipa: '/spɔːt/', meaning: 'thể thao', level: Level.A1, example: { en: 'Football is my favorite sport.', vi: 'Bóng đá là môn thể thao yêu thích của tôi.' } },
  { id: 563, word: 'team', ipa: '/tiːm/', meaning: 'đội', level: Level.A2, example: { en: 'He plays for the national team.', vi: 'Anh ấy chơi cho đội tuyển quốc gia.' } },
  { id: 564, word: 'player', ipa: '/ˈpleɪə(r)/', meaning: 'cầu thủ, người chơi', level: Level.A2, example: { en: 'He is a very good football player.', vi: 'Anh ấy là một cầu thủ bóng đá rất giỏi.' } },
  { id: 565, word: 'garden', ipa: '/ˈɡɑːdn/', meaning: 'khu vườn', level: Level.A1, example: { en: 'My mother loves working in the garden.', vi: 'Mẹ tôi thích làm việc trong vườn.' } },
  { id: 566, word: 'flower', ipa: '/ˈflaʊə(r)/', meaning: 'hoa', level: Level.A1, example: { en: 'These flowers smell lovely.', vi: 'Những bông hoa này có mùi thơm đáng yêu.' } },
  { id: 567, word: 'tree', ipa: '/triː/', meaning: 'cây', level: Level.A1, example: { en: 'There are many tall trees in the forest.', vi: 'Có rất nhiều cây cao trong rừng.' } },
  { id: 568, word: 'park', ipa: '/pɑːk/', meaning: 'công viên', level: Level.A1, example: { en: 'We went for a walk in the park.', vi: 'Chúng tôi đã đi dạo trong công viên.' } },
  { id: 569, word: 'river', ipa: '/ˈrɪvə(r)/', meaning: 'sông', level: Level.A2, example: { en: 'The river flows through the city.', vi: 'Con sông chảy qua thành phố.' } },
  { id: 570, word: 'sea', ipa: '/siː/', meaning: 'biển', level: Level.A1, example: { en: 'I love swimming in the sea.', vi: 'Tôi thích bơi ở biển.' } },
  { id: 571, word: 'sun', ipa: '/sʌn/', meaning: 'mặt trời', level: Level.A1, example: { en: 'The sun is shining brightly today.', vi: 'Hôm nay mặt trời chiếu sáng rực rỡ.' } },
  { id: 572, word: 'moon', ipa: '/muːn/', meaning: 'mặt trăng', level: Level.A2, example: { en: 'The moon is full tonight.', vi: 'Tối nay trăng tròn.' } },
  { id: 573, word: 'star', ipa: '/stɑː(r)/', meaning: 'ngôi sao', level: Level.A2, example: { en: 'You can see many stars in the sky at night.', vi: 'Bạn có thể thấy nhiều ngôi sao trên bầu trời vào ban đêm.' } },
  { id: 574, word: 'weather', ipa: '/ˈweðə(r)/', meaning: 'thời tiết', level: Level.A1, example: { en: 'The weather is very nice today.', vi: 'Thời tiết hôm nay rất đẹp.' } },
  { id: 575, word: 'rain', ipa: '/reɪn/', meaning: 'mưa', level: Level.A1, example: { en: 'It started to rain.', vi: 'Trời bắt đầu mưa.' } },
  { id: 576, word: 'snow', ipa: '/snəʊ/', meaning: 'tuyết', level: Level.A2, example: { en: 'It rarely snows in this city.', vi: 'Tuyết hiếm khi rơi ở thành phố này.' } },
  { id: 577, word: 'wind', ipa: '/wɪnd/', meaning: 'gió', level: Level.A2, example: { en: 'The wind is blowing hard.', vi: 'Gió đang thổi mạnh.' } },
  { id: 578, word: 'cloud', ipa: '/klaʊd/', meaning: 'mây', level: Level.A2, example: { en: 'There are no clouds in the sky.', vi: 'Không có mây trên trời.' } },
  { id: 579, word: 'hot', ipa: '/hɒt/', meaning: 'nóng', level: Level.A1, example: { en: 'It is very hot today.', vi: 'Hôm nay trời rất nóng.' } },
  { id: 580, word: 'warm', ipa: '/wɔːm/', meaning: 'ấm áp', level: Level.A2, example: { en: 'I like warm weather.', vi: 'Tôi thích thời tiết ấm áp.' } },
  { id: 581, word: 'cool', ipa: '/kuːl/', meaning: 'mát mẻ', level: Level.A2, example: { en: 'It\'s a cool evening.', vi: 'Đó là một buổi tối mát mẻ.' } },
  { id: 582, word: 'white', ipa: '/waɪt/', meaning: 'màu trắng', level: Level.A1, example: { en: 'She wore a white dress.', vi: 'Cô ấy mặc một chiếc váy trắng.' } },
  { id: 583, word: 'green', ipa: '/ɡriːn/', meaning: 'màu xanh lá cây', level: Level.A1, example: { en: 'The grass is green.', vi: 'Cỏ màu xanh.' } },
  { id: 584, word: 'yellow', ipa: '/ˈjeləʊ/', meaning: 'màu vàng', level: Level.A1, example: { en: 'The sun is yellow.', vi: 'Mặt trời màu vàng.' } },
  { id: 585, word: 'orange', ipa: '/ˈɒrɪndʒ/', meaning: 'màu cam', level: Level.A1, example: { en: 'I have an orange t-shirt.', vi: 'Tôi có một chiếc áo phông màu cam.' } },
  { id: 586, word: 'purple', ipa: '/ˈpɜːpl/', meaning: 'màu tím', level: Level.A2, example: { en: 'Purple is her favorite color.', vi: 'Màu tím là màu yêu thích của cô ấy.' } },
  { id: 587, word: 'pink', ipa: '/pɪŋk/', meaning: 'màu hồng', level: Level.A2, example: { en: 'She loves pink roses.', vi: 'Cô ấy yêu hoa hồng.' } },
  { id: 588, word: 'grey', ipa: '/ɡreɪ/', meaning: 'màu xám', level: Level.A2, example: { en: 'He has grey hair.', vi: 'Ông ấy có mái tóc bạc.' } },
  { id: 589, word: 'colour', ipa: '/ˈkʌlə(r)/', meaning: 'màu sắc', level: Level.A1, example: { en: 'What is your favorite colour?', vi: 'Màu sắc yêu thích của bạn là gì?' } },
  { id: 590, word: 'number', ipa: '/ˈnʌmbə(r)/', meaning: 'số', level: Level.A1, example: { en: 'What is your phone number?', vi: 'Số điện thoại của bạn là gì?' } },
  { id: 591, word: 'letter', ipa: '/ˈletə(r)/', meaning: 'chữ cái, lá thư', level: Level.A1, example: { en: 'A is the first letter of the alphabet.', vi: 'A là chữ cái đầu tiên của bảng chữ cái.' } },
  { id: 592, word: 'word', ipa: '/wɜːd/', meaning: 'từ', level: Level.A1, example: { en: 'Can you spell this word?', vi: 'Bạn có thể đánh vần từ này không?' } },
  { id: 593, word: 'sentence', ipa: '/ˈsentəns/', meaning: 'câu', level: Level.A1, example: { en: 'Please write a full sentence.', vi: 'Vui lòng viết một câu đầy đủ.' } },
  { id: 594, word: 'problem', ipa: '/ˈprɒbləm/', meaning: 'vấn đề', level: Level.A2, example: { en: 'I have a problem with my computer.', vi: 'Tôi có một vấn đề với máy tính của mình.' } },
  { id: 595, word: 'result', ipa: '/rɪˈzʌlt/', meaning: 'kết quả', level: Level.B1, example: { en: 'What was the result of the match?', vi: 'Kết quả của trận đấu là gì?' } },
  { id: 596, word: 'thing', ipa: '/θɪŋ/', meaning: 'vật, thứ', level: Level.A1, example: { en: 'What is that thing?', vi: 'Cái đó là gì?' } },
  { id: 597, word: 'head', ipa: '/hed/', meaning: 'đầu', level: Level.A1, example: { en: 'My head hurts.', vi: 'Tôi bị đau đầu.' } },
  { id: 598, word: 'face', ipa: '/feɪs/', meaning: 'khuôn mặt', level: Level.A1, example: { en: 'She has a beautiful face.', vi: 'Cô ấy có một khuôn mặt xinh đẹp.' } },
  { id: 599, word: 'eye', ipa: '/aɪ/', meaning: 'mắt', level: Level.A1, example: { en: 'He has blue eyes.', vi: 'Anh ấy có đôi mắt xanh.' } },
  { id: 600, word: 'nose', ipa: '/nəʊz/', meaning: 'mũi', level: Level.A1, example: { en: 'My nose is running.', vi: 'Tôi bị sổ mũi.' } },
  { id: 601, word: 'mouth', ipa: '/maʊθ/', meaning: 'miệng', level: Level.A1, example: { en: 'Open your mouth.', vi: 'Mở miệng ra.' } },
  { id: 602, word: 'ear', ipa: '/ɪə(r)/', meaning: 'tai', level: Level.A1, example: { en: 'I can\'t hear with my left ear.', vi: 'Tôi không thể nghe bằng tai trái.' } },
  { id: 603, word: 'hair', ipa: '/heə(r)/', meaning: 'tóc', level: Level.A1, example: { en: 'She has long black hair.', vi: 'Cô ấy có mái tóc đen dài.' } },
  { id: 604, word: 'hand', ipa: '/hænd/', meaning: 'bàn tay', level: Level.A1, example: { en: 'Please raise your hand.', vi: 'Vui lòng giơ tay.' } },
  { id: 605, word: 'foot', ipa: '/fʊt/', meaning: 'bàn chân', level: Level.A1, example: { en: 'My foot hurts.', vi: 'Chân tôi đau.' } },
  { id: 606, word: 'leg', ipa: '/leɡ/', meaning: 'chân', level: Level.A1, example: { en: 'He broke his leg.', vi: 'Anh ấy bị gãy chân.' } },
  { id: 607, word: 'heart', ipa: '/hɑːt/', meaning: 'tim', level: Level.A2, example: { en: 'My heart is beating fast.', vi: 'Tim tôi đang đập nhanh.' } },
  { id: 608, word: 'doctor', ipa: '/ˈdɒktə(r)/', meaning: 'bác sĩ', level: Level.A1, example: { en: 'I need to see a doctor.', vi: 'Tôi cần đi khám bác sĩ.' } },
  { id: 609, word: 'nurse', ipa: '/nɜːs/', meaning: 'y tá', level: Level.A2, example: { en: 'The nurse took my temperature.', vi: 'Y tá đã đo nhiệt độ cho tôi.' } },
  { id: 610, word: 'medicine', ipa: '/ˈmedsn/', meaning: 'thuốc', level: Level.A2, example: { en: 'You need to take this medicine.', vi: 'Bạn cần uống loại thuốc này.' } },
  { id: 611, word: 'police', ipa: '/pəˈliːs/', meaning: 'cảnh sát', level: Level.A2, example: { en: 'Call the police!', vi: 'Gọi cảnh sát!' } },
  { id: 612, word: 'fire', ipa: '/ˈfaɪə(r)/', meaning: 'lửa', level: Level.A2, example: { en: 'The house is on fire!', vi: 'Ngôi nhà đang cháy!' } },
  { id: 613, word: 'help', ipa: '/help/', meaning: 'giúp đỡ', level: Level.A1, example: { en: 'Can you help me?', vi: 'Bạn có thể giúp tôi không?' } },
  { id: 614, word: 'start', ipa: '/stɑːt/', meaning: 'bắt đầu', level: Level.A1, example: { en: 'The movie starts at 7 PM.', vi: 'Bộ phim bắt đầu lúc 7 giờ tối.' } },
  { id: 615, word: 'stop', ipa: '/stɒp/', meaning: 'dừng lại', level: Level.A1, example: { en: 'Please stop talking.', vi: 'Vui lòng ngừng nói chuyện.' } },
  { id: 616, word: 'wait', ipa: '/weɪt/', meaning: 'đợi', level: Level.A2, example: { en: 'Please wait for me.', vi: 'Vui lòng đợi tôi.' } },
  { id: 617, word: 'talk', ipa: '/tɔːk/', meaning: 'nói chuyện', level: Level.A1, example: { en: 'I need to talk to you.', vi: 'Tôi cần nói chuyện với bạn.' } },
  { id: 618, word: 'speak', ipa: '/spiːk/', meaning: 'nói', level: Level.A1, example: { en: 'Can you speak English?', vi: 'Bạn có thể nói tiếng Anh không?' } },
  { id: 619, word: 'tell', ipa: '/tel/', meaning: 'kể, bảo', level: Level.A1, example: { en: 'Can you tell me a story?', vi: 'Bạn có thể kể cho tôi một câu chuyện được không?' } },
  { id: 620, word: 'say', ipa: '/seɪ/', meaning: 'nói', level: Level.A1, example: { en: 'What did you say?', vi: 'Bạn đã nói gì?' } },
  { id: 621, word: 'think', ipa: '/θɪŋk/', meaning: 'suy nghĩ', level: Level.A1, example: { en: 'What do you think?', vi: 'Bạn nghĩ sao?' } },
  { id: 622, word: 'know', ipa: '/nəʊ/', meaning: 'biết', level: Level.A1, example: { en: 'I don\'t know the answer.', vi: 'Tôi không biết câu trả lời.' } },
  { id: 623, word: 'understand', ipa: '/ˌʌndəˈstænd/', meaning: 'hiểu', level: Level.A1, example: { en: 'I don\'t understand.', vi: 'Tôi không hiểu.' } },
  { id: 624, word: 'learn', ipa: '/lɜːn/', meaning: 'học', level: Level.A1, example: { en: 'I want to learn French.', vi: 'Tôi muốn học tiếng Pháp.' } },
  { id: 625, word: 'teach', ipa: '/tiːtʃ/', meaning: 'dạy', level: Level.A2, example: { en: 'She teaches English.', vi: 'Cô ấy dạy tiếng Anh.' } },
  { id: 626, word: 'read', ipa: '/riːd/', meaning: 'đọc', level: Level.A1, example: { en: 'I like to read books.', vi: 'Tôi thích đọc sách.' } },
  { id: 627, word: 'write', ipa: '/raɪt/', meaning: 'viết', level: Level.A1, example: { en: 'Please write your name here.', vi: 'Vui lòng viết tên của bạn ở đây.' } },
  { id: 628, word: 'draw', ipa: '/drɔː/', meaning: 'vẽ', level: Level.A2, example: { en: 'She can draw very well.', vi: 'Cô ấy có thể vẽ rất đẹp.' } },
  { id: 629, word: 'sing', ipa: '/sɪŋ/', meaning: 'hát', level: Level.A2, example: { en: 'He likes to sing.', vi: 'Anh ấy thích hát.' } },
  { id: 630, word: 'dance', ipa: '/dɑːns/', meaning: 'nhảy múa', level: Level.A2, example: { en: 'Let\'s dance!', vi: 'Hãy nhảy nào!' } },
  { id: 631, word: 'play', ipa: '/pleɪ/', meaning: 'chơi', level: Level.A1, example: { en: 'The children are playing.', vi: 'Bọn trẻ đang chơi.' } },
  { id: 632, word: 'run', ipa: '/rʌn/', meaning: 'chạy', level: Level.A1, example: { en: 'I run every morning.', vi: 'Tôi chạy mỗi buổi sáng.' } },
  { id: 633, word: 'walk', ipa: '/wɔːk/', meaning: 'đi bộ', level: Level.A1, example: { en: 'Let\'s go for a walk.', vi: 'Chúng ta hãy đi dạo.' } },
  { id: 634, word: 'jump', ipa: '/dʒʌmp/', meaning: 'nhảy', level: Level.A2, example: { en: 'He can jump very high.', vi: 'Anh ấy có thể nhảy rất cao.' } },
  { id: 635, word: 'swim', ipa: '/swɪm/', meaning: 'bơi', level: Level.A2, example: { en: 'I like to swim in the sea.', vi: 'Tôi thích bơi ở biển.' } },
  { id: 636, word: 'fly', ipa: '/flaɪ/', meaning: 'bay', level: Level.A2, example: { en: 'Birds can fly.', vi: 'Chim có thể bay.' } },
  { id: 637, word: 'drive', ipa: '/draɪv/', meaning: 'lái xe', level: Level.A2, example: { en: 'Can you drive a car?', vi: 'Bạn có thể lái xe hơi không?' } },
  { id: 638, word: 'ride', ipa: '/raɪd/', meaning: 'đi (xe đạp, ngựa)', level: Level.A2, example: { en: 'I can ride a bicycle.', vi: 'Tôi có thể đi xe đạp.' } },
  { id: 639, word: 'sit', ipa: '/sɪt/', meaning: 'ngồi', level: Level.A1, example: { en: 'Please sit down.', vi: 'Vui lòng ngồi xuống.' } },
  { id: 640, word: 'stand', ipa: '/stænd/', meaning: 'đứng', level: Level.A1, example: { en: 'Please stand up.', vi: 'Vui lòng đứng lên.' } },
  { id: 641, word: 'sleep', ipa: '/sliːp/', meaning: 'ngủ', level: Level.A1, example: { en: 'I need to sleep.', vi: 'Tôi cần phải ngủ.' } },
  { id: 642, word: 'wake up', ipa: '/weɪk ʌp/', meaning: 'thức dậy', level: Level.A2, example: { en: 'What time do you wake up?', vi: 'Bạn thức dậy lúc mấy giờ?' } },
  { id: 643, word: 'open', ipa: '/ˈəʊpən/', meaning: 'mở', level: Level.A1, example: { en: 'Please open the window.', vi: 'Vui lòng mở cửa sổ.' } },
  { id: 644, word: 'shut', ipa: '/ʃʌt/', meaning: 'đóng', level: Level.B1, example: { en: 'Shut the door, please.', vi: 'Làm ơn đóng cửa lại.' } },
  { id: 645, word: 'give', ipa: '/ɡɪv/', meaning: 'cho', level: Level.A1, example: { en: 'Can you give me the book?', vi: 'Bạn có thể đưa tôi cuốn sách được không?' } },
  { id: 646, word: 'take', ipa: '/teɪk/', meaning: 'lấy, mang', level: Level.A1, example: { en: 'Don\'t forget to take your umbrella.', vi: 'Đừng quên mang theo ô của bạn.' } },
  { id: 647, word: 'put', ipa: '/pʊt/', meaning: 'đặt', level: Level.A1, example: { en: 'Put the book on the table.', vi: 'Đặt cuốn sách lên bàn.' } },
  { id: 648, word: 'find', ipa: '/faɪnd/', meaning: 'tìm thấy', level: Level.A1, example: { en: 'I can\'t find my keys.', vi: 'Tôi không thể tìm thấy chìa khóa của mình.' } },
  { id: 649, word: 'look for', ipa: '/lʊk fɔː(r)/', meaning: 'tìm kiếm', level: Level.A2, example: { en: 'I am looking for my phone.', vi: 'Tôi đang tìm điện thoại của mình.' } },
  { id: 650, word: 'use', ipa: '/juːz/', meaning: 'sử dụng', level: Level.A1, example: { en: 'Can I use your pen?', vi: 'Tôi có thể dùng bút của bạn được không?' } },
  { id: 651, word: 'make', ipa: '/meɪk/', meaning: 'làm, tạo ra', level: Level.A1, example: { en: 'I will make a cake.', vi: 'Tôi sẽ làm một cái bánh.' } },
  { id: 652, word: 'do', ipa: '/duː/', meaning: 'làm', level: Level.A1, example: { en: 'What are you doing?', vi: 'Bạn đang làm gì vậy?' } },
  { id: 653, word: 'try', ipa: '/traɪ/', meaning: 'thử', level: Level.A2, example: { en: 'You should try this food.', vi: 'Bạn nên thử món ăn này.' } },
  { id: 654, word: 'kind', ipa: '/kaɪnd/', meaning: 'tốt bụng', level: Level.A1, example: { en: 'She is a very kind person.', vi: 'Cô ấy là một người rất tốt bụng.' } },
];

export const OXFORD_3000_FULL: Word[] = OXFORD_3000_RAW.map(word => ({
    ...word,
    audioUrl: createTtsApiUrl(word.word)
}));

// --- SENTENCES DATA ---
const COMMON_SENTENCES_RAW: Omit<Sentence, 'audioUrl'>[] = [
  // A1 Level
  { id: 1, sentence: "How are you?", ipa: "/haʊ ɑːr juː/", meaning: "Bạn khỏe không?", category: "Greetings", level: Level.A1 },
  { id: 2, sentence: "What's your name?", ipa: "/wʌts jʊər neɪm/", meaning: "Tên bạn là gì?", category: "Introductions", level: Level.A1 },
  { id: 3, sentence: "I'm sorry.", ipa: "/aɪm ˈsɑːri/", meaning: "Tôi xin lỗi.", category: "Apologies", level: Level.A1 },
  { id: 4, sentence: "Where is the restroom?", ipa: "/wer ɪz ðə ˈrestrʊm/", meaning: "Nhà vệ sinh ở đâu?", category: "Directions", level: Level.A1 },
  { id: 5, sentence: "How much is this?", ipa: "/haʊ mʌtʃ ɪz ðɪs/", meaning: "Cái này bao nhiêu tiền?", category: "Shopping", level: Level.A1 },
  // A2 Level
  { id: 6, sentence: "Could you help me, please?", ipa: "/kʊd juː help miː, pliːz/", meaning: "Bạn có thể giúp tôi được không?", category: "Requests", level: Level.A2 },
  { id: 7, sentence: "I don't understand.", ipa: "/aɪ doʊnt ˌʌndərˈstænd/", meaning: "Tôi không hiểu.", category: "Communication", level: Level.A2 },
  { id: 8, sentence: "What do you do for a living?", ipa: "/wʌt duː juː duː fər ə ˈlɪvɪŋ/", meaning: "Bạn làm nghề gì?", category: "Small Talk", level: Level.A2 },
  // B1 Level
  { id: 9, sentence: "I'd like to make a reservation.", ipa: "/aɪd laɪk tuː meɪk ə ˌrezərˈveɪʃn/", meaning: "Tôi muốn đặt chỗ trước.", category: "Services", level: Level.B1 },
  { id: 10, sentence: "What do you recommend?", ipa: "/wʌt duː juː ˌrekəˈmend/", meaning: "Bạn gợi ý món nào?", category: "Food & Drink", level: Level.B1 },

  // --- ADDED SENTENCES (Generated based on existing ones) ---

  // Related to "How are you?"
  { id: 11, sentence: "Are you feeling okay today?", ipa: "/ɑːr juː ˈfiːlɪŋ ˌoʊˈkeɪ təˈdeɪ/", meaning: "Hôm nay bạn cảm thấy ổn chứ?", category: "Greetings", level: Level.A1 },
  { id: 12, sentence: "How has your day been so far?", ipa: "/haʊ hæz jʊər deɪ bɪn soʊ fɑːr/", meaning: "Ngày hôm nay của bạn thế nào rồi?", category: "Greetings", level: Level.A2 },

  // Related to "What's your name?"
  { id: 13, sentence: "Could you tell me your name, please?", ipa: "/kʊd juː tel miː jʊər neɪm, pliːz/", meaning: "Bạn có thể cho tôi biết tên của bạn được không?", category: "Introductions", level: Level.A1 },
  { id: 14, sentence: "I'm Alex. And you are?", ipa: "/aɪm ˈæləks. ænd juː ɑːr/", meaning: "Tôi là Alex. Còn bạn là?", category: "Introductions", level: Level.A1 },

  // Related to "I'm sorry."
  { id: 15, sentence: "My apologies for the delay.", ipa: "/maɪ əˈpɑːlədʒiz fər ðə dɪˈleɪ/", meaning: "Tôi xin lỗi vì sự chậm trễ.", category: "Apologies", level: Level.B1 },
  { id: 16, sentence: "Please forgive me for what I said.", ipa: "/pliːz fərˈɡɪv miː fər wʌt aɪ sed/", meaning: "Xin hãy tha thứ cho tôi vì những gì tôi đã nói.", category: "Apologies", level: Level.A2 },
  
  // Related to "Where is the restroom?"
  { id: 17, sentence: "Could you point me to the nearest washroom?", ipa: "/kʊd juː pɔɪnt miː tuː ðə ˈnɪrəst ˈwɑːʃruːm/", meaning: "Bạn có thể chỉ cho tôi nhà vệ sinh gần nhất không?", category: "Directions", level: Level.A2 },
  { id: 18, sentence: "I'm looking for the men's room.", ipa: "/aɪm ˈlʊkɪŋ fɔːr ðə menz ruːm/", meaning: "Tôi đang tìm phòng vệ sinh nam.", category: "Directions", level: Level.A1 },
  
  // Related to "How much is this?"
  { id: 19, sentence: "What's the price of this item?", ipa: "/wʌts ðə praɪs əv ðɪs ˈaɪtəm/", meaning: "Món đồ này giá bao nhiêu?", category: "Shopping", level: Level.A1 },
  { id: 20, sentence: "Can you tell me how much this costs?", ipa: "/kæn juː tel miː haʊ mʌtʃ ðɪs kɔːsts/", meaning: "Bạn có thể cho tôi biết cái này giá bao nhiêu không?", category: "Shopping", level: Level.A2 },
  
  // Related to "Could you help me, please?"
  { id: 21, sentence: "Would you mind giving me a hand with this?", ipa: "/wʊd juː maɪnd ˈɡɪvɪŋ miː ə hænd wɪθ ðɪs/", meaning: "Bạn có phiền giúp tôi một tay với cái này không?", category: "Requests", level: Level.B1 },
  { id: 22, sentence: "I need a little assistance, if you have a moment.", ipa: "/aɪ niːd ə ˈlɪtl əˈsɪstəns, ɪf juː hæv ə ˈmoʊmənt/", meaning: "Tôi cần một chút sự trợ giúp, nếu bạn có thời gian.", category: "Requests", level: Level.B1 },
  
  // Related to "I don't understand."
  { id: 23, sentence: "Could you explain that in a different way?", ipa: "/kʊd juː ɪkˈspleɪn ðæt ɪn ə ˈdɪfrənt weɪ/", meaning: "Bạn có thể giải thích điều đó theo cách khác được không?", category: "Communication", level: Level.A2 },
  { id: 24, sentence: "I'm not sure I follow you.", ipa: "/aɪm nɑːt ʃʊr aɪ ˈfɑːloʊ juː/", meaning: "Tôi không chắc là mình hiểu ý bạn.", category: "Communication", level: Level.B1 },
  
  // Related to "What do you do for a living?"
  { id: 25, sentence: "What line of work are you in?", ipa: "/wʌt laɪn əv wɜːrk ɑːr juː ɪn/", meaning: "Bạn làm trong lĩnh vực nào?", category: "Small Talk", level: Level.B1 },
  { id: 26, sentence: "So, what's your profession?", ipa: "/soʊ, wʌts jʊər prəˈfeʃn/", meaning: "Vậy, nghề nghiệp của bạn là gì?", category: "Small Talk", level: Level.A2 },
  
  // Related to "I'd like to make a reservation."
  { id: 27, sentence: "Do you have any tables available for two tonight?", ipa: "/duː juː hæv ˈeni ˈteɪblz əˈveɪləbl fər tuː təˈnaɪt/", meaning: "Tối nay bạn có bàn trống nào cho hai người không?", category: "Services", level: Level.A2 },
  { id: 28, sentence: "I want to book a room for two nights.", ipa: "/aɪ wɑːnt tuː bʊk ə ruːm fər tuː naɪts/", meaning: "Tôi muốn đặt một phòng cho hai đêm.", category: "Services", level: Level.A2 },
  
  // Related to "What do you recommend?"
  { id: 29, sentence: "What's the special of the day?", ipa: "/wʌts ðə ˈspeʃl əv ðə deɪ/", meaning: "Món đặc biệt của ngày hôm nay là gì?", category: "Food & Drink", level: Level.A2 },
  { id: 30, sentence: "Which dish is your most popular?", ipa: "/wɪtʃ dɪʃ ɪz jʊər moʊst ˈpɑːpjələr/", meaning: "Món ăn nào của bạn phổ biến nhất?", category: "Food & Drink", level: Level.B1 },
];

export const COMMON_SENTENCES_FULL: Sentence[] = COMMON_SENTENCES_RAW.map(sentence => ({
    ...sentence,
    audioUrl: createTtsApiUrl(sentence.sentence)
}));

// --- CONVERSATIONS DATA ---
const CONVERSATIONS_RAW: Conversation[] = [
  {
    id: 'convo1',
    title: 'Ordering Coffee',
    level: Level.A2,
    category: 'Food & Drink',
    lines: [
      { speaker: 'Barista', sentence: "Hi, what can I get for you today?", meaning: "Chào bạn, hôm nay bạn muốn dùng gì?" },
      { speaker: 'Customer', sentence: "I'd like a large latte, please.", meaning: "Cho tôi một ly latte lớn." },
      { speaker: 'Barista', sentence: "Sure. Anything else?", meaning: "Vâng. Bạn có muốn gọi gì nữa không?" },
      { speaker: 'Customer', sentence: "No, that's all. Thanks.", meaning: "Không, thế thôi. Cảm ơn." }
    ]
  },
  {
    id: 'convo2',
    title: 'Making Plans',
    level: Level.B1,
    category: 'Socializing',
    lines: [
        { speaker: 'Alex', sentence: "Hey, are you free this weekend?", meaning: "Này, bạn có rảnh cuối tuần này không?" },
        { speaker: 'Ben', sentence: "I think so. What did you have in mind?", meaning: "Tôi nghĩ là có. Bạn có ý định gì à?" },
        { speaker: 'Alex', sentence: "I was thinking we could catch a movie.", meaning: "Tôi đang nghĩ chúng ta có thể đi xem phim." },
        { speaker: 'Ben', sentence: "That sounds like a great idea! Which one?", meaning: "Nghe có vẻ là một ý tưởng tuyệt vời! Phim nào vậy?" }
    ]
  },
  {
    id: 'convo3',
    title: "Making a Doctor's Appointment",
    level: Level.B1,
    category: 'Health',
    lines: [
      { speaker: 'Receptionist', sentence: "Good morning, City Clinic. How can I help you?", meaning: "Chào buổi sáng, Phòng khám City xin nghe. Tôi có thể giúp gì cho bạn?" },
      { speaker: 'Patient', sentence: "Hello, I'd like to make an appointment to see Dr. Evans, please.", meaning: "Xin chào, tôi muốn đặt lịch hẹn gặp bác sĩ Evans." },
      { speaker: 'Receptionist', sentence: "Of course. Are you an existing patient?", meaning: "Vâng ạ. Bạn có phải là bệnh nhân cũ không?" },
      { speaker: 'Patient', sentence: "Yes, I am. My name is Anna Chen.", meaning: "Vâng, đúng vậy. Tên tôi là Anna Chen." },
      { speaker: 'Receptionist', sentence: "Okay, Anna. What's the reason for your visit today?", meaning: "Được rồi, Anna. Lý do bạn muốn khám hôm nay là gì?" },
      { speaker: 'Patient', sentence: "I've had a persistent cough for about a week and it's not getting any better.", meaning: "Tôi bị ho dai dẳng khoảng một tuần nay và không có dấu hiệu thuyên giảm." },
      { speaker: 'Receptionist', sentence: "I see. Dr. Evans has an opening tomorrow afternoon at 2:30 PM. Would that work for you?", meaning: "Tôi hiểu rồi. Bác sĩ Evans có một suất trống vào chiều mai lúc 2:30. Giờ đó có tiện cho bạn không?" },
      { speaker: 'Patient', sentence: "Yes, that's perfect. Thank you.", meaning: "Vâng, giờ đó hoàn hảo. Cảm ơn bạn." },
      { speaker: 'Receptionist', sentence: "Great. We'll see you tomorrow at 2:30 PM. Please remember to bring your health card.", meaning: "Tuyệt vời. Hẹn gặp bạn vào 2:30 chiều mai. Vui lòng nhớ mang theo thẻ bảo hiểm y tế." }
    ]
  },
  {
    id: 'convo4',
    title: 'Returning an Item',
    level: Level.B1,
    category: 'Shopping',
    lines: [
        { speaker: 'Customer', sentence: "Excuse me, I'd like to return this sweater.", meaning: "Xin lỗi, tôi muốn trả lại chiếc áo len này." },
        { speaker: 'Store Clerk', sentence: "Certainly. Is there anything wrong with it?", meaning: "Chắc chắn rồi. Áo có vấn đề gì không ạ?" },
        { speaker: 'Customer', sentence: "No, it's just the wrong size. I need a medium instead of a large.", meaning: "Không, chỉ là sai kích cỡ. Tôi cần cỡ vừa thay vì cỡ lớn." },
        { speaker: 'Store Clerk', sentence: "I understand. Do you have the receipt?", meaning: "Tôi hiểu rồi. Anh/chị có hóa đơn không ạ?" },
        { speaker: 'Customer', sentence: "Yes, right here.", meaning: "Có, ở đây." },
        { speaker: 'Store Clerk', sentence: "Thank you. Let me just check if we have a medium in stock... Yes, we do. Would you like to exchange it?", meaning: "Cảm ơn. Để tôi kiểm tra xem chúng tôi còn cỡ vừa trong kho không... Vâng, có ạ. Anh/chị có muốn đổi không?" },
        { speaker: 'Customer', sentence: "Yes, please. That would be great.", meaning: "Vâng, làm ơn. Vậy thì tuyệt quá." },
        { speaker: 'Store Clerk', sentence: "No problem. I'll get that for you right away.", meaning: "Không vấn đề gì. Tôi sẽ lấy nó cho anh/chị ngay." }
    ]
  },
  {
    id: 'convo5',
    title: 'Asking for Directions',
    level: Level.A2,
    category: 'Directions',
    lines: [
        { speaker: 'Tourist', sentence: "Excuse me, could you help me? I'm looking for the art museum.", meaning: "Xin lỗi, bạn có thể giúp tôi không? Tôi đang tìm bảo tàng nghệ thuật." },
        { speaker: 'Local', sentence: "Of course. It's not too far from here.", meaning: "Tất nhiên rồi. Nó không quá xa đây đâu." },
        { speaker: 'Tourist', sentence: "Oh, great! How do I get there?", meaning: "Ồ, tuyệt! Làm thế nào để đến đó?" },
        { speaker: 'Local', sentence: "You need to go straight down this street for about two blocks. When you get to the traffic lights, turn left.", meaning: "Bạn cần đi thẳng con phố này khoảng hai dãy nhà. Khi đến đèn giao thông, hãy rẽ trái." },
        { speaker: 'Tourist', sentence: "Okay, straight for two blocks, then left at the lights.", meaning: "Được rồi, đi thẳng hai dãy nhà, sau đó rẽ trái ở chỗ đèn." },
        { speaker: 'Local', sentence: "That's right. The museum will be on your right. It's a large, modern building. You can't miss it.", meaning: "Đúng vậy. Bảo tàng sẽ ở bên tay phải của bạn. Đó là một tòa nhà lớn, hiện đại. Bạn không thể bỏ qua nó đâu." },
        { speaker: 'Tourist', sentence: "Thank you so much for your help!", meaning: "Cảm ơn rất nhiều vì sự giúp đỡ của bạn!" },
        { speaker: 'Local', sentence: "You're welcome. Enjoy the museum!", meaning: "Không có gì. Chúc bạn tham quan bảo tàng vui vẻ!" }
    ]
  },
  {
    id: 'convo6',
    title: 'Weekend Plans',
    level: Level.B1,
    category: 'Socializing',
    lines: [
        { speaker: 'Chloe', sentence: "Hey David, any exciting plans for the weekend?", meaning: "Chào David, có kế hoạch gì thú vị cho cuối tuần không?" },
        { speaker: 'David', sentence: "Hey Chloe! Yeah, I'm thinking of going for a hike on Saturday morning. The weather is supposed to be perfect.", meaning: "Chào Chloe! Có, tôi đang nghĩ đến việc đi bộ đường dài vào sáng thứ Bảy. Thời tiết được cho là sẽ rất đẹp." },
        { speaker: 'Chloe', sentence: "That sounds amazing! Where are you planning to go?", meaning: "Nghe tuyệt vời quá! Bạn định đi đâu?" },
        { speaker: 'David', sentence: "Probably to the national park. I want to try that new trail that leads to the waterfall. What about you?", meaning: "Chắc là đến công viên quốc gia. Tôi muốn thử con đường mòn mới dẫn đến thác nước. Còn bạn thì sao?" },
        { speaker: 'Chloe', sentence: "I'm driving up to visit my parents. It's my mom's birthday on Sunday, so we're having a small family get-together.", meaning: "Tôi sẽ lái xe lên thăm bố mẹ. Chủ nhật là sinh nhật mẹ tôi, nên chúng tôi sẽ có một buổi họp mặt gia đình nhỏ." },
        { speaker: 'David', sentence: "Oh, that's lovely! Please wish her a happy birthday from me.", meaning: "Ồ, thật tuyệt! Gửi lời chúc mừng sinh nhật của tôi đến bác nhé." },
        { speaker: 'Chloe', sentence: "I will, thanks! I should be back in town by Sunday evening. Maybe we could grab dinner?", meaning: "Tôi sẽ, cảm ơn! Tôi sẽ trở lại thị trấn vào tối Chủ nhật. Có lẽ chúng ta có thể đi ăn tối?" },
        { speaker: 'David', sentence: "That's a great idea. I should be back from my hike by then. Let's text on Sunday to confirm.", meaning: "Đó là một ý tưởng tuyệt vời. Lúc đó tôi cũng đã đi bộ về rồi. Chúng ta hãy nhắn tin vào Chủ nhật để xác nhận nhé." }
    ]
  },
  {
    id: 'convo7',
    title: 'Chatting About a Recent Trip',
    level: Level.B2,
    category: 'Travel',
    lines: [
        { speaker: 'Tom', sentence: "Hey Maria, welcome back! How was your trip to Japan?", meaning: "Chào Maria, chào mừng trở lại! Chuyến đi Nhật Bản của bạn thế nào?" },
        { speaker: 'Maria', sentence: "Hi Tom! It was absolutely incredible. I'm already wishing I could go back.", meaning: "Chào Tom! Nó thực sự không thể tin được. Tôi đã ước gì mình có thể quay lại rồi." },
        { speaker: 'Tom', sentence: "I bet! What was the highlight of your trip?", meaning: "Tôi cá là vậy! Điểm nhấn trong chuyến đi của bạn là gì?" },
        { speaker: 'Maria', sentence: "That's a tough question. I loved Kyoto for its beautiful temples and gardens, but the food in Osaka was on another level.", meaning: "Đó là một câu hỏi khó. Tôi yêu Kyoto vì những ngôi đền và khu vườn xinh đẹp, nhưng đồ ăn ở Osaka thì ở một đẳng cấp khác." },
        { speaker: 'Tom', sentence: "Oh, I've heard Osaka is a foodie's paradise. What was the best thing you ate?", meaning: "Ồ, tôi nghe nói Osaka là thiên đường của dân sành ăn. Món ngon nhất bạn đã ăn là gì?" },
        { speaker: 'Maria', sentence: "Definitely the takoyaki—the octopus balls. I also had the most amazing ramen I've ever tasted in a tiny shop in Tokyo. The culture is just so rich and everyone was incredibly polite.", meaning: "Chắc chắn là takoyaki—bánh bạch tuộc viên. Tôi cũng đã ăn món ramen tuyệt vời nhất từ trước đến nay tại một quán nhỏ ở Tokyo. Văn hóa thật phong phú và mọi người đều vô cùng lịch sự." },
        { speaker: 'Tom', sentence: "It sounds like you had a fantastic time. You'll have to show me some pictures!", meaning: "Nghe có vẻ bạn đã có một khoảng thời gian tuyệt vời. Bạn phải cho tôi xem vài bức ảnh đấy nhé!" },
        { speaker: 'Maria', sentence: "For sure! I took hundreds. Let's grab coffee this week and I'll show you.", meaning: "Chắc chắn rồi! Tôi đã chụp hàng trăm tấm. Tuần này chúng ta đi uống cà phê nhé, tôi sẽ cho bạn xem." }
    ]
  }
];

export const CONVERSATIONS_FULL: Conversation[] = CONVERSATIONS_RAW.map(convo => ({
    ...convo,
    lines: convo.lines.map(line => ({
        ...line,
        audioUrl: createTtsApiUrl(line.sentence)
    }))
}));