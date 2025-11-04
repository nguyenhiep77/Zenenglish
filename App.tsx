import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
    VocabularyIcon, SentencesIcon, FlashcardIcon, MinigamesIcon, MicrophoneIcon, StatsIcon, ReviewIcon, BookIcon, AITutorIcon,
    LightIcon, DarkIcon, UserAvatarIcon, NotificationIcon, HomeIcon, BackIcon, SpeakerIcon,
    ListeningIcon, ReadingIcon, GrammarIcon, ChevronDownIcon, SendIcon, InfoIcon, AIConversationIcon, HistoryIcon, TranslateIcon, SwapIcon, CopyIcon
} from './constants';
import { View, UserStats, FeatureCard, Level, Word, Sentence, ReviewItem, SentenceFeedback, CustomLesson, Conversation, PracticeContext, LessonEditorContext, Mistake, PronunciationFeedback, Example, WordDetails, ChatEntry, ConversationRecord, ConversationLine } from './types';
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


  const features: FeatureCard[] = useMemo(() => [
    { view: View.Vocabulary, title: 'Từ Vựng', icon: VocabularyIcon, badge: `${stats.totalWords}/${allWords.length}`, color: 'text-primary', description: `Học bộ từ vựng Oxford ${allWords.length}` },
    { view: View.Sentences, title: 'Mẫu Câu', icon: SentencesIcon, badge: `${stats.totalSentences}/${allSentences.length}`, color: 'text-secondary-dark', description: `Học ${allSentences.length} câu giao tiếp phổ biến` },
    { view: View.Flashcards, title: 'Flashcard', icon: FlashcardIcon, badge: `${srsService.getReviewQueue().length} due`, color: 'text-accent-DEFAULT', description: 'Ôn tập với SRS' },
    { view: View.Shadowing, title: 'Shadowing', icon: MicrophoneIcon, badge: 'Mới!', color: 'text-emerald-500', description: 'Luyện nói theo người bản xứ' },
    { view: View.AIConversation, title: 'AI Conversation', icon: AIConversationIcon, badge: 'Mới!', color: 'text-sky-500', description: 'Practice speaking with an AI partner' },
    { view: View.Translator, title: 'AI Translator', icon: TranslateIcon, badge: 'Mới!', color: 'text-rose-500', description: 'Dịch Anh-Việt & Việt-Anh' },
    { view: View.Review, title: 'Ôn Tập', icon: ReviewIcon, badge: 'Nâng cao', color: 'text-green-500', description: 'Kiểm tra & Luyện tập' },
    { view: View.MyLessons, title: 'Bài Học Của Tôi', icon: BookIcon, badge: `${customLessons.length} bài`, color: 'text-violet-500', description: 'Tạo bài học riêng' },
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


const useAudioRecorderAndVisualizer = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
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
            audioContextRef.current.close();
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
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
            setTranscript('');
        };

        recognition.onend = () => {
            setIsListening(false);
            stopAudioProcessing();
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'no-speech') {
                setRecognitionError("I didn't hear anything. Please try speaking closer to your microphone.");
            } else if (event.error === 'audio-capture') {
                setRecognitionError("Couldn't capture audio. Check microphone permissions.");
            } else if (event.error === 'not-allowed') {
                setRecognitionError("Microphone access denied. Please allow it in browser settings.");
            } else {
                setRecognitionError(`An error occurred: ${event.error}. Please try again.`);
            }
            setIsListening(false);
            stopAudioProcessing();
        };

        recognition.onresult = (event) => {
            const text = event.results[event.results.length - 1][0].transcript;
            setTranscript(text);
        };

        recognitionRef.current = recognition;

        return () => {
            stopAudioProcessing();
        };
    }, [hasRecognitionSupport, stopAudioProcessing]);


    const startListening = async () => {
        if (recognitionRef.current && !isListening) {
            setRecognitionError(null);
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
                setRecognitionError("Could not access the microphone.");
            }
        }
    };

    const stopListening = () => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    };

    return {
        isListening,
        transcript,
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
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={`transition-all duration-1000 ease-out -rotate-90 origin-center ${ringColor}`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <span className={`absolute font-bold ${fontSize} ${scoreColor}`}>
                {score}
            </span>
        </div>
    );
};

