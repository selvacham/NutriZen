import { Redirect, Stack, useSegments } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function AuthLayout() {
    const { user, profile, loading } = useAuthStore();
    const segments = useSegments();

    console.log('[AuthLayout] State:', {
        loading,
        userEmail: user?.email,
        hasProfile: !!profile,
        segments
    });

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0d9488" />
            </View>
        );
    }

    // If user is authenticated and has a profile, redirect to tabs
    if (user && profile) {
        return <Redirect href="/(tabs)" />;
    }

    // If user is authenticated but no profile, redirect to onboarding
    // Check if identifying as 'onboarding' is in segments to avoid loop
    const inOnboarding = (segments as string[]).includes('onboarding');

    if (user && !profile && !inOnboarding) {
        return <Redirect href="/(auth)/onboarding" />;
    }

    // Otherwise, show auth screens
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="onboarding" />
        </Stack>
    );
}
