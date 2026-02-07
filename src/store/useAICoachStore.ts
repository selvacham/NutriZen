import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface ChatMessage {
    id: string;
    user_id?: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

interface AICoachState {
    messages: ChatMessage[];
    loading: boolean;
    fetchMessages: (userId: string) => Promise<void>;
    sendMessage: (content: string, userId: string) => Promise<void>;
    clearMessages: (userId: string) => Promise<void>;
}

// Mock AI responses for demonstration
const mockAIResponses = [
    "Great question! Based on your current progress, you're doing amazing. Keep up the good work! 💪",
    "I've analyzed your nutrition data. You're hitting your protein goals consistently. Consider adding more vegetables for fiber.",
    "Your activity level is impressive! Remember to stay hydrated and get adequate rest for recovery.",
    "Based on your food logs, you're maintaining a good calorie deficit. This should help you reach your weight goal safely.",
    "I notice you've been consistent with your workouts. That's the key to long-term success! 🎯",
    "Your macro balance looks good. Try to spread your protein intake throughout the day for better absorption.",
    "Excellent progress this week! You've logged 5 workouts and stayed within your calorie goals. Keep it up!",
];

function getRandomAIResponse(userMessage: string): string {
    // Simple keyword-based responses
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('protein') || lowerMessage.includes('macro')) {
        return "Your protein intake looks good! Aim for 1.6-2.2g per kg of body weight for optimal muscle maintenance. Include sources like chicken, fish, eggs, and legumes.";
    }

    if (lowerMessage.includes('weight') || lowerMessage.includes('lose')) {
        return "For sustainable weight loss, aim for a 500-calorie deficit per day. This should result in about 0.5kg loss per week. Remember, consistency is more important than perfection!";
    }

    if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
        return "Great that you're staying active! Aim for at least 150 minutes of moderate activity per week. Mix cardio with strength training for best results. 🏋️";
    }

    if (lowerMessage.includes('water') || lowerMessage.includes('hydration')) {
        return "Hydration is crucial! Aim for 8-10 glasses (2-3 liters) of water daily. More if you're exercising. Your body will thank you! 💧";
    }

    // Default random response
    return mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
}

export const useAICoachStore = create<AICoachState>((set, get) => ({
    messages: [],
    loading: false,

    fetchMessages: async (userId) => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('ai_chat_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (data) set({ messages: data });
        set({ loading: false });
    },

    sendMessage: async (content: string, userId: string) => {
        set({ loading: true });

        // Add user message
        const { data: userMsg, error: userError } = await supabase
            .from('ai_chat_history')
            .insert([{ content, role: 'user', user_id: userId }])
            .select()
            .single();

        if (userMsg) {
            set({ messages: [...get().messages, userMsg] });
        }

        // Simulate AI thinking delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate AI response
        const aiResponse = getRandomAIResponse(content);

        const { data: aiMsg, error: aiError } = await supabase
            .from('ai_chat_history')
            .insert([{ content: aiResponse, role: 'assistant', user_id: userId }])
            .select()
            .single();

        if (aiMsg) {
            set({ messages: [...get().messages, aiMsg] });
        }

        set({ loading: false });
    },

    clearMessages: async (userId: string) => {
        set({ loading: true });
        const { error } = await supabase
            .from('ai_chat_history')
            .delete()
            .eq('user_id', userId);

        if (!error) set({ messages: [] });
        set({ loading: false });
    },
}));