const PronunciationPracticeModal: React.FC<{
    targetText: string,
    ipa?: string,
    onClose: () => void,
    audioUrl?: string,
    playAudio: (url: string | undefined, speed?: number) => void,
    currentlyPlayingUrl: string | null,
    playbackSpeed: number,
    setPlaybackSpeed: (speed: number) => void,
}> = ({ targetText, ipa, onClose, audioUrl, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed }) => {
    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport, analyser, recognitionError } = useAudioRecorderAndVisualizer();
    const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const isSentence = targetText.includes(' ');

    useEffect(() => {
        const check = async () => {
            if (transcript && !isListening) {
                setIsLoading(true);
                const result = await geminiService.checkPronunciation(targetText, transcript);
                setFeedback(result);
                setIsLoading(false);
            }
        };
        check();
    }, [transcript, isListening, targetText]);
    
    const handleRecord = () => {
        setFeedback(null);
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };
    
    const getStatusInfo = () => {
        if (recognitionError) return { text: recognitionError, color: 'text-red-500' };
        if (isLoading) return { text: "AI is analyzing...", color: 'text-gray-600 dark:text-gray-300' };
        if (isListening) return { text: "Listening...", color: 'text-gray-600 dark:text-gray-300' };
        if (feedback?.isError) return { text: "Analysis Failed", color: 'text-red-500' };
        if (feedback) return { text: "Here's your feedback:", color: 'text-gray-600 dark:text-gray-300' };
        return { text: "Tap the mic to start speaking", color: 'text-gray-600 dark:text-gray-300' };
    };
    const statusInfo = getStatusInfo();


    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md p-6 text-center animate-fade-in-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="mb-6 text-center">
                    <h2 className={`font-bold ${isSentence ? 'text-2xl leading-tight' : 'text-3xl'}`}>{targetText}</h2>
                    {ipa && <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">{ipa}</p>}
                    <div className="flex items-center justify-center gap-2 mt-3">
                         <button onClick={(e) => { e.stopPropagation(); playAudio(audioUrl, playbackSpeed); }} className={`p-3 rounded-full transition-colors ${currentlyPlayingUrl === audioUrl ? 'bg-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                            <SpeakerIcon className="w-6 h-6" />
                        </button>
                        <PlaybackSpeedControl currentSpeed={playbackSpeed} onSpeedChange={setPlaybackSpeed} />
                    </div>
                </div>

                <div className="min-h-[180px] flex flex-col justify-center items-center">
                    {feedback?.isError ? (
                        <div className="flex flex-col items-center text-red-500">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="mt-2 font-semibold">Analysis Error</p>
                        </div>
                    ) : feedback ? (
                         <CircularProgress score={feedback.score} />
                    ) : (
                        <div className="flex flex-col items-center">
                            <VolumeMeter analyser={analyser} isListening={isListening} />
                             <button
                                onClick={handleRecord}
                                disabled={isLoading}
                                className={`mt-4 relative w-20 h-20 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-red-500' : 'bg-primary'} text-white shadow-lg disabled:bg-gray-400`}
                            >
                               <MicrophoneIcon className="w-8 h-8" />
                               {isListening && <span className="absolute inset-0 rounded-full bg-white/20 animate-ping"></span>}
                            </button>
                        </div>
                    )}
                </div>
                
                <p className={`${statusInfo.color} font-semibold mb-4 min-h-[24px]`}>{statusInfo.text}</p>

                {feedback && (
                    feedback.isError ? (
                        <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <p className="font-semibold">{feedback.feedback}</p>
                        </div>
                    ) : (
                        <div className="text-left bg-light-bg dark:bg-dark-bg p-4 rounded-lg space-y-3">
                            <p className="font-semibold">{feedback.feedback}</p>
                            {feedback.phoneticFeedback && feedback.phoneticFeedback.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200">Phonetic Tips:</h4>
                                    <div className="space-y-2 mt-1">
                                        {feedback.phoneticFeedback.map((pf, i) => (
                                            <div key={i} className="p-2 border-l-4 border-accent rounded-r-md bg-white dark:bg-dark-card">
                                                <p className="font-semibold">{pf.word} - <span className="text-accent font-mono">{pf.incorrectPhoneme}</span></p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">{pf.suggestion}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {feedback.suggestions.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200">{isSentence ? 'Rhythm & Intonation:' : 'General Suggestions:'}</h4>
                                    <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300">
                                        {feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            )}
                            <p className="text-xs text-gray-500 italic">You said: "{transcript}"</p>
                        </div>
                    )
                )}
                
                {!hasRecognitionSupport && (
                    <p className="text-red-500 text-sm mt-4">Your browser does not support speech recognition.</p>
                )}

                <div className="mt-6 flex gap-3">
                    <button onClick={onClose} className="w-full py-3 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Close
                    </button>
                    {feedback && (
                        <button onClick={handleRecord} className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light transition-colors">
                            Try Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const VocabularyView: React.FC<{
    words: Word[],
    onNavigate: NavigateFn,
    playAudio: (url: string | undefined, speed?: number) => void,
    currentlyPlayingUrl: string | null,
    editorContext: LessonEditorContext | null,
    onAddLesson: (name: string, description: string, wordIds: number[]) => void,
    onUpdateLesson: (lesson: CustomLesson) => void,
    setLessonEditorContext: (context: LessonEditorContext | null) => void,
    playbackSpeed: number,
    setPlaybackSpeed: (speed: number) => void,
    onAddWord: () => void;
    onDeleteWord: (wordId: number) => void;
}> = ({ words, onNavigate, playAudio, currentlyPlayingUrl, editorContext, onAddLesson, onUpdateLesson, setLessonEditorContext, playbackSpeed, setPlaybackSpeed, onAddWord, onDeleteWord }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [levelFilter, setLevelFilter] = useState<Level | 'All'>('All');
    const sortedWords = useMemo(() => words.sort((a, b) => a.word.localeCompare(b.word)), [words]);
    const filteredWords = useMemo(() => 
        sortedWords.filter(w => 
            (levelFilter === 'All' || w.level === levelFilter) &&
            w.word.toLowerCase().includes(searchTerm.toLowerCase())
        ), 
        [sortedWords, searchTerm, levelFilter]
    );
    
    const [selectedWords, setSelectedWords] = useState<Set<number>>(new Set());
    const [lessonName, setLessonName] = useState('');
    const [lessonDescription, setLessonDescription] = useState('');
    const [practiceWordId, setPracticeWordId] = useState<number | null>(null);
    const [expandedWordId, setExpandedWordId] = useState<number | null>(null);
    const [wordDetails, setWordDetails] = useState<Record<number, { isLoading: boolean; data: WordDetails | null; error: string | null }>>({});

    const handleFetchWordDetails = useCallback(async (wordId: number, word: string) => {
        if (wordDetails[wordId] && wordDetails[wordId].data) {
            setExpandedWordId(prevId => prevId === wordId ? null : wordId);
            return;
        }

        setExpandedWordId(wordId);
        setWordDetails(prev => ({ ...prev, [wordId]: { isLoading: true, data: null, error: null } }));

        const result = await geminiService.getWordDetails(word);
        setWordDetails(prev => ({
            ...prev,
            [wordId]: { isLoading: false, data: result.details || null, error: result.error || null }
        }));
    }, [wordDetails]);

    useEffect(() => {
        if (editorContext?.mode === 'edit' && editorContext.lesson) {
            setLessonName(editorContext.lesson.name);
            setLessonDescription(editorContext.lesson.description || '');
            setSelectedWords(new Set(editorContext.lesson.vocabularyIds));
        } else {
            setLessonName('');
            setLessonDescription('');
            setSelectedWords(new Set());
        }
    }, [editorContext]);

    const handleToggleWordSelection = (wordId: number) => {
        setSelectedWords(prev => {
            const newSet = new Set(prev);
            if (newSet.has(wordId)) newSet.delete(wordId);
            else newSet.add(wordId);
            return newSet;
        });
    };
    
    const handleSaveLesson = () => {
        if (!lessonName.trim() || selectedWords.size === 0) {
            alert("Please provide a lesson name and select at least one word.");
            return;
        }
        if (editorContext?.mode === 'edit' && editorContext.lesson) {
            onUpdateLesson({ ...editorContext.lesson, name: lessonName, description: lessonDescription, vocabularyIds: Array.from(selectedWords) });
        } else {
            onAddLesson(lessonName, lessonDescription, Array.from(selectedWords));
        }
        setLessonEditorContext(null);
        onNavigate(View.MyLessons);
    };

    if (editorContext) {
        return (
            <div className="p-4 sm:p-6">
                <div className="max-w-4xl mx-auto">
                    <PageHeader title={editorContext.mode === 'edit' ? 'Edit Lesson' : 'Create Lesson'} onBack={() => setLessonEditorContext(null)} />
                    <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6">
                        <input
                            type="text"
                            value={lessonName}
                            onChange={(e) => setLessonName(e.target.value)}
                            placeholder="Enter lesson name..."
                            className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                        />
                         <textarea
                            value={lessonDescription}
                            onChange={(e) => setLessonDescription(e.target.value)}
                            placeholder="Add a description..."
                            rows={3}
                            className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none resize-y"
                        />
                         <button onClick={handleSaveLesson} className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-light transition-colors mb-4">
                            Save Lesson ({selectedWords.size} words)
                        </button>
                        <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                            {sortedWords.map(word => (
                                <div key={word.id} onClick={() => handleToggleWordSelection(word.id)} className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${selectedWords.has(word.id) ? 'bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                    <div>
                                        <p className="font-bold">{word.word}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{word.meaning}</p>
                                    </div>
                                    <input type="checkbox" checked={selectedWords.has(word.id)} readOnly className="w-5 h-5 rounded text-primary focus:ring-primary pointer-events-none"/>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title="Vocabulary" onBack={() => onNavigate(View.Home)} />
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Search for a word..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                        />
                        <button onClick={onAddWord} className="flex-shrink-0 px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-sm hover:bg-secondary-dark transition-colors flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            <span>Add My Word</span>
                        </button>
                    </div>
                     <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                            {(['All', ...Object.values(Level)] as const).map(level => (
                                <button key={level} onClick={() => setLevelFilter(level)}
                                    className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${levelFilter === level ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                        {filteredWords.map(word => (
                            <WordListItem 
                                key={word.id} 
                                word={word}
                                isPracticing={practiceWordId === word.id}
                                onPracticeToggle={() => setPracticeWordId(prevId => prevId === word.id ? null : word.id)}
                                onExpand={handleFetchWordDetails}
                                isExpanded={expandedWordId === word.id}
                                details={wordDetails[word.id]}
                                onDelete={onDeleteWord}
                                playAudio={playAudio}
                                currentlyPlayingUrl={currentlyPlayingUrl}
                                playbackSpeed={playbackSpeed}
                                setPlaybackSpeed={setPlaybackSpeed}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const WordListItem: React.FC<{
    word: Word;
    isExpanded: boolean;
    details: { isLoading: boolean; data: WordDetails | null; error: string | null };
    isPracticing: boolean;
    onPracticeToggle: () => void;
    onExpand: (wordId: number, word: string) => void;
    onDelete: (wordId: number) => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
} & AudioProps> = ({ word, isExpanded, details, isPracticing, onPracticeToggle, onExpand, onDelete, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed }) => {
    const [activeTab, setActiveTab] = useState<'family' | 'synonyms' | 'antonyms'>('family');

    const renderDetails = () => {
        if (!details.data) return null;
        
        const { englishMeaning, usageContext, sentenceSuggestion, familyWords, synonyms, antonyms } = details.data;

        const tabs = [
            { key: 'family', title: 'Word Forms', data: familyWords },
            { key: 'synonyms', title: 'Synonyms', data: synonyms },
            { key: 'antonyms', title: 'Antonyms', data: antonyms },
        ].filter(tab => tab.data && tab.data.length > 0);

        const activeTabData = tabs.find(tab => tab.key === activeTab)?.data || (tabs.length > 0 ? tabs[0].data : []);
        
        const sentenceAudioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(sentenceSuggestion)}&tl=en&client=tw-ob`;

        return (
            <div className="mt-4 space-y-4">
                {englishMeaning && (
                    <div>
                        <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200">English Definition</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 italic">{englishMeaning}</p>
                    </div>
                )}
                {usageContext && (
                    <div>
                        <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200">Common Context</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{usageContext}</p>
                    </div>
                )}
                {sentenceSuggestion && (
                    <div>
                        <h4 className="font-bold text-sm text-gray-700 dark:text-gray-200">AI Example Sentence</h4>
                        <div className="flex items-start justify-between gap-2 mt-1 p-3 bg-gray-200/50 dark:bg-gray-900/50 rounded-md">
                            <p className="text-sm text-gray-800 dark:text-gray-200 flex-grow">"{sentenceSuggestion}"</p>
                            <button 
                                onClick={(e) => { e.stopPropagation(); playAudio(sentenceAudioUrl, playbackSpeed); }} 
                                className={`p-2 rounded-full flex-shrink-0 transition-colors ${currentlyPlayingUrl === sentenceAudioUrl ? 'bg-primary/20 text-primary' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                aria-label="Listen to example sentence"
                            >
                                <SpeakerIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
                {tabs.length > 0 && (
                    <div>
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            {tabs.map(tab => (
                                <button key={tab.key} onClick={(e) => { e.stopPropagation(); setActiveTab(tab.key as any); }}
                                    className={`px-4 py-2 text-sm font-semibold -mb-px border-b-2 transition-colors ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                                    {tab.title}
                                </button>
                            ))}
                        </div>
                        <div className="p-3">
                            <div className="flex flex-wrap gap-2">
                                {activeTabData.map(item => (
                                    <span key={item.word} className="bg-gray-200 dark:bg-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">{item.word} <i className="text-gray-500">({item.meaning})</i></span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 bg-light-bg dark:bg-dark-bg rounded-xl">
            <div className="flex justify-between items-start gap-2">
                <div className="flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold">{word.word}</h3>
                        <span className="text-base font-normal text-gray-500 dark:text-gray-400">{word.ipa}</span>
                        <span className="text-xs font-bold text-secondary-dark bg-secondary/20 px-2 py-0.5 rounded-full">{word.level}</span>
                        {word.isCustom && <span className="text-xs font-semibold bg-accent/20 text-accent-dark px-2 py-0.5 rounded-full">Custom</span>}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{word.meaning}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {word.isCustom && (
                        <button onClick={() => onDelete(word.id)} className="p-2 rounded-full hover:bg-red-500/10" aria-label={`Delete ${word.word}`}><svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg></button>
                    )}
                    <button onClick={onPracticeToggle} className="p-2 rounded-full hover:bg-emerald-500/10" aria-label={`Practice ${word.word}`}>
                        <MicrophoneIcon className={`w-5 h-5 transition-colors ${isPracticing ? 'text-primary' : 'text-emerald-500'}`} />
                    </button>
                    <button onClick={() => playAudio(word.audioUrl, playbackSpeed)} className={`p-2 rounded-full hover:bg-primary/10 ${currentlyPlayingUrl === word.audioUrl ? 'text-primary' : ''}`} aria-label={`Listen to ${word.word}`}><SpeakerIcon className="w-5 h-5" /></button>
                    <button onClick={() => onExpand(word.id, word.word)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={`Details for ${word.word}`}><ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></button>
                </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 border-l-4 border-primary/50 pl-3">
                <p>"{word.example.en}"</p>
                <p className="italic">"{word.example.vi}"</p>
            </div>
            {isExpanded && (
                <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-2 animate-fade-in">
                    {details?.isLoading && <p className="text-sm text-gray-500 italic px-4 py-2">Loading details...</p>}
                    {details?.error && <p className="text-red-500 text-sm px-4 py-2">{details.error}</p>}
                    {details?.data && renderDetails()}
                </div>
            )}
             {isPracticing && (
                <InlinePronunciationPractice
                    targetText={word.word}
                    ipa={word.ipa}
                    audioUrl={word.audioUrl}
                    playAudio={playAudio}
                    currentlyPlayingUrl={currentlyPlayingUrl}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                />
            )}
        </div>
    );
};

const InlinePronunciationPractice: React.FC<{
    targetText: string,
    ipa?: string,
    audioUrl?: string,
    playAudio: (url: string | undefined, speed?: number) => void,
    currentlyPlayingUrl: string | null,
    playbackSpeed: number,
    setPlaybackSpeed: (speed: number) => void,
}> = ({ targetText, ipa, audioUrl, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed }) => {
    const { isListening, transcript, startListening, stopListening, hasRecognitionSupport, analyser, recognitionError } = useAudioRecorderAndVisualizer();
    const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    useEffect(() => {
        const check = async () => {
            if (transcript && !isListening) {
                setIsLoading(true);
                setFeedback(null);
                const result = await geminiService.checkPronunciation(targetText, transcript);
                setFeedback(result);
                setIsLoading(false);
            }
        };
        check();
    }, [transcript, isListening, targetText]);
    
    const handleRecord = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFeedback(null);
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };
    
    const handlePracticeAgain = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFeedback(null);
        startListening();
    };

    const getStatusInfo = () => {
        if (recognitionError) return { text: recognitionError, color: 'text-red-500' };
        if (isLoading) return { text: "AI is analyzing...", color: 'text-gray-500 dark:text-gray-400' };
        if (isListening) return { text: "Listening...", color: 'text-primary' };
        if (feedback) return { text: "Here's your feedback:", color: 'text-gray-600 dark:text-gray-300' };
        return { text: "Tap the mic to start speaking", color: 'text-gray-500 dark:text-gray-400' };
    };
    const statusInfo = getStatusInfo();
    
    return (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg animate-fade-in" onClick={e => e.stopPropagation()}>
            {!feedback && (
                <div className="flex flex-col items-center justify-center min-h-[150px]">
                    {isListening ? (
                         <VolumeMeter analyser={analyser} isListening={isListening} />
                    ) : (
                         <button
                            onClick={handleRecord}
                            disabled={isLoading}
                            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors bg-primary text-white shadow-lg disabled:bg-gray-400 transform hover:scale-105`}
                        >
                           <MicrophoneIcon className="w-8 h-8" />
                        </button>
                    )}
                    <p className={`mt-3 font-semibold text-sm ${statusInfo.color} min-h-[20px] text-center`}>{statusInfo.text}</p>
                </div>
            )}
            {feedback?.isError && (
                <div className="text-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="font-semibold">{feedback.feedback}</p>
                     <button onClick={handlePracticeAgain} className="mt-3 text-sm font-semibold text-primary hover:underline">
                        Try Again
                    </button>
                </div>
            )}
            {feedback && !feedback.isError && (
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="flex-shrink-0">
                        <CircularProgress score={feedback.score} size={80} />
                    </div>
                    <div className="flex-grow text-left space-y-2 w-full">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{feedback.feedback}</p>
                        {feedback.suggestions.length > 0 && (
                            <div>
                                <h4 className="font-bold text-xs text-gray-700 dark:text-gray-200">Suggestions:</h4>
                                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                                    {feedback.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 italic">You said: "{transcript}"</p>
                         <button onClick={handlePracticeAgain} className="text-sm font-semibold text-primary hover:underline">
                            Practice Again
                        </button>
                    </div>
                </div>
            )}
            {!hasRecognitionSupport && (
                <p className="text-red-500 text-sm mt-4 text-center">Your browser does not support speech recognition.</p>
            )}
        </div>
    );
};


const AddConversationModal: React.FC<{
    onClose: () => void;
    onAddConversation: (conversation: Conversation) => void;
}> = ({ onClose, onAddConversation }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Custom');
    const [rawText, setRawText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createTtsApiUrl = (text: string, lang: string = 'en') => `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;

    const handleSubmit = async () => {
        if (!title.trim() || !rawText.trim()) {
            setError('Title and conversation text cannot be empty.');
            return;
        }
        setIsLoading(true);
        setError(null);

        const result = await geminiService.parseAndTranslateConversation(rawText, title, category);

        if (result.error || !result.conversation) {
            setError(result.error || 'An unknown error occurred.');
            setIsLoading(false);
            return;
        }

        const newConversation: Conversation = {
            id: new Date().toISOString() + Math.random(),
            title: result.conversation.title,
            category: result.conversation.category,
            level: result.conversation.level,
            isCustom: true,
            lines: result.conversation.lines.map((line: Omit<ConversationLine, 'audioUrl'|'ipa'>) => ({
                ...line,
                audioUrl: createTtsApiUrl(line.sentence)
            })),
        };
        
        onAddConversation(newConversation);
        setIsLoading(false);
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg p-6 animate-fade-in-up max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-center">Add Custom Conversation</h2>
                <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-4">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Conversation Title"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                    />
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        placeholder={"Enter your conversation here.\nFormat: Speaker: Sentence\n\nExample:\nTom: Hi, how are you?\nJane: I'm doing great, thanks!"}
                        rows={10}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none resize-y font-mono text-sm"
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button onClick={onClose} className="w-full py-3 bg-gray-200 dark:bg-gray-600 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isLoading} className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-light transition-colors disabled:bg-gray-400 flex items-center justify-center">
                        {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Analyze & Create'}
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
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
    onAddConversation: (conversation: Conversation) => void;
    onDeleteConversation: (conversationId: string) => void;
    onAddSentence: () => void;
    onDeleteSentence: (sentenceId: number) => void;
    onUpdateSentence: (sentence: Sentence) => void;
} & AudioProps> = ({ sentences, conversations, onNavigate, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed, onAddConversation, onDeleteConversation, onAddSentence, onDeleteSentence, onUpdateSentence }) => {
    const [activeTab, setActiveTab] = useState<'sentences' | 'conversations'>('sentences');
    
    const categories = useMemo(() => ['All Topics', ...Array.from(new Set(sentences.map(s => s.category)))], [sentences]);
    const [selectedCategory, setSelectedCategory] = useState('All Topics');

    const [practiceItemId, setPracticeItemId] = useState<number | string | null>(null);
    const [grammarExplanations, setGrammarExplanations] = useState<Record<number, { isLoading: boolean; data: string | null; error: string | null }>>({});
    const [refinedMeanings, setRefinedMeanings] = useState<Record<number, { isLoading: boolean; data: string | null; error: string | null }>>({});
    const [showAddConvModal, setShowAddConvModal] = useState(false);

    const [exampleWord, setExampleWord] = useState('');
    const [generatedExamples, setGeneratedExamples] = useState<Example[] | null>(null);
    const [isGeneratingExamples, setIsGeneratingExamples] = useState(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const handleGenerateExamples = async () => {
        if (!exampleWord.trim()) {
            setGenerationError("Please enter a word to generate examples.");
            return;
        }
        setIsGeneratingExamples(true);
        setGeneratedExamples(null);
        setGenerationError(null);

        const result = await geminiService.generateExampleSentences(exampleWord.trim());

        if (result.examples) {
            setGeneratedExamples(result.examples);
        } else {
            setGenerationError(result.error || "Failed to generate examples.");
        }

        setIsGeneratingExamples(false);
    };

    const handleFetchGrammarExplanation = async (sentence: Sentence) => {
        const currentState = grammarExplanations[sentence.id];

        if (currentState) { // If it exists (data, loading, or error), toggle it off
            setGrammarExplanations(prev => {
                const newState = { ...prev };
                delete newState[sentence.id];
                return newState;
            });
            return;
        }

        setGrammarExplanations(prev => ({
            ...prev,
            [sentence.id]: { isLoading: true, data: null, error: null }
        }));

        const explanation = await geminiService.generateGrammarExplanation(sentence.sentence);
        const isError = explanation.includes("Đã xảy ra lỗi");

        setGrammarExplanations(prev => ({
            ...prev,
            [sentence.id]: { 
                isLoading: false, 
                data: isError ? null : explanation, 
                error: isError ? explanation : null 
            }
        }));
    };

    const handleRefineMeaning = async (sentence: Sentence) => {
        const currentState = refinedMeanings[sentence.id];
         if (currentState) {
            setRefinedMeanings(prev => { const newState = { ...prev }; delete newState[sentence.id]; return newState; });
            return;
        }
        setRefinedMeanings(prev => ({ ...prev, [sentence.id]: { isLoading: true, data: null, error: null } }));
        const result = await geminiService.refineVietnameseMeaning(sentence.sentence, sentence.meaning);
        setRefinedMeanings(prev => ({ ...prev, [sentence.id]: { isLoading: false, data: result.refinedMeaning || null, error: result.error || null } }));
    };
    
    const handleAcceptRefinement = (sentence: Sentence, newMeaning: string) => {
        onUpdateSentence({ ...sentence, meaning: newMeaning });
        setRefinedMeanings(prev => { const newState = { ...prev }; delete newState[sentence.id]; return newState; });
    };

    const filteredSentences = useMemo(() => {
        if (selectedCategory === 'All Topics') {
            return sentences;
        }
        return sentences.filter(s => s.category === selectedCategory);
    }, [sentences, selectedCategory]);
    
    const [expandedConversationId, setExpandedConversationId] = useState<string | null>(null);
    
    const toggleConversation = (id: string) => {
        setExpandedConversationId(prevId => (prevId === id ? null : id));
    };

    return (
         <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title="Common Sentences" onBack={() => onNavigate(View.Home)} />
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg">
                    <div className="flex border-b border-gray-200 dark:border-gray-700 p-2">
                        <button onClick={() => setActiveTab('sentences')} className={`w-1/2 py-2.5 font-semibold rounded-lg transition-colors ${activeTab === 'sentences' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Common Phrases</button>
                        <button onClick={() => setActiveTab('conversations')} className={`w-1/2 py-2.5 font-semibold rounded-lg transition-colors ${activeTab === 'conversations' ? 'bg-primary text-white shadow' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Conversations</button>
                    </div>

                    <div className="p-4 sm:p-6">
                        {activeTab === 'sentences' && (
                            <>
                                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-xl">
                                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                        <AITutorIcon className="w-6 h-6 text-primary" />
                                        AI Example Sentence Generator
                                    </h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Enter an English word to see it used in context.</p>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="text"
                                            value={exampleWord}
                                            onChange={(e) => setExampleWord(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateExamples()}
                                            placeholder="e.g., 'serendipity'"
                                            className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none"
                                        />
                                        <button 
                                            onClick={handleGenerateExamples}
                                            disabled={isGeneratingExamples}
                                            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-light transition-colors flex items-center justify-center disabled:bg-gray-400"
                                        >
                                            {isGeneratingExamples ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <span>Generate</span>
                                            )}
                                        </button>
                                    </div>
                                    
                                    <div className="mt-4">
                                        {isGeneratingExamples && (
                                            <div className="space-y-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className="p-3 bg-white dark:bg-dark-bg rounded-lg animate-pulse">
                                                        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                                                        <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {generationError && (
                                            <p className="text-red-500 text-center font-medium p-2">{generationError}</p>
                                        )}
                                        {generatedExamples && (
                                            <div className="space-y-3 animate-fade-in">
                                                <h5 className="font-bold mt-2">Generated Examples:</h5>
                                                {generatedExamples.map((ex, index) => (
                                                    <div key={index} className="p-3 bg-white dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700">
                                                        <div className="flex justify-between items-start gap-3">
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-gray-800 dark:text-gray-100">{ex.en}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-1">{ex.vi}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => playAudio(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(ex.en)}&tl=en&client=tw-ob`, playbackSpeed)} 
                                                                className="p-2 rounded-full hover:bg-primary/10"
                                                                aria-label={`Listen to "${ex.en}"`}
                                                            >
                                                                <SpeakerIcon className={`w-5 h-5 transition-colors ${currentlyPlayingUrl?.includes(encodeURIComponent(ex.en)) ? 'text-primary' : 'text-gray-500'}`} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                                    <div className="flex-grow">
                                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full p-3 bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-700 rounded-lg font-semibold">
                                            {categories.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button onClick={onAddSentence} className="flex-shrink-0 px-4 py-2 bg-secondary text-white font-semibold rounded-lg shadow-sm hover:bg-secondary-dark transition-colors flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                        <span>Add My Sentence</span>
                                    </button>
                                </div>
                                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {filteredSentences.map(sentence => {
                                    const grammarState = grammarExplanations[sentence.id];
                                    const refinementState = refinedMeanings[sentence.id];
                                    const isGrammarExpanded = !!grammarState;
                                    const isRefineExpanded = !!refinementState;
                                    const isPracticing = practiceItemId === sentence.id;
                                    return (
                                        <div key={sentence.id} className="bg-light-bg dark:bg-dark-bg rounded-xl overflow-hidden transition-all duration-300 shadow-sm border border-transparent hover:border-primary/20 hover:shadow-md">
                                            <div className="p-4">
                                                <div className="flex justify-between items-start gap-3">
                                                    <div className="flex-1">
                                                        <p className={`transition-colors duration-300 font-semibold text-gray-800 dark:text-gray-100`}>{sentence.sentence}</p>
                                                        <p className={`text-sm mt-1 transition-colors duration-300 text-gray-500 dark:text-gray-400`}>{sentence.meaning}</p>
                                                    </div>
                                                    <div className="flex items-center flex-shrink-0">
                                                        {sentence.isCustom && (
                                                            <button onClick={() => onDeleteSentence(sentence.id)} className="p-2 rounded-full hover:bg-red-500/10" aria-label="Delete sentence">
                                                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                                            </button>
                                                        )}
                                                        <button onClick={() => playAudio(sentence.audioUrl, playbackSpeed)} className={`p-2 rounded-full hover:bg-primary/10 ${currentlyPlayingUrl === sentence.audioUrl ? 'text-primary' : 'text-gray-500'}`}>
                                                            <SpeakerIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleFetchGrammarExplanation(sentence)} disabled={grammarState?.isLoading} className={`flex items-center gap-1.5 text-sm font-semibold p-2 rounded-md transition-colors disabled:opacity-50 ${isGrammarExpanded ? 'bg-secondary/10 text-secondary-dark' : 'text-gray-500 hover:bg-secondary/10 hover:text-secondary-dark'}`}>
                                                            <GrammarIcon className="w-4 h-4" /> <span>Grammar</span>
                                                        </button>
                                                        <button onClick={() => handleRefineMeaning(sentence)} disabled={refinementState?.isLoading} className={`flex items-center gap-1.5 text-sm font-semibold p-2 rounded-md transition-colors disabled:opacity-50 ${isRefineExpanded ? 'bg-accent/10 text-accent' : 'text-gray-500 hover:bg-accent/10 hover:text-accent'}`}>
                                                            <AITutorIcon className="w-4 h-4" /> <span>Refine</span>
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-secondary-dark bg-secondary/20 px-2 py-0.5 rounded-full">{sentence.level}</span>
                                                        <button onClick={() => setPracticeItemId(prevId => prevId === sentence.id ? null : sentence.id)} className={`p-2 rounded-md transition-colors ${isPracticing ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-primary/10 hover:text-primary'}`} aria-label={`Practice pronunciation of "${sentence.sentence}"`}>
                                                            <MicrophoneIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {isGrammarExpanded && (
                                                <div className="px-4 pb-4 animate-fade-in">
                                                    {grammarState.isLoading && <p className="text-sm text-gray-500">Analyzing grammar...</p>}
                                                    {grammarState.error && <p className="text-red-500 text-sm">{grammarState.error}</p>}
                                                    {grammarState.data && (
                                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-4 border-blue-400">
                                                            <h5 className="font-bold text-sm mb-1 text-blue-800 dark:text-blue-300">Grammar Explanation</h5>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{grammarState.data}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {isRefineExpanded && (
                                                <div className="px-4 pb-4 animate-fade-in">
                                                    {refinementState.isLoading && <p className="text-sm text-gray-500">AI is thinking...</p>}
                                                    {refinementState.error && <p className="text-red-500 text-sm">{refinementState.error}</p>}
                                                    {refinementState.data && (
                                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border-l-4 border-amber-400">
                                                            <div className="flex justify-between items-center">
                                                                <div>
                                                                    <h5 className="font-bold text-sm text-amber-800 dark:text-amber-300">AI Suggestion</h5>
                                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{refinementState.data}</p>
                                                                </div>
                                                                {sentence.isCustom && (
                                                                    <button onClick={() => handleAcceptRefinement(sentence, refinementState.data!)} className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-light transition-colors">
                                                                        Accept
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {isPracticing && (
                                                <InlinePronunciationPractice
                                                    targetText={sentence.sentence}
                                                    ipa={sentence.ipa}
                                                    audioUrl={sentence.audioUrl}
                                                    playAudio={playAudio}
                                                    currentlyPlayingUrl={currentlyPlayingUrl}
                                                    playbackSpeed={playbackSpeed}
                                                    setPlaybackSpeed={setPlaybackSpeed}
                                                />
                                            )}
                                        </div>
                                    )
                                })}
                                </div>
                            </>
                        )}
                        {activeTab === 'conversations' && (
                             <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                                <button onClick={() => setShowAddConvModal(true)} className="w-full p-4 mb-2 text-center font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-lg hover:bg-primary/20 transition-colors">
                                    + Add My Conversation
                                </button>
                                {conversations.map(convo => {
                                    const isExpanded = expandedConversationId === convo.id;
                                    return (
                                        <div key={convo.id} className="bg-light-bg dark:bg-dark-bg rounded-xl transition-all duration-300">
                                            <div 
                                                className="w-full flex justify-between items-center p-4 text-left font-bold text-lg cursor-pointer"
                                                onClick={() => toggleConversation(convo.id)}
                                                aria-expanded={isExpanded} aria-controls={`convo-content-${convo.id}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{convo.title}</span>
                                                    {convo.isCustom && <span className="text-xs font-semibold bg-secondary/20 text-secondary-dark dark:text-secondary-light px-2 py-0.5 rounded-full">Custom</span>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {convo.isCustom && (
                                                        <button onClick={(e) => {e.stopPropagation(); onDeleteConversation(convo.id)}} className="p-2 rounded-full hover:bg-red-500/10" aria-label="Delete conversation">
                                                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                                                        </button>
                                                    )}
                                                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                </div>
                                            </div>
                                            <div 
                                                id={`convo-content-${convo.id}`}
                                                className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[500px] overflow-y-auto' : 'max-h-0 overflow-hidden'}`}
                                            >
                                                <div className="px-4 pb-4 pt-2 space-y-3 border-t border-gray-200 dark:border-gray-700">
                                                    {convo.lines.map((line, index) => {
                                                        const lineId = `${convo.id}-${index}`;
                                                        const isPracticing = practiceItemId === lineId;
                                                        return (
                                                        <div key={index} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                                            <div className="flex justify-between items-start gap-3">
                                                                <div className="flex-1">
                                                                    <p><span className="font-semibold">{line.speaker}:</span> {line.sentence}</p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic">{line.meaning}</p>
                                                                </div>
                                                                <div className="flex items-center flex-shrink-0 gap-1">
                                                                    <button onClick={() => setPracticeItemId(prevId => prevId === lineId ? null : lineId)} className="p-2 rounded-full hover:bg-emerald-500/10" aria-label={`Practice pronunciation of "${line.sentence}"`}>
                                                                        <MicrophoneIcon className={`w-5 h-5 transition-colors ${isPracticing ? 'text-primary' : 'text-emerald-500'}`} />
                                                                    </button>
                                                                    <button onClick={(e) => { e.stopPropagation(); playAudio(line.audioUrl, playbackSpeed); }} className={`p-2 rounded-full hover:bg-primary/10 ${currentlyPlayingUrl === line.audioUrl ? 'text-primary' : ''}`}>
                                                                        <SpeakerIcon className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                             {isPracticing && (
                                                                <InlinePronunciationPractice
                                                                    targetText={line.sentence}
                                                                    ipa={line.ipa}
                                                                    audioUrl={line.audioUrl}
                                                                    playAudio={playAudio}
                                                                    currentlyPlayingUrl={currentlyPlayingUrl}
                                                                    playbackSpeed={playbackSpeed}
                                                                    setPlaybackSpeed={setPlaybackSpeed}
                                                                />
                                                            )}
                                                        </div>
                                                    )})}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
                 {showAddConvModal && (
                    <AddConversationModal 
                        onClose={() => setShowAddConvModal(false)}
                        onAddConversation={onAddConversation}
                    />
                )}
            </div>
        </div>
    );
};

const FlashcardView: React.FC<{
    onNavigate: NavigateFn,
    practiceContext: PracticeContext,
    customLessons: CustomLesson[],
    allWords: Word[],
    allSentences: Sentence[],
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
} & AudioProps> = ({ onNavigate, playAudio, currentlyPlayingUrl, practiceContext, customLessons, allWords, allSentences, playbackSpeed, setPlaybackSpeed }) => {
    
    const [practiceType, setPracticeType] = useState<'word' | 'sentence'>('word');
    const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

    const getInitialQueue = useCallback(() => {
        if (practiceContext.mode === 'custom' && practiceContext.lessonId) {
            const lesson = customLessons.find(l => l.id === practiceContext.lessonId);
            if (!lesson) return [];
            const allItems = srsService.getAllReviewItems();
            const lessonWordIds = new Set(lesson.vocabularyIds);
            return allItems.filter(item => item.type === 'word' && lessonWordIds.has(item.id));
        }
        return srsService.getReviewQueue().filter(item => item.type === practiceType);
    }, [practiceContext, customLessons, practiceType]);
    
    const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>(getInitialQueue);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        setReviewQueue(getInitialQueue());
        setCurrentItemIndex(0);
        setIsFlipped(false);
    }, [getInitialQueue]);

    const currentItem = reviewQueue[currentItemIndex];
    
    const currentCardData = useMemo(() => {
        if (!currentItem) return null;
        if (currentItem.type === 'word') return allWords.find(w => w.id === currentItem.id);
        return allSentences.find(s => s.id === currentItem.id);
    }, [currentItem, allWords, allSentences]);
    
    const handleResponse = (quality: number) => {
        if (!currentItem || reviewFeedback) return;
        const updatedItem = srsService.updateReviewItem(currentItem, quality);

        if (updatedItem) {
            let feedbackText = '';
            if (updatedItem.interval < 1) {
                feedbackText = `Review again today.`;
            } else if (updatedItem.interval === 1) {
                feedbackText = `Next review tomorrow.`;
            } else {
                feedbackText = `Next review in ${updatedItem.interval} days.`;
            }
            setReviewFeedback(feedbackText);
        }

        setTimeout(() => {
            setReviewFeedback(null);
            setIsFlipped(false);
            
            setTimeout(() => {
                if (currentItemIndex < reviewQueue.length - 1) {
                    setCurrentItemIndex(prev => prev + 1);
                } else {
                    setReviewQueue(getInitialQueue());
                    setCurrentItemIndex(0);
                }
            }, 300); // Wait for card to flip back before changing content
        }, 1500); // Time to show feedback
    };
    
    if (reviewQueue.length === 0) {
        const message = practiceContext.mode === 'custom'
            ? "You've reviewed all words in this lesson."
            : `You've completed all due ${practiceType} flashcards. Great job!`;
            
        return (
            <div className="p-4 sm:p-6 text-center">
                 <div className="max-w-md mx-auto">
                    <PageHeader title="Flashcards" onBack={() => onNavigate(practiceContext.originView)} />
                    {practiceContext.mode === 'all' && (
                        <div className="flex p-1 bg-light-bg dark:bg-dark-bg rounded-lg mb-4">
                            <button onClick={() => setPracticeType('word')} className={`w-1/2 py-2 font-semibold rounded-md transition-colors ${practiceType === 'word' ? 'bg-primary text-white shadow' : 'text-gray-500'}`}>Words</button>
                            <button onClick={() => setPracticeType('sentence')} className={`w-1/2 py-2 font-semibold rounded-md transition-colors ${practiceType === 'sentence' ? 'bg-primary text-white shadow' : 'text-gray-500'}`}>Sentences</button>
                        </div>
                    )}
                    <div className="p-8 bg-white dark:bg-dark-card rounded-2xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-2">All Done!</h2>
                        <p className="text-gray-600 dark:text-gray-400">{message}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!currentCardData) {
        return <div className="p-4 sm:p-6 text-center">Error: Could not load card data.</div>
    }
    
    const isWord = 'word' in currentCardData;
    
    const handleFlip = () => {
        if (!isFlipped) setIsFlipped(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
        }
    };

    const progressPercentage = reviewQueue.length > 0 ? ((currentItemIndex + 1) / reviewQueue.length) * 100 : 0;

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-md mx-auto">
                <PageHeader title="Flashcards" onBack={() => onNavigate(practiceContext.originView)} rightContent={<span className="font-semibold text-sm">{currentItemIndex + 1}/{reviewQueue.length}</span>} />
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                    <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>

                {practiceContext.mode === 'all' && (
                    <div className="flex p-1 bg-light-bg dark:bg-dark-bg rounded-lg mb-4">
                        <button onClick={() => setPracticeType('word')} className={`w-1/2 py-2 font-semibold rounded-md transition-colors ${practiceType === 'word' ? 'bg-primary text-white shadow' : 'text-gray-500'}`}>Words</button>
                        <button onClick={() => setPracticeType('sentence')} className={`w-1/2 py-2 font-semibold rounded-md transition-colors ${practiceType === 'sentence' ? 'bg-primary text-white shadow' : 'text-gray-500'}`}>Sentences</button>
                    </div>
                )}

                <div 
                    className="[perspective:1000px] group"
                    onClick={handleFlip}
                    onKeyDown={handleKeyDown}
                    tabIndex={isFlipped ? -1 : 0}
                    role="button"
                    aria-label={`Flashcard for ${isWord ? currentCardData.word : currentCardData.sentence}. Press to flip.`}
                >
                    <div className={`relative w-full h-80 sm:h-96 transition-transform duration-500 ease-in-out [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''} group-hover:scale-[1.02] group-focus:scale-[1.02] group-focus:outline-none group-focus:ring-2 group-focus:ring-primary/50 group-focus:ring-offset-4 group-focus:ring-offset-light-bg dark:group-focus:ring-offset-dark-bg rounded-2xl`}>
                        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-dark-card rounded-2xl shadow-xl flex flex-col justify-center items-center p-6 text-center cursor-pointer">
                            <h2 className="text-3xl sm:text-4xl font-bold">{isWord ? currentCardData.word : currentCardData.sentence}</h2>
                            {isWord && <p className="text-xl text-gray-500 dark:text-gray-400 mt-2">{currentCardData.ipa}</p>}
                            <p className="mt-8 text-sm text-gray-500">Tap or press Enter to see answer</p>
                        </div>
                         <div className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-dark-card rounded-2xl shadow-xl flex flex-col justify-center items-center p-6 text-center [transform:rotateY(180deg)]">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{currentCardData.meaning}</h2>
                            {isWord && (
                                <div className="text-center">
                                    <p className="text-lg italic text-gray-600 dark:text-gray-300">"{currentCardData.example.en}"</p>
                                    <p className="text-md text-gray-500 dark:text-gray-400 mt-1">"{currentCardData.example.vi}"</p>
                                </div>
                            )}
                             <div className="flex flex-col items-center gap-3 mt-4">
                                <PlaybackSpeedControl currentSpeed={playbackSpeed} onSpeedChange={setPlaybackSpeed} />
                                <button onClick={(e) => { e.stopPropagation(); playAudio(currentCardData.audioUrl, playbackSpeed); }} className={`p-3 rounded-full transition-colors ${currentlyPlayingUrl === currentCardData.audioUrl ? 'bg-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                                    <SpeakerIcon className="w-6 h-6" />
                                </button>
                            </div>
                            {reviewFeedback && (
                                <div className="absolute inset-0 bg-primary/90 rounded-2xl flex items-center justify-center text-white z-10 animate-fade-in flex-col gap-4 p-4">
                                    <ReviewIcon className="w-16 h-16 animate-fade-in-scale" style={{animationDelay: '100ms'}}/>
                                    <p className="text-2xl font-bold animate-fade-in-up" style={{animationDelay: '200ms'}}>{reviewFeedback}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isFlipped && (
                     <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                        <button onClick={() => handleResponse(0)} disabled={!!reviewFeedback} className="p-4 bg-red-500 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:scale-100 disabled:cursor-not-allowed">Forgot</button>
                        <button onClick={() => handleResponse(3)} disabled={!!reviewFeedback} className="p-4 bg-amber-500 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:scale-100 disabled:cursor-not-allowed">Hard</button>
                        <button onClick={() => handleResponse(4)} disabled={!!reviewFeedback} className="p-4 bg-green-500 text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:scale-100 disabled:cursor-not-allowed">Good</button>
                        <button onClick={() => handleResponse(5)} disabled={!!reviewFeedback} className="p-4 bg-primary text-white font-semibold rounded-lg shadow-md transition-all transform hover:scale-105 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:scale-100 disabled:cursor-not-allowed">Easy</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReviewView: React.FC<{
    onNavigate: NavigateFn,
    customLessons: CustomLesson[],
}> = ({ onNavigate, customLessons }) => {
    const reviewModes = [
        { title: 'All Due Flashcards', description: 'Ôn tập tất cả các thẻ đến hạn bằng SRS', practice: { mode: 'all' as const, lessonId: null, originView: View.Review }, view: View.Flashcards },
        { title: 'Quick Check (Kiểm tra nhanh)', description: 'Trắc nghiệm nhanh từ vựng', view: View.QuickCheck },
        { title: 'AI Sentence Correction', description: 'Luyện tập đặt câu với sự trợ giúp của AI', practice: { mode: 'all' as const, lessonId: null, originView: View.Review }, view: View.SentencePractice },
        ...customLessons.map(l => ({ 
            title: `Lesson: ${l.name}`, 
            description: `Ôn tập flashcard ${l.vocabularyIds.length} từ`, 
            practice: { mode: 'custom' as const, lessonId: l.id, originView: View.Review }, 
            view: View.Flashcards 
        }))
    ];

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title="Review Modes" onBack={() => onNavigate(View.Home)} />
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6">
                    <div className="space-y-3">
                        {reviewModes.map(mode => (
                            <button 
                                key={mode.title} 
                                onClick={() => onNavigate(mode.view, mode.practice ? { practice: mode.practice } : undefined)} 
                                className="w-full text-left p-4 bg-light-bg dark:bg-dark-bg rounded-xl hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                            >
                                <h3 className="font-bold text-lg">{mode.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{mode.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};

const QuickCheckView: React.FC<{ onNavigate: NavigateFn, allWords: Word[] }> = ({ onNavigate, allWords }) => {
    const QUIZ_LENGTH = 10;
    const [wordsToQuiz, setWordsToQuiz] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<{ word: Word, options: string[], answer: string } | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);

    const shuffleArray = useCallback((array: any[]) => [...array].sort(() => Math.random() - 0.5), []);

    const generateQuestion = useCallback((index: number, quizWords: Word[]) => {
        if (quizWords.length === 0 || index >= quizWords.length) return;
        const word = quizWords[index];
        const correctAnswer = word.meaning;
        const wrongAnswers = allWords.filter(w => w.id !== word.id).map(w => w.meaning);
        const shuffledWrongAnswers = shuffleArray(wrongAnswers).slice(0, 3);
        const options = shuffleArray([correctAnswer, ...shuffledWrongAnswers]);
        setCurrentQuestion({ word, options, answer: correctAnswer });
        setSelectedAnswer(null);
    }, [shuffleArray, allWords]);

    useEffect(() => {
        const selectedWords = shuffleArray(allWords).slice(0, QUIZ_LENGTH);
        setWordsToQuiz(selectedWords);
        generateQuestion(0, selectedWords);
    }, [shuffleArray, generateQuestion, allWords]);

    const handleAnswer = (option: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(option);
        if (option === currentQuestion?.answer) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < wordsToQuiz.length - 1) {
            setCurrentIndex(i => i + 1);
            generateQuestion(currentIndex + 1, wordsToQuiz);
        } else {
            alert(`Quiz finished! Your score: ${score}/${wordsToQuiz.length}`);
            onNavigate(View.Review);
        }
    };
    
    const getButtonClass = (option: string) => {
        if (!selectedAnswer) return "bg-light-bg dark:bg-dark-bg hover:bg-primary/10 dark:hover:bg-primary/20";
        if (option === currentQuestion?.answer) return "bg-green-500 text-white";
        if (option === selectedAnswer) return "bg-red-500 text-white";
        return "bg-light-bg dark:bg-dark-bg opacity-60";
    };

    if (!currentQuestion) return <div className="p-4 text-center">Loading quiz...</div>;

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                 <PageHeader title="Quick Check" onBack={() => onNavigate(View.Review)} rightContent={<div className="font-semibold">Score: {score}</div>} />
                 <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6">
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400 mb-4">Question {currentIndex + 1}/{wordsToQuiz.length}</div>
                    <div className="text-center mb-8">
                        <p className="text-gray-500 dark:text-gray-400">What is the meaning of...</p>
                        <h2 className="text-4xl font-bold my-2">{currentQuestion.word.word}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map(option => (
                            <button key={option} onClick={() => handleAnswer(option)} disabled={!!selectedAnswer} className={`w-full p-4 rounded-lg font-semibold text-left transition-colors ${getButtonClass(option)}`}>
                                {option}
                            </button>
                        ))}
                    </div>
                     {selectedAnswer && (
                        <div className="mt-8 text-center">
                            <button onClick={handleNext} className="px-10 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-light transition-colors">
                                {currentIndex < wordsToQuiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const HighlightedSentence: React.FC<{ sentence: string; mistakes: Mistake[] }> = ({ sentence, mistakes }) => {
    if (!mistakes || mistakes.length === 0) {
        return <p className="text-lg leading-relaxed">{sentence}</p>;
    }

    const incorrectParts = mistakes.map(m => m.incorrectPart).filter(Boolean);
    if (incorrectParts.length === 0) return <p className="text-lg leading-relaxed">{sentence}</p>;

    const escapedParts = incorrectParts.map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedParts.join('|')})`, 'gi');
    
    const parts = sentence.split(regex).filter(Boolean);

    return (
        <p className="text-lg leading-relaxed">
            {parts.map((part, i) =>
                incorrectParts.find(p => p.toLowerCase() === part.toLowerCase()) ?
                <span key={i} className="bg-red-200 dark:bg-red-800/60 rounded px-1 pb-0.5 font-semibold">
                    {part}
                </span> 
                : part
            )}
        </p>
    );
};

const SentencePracticeView: React.FC<{
    onNavigate: NavigateFn,
    practiceContext: PracticeContext,
    customLessons: CustomLesson[],
    allWords: Word[],
}> = ({ onNavigate, practiceContext, customLessons, allWords }) => {
    const [wordsToPractice, setWordsToPractice] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [feedback, setFeedback] = useState<SentenceFeedback | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let words: Word[];
        if (practiceContext.mode === 'custom' && practiceContext.lessonId) {
            const lesson = customLessons.find(l => l.id === practiceContext.lessonId);
            const wordIdSet = new Set(lesson?.vocabularyIds || []);
            words = allWords.filter(w => wordIdSet.has(w.id));
        } else {
             const dueWords = srsService.getReviewQueue()
                .filter(item => item.type === 'word')
                .map(item => allWords.find(w => w.id === item.id))
                .filter((w): w is Word => !!w);
            words = [...new Set(dueWords)].slice(0, 10); // Practice up to 10 due words
        }
        setWordsToPractice(words);
        setCurrentIndex(0);
        setUserInput('');
        setFeedback(null);
    }, [practiceContext, customLessons, allWords]);

    const currentWord = wordsToPractice[currentIndex];

    const handleCheckSentence = async () => {
        if (!userInput.trim() || !currentWord) return;
        setIsLoading(true);
        setFeedback(null);
        const result = await geminiService.checkUserSentence(currentWord.word, userInput);
        setFeedback(result);
        setIsLoading(false);
    };
    
    const handleNext = () => {
        if (currentIndex < wordsToPractice.length - 1) {
            setCurrentIndex(i => i + 1);
            setUserInput('');
            setFeedback(null);
        } else {
            alert("Practice session finished!");
            onNavigate(practiceContext.originView);
        }
    };

    if (wordsToPractice.length === 0) {
        return (
             <div className="p-4 sm:p-6">
                <div className="max-w-4xl mx-auto">
                    <PageHeader title="AI Sentence Practice" onBack={() => onNavigate(practiceContext.originView)} />
                    <div className="text-center p-8 bg-white dark:bg-dark-card rounded-2xl shadow-lg">
                        <p>No words to practice in this lesson or no words are due for review.</p>
                        <p className="text-sm text-gray-500 mt-2">Add words to your lesson or complete some flashcard reviews first!</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!currentWord) return <div className="p-4 text-center">Loading practice session...</div>

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                 <PageHeader title="AI Sentence Practice" onBack={() => onNavigate(practiceContext.originView)} />
                 <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6">
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400 mb-4">Word {currentIndex + 1}/{wordsToPractice.length}</div>
                    <div className="text-center mb-6">
                        <p className="text-gray-500 dark:text-gray-400">Write a sentence using the word...</p>
                        <h2 className="text-4xl font-bold my-2">{currentWord.word} <span className="text-2xl font-normal text-gray-500 dark:text-gray-400">{currentWord.ipa}</span></h2>
                        <p className="text-gray-500 dark:text-gray-300">({currentWord.meaning})</p>
                    </div>
                    <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} rows={3} placeholder="Type your sentence here..." className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none" disabled={isLoading}></textarea>
                    
                    {!feedback && (
                        <button onClick={handleCheckSentence} disabled={isLoading || !userInput.trim()} className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-light transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px]">
                            {isLoading ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Check with AI'}
                        </button>
                    )}
                    
                    {isLoading && (
                        <div className="mt-6 p-4 rounded-xl bg-light-bg dark:bg-dark-bg text-center">
                            <div className="flex justify-center items-center gap-2 text-gray-500 dark:text-gray-400">
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                <p className="font-semibold">AI is checking your sentence...</p>
                            </div>
                        </div>
                    )}

                    {feedback && !isLoading && (
                        <div className="mt-6 p-4 rounded-xl bg-light-bg dark:bg-dark-bg animate-fade-in">
                            {feedback.isError ? (
                                <div className="text-center p-6 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-2 border-amber-200 dark:border-amber-700">
                                    <svg className="w-16 h-16 text-amber-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    <h3 className="font-bold text-xl text-amber-800 dark:text-amber-300">Analysis Failed</h3>
                                    <p className="text-amber-700 dark:text-amber-400 mt-1">{feedback.feedback}</p>
                                    <p className="text-sm mt-4 text-gray-500 dark:text-gray-400">Here's an example: <br/><em>"{currentWord.example.en}"</em></p>
                                </div>
                            ) : feedback.isCorrect ? (
                                <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-700">
                                    <svg className="w-16 h-16 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <h3 className="font-bold text-2xl text-green-800 dark:text-green-300">Excellent!</h3>
                                    <p className="text-green-700 dark:text-green-400 mt-1">{feedback.feedback}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">{feedback.feedback}</h3>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Your Sentence:</label>
                                        <div className="p-3 mt-1 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700"><HighlightedSentence sentence={userInput} mistakes={feedback.mistakes} /></div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Corrected Sentence:</label>
                                        <div className="p-3 mt-1 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                                            <p className="text-lg text-green-800 dark:text-green-300 font-semibold">{feedback.correctedSentence}</p>
                                        </div>
                                    </div>
                                    {feedback.mistakes.length > 0 && (
                                    <div>
                                        <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Explanations:</label>
                                        <div className="space-y-3 mt-2">
                                            {feedback.mistakes.map((mistake, index) => (
                                                <div key={index} className="p-3 border-l-4 border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 rounded-r-lg">
                                                    <p className="font-semibold text-sm">
                                                        <span className="px-1.5 py-0.5 rounded bg-red-200 dark:bg-red-800/60 text-red-800 dark:text-red-200 line-through">{mistake.incorrectPart}</span>
                                                        <span className="mx-2">→</span>
                                                        <span className="px-1.5 py-0.5 rounded bg-green-200 dark:bg-green-800/60 text-green-800 dark:text-green-200">{mistake.suggestion}</span>
                                                    </p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-400 mt-2">{mistake.explanation} <span className="font-semibold">({mistake.type})</span></p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {feedback && !isLoading && (
                         <div className="mt-6 text-center">
                            <button onClick={handleNext} className="px-8 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-secondary-dark transition-colors">
                                {currentIndex < wordsToPractice.length - 1 ? 'Next Word' : 'Finish Practice'}
                            </button>
                        </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

const FillInTheBlankView: React.FC<{
    onNavigate: NavigateFn,
    practiceContext: PracticeContext,
    allWords: Word[],
}> = ({ onNavigate, practiceContext, allWords }) => {
    const [lessonWords, setLessonWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<{ sentence: string, options: string[], answer: string } | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);

    const shuffleArray = useCallback((array: any[]) => [...array].sort(() => Math.random() - 0.5), []);

    const generateQuestion = useCallback((index: number, wordsForQuiz: Word[]) => {
        if (wordsForQuiz.length === 0 || index >= wordsForQuiz.length) return;
        const word = wordsForQuiz[index];
        const blankedSentence = word.example.en.replace(new RegExp(`\\b${word.word}\\b`, 'gi'), '______');
        const correctAnswer = word.word;
        const wrongAnswers = allWords.filter(w => w.id !== word.id).map(w => w.word);
        const shuffledWrongAnswers = shuffleArray(wrongAnswers).slice(0, 3);
        const options = shuffleArray([correctAnswer, ...shuffledWrongAnswers]);
        setCurrentQuestion({ sentence: blankedSentence, options, answer: correctAnswer });
        setSelectedAnswer(null);
    }, [allWords, shuffleArray]);

    useEffect(() => {
        if (practiceContext.mode === 'custom' && practiceContext.lessonId) {
            const lesson = lessonService.getCustomLessons().find(l => l.id === practiceContext.lessonId);
            const wordIdSet = new Set(lesson?.vocabularyIds || []);
            const words = allWords.filter(w => wordIdSet.has(w.id));
            setLessonWords(words);
            generateQuestion(0, words);
        }
    }, [practiceContext, allWords, generateQuestion]);

    const handleAnswer = (option: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(option);
        if (option === currentQuestion?.answer) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < lessonWords.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            generateQuestion(nextIndex, lessonWords);
        } else {
            alert(`Quiz finished! Your score: ${score}/${lessonWords.length}`);
            onNavigate(View.LessonDetail);
        }
    };
    
    const getButtonClass = (option: string) => {
        if (!selectedAnswer) return "bg-light-bg dark:bg-dark-bg hover:bg-primary/10 dark:hover:bg-primary/20";
        if (option === currentQuestion?.answer) return "bg-green-500 text-white";
        if (option === selectedAnswer) return "bg-red-500 text-white";
        return "bg-light-bg dark:bg-dark-bg opacity-60";
    };
    
    if (lessonWords.length === 0) {
       return (<div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title="Fill in the Blank" onBack={() => onNavigate(View.LessonDetail)} />
                <div className="text-center p-8 bg-white dark:bg-dark-card rounded-2xl shadow-lg">No words in this lesson to practice.</div>
            </div>
        </div>)
    }

    if (!currentQuestion) return <div className="p-4 text-center">Loading quiz...</div>;

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                 <PageHeader title="Fill in the Blank" onBack={() => onNavigate(View.LessonDetail)} rightContent={<div className="font-semibold">Score: {score}</div>} />
                 <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6">
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400 mb-4">Question {currentIndex + 1}/{lessonWords.length}</div>
                    <div className="text-center mb-8 min-h-[100px] flex flex-col justify-center">
                        <p className="text-2xl font-semibold my-2 leading-relaxed">{currentQuestion.sentence}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map(option => (
                            <button key={option} onClick={() => handleAnswer(option)} disabled={!!selectedAnswer} className={`w-full p-4 rounded-lg font-semibold text-left transition-colors ${getButtonClass(option)}`}>
                                {option}
                            </button>
                        ))}
                    </div>
                     {selectedAnswer && (
                        <div className="mt-8 text-center">
                            <button onClick={handleNext} className="px-10 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-light transition-colors">
                                {currentIndex < lessonWords.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ListeningPracticeView: React.FC<{
    onNavigate: NavigateFn,
    practiceContext: PracticeContext,
    allWords: Word[],
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => void;
} & AudioProps> = ({ onNavigate, practiceContext, allWords, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed }) => {
    const QUIZ_LENGTH = 10;
    const [lessonWords, setLessonWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState<{ word: Word, options: string[], answer: string } | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);

    const shuffleArray = useCallback((array: any[]) => [...array].sort(() => Math.random() - 0.5), []);
    
    const generateQuestion = useCallback((index: number, wordsForQuiz: Word[]) => {
        if (wordsForQuiz.length === 0 || index >= wordsForQuiz.length) return;
        const word = wordsForQuiz[index];
        const correctAnswer = word.word;
        const wrongAnswers = allWords.filter(w => w.id !== word.id).map(w => w.word);
        const shuffledWrongAnswers = shuffleArray(wrongAnswers).slice(0, 3);
        const options = shuffleArray([correctAnswer, ...shuffledWrongAnswers]);
        setCurrentQuestion({ word, options, answer: correctAnswer });
        setSelectedAnswer(null);
        playAudio(word.audioUrl, playbackSpeed);
    }, [allWords, shuffleArray, playAudio, playbackSpeed]);

    useEffect(() => {
        let words: Word[];
        if (practiceContext.mode === 'custom' && practiceContext.lessonId) {
            const lesson = lessonService.getCustomLessons().find(l => l.id === practiceContext.lessonId);
            const wordIdSet = new Set(lesson?.vocabularyIds || []);
            words = allWords.filter(w => wordIdSet.has(w.id));
        } else {
             words = shuffleArray(allWords).slice(0, QUIZ_LENGTH);
        }
        setLessonWords(words);
        generateQuestion(0, words);
    }, [practiceContext, allWords, generateQuestion, shuffleArray]);

    const handleAnswer = (option: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(option);
        if (option === currentQuestion?.answer) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < lessonWords.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            generateQuestion(nextIndex, lessonWords);
        } else {
            alert(`Quiz finished! Your score: ${score}/${lessonWords.length}`);
            onNavigate(practiceContext.originView);
        }
    };

    const getButtonClass = (option: string) => {
        if (!selectedAnswer) return "bg-light-bg dark:bg-dark-bg hover:bg-primary/10 dark:hover:bg-primary/20";
        if (option === currentQuestion?.answer) return "bg-green-500 text-white";
        if (option === selectedAnswer) return "bg-red-500 text-white";
        return "bg-light-bg dark:bg-dark-bg opacity-60";
    };

    if (lessonWords.length === 0) {
       return (<div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title="Listening Practice" onBack={() => onNavigate(practiceContext.originView)} />
                <div className="text-center p-8 bg-white dark:bg-dark-card rounded-2xl shadow-lg">No words in this lesson to practice.</div>
            </div>
        </div>)
    }

    if (!currentQuestion) return <div className="p-4 text-center">Loading quiz...</div>;

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                 <PageHeader title="Listening Practice" onBack={() => onNavigate(practiceContext.originView)} rightContent={<div className="font-semibold">Score: {score}</div>} />
                 <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6">
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400 mb-4">Question {currentIndex + 1}/{lessonWords.length}</div>
                    <div className="text-center mb-8">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Listen and choose the correct word.</p>
                        <button onClick={() => playAudio(currentQuestion.word.audioUrl, playbackSpeed)} className={`mx-auto p-6 rounded-full transition-colors ${currentlyPlayingUrl === currentQuestion.word.audioUrl ? 'bg-primary text-white' : 'bg-secondary text-white hover:bg-secondary-dark'}`}>
                           <SpeakerIcon className="w-12 h-12" />
                        </button>
                        <div className="flex justify-center mt-4">
                            <PlaybackSpeedControl currentSpeed={playbackSpeed} onSpeedChange={setPlaybackSpeed} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map(option => (
                            <button key={option} onClick={() => handleAnswer(option)} disabled={!!selectedAnswer} className={`w-full p-4 rounded-lg font-semibold text-left transition-colors ${getButtonClass(option)}`}>
                                {option}
                            </button>
                        ))}
                    </div>
                     {selectedAnswer && (
                        <div className="mt-8 text-center">
                            <button onClick={handleNext} className="px-10 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-light transition-colors">
                                {currentIndex < lessonWords.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ShadowingView: React.FC<{
    onNavigate: NavigateFn,
    words: Word[],
    sentences: Sentence[],
    playAudio: (url: string | undefined, speed?: number) => void,
    currentlyPlayingUrl: string | null,
    playbackSpeed: number,
    setPlaybackSpeed: (speed: number) => void,
}> = ({ onNavigate, words, sentences, playAudio, currentlyPlayingUrl, playbackSpeed, setPlaybackSpeed }) => {
    const [practiceMode, setPracticeMode] = useState<'word' | 'sentence' | 'custom'>('word');
    const [practiceModalData, setPracticeModalData] = useState<{ targetText: string, ipa?: string, audioUrl?: string } | null>(null);

    const [customText, setCustomText] = useState('');
    const [isPreparing, setIsPreparing] = useState(false);
    const [prepError, setPrepError] = useState<string | null>(null);

    const itemsToList = practiceMode === 'word' ? words : sentences;

    const createTtsApiUrl = (text: string) => `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;

    const handlePracticeCustom = async () => {
        const trimmedText = customText.trim();
        if (!trimmedText) {
            setPrepError("Please enter some text to practice.");
            return;
        }
        setIsPreparing(true);
        setPrepError(null);
        
        const result = await geminiService.getIpaForText(trimmedText);
        if (result.error) {
            setPrepError(result.error);
            setIsPreparing(false);
            return;
        }

        const audioUrl = createTtsApiUrl(trimmedText);
        setPracticeModalData({ targetText: trimmedText, ipa: result.ipa, audioUrl });
        setIsPreparing(false);
    };

    const handleItemClick = (item: Word | Sentence) => {
        const isWord = 'word' in item;
        setPracticeModalData({
            targetText: isWord ? item.word : item.sentence,
            ipa: item.ipa,
            audioUrl: item.audioUrl,
        });
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title="Shadowing Practice" onBack={() => onNavigate(View.Home)} />
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6">
                    <div className="flex p-1 bg-light-bg dark:bg-dark-bg rounded-lg mb-6">
                        <button onClick={() => setPracticeMode('word')} className={`w-1/3 py-2.5 font-semibold rounded-md transition-colors ${practiceMode === 'word' ? 'bg-primary text-white shadow' : 'text-gray-500'}`}>
                            Words
                        </button>
                        <button onClick={() => setPracticeMode('sentence')} className={`w-1/3 py-2.5 font-semibold rounded-md transition-colors ${practiceMode === 'sentence' ? 'bg-primary text-white shadow' : 'text-gray-500'}`}>
                            Sentences
                        </button>
                        <button onClick={() => setPracticeMode('custom')} className={`w-1/3 py-2.5 font-semibold rounded-md transition-colors ${practiceMode === 'custom' ? 'bg-primary text-white shadow' : 'text-gray-500'}`}>
                            Custom
                        </button>
                    </div>

                    {practiceMode === 'custom' ? (
                        <div className="animate-fade-in">
                            <h3 className="text-lg font-bold mb-2">Custom Practice</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Enter any word, sentence, or paragraph you want to practice.</p>
                            <textarea
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                rows={5}
                                placeholder="e.g., 'The quick brown fox jumps over the lazy dog.'"
                                className="w-full p-3 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none resize-y"
                            />
                            {prepError && <p className="text-red-500 text-sm mb-3 text-center">{prepError}</p>}
                            <button
                                onClick={handlePracticeCustom}
                                disabled={isPreparing}
                                className="w-full px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-light transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                            >
                                {isPreparing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Preparing...</span>
                                    </>
                                ) : (
                                    <>
                                        <MicrophoneIcon className="w-5 h-5" />
                                        <span>Practice This Text</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                            {itemsToList.map(item => {
                                const isWord = 'word' in item;
                                const text = isWord ? item.word : item.sentence;
                                return (
                                    <div key={item.id} className="p-3 bg-light-bg dark:bg-dark-bg rounded-xl flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{text}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.ipa}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleItemClick(item)}
                                            className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" 
                                            aria-label={`Practice pronunciation of ${text}`}
                                        >
                                            <MicrophoneIcon className="w-6 h-6 text-emerald-500" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {practiceModalData && (
                <PronunciationPracticeModal
                    targetText={practiceModalData.targetText}
                    ipa={practiceModalData.ipa}
                    audioUrl={practiceModalData.audioUrl}
                    onClose={() => setPracticeModalData(null)}
                    playAudio={playAudio}
                    currentlyPlayingUrl={currentlyPlayingUrl}
                    playbackSpeed={playbackSpeed}
                    setPlaybackSpeed={setPlaybackSpeed}
                />
            )}
        </div>
    );
};

const PlaceholderView: React.FC<{ featureName: string; onNavigate: () => void }> = ({ featureName, onNavigate }) => (
    <div className="p-4 text-center">
        <PageHeader title={featureName} onBack={onNavigate} />
        <div className="mt-8">
            <h2 className="text-2xl font-bold">Coming Soon!</h2>
            <p className="text-gray-500 mt-2">The "{featureName}" feature is under construction.</p>
        </div>
    </div>
);

const BottomNav: React.FC<{ currentView: View; onNavigate: (view: View) => void }> = ({ currentView, onNavigate }) => {
    const navItems = [
        { view: View.Home, icon: HomeIcon, label: 'Home' },
        { view: View.Vocabulary, icon: VocabularyIcon, label: 'Words' },
        { view: View.Sentences, icon: SentencesIcon, label: 'Sentences' },
        { view: View.Review, icon: ReviewIcon, label: 'Review' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-700 flex justify-around items-center z-40">
            {navItems.map(item => (
                <button 
                    key={item.label}
                    onClick={() => onNavigate(item.view)}
                    className={`flex flex-col items-center justify-center w-full h-full transition-colors ${currentView === item.view ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-light'}`}
                >
                    <item.icon className="w-7 h-7 mb-1" />
                    <span className="text-xs font-semibold">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

const AITUTOR_HISTORY_KEY = 'zenglish_aitutor_history';

const AITutorView: React.FC<{ onNavigate: NavigateFn }> = ({ onNavigate }) => {
    const [messages, setMessages] = useState<ChatEntry[]>([
        { speaker: 'Zen', text: 'Hi there! I\'m Zen, your friendly AI English coach. Ready to practice? You can ask me about grammar, vocabulary, or just have a chat!' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesRef = useRef(messages);
    messagesRef.current = messages;

    const [conversationHistory, setConversationHistory] = useState<ConversationRecord[]>([]);
    const [currentView, setCurrentView] = useState<'chat' | 'history'>('chat');
    const [selectedConversation, setSelectedConversation] = useState<ConversationRecord | null>(null);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(AITUTOR_HISTORY_KEY);
            if (storedHistory) {
                setConversationHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load AI Tutor history:", error);
        }
    }, []);

    const saveConversation = useCallback((msgs: ChatEntry[]) => {
        if (msgs.length <= 1) return; // Don't save empty/initial chats
        const newRecord: ConversationRecord = {
            id: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            messages: msgs,
        };
        setConversationHistory(prevHistory => {
            const updatedHistory = [newRecord, ...prevHistory];
            try {
                localStorage.setItem(AITUTOR_HISTORY_KEY, JSON.stringify(updatedHistory));
            } catch (error) {
                console.error("Failed to save AI Tutor history:", error);
            }
            return updatedHistory;
        });
    }, []);

    const deleteConversation = (id: string) => {
        if (window.confirm("Are you sure you want to delete this chat?")) {
            const updatedHistory = conversationHistory.filter(c => c.id !== id);
            setConversationHistory(updatedHistory);
            try {
                localStorage.setItem(AITUTOR_HISTORY_KEY, JSON.stringify(updatedHistory));
            } catch (error) {
                console.error("Failed to delete chat:", error);
            }
        }
    };
    
    // Save conversation on component unmount or view change
    useEffect(() => {
        return () => {
            saveConversation(messagesRef.current);
        };
    }, [saveConversation]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading, currentView, selectedConversation]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            const scrollHeight = textarea.scrollHeight;
            const maxHeight = 160;
            if (scrollHeight > maxHeight) {
                textarea.style.height = `${maxHeight}px`;
                textarea.style.overflowY = 'auto';
            } else {
                textarea.style.height = `${scrollHeight}px`;
                textarea.style.overflowY = 'hidden';
            }
        }
    }, [input, currentView]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedInput = input.trim();
        if (!trimmedInput || isLoading) return;

        const userMessage: ChatEntry = { speaker: 'You', text: trimmedInput };
        const currentMessages = [...messages, userMessage];
        setMessages(currentMessages);
        setInput('');
        setIsLoading(true);

        const historyForApi: Content[] = messages.map(msg => ({
            role: msg.speaker === 'You' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        try {
            const responseText = await geminiService.getAITutorResponse(historyForApi, trimmedInput);
            const modelMessage: ChatEntry = { speaker: 'Zen', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: ChatEntry = { speaker: 'Zen', text: "Sorry, I'm having trouble connecting right now. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const startNewChat = () => {
        saveConversation(messages);
        setMessages([
             { speaker: 'Zen', text: 'Hi there! Let\'s start a new conversation. What\'s on your mind?' }
        ]);
        setCurrentView('chat');
        setSelectedConversation(null);
    }

    const ChatView = () => (
      <>
        <div className="flex-grow space-y-4 overflow-y-auto pr-2 -mr-2">
            {messages.map((message, index) => (
                <div key={index} className={`flex items-end gap-3 ${message.speaker === 'You' ? 'justify-end' : 'justify-start'}`}>
                    {message.speaker === 'Zen' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center self-start"><AITutorIcon className="w-5 h-5 text-white" /></div>}
                    <div className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-3 rounded-2xl ${message.speaker === 'You' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    </div>
                    {message.speaker === 'You' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center self-start"><UserAvatarIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/></div>}
                </div>
            ))}
            {isLoading && (
                <div className="flex items-end gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center self-start"><AITutorIcon className="w-5 h-5 text-white" /></div>
                    <div className="max-w-sm p-3 rounded-2xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none">
                        <div className="flex space-x-1">
                            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="mt-4 flex items-start gap-3">
            <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e as any);
                    }
                }}
                placeholder="Ask Zen anything..."
                rows={1}
                className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none resize-none max-h-40"
                disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="w-12 h-12 flex-shrink-0 bg-primary text-white font-semibold rounded-lg shadow-sm hover:bg-primary-light transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed">
                <SendIcon className="w-6 h-6" />
            </button>
        </form>
      </>
    );
    
    const HistoryListView = () => (
        <div className="flex flex-col h-full">
            <button onClick={startNewChat} className="w-full mb-3 py-2 px-4 bg-secondary text-white font-semibold rounded-lg shadow-sm hover:bg-secondary-dark transition-colors">
                + Start New Chat
            </button>
            <div className="flex-grow overflow-y-auto space-y-3">
                {conversationHistory.length === 0 ? (
                    <div className="text-center text-gray-400 py-10">
                        <p>No saved chats yet.</p>
                    </div>
                ) : (
                    conversationHistory.map(record => (
                        <div key={record.id} className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg flex justify-between items-center gap-2">
                            <button onClick={() => { setSelectedConversation(record); }} className="flex-grow text-left">
                                <p className="font-semibold truncate">Chat on {new Date(record.timestamp).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleTimeString()} · {record.messages.length} messages</p>
                            </button>
                            <button onClick={() => deleteConversation(record.id)} className="p-2 rounded-full hover:bg-red-500/10 flex-shrink-0" aria-label="Delete chat">
                                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
    
    const HistoryDetailView = () => (
        <div className="flex flex-col h-full">
            <button onClick={() => setSelectedConversation(null)} className="flex items-center gap-2 font-semibold text-sm text-gray-500 dark:text-gray-400 mb-3 flex-shrink-0">
                <BackIcon className="w-4 h-4" /> Back to History
            </button>
             <div className="flex-grow overflow-y-auto space-y-4">
                 {selectedConversation?.messages.map((entry, index) => (
                    <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'You' ? 'justify-end' : 'justify-start'}`}>
                        {entry.speaker === 'Zen' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center self-start"><AITutorIcon className="w-5 h-5 text-white" /></div>}
                        <div className={`max-w-xs sm:max-w-sm md:max-w-md p-3 rounded-2xl ${entry.speaker === 'You' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                        </div>
                        {entry.speaker === 'You' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center self-start"><UserAvatarIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/></div>}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
    
    const renderContent = () => {
        if (currentView === 'history') {
            return selectedConversation ? <HistoryDetailView /> : <HistoryListView />;
        }
        return <ChatView />;
    }

    const handleToggleView = () => {
        if (currentView === 'chat') {
            saveConversation(messages);
            setMessages([{ speaker: 'Zen', text: 'Hi there! I\'m Zen, your friendly AI English coach. Ready to practice? You can ask me about grammar, vocabulary, or just have a chat!' }]);
        }
        setCurrentView(v => v === 'chat' ? 'history' : 'chat');
        setSelectedConversation(null);
    }

    return (
        <div className="p-4 sm:p-6 h-[calc(100vh-160px)] flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col min-h-0">
                <PageHeader 
                    title={currentView === 'chat' ? 'AI Tutor' : (selectedConversation ? 'Chat Details' : 'Chat History')}
                    onBack={() => onNavigate(View.Home)} 
                    rightContent={
                        <button onClick={handleToggleView} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            {currentView === 'chat' ? <HistoryIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                        </button>
                    }
                />
                 <div className="flex-grow bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col overflow-hidden min-h-0">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

// --- Live API Helpers & Component ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const CONVERSATION_HISTORY_KEY = 'zengling_conversation_history';

const AIConversationView: React.FC<{ onNavigate: NavigateFn }> = ({ onNavigate }) => {
    // Local interface as LiveSession is not exported from the SDK
    interface LiveSession {
        close(): void;
        sendRealtimeInput(input: { media: Blob }): void;
    }
    
    const [status, setStatus] = useState<'idle' | 'connecting' | 'active' | 'error'>('idle');
    const [turnStatus, setTurnStatus] = useState<'listening' | 'userSpeaking' | 'modelSpeaking' | 'idle'>('idle');
    const [history, setHistory] = useState<ChatEntry[]>([]);
    const historyRef = useRef(history);
    historyRef.current = history;
    
    const [conversationHistory, setConversationHistory] = useState<ConversationRecord[]>([]);
    const [currentView, setCurrentView] = useState<'chat' | 'history'>('chat');
    
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const nextStartTimeRef = useRef(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const storedHistory = localStorage.getItem(CONVERSATION_HISTORY_KEY);
            if (storedHistory) {
                setConversationHistory(JSON.parse(storedHistory));
            }
        } catch (error) {
            console.error("Failed to load conversation history:", error);
        }
    }, []);

    const saveConversation = useCallback((messages: ChatEntry[]) => {
        if (messages.length === 0) return;
        const newRecord: ConversationRecord = {
            id: new Date().toISOString(),
            timestamp: new Date().toISOString(),
            messages: messages,
        };
        setConversationHistory(prevHistory => {
            const updatedHistory = [newRecord, ...prevHistory];
            try {
                localStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(updatedHistory));
            } catch (error) {
                console.error("Failed to save conversation history:", error);
            }
            return updatedHistory;
        });
    }, []);
    
    const deleteConversation = (id: string) => {
        if(window.confirm("Are you sure you want to delete this conversation?")) {
            const updatedHistory = conversationHistory.filter(c => c.id !== id);
            setConversationHistory(updatedHistory);
            try {
                localStorage.setItem(CONVERSATION_HISTORY_KEY, JSON.stringify(updatedHistory));
            } catch(error) {
                console.error("Failed to delete conversation:", error);
            }
        }
    };


    const handleStopSession = useCallback(async () => {
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.error("Error closing session:", e);
            }
        }
        streamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamSourceRef.current?.disconnect();
        scriptProcessorRef.current?.disconnect();
        if (inputAudioContextRef.current?.state !== 'closed') {
           inputAudioContextRef.current?.close().catch(e => console.error("Error closing input context:", e));
        }
        if (outputAudioContextRef.current?.state !== 'closed') {
            outputAudioContextRef.current?.close().catch(e => console.error("Error closing output context:", e));
        }
        
        saveConversation(historyRef.current.filter(h => h.isFinal && h.text.trim()));

        sessionPromiseRef.current = null;
        streamRef.current = null;
        mediaStreamSourceRef.current = null;
        scriptProcessorRef.current = null;
        inputAudioContextRef.current = null;
        outputAudioContextRef.current = null;
        outputSourcesRef.current.clear();
        nextStartTimeRef.current = 0;

        setStatus('idle');
        setTurnStatus('idle');
    }, [saveConversation]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleStartSession = useCallback(async () => {
        setStatus('connecting');
        setHistory([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            inputAudioContextRef.current = inputAudioContext;
            outputAudioContextRef.current = outputAudioContext;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: async () => {
                        setStatus('active');
                        setTurnStatus('listening');
                        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                        streamRef.current = stream;

                        const source = inputAudioContext.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                        mediaStreamSourceRef.current = source;
                        scriptProcessorRef.current = scriptProcessor;
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        let hasUserInput = false;
                        let hasModelOutput = false;

                        if (message.serverContent?.inputTranscription) {
                            hasUserInput = true;
                            const text = message.serverContent.inputTranscription.text;
                            setHistory(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.speaker === 'You' && !last.isFinal) {
                                    return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                                }
                                return [...prev, { speaker: 'You', text, isFinal: false }];
                            });
                        }
                        
                        if (message.serverContent?.outputTranscription) {
                            hasModelOutput = true;
                            const text = message.serverContent.outputTranscription.text;
                            setHistory(prev => {
                                const last = prev[prev.length - 1];
                                if (last && last.speaker === 'Zen' && !last.isFinal) {
                                    return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                                }
                                return [...prev, { speaker: 'Zen', text, isFinal: false }];
                            });
                        }
                        
                        if (hasUserInput) setTurnStatus('userSpeaking');
                        if (hasModelOutput) setTurnStatus('modelSpeaking');

                        if (message.serverContent?.turnComplete) {
                            setHistory(prev => prev.map(entry => ({ ...entry, isFinal: true })));
                            setTurnStatus('listening');
                        }

                        const interrupted = message.serverContent?.interrupted;
                        if (interrupted) {
                            for (const source of outputSourcesRef.current.values()) {
                                source.stop();
                                outputSourcesRef.current.delete(source);
                            }
                            nextStartTimeRef.current = 0;
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                            const source = outputAudioContext.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAudioContext.destination);
                            
                            const currentSources = outputSourcesRef.current;
                            source.addEventListener('ended', () => {
                                currentSources.delete(source);
                            });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            currentSources.add(source);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error:', e);
                        setStatus('error');
                        handleStopSession();
                    },
                    onclose: () => {
                        handleStopSession();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: `You are Zen, a friendly, empathetic, and patient English conversation partner. Your personality is curious and encouraging. Your primary goal is to help the user practice speaking natural, conversational English in a relaxed environment.

Core Instructions:
1.  **Be Conversational & Natural**: Keep your responses relatively short and use natural-sounding language. Avoid being robotic. Use interjections like "Oh, that's interesting!" or "I see." to sound more human.
2.  **Always Encourage More Speaking**: End every response with an open-ended question to keep the conversation flowing.
3.  **Maintain Context & Memory**: Actively listen and remember what the user has said earlier in this conversation. Refer back to previous points when relevant. For example: "A moment ago, you said you like movies. What's the best one you've seen recently?"
4.  **Summarize and Clarify**: If a user's point is complex or a bit unclear, briefly summarize it to confirm your understanding ("So, if I'm hearing you right, you think...?") or ask a gentle clarifying question.
5.  **Introduce New Topics Smoothly**: If the conversation stalls, gracefully introduce a new, related topic. For instance, if you were talking about food, you could transition to travel by saying, "Speaking of great food, have you ever traveled somewhere just to try the local cuisine?"
6.  **Do Not Be a Teacher (Unless Asked)**: Your main role is a conversation partner, not a grammar teacher. Do not correct the user's grammar or pronunciation unless they explicitly ask you to. Focus on understanding and responding to their meaning.`,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
            });
            sessionPromiseRef.current = sessionPromise;
        } catch (err) {
            console.error("Failed to start session:", err);
            setStatus('error');
        }
    }, [handleStopSession]);
    
    // Automatically start the session on component mount.
    useEffect(() => {
        handleStartSession();
        // The cleanup is handled by the main unmount effect.
    }, [handleStartSession]);

    // Main unmount cleanup.
    useEffect(() => {
        return () => {
            handleStopSession();
        };
    }, [handleStopSession]);


    const getStatusInfo = () => {
        switch (status) {
            case 'idle': return { text: 'Tap to start speaking practice', color: 'text-gray-500' };
            case 'connecting': return { text: 'Connecting to AI partner...', color: 'text-amber-500' };
            case 'error': return { text: 'An error occurred. Please try again.', color: 'text-red-500' };
            case 'active':
                switch (turnStatus) {
                    case 'listening': return { text: 'Zen is listening...', color: 'text-green-500' };
                    case 'userSpeaking': return { text: 'You are speaking...', color: 'text-primary' };
                    case 'modelSpeaking': return { text: 'Zen is speaking...', color: 'text-secondary-dark' };
                    default: return { text: 'Live conversation is active', color: 'text-green-500' };
                }
        }
    };
    
    const ChatView = () => (
        <>
            <div className="flex-grow space-y-4 overflow-y-auto pr-2 -mr-2 mb-4">
                {history.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                        <AIConversationIcon className="w-16 h-16 mb-4" />
                        <p className="font-semibold">Your conversation will appear here.</p>
                    </div>
                )}
                {history.map((entry, index) => (
                        <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'You' ? 'justify-end' : 'justify-start'}`}>
                        {entry.speaker === 'Zen' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center self-start"><AITutorIcon className="w-5 h-5 text-white" /></div>}
                        <div className={`max-w-xs sm:max-w-sm md:max-w-md p-3 rounded-2xl ${entry.speaker === 'You' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                        </div>
                        {entry.speaker === 'You' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center self-start"><UserAvatarIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/></div>}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
                <div className="text-center mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className={`font-semibold text-sm ${getStatusInfo().color}`}>{getStatusInfo().text}</p>
                <button 
                    onClick={status === 'active' ? handleStopSession : handleStartSession}
                    disabled={status === 'connecting'}
                    className={`mt-3 relative w-24 h-24 rounded-full flex items-center justify-center transition-colors shadow-lg disabled:bg-gray-400 text-white
                        ${status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-light'}`}
                    aria-label={status === 'active' ? 'End Conversation' : 'Start Conversation'}
                >
                    <MicrophoneIcon className="w-10 h-10" />
                    {turnStatus === 'listening' && <span className="absolute inset-0 rounded-full bg-white/20 animate-ping"></span>}
                </button>
            </div>
        </>
    );
    
    const [selectedConversation, setSelectedConversation] = useState<ConversationRecord | null>(null);

    const HistoryListView = () => (
        <div className="flex-grow overflow-y-auto space-y-3">
            {conversationHistory.length === 0 ? (
                <div className="text-center text-gray-400 py-10">
                    <p>No saved conversations yet.</p>
                </div>
            ) : (
                conversationHistory.map(record => (
                    <div key={record.id} className="p-3 bg-light-bg dark:bg-dark-bg rounded-lg flex justify-between items-center gap-2">
                        <button onClick={() => setSelectedConversation(record)} className="flex-grow text-left">
                            <p className="font-semibold">Conversation on {new Date(record.timestamp).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleTimeString()} · {record.messages.length} messages</p>
                        </button>
                        <button onClick={() => deleteConversation(record.id)} className="p-2 rounded-full hover:bg-red-500/10" aria-label="Delete conversation">
                            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                ))
            )}
        </div>
    );
    
    const HistoryDetailView = () => (
        <div className="flex-grow overflow-y-auto">
            <button onClick={() => setSelectedConversation(null)} className="flex items-center gap-2 font-semibold text-sm text-gray-500 dark:text-gray-400 mb-3">
                <BackIcon className="w-4 h-4" /> Back to History
            </button>
             <div className="space-y-4">
                 {selectedConversation?.messages.map((entry, index) => (
                    <div key={index} className={`flex items-start gap-3 ${entry.speaker === 'You' ? 'justify-end' : 'justify-start'}`}>
                        {entry.speaker === 'Zen' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center self-start"><AITutorIcon className="w-5 h-5 text-white" /></div>}
                        <div className={`max-w-xs sm:max-w-sm md:max-w-md p-3 rounded-2xl ${entry.speaker === 'You' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                        </div>
                        {entry.speaker === 'You' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center self-start"><UserAvatarIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/></div>}
                    </div>
                ))}
            </div>
        </div>
    );
    
    const renderContent = () => {
        if (currentView === 'history') {
            return selectedConversation ? <HistoryDetailView /> : <HistoryListView />;
        }
        return <ChatView />;
    }

    return (
        <div className="p-4 sm:p-6 h-[calc(100vh-160px)] flex flex-col">
            <div className="max-w-4xl mx-auto w-full flex-grow flex flex-col min-h-0">
                <PageHeader 
                    title={currentView === 'chat' ? 'AI Conversation' : 'History'} 
                    onBack={() => onNavigate(View.Home)} 
                    rightContent={
                        <button onClick={() => setCurrentView(v => v === 'chat' ? 'history' : 'chat')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            {currentView === 'chat' ? <HistoryIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" /> : <AIConversationIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />}
                        </button>
                    }
                />
                 <div className="flex-grow bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col overflow-hidden min-h-0">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

const TranslatorView: React.FC<{
    onNavigate: NavigateFn,
} & AudioProps> = ({ onNavigate, playAudio, currentlyPlayingUrl }) => {
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [sourceLang, setSourceLang] = useState<'Vietnamese' | 'English'>('Vietnamese');
    const [targetLang, setTargetLang] = useState<'Vietnamese' | 'English'>('English');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleTranslate = useCallback(async () => {
        const trimmedInput = inputText.trim();
        if (!trimmedInput) {
            setOutputText('');
            return;
        }

        setIsLoading(true);
        setError(null);
        setOutputText('');

        const result = await geminiService.translateText(trimmedInput, sourceLang, targetLang);

        if (result.translation) {
            setOutputText(result.translation);
        } else {
            setError(result.error || 'An unknown error occurred.');
        }

        setIsLoading(false);
    }, [inputText, sourceLang, targetLang]);
    
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            handleTranslate();
        }, 500); // Debounce time of 500ms

        return () => clearTimeout(debounceTimer);
    }, [inputText, handleTranslate]);

    const handleSwapLanguages = () => {
        setSourceLang(targetLang);
        setTargetLang(sourceLang);
        setInputText(outputText); // Swap text as well
    };
    
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // Optional: show a notification
        }).catch(err => console.error('Failed to copy text: ', err));
    };

    return (
        <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <PageHeader title="AI Translator" onBack={() => onNavigate(View.Home)} />
                <div className="bg-white dark:bg-dark-card rounded-2xl shadow-lg p-4 sm:p-6 space-y-4">
                    {/* Input Box */}
                    <div className="relative">
                        <div className="absolute top-3 left-4 text-sm font-semibold text-gray-500 dark:text-gray-400">{sourceLang}</div>
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={`Enter text in ${sourceLang}...`}
                            rows={5}
                            className="w-full p-4 pt-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg focus:ring-2 focus:ring-primary outline-none resize-y"
                        />
                         <div className="absolute bottom-3 right-4">
                            <button onClick={() => handleCopyToClipboard(inputText)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Copy input text">
                                <CopyIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Swap Button */}
                    <div className="flex justify-center">
                        <button onClick={handleSwapLanguages} className="p-3 rounded-full border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Swap languages">
                            <SwapIcon className="w-6 h-6 text-primary" />
                        </button>
                    </div>

                    {/* Output Box */}
                    <div className="relative">
                        <div className="absolute top-3 left-4 text-sm font-semibold text-gray-500 dark:text-gray-400">{targetLang}</div>
                        <div className="w-full p-4 pt-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg min-h-[148px]">
                            {isLoading ? (
                                 <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                            ) : error ? (
                                <p className="text-red-500">{error}</p>
                            ) : (
                                <p className="whitespace-pre-wrap">{outputText}</p>
                            )}
                        </div>
                         <div className="absolute bottom-3 right-4 flex items-center gap-1">
                            {targetLang === 'English' && outputText && (
                                <button onClick={() => playAudio(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(outputText)}&tl=en&client=tw-ob`)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Listen to translation">
                                    <SpeakerIcon className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                            <button onClick={() => handleCopyToClipboard(outputText)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Copy translated text">
                                <CopyIcon className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;