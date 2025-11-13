import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
    VocabularyIcon, SentencesIcon, FlashcardIcon, MinigamesIcon, MicrophoneIcon, StatsIcon, ReviewIcon, BookIcon, AITutorIcon,
    LightIcon, DarkIcon, UserAvatarIcon, NotificationIcon, HomeIcon, BackIcon, SpeakerIcon,
    ListeningIcon, ReadingIcon, GrammarIcon, ChevronDownIcon, SendIcon, InfoIcon, AIConversationIcon, HistoryIcon, TranslateIcon, SwapIcon, CopyIcon
} from './constants';
import { View, UserStats, FeatureCard, Level, Word, Sentence, ReviewItem, SentenceFeedback, CustomLesson, Conversation, PracticeContext, LessonEditorContext, Mistake, PronunciationFeedback, Example, WordDetails, ChatEntry, ConversationRecord, ConversationLine, ProsodyFeedback } from './types';
import { OXFORD_3000_FULL, COMMON_SENTENCES_FULL, CONVERSATIONS_FULL } from './constants';
import * as srsService from './services/srsService';
import * as lessonService from './services/lessonService';
import * as conversationService from './services/conversationService';
import * as geminiService from './services/geminiService';
import * as wordService from './services/wordService';
import * as sentenceService from './services/sentenceService';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Content } from "@google/genai";


// --- Speech Recognition API type definitions for browser compatibility ---
interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
    length: number;
    item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
    length: number;
    isFinal: boolean;
    item(index: number): SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    lang: string;
    interimResults: boolean;
    start(): void;
    stop(): void;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}


// --- AUDIO PLAYER HOOK ---
const useAudioPlayer = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentlyPlayingUrl, setCurrentlyPlayingUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const playAudio = useCallback((url: string | undefined, speed: number = 1.0) => {
        if (!url) return;

        if (audioRef.current && audioRef.current.src === url && !audioRef.current.paused) {
            audioRef.current.pause();
            setCurrentlyPlayingUrl(null);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            const newAudio = new Audio(url);
            audioRef.current = newAudio;
            audioRef.current.playbackRate = speed;
            newAudio.play().catch(e => console.error("Audio play failed:", e));
            setCurrentlyPlayingUrl(url);
            
            newAudio.onended = () => {
                setCurrentlyPlayingUrl(null);
            };
            newAudio.onerror = () => {
                console.error("Error playing audio:", url);
                setCurrentlyPlayingUrl(null);
            };
        }
    }, []);

    return { playAudio, currentlyPlayingUrl };
};

// --- MOCK DATA & CONFIG ---
const initialUserStats: UserStats = {
    name: "Alex",
    streak: 12,
    wordsToday: 7,
    timeTodayMinutes: 15,
    totalWords: 248,
    totalSentences: 89,
    rank: 42,
};

type NavigateFnContext = {
    practice?: PracticeContext;
    editor?: LessonEditorContext;
    lessonId?: string;
};
type NavigateFn = (targetView: View, context?: NavigateFnContext) => void;

