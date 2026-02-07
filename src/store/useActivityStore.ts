import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface ActivityLog {
    id: string;
    user_id: string;
    activity_type: string;
    duration_minutes: number;
    calories_burned: number;
    activity_group?: string;
    performed_at: string;
}

interface ActivityState {
    logs: ActivityLog[];
    dateLogs: ActivityLog[];
    selectedDate: Date;
    steps: number;
    loading: boolean;
    fetchLogs: (userId: string) => Promise<void>;
    fetchDateLogs: (userId: string, date?: Date) => Promise<void>;
    setSelectedDate: (date: Date) => void;
    addLog: (log: Omit<ActivityLog, 'id' | 'performed_at' | 'user_id'>, userId: string) => Promise<void>;
    deleteLog: (id: string) => Promise<void>;
    getCaloriesBurnedForDate: () => number;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
    logs: [],
    dateLogs: [],
    selectedDate: new Date(),
    steps: 0,
    loading: false,

    setSelectedDate: (date) => set({ selectedDate: date }),

    fetchLogs: async (userId) => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('workouts')
            .select('*')
            .eq('user_id', userId)
            .order('performed_at', { ascending: false });

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
            .from('workouts')
            .select('*')
            .eq('user_id', userId)
            .gte('performed_at', startOfDay.toISOString())
            .lte('performed_at', endOfDay.toISOString())
            .order('performed_at', { ascending: false });

        if (data) set({ dateLogs: data });
        set({ loading: false });
    },

    addLog: async (log, userId) => {
        const { data, error } = await supabase
            .from('workouts')
            .insert([{ ...log, user_id: userId }])
            .select()
            .single();

        if (data) {
            set({
                logs: [data, ...get().logs],
                dateLogs: new Date(data.performed_at).toDateString() === get().selectedDate.toDateString()
                    ? [data, ...get().dateLogs]
                    : get().dateLogs
            });
        }
    },

    deleteLog: async (id) => {
        const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', id);

        if (!error) {
            set({
                logs: get().logs.filter(l => l.id !== id),
                dateLogs: get().dateLogs.filter(l => l.id !== id)
            });
        }
    },

    getCaloriesBurnedForDate: () => {
        const logs = get().dateLogs;
        return logs.reduce((acc, log) => acc + log.calories_burned, 0);
    },
}));
