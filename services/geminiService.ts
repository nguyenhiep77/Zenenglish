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
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        feedback: { type: Type.STRING },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
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
                            },
                        },
                        linkingFeedback: { type: Type.STRING },
                    },
                    required: ["score", "feedback", "suggestions"]
                }
            }
        });

        const jsonStr = response.text.trim();
        const parsedData = JSON.parse(jsonStr);
        return { ...parsedData, isError: false };

    } catch (error) {
        console.error("Error checking pronunciation with Gemini:", error);
        return {
            score: 0,
            feedback: "Sorry, I couldn't analyze your pronunciation. The AI service may be down. Please try again later.",
            suggestions: [],
            isError: true,
        };
    }
};

export const checkUserSentence = async (wordToUse: string, userSentence: string): Promise<SentenceFeedback> => {
    if (!ai) return { isCorrect: false, feedback: "Gemini AI is not available.", correctedSentence: userSentence, mistakes: [], isError: true };

    const prompt = `As an expert English teacher for Vietnamese learners, analyze the user's sentence.
    - Word to use: "${wordToUse}"
    - User's sentence: "${userSentence}"

    Your tasks:
    1.  Check if the sentence is grammatically correct and if the word "${wordToUse}" is used naturally and correctly.
    2.  If it's perfect, set "isCorrect" to true, provide positive feedback, and set "correctedSentence" to the original sentence.
    3.  If there are errors:
        a. Set "isCorrect" to false.
        b. Provide a brief, encouraging feedback about the attempt.
        c. Provide a fully corrected version of the sentence in "correctedSentence".
        d. Create a "mistakes" array. For each mistake, identify the "incorrectPart", provide a simple "explanation", suggest a "suggestion", and categorize it as 'Grammar', 'Spelling', 'Expression', or 'Usage'.

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

        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        }
        const parsedData = JSON.parse(jsonStr);

        // Ensure mistake types are valid
        const validMistakeTypes: Mistake['type'][] = ['Grammar', 'Spelling', 'Expression', 'Usage', 'Other'];
        if (parsedData.mistakes) {
            parsedData.mistakes.forEach((mistake: any) => {
                if (!validMistakeTypes.includes(mistake.type)) {
                    mistake.type = 'Other';
                }
            });
        }

        return { ...parsedData, isError: false };

    } catch (error) {
        console.error("Error checking sentence with Gemini:", error);
        return {
            isCorrect: false,
            feedback: "Sorry, I couldn't check your sentence. The AI service may be down. Please try again later.",
            correctedSentence: userSentence,
            mistakes: [],
            isError: true,
        };
    }
};

export const getWordDetails = async (word: string): Promise<{ details?: WordDetails, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available. Please check your API key." };

    const prompt = `As an expert English lexicographer, provide detailed information for the word "${word}" for a Vietnamese learner.

    Your tasks:
    1.  Provide a concise English meaning.
    2.  Describe the common usage context.
    3.  Suggest a different, clear example sentence.
    4.  List related family words (e.g., noun, verb, adjective forms) with their Vietnamese meanings.
    5.  List common synonyms with their Vietnamese meanings.
    6.  List common antonyms with their Vietnamese meanings.

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
                                    meaning: { type: Type.STRING }
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
                                    meaning: { type: Type.STRING }
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
                                    meaning: { type: Type.STRING }
                                },
                                required: ["word", "meaning"]
                            }
                        }
                    },
                    required: ["englishMeaning", "usageContext", "sentenceSuggestion", "familyWords", "synonyms", "antonyms"]
                }
            }
        });
        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        }
        const parsedData = JSON.parse(jsonStr);
        return { details: parsedData };
    } catch (error) {
        console.error("Error getting word details from Gemini:", error);
        return { error: "Could not retrieve word details. The AI service may be temporarily unavailable." };
    }
};

export const parseAndTranslateConversation = async (rawText: string, title: string, category: string): Promise<{ conversation?: Omit<Conversation, 'id' | 'isCustom' | 'lines'> & { lines: Omit<ConversationLine, 'audioUrl' | 'ipa'>[] }, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available. Please check your API key." };

    const prompt = `As an English learning expert, analyze the following conversation text.
    Conversation Title: "${title}"
    Category: "${category}"
    Raw Text:
    ---
    ${rawText}
    ---

    Your tasks are:
    1.  Parse the raw text into a structured list of conversation lines, identifying the speaker and their sentence.
    2.  Translate each English sentence into natural-sounding Vietnamese.
    3.  Estimate the overall CEFR level of the conversation (A1, A2, B1, B2, C1, or C2).

    Return a single JSON object with this exact structure:
    {
      "title": string,
      "level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
      "category": string,
      "lines": [{ "speaker": string, "sentence": string, "meaning": string }]
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
                                    meaning: { type: Type.STRING },
                                },
                                required: ["speaker", "sentence", "meaning"]
                            }
                        }
                    },
                    required: ["title", "level", "category", "lines"]
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

        return { conversation: parsedData };
    } catch (error) {
        console.error("Error parsing conversation with Gemini:", error);
        return { error: "Could not process the conversation. Please check the format and try again." };
    }
};

export const generateExampleSentences = async (word: string): Promise<{ examples?: Example[], error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available. Please check your API key." };

    const prompt = `As an English teacher for Vietnamese learners, create 3 diverse and clear example sentences for the word "${word}". For each sentence, provide a natural Vietnamese translation.

    Return a single JSON object with this exact structure:
    {
      "examples": [{ "en": string, "vi": string }]
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
                        examples: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    en: { type: Type.STRING },
                                    vi: { type: Type.STRING },
                                },
                                required: ["en", "vi"]
                            }
                        }
                    },
                    required: ["examples"]
                }
            }
        });
        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        }
        const parsedData = JSON.parse(jsonStr);
        return { examples: parsedData.examples };
    } catch (error) {
        console.error("Error generating examples with Gemini:", error);
        return { error: "Could not generate examples. The AI service may be temporarily unavailable." };
    }
};

