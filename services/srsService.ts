
import { ReviewItem, Word, Sentence } from '../types';

const STORAGE_KEY = 'zenglish_srs_data';

// --- LocalStorage Utilities ---

export const getAllReviewItems = (): ReviewItem[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to parse review items from localStorage", error);
        return [];
    }
};

const saveAllReviewItems = (items: ReviewItem[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.error("Failed to save review items to localStorage", error);
    }
};


// --- Deck Initialization ---

export const initializeDeck = (words: Word[], sentences: Sentence[]): void => {
    const existingItems = getAllReviewItems();
    if (existingItems.length > 0) {
        return; // Already initialized
    }

    const today = new Date().toISOString();

    const wordItems: ReviewItem[] = words.map(word => ({
        id: word.id,
        type: 'word',
        easiness: 2.5,
        interval: 0,
        repetitions: 0,
        dueDate: today,
    }));

    const sentenceItems: ReviewItem[] = sentences.map(sentence => ({
        id: sentence.id,
        type: 'sentence',
        easiness: 2.5,
        interval: 0,
        repetitions: 0,
        dueDate: today,
    }));
    
    saveAllReviewItems([...wordItems, ...sentenceItems]);
};


// --- Core SRS Logic (based on a simplified SM-2 algorithm) ---

/**
 * Updates a review item based on the user's recall performance.
 * @param item The ReviewItem to update.
 * @param quality A number from 0-5 representing recall quality (0: forgot, 3: hard, 4: good, 5: easy).
 * @returns The updated ReviewItem.
 */
export const updateReviewItem = (item: ReviewItem, quality: number): ReviewItem | undefined => {
    const allItems = getAllReviewItems();
    const itemIndex = allItems.findIndex(i => i.id === item.id && i.type === item.type);

    if (itemIndex === -1) {
        console.error("Item not found in storage", item);
        return undefined;
    }

    const updatedItem = calculateNextReview(item, quality);
    
    allItems[itemIndex] = updatedItem;
    saveAllReviewItems(allItems);
    return updatedItem;
};

const calculateNextReview = (item: ReviewItem, quality: number): ReviewItem => {
    const newItem = { ...item };
    
    if (quality < 3) {
        // Incorrect recall, reset progress
        newItem.repetitions = 0;
        newItem.interval = 1;
    } else {
        // Correct recall
        newItem.repetitions += 1;

        // Update easiness factor
        const newEasiness = newItem.easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        newItem.easiness = Math.max(1.3, newEasiness); // Easiness factor should not be less than 1.3

        // Calculate next interval
        if (newItem.repetitions === 1) {
            newItem.interval = 1;
        } else if (newItem.repetitions === 2) {
            newItem.interval = 6;
        } else {
            newItem.interval = Math.ceil(newItem.interval * newItem.easiness);
        }
    }
    
    // Set next due date and last reviewed date
    const today = new Date();
    newItem.lastReviewed = today.toISOString();
    today.setDate(today.getDate() + newItem.interval);
    newItem.dueDate = today.toISOString();

    return newItem;
};


// --- Public API for Components ---

/**
 * Gets all items that are due for review today or earlier.
 */
export const getReviewQueue = (): ReviewItem[] => {
    const allItems = getAllReviewItems();
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today

    return allItems.filter(item => {
        const dueDate = new Date(item.dueDate);
        return dueDate <= today;
    });
};

export const addReviewItem = (itemData: { id: number; type: 'word' | 'sentence' }): void => {
    const allItems = getAllReviewItems();
    if (allItems.some(i => i.id === itemData.id && i.type === itemData.type)) {
        console.warn(`Review item for ${itemData.type} #${itemData.id} already exists.`);
        return;
    }
    const newItem: ReviewItem = {
        id: itemData.id,
        type: itemData.type,
        easiness: 2.5,
        interval: 0,
        repetitions: 0,
        dueDate: new Date().toISOString(),
    };
    saveAllReviewItems([...allItems, newItem]);
};

export const deleteReviewItem = (itemId: number, itemType: 'word' | 'sentence'): void => {
    let allItems = getAllReviewItems();
    allItems = allItems.filter(item => !(item.id === itemId && item.type === itemType));
    saveAllReviewItems(allItems);
};
