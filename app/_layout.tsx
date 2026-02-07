import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/useAuthStore';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { StatusBar } from 'expo-status-bar';
import '../src/global.css';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const { colorScheme, setColorScheme } = useColorScheme();
    const { setUser, setProfile, setLoading } = useAuthStore();
    const { theme } = useSettingsStore(); // Get theme from store
    const [appReady, setAppReady] = useState(false);

    // Sync theme from store to NativeWind
    useEffect(() => {
        console.log('Syncing theme:', theme);
        setColorScheme(theme);
    }, [theme]);

    const { loading } = useAuthStore();
    // Watchdog for ANY stuck loading state
    useEffect(() => {
        if (loading) {
            console.log('Watchdog: Loading detected, starting 6s timer...');
            const timer = setTimeout(() => {
                console.log('Watchdog: Loading stuck for 6s, forcing off');
                setLoading(false);
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    const isDark = colorScheme === 'dark';

    useEffect(() => {
        let isMounted = true;
        const loadingTimeout = setTimeout(() => {
            if (isMounted) {
                console.log('Auth took too long, forcing loading off');
                setLoading(false);
                setAppReady(true);
            }
        }, 5000); // 5 second fallback

        const syncProfile = async (userId: string) => {
            try {
                console.log('Syncing profile for user:', userId);
                const { data: profile, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (isMounted) {
                    if (profile) {
                        console.log('Profile found:', profile.full_name);
                        setProfile(profile);
                    } else if (error) {
                        if (error.code === 'PGRST116') {
                            console.log('No profile found (new user)');
                            setProfile(null);
                        } else {
                            console.error('Profile sync error:', error);
                        }
                    }
                }
            } catch (err) {
                console.error('Critical profile sync error:', err);
            }
        };

        const initAuth = async () => {
            try {
                console.log('Initializing auth...');
                const { data: { session } } = await supabase.auth.getSession();

                if (isMounted) {
                    if (session?.user) {
                        setUser(session.user);
                        await syncProfile(session.user.id);
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
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
            console.log('Auth state changed event:', event);

            if (!isMounted) return;

            try {
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                    if (session?.user) {
                        console.log('User detected, syncing profile...');
                        setLoading(true);
                        setUser(session.user);
                        await syncProfile(session.user.id);
                    }
                } else if (event === 'SIGNED_OUT') {
                    console.log('User signed out, clearing state');
                    setUser(null);
                    setProfile(null);
                }
            } catch (err) {
                console.error('Error in onAuthStateChange handler:', err);
            } finally {
                // Always ensure loading is false if session is stable or after an attempt
                if (isMounted) {
                    console.log('Finalizing auth event handling, loading off');
                    setLoading(false);
                }
            }
        });

        return () => {
            isMounted = false;
            clearTimeout(loadingTimeout);
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (appReady) {
            const hideSplash = async () => {
                try {
                    await SplashScreen.hideAsync();
                } catch (e) {
                    console.log('Splash screen already hidden or not registered');
                }
            };
            const timer = setTimeout(hideSplash, 500);
            return () => clearTimeout(timer);
        }
    }, [appReady]);

    if (!appReady) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }} className="bg-white dark:bg-slate-950">
            <SafeAreaProvider>
                <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(tabs)" />
                    </Stack>
                    <StatusBar style={isDark ? 'light' : 'dark'} />
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
