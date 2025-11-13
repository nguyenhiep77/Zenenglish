import { GoogleGenAI, Type, Content, Chat } from "@google/genai";
import { PronunciationFeedback, SentenceFeedback, Example, WordDetails, Conversation, ConversationLine, Level, Word, Sentence, Mistake, ProsodyFeedback } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will not work.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const getSentenceDataFromGemini = async (sentence: string, meaning: string, category: string): Promise<{ sentenceData?: Omit<Sentence, 'id' | 'audioUrl' | 'isCustom'>, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available. Please check your API key." };

    const prompt = `As an English learning expert for Vietnamese speakers, analyze the following English sentence.
    Sentence: "${sentence}"
    Vietnamese Meaning: "${meaning}"
    Category: "${category}"

    Your tasks are:
    1.  Provide the American English IPA transcription for the full sentence.
    2.  Estimate the CEFR level (A1, A2, B1, B2, C1, or C2).
    3.  Use the provided category.

    Return a single JSON object with this exact structure:
    {
      "sentence": string,
      "ipa": string,
      "meaning": string,
      "level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
      "category": string
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentence: { type: Type.STRING },
                        ipa: { type: Type.STRING },
                        meaning: { type: Type.STRING },
                        level: { type: Type.STRING },
                        category: { type: Type.STRING },
                    },
                    required: ["sentence", "ipa", "meaning", "level", "category"]
                }
            }
        });

        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        }
        const parsedData = JSON.parse(jsonStr);

        const validLevels = Object.values(Level);
        const receivedLevel = parsedData.level.toUpperCase();
        parsedData.level = validLevels.includes(receivedLevel) ? receivedLevel : Level.A2;

        return { sentenceData: parsedData };

    } catch (error) {
        console.error("Error getting sentence data from Gemini:", error);
        return { error: "Could not process the sentence. The AI service may be temporarily unavailable." };
    }
};

export const getWordDataFromGemini = async (word: string, meaning: string, exampleEn?: string): Promise<{ wordData?: Omit<Word, 'id' | 'audioUrl' | 'isCustom'>, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available. Please check your API key." };

    const prompt = `As an English lexicographer for Vietnamese learners, analyze the following English word.
    Word: "${word}"
    Vietnamese Meaning: "${meaning}"
    ${exampleEn ? `User's example sentence: "${exampleEn}"` : ''}

    Your tasks are:
    1.  Provide the American English IPA transcription.
    2.  Estimate the CEFR level (A1, A2, B1, B2, C1, or C2).
    3.  Provide a clear example sentence. If the user gave one, use it and provide its Vietnamese translation. If not, create a new English example and its Vietnamese translation.

    Return a single JSON object with this exact structure:
    {
      "word": string,
      "ipa": string,
      "meaning": string,
      "level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
      "example": { "en": string, "vi": string }
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        ipa: { type: Type.STRING },
                        meaning: { type: Type.STRING },
                        level: { type: Type.STRING },
                        example: {
                            type: Type.OBJECT,
                            properties: {
                                en: { type: Type.STRING },
                                vi: { type: Type.STRING },
                            },
                            required: ["en", "vi"]
                        }
                    },
                    required: ["word", "ipa", "meaning", "level", "example"]
                }
            }
        });

        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        }
        const parsedData = JSON.parse(jsonStr);

        const validLevels = Object.values(Level);
        const receivedLevel = parsedData.level.toUpperCase();
        parsedData.level = validLevels.includes(receivedLevel) ? receivedLevel : Level.B1;
        
        return { wordData: parsedData };

    } catch (error) {
        console.error("Error getting word data from Gemini:", error);
        return { error: "Could not process the word. The AI service may be temporarily unavailable." };
    }
};

