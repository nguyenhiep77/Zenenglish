import type { ComponentType } from 'react';

export enum Level {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export interface Example {
  en: string;
  vi: string;
}

export interface Word {
  id: number;
  word: string;
  ipa: string;
  meaning: string;
  level: Level;
  example: Example;
  audioUrl?: string;
  isCustom?: boolean;
}

export interface Sentence {
  id: number;
  sentence: string;
  ipa?: string;
  meaning:string;
  category: string;
  level: Level;
  audioUrl?: string;
  func?: string; // Communicative function
  context?: string; // Example usage context
  isCustom?: boolean;
}

export interface PhoneticFeedbackItem {
  word: string;
  correctPhoneme: string; // e.g., /æ/
  userPhoneme: string;    // e.g., /ɛ/
  suggestion: string;
}

export interface ProsodyFeedback {
    rhythm?: string;
    intonation?: string;
    wordStress?: string;
}

export interface PronunciationFeedback {
  score: number;
  feedback: string;
  suggestions: string[];
  phoneticFeedback?: PhoneticFeedbackItem[];
  rhythmAndIntonationFeedback?: ProsodyFeedback;
  linkingFeedback?: string;
  isError?: boolean;
}

export interface Mistake {
  type: 'Grammar' | 'Spelling' | 'Expression' | 'Usage' | 'Other';
  incorrectPart: string;
  explanation: string;
  suggestion: string;
}

export interface SentenceFeedback {
  isCorrect: boolean;
  feedback: string;
  correctedSentence: string;
  mistakes: Mistake[];
  isError?: boolean;
}


export enum View {
  Home,
  Vocabulary,
  Sentences,
  Flashcards,
  Minigames,
  Shadowing,
  Stats,
  Review,
  Leaderboard,
  AITutor,
  Rewards,
  MyLessons,
  Listening,
  Reading,
  Grammar,
  QuickCheck,
  SentencePractice,
  AIConversation,
  LessonDetail,
  FillInTheBlank,
  ListeningPractice,
  Translator,
}

export interface UserStats {
    name: string;
    streak: number;
    wordsToday: number;
    timeTodayMinutes: number;
    totalWords: number;
    totalSentences: number;
    rank: number;
}

export interface FeatureCard {
    view: View;
    title: string;
    icon: ComponentType<{ className?: string }>;
    badge?: string;
    color: string;
    description: string;
    // FIX: Add `bgColor` property to align the interface with its usage.
    bgColor: string;
}

// Spaced Repetition System Item
export interface ReviewItem {
    id: number; // Corresponds to Word or Sentence id
    type: 'word' | 'sentence';
    easiness: number; // A factor representing how easy the card is
    interval: number; // The number of days until the next review
    repetitions: number; // The number of times the card has been reviewed
    dueDate: string; // ISO string for the next review date
    lastReviewed?: string; // ISO string for the last review date
}

export interface CustomLesson {
  id: string;
  name: string;
  description: string;
  vocabularyIds: number[];
  createdDate: string;
}

// --- New Module Types ---

export interface ConversationLine {
  speaker: string;
  sentence: string;
  ipa?: string;
  meaning: string;
  audioUrl?: string;
}

export interface Conversation {
  id: string;
  title: string;
  level: Level;
  category: string;
  lines: ConversationLine[];
  isCustom?: boolean;
}


// Listening Module
export interface ListeningQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface ListeningExercise {
  id: string;
  title: string;
  level: Level;
  audioUrl: string;
  transcript: string;
  questions: ListeningQuestion[];
}

export interface DictationExercise {
  id: string;
  title: string;
  level: Level;
  audioUrl: string;
  transcript: string;
}


// Reading Module
export interface ReadingQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface ReadingText {
  id: string;
  title: string;
  level: Level;
  content: string; // The reading passage
  questions: ReadingQuestion[];
}

// Grammar Module
export interface GrammarExample {
  en: string;
  vi: string;
}

export interface GrammarRule {
  id: string;
  title: string;
  explanation: string;
  examples: GrammarExample[];
}

export interface GrammarTopic {
    id: string;
    title: string;
    level: Level;
    rules: GrammarRule[];
}

export type PracticeContext = {
    mode: 'all' | 'custom';
    lessonId: string | null;
    originView: View;
};

export type LessonEditorContext = {
    mode: 'new' | 'edit';
    lesson: CustomLesson | null;
};

export interface WordDetail {
  word: string;
  meaning: string;
}

export interface WordDetails {
  englishMeaning: string;
  usageContext: string;
  sentenceSuggestion: string;
  familyWords: WordDetail[];
  synonyms: WordDetail[];
  antonyms: WordDetail[];
}

// --- Conversation History Types ---
export interface ChatEntry {
  speaker: 'You' | 'Zen';
  text: string;
  isFinal?: boolean;
}

export interface ConversationRecord {
  id: string;
  timestamp: string; // ISO string
  messages: ChatEntry[];
}