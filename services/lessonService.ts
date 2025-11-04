import { CustomLesson } from '../types';

const STORAGE_KEY = 'zenglish_custom_lessons';

export const getCustomLessons = (): CustomLesson[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        const lessons = data ? JSON.parse(data) : [];

        // If no lessons exist in storage, create a default one.
        if (lessons.length === 0) {
            const defaultLesson: CustomLesson = {
                id: 'default-greetings-lesson-1', // Use a fixed ID to prevent duplicates
                name: 'Basic Greetings',
                description: 'A starter lesson with common greeting words.',
                vocabularyIds: [4, 8, 17], // Corrected IDs: 'book', 'friend', 'love'
                createdDate: new Date().toISOString(),
            };
            saveCustomLessons([defaultLesson]);
            return [defaultLesson];
        }

        return lessons;
    } catch (error) {
        console.error("Failed to parse or create custom lessons", error);
        return [];
    }
};

export const saveCustomLessons = (lessons: CustomLesson[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lessons));
    } catch (error) {
        console.error("Failed to save custom lessons to localStorage", error);
    }
};

export const createLesson = (name: string, vocabularyIds: number[], description: string = ''): CustomLesson => {
    const newLesson: CustomLesson = {
        id: new Date().toISOString() + Math.random(), // Simple unique ID
        name,
        description,
        vocabularyIds,
        createdDate: new Date().toISOString(),
    };
    const lessons = getCustomLessons();
    lessons.push(newLesson);
    saveCustomLessons(lessons);
    return newLesson;
};

export const updateLesson = (updatedLesson: CustomLesson): void => {
    let lessons = getCustomLessons();
    lessons = lessons.map(lesson => lesson.id === updatedLesson.id ? updatedLesson : lesson);
    saveCustomLessons(lessons);
};

export const deleteLesson = (lessonId: string): void => {
    let lessons = getCustomLessons();
    lessons = lessons.filter(lesson => lesson.id !== lessonId);
    saveCustomLessons(lessons);
};