export const checkPronunciation = async (targetText: string, userTranscript: string): Promise<PronunciationFeedback> => {
    if (!ai) return { score: 0, feedback: "Gemini AI is not available.", suggestions: [], isError: true };

    const prompt = `As an expert American English pronunciation coach for Vietnamese learners, evaluate the user's pronunciation.
    - Target phrase: "${targetText}"
    - User's spoken phrase: "${userTranscript}"

    Your tasks:
    1.  **Score**: Rate the overall pronunciation from 0 to 100 based on accuracy and clarity.
    2.  **Overall Feedback**: Provide brief, encouraging overall feedback.
    3.  **Phonetic Feedback**: Identify specific words with mispronounced phonemes. For each, provide the target 'correctPhoneme', the 'userPhoneme' that was detected, and a simple, actionable 'suggestion'.
    4.  **Prosody (For Sentences Only)**: If the target phrase is a full sentence, provide specific feedback on its prosody as a JSON object. If a specific aspect is good, say so.
        - "rhythm": Comment on the flow, pacing, and timing.
        - "intonation": Comment on the pitch contour (e.g., rising for questions, falling for statements).
        - "wordStress": Comment on the emphasis of key content words.
    5.  **Linking Sounds (For Sentences Only)**: If the target is a sentence, comment on the use of linking sounds (liaison) between words, if applicable (e.g., in "check it out").
    6.  **General Suggestions**: Give 1-2 high-level suggestions for improvement.

    Return a single JSON object with this exact structure. If a feedback type is not applicable (e.g., prosody for a single word), omit the key or provide an empty string/array.
    {
      "score": number,
      "feedback": string,
      "phoneticFeedback": [{ "word": string, "correctPhoneme": string, "userPhoneme": string, "suggestion": string }],
      "rhythmAndIntonationFeedback": { "rhythm": string, "intonation": string, "wordStress": string },
      "linkingFeedback": string,
      "suggestions": string[]
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
// FIX: The response schema was corrupted and incomplete. It has been fully defined to match the PronunciationFeedback interface.
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        feedback: { type: Type.STRING },
                        phoneticFeedback: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING },
                                    correctPhoneme: { type: Type.STRING },
                                    userPhoneme: { type: Type.STRING },
                                    suggestion: { type: Type.STRING },
                                },
                                required: ["word", "correctPhoneme", "userPhoneme", "suggestion"]
                            }
                        },
                        rhythmAndIntonationFeedback: {
                            type: Type.OBJECT,
                            properties: {
                                rhythm: { type: Type.STRING },
                                intonation: { type: Type.STRING },
                                wordStress: { type: Type.STRING },
                            }
                        },
                        linkingFeedback: { type: Type.STRING },
                        suggestions: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                    },
                    required: ["score", "feedback", "phoneticFeedback", "suggestions"]
                }
            }
        });
        
        const parsedData = JSON.parse(response.text.trim());
        return { ...parsedData, isError: false };

    } catch (error) {
        console.error("Error checking pronunciation with Gemini:", error);
        return { isCorrect: false, score: 0, feedback: "Could not analyze the pronunciation. The AI service may be down.", suggestions: [], isError: true };
    }
};

// FIX: Add missing function `checkUserSentence` called from App.tsx.
export const checkUserSentence = async (targetWord: string, userSentence: string): Promise<SentenceFeedback> => {
    if (!ai) return { isCorrect: false, feedback: "Gemini AI is not available.", correctedSentence: userSentence, mistakes: [], isError: true };

    const prompt = `As an expert English teacher for Vietnamese learners, evaluate the user's sentence based on the target word.
    - Target word: "${targetWord}"
    - User's sentence: "${userSentence}"

    Your tasks:
    1.  Determine if the sentence is grammatically correct and uses the target word appropriately.
    2.  Provide brief, encouraging overall feedback.
    3.  If incorrect, provide a corrected version of the sentence.
    4.  Identify specific mistakes. For each mistake, specify the type ('Grammar', 'Spelling', 'Expression', 'Usage', 'Other'), the 'incorrectPart', a clear 'explanation', and a 'suggestion'. If there are no mistakes, return an empty array.

    Return a single JSON object with this exact structure:
    {
      "isCorrect": boolean,
      "feedback": string,
      "correctedSentence": string,
      "mistakes": [{ "type": string, "incorrectPart": string, "explanation": string, "suggestion": string }]
    }`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isCorrect: { type: Type.BOOLEAN },
                        feedback: { type: Type.STRING },
                        correctedSentence: { type: Type.STRING },
                        mistakes: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
                                    incorrectPart: { type: Type.STRING },
                                    explanation: { type: Type.STRING },
                                    suggestion: { type: Type.STRING },
                                },
                                required: ["type", "incorrectPart", "explanation", "suggestion"]
                            }
                        }
                    },
                    required: ["isCorrect", "feedback", "correctedSentence", "mistakes"]
                }
            }
        });

        const parsedData = JSON.parse(response.text.trim());
        return { ...parsedData, isError: false };
    } catch (error) {
        console.error("Error checking user sentence with Gemini:", error);
        return { isCorrect: false, feedback: "Could not analyze the sentence. The AI service may be down.", correctedSentence: userSentence, mistakes: [], isError: true };
    }
};

// FIX: Add missing function `generateGrammarExplanation` called from App.tsx.
export const generateGrammarExplanation = async (sentence: string): Promise<string> => {
    if (!ai) return "Grammar explanation is unavailable.";

    const prompt = `As an English grammar expert for Vietnamese learners, provide a concise (2-3 sentences max) grammar explanation for the following sentence. Focus on the main grammatical structure or point of interest. Keep it simple and easy to understand. Provide only the explanation text, not any other formatting.

    Sentence: "${sentence}"`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating grammar explanation with Gemini:", error);
        return "Could not load grammar tip at this time.";
    }
};

// FIX: Add missing function `refineVietnameseMeaning` called from App.tsx.
export const refineVietnameseMeaning = async (englishSentence: string, vietnameseMeaning: string): Promise<{ refinedMeaning?: string, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available." };
    
    const prompt = `As an expert English-Vietnamese translator, refine the given Vietnamese meaning for the English sentence to make it more natural, accurate, and contextually appropriate. Consider idioms and nuances.
    - English Sentence: "${englishSentence}"
    - Current Vietnamese Meaning: "${vietnameseMeaning}"

    Return a single JSON object with this exact structure, containing only the improved meaning:
    {
        "refinedMeaning": "The improved Vietnamese meaning"
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        refinedMeaning: { type: Type.STRING },
                    },
                    required: ["refinedMeaning"]
                }
            }
        });
        
        const parsedData = JSON.parse(response.text.trim());
        return { refinedMeaning: parsedData.refinedMeaning };
    } catch (error) {
        console.error("Error refining sentence meaning with Gemini:", error);
        return { error: "Failed to refine meaning. The AI service may be unavailable." };
    }
};

