import { Word } from '../types';
import * as srsService from './srsService';

const STORAGE_KEY = 'zenglish_custom_words';

export const getCustomWords = (): Word[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to parse custom words from localStorage", error);
        return [];
    }
};

export const saveCustomWords = (words: Word[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    } catch (error) {
        console.error("Failed to save custom words to localStorage", error);
    }
};

export const addCustomWord = (word: Word): void => {
    const words = getCustomWords();
    if (words.some(w => w.word.toLowerCase() === word.word.toLowerCase())) {
        throw new Error(`Word "${word.word}" already exists.`);
    }
    saveCustomWords([...words, word]);
};

export const deleteCustomWord = (wordId: number): void => {
    let words = getCustomWords();
    words = words.filter(w => w.id !== wordId);
    saveCustomWords(words);
    srsService.deleteReviewItem(wordId, 'word');
};