// --- Helper Components ---
const PlaybackSpeedControl: React.FC<{
    currentSpeed: number;
    onSpeedChange: (speed: number) => void;
}> = ({ currentSpeed, onSpeedChange }) => {
    const speeds = [0.75, 1.0, 1.25];
    return (
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-full p-0.5">
            {speeds.map(speed => (
                <button
                    key={speed}
                    onClick={(e) => { e.stopPropagation(); onSpeedChange(speed); }}
                    className={`px-2 py-0.5 text-xs font-semibold rounded-full transition-colors ${
                        currentSpeed === speed
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    {speed}x
                </button>
            ))}
        </div>
    );
};


// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState<View>(View.Home);
  const [stats, setStats] = useState<UserStats>(initialUserStats);
  const [customLessons, setCustomLessons] = useState<CustomLesson[]>([]);
  const [customConversations, setCustomConversations] = useState<Conversation[]>([]);
  const [customWords, setCustomWords] = useState<Word[]>([]);
  const [customSentences, setCustomSentences] = useState<Sentence[]>([]);
  const [practiceContext, setPracticeContext] = useState<PracticeContext>({ mode: 'all', lessonId: null, originView: View.Home });
  const [lessonEditorContext, setLessonEditorContext] = useState<LessonEditorContext | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [showAddSentenceModal, setShowAddSentenceModal] = useState(false);

  const allWords = useMemo(() => [...OXFORD_3000_FULL, ...customWords], [customWords]);
  const allSentences = useMemo(() => [...customSentences, ...COMMON_SENTENCES_FULL], [customSentences]);

  const { playAudio, currentlyPlayingUrl } = useAudioPlayer();

  useEffect(() => {
    srsService.initializeDeck(OXFORD_3000_FULL, COMMON_SENTENCES_FULL);
    setCustomLessons(lessonService.getCustomLessons());
    setCustomConversations(conversationService.getCustomConversations());
    setCustomWords(wordService.getCustomWords());
    setCustomSentences(sentenceService.getCustomSentences());
  }, []);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
      const newDarkMode = !darkMode;
      setDarkMode(newDarkMode);
      if (newDarkMode) {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  };
  
    const handleNavigate: NavigateFn = (targetView, context) => {
        if (context?.practice) setPracticeContext(context.practice);
        if (context?.editor) setLessonEditorContext(context.editor);
        if (context?.lessonId) {
            setSelectedLessonId(context.lessonId);
        } else if (![View.LessonDetail, View.Flashcards, View.SentencePractice, View.FillInTheBlank, View.ListeningPractice].includes(targetView)) {
            setSelectedLessonId(null);
        }
        setView(targetView);
    };

    const handleAddLesson = useCallback((name: string, description: string, wordIds: number[]) => {
        const newLesson = lessonService.createLesson(name, wordIds, description);
        setCustomLessons(prev => [...prev, newLesson]);
    }, []);

    const handleUpdateLesson = useCallback((lesson: CustomLesson) => {
        lessonService.updateLesson(lesson);
        setCustomLessons(prev => prev.map(l => l.id === lesson.id ? lesson : l));
    }, []);

    const handleDeleteLesson = useCallback((lessonId: string) => {
        if (window.confirm("Are you sure you want to delete this lesson?")) {
            lessonService.deleteLesson(lessonId);
            setCustomLessons(prev => prev.filter(l => l.id !== lessonId));
        }
    }, []);

    const handleAddConversation = useCallback((conversation: Conversation) => {
        conversationService.addCustomConversation(conversation);
        setCustomConversations(prev => [conversation, ...prev]);
    }, []);

    const handleDeleteConversation = useCallback((conversationId: string) => {
        if (window.confirm("Are you sure you want to delete this conversation?")) {
            conversationService.deleteCustomConversation(conversationId);
            setCustomConversations(prev => prev.filter(c => c.id !== conversationId));
        }
    }, []);
    
    const handleAddWord = useCallback(async (word: string, meaning: string, exampleEn: string): Promise<{ success: boolean; error?: string }> => {
        if (allWords.some(w => w.word.toLowerCase() === word.toLowerCase())) {
            return { success: false, error: `The word "${word}" already exists.` };
        }

        const result = await geminiService.getWordDataFromGemini(word, meaning, exampleEn);

        if (result.error || !result.wordData) {
            return { success: false, error: result.error || "Failed to process word." };
        }
        
        const createTtsApiUrl = (text: string) => `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;

        const newWord: Word = {
            ...result.wordData,
            id: Date.now(),
            audioUrl: createTtsApiUrl(result.wordData.word),
            isCustom: true,
        };
        
        try {
            wordService.addCustomWord(newWord);
            srsService.addReviewItem({ id: newWord.id, type: 'word' });
            setCustomWords(prev => [...prev, newWord]);
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }, [allWords]);

    const handleUpdateWord = useCallback((updatedWord: Word) => {
        if (!updatedWord.isCustom) return;
    
        const updatedWords = customWords.map(w => w.id === updatedWord.id ? updatedWord : w);
        setCustomWords(updatedWords);
        wordService.saveCustomWords(updatedWords);
    }, [customWords]);

    const handleDeleteWord = useCallback((wordId: number) => {
        if (window.confirm("Are you sure you want to delete this word? This will also remove it from your custom lessons and review schedule.")) {
            const updatedLessons = lessonService.getCustomLessons().map(lesson => {
                const newVocabularyIds = lesson.vocabularyIds.filter(id => id !== wordId);
                return { ...lesson, vocabularyIds: newVocabularyIds };
            });
            lessonService.saveCustomLessons(updatedLessons);
            setCustomLessons(updatedLessons);

            wordService.deleteCustomWord(wordId);
            setCustomWords(prev => prev.filter(w => w.id !== wordId));
        }
    }, []);
    
    const handleAddSentence = useCallback(async (sentence: string, meaning: string, category: string): Promise<{ success: boolean; error?: string }> => {
        if (allSentences.some(s => s.sentence.toLowerCase() === sentence.toLowerCase())) {
            return { success: false, error: `The sentence already exists.` };
        }
    
        const result = await geminiService.getSentenceDataFromGemini(sentence, meaning, category);
    
        if (result.error || !result.sentenceData) {
            return { success: false, error: result.error || "Failed to process sentence." };
        }
        
        const createTtsApiUrl = (text: string) => `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
    
        const newSentence: Sentence = {
            ...result.sentenceData,
            id: Date.now(),
            audioUrl: createTtsApiUrl(result.sentenceData.sentence),
            isCustom: true,
        };
        
        try {
            sentenceService.addCustomSentence(newSentence);
            srsService.addReviewItem({ id: newSentence.id, type: 'sentence' });
            setCustomSentences(prev => [newSentence, ...prev]);
            return { success: true };
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }, [allSentences]);

    const handleUpdateSentence = useCallback((updatedSentence: Sentence) => {
        if (!updatedSentence.isCustom) return;

        const updatedSentences = customSentences.map(s => s.id === updatedSentence.id ? updatedSentence : s);
        setCustomSentences(updatedSentences);
        sentenceService.saveCustomSentences(updatedSentences);
    }, [customSentences]);


    const handleDeleteSentence = useCallback((sentenceId: number) => {
        if (window.confirm("Are you sure you want to delete this sentence?")) {
            sentenceService.deleteCustomSentence(sentenceId);
            setCustomSentences(prev => prev.filter(s => s.id !== sentenceId));
        }
    }, []);


  // FIX: Added bgColor property to satisfy the FeatureCard interface.
  const features: FeatureCard[] = useMemo(() => [
    { view: View.Vocabulary, title: 'Từ Vựng', icon: VocabularyIcon, badge: `${stats.totalWords}/${allWords.length}`, color: 'text-primary', bgColor: 'bg-primary/10', description: `Học bộ từ vựng Oxford ${allWords.length}` },
    { view: View.Sentences, title: 'Mẫu Câu', icon: SentencesIcon, badge: `${stats.totalSentences}/${allSentences.length}`, color: 'text-secondary-dark', bgColor: 'bg-secondary-dark/10', description: `Học ${allSentences.length} câu giao tiếp phổ biến` },
    { view: View.Flashcards, title: 'Flashcard', icon: FlashcardIcon, badge: `${srsService.getReviewQueue().length} due`, color: 'text-accent-DEFAULT', bgColor: 'bg-accent-DEFAULT/10', description: 'Ôn tập với SRS' },
    { view: View.Shadowing, title: 'Shadowing', icon: MicrophoneIcon, badge: 'Mới!', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', description: 'Luyện nói theo người bản xứ' },
    { view: View.AIConversation, title: 'AI Conversation', icon: AIConversationIcon, badge: 'Mới!', color: 'text-sky-500', bgColor: 'bg-sky-500/10', description: 'Practice speaking with an AI partner' },
    { view: View.Translator, title: 'AI Translator', icon: TranslateIcon, badge: 'Mới!', color: 'text-rose-500', bgColor: 'bg-rose-500/10', description: 'Dịch Anh-Việt & Việt-Anh' },
    { view: View.Review, title: 'Ôn Tập', icon: ReviewIcon, badge: 'Nâng cao', color: 'text-green-500', bgColor: 'bg-green-500/10', description: 'Kiểm tra & Luyện tập' },
    { view: View.MyLessons, title: 'Bài Học Của Tôi', icon: BookIcon, badge: `${customLessons.length} bài`, color: 'text-violet-500', bgColor: 'bg-violet-500/10', description: 'Tạo bài học riêng' },
  ], [stats, customLessons.length, allWords.length, allSentences.length]);

  const renderView = () => {
    switch (view) {
      case View.Home:
        return <HomeView stats={stats} features={features} onNavigate={handleNavigate} />;
      case View.MyLessons:
        return <MyLessonsView customLessons={customLessons} onNavigate={handleNavigate} onDeleteLesson={handleDeleteLesson} />;
      case View.LessonDetail:
        return <LessonDetailView lessonId={selectedLessonId} customLessons={customLessons} allWords={allWords} onNavigate={handleNavigate} playAudio={playAudio} currentlyPlayingUrl={currentlyPlayingUrl} playbackSpeed={playbackSpeed} setPlaybackSpeed={setPlaybackSpeed} />;
      case View.Vocabulary:
        return <VocabularyView 
                    words={allWords} 
                    onNavigate={handleNavigate}
                    playAudio={playAudio} 
                    currentlyPlayingUrl={currentlyPlayingUrl}
                    editorContext={lessonEditorContext}
                    onAddLesson={handleAddLesson}
                    onUpdateLesson={handleUpdateLesson}
                    setLessonEditorContext={setLessonEditorContext}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                    onAddWord={() => setShowAddWordModal(true)}
                    onDeleteWord={handleDeleteWord}
                    onUpdateWord={handleUpdateWord}
                />;
      case View.Sentences:
        return <SentencesView 
                    sentences={allSentences} 
                    conversations={[...customConversations, ...CONVERSATIONS_FULL]}
                    onNavigate={handleNavigate} 
                    playAudio={playAudio} 
                    currentlyPlayingUrl={currentlyPlayingUrl} 
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                    onAddConversation={handleAddConversation}
                    onDeleteConversation={handleDeleteConversation}
                    onAddSentence={() => setShowAddSentenceModal(true)}
                    onDeleteSentence={handleDeleteSentence}
                    onUpdateSentence={handleUpdateSentence}
                 />;
       case View.Flashcards:
        return <FlashcardView 
                    onNavigate={handleNavigate}
                    playAudio={playAudio} 
                    currentlyPlayingUrl={currentlyPlayingUrl} 
                    practiceContext={practiceContext}
                    customLessons={customLessons}
                    allWords={allWords}
                    allSentences={allSentences}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                />;
       case View.Review:
        return <ReviewView onNavigate={handleNavigate} customLessons={customLessons} />;
       case View.QuickCheck:
        return <QuickCheckView onNavigate={handleNavigate} allWords={allWords} />;
       case View.SentencePractice:
        return <SentencePracticeView onNavigate={handleNavigate} practiceContext={practiceContext} customLessons={customLessons} allWords={allWords} />;
       case View.FillInTheBlank:
        return <FillInTheBlankView onNavigate={handleNavigate} practiceContext={practiceContext} allWords={allWords} />;
       case View.ListeningPractice:
       case View.Listening:
        return <ListeningPracticeView onNavigate={handleNavigate} practiceContext={practiceContext} allWords={allWords} playAudio={playAudio} currentlyPlayingUrl={currentlyPlayingUrl} playbackSpeed={playbackSpeed} setPlaybackSpeed={setPlaybackSpeed} />;
      case View.AITutor:
        return <AITutorView onNavigate={handleNavigate} />;
      case View.AIConversation:
        return <AIConversationView onNavigate={handleNavigate} />;
      case View.Shadowing:
        return <ShadowingView 
                    onNavigate={handleNavigate} 
                    words={allWords} 
                    sentences={allSentences} 
                    playAudio={playAudio}
                    currentlyPlayingUrl={currentlyPlayingUrl}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                />;
      case View.Translator:
        return <TranslatorView onNavigate={handleNavigate} playAudio={playAudio} currentlyPlayingUrl={currentlyPlayingUrl} />;
      default:
        const currentFeature = features.find(f => f.view === view) || { title: "ZenGlish" };
        return <PlaceholderView featureName={currentFeature.title} onNavigate={() => handleNavigate(View.Home)} />;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-light-bg dark:bg-dark-bg text-gray-800 dark:text-gray-100 selection:bg-primary/20">
      <Header stats={stats} toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
      <main className="pb-24 pt-20">
        {renderView()}
      </main>
      <BottomNav currentView={view} onNavigate={setView} />
      {showAddWordModal && (
          <AddWordModal
              onClose={() => setShowAddWordModal(false)}
              onAddWord={handleAddWord}
          />
      )}
       {showAddSentenceModal && (
          <AddSentenceModal
              onClose={() => setShowAddSentenceModal(false)}
              onAddSentence={handleAddSentence}
          />
      )}
      <button onClick={() => setView(View.AITutor)} className="fixed bottom-24 right-4 w-16 h-16 bg-primary shadow-lg rounded-full flex items-center justify-center text-white hover:bg-primary-light transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/50 z-50" aria-label="Open AI Tutor">
          <AITutorIcon className="w-8 h-8" />
      </button>
    </div>
  );
};

// FIX: Add default export for App component to resolve import error in index.tsx
export default App;

// --- SUB-COMPONENTS ---

interface AudioProps {
    playAudio: (url: string | undefined, speed?: number) => void;
    currentlyPlayingUrl: string | null;
}

const Header: React.FC<{ stats: UserStats, toggleDarkMode: () => void, darkMode: boolean }> = ({ stats, toggleDarkMode, darkMode }) => (
  <header className="p-4 bg-gradient-to-r from-primary to-secondary-dark text-white shadow-lg flex justify-between items-center fixed top-0 left-0 right-0 z-40 h-20">
    <h1 className="text-3xl font-bold">ZenGlish</h1>
    <div className="flex items-center space-x-2 sm:space-x-4">
      <div className="hidden sm:flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full font-semibold">
        <span>🔥</span>
        <span>{stats.streak}</span>
      </div>
      <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
        {darkMode ? <LightIcon className="w-6 h-6"/> : <DarkIcon className="w-6 h-6"/>}
      </button>
      <button className="relative p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Notifications">
        <NotificationIcon className="w-6 h-6" />
        <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-amber-400 border-2 border-primary"></span>
      </button>
      <UserAvatarIcon className="w-9 h-9" />
    </div>
  </header>
);

const PageHeader: React.FC<{ title: string, onBack: () => void, rightContent?: React.ReactNode }> = ({ title, onBack, rightContent }) => (
    <div className="flex justify-between items-center mb-4 relative h-8">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light font-semibold transition-colors absolute left-0 top-1/2 -translate-y-1/2">
            <BackIcon className="w-6 h-6" />
            <span className="hidden sm:inline">Back</span>
        </button>
        <h2 className="text-xl font-bold text-center w-full">{title}</h2>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">{rightContent}</div>
    </div>
);

const HomeView: React.FC<{ 
    stats: UserStats, 
    features: FeatureCard[], 
    onNavigate: NavigateFn,
}> = ({ stats, features, onNavigate }) => {
    const dueReviews = srsService.getReviewQueue().length;
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 p-6 bg-white dark:bg-dark-card rounded-2xl shadow-md animate-fade-in-up">
                    <h2 className="text-3xl font-bold mb-1">Welcome back, {stats.name}!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Your progress is awesome. Keep it up!</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                        <div className="flex flex-col">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Today's Focus</h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <ReviewIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{dueReviews} items</p>
                                        <p className="text-xs text-gray-500">Ready for review</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                                        <VocabularyIcon className="w-6 h-6 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="font-bold">{stats.wordsToday} words</p>
                                        <p className="text-xs text-gray-500">Learned today</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <button onClick={() => onNavigate(View.Flashcards, { practice: { mode: 'all', lessonId: null, originView: View.Home } })} 
                                    disabled={dueReviews === 0}
                                    className="w-full h-full bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-light transition-all transform hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:scale-100 disabled:cursor-not-allowed flex flex-col items-center justify-center text-center p-4">
                                <span className="text-lg">Start Review</span>
                                <span className="text-sm font-normal">({dueReviews} cards due)</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {features.map((feature, index) => (
                        <button key={feature.title} onClick={() => onNavigate(feature.view)} 
                                className="bg-white dark:bg-dark-card rounded-2xl shadow-md p-5 text-left transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:ring-2 hover:ring-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 group animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}>
                            <div className="flex flex-col h-full">
                                <div className="flex justify-between items-start">
                                    <feature.icon className={`w-9 h-9 mb-3 ${feature.color} transition-transform group-hover:scale-110`} />
                                    {feature.badge && <span className="text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light px-2.5 py-1 rounded-full">{feature.badge}</span>}
                                </div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white mt-1">{feature.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex-grow mt-1">{feature.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
};

const AddSentenceModal: React.FC<{
    onClose: () => void;
    onAddSentence: (sentence: string, meaning: string, category: string) => Promise<{ success: boolean; error?: string }>;
}> = ({ onClose, onAddSentence }) => {
    const [sentence, setSentence] = useState('');
    const [meaning, setMeaning] = useState('');
    const [category, setCategory] = useState('Custom');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!sentence.trim() || !meaning.trim()) {
            setError('Sentence and meaning cannot be empty.');
            return;
        }
        setIsLoading(true);
        setError(null);

        const result = await onAddSentence(sentence.trim(), meaning.trim(), category.trim() || 'Custom');
        
        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'An unknown error occurred.');
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-center">Add Custom Sentence</h2>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4">
                    <textarea
                        value={sentence}
                        onChange={(e) => setSentence(e.target.value)}
                        placeholder="English Sentence (e.g., 'The early bird catches the worm.')"
                        rows={3}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none resize-y"
                    />
                    <input
                        type="text"
                        value={meaning}
                        onChange={(e) => setMeaning(e.target.value)}
                        placeholder="Vietnamese Meaning (e.g., 'Trâu chậm uống nước đục.')"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                    />
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Category (optional, e.g., 'Proverb')"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} className="w-full py-3 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isLoading} className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:bg-gray-400 flex items-center justify-center">
                        {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Analyze & Add Sentence'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddWordModal: React.FC<{
    onClose: () => void;
    onAddWord: (word: string, meaning: string, example: string) => Promise<{ success: boolean; error?: string }>;
}> = ({ onClose, onAddWord }) => {
    const [word, setWord] = useState('');
    const [meaning, setMeaning] = useState('');
    const [example, setExample] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!word.trim() || !meaning.trim()) {
            setError('Word and meaning cannot be empty.');
            return;
        }
        setIsLoading(true);
        setError(null);

        const result = await onAddWord(word.trim(), meaning.trim(), example.trim());
        
        if (result.success) {
            onClose();
        } else {
            setError(result.error || 'An unknown error occurred.');
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-center">Add Custom Word</h2>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4">
                    <input
                        type="text"
                        value={word}
                        onChange={(e) => setWord(e.target.value)}
                        placeholder="English Word (e.g., 'serendipity')"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                    />
                    <input
                        type="text"
                        value={meaning}
                        onChange={(e) => setMeaning(e.target.value)}
                        placeholder="Vietnamese Meaning (e.g., 'sự tình cờ may mắn')"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                    />
                    <textarea
                        value={example}
                        onChange={(e) => setExample(e.target.value)}
                        placeholder="Example Sentence (optional, AI can create one)"
                        rows={3}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none resize-y"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} className="w-full py-3 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isLoading} className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:bg-gray-400 flex items-center justify-center">
                        {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Analyze & Add Word'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const MyLessonsView: React.FC<{
    customLessons: CustomLesson[],
    onNavigate: NavigateFn,
    onDeleteLesson: (lessonId: string) => void,
}> = ({ customLessons, onNavigate, onDeleteLesson }) => {
    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title="My Lessons" onBack={() => onNavigate(View.Home)} />
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Your Custom Lessons</h3>
                        <button onClick={() => onNavigate(View.Vocabulary, { editor: { mode: 'new', lesson: null } })} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-light transition-colors text-sm">
                            Create New
                        </button>
                    </div>
                    {customLessons.length > 0 ? (
                        <div className="space-y-3">
                             {customLessons.map(lesson => (
                                <button key={lesson.id} onClick={() => onNavigate(View.LessonDetail, { lessonId: lesson.id })} className="w-full text-left p-4 bg-light-bg dark:bg-dark-bg rounded-xl flex flex-wrap items-center justify-between gap-3 hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors">
                                    <div className="flex-grow">
                                        <h3 className="text-lg font-bold">{lesson.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{lesson.description || 'No description provided.'}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{lesson.vocabularyIds.length} words · Created {new Date(lesson.createdDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button onClick={(e) => { e.stopPropagation(); onNavigate(View.Vocabulary, { editor: { mode: 'edit', lesson } }) }} className="p-2.5 rounded-lg hover:bg-accent/20 transition-colors" aria-label={`Edit ${lesson.name}`}><svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 14a1 1 0 11-2 0 1 1 0 012 0zM3 13a1 1 0 00-1 1v2a1 1 0 001 1h12a1 1 0 001-1v-2a1 1 0 00-1-1H3z"></path></svg></button>
                                        <button onClick={(e) => { e.stopPropagation(); onDeleteLesson(lesson.id) }} className="p-2.5 rounded-lg hover:bg-red-500/20 transition-colors" aria-label={`Delete ${lesson.name}`}>
                                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                          </svg>
                                        </button>
                                    </div>
                                </button>
                             ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                            <p className="text-gray-500 dark:text-gray-400">You haven't created any lessons yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LessonDetailView: React.FC<{
    lessonId: string | null;
    customLessons: CustomLesson[];
    allWords: Word[];
    onNavigate: NavigateFn;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
} & AudioProps> = ({ lessonId, customLessons, allWords, onNavigate, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed }) => {
    
    const lesson = useMemo(() => customLessons.find(l => l.id === lessonId), [customLessons, lessonId]);
    const lessonWords = useMemo(() => {
        if (!lesson) return [];
        const wordIdSet = new Set(lesson.vocabularyIds);
        return allWords.filter(w => wordIdSet.has(w.id));
    }, [lesson, allWords]);
    const [wordToPractice, setWordToPractice] = useState<Word | null>(null);


    if (!lesson) {
        return (
            <div className="p-4 sm:p-6 text-center">
                <PageHeader title="Error" onBack={() => onNavigate(View.MyLessons)} />
                <p>Lesson not found. It might have been deleted.</p>
            </div>
        );
    }
    
    const practiceModes = [
        { view: View.Flashcards, label: 'Flashcard Practice', icon: FlashcardIcon, description: "Lật thẻ xem từ/câu và nghĩa" },
        { view: View.SentencePractice, label: 'Sentence Practice', icon: AITutorIcon, description: "Đặt câu với từ vựng trong bài" },
        { view: View.FillInTheBlank, label: 'Fill in the Blank', icon: GrammarIcon, description: "Điền từ vào chỗ trống" },
        { view: View.ListeningPractice, label: 'Listening Practice', icon: ListeningIcon, description: "Nghe và chọn từ đúng" },
    ];
    
    const [activeTab, setActiveTab] = useState('practice');

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title={lesson.name} onBack={() => onNavigate(View.MyLessons)} />
                {lesson.description && <p className="text-center text-gray-500 dark:text-gray-400 -mt-2 mb-4 px-4">{lesson.description}</p>}

                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 p-2">
                        <button onClick={() => setActiveTab('practice')} className={`w-1/2 py-2.5 font-semibold rounded-lg transition-colors ${activeTab === 'practice' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Practice</button>
                        <button onClick={() => setActiveTab('content')} className={`w-1/2 py-2.5 font-semibold rounded-lg transition-colors ${activeTab === 'content' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>View Content</button>
                    </div>

                    <div className="p-4 sm:p-6">
                        {activeTab === 'practice' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {practiceModes.map(mode => (
                                    <button
                                        key={mode.label}
                                        onClick={() => onNavigate(mode.view, { practice: { mode: 'custom', lessonId: lesson.id, originView: View.LessonDetail } })}
                                        className="flex items-center gap-4 p-4 bg-light-bg dark:bg-dark-bg rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors text-left"
                                    >
                                        <mode.icon className="w-10 h-10 text-primary flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-lg">{mode.label}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{mode.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {activeTab === 'content' && (
                            <div className="space-y-3 max-h-[65vh] overflow-y-auto">
                                {lessonWords.length > 0 ? lessonWords.map(word => (
                                     <div key={word.id} className="p-4 bg-light-bg dark:bg-dark-bg rounded-xl">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-lg font-bold">{word.word} <span className="text-base font-normal text-gray-500 dark:text-gray-400">{word.ipa}</span></h3>
                                                <p className="text-gray-600 dark:text-gray-300">{word.meaning}</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                 <button onClick={() => setWordToPractice(word)} className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={`Check pronunciation of ${word.word}`}>
                                                    <MicrophoneIcon className="w-6 h-6 text-emerald-500" />
                                                </button>
                                                <PlaybackSpeedControl currentSpeed={playbackSpeed} onSpeedChange={setPlaybackSpeed} />
                                                <button onClick={() => playAudio(word.audioUrl, playbackSpeed)} className={`p-3 rounded-full transition-colors ${currentlyPlayingUrl === word.audioUrl ? 'bg-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                                    <SpeakerIcon className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 border-l-4 border-primary/50 pl-3">
                                            <p>"{word.example.en}"</p>
                                            <p className="italic">"{word.example.vi}"</p>
                                        </div>
                                    </div>
                                )) : (
                                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">This lesson has no words. You can add words by editing the lesson.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
             {wordToPractice && (
                <PronunciationPracticeModal
                    targetText={wordToPractice.word}
                    ipa={wordToPractice.ipa}
                    audioUrl={wordToPractice.audioUrl}
                    onClose={() => setWordToPractice(null)}
                    playAudio={playAudio}
                    currentlyPlayingUrl={currentlyPlayingUrl}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                />
            )}
        </div>
    );
};


const useAudioRecorderAndVisualizer = (config?: { continuous?: boolean; interimResults?: boolean }) => {
    const [isInitializing, setIsInitializing] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [finalTranscript, setFinalTranscript] = useState('');
    const [recognitionError, setRecognitionError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const hasRecognitionSupport = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    const stopAudioProcessing = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(console.error);
            audioContextRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!hasRecognitionSupport) {
            console.error("Speech Recognition API is not supported in this browser.");
            return;
        }

        const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition: SpeechRecognition = new SpeechRecognitionAPI();
        recognition.lang = 'en-US';
        recognition.continuous = config?.continuous ?? false;
        recognition.interimResults = config?.interimResults ?? true;

        recognition.onstart = () => {
            setIsInitializing(false);
            setIsListening(true);
            setTranscript('');
            setFinalTranscript('');
        };

        recognition.onend = () => {
            setIsInitializing(false);
            setIsListening(false);
            stopAudioProcessing();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error, event.message);
            if (event.error === 'no-speech') {
                setRecognitionError("I didn't hear you. Please make sure your microphone is unmuted and try again.");
            } else if (event.error === 'audio-capture') {
                setRecognitionError("Couldn't capture audio. Check microphone permissions.");
            } else if (event.error === 'not-allowed') {
                setRecognitionError("Microphone access denied. Please allow it in browser settings.");
            } else {
                setRecognitionError(`An error occurred: ${event.error}. Please try again.`);
            }
            setIsInitializing(false);
            setIsListening(false);
            stopAudioProcessing();
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscriptResult = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscriptResult += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            
            if (recognition.continuous) {
                setTranscript(prev => prev + interimTranscript);
            } else {
                 setTranscript(interimTranscript);
            }

            if (finalTranscriptResult) {
                setFinalTranscript(prev => prev + finalTranscriptResult);
                if (!recognition.continuous) {
                  setTranscript(finalTranscriptResult);
                }
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.onstart = null;
                recognitionRef.current.onend = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.onresult = null;
                try {
                    recognitionRef.current.stop();
                } catch(e) { /* ignore */ }
            }
            stopAudioProcessing();
        };
    }, [hasRecognitionSupport, stopAudioProcessing, config?.continuous, config?.interimResults]);


    const startListening = useCallback(async () => {
        if (recognitionRef.current && !isListening && !isInitializing) {
            setRecognitionError(null);
            setTranscript('');
            setFinalTranscript('');
            setIsInitializing(true);
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                streamRef.current = stream;

                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                audioContextRef.current = audioContext;
                
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 2048;
                analyserRef.current = analyser;

                const source = audioContext.createMediaStreamSource(stream);
                mediaStreamSourceRef.current = source;
                source.connect(analyser);

                recognitionRef.current.start();
            } catch (err) {
                console.error("Error accessing microphone:", err);
                setRecognitionError("Could not access the microphone. Please check browser permissions.");
                setIsInitializing(false);
            }
        }
    }, [isListening, isInitializing]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && (isListening || isInitializing)) {
            recognitionRef.current.stop();
        }
    }, [isListening, isInitializing]);

    const effectiveTranscript = recognitionRef.current?.continuous ? finalTranscript + transcript : finalTranscript || transcript;

    return {
        isInitializing,
        isListening,
        transcript: effectiveTranscript,
        finalTranscript,
        startListening,
        stopListening,
        hasRecognitionSupport,
        analyser: analyserRef.current,
        recognitionError,
    };
};

const VolumeMeter: React.FC<{ analyser: AnalyserNode | null, isListening: boolean }> = ({ analyser, isListening }) => {
    const [volume, setVolume] = useState(0);

    useEffect(() => {
        if (!analyser) return;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let animationFrameId: number;

        const draw = () => {
            animationFrameId = requestAnimationFrame(draw);
            
            if (!isListening) {
                if (volume !== 0) setVolume(0);
                return;
            }

            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            setVolume(average);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [analyser, isListening, volume]);

    const meterHeight = Math.min(Math.floor(volume * 1.5), 100);

    return (
        <div className="w-24 h-24 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex items-end p-1" aria-hidden="true">
            <div 
                className="w-full bg-gradient-to-t from-green-400 to-emerald-500 rounded-md transition-all duration-100"
                style={{ height: `${meterHeight}%` }}
             ></div>
        </div>
    );
};


const CircularProgress: React.FC<{ score: number, size?: number }> = ({ score, size = 120 }) => {
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    const scoreColor = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-amber-500' : 'text-red-500';
    const ringColor = score >= 80 ? 'stroke-green-500' : score >= 50 ? 'stroke-amber-500' : 'stroke-red-500';
    const fontSize = size >= 100 ? 'text-3xl' : 'text-2xl';

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="w-full h-full">
                <circle
                    className="stroke-gray-200 dark:stroke-gray-600"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={`${ringColor} transition-all duration-500 ease-in-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
            </svg>
            <span className={`absolute ${fontSize} font-bold ${scoreColor}`}>
                {score}
            </span>
        </div>
    );
};

const PronunciationPracticeModal: React.FC<{
    targetText: string;
    ipa: string;
    audioUrl?: string;
    onClose: () => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
} & AudioProps> = ({ targetText, ipa, audioUrl, onClose, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed }) => {
    const { isInitializing, isListening, transcript, finalTranscript, startListening, stopListening, hasRecognitionSupport, analyser, recognitionError } = useAudioRecorderAndVisualizer();
    const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        if (finalTranscript && !isListening && !isInitializing) {
            const check = async () => {
                setIsChecking(true);
                const result = await geminiService.checkPronunciation(targetText, finalTranscript);
                setFeedback(result);
                setIsChecking(false);
            };
            check();
        }
    }, [finalTranscript, isListening, isInitializing, targetText]);
    
    const handleStart = () => {
        setFeedback(null);
        startListening();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-center">Pronunciation Practice</h2>
                <div className="p-4 bg-primary/10 rounded-lg text-center mb-4">
                    <div className="flex justify-center items-center gap-2">
                        <h3 className="text-3xl font-bold text-primary dark:text-primary-light">{targetText}</h3>
                        <button onClick={() => playAudio(audioUrl, playbackSpeed)} className={`p-2 rounded-full transition-colors ${currentlyPlayingUrl === audioUrl ? 'bg-primary text-white' : 'hover:bg-primary/20'}`}>
                           <SpeakerIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{ipa}</p>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-4">
                        <VolumeMeter analyser={analyser} isListening={isListening} />
                        {feedback && !feedback.isError && (
                            <div className="text-center">
                                <p className="font-semibold mb-2">Your Score:</p>
                                <CircularProgress score={feedback.score} />
                            </div>
                        )}
                    </div>
                    {isChecking && <p className="text-center text-gray-500">Analyzing your speech...</p>}
                    {recognitionError && <p className="text-red-500 text-sm text-center my-2">{recognitionError}</p>}
                    {transcript && <p className="text-center text-gray-600 dark:text-gray-300 my-2">You said: <span className="font-semibold">{transcript}</span></p>}
                    
                    {feedback && !feedback.isError && (
                        <div className="space-y-3 mt-4 animate-fade-in">
                           <p className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">{feedback.feedback}</p>
                           {feedback.phoneticFeedback && feedback.phoneticFeedback.length > 0 && (
                                <div className="p-3 bg-red-500/10 rounded-lg">
                                    <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Phonetic Tips:</h4>
                                    <ul className="space-y-2 text-sm">
                                        {feedback.phoneticFeedback.map((item, i) => (
                                            <li key={i}>For <strong>{item.word}</strong>, you said <span className="font-mono bg-red-200/50 dark:bg-red-800/50 px-1 rounded">{item.userPhoneme}</span> instead of <span className="font-mono bg-green-200/50 dark:bg-green-800/50 px-1 rounded">{item.correctPhoneme}</span>. {item.suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                           )}
                           {feedback.rhythmAndIntonationFeedback && (Object.values(feedback.rhythmAndIntonationFeedback).some(v => v)) && (
                                <div className="p-3 bg-sky-500/10 rounded-lg">
                                    <h4 className="font-bold text-sky-600 dark:text-sky-400 mb-2">Prosody Feedback:</h4>
                                    <ul className="space-y-1 text-sm list-disc list-inside">
                                        {feedback.rhythmAndIntonationFeedback.rhythm && <li><strong>Rhythm:</strong> {feedback.rhythmAndIntonationFeedback.rhythm}</li>}
                                        {feedback.rhythmAndIntonationFeedback.intonation && <li><strong>Intonation:</strong> {feedback.rhythmAndIntonationFeedback.intonation}</li>}
                                        {feedback.rhythmAndIntonationFeedback.wordStress && <li><strong>Word Stress:</strong> {feedback.rhythmAndIntonationFeedback.wordStress}</li>}
                                    </ul>
                                </div>
                           )}
                           {feedback.linkingFeedback && (
                                <div className="p-3 bg-violet-500/10 rounded-lg">
                                    <h4 className="font-bold text-violet-600 dark:text-violet-400 mb-2">Linking Sounds:</h4>
                                    <p className="text-sm">{feedback.linkingFeedback}</p>
                                </div>
                           )}
                            {feedback.suggestions && feedback.suggestions.length > 0 && (
                                <div className="p-3 bg-amber-500/10 rounded-lg">
                                    <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-2">Suggestions for Improvement:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        {feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                           )}
                        </div>
                    )}
                     {feedback && feedback.isError && (
                        <p className="text-center text-red-500 bg-red-500/10 p-3 rounded-lg">{feedback.feedback}</p>
                    )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} className="w-full py-3 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Close
                    </button>
                    <button 
                        onClick={isListening ? stopListening : handleStart}
                        disabled={!hasRecognitionSupport || isChecking || isInitializing}
                        className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:bg-gray-400 flex items-center justify-center"
                    >
                         {isInitializing ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Preparing Mic...
                            </div>
                        ) : isListening ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                Listening... Speak now!
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <MicrophoneIcon className="w-5 h-5" />
                                {feedback ? 'Try Again' : 'Start Recording'}
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SentenceListItem: React.FC<{
    sentence: Sentence;
    onUpdateSentence: (sentence: Sentence) => void;
    onDeleteSentence: (id: number) => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
    onPractice: (sentence: Sentence) => void;
} & AudioProps> = ({ sentence, onUpdateSentence, onDeleteSentence, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed, onPractice }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [refinedMeaning, setRefinedMeaning] = useState<string | null>(null);
    const [refineError, setRefineError] = useState<string | null>(null);


    const toggleDetails = async () => {
        const newShowDetails = !showDetails;
        setShowDetails(newShowDetails);
        if (newShowDetails && !explanation) {
            setIsLoadingExplanation(true);
            const expl = await geminiService.generateGrammarExplanation(sentence.sentence);
            setExplanation(expl);
            setIsLoadingExplanation(false);
        }
    };
    
    const handleRefine = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRefining(true);
        setRefineError(null);
        const result = await geminiService.refineVietnameseMeaning(sentence.sentence, sentence.meaning);
        if (result.refinedMeaning) {
            setRefinedMeaning(result.refinedMeaning);
        } else {
            setRefineError(result.error || "Failed to refine meaning.");
        }
        setIsRefining(false);
    };

    const handleAcceptRefinement = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (refinedMeaning) {
            onUpdateSentence({ ...sentence, meaning: refinedMeaning });
        }
        setRefinedMeaning(null);
    };

    const handleCancelRefinement = (e: React.MouseEvent) => {
        e.stopPropagation();
        setRefinedMeaning(null);
        setRefineError(null);
    };

    return (
        <div onClick={toggleDetails} className="p-4 bg-light-bg dark:bg-dark-bg rounded-xl cursor-pointer transition-all duration-300 hover:bg-primary/10 dark:hover:bg-primary/20">
            <div className="flex justify-between items-start">
                <div className="flex-grow pr-2">
                    <p className="font-semibold text-lg">{sentence.sentence}</p>
                    <p className="text-gray-500 dark:text-gray-400">{sentence.meaning}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onPractice(sentence); }} 
                        className="p-3 rounded-full hover:bg-emerald-500/10 transition-colors" 
                        aria-label={`Practice pronunciation for: ${sentence.sentence}`}
                    >
                        <MicrophoneIcon className="w-6 h-6 text-emerald-500" />
                    </button>
                    <PlaybackSpeedControl currentSpeed={playbackSpeed} onSpeedChange={setPlaybackSpeed} />
                    <button onClick={(e) => { e.stopPropagation(); playAudio(sentence.audioUrl, playbackSpeed); }} className={`p-3 rounded-full transition-colors ${currentlyPlayingUrl === sentence.audioUrl ? 'bg-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        <SpeakerIcon className="w-6 h-6" />
                    </button>
                    {sentence.isCustom && (
                        <button onClick={(e) => { e.stopPropagation(); onDeleteSentence(sentence.id); }} className="p-3 rounded-full hover:bg-red-500/10 transition-colors" aria-label="Delete sentence">
                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                </div>
            </div>
            
             {sentence.isCustom && !refinedMeaning && (
                 <div className="mt-2">
                    <button 
                        onClick={handleRefine} 
                        disabled={isRefining}
                        className="px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        {isRefining ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : <AITutorIcon className="w-3 h-3" />}
                        {isRefining ? 'Refining...' : 'AI Refine'}
                    </button>
                 </div>
            )}
            
            {refinedMeaning && (
                 <div className="mt-3 p-3 bg-amber-500/10 rounded-lg text-sm animate-fade-in">
                    <p className="font-semibold mb-1">Suggestion:</p>
                    <p className="text-amber-800 dark:text-amber-200">"{refinedMeaning}"</p>
                    <div className="mt-2 flex gap-2">
                         <button onClick={handleAcceptRefinement} className="px-2 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600">Accept</button>
                         <button onClick={handleCancelRefinement} className="px-2 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
                    </div>
                </div>
            )}
             {refineError && <p className="text-red-500 text-xs mt-2">{refineError}</p>}

            {showDetails && (
                 <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3 animate-fade-in text-sm">
                    {isLoadingExplanation && <p className="text-gray-500">Loading grammar tips...</p>}
                    {explanation && (
                        <div>
                            <h4 className="font-bold mb-1 flex items-center gap-2"><InfoIcon className="w-5 h-5 text-secondary" /> Grammar Tip</h4>
                            <p className="pl-4 text-gray-600 dark:text-gray-300">{explanation}</p>
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
};

const WordListItem: React.FC<{
    word: Word;
    onUpdateWord: (word: Word) => void;
    onDeleteWord: (id: number) => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
} & AudioProps> = ({ word, onUpdateWord, onDeleteWord, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed }) => {
    const [showDetails, setShowDetails] = useState(false);
    const [details, setDetails] = useState<WordDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [isRefining, setIsRefining] = useState(false);
    const [refinedMeaning, setRefinedMeaning] = useState<string | null>(null);
    const [refineError, setRefineError] = useState<string | null>(null);


    const toggleDetails = async () => {
        const newShowDetails = !showDetails;
        setShowDetails(newShowDetails);
        if (newShowDetails && !details) {
            setIsLoadingDetails(true);
            setError(null);
            const result = await geminiService.getWordDetails(word.word);
            if (result.details) {
                setDetails(result.details);
            } else {
                setError(result.error || "Failed to load details.");
            }
            setIsLoadingDetails(false);
        }
    };
    
    const handleRefine = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsRefining(true);
        setRefineError(null);
        const result = await geminiService.refineVietnameseWordMeaning(word.word, word.meaning);
        if (result.refinedMeaning) {
            setRefinedMeaning(result.refinedMeaning);
        } else {
            setRefineError(result.error || "Failed to refine meaning.");
        }
        setIsRefining(false);
    };

    const handleAcceptRefinement = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (refinedMeaning) {
            onUpdateWord({ ...word, meaning: refinedMeaning });
        }
        setRefinedMeaning(null);
    };
    
     const handleCancelRefinement = (e: React.MouseEvent) => {
        e.stopPropagation();
        setRefinedMeaning(null);
        setRefineError(null);
    };

    const DetailSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <div>
            <h4 className="font-bold text-primary dark:text-primary-light mb-1">{title}</h4>
            <div className="pl-4 text-gray-600 dark:text-gray-300 text-sm">{children}</div>
        </div>
    );

    return (
        <div onClick={toggleDetails} className="p-4 bg-light-bg dark:bg-dark-bg rounded-xl cursor-pointer transition-all duration-300 hover:bg-primary/10 dark:hover:bg-primary/20">
            <div className="flex justify-between items-start">
                <div className="flex-grow pr-2">
                    <h3 className="font-bold text-lg">{word.word} <span className="text-base font-normal text-gray-500 dark:text-gray-400">{word.ipa}</span></h3>
                    <p className="text-gray-500 dark:text-gray-400">{word.meaning}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <PlaybackSpeedControl currentSpeed={playbackSpeed} onSpeedChange={setPlaybackSpeed} />
                    <button onClick={(e) => { e.stopPropagation(); playAudio(word.audioUrl, playbackSpeed); }} className={`p-3 rounded-full transition-colors ${currentlyPlayingUrl === word.audioUrl ? 'bg-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                        <SpeakerIcon className="w-6 h-6" />
                    </button>
                    {word.isCustom && (
                        <button onClick={(e) => { e.stopPropagation(); onDeleteWord(word.id); }} className="p-3 rounded-full hover:bg-red-500/10 transition-colors" aria-label="Delete word">
                            <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    )}
                </div>
            </div>
            
            {word.isCustom && !refinedMeaning && (
                 <div className="mt-2">
                    <button 
                        onClick={handleRefine} 
                        disabled={isRefining}
                        className="px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        {isRefining ? <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div> : <AITutorIcon className="w-3 h-3" />}
                        {isRefining ? 'Refining...' : 'AI Refine'}
                    </button>
                 </div>
            )}
            
            {refinedMeaning && (
                 <div className="mt-3 p-3 bg-amber-500/10 rounded-lg text-sm animate-fade-in">
                    <p className="font-semibold mb-1">Suggestion:</p>
                    <p className="text-amber-800 dark:text-amber-200">"{refinedMeaning}"</p>
                    <div className="mt-2 flex gap-2">
                         <button onClick={handleAcceptRefinement} className="px-2 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600">Accept</button>
                         <button onClick={handleCancelRefinement} className="px-2 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600">Cancel</button>
                    </div>
                </div>
            )}
            {refineError && <p className="text-red-500 text-xs mt-2">{refineError}</p>}
            
            <div className="text-sm mt-2 text-gray-500 dark:text-gray-400 border-l-4 border-primary/50 pl-3">
                <p>"{word.example.en}"</p>
                <p className="italic">"{word.example.vi}"</p>
            </div>
             {showDetails && (
                 <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3 animate-fade-in space-y-3">
                    {isLoadingDetails && <p className="text-gray-500">Loading details...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {details && (
                        <>
                            <DetailSection title="Meaning">{details.englishMeaning}</DetailSection>
                            <DetailSection title="Usage">{details.usageContext}</DetailSection>
                            <DetailSection title="Example Suggestion">"{details.sentenceSuggestion}"</DetailSection>
                            {details.familyWords.length > 0 && <DetailSection title="Word Family">
                               <ul className="list-disc list-inside"> {details.familyWords.map(f => <li key={f.word}><strong>{f.word}</strong>: {f.meaning}</li>)}</ul>
                            </DetailSection>}
                            {details.synonyms.length > 0 && <DetailSection title="Synonyms">
                                <ul className="list-disc list-inside">{details.synonyms.map(s => <li key={s.word}><strong>{s.word}</strong>: {s.meaning}</li>)}</ul>
                            </DetailSection>}
                            {details.antonyms.length > 0 && <DetailSection title="Antonyms">
                                <ul className="list-disc list-inside">{details.antonyms.map(a => <li key={a.word}><strong>{a.word}</strong>: {a.meaning}</li>)}</ul>
                            </DetailSection>}
                        </>
                    )}
                 </div>
             )}
        </div>
    );
};

const VocabularyView: React.FC<{
    words: Word[];
    onNavigate: NavigateFn;
    editorContext: LessonEditorContext | null;
    onAddLesson: (name: string, description: string, wordIds: number[]) => void;
    onUpdateLesson: (lesson: CustomLesson) => void;
    setLessonEditorContext: (context: LessonEditorContext | null) => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
    onAddWord: () => void;
    onDeleteWord: (id: number) => void;
    onUpdateWord: (word: Word) => void;
} & AudioProps> = ({ words, onNavigate, playAudio, currentlyPlayingUrl, editorContext, onAddLesson, onUpdateLesson, setLessonEditorContext, playbackSpeed, setPlaybackSpeed, onAddWord, onDeleteWord, onUpdateWord }) => {
    
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<Level | 'all'>('all');
    
    // Lesson Editor State
    const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
    const [lessonName, setLessonName] = useState('');
    const [lessonDescription, setLessonDescription] = useState('');
    
    const isEditing = editorContext !== null;
    
    useEffect(() => {
        if (editorContext?.mode === 'edit' && editorContext.lesson) {
            setSelectedWords(new Set(editorContext.lesson.vocabularyIds));
            setLessonName(editorContext.lesson.name);
            setLessonDescription(editorContext.lesson.description);
        } else {
            setSelectedWords(new Set());
            setLessonName('');
            setLessonDescription('');
        }
    }, [editorContext]);

    const handleToggleWordSelection = (wordId: number) => {
        setSelectedWords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(wordId)) {
                newSet.delete(wordId);
            } else {
                newSet.add(wordId);
            }
            return newSet;
        });
    };
    
    const handleSaveLesson = () => {
        if (!lessonName.trim() || selectedWords.size === 0) {
            alert("Please provide a lesson name and select at least one word.");
            return;
        }
        
        if (editorContext?.mode === 'edit' && editorContext.lesson) {
            onUpdateLesson({
                ...editorContext.lesson,
                name: lessonName,
                description: lessonDescription,
                vocabularyIds: Array.from(selectedWords)
            });
        } else {
            onAddLesson(lessonName, lessonDescription, Array.from(selectedWords));
        }
        
        setLessonEditorContext(null);
    };

    const handleCancelEdit = () => {
        setLessonEditorContext(null);
    };
    
    const filteredWords = useMemo(() => {
        return words.filter(word => {
            const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  word.meaning.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLevel = levelFilter === 'all' || word.level === levelFilter;
            return matchesSearch && matchesLevel;
        }).sort((a,b) => a.word.localeCompare(b.word));
    }, [words, searchTerm, levelFilter]);
    
    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title={isEditing ? 'Lesson Editor' : 'Vocabulary'} onBack={() => onNavigate(View.Home)} />
                {!isEditing && (
                    <div className="sticky top-20 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-sm z-10 py-2 mb-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                placeholder="Search word or meaning..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                            />
                            <select
                                value={levelFilter}
                                onChange={e => setLevelFilter(e.target.value as Level | 'all')}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="all">All Levels</option>
                                {Object.values(Level).map(level => <option key={level} value={level}>{level}</option>)}
                            </select>
                            <button onClick={onAddWord} className="px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-sm hover:bg-secondary-light transition-colors text-sm whitespace-nowrap">
                                Add Word
                            </button>
                        </div>
                    </div>
                )}
                
                {isEditing && (
                    <div className="bg-white dark:bg-dark-card p-4 rounded-xl mb-4 shadow-lg sticky top-20 z-20 space-y-3">
                         <h3 className="text-lg font-bold">{editorContext.mode === 'edit' ? `Editing "${editorContext.lesson?.name}"` : 'Create New Lesson'}</h3>
                         <input 
                             type="text"
                             placeholder="Lesson Name"
                             value={lessonName}
                             onChange={(e) => setLessonName(e.target.value)}
                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg"
                         />
                         <textarea 
                             placeholder="Lesson Description (optional)"
                             value={lessonDescription}
                             onChange={(e) => setLessonDescription(e.target.value)}
                             rows={2}
                             className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg resize-y"
                         />
                         <div className="flex justify-between items-center">
                             <p className="font-semibold">{selectedWords.size} words selected</p>
                             <div className="flex gap-2">
                                <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                                <button onClick={handleSaveLesson} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light">Save Lesson</button>
                             </div>
                         </div>
                    </div>
                )}
                
                <div className="space-y-3">
                    {filteredWords.map(word => (
                        <div key={word.id} className="flex items-center gap-2">
                            {isEditing && (
                                <input
                                    type="checkbox"
                                    checked={selectedWords.has(word.id)}
                                    onChange={() => handleToggleWordSelection(word.id)}
                                    className="w-6 h-6 rounded text-primary focus:ring-primary/50"
                                />
                            )}
                            <div className="flex-grow">
                                <WordListItem 
                                    word={word} 
                                    playAudio={playAudio} 
                                    currentlyPlayingUrl={currentlyPlayingUrl} 
                                    playbackSpeed={playbackSpeed}
                                    setPlaybackSpeed={setPlaybackSpeed}
                                    onDeleteWord={onDeleteWord}
                                    onUpdateWord={onUpdateWord}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// FIX: Add missing TranslatorView component
const TranslatorView: React.FC<{ 
    onNavigate: NavigateFn;
} & AudioProps> = ({ onNavigate, playAudio, currentlyPlayingUrl }) => {
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLang, setSourceLang] = useState<'English' | 'Vietnamese'>('English');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const targetLang = sourceLang === 'English' ? 'Vietnamese' : 'English';

    const handleTranslate = async () => {
        if (!sourceText.trim()) return;
        setIsLoading(true);
        setError(null);
        setTranslatedText('');

        const result = await geminiService.translateText(sourceText, sourceLang, targetLang);
        if (result.translation) {
            setTranslatedText(result.translation);
        } else {
            setError(result.error || 'An unknown error occurred.');
        }
        setIsLoading(false);
    };

    const handleSwapLanguages = () => {
        setSourceLang(targetLang);
        const currentSource = sourceText;
        setSourceText(translatedText);
        setTranslatedText(currentSource);
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // maybe show a toast notification in a real app
        }).catch(err => console.error('Failed to copy text: ', err));
    };
    
    const handlePlayAudio = (text: string, lang: 'English' | 'Vietnamese') => {
        const langCode = lang === 'English' ? 'en' : 'vi';
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${langCode}&client=tw-ob`;
        playAudio(url);
    };


    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title="AI Translator" onBack={() => onNavigate(View.Home)} />
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6 space-y-4">
                    {/* Source Text Area */}
                    <div className="relative">
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder={`Enter ${sourceLang} text...`}
                            rows={5}
                            className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none resize-y"
                        />
                         <div className="absolute bottom-2 left-2 flex items-center gap-2">
                             <button onClick={() => handlePlayAudio(sourceText, sourceLang)} disabled={!sourceText.trim()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">
                                <SpeakerIcon className="w-5 h-5 text-gray-500" />
                            </button>
                             <button onClick={() => handleCopyToClipboard(sourceText)} disabled={!sourceText.trim()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">
                                <CopyIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                         <div className="font-semibold">{sourceLang}</div>
                        <button onClick={handleSwapLanguages} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <SwapIcon className="w-6 h-6 text-primary" />
                        </button>
                         <div className="font-semibold">{targetLang}</div>
                    </div>
                    
                    {/* Translated Text Area */}
                     <div className="relative">
                        <textarea
                            value={isLoading ? 'Translating...' : translatedText}
                            readOnly
                            placeholder={`Translation will appear here...`}
                            rows={5}
                            className="w-full p-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg outline-none resize-y"
                        />
                        <div className="absolute bottom-2 left-2 flex items-center gap-2">
                            <button onClick={() => handlePlayAudio(translatedText, targetLang)} disabled={!translatedText.trim()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">
                                <SpeakerIcon className="w-5 h-5 text-gray-500" />
                            </button>
                            <button onClick={() => handleCopyToClipboard(translatedText)} disabled={!translatedText.trim()} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">
                                <CopyIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <button onClick={handleTranslate} disabled={isLoading || !sourceText.trim()} className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 flex items-center justify-center">
                         {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Translate'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SentencesView: React.FC<{
    sentences: Sentence[],
    conversations: Conversation[],
    onNavigate: NavigateFn,
    playbackSpeed: number,
    setPlaybackSpeed: (speed: number) => void;
    onAddConversation: (conversation: Conversation) => void;
    onDeleteConversation: (id: string) => void;
    onAddSentence: () => void;
    onDeleteSentence: (id: number) => void;
    onUpdateSentence: (sentence: Sentence) => void;
} & AudioProps> = ({ sentences, conversations, onNavigate, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed, onAddConversation, onDeleteConversation, onAddSentence, onDeleteSentence, onUpdateSentence }) => {
    
    const [activeTab, setActiveTab] = useState('sentences');
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<Level | 'all'>('all');
    
    const [showAddConvoModal, setShowAddConvoModal] = useState(false);
    const [sentenceToPractice, setSentenceToPractice] = useState<Sentence | null>(null);
    
    const filteredSentences = useMemo(() => {
        return sentences.filter(s => {
            const matchesSearch = s.sentence.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  s.meaning.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLevel = levelFilter === 'all' || s.level === levelFilter;
            return matchesSearch && matchesLevel;
        });
    }, [sentences, searchTerm, levelFilter]);
    
    const filteredConversations = useMemo(() => {
         return conversations.filter(c => {
            const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLevel = levelFilter === 'all' || c.level === levelFilter;
            return matchesSearch && matchesLevel;
        });
    }, [conversations, searchTerm, levelFilter]);

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title="Sentences & Conversations" onBack={() => onNavigate(View.Home)} />
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 p-2">
                        <button onClick={() => setActiveTab('sentences')} className={`w-1/2 py-2.5 font-semibold rounded-lg transition-colors ${activeTab === 'sentences' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Sentences</button>
                        <button onClick={() => setActiveTab('conversations')} className={`w-1/2 py-2.5 font-semibold rounded-lg transition-colors ${activeTab === 'conversations' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Conversations</button>
                    </div>
                    
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <input
                                type="text"
                                placeholder={activeTab === 'sentences' ? "Search sentences..." : "Search conversations..."}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                            />
                            <select
                                value={levelFilter}
                                onChange={e => setLevelFilter(e.target.value as Level | 'all')}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="all">All Levels</option>
                                {Object.values(Level).map(level => <option key={level} value={level}>{level}</option>)}
                            </select>
                            <button 
                                onClick={activeTab === 'sentences' ? onAddSentence : () => setShowAddConvoModal(true)} 
                                className="px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-sm hover:bg-secondary-light transition-colors text-sm whitespace-nowrap"
                            >
                                {activeTab === 'sentences' ? 'Add Sentence' : 'Add Conversation'}
                            </button>
                        </div>
                        
                        <div className="space-y-3 max-h-[65vh] overflow-y-auto">
                            {activeTab === 'sentences' ? 
                                filteredSentences.map(s => <SentenceListItem key={s.id} sentence={s} playAudio={playAudio} currentlyPlayingUrl={currentlyPlayingUrl} playbackSpeed={playbackSpeed} setPlaybackSpeed={setPlaybackSpeed} onUpdateSentence={onUpdateSentence} onDeleteSentence={onDeleteSentence} onPractice={setSentenceToPractice} />)
                                :
                                filteredConversations.map(c => <ConversationListItem key={c.id} conversation={c} playAudio={playAudio} currentlyPlayingUrl={currentlyPlayingUrl} onDeleteConversation={onDeleteConversation} />)
                            }
                        </div>
                    </div>
                </div>
            </div>
            {showAddConvoModal && <AddConversationModal onClose={() => setShowAddConvoModal(false)} onAddConversation={onAddConversation} />}
            {sentenceToPractice && (
                <PronunciationPracticeModal
                    targetText={sentenceToPractice.sentence}
                    ipa={sentenceToPractice.ipa!}
                    audioUrl={sentenceToPractice.audioUrl}
                    onClose={() => setSentenceToPractice(null)}
                    playAudio={playAudio}
                    currentlyPlayingUrl={currentlyPlayingUrl}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                />
            )}
        </div>
    );
};

const AddConversationModal: React.FC<{
    onClose: () => void;
    onAddConversation: (conversation: Conversation) => void;
}> = ({ onClose, onAddConversation }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [rawText, setRawText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleParse = async () => {
        if (!title.trim() || !rawText.trim()) {
            setError('Title and conversation text cannot be empty.');
            return;
        }
        setIsLoading(true);
        setError(null);

        const result = await geminiService.parseAndTranslateConversation(rawText, title, category || 'Custom');

        if (result.conversation) {
            const createTtsApiUrl = (text: string) => `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
            
            const newConversation: Conversation = {
                ...result.conversation,
                id: `custom-${Date.now()}`,
                isCustom: true,
                lines: result.conversation.lines.map(line => ({
                    ...line,
                    audioUrl: createTtsApiUrl(line.sentence)
                }))
            };
            onAddConversation(newConversation);
            onClose();
        } else {
            setError(result.error || 'An unknown error occurred.');
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-center">Add Custom Conversation</h2>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4">
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Conversation Title (e.g., At the Airport)" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none" />
                    <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (optional, e.g., Travel)" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none" />
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder={"Paste conversation text here. Format each line as:\nSpeaker: Sentence\n\ne.g.,\nReceptionist: How can I help you?\nCustomer: I'd like to check in."}
                        rows={8}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none resize-y"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} className="w-full py-3 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                    <button onClick={handleParse} disabled={isLoading} className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:bg-gray-400 flex items-center justify-center">
                        {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Analyze & Add'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConversationListItem: React.FC<{
    conversation: Conversation;
    onDeleteConversation: (id: string) => void;
} & Omit<AudioProps, 'setPlaybackSpeed'>> = ({ conversation, playAudio, currentlyPlayingUrl, onDeleteConversation }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div className="p-4 bg-light-bg dark:bg-dark-bg rounded-xl">
            <div onClick={() => setIsExpanded(!isExpanded)} className="flex justify-between items-center cursor-pointer">
                <div>
                    <h3 className="font-bold text-lg">{conversation.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{conversation.category} · {conversation.level}</p>
                </div>
                <div className="flex items-center gap-2">
                    {conversation.isCustom && (
                        <button onClick={(e) => { e.stopPropagation(); onDeleteConversation(conversation.id); }} className="p-2 rounded-full hover:bg-red-500/10" aria-label="Delete conversation">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                        </button>
                    )}
                    <ChevronDownIcon className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isExpanded && (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3 space-y-3">
                    {conversation.lines.map((line, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <span className="font-bold text-primary w-20 flex-shrink-0">{line.speaker}:</span>
                            <div className="flex-grow">
                                <p>{line.sentence}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">{line.meaning}</p>
                            </div>
                            <button onClick={() => playAudio(line.audioUrl)} className={`p-2 rounded-full transition-colors ${currentlyPlayingUrl === line.audioUrl ? 'bg-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                <SpeakerIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const FlashcardView: React.FC<{
    onNavigate: NavigateFn;
    practiceContext: PracticeContext;
    customLessons: CustomLesson[];
    allWords: Word[];
    allSentences: Sentence[];
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
} & AudioProps> = ({ onNavigate, practiceContext, customLessons, allWords, allSentences, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed }) => {
    
    const [queue, setQueue] = useState<ReviewItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    
    const deckItems = useMemo(() => {
        let items: (Word | Sentence)[] = [];
        if (practiceContext.mode === 'custom' && practiceContext.lessonId) {
            const lesson = customLessons.find(l => l.id === practiceContext.lessonId);
            if (lesson) {
                const wordIdSet = new Set(lesson.vocabularyIds);
                items = allWords.filter(w => wordIdSet.has(w.id));
            }
        } else {
             const reviewQueue = srsService.getReviewQueue();
             const wordMap = new Map(allWords.map(w => [w.id, w]));
             const sentenceMap = new Map(allSentences.map(s => [s.id, s]));

             items = reviewQueue.map(reviewItem => {
                 if (reviewItem.type === 'word') return wordMap.get(reviewItem.id);
                 return sentenceMap.get(reviewItem.id);
             }).filter(item => item !== undefined) as (Word | Sentence)[];
        }
        // Simple shuffle
        return items.sort(() => Math.random() - 0.5);
    }, [practiceContext, customLessons, allWords, allSentences]);

    const currentItem = deckItems[currentIndex];
    
    const handleNext = (quality?: number) => {
        if (typeof quality === 'number' && practiceContext.mode === 'all') {
            const reviewItem = srsService.getAllReviewItems().find(i => i.id === currentItem.id && i.type === ('ipa' in currentItem ? 'word' : 'sentence'));
            if (reviewItem) {
                srsService.updateReviewItem(reviewItem, quality);
            }
        }

        setIsFlipped(false);
        if (currentIndex < deckItems.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
             alert("Session complete!");
             onNavigate(practiceContext.originView, practiceContext.mode === 'custom' ? { lessonId: practiceContext.lessonId } : undefined);
        }
    };

    if (deckItems.length === 0) {
        return (
            <div className="p-4 sm:p-6 text-center">
                 <PageHeader title="Flashcards" onBack={() => onNavigate(practiceContext.originView, practiceContext.mode === 'custom' ? { lessonId: practiceContext.lessonId } : undefined)} />
                 <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-8">
                    <p className="text-lg">No items to review right now. Great job!</p>
                 </div>
            </div>
        );
    }
    
    const isWord = 'ipa' in currentItem;
    
    const frontContent = (
         <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">{isWord ? currentItem.word : currentItem.sentence}</h2>
            {isWord && <p className="text-xl text-gray-500">{currentItem.ipa}</p>}
             <button onClick={(e) => { e.stopPropagation(); playAudio(currentItem.audioUrl, playbackSpeed); }} className={`mx-auto mt-4 p-3 rounded-full transition-colors ${currentlyPlayingUrl === currentItem.audioUrl ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                <SpeakerIcon className="w-8 h-8" />
            </button>
         </div>
    );
    
    const backContent = (
         <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">{currentItem.meaning}</h2>
            {isWord && (
                <div className="text-gray-600 dark:text-gray-300">
                    <p>"{currentItem.example.en}"</p>
                    <p className="italic">"{currentItem.example.vi}"</p>
                </div>
            )}
             <button onClick={(e) => { e.stopPropagation(); playAudio(currentItem.audioUrl, playbackSpeed); }} className={`mx-auto mt-4 p-3 rounded-full transition-colors ${currentlyPlayingUrl === currentItem.audioUrl ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-600'}`}>
                <SpeakerIcon className="w-8 h-8" />
            </button>
         </div>
    );

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-xl mx-auto">
                <PageHeader title="Flashcards" onBack={() => onNavigate(practiceContext.originView, practiceContext.mode === 'custom' ? { lessonId: practiceContext.lessonId } : undefined)} rightContent={<div className="font-semibold">{currentIndex + 1} / {deckItems.length}</div>} />
                 <div className="relative" style={{ perspective: '1000px' }}>
                    <div onClick={() => setIsFlipped(!isFlipped)} className="w-full h-80 rounded-2xl cursor-pointer transition-transform duration-500" style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : '' }}>
                        <div className="absolute w-full h-full bg-white dark:bg-dark-card shadow-lg rounded-2xl flex items-center justify-center p-6" style={{ backfaceVisibility: 'hidden' }}>
                            {frontContent}
                        </div>
                         <div className="absolute w-full h-full bg-white dark:bg-dark-card shadow-lg rounded-2xl flex items-center justify-center p-6" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            {backContent}
                        </div>
                    </div>
                </div>
                
                {isFlipped ? (
                    <div className="mt-6 animate-fade-in-up">
                        <p className="text-center text-gray-500 mb-3">How well did you know it?</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button onClick={() => handleNext(0)} className="py-3 px-4 bg-red-500/80 text-white font-semibold rounded-lg hover:bg-red-600">Again</button>
                            <button onClick={() => handleNext(3)} className="py-3 px-4 bg-amber-500/80 text-white font-semibold rounded-lg hover:bg-amber-600">Hard</button>
                            <button onClick={() => handleNext(4)} className="py-3 px-4 bg-sky-500/80 text-white font-semibold rounded-lg hover:bg-sky-600">Good</button>
                            <button onClick={() => handleNext(5)} className="py-3 px-4 bg-green-500/80 text-white font-semibold rounded-lg hover:bg-green-600">Easy</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setIsFlipped(true)} className="w-full mt-6 py-4 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-light transition-colors">
                        Show Answer
                    </button>
                )}
            </div>
        </div>
    );
};

const ShadowingPracticeModal: React.FC<{
    item: Word | Sentence;
    itemType: 'word' | 'sentence';
    onClose: () => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
} & AudioProps> = ({ item, itemType, onClose, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed }) => {
    const { isInitializing, isListening, transcript, finalTranscript, startListening, stopListening, hasRecognitionSupport, analyser, recognitionError } = useAudioRecorderAndVisualizer();
    const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    
    const targetText = itemType === 'word' ? (item as Word).word : (item as Sentence).sentence;
    const ipa = itemType === 'word' ? (item as Word).ipa : (item as Sentence).ipa;

    useEffect(() => {
        if (finalTranscript && !isListening) {
            const check = async () => {
                setIsChecking(true);
                const result = await geminiService.checkPronunciation(targetText, finalTranscript);
                setFeedback(result);
                setIsChecking(false);
            };
            check();
        }
    }, [finalTranscript, isListening, targetText]);
    
    const handleStart = () => {
        setFeedback(null);
        startListening();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-2 text-center">Shadowing Practice</h2>
                <div className="p-4 bg-primary/10 rounded-lg text-center mb-4">
                    <div className="flex justify-center items-center gap-2 flex-wrap">
                        <h3 className="text-2xl font-bold text-primary dark:text-primary-light">{targetText}</h3>
                        <button onClick={() => playAudio(item.audioUrl, playbackSpeed)} className={`p-2 rounded-full transition-colors ${currentlyPlayingUrl === item.audioUrl ? 'bg-primary text-white' : 'hover:bg-primary/20'}`}>
                           <SpeakerIcon className="w-6 h-6" />
                        </button>
                    </div>
                    {ipa && <p className="text-gray-500 dark:text-gray-400 mt-1">{ipa}</p>}
                </div>
                
                 <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    {feedback && !feedback.isError && (
                        <div className="text-center mb-4">
                            <p className="font-semibold mb-2">Your Score:</p>
                            <CircularProgress score={feedback.score} />
                        </div>
                    )}
                    {isChecking && <p className="text-center text-gray-500">Analyzing your speech...</p>}
                    {recognitionError && <p className="text-red-500 text-sm text-center my-2">{recognitionError}</p>}
                    {transcript && <p className="text-center text-gray-600 dark:text-gray-300 my-2">You said: <span className="font-semibold">{transcript}</span></p>}
                    
                    {feedback && !feedback.isError && (
                        <div className="space-y-3 mt-4 animate-fade-in">
                           <p className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-center">{feedback.feedback}</p>
                           {feedback.phoneticFeedback && feedback.phoneticFeedback.length > 0 && (
                                <div className="p-3 bg-red-500/10 rounded-lg">
                                    <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Phonetic Tips:</h4>
                                    <ul className="space-y-2 text-sm">
                                        {feedback.phoneticFeedback.map((item, i) => (
                                            <li key={i}>For <strong>{item.word}</strong>, you said <span className="font-mono bg-red-200/50 dark:bg-red-800/50 px-1 rounded">{item.userPhoneme}</span> instead of <span className="font-mono bg-green-200/50 dark:bg-green-800/50 px-1 rounded">{item.correctPhoneme}</span>. {item.suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                           )}
                           {feedback.rhythmAndIntonationFeedback && (Object.values(feedback.rhythmAndIntonationFeedback).some(v => v)) && (
                                <div className="p-3 bg-sky-500/10 rounded-lg">
                                    <h4 className="font-bold text-sky-600 dark:text-sky-400 mb-2">Prosody Feedback:</h4>
                                    <ul className="space-y-1 text-sm list-disc list-inside">
                                        {feedback.rhythmAndIntonationFeedback.rhythm && <li><strong>Rhythm:</strong> {feedback.rhythmAndIntonationFeedback.rhythm}</li>}
                                        {feedback.rhythmAndIntonationFeedback.intonation && <li><strong>Intonation:</strong> {feedback.rhythmAndIntonationFeedback.intonation}</li>}
                                        {feedback.rhythmAndIntonationFeedback.wordStress && <li><strong>Word Stress:</strong> {feedback.rhythmAndIntonationFeedback.wordStress}</li>}
                                    </ul>
                                </div>
                           )}
                           {feedback.linkingFeedback && (
                                <div className="p-3 bg-violet-500/10 rounded-lg">
                                    <h4 className="font-bold text-violet-600 dark:text-violet-400 mb-2">Linking Sounds:</h4>
                                    <p className="text-sm">{feedback.linkingFeedback}</p>
                                </div>
                           )}
                            {feedback.suggestions && feedback.suggestions.length > 0 && (
                                <div className="p-3 bg-amber-500/10 rounded-lg">
                                    <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-2">Suggestions for Improvement:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        {feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                           )}
                        </div>
                    )}
                     {feedback && feedback.isError && (
                        <p className="text-center text-red-500 bg-red-500/10 p-3 rounded-lg">{feedback.feedback}</p>
                    )}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} className="w-full py-3 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Close
                    </button>
                    <button 
                        onClick={isListening ? stopListening : handleStart}
                        disabled={!hasRecognitionSupport || isChecking || isInitializing}
                        className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:bg-gray-400 flex items-center justify-center"
                    >
                        {isInitializing ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Preparing Mic...
                            </div>
                        ) : isListening ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                Listening... Speak now!
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <MicrophoneIcon className="w-5 h-5" />
                                {feedback ? 'Try Again' : 'Start Shadowing'}
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


const ShadowingView: React.FC<{
    onNavigate: NavigateFn;
    words: Word[];
    sentences: Sentence[];
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
} & AudioProps> = ({ onNavigate, words, sentences, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed }) => {
    const [activeTab, setActiveTab] = useState('sentences');
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<Level | 'all'>('all');
    const [practiceItem, setPracticeItem] = useState<{ item: Word | Sentence, type: 'word' | 'sentence' } | null>(null);

    const items = useMemo(() => (activeTab === 'words' ? words : sentences), [activeTab, words, sentences]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const text = 'word' in item ? item.word : item.sentence;
            const matchesSearch = text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  item.meaning.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLevel = levelFilter === 'all' || item.level === levelFilter;
            return matchesSearch && matchesLevel;
        });
    }, [items, searchTerm, levelFilter]);

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title="Shadowing Practice" onBack={() => onNavigate(View.Home)} />
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg">
                     <div className="flex border-b border-gray-200 dark:border-gray-700 p-2">
                        <button onClick={() => setActiveTab('sentences')} className={`w-1/2 py-2.5 font-semibold rounded-lg transition-colors ${activeTab === 'sentences' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Sentences</button>
                        <button onClick={() => setActiveTab('words')} className={`w-1/2 py-2.5 font-semibold rounded-lg transition-colors ${activeTab === 'words' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Words</button>
                    </div>
                     <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                             <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                            />
                            <select
                                value={levelFilter}
                                onChange={e => setLevelFilter(e.target.value as Level | 'all')}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="all">All Levels</option>
                                {Object.values(Level).map(level => <option key={level} value={level}>{level}</option>)}
                            </select>
                        </div>
                        <div className="space-y-3 max-h-[65vh] overflow-y-auto">
                           {filteredItems.map(item => (
                               <div key={item.id} className="p-4 bg-light-bg dark:bg-dark-bg rounded-xl">
                                   <div className="flex justify-between items-center">
                                       <div>
                                           <p className="font-semibold text-lg">{'word' in item ? item.word : item.sentence}</p>
                                           <p className="text-gray-500 dark:text-gray-400">{item.meaning}</p>
                                       </div>
                                       <div className="flex items-center gap-1">
                                            <button onClick={() => setPracticeItem({ item, type: activeTab === 'words' ? 'word' : 'sentence' })} className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" aria-label={`Practice`}>
                                                <MicrophoneIcon className="w-6 h-6 text-emerald-500" />
                                            </button>
                                            <PlaybackSpeedControl currentSpeed={playbackSpeed} onSpeedChange={setPlaybackSpeed} />
                                            <button onClick={() => playAudio(item.audioUrl, playbackSpeed)} className={`p-3 rounded-full transition-colors ${currentlyPlayingUrl === item.audioUrl ? 'bg-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                                <SpeakerIcon className="w-6 h-6" />
                                            </button>
                                        </div>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                </div>
            </div>
            {practiceItem && (
                <ShadowingPracticeModal
                    item={practiceItem.item}
                    itemType={practiceItem.type}
                    onClose={() => setPracticeItem(null)}
                    playAudio={playAudio}
                    currentlyPlayingUrl={currentlyPlayingUrl}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                />
            )}
        </div>
    );
};


const AITutorView: React.FC<{ onNavigate: NavigateFn }> = ({ onNavigate }) => {
    const { isInitializing, isListening, transcript, finalTranscript, startListening, stopListening, hasRecognitionSupport, recognitionError } = useAudioRecorderAndVisualizer({ continuous: true, interimResults: true });
    const [chatHistory, setChatHistory] = useState<Content[]>([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [conversationLog, setConversationLog] = useState<ChatEntry[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [conversationLog]);

    useEffect(() => {
        if (transcript) {
            setCurrentMessage(transcript);
        }
    }, [transcript]);
    
    useEffect(() => {
        if (finalTranscript) {
            stopListening();
            sendMessage(finalTranscript);
        }
    }, [finalTranscript]);

    const sendMessage = async (message: string) => {
        if (!message.trim()) return;

        setIsSending(true);
        const userEntry: ChatEntry = { speaker: 'You', text: message };
        setConversationLog(prev => [...prev, userEntry]);
        setCurrentMessage('');

        try {
            const newUserContent: Content = { role: 'user', parts: [{ text: message }] };
            const historyWithNewMessage = [...chatHistory, newUserContent];
            
            const aiResponse = await geminiService.getAITutorResponse(historyWithNewMessage, message);

            const aiEntry: ChatEntry = { speaker: 'Zen', text: aiResponse };
            setConversationLog(prev => [...prev, aiEntry]);
            
            const newAiContent: Content = { role: 'model', parts: [{ text: aiResponse }] };
            setChatHistory(prev => [...prev, newUserContent, newAiContent]);

        } catch (error) {
            console.error("AI Tutor Error:", error);
            const errorEntry: ChatEntry = { speaker: 'Zen', text: "Sorry, I'm having a little trouble right now. Please try again in a moment." };
            setConversationLog(prev => [...prev, errorEntry]);
        } finally {
            setIsSending(false);
        }
    };
    
    const handleMicClick = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleSendText = () => {
        if (currentMessage.trim()) {
            sendMessage(currentMessage.trim());
        }
    };

    return (
        <div className="p-4 sm:p-6 h-[calc(100vh-11rem)] flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex flex-col flex-grow min-h-0">
                <PageHeader title="AI Tutor" onBack={() => onNavigate(View.Home)} />
                <div className="flex-grow bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6 overflow-y-auto mb-4 relative">
                    <div className="space-y-4">
                        {conversationLog.map((entry, index) => (
                             <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'You' ? 'flex-row-reverse' : ''}`}>
                                 <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${entry.speaker === 'Zen' ? 'bg-primary/20' : 'bg-secondary/20'}`}>
                                    {entry.speaker === 'Zen' ? <AITutorIcon className="w-6 h-6 text-primary" /> : <UserAvatarIcon className="w-6 h-6 text-secondary" />}
                                </div>
                                <div className={`p-3 rounded-lg max-w-xs md:max-w-md ${entry.speaker === 'Zen' ? 'bg-gray-100 dark:bg-gray-700' : 'bg-primary text-white'}`}>
                                    {entry.text}
                                </div>
                            </div>
                        ))}
                    </div>
                     <div ref={messagesEndRef} />
                </div>
                 {recognitionError && <p className="text-center text-red-500 text-sm mb-2">{recognitionError}</p>}
                <div className="flex-shrink-0 flex items-center gap-3">
                    <input 
                        type="text"
                        value={currentMessage}
                        onChange={e => setCurrentMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendText()}
                        placeholder={isListening ? "Listening..." : "Type or click mic to talk..."}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                    />
                     <button onClick={handleSendText} disabled={isSending || !currentMessage.trim()} className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white flex-shrink-0 disabled:bg-gray-400">
                        <SendIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleMicClick}
                        disabled={!hasRecognitionSupport || isSending}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white flex-shrink-0 transition-colors ${isListening ? 'bg-red-500' : 'bg-primary'} disabled:bg-gray-400`}
                    >
                         {isInitializing ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : isListening ? (
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        ) : (
                            <MicrophoneIcon className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AIConversationView: React.FC<{ onNavigate: NavigateFn }> = ({ onNavigate }) => {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Tap start to begin conversation");
    const [transcriptionHistory, setTranscriptionHistory] = useState<string[]>([]);
    const [currentInputTranscription, setCurrentInputTranscription] = useState('');
    const [currentOutputTranscription, setCurrentOutputTranscription] = useState('');
    
    const sessionPromise = useRef<Promise<any> | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioSources = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTime = useRef(0);
    
    const API_KEY = process.env.API_KEY;

    const stopConversation = useCallback(() => {
        if (sessionPromise.current) {
            sessionPromise.current.then(session => session.close());
            sessionPromise.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }

        if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }

        if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        
        audioSources.current.forEach(source => source.stop());
        audioSources.current.clear();
        nextStartTime.current = 0;

        setIsSessionActive(false);
        setStatusMessage("Conversation ended. Tap start to begin again.");
    }, []);

    const startConversation = useCallback(async () => {
        if (isSessionActive || !API_KEY) return;
        
        setIsSessionActive(true);
        setStatusMessage("Connecting to AI...");
        setTranscriptionHistory([]);
        setCurrentInputTranscription('');
        setCurrentOutputTranscription('');

        const ai = new GoogleGenAI({ apiKey: API_KEY });
        
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const outputNode = outputAudioContextRef.current.createGain();
        outputNode.connect(outputAudioContextRef.current.destination);

        sessionPromise.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: async () => {
                    setStatusMessage("Connected! Start speaking.");
                    try {
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        streamRef.current = stream;

                        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        const source = inputAudioContextRef.current.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        
                        const scriptProcessor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const int16 = new Int16Array(inputData.length);
                            for (let i = 0; i < inputData.length; i++) {
                                int16[i] = inputData[i] * 32768;
                            }
                            let binary = '';
                            for (let i = 0; i < int16.buffer.byteLength; i++) {
                                binary += String.fromCharCode(new Uint8Array(int16.buffer)[i]);
                            }
                            const pcmBlob: Blob = {
                                data: btoa(binary),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            if(sessionPromise.current) {
                                sessionPromise.current.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            }
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current.destination);
                    } catch (err) {
                        console.error("Microphone access error:", err);
                        setStatusMessage("Microphone access denied.");
                        stopConversation();
                    }
                },
                onmessage: async (message: LiveServerMessage) => {
                    if (message.serverContent?.outputTranscription) {
                       setCurrentOutputTranscription(prev => prev + message.serverContent.outputTranscription.text);
                    }
                    if (message.serverContent?.inputTranscription) {
                        setCurrentInputTranscription(prev => prev + message.serverContent.inputTranscription.text);
                    }
                    if (message.serverContent?.turnComplete) {
                        const fullInput = currentInputTranscription;
                        const fullOutput = currentOutputTranscription;
                        setTranscriptionHistory(prev => [...prev, `You: ${fullInput}`, `Zen: ${fullOutput}`]);
                        setCurrentInputTranscription('');
                        setCurrentOutputTranscription('');
                    }

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                    if (base64Audio && outputAudioContextRef.current) {
                        const ctx = outputAudioContextRef.current;
                        nextStartTime.current = Math.max(nextStartTime.current, ctx.currentTime);

                        const binaryString = atob(base64Audio);
                        const len = binaryString.length;
                        const bytes = new Uint8Array(len);
                        for (let i = 0; i < len; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        
                        const dataInt16 = new Int16Array(bytes.buffer);
                        const frameCount = dataInt16.length;
                        const audioBuffer = ctx.createBuffer(1, frameCount, 24000);
                        const channelData = audioBuffer.getChannelData(0);
                        for (let i = 0; i < frameCount; i++) {
                            channelData[i] = dataInt16[i] / 32768.0;
                        }

                        const source = ctx.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        source.addEventListener('ended', () => {
                            audioSources.current.delete(source);
                        });
                        source.start(nextStartTime.current);
                        nextStartTime.current += audioBuffer.duration;
                        audioSources.current.add(source);
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error("Session error:", e);
                    setStatusMessage("Session error. Please try again.");
                    stopConversation();
                },
                onclose: () => {
                    setStatusMessage("Session closed.");
                    stopConversation();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
        });
    }, [isSessionActive, API_KEY, stopConversation]);

    useEffect(() => {
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    return (
        <div className="p-4 sm:p-6 h-[calc(100vh-11rem)] flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex flex-col flex-grow min-h-0">
                <PageHeader title="AI Conversation" onBack={onNavigate.bind(null, View.Home)} />
                <div className="flex-grow bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6 overflow-y-auto mb-4 relative">
                    <div className="space-y-2 text-lg">
                        {transcriptionHistory.map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                        {currentInputTranscription && <p>You: {currentInputTranscription}...</p>}
                        {currentOutputTranscription && <p>Zen: {currentOutputTranscription}...</p>}
                    </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center gap-4">
                    <p className="font-semibold text-lg">{statusMessage}</p>
                    <button
                        onClick={isSessionActive ? stopConversation : startConversation}
                        className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg transition-all transform hover:scale-105 ${isSessionActive ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-light'}`}
                    >
                        {isSessionActive ? "Stop" : "Start"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ReviewView: React.FC<{ onNavigate: NavigateFn, customLessons: CustomLesson[] }> = ({ onNavigate, customLessons }) => {
    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title="Review & Practice" onBack={() => onNavigate(View.Home)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PracticeCard 
                        title="Quick Check"
                        description="A quick multiple-choice quiz on all your learned vocabulary."
                        icon={ReviewIcon}
                        onClick={() => onNavigate(View.QuickCheck)}
                    />
                     <PracticeCard 
                        title="Sentence Practice"
                        description="Practice making your own sentences using your learned vocabulary."
                        icon={AITutorIcon}
                        onClick={() => onNavigate(View.SentencePractice, { practice: { mode: 'all', lessonId: null, originView: View.Review } })}
                    />
                    <PracticeCard 
                        title="Fill in the Blank"
                        description="Complete sentences by filling in the missing vocabulary word."
                        icon={GrammarIcon}
                        onClick={() => onNavigate(View.FillInTheBlank, { practice: { mode: 'all', lessonId: null, originView: View.Review } })}
                    />
                     <PracticeCard 
                        title="Listening Practice"
                        description="Listen to a word and choose the correct spelling."
                        icon={ListeningIcon}
                        onClick={() => onNavigate(View.ListeningPractice, { practice: { mode: 'all', lessonId: null, originView: View.Review } })}
                    />
                </div>
                 <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Practice a Custom Lesson</h3>
                    <div className="space-y-3">
                        {customLessons.length > 0 ? customLessons.map(lesson => (
                            <button key={lesson.id} onClick={() => onNavigate(View.LessonDetail, { lessonId: lesson.id })} className="w-full text-left p-4 bg-white dark:bg-dark-card rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                                <div>
                                    <h4 className="font-bold">{lesson.name}</h4>
                                    <p className="text-sm text-gray-500">{lesson.vocabularyIds.length} words</p>
                                </div>
                                <ChevronDownIcon className="w-6 h-6 -rotate-90" />
                            </button>
                        )) : (
                            <p className="text-center text-gray-500">No custom lessons created yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PracticeCard: React.FC<{ title: string, description: string, icon: React.FC<{className?: string}>, onClick: () => void }> = ({ title, description, icon: Icon, onClick }) => (
    <button onClick={onClick} className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-lg text-left hover:shadow-xl hover:-translate-y-1 transition-all">
        <Icon className="w-10 h-10 text-primary mb-3" />
        <h3 className="font-bold text-xl mb-1">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </button>
);

const useQuizLogic = (items: Word[]) => {
    const [questionIndex, setQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [quizFinished, setQuizFinished] = useState(false);

    const questions = useMemo(() => {
        if (items.length < 4) return [];
        return items.map(item => {
            const correctAnswer = item.meaning;
            let options = [correctAnswer];
            let distractors = items.filter(d => d.id !== item.id);
            while (options.length < 4 && distractors.length > 0) {
                const randomIndex = Math.floor(Math.random() * distractors.length);
                options.push(distractors[randomIndex].meaning);
                distractors.splice(randomIndex, 1);
            }
            return {
                word: item.word,
                correctAnswer,
                options: options.sort(() => Math.random() - 0.5),
            };
        });
    }, [items]);

    const currentQuestion = questions[questionIndex];

    const handleAnswer = (answer: string) => {
        setSelectedAnswer(answer);
        const correct = answer === currentQuestion.correctAnswer;
        setIsCorrect(correct);
        if (correct) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        setSelectedAnswer(null);
        setIsCorrect(null);
        if (questionIndex < questions.length - 1) {
            setQuestionIndex(i => i + 1);
        } else {
            setQuizFinished(true);
        }
    };

    const restartQuiz = () => {
        setQuestionIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setQuizFinished(false);
    };

    return {
        questionIndex,
        score,
        selectedAnswer,
        isCorrect,
        quizFinished,
        questions,
        currentQuestion,
        handleAnswer,
        handleNext,
        restartQuiz,
    };
};


const QuickCheckView: React.FC<{ onNavigate: NavigateFn, allWords: Word[] }> = ({ onNavigate, allWords }) => {
    const quizItems = useMemo(() => {
        // Get 10 random words for the quiz
        return [...allWords].sort(() => 0.5 - Math.random()).slice(0, 10);
    }, [allWords]);

    const {
        questionIndex, score, selectedAnswer, isCorrect, quizFinished,
        questions, currentQuestion, handleAnswer, handleNext, restartQuiz
    } = useQuizLogic(quizItems);
    
    if (quizItems.length < 4) {
        return <div className="p-4 text-center">Not enough words to start a quiz. Learn at least 4 words.</div>
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
                <PageHeader title="Quick Check" onBack={() => onNavigate(View.Review)} />
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-lg">
                    {quizFinished ? (
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
                            <p className="text-xl">Your score: <span className="font-bold text-primary">{score} / {questions.length}</span></p>
                            <button onClick={restartQuiz} className="mt-6 px-6 py-2 bg-primary text-white font-semibold rounded-lg">Play Again</button>
                        </div>
                    ) : (
                        <div>
                             <p className="text-right text-gray-500 font-semibold mb-2">{questionIndex + 1} / {questions.length}</p>
                             <p className="text-center text-lg mb-2">What is the meaning of:</p>
                             <h3 className="text-center text-4xl font-bold mb-6">{currentQuestion.word}</h3>
                            <div className="space-y-3">
                                {currentQuestion.options.map(option => {
                                    const isSelected = selectedAnswer === option;
                                    const isTheCorrectAnswer = option === currentQuestion.correctAnswer;
                                    
                                    let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-colors ";
                                    if (isSelected) {
                                        buttonClass += isCorrect ? "bg-green-100 dark:bg-green-900 border-green-500" : "bg-red-100 dark:bg-red-900 border-red-500";
                                    } else if (selectedAnswer !== null && isTheCorrectAnswer) {
                                        buttonClass += "bg-green-100 dark:bg-green-900 border-green-500";
                                    } else {
                                        buttonClass += "bg-light-bg dark:bg-dark-bg border-transparent hover:bg-gray-200 dark:hover:bg-gray-700";
                                    }

                                    return (
                                        <button key={option} onClick={() => handleAnswer(option)} disabled={selectedAnswer !== null} className={buttonClass}>
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                            {selectedAnswer !== null && (
                                <button onClick={handleNext} className="w-full mt-6 py-3 bg-primary text-white font-bold rounded-lg">
                                    {questionIndex < questions.length - 1 ? 'Next' : 'Finish'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SentencePracticeView: React.FC<{
    onNavigate: NavigateFn;
    practiceContext: PracticeContext;
    customLessons: CustomLesson[];
    allWords: Word[];
}> = ({ onNavigate, practiceContext, customLessons, allWords }) => {
    const [practiceWords, setPracticeWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userSentence, setUserSentence] = useState('');
    const [feedback, setFeedback] = useState<SentenceFeedback | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let items: Word[] = [];
        if (practiceContext.mode === 'custom' && practiceContext.lessonId) {
            const lesson = customLessons.find(l => l.id === practiceContext.lessonId);
            if (lesson) {
                const wordIdSet = new Set(lesson.vocabularyIds);
                items = allWords.filter(w => wordIdSet.has(w.id));
            }
        } else {
            // Select 10 random words from all learned words
            items = [...srsService.getAllReviewItems()]
                .filter(i => i.type === 'word' && i.repetitions > 0)
                .sort(() => 0.5 - Math.random())
                .slice(0, 10)
                .map(i => allWords.find(w => w.id === i.id))
                .filter((w): w is Word => w !== undefined);
        }
        setPracticeWords(items);
    }, [practiceContext, customLessons, allWords]);
    
    const currentWord = practiceWords[currentIndex];

    const handleCheckSentence = async () => {
        if (!userSentence.trim() || !currentWord) return;
        setIsLoading(true);
        setFeedback(null);
        const result = await geminiService.checkUserSentence(currentWord.word, userSentence);
        setFeedback(result);
        setIsLoading(false);
    };

    const handleNext = () => {
        if (currentIndex < practiceWords.length - 1) {
            setCurrentIndex(i => i + 1);
            setUserSentence('');
            setFeedback(null);
        } else {
            alert("Practice session complete!");
            onNavigate(View.Review);
        }
    };
    
     const MistakeDisplay: React.FC<{ mistake: Mistake }> = ({ mistake }) => {
        const colorClasses = {
            'Grammar': 'bg-red-500/10 text-red-700 dark:text-red-300',
            'Spelling': 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
            'Expression': 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
            'Usage': 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
            'Other': 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
        };
        return (
            <div className={`p-3 rounded-lg ${colorClasses[mistake.type]}`}>
                 <div className="flex justify-between items-center mb-1">
                    <strong className="text-sm">{mistake.type} Error</strong>
                     <p className="text-xs font-mono p-1 bg-black/10 rounded-md">'{mistake.incorrectPart}'</p>
                </div>
                <p className="text-sm mb-1">{mistake.explanation}</p>
                <p className="text-sm font-semibold">Suggestion: <span className="font-normal">{mistake.suggestion}</span></p>
            </div>
        );
    };


    if (practiceWords.length === 0) {
        return (
             <div className="p-4 text-center">
                 <PageHeader title="Sentence Practice" onBack={() => onNavigate(View.Review)} />
                 <p>Not enough words to practice. Learn some words first!</p>
             </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6">
             <div className="max-w-2xl mx-auto">
                <PageHeader title="Sentence Practice" onBack={() => onNavigate(View.Review)} rightContent={<div className="font-semibold">{currentIndex + 1} / {practiceWords.length}</div>} />
                 <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-lg space-y-4">
                     <div>
                        <p className="text-lg text-center mb-1">Use the word below to make a sentence:</p>
                        <div className="text-center p-3 bg-primary/10 rounded-lg">
                           <h3 className="text-3xl font-bold text-primary">{currentWord.word}</h3>
                           <p className="text-gray-500">{currentWord.meaning}</p>
                        </div>
                    </div>
                     <textarea
                        value={userSentence}
                        onChange={(e) => setUserSentence(e.target.value)}
                        placeholder="Write your sentence here..."
                        rows={3}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none resize-y"
                     />
                     <button onClick={handleCheckSentence} disabled={isLoading || !userSentence.trim()} className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-light disabled:bg-gray-400 flex items-center justify-center">
                        {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Check Sentence'}
                    </button>
                    
                     {feedback && (
                        <div className="space-y-3 animate-fade-in">
                            <div className={`p-3 rounded-lg text-center font-semibold ${feedback.isCorrect ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'}`}>
                                {feedback.feedback}
                            </div>
                            {!feedback.isCorrect && (
                                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <p className="font-semibold mb-1">Corrected Sentence:</p>
                                    <p>{feedback.correctedSentence}</p>
                                </div>
                            )}
                            {feedback.mistakes.length > 0 && (
                                <div className="space-y-2">
                                     {feedback.mistakes.map((mistake, i) => <MistakeDisplay key={i} mistake={mistake} />)}
                                </div>
                            )}
                            <button onClick={handleNext} className="w-full py-3 bg-secondary text-white font-bold rounded-lg">
                                {currentIndex < practiceWords.length - 1 ? 'Next Word' : 'Finish Session'}
                            </button>
                        </div>
                     )}
                 </div>
            </div>
        </div>
    );
};


const FillInTheBlankView: React.FC<{ onNavigate: NavigateFn, practiceContext: PracticeContext, allWords: Word[] }> = ({ onNavigate, practiceContext, allWords }) => {
    // This is a simplified version. A real implementation would be more robust.
    const [questions, setQuestions] = useState<{ sentence: string; blank: string; answer: string }[]>([]);
    
    useEffect(() => {
        // Simplified question generation
        const practiceItems = [...allWords].sort(() => 0.5 - Math.random()).slice(0, 10);
        const generatedQuestions = practiceItems.map(word => {
            const sentence = word.example.en;
            const blankedSentence = sentence.replace(new RegExp(`\\b${word.word}\\b`, 'i'), '______');
            return {
                sentence: blankedSentence,
                blank: `(${word.meaning})`,
                answer: word.word
            };
        });
        setQuestions(generatedQuestions);
    }, [allWords]);

    // Quiz logic would be similar to QuickCheckView
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

    const currentQuestion = questions[currentIndex];

    const checkAnswer = () => {
        if (userInput.trim().toLowerCase() === currentQuestion.answer.toLowerCase()) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };

    const handleNext = () => {
        setFeedback(null);
        setUserInput('');
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
        } else {
            alert("Practice complete!");
            onNavigate(View.Review);
        }
    };

    if (questions.length === 0) return <div>Loading...</div>;

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
                <PageHeader title="Fill in the Blank" onBack={() => onNavigate(View.Review)} />
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-lg space-y-4">
                    <p className="text-right text-gray-500 font-semibold">{currentIndex + 1} / {questions.length}</p>
                    <p className="text-lg text-center">{currentQuestion.sentence}</p>
                    <p className="text-lg text-center font-semibold text-primary">{currentQuestion.blank}</p>
                    <input 
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg"
                    />
                    {feedback && (
                        <div className={`p-3 rounded-lg text-center ${feedback === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {feedback === 'correct' ? 'Correct!' : `Correct answer: ${currentQuestion.answer}`}
                        </div>
                    )}
                    <button 
                        onClick={feedback ? handleNext : checkAnswer}
                        className="w-full py-3 bg-primary text-white font-bold rounded-lg"
                    >
                        {feedback ? 'Next' : 'Check'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ListeningPracticeView: React.FC<{
    onNavigate: NavigateFn;
    practiceContext: PracticeContext;
    allWords: Word[];
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
} & AudioProps> = ({ onNavigate, practiceContext, allWords, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed }) => {
    
    const quizItems = useMemo(() => {
        return [...allWords].sort(() => 0.5 - Math.random()).slice(0, 10);
    }, [allWords]);

     const {
        questionIndex, score, selectedAnswer, isCorrect, quizFinished,
        questions, currentQuestion, handleAnswer, handleNext, restartQuiz
    } = useQuizLogic(quizItems);

    if (quizItems.length < 4) {
        return <div className="p-4 text-center">Not enough words to start a quiz. Learn at least 4 words.</div>
    }

    const currentWordItem = quizItems.find(w => w.word === currentQuestion.word)!;

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-2xl mx-auto">
                <PageHeader title="Listening Practice" onBack={() => onNavigate(View.Review)} />
                 <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-lg">
                      {quizFinished ? (
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
                            <p className="text-xl">Your score: <span className="font-bold text-primary">{score} / {questions.length}</span></p>
                            <button onClick={restartQuiz} className="mt-6 px-6 py-2 bg-primary text-white font-semibold rounded-lg">Play Again</button>
                        </div>
                    ) : (
                         <div>
                            <p className="text-right text-gray-500 font-semibold mb-2">{questionIndex + 1} / {questions.length}</p>
                            <p className="text-center text-lg mb-4">Listen and choose the correct word:</p>
                             <div className="text-center mb-6">
                                <button onClick={() => playAudio(currentWordItem.audioUrl)} className="p-4 bg-primary text-white rounded-full shadow-lg">
                                    <SpeakerIcon className="w-8 h-8"/>
                                </button>
                            </div>
                             <div className="space-y-3">
                                {/* The quiz logic here is mismatched. It should check against the word, not the meaning. Let's fix it for this component. */}
                                 {currentQuestion.options.map(option => {
                                    const wordForOption = allWords.find(w => w.meaning === option)?.word || '';
                                    const isSelected = selectedAnswer === option;
                                    const isTheCorrectAnswer = option === currentQuestion.correctAnswer;
                                    
                                    let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-colors ";
                                    if (isSelected) {
                                        buttonClass += isCorrect ? "bg-green-100 dark:bg-green-900 border-green-500" : "bg-red-100 dark:bg-red-900 border-red-500";
                                    } else if (selectedAnswer !== null && isTheCorrectAnswer) {
                                        buttonClass += "bg-green-100 dark:bg-green-900 border-green-500";
                                    } else {
                                        buttonClass += "bg-light-bg dark:bg-dark-bg border-transparent hover:bg-gray-200 dark:hover:bg-gray-700";
                                    }

                                    return (
                                        <button key={option} onClick={() => handleAnswer(option)} disabled={selectedAnswer !== null} className={buttonClass}>
                                            {wordForOption}
                                        </button>
                                    );
                                })}
                            </div>
                              {selectedAnswer !== null && (
                                <button onClick={handleNext} className="w-full mt-6 py-3 bg-primary text-white font-bold rounded-lg">
                                    {questionIndex < questions.length - 1 ? 'Next' : 'Finish'}
                                </button>
                            )}
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const PlaceholderView: React.FC<{ featureName: string; onNavigate: () => void }> = ({ featureName, onNavigate }) => (
    <div className="p-4 text-center">
        <PageHeader title={featureName} onBack={onNavigate} />
        <h2 className="text-2xl font-bold mt-16">Coming Soon!</h2>
        <p className="text-gray-500">{featureName} is under development.</p>
    </div>
);


const BottomNav: React.FC<{ currentView: View, onNavigate: (view: View) => void }> = ({ currentView, onNavigate }) => {
    const navItems = [
        { view: View.Home, icon: HomeIcon, label: 'Home' },
        { view: View.Vocabulary, icon: VocabularyIcon, label: 'Words' },
        { view: View.Sentences, icon: SentencesIcon, label: 'Sentences' },
        { view: View.MyLessons, icon: BookIcon, label: 'My Lessons' },
        { view: View.Stats, icon: StatsIcon, label: 'Stats' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 shadow-t-lg z-40">
            <div className="flex justify-around max-w-5xl mx-auto">
                {navItems.map(item => (
                    <button key={item.label} onClick={() => onNavigate(item.view)} className={`flex-1 flex flex-col items-center justify-center pt-2 pb-1 transition-colors duration-200 ${currentView === item.view ? 'text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light'}`}>
                        <item.icon className="w-7 h-7" />
                        <span className="text-xs font-semibold mt-1">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};