// FIX: Add missing function `getWordDetails` called from App.tsx.
export const getWordDetails = async (word: string): Promise<{ details?: WordDetails, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available." };

    const prompt = `As an expert English lexicographer for Vietnamese learners, provide detailed information for the word "${word}".
    
    Your tasks:
    1.  Provide a clear, simple definition in English ('englishMeaning').
    2.  Describe the common usage context ('usageContext').
    3.  Suggest another clear example sentence ('sentenceSuggestion').
    4.  List 2-3 related family words with their Vietnamese meanings.
    5.  List 2-3 common synonyms with their Vietnamese meanings.
    6.  List 2-3 common antonyms with their Vietnamese meanings. If none, provide an empty array.

    Return a single JSON object with this exact structure:
    {
      "englishMeaning": string,
      "usageContext": string,
      "sentenceSuggestion": string,
      "familyWords": [{ "word": string, "meaning": string }],
      "synonyms": [{ "word": string, "meaning": string }],
      "antonyms": [{ "word": string, "meaning": string }]
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        englishMeaning: { type: Type.STRING },
                        usageContext: { type: Type.STRING },
                        sentenceSuggestion: { type: Type.STRING },
                        familyWords: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING },
                                    meaning: { type: Type.STRING },
                                },
                                required: ["word", "meaning"]
                            }
                        },
                        synonyms: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING },
                                    meaning: { type: Type.STRING },
                                },
                                required: ["word", "meaning"]
                            }
                        },
                        antonyms: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    word: { type: Type.STRING },
                                    meaning: { type: Type.STRING },
                                },
                                required: ["word", "meaning"]
                            }
                        },
                    },
                    required: ["englishMeaning", "usageContext", "sentenceSuggestion", "familyWords", "synonyms", "antonyms"]
                }
            }
        });
        
        const parsedData = JSON.parse(response.text.trim());
        return { details: parsedData };

    } catch (error) {
        console.error("Error getting word details from Gemini:", error);
        return { error: "Could not load word details. The AI service may be temporarily unavailable." };
    }
};

// FIX: Add missing function `refineVietnameseWordMeaning` called from App.tsx.
export const refineVietnameseWordMeaning = async (englishWord: string, vietnameseMeaning: string): Promise<{ refinedMeaning?: string, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available." };
    
    const prompt = `As an expert English-Vietnamese translator, refine the given Vietnamese meaning for the English word to make it more natural, accurate, and contextually appropriate for a learner.
    - English Word: "${englishWord}"
    - Current Vietnamese Meaning: "${vietnameseMeaning}"

    Return a single JSON object with this exact structure, containing only the improved meaning:
    {
        "refinedMeaning": "The improved Vietnamese meaning"
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        refinedMeaning: { type: Type.STRING },
                    },
                    required: ["refinedMeaning"]
                }
            }
        });
        
        const parsedData = JSON.parse(response.text.trim());
        return { refinedMeaning: parsedData.refinedMeaning };
    } catch (error) {
        console.error("Error refining word meaning with Gemini:", error);
        return { error: "Failed to refine meaning. The AI service may be unavailable." };
    }
};

