import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface SleepLog {
    id: string;
    user_id: string;
    duration_minutes: number;
    quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    notes?: string;
    logged_at: string;
}

interface SleepState {
    logs: SleepLog[];
    dateLog: SleepLog | null;
    selectedDate: Date;
    loading: boolean;
    fetchLogs: (userId: string) => Promise<void>;
    fetchDateLog: (userId: string, date?: Date) => Promise<void>;
    setSelectedDate: (date: Date) => void;
    addLog: (log: Omit<SleepLog, 'id' | 'logged_at' | 'user_id'>, userId: string) => Promise<void>;
    deleteLog: (id: string) => Promise<void>;
    sleepGoal: number;
    bedtime: string;
    waketime: string;
    setSleepGoal: (hours: number) => void;
    setSleepSchedule: (bedtime: string, waketime: string) => void;
}

export const useSleepStore = create<SleepState>()(
    persist(
        (set, get) => ({
            logs: [],
            dateLog: null,
            selectedDate: new Date(),
            loading: false,
            sleepGoal: 8,
            bedtime: new Date().setHours(22, 0, 0, 0).toString(),
            waketime: new Date().setHours(7, 0, 0, 0).toString(),

            setSleepGoal: (hours) => set({ sleepGoal: hours }),
            setSleepSchedule: (bedtime, waketime) => set({ bedtime, waketime }),
            setSelectedDate: (date) => set({ selectedDate: date }),

            fetchLogs: async (userId) => {
                set({ loading: true });
                const { data, error } = await supabase
                    .from('sleep_logs')
                    .select('*')
                    .eq('user_id', userId)
                    .order('logged_at', { ascending: false });

                if (data) set({ logs: data });
                set({ loading: false });
            },

            fetchDateLog: async (userId, date) => {
                set({ loading: true });
                const targetDate = date || get().selectedDate;
                const startOfDay = new Date(targetDate);
                startOfDay.setHours(0, 0, 0, 0);

                const endOfDay = new Date(targetDate);
                endOfDay.setHours(23, 59, 59, 999);

                const { data, error } = await supabase
                    .from('sleep_logs')
                    .select('*')
                    .eq('user_id', userId)
                    .gte('logged_at', startOfDay.toISOString())
                    .lte('logged_at', endOfDay.toISOString())
                    .order('logged_at', { ascending: false })
                    .maybeSingle();

                if (data) set({ dateLog: data });
                else set({ dateLog: null });
                set({ loading: false });
            },

            addLog: async (log, userId) => {
                try {
                    set({ loading: true });
                    const { data, error } = await supabase
                        .from('sleep_logs')
                        .insert([{ ...log, user_id: userId }])
                        .select()
                        .single();

                    if (data) {
                        set((state) => ({
                            logs: [data, ...state.logs],
                            dateLog: new Date(data.logged_at).toDateString() === get().selectedDate.toDateString()
                                ? data
                                : state.dateLog
                        }));
                    }
                } catch (error) {
                    console.error('Error adding sleep log:', error);
                    throw error;
                } finally {
                    set({ loading: false });
                }
            },

            deleteLog: async (id) => {
                try {
                    set({ loading: true });
                    const { error } = await supabase
                        .from('sleep_logs')
                        .delete()
                        .eq('id', id);

                    if (!error) {
                        set((state) => ({
                            logs: state.logs.filter((l) => l.id !== id),
                            dateLog: state.dateLog?.id === id ? null : state.dateLog,
                        }));
                    }
                } catch (error) {
                    console.error('Error deleting sleep log:', error);
                } finally {
                    set({ loading: false });
                }
            },
        }),
        {
            name: 'sleep-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                sleepGoal: state.sleepGoal,
                bedtime: state.bedtime,
                waketime: state.waketime
            }),
        }
    )
);