export const generateGrammarExplanation = async (sentence: string): Promise<string> => {
    if (!ai) return "Đã xảy ra lỗi: Gemini AI is not available.";

    const prompt = `As an English grammar expert for Vietnamese learners, provide a concise explanation of the key grammar point in the following sentence. Keep the explanation simple and clear.
    Sentence: "${sentence}"
    Return only the plain text explanation.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating grammar explanation with Gemini:", error);
        return "Đã xảy ra lỗi: Could not generate explanation. The AI service may be temporarily unavailable.";
    }
};

export const refineVietnameseMeaning = async (sentence: string, originalMeaning: string): Promise<{ refinedMeaning?: string, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available. Please check your API key." };
    const prompt = `As an expert English-to-Vietnamese translator, refine the given Vietnamese translation to make it more natural and accurate in context.
    - English Sentence: "${sentence}"
    - Current Vietnamese Translation: "${originalMeaning}"

    If the current translation is already good, return it. If it can be improved, provide a better version.
    Return a single JSON object with this exact structure:
    {
      "refinedMeaning": string
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
        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        }
        const parsedData = JSON.parse(jsonStr);
        return { refinedMeaning: parsedData.refinedMeaning };
    } catch (error) {
        console.error("Error refining meaning with Gemini:", error);
        return { error: "Could not refine the meaning. The AI service may be temporarily unavailable." };
    }
};

export const refineVietnameseWordMeaning = async (word: string, originalMeaning: string): Promise<{ refinedMeaning?: string, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available. Please check your API key." };
    const prompt = `As an expert English-to-Vietnamese lexicographer, refine the given Vietnamese translation for the word to make it more natural and accurate.
    - English Word: "${word}"
    - Current Vietnamese Translation: "${originalMeaning}"

    If the current translation is good, return it. If it can be improved, provide a better version.
    Return a single JSON object with this exact structure:
    {
      "refinedMeaning": string
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
        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        }
        const parsedData = JSON.parse(jsonStr);
        return { refinedMeaning: parsedData.refinedMeaning };
    } catch (error) {
        console.error("Error refining word meaning with Gemini:", error);
        return { error: "Could not refine the meaning. The AI service may be temporarily unavailable." };
    }
};

export const getIpaForText = async (text: string): Promise<{ ipa?: string, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available. Please check your API key." };

    const prompt = `Provide the American English IPA transcription for the following text: "${text}".
    Return a single JSON object with this exact structure:
    {
      "ipa": string
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
                        ipa: { type: Type.STRING },
                    },
                    required: ["ipa"]
                }
            }
        });
        let jsonStr = response.text.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
        }
        const parsedData = JSON.parse(jsonStr);
        return { ipa: parsedData.ipa };
    } catch (error) {
        console.error("Error getting IPA from Gemini:", error);
        return { error: "Could not get IPA. The AI service may be temporarily unavailable." };
    }
};

export const startAITutorChat = (): Chat | null => {
    if (!ai) return null;

    const systemInstruction = `You are Zen, a friendly, empathetic, and patient English coach for Vietnamese learners. Your personality is curious and encouraging. Your primary goal is to help the user practice speaking natural, conversational English in a relaxed environment, and answer their questions about English.
    
    Core Instructions:
    1.  **Be Conversational & Natural**: Keep your responses relatively short and use natural-sounding language.
    2.  **Always Encourage**: End your responses in an encouraging way.
    3.  **Maintain Context**: Use the conversation history to inform your answers.
    4.  **Answer questions**: If asked about grammar, vocabulary, or culture, provide clear and simple explanations.`;
    
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction,
            },
        });
        return chat;
    } catch (error) {
        console.error("Failed to start AI Tutor chat session:", error);
        return null;
    }
};

// FIX: Add missing getAITutorResponse function
export const getAITutorResponse = async (history: Content[], newMessage: string): Promise<string> => {
    if (!ai) throw new Error("Gemini AI is not available.");

    const systemInstruction = `You are Zen, a friendly, empathetic, and patient English coach for Vietnamese learners. Your personality is curious and encouraging. Your primary goal is to help the user practice speaking natural, conversational English in a relaxed environment, and answer their questions about English.
    
    Core Instructions:
    1.  **Be Conversational & Natural**: Keep your responses relatively short and use natural-sounding language.
    2.  **Always Encourage**: End your responses in an encouraging way.
    3.  **Maintain Context**: Use the conversation history to inform your answers.
    4.  **Answer questions**: If asked about grammar, vocabulary, or culture, provide clear and simple explanations.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [...history, { role: 'user', parts: [{ text: newMessage }] }],
            config: {
                systemInstruction,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting AI Tutor response:", error);
        throw new Error("Could not get a response from the AI tutor.");
    }
};

export const translateText = async (text: string, sourceLang: 'Vietnamese' | 'English', targetLang: 'Vietnamese' | 'English'): Promise<{ translation?: string, error?: string }> => {
    if (!ai) return { error: "Gemini AI is not available. Please check your API key." };

    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}.
    Text: "${text}"
    Return only the translated text.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return { translation: response.text.trim() };
    } catch (error) {
        console.error("Error translating text with Gemini:", error);
        return { error: "Could not translate the text. The AI service may be temporarily unavailable." };
    }
};