// FIX: Add missing function `translateText` called from App.tsx.
export const translateText = async (text: string, sourceLang: 'English' | 'Vietnamese', targetLang: 'English' | 'Vietnamese'): Promise<{ translation?: string, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available." };
    
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}.
    Text to translate: "${text}"

    Return a single JSON object with this exact structure:
    {
        "translation": "The translated text here"
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        translation: { type: Type.STRING },
                    },
                    required: ["translation"]
                }
            }
        });

        const parsedData = JSON.parse(response.text.trim());
        return { translation: parsedData.translation };
    } catch (error) {
        console.error("Error translating text with Gemini:", error);
        return { error: "Translation failed. The AI service may be temporarily unavailable." };
    }
};

// FIX: Add missing function `parseAndTranslateConversation` called from App.tsx.
export const parseAndTranslateConversation = async (rawText: string, title: string, category: string): Promise<{ conversation?: Omit<Conversation, 'id' | 'isCustom' | 'lines'> & { lines: Omit<ConversationLine, 'audioUrl'>[] }, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available." };

    const prompt = `As an English learning expert, parse the following raw conversation text.
    Raw Text:
    ---
    ${rawText}
    ---
    Title: "${title}"
    Category: "${category}"

    Your tasks are:
    1.  Parse the text into a list of conversation lines, identifying the speaker and the sentence for each.
    2.  Provide the American English IPA transcription for each English sentence.
    3.  Provide a natural Vietnamese translation for each English sentence.
    4.  Estimate the overall CEFR level for the conversation (A1, A2, B1, B2, C1, or C2).

    Return a single JSON object with this exact structure:
    {
      "title": string,
      "level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
      "category": string,
      "lines": [{ "speaker": string, "sentence": string, "ipa": string, "meaning": string }]
    }`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        level: { type: Type.STRING },
                        category: { type: Type.STRING },
                        lines: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    speaker: { type: Type.STRING },
                                    sentence: { type: Type.STRING },
                                    ipa: { type: Type.STRING },
                                    meaning: { type: Type.STRING },
                                },
                                required: ["speaker", "sentence", "ipa", "meaning"]
                            }
                        }
                    },
                    required: ["title", "level", "category", "lines"]
                }
            }
        });

        const parsedData = JSON.parse(response.text.trim());
        const validLevels = Object.values(Level);
        const receivedLevel = parsedData.level.toUpperCase();
        parsedData.level = validLevels.includes(receivedLevel) ? receivedLevel : Level.A2;
        
        return { conversation: parsedData };
    } catch (error) {
        console.error("Error parsing conversation with Gemini:", error);
        return { error: "Could not process the conversation. Please check the format and try again." };
    }
};

// FIX: Add missing function `getAITutorResponse` called from App.tsx.
export const getAITutorResponse = async (history: Content[], newMessage: string): Promise<string> => {
    if (!ai) return "Sorry, the AI Tutor is currently unavailable.";
    
    const systemInstruction = `You are Zen, a friendly and patient AI English tutor for Vietnamese learners.
- Keep your responses concise and encouraging.
- Explain concepts simply.
- If the user makes a mistake, gently correct them and explain why.
- Ask questions to keep the conversation going.
- You can discuss grammar, vocabulary, pronunciation, or just have a casual chat in English.
- Your goal is to help the user practice and feel more confident.`;

    try {
        // The history from the client already includes the latest user message
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: history,
            config: {
                systemInstruction: systemInstruction,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error getting AI tutor response from Gemini:", error);
        return "I'm having trouble connecting right now. Let's try again in a moment.";
    }
};
