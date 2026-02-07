import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Badge {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string | null;
}

interface GamificationState {
    streak: number;
    maxStreak: number;
    badges: Badge[];
    lastLoggedDate: string | null;
    updateStreak: () => void;
    unlockBadge: (badgeId: string) => void;
}

const INITIAL_BADGES: Badge[] = [
    { id: 'first_log', title: 'Getting Started', description: 'Log your first meal', icon: '🎯', unlockedAt: null },
    { id: '3_day_streak', title: 'Consistency King', description: 'Log for 3 days in a row', icon: '🔥', unlockedAt: null },
    { id: '7_day_streak', title: 'Unstoppable', description: 'Log for 7 days in a row', icon: '🦁', unlockedAt: null },
    { id: 'hydration_pro', title: 'Hydration Hero', description: 'Reach your water goal', icon: '💧', unlockedAt: null },
];

export const useGamificationStore = create<GamificationState>()(
    persist(
        (set, get) => ({
            streak: 0,
            maxStreak: 0,
            badges: INITIAL_BADGES,
            lastLoggedDate: null,

            updateStreak: () => {
                const today = new Date().toDateString();
                const lastDate = get().lastLoggedDate;

                if (lastDate === today) return;

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (lastDate === yesterday.toDateString()) {
                    const newStreak = get().streak + 1;
                    set({
                        streak: newStreak,
                        maxStreak: Math.max(newStreak, get().maxStreak),
                        lastLoggedDate: today
                    });

                    // Auto-unlock streak badges
                    if (newStreak === 3) get().unlockBadge('3_day_streak');
                    if (newStreak === 7) get().unlockBadge('7_day_streak');
                } else {
                    set({
                        streak: 1,
                        lastLoggedDate: today
                    });
                    get().unlockBadge('first_log');
                }
            },

            unlockBadge: (badgeId: string) => {
                const badges = get().badges.map(b => {
                    if (b.id === badgeId && !b.unlockedAt) {
                        return { ...b, unlockedAt: new Date().toISOString() };
                    }
                    return b;
                });
                set({ badges });
            },
        }),
        {
            name: 'gamification-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
