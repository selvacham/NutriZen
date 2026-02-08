import * as React from 'react';
import { Stack } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { Appearance } from 'react-native';
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
    const { theme, setResolvedTheme } = useSettingsStore();
    const [appReady, setAppReady] = useState(false);

    // 1. Sync user preference to NativeWind
    useEffect(() => {
        //console.log('[RootLayout] Setting theme preference:', theme);
        setColorScheme(theme);
    }, [theme]);

    // 2. Update store with the ACTUAL active theme (resolved by NativeWind)
    useEffect(() => {
        if (colorScheme) {
            //console.log('[RootLayout] Resolved theme changed to:', colorScheme);
            setResolvedTheme(colorScheme as 'light' | 'dark');
        }
    }, [colorScheme]);

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
        }, 8000);

        const init = async () => {
            try {
                // Initialize auth store (handles session & profile)
                await useAuthStore.getState().initializeAuth();
            } catch (error) {
                console.error('[RootLayout] Init error:', error);
            } finally {
                if (isMounted) {
                    setAppReady(true);
                    clearTimeout(loadingTimeout);
                }
            }
        };

        init();

        // Global Auth Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log(`[RootLayout] Auth State Changed: ${event}. User: ${session?.user?.id}`);

            if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                const { isSigningOut } = useAuthStore.getState();

                if (isSigningOut) {
                    // Check if it's potentially the SAME user triggering a ghost event
                    const { user } = useAuthStore.getState();
                    if (!user || user.id === session?.user?.id) {
                        console.warn(`[RootLayout] Ignoring ${event} because isSigningOut is true (Ghost Login prevention)`);
                        return;
                    }
                    console.log('[RootLayout] New user detected during signout cleanup. Proceeding with login.');
                    useAuthStore.setState({ isSigningOut: false }); // Force clear flag
                }

                // Store handles state updates internally, but we can force re-fetch if needed
                if (session?.user) {
                    console.log('[RootLayout] Setting user in store:', session.user.id);
                    useAuthStore.getState().setUser(session.user);
                    if (session.user.id) {
                        await useAuthStore.getState().fetchProfile(session.user.id, session.access_token);
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                console.log('[RootLayout] Handling SIGNED_OUT event');
                useAuthStore.getState().reset();
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
                    <Stack screenOptions={{ headerShown: false }} />
                    <StatusBar style={isDark ? 'light' : 'dark'} />
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
