import { create } from 'zustand';
import { Appearance } from 'react-native';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark' | 'system';

interface SettingsState {
    theme: ThemeType;
    resolvedTheme: 'light' | 'dark'; // Real active theme
    notifications: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
    setTheme: (theme: ThemeType) => void;
    setResolvedTheme: (theme: 'light' | 'dark') => void;
    toggleNotifications: () => void;
    togglePush: () => void;
    toggleEmail: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'system',
            resolvedTheme: Appearance.getColorScheme() || 'light',
            notifications: true,
            pushEnabled: true,
            emailEnabled: true,

            setTheme: (theme) => {
                const systemTheme = Appearance.getColorScheme() || 'light';
                set({
                    theme,
                    resolvedTheme: theme === 'system' ? systemTheme : theme
                });
            },

            setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),

            toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
            togglePush: () => set((state) => ({ pushEnabled: !state.pushEnabled })),
            toggleEmail: () => set((state) => ({ emailEnabled: !state.emailEnabled })),
        }),
        {
            name: 'settings-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
