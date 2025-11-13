import { Conversation } from '../types';

const STORAGE_KEY = 'zenglish_custom_conversations';

export const getCustomConversations = (): Conversation[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to parse custom conversations from localStorage", error);
        return [];
    }
};

export const saveCustomConversations = (conversations: Conversation[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
        console.error("Failed to save custom conversations to localStorage", error);
    }
};

export const addCustomConversation = (conversation: Conversation): void => {
    const conversations = getCustomConversations();
    // Add to the beginning of the list
    const updatedConversations = [conversation, ...conversations];
    saveCustomConversations(updatedConversations);
};

export const deleteCustomConversation = (conversationId: string): void => {
    let conversations = getCustomConversations();
    conversations = conversations.filter(c => c.id !== conversationId);
    saveCustomConversations(conversations);
};