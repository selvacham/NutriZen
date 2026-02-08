import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function AuthLayout() {
    const { user, hasProfile, loading } = useAuthStore();
    const segments = useSegments();
    const [isReady, setIsReady] = useState(false);  // 👈 NEW: Wait for auth

    useEffect(() => {
        const init = async () => {
            await useAuthStore.getState().initializeAuth();
            setIsReady(true);  // 👈 ONLY render logic AFTER init
        };
        init();
    }, []);

    //console.log('[AuthLayout] State:', { loading, isReady, userEmail: user?.email, hasProfile, segments });

    // 👈 ALWAYS WAIT for both loading + init
    if (loading || !isReady) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0d9488" />
            </View>
        );
    }

    if (user && hasProfile) {
        //console.log('[AuthLayout] ✅ → TABS');
        return <Redirect href="/(tabs)" />;
    }

    const inOnboarding = (segments as string[]).includes('onboarding');
    if (user && !hasProfile && !inOnboarding) {
        //console.log('[AuthLayout] → Onboarding');
        return <Redirect href="/(auth)/onboarding" />;
    }

    //console.log('[AuthLayout] → Auth screens');
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="onboarding" />
        </Stack>
    );
}
