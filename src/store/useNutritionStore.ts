import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface FoodLog {
    id: string;
    user_id: string;
    food_name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fats_g: number;
    meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    logged_at: string;
}

interface NutritionState {
    logs: FoodLog[];
    dateLogs: FoodLog[];
    selectedDate: Date;
    loading: boolean;
    fetchLogs: (userId: string) => Promise<void>;
    fetchDateLogs: (userId: string, date?: Date) => Promise<void>;
    setSelectedDate: (date: Date) => void;
    addLog: (log: Omit<FoodLog, 'id' | 'logged_at' | 'user_id'>, userId: string) => Promise<void>;
    deleteLog: (id: string) => Promise<void>;
    getTotalsForDate: () => { calories: number; protein: number; carbs: number; fats: number };
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
    logs: [],
    dateLogs: [],
    selectedDate: new Date(),
    loading: false,

    setSelectedDate: (date) => set({ selectedDate: date }),

    fetchLogs: async (userId) => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('food_logs')
            .select('*')
            .eq('user_id', userId)
            .order('logged_at', { ascending: false });

        if (data) set({ logs: data });
        set({ loading: false });
    },

    fetchDateLogs: async (userId, date) => {
        set({ loading: true });
        const targetDate = date || get().selectedDate;
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
            .from('food_logs')
            .select('*')
            .eq('user_id', userId)
            .gte('logged_at', startOfDay.toISOString())
            .lte('logged_at', endOfDay.toISOString())
            .order('logged_at', { ascending: false });

        if (data) set({ dateLogs: data });
        set({ loading: false });
    },

    addLog: async (log, userId) => {
        try {
            const { data, error } = await supabase
                .from('food_logs')
                .insert([{ ...log, user_id: userId }])
                .select()
                .single();

            if (data) {
                set({
                    logs: [data, ...get().logs],
                    // Only add to dateLogs if it matches the selectedDate
                    dateLogs: new Date(data.logged_at).toDateString() === get().selectedDate.toDateString()
                        ? [data, ...get().dateLogs]
                        : get().dateLogs
                });
            }
        } catch (error) {
            console.error('Failed to add food log:', error);
            throw error;
        }
    },

    deleteLog: async (id) => {
        const { error } = await supabase
            .from('food_logs')
            .delete()
            .eq('id', id);

        if (!error) {
            set({
                logs: get().logs.filter(l => l.id !== id),
                dateLogs: get().dateLogs.filter(l => l.id !== id)
            });
        }
    },

    getTotalsForDate: () => {
        const logs = get().dateLogs;
        return logs.reduce((acc, log) => ({
            calories: acc.calories + log.calories,
            protein: acc.protein + log.protein_g,
            carbs: acc.carbs + log.carbs_g,
            fats: acc.fats + log.fats_g,
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
    },
}));
