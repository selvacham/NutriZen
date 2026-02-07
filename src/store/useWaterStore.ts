import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface WaterLog {
    id: string;
    user_id: string;
    amount_ml: number;
    logged_at: string;
}

interface WaterState {
    logs: WaterLog[];
    dateLogs: WaterLog[];
    selectedDate: Date;
    loading: boolean;
    fetchLogs: (userId: string) => Promise<void>;
    fetchDateLogs: (userId: string, date?: Date) => Promise<void>;
    setSelectedDate: (date: Date) => void;
    addLog: (amount_ml: number, userId: string) => Promise<void>;
    deleteLog: (id: string) => Promise<void>;
    goal: number;
    setGoal: (goal: number) => void;
    getTotalForDate: () => number;
}

export const useWaterStore = create<WaterState>()(
    persist(
        (set, get) => ({
            logs: [],
            dateLogs: [],
            selectedDate: new Date(),
            loading: false,
            goal: 2250,

            setGoal: (goal) => set({ goal }),
            setSelectedDate: (date) => set({ selectedDate: date }),

            fetchLogs: async (userId) => {
                set({ loading: true });
                try {
                    const { data, error } = await supabase
                        .from('water_logs')
                        .select('*')
                        .eq('user_id', userId)
                        .order('logged_at', { ascending: false });

                    if (data) set({ logs: data });
                } catch (error) {
                    console.error('Error fetching water logs:', error);
                } finally {
                    set({ loading: false });
                }
            },

            fetchDateLogs: async (userId, date) => {
                set({ loading: true });
                try {
                    const targetDate = date || get().selectedDate;
                    const startOfDay = new Date(targetDate);
                    startOfDay.setHours(0, 0, 0, 0);

                    const endOfDay = new Date(targetDate);
                    endOfDay.setHours(23, 59, 59, 999);

                    const { data, error } = await supabase
                        .from('water_logs')
                        .select('*')
                        .eq('user_id', userId)
                        .gte('logged_at', startOfDay.toISOString())
                        .lte('logged_at', endOfDay.toISOString())
                        .order('logged_at', { ascending: false });

                    if (data) set({ dateLogs: data });
                } catch (error) {
                    console.error('Error fetching water logs for date:', error);
                } finally {
                    set({ loading: false });
                }
            },

            addLog: async (amount_ml, userId) => {
                try {
                    const { data, error } = await supabase
                        .from('water_logs')
                        .insert([{ amount_ml, user_id: userId }])
                        .select()
                        .single();

                    if (data) {
                        set({
                            logs: [data, ...get().logs],
                            dateLogs: new Date(data.logged_at).toDateString() === get().selectedDate.toDateString()
                                ? [data, ...get().dateLogs]
                                : get().dateLogs
                        });
                    }
                } catch (error) {
                    console.error('Failed to add water log:', error);
                }
            },

            deleteLog: async (id) => {
                try {
                    const { error } = await supabase
                        .from('water_logs')
                        .delete()
                        .eq('id', id);

                    if (!error) {
                        set({
                            logs: get().logs.filter(l => l.id !== id),
                            dateLogs: get().dateLogs.filter(l => l.id !== id)
                        });
                    }
                } catch (error) {
                    console.error('Error deleting water log:', error);
                }
            },

            getTotalForDate: () => {
                const logs = get().dateLogs;
                return logs.reduce((sum, log) => sum + log.amount_ml, 0);
            },
        }),
        {
            name: 'water-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ goal: state.goal }),
        }
    )
);
