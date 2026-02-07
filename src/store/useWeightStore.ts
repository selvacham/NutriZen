import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './useAuthStore';

export interface WeightLog {
    id: string;
    user_id: string;
    weight_kg: number;
    unit?: 'kg' | 'lbs'; // Local unit preference at time of entry (optional)
    logged_at: string;
}

interface WeightState {
    logs: WeightLog[];
    unit: 'kg' | 'lbs';
    loading: boolean;
    fetchLogs: (userId: string) => Promise<void>;
    addLog: (weight: number, userId: string) => Promise<void>;
    deleteLog: (id: string) => Promise<void>;
    toggleUnit: () => void;
    convertWeight: (weight: number, targetUnit?: 'kg' | 'lbs') => number;
}

export const useWeightStore = create<WeightState>()(
    persist(
        (set, get) => ({
            logs: [],
            unit: 'kg',
            loading: false,

            toggleUnit: () => {
                const newUnit = get().unit === 'kg' ? 'lbs' : 'kg';
                set({ unit: newUnit });
            },

            convertWeight: (weight, targetUnit) => {
                const currentUnit = targetUnit || get().unit;
                if (currentUnit === 'kg') return weight;
                // kg to lbs
                return parseFloat((weight * 2.20462).toFixed(1));
            },

            fetchLogs: async (userId) => {
                set({ loading: true });
                try {
                    const { data, error } = await supabase
                        .from('weight_logs')
                        .select('*')
                        .eq('user_id', userId)
                        .order('logged_at', { ascending: false });

                    if (data) set({ logs: data });
                } catch (error) {
                    console.error('Error fetching weight logs:', error);
                } finally {
                    set({ loading: false });
                }
            },

            addLog: async (weight, userId) => {
                set({ loading: true });
                try {
                    // Always store in KG in DB, store the unit used for reference if needed
                    const currentUnit = get().unit;
                    const weightInKg = currentUnit === 'lbs' ? weight * 0.453592 : weight;

                    const { data, error } = await supabase
                        .from('weight_logs')
                        .insert([{
                            weight_kg: weightInKg,
                            user_id: userId
                        }])
                        .select()
                        .single();

                    if (data) {
                        set({ logs: [data, ...get().logs] });

                        // Sync with profile
                        const { setProfile, profile } = useAuthStore.getState();
                        await supabase
                            .from('user_profiles')
                            .update({ current_weight_kg: weightInKg })
                            .eq('id', userId);

                        if (profile) {
                            console.log('Syncing weight with profile...', weightInKg);
                            setProfile({ ...profile, current_weight_kg: weightInKg });
                        }
                    }
                } catch (error) {
                    console.error('Error adding weight log:', error);
                } finally {
                    set({ loading: false });
                }
            },

            deleteLog: async (id) => {
                set({ loading: true });
                try {
                    const { error } = await supabase
                        .from('weight_logs')
                        .delete()
                        .eq('id', id);

                    if (!error) {
                        set({ logs: get().logs.filter(l => l.id !== id) });
                    }
                } catch (error) {
                    console.error('Error deleting weight log:', error);
                } finally {
                    set({ loading: false });
                }
            },
        }),
        {
            name: 'weight-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ unit: state.unit }),
        }
    )
);
