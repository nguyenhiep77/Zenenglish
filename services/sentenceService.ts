
import { Sentence } from '../types';
import * as srsService from './srsService';

const STORAGE_KEY = 'zenglish_custom_sentences';

export const getCustomSentences = (): Sentence[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to parse custom sentences from localStorage", error);
        return [];
    }
};

export const saveCustomSentences = (sentences: Sentence[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sentences));
    } catch (error) {
        console.error("Failed to save custom sentences to localStorage", error);
    }
};

export const addCustomSentence = (sentence: Sentence): void => {
    const sentences = getCustomSentences();
    if (sentences.some(s => s.sentence.toLowerCase() === sentence.sentence.toLowerCase())) {
        throw new Error(`Sentence "${sentence.sentence}" already exists.`);
    }
    saveCustomSentences([sentence, ...sentences]);
};

export const deleteCustomSentence = (sentenceId: number): void => {
    let sentences = getCustomSentences();
    sentences = sentences.filter(s => s.id !== sentenceId);
    saveCustomSentences(sentences);
    srsService.deleteReviewItem(sentenceId, 'sentence');
};
