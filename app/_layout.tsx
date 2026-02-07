import * as React from 'react';
import { Stack } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useColorScheme } from 'nativewind';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/useAuthStore';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { useNotificationEngine } from '../src/hooks/useNotificationEngine';
import '../src/global.css';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => { });

export default function RootLayout() {
    const { colorScheme, setColorScheme } = useColorScheme();
    const { setUser, setProfile, setLoading } = useAuthStore();
    const { theme } = useSettingsStore();
    const [appReady, setAppReady] = useState(false);

    // Sync theme from store to NativeWind
    useEffect(() => {
        setColorScheme(theme);
    }, [theme]);

    const { loading } = useAuthStore();
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => setLoading(false), 6000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    const isDark = colorScheme === 'dark';

    useEffect(() => {
        let isMounted = true;
        const loadingTimeout = setTimeout(() => {
            if (isMounted) {
                setLoading(false);
                setAppReady(true);
            }
        }, 8000); // Increased timeout for slower environments

        const syncProfile = async (userId: string) => {
            try {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                if (isMounted && profile) setProfile(profile);
            } catch (err) {
                console.error('Profile sync error:', err);
            }
        };

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (isMounted && session?.user) {
                    setUser(session.user);
                    await syncProfile(session.user.id);
                }
            } catch (error) {
                console.error('Auth init error:', error);
            } finally {
                if (isMounted) {
                    setAppReady(true);
                    setLoading(false);
                    clearTimeout(loadingTimeout);
                }
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!isMounted) return;
            if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                    setUser(session.user);
                    await syncProfile(session.user.id);
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
            }
        });

        return () => {
            isMounted = false;
            clearTimeout(loadingTimeout);
            subscription.unsubscribe();
        };
    }, []);

    const onLayout = useCallback(async () => {
        if (appReady) {
            try {
                await SplashScreen.hideAsync().catch(() => { });
            } catch (e) { }
        }
    }, [appReady]);

    if (!appReady) {
        // Use standard View to avoid layout issues during splash
        return <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#ffffff' }} />;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
            <SafeAreaProvider>
                <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
                    <RootContent />
                    <StatusBar style={isDark ? 'light' : 'dark'} />
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

function RootContent() {
    useNotificationEngine();
    return <Stack screenOptions={{ headerShown: false }} />;
}
