import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'light' | 'dark' | 'system';

interface SettingsState {
    theme: ThemeType;
    notifications: boolean;
    pushEnabled: boolean;
    emailEnabled: boolean;
    setTheme: (theme: ThemeType) => void;
    toggleNotifications: () => void;
    togglePush: () => void;
    toggleEmail: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            theme: 'system',
            notifications: true,
            pushEnabled: true,
            emailEnabled: true,
            setTheme: (theme) => set({ theme }),
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
