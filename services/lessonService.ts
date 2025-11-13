import { CustomLesson } from '../types';

const STORAGE_KEY = 'zenglish_custom_lessons';

export const getCustomLessons = (): CustomLesson[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        let lessons: CustomLesson[] = data ? JSON.parse(data) : [];

        const defaultLessons: CustomLesson[] = [
            {
                id: 'default-daily-routines-lesson-1',
                name: 'Daily Routines',
                description: 'Essential vocabulary for talking about your daily life.',
                vocabularyIds: [642, 525, 33, 34, 40, 41, 35, 5, 10, 331, 464, 26, 641, 548, 626], // wake up, breakfast, eat, drink, work, study, go, school, house, evening, afternoon, night, sleep, clean, read
                createdDate: new Date().toISOString(),
            },
            {
                id: 'default-greetings-lesson-1',
                name: 'Basic Greetings',
                description: 'A starter lesson with common greeting words.',
                vocabularyIds: [24, 25, 26, 331, 464, 8], // name, day, night, evening, afternoon, friend
                createdDate: new Date().toISOString(),
            }
        ];

        // If no lessons exist in storage, create the default ones.
        if (lessons.length === 0) {
            saveCustomLessons(defaultLessons);
            return defaultLessons;
        }

        // For backward compatibility, check if default lessons exist and add if not.
        // This ensures existing users get the new default lessons.
        let needsSave = false;
        defaultLessons.forEach(defaultLesson => {
            if (!lessons.some(l => l.id === defaultLesson.id)) {
                // Add new default lessons to the beginning of the list
                lessons.unshift(defaultLesson);
                needsSave = true;
            }
        });

        if (needsSave) {
            saveCustomLessons(lessons);
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