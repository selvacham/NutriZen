import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

export interface GroceryItem {
    id: string;
    name: string;
    category: string;
    is_bought: boolean;
    suggested_by_ai: boolean;
}

interface GroceryState {
    items: GroceryItem[];
    loading: boolean;
    addItem: (name: string, category?: string, suggested?: boolean) => void;
    toggleItem: (id: string) => void;
    removeItem: (id: string) => void;
    clearBought: () => void;
    setItems: (items: GroceryItem[]) => void;
}

export const useGroceryStore = create<GroceryState>()(
    persist(
        (set, get) => ({
            items: [],
            loading: false,
            addItem: (name, category = 'Other', suggested = false) => {
                const newItem: GroceryItem = {
                    id: Math.random().toString(36).substring(7),
                    name,
                    category,
                    is_bought: false,
                    suggested_by_ai: suggested,
                };
                set({ items: [newItem, ...get().items] });
            },
            toggleItem: (id) => {
                set({
                    items: get().items.map((item) =>
                        item.id === id ? { ...item, is_bought: !item.is_bought } : item
                    ),
                });
            },
            removeItem: (id) => {
                set({
                    items: get().items.filter((item) => item.id !== id),
                });
            },
            clearBought: () => {
                set({
                    items: get().items.filter((item) => !item.is_bought),
                });
            },
            setItems: (items) => set({ items }),
        }),
        {
            name: 'grocery-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
