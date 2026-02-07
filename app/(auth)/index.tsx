import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const { height } = Dimensions.get('window');

export default function LandingScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#0d9488', '#14b8a6', '#2dd4bf']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.content}>
                    {/* Logo and Branding */}
                    <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoEmoji}>🥗</Text>
                        </View>
                        <Text style={styles.title}>NutriZen</Text>
                        <Text style={styles.subtitle}>
                            Track. Analyze. Transform.
                        </Text>
                    </Animated.View>

                    {/* Features - Compact */}
                    <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.features}>
                        <View style={styles.featureRow}>
                            <FeatureItem icon="📊" title="Smart Tracking" />
                            <FeatureItem icon="💪" title="Fitness Goals" />
                        </View>
                        <View style={styles.featureRow}>
                            <FeatureItem icon="🤖" title="AI Coach" />
                            <FeatureItem icon="📈" title="Progress" />
                        </View>
                    </Animated.View>

                    {/* CTA Buttons */}
                    <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.buttons}>
                        <TouchableOpacity
                            onPress={() => router.push('/signup')}
                            style={styles.primaryButton}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.primaryButtonText}>
                                Get Started Free
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/login')}
                            style={styles.secondaryButton}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Sign In
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

function FeatureItem({ icon, title }: { icon: string; title: string }) {
    return (
        <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>{icon}</Text>
            <Text style={styles.featureTitle}>{title}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0d9488',
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    header: {
        alignItems: 'center',
        marginTop: height * 0.08,
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    logoEmoji: {
        fontSize: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        fontWeight: '500',
    },
    features: {
        gap: 12,
    },
    featureRow: {
        flexDirection: 'row',
        gap: 12,
    },
    featureItem: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    featureIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    featureTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: 'white',
        textAlign: 'center',
    },
    buttons: {
        gap: 12,
        marginBottom: 20,
    },
    primaryButton: {
        backgroundColor: 'white',
        borderRadius: 16,
        paddingVertical: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    primaryButtonText: {
        color: '#0d9488',
        textAlign: 'center',
        fontSize: 17,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        borderRadius: 16,
        paddingVertical: 18,
    },
    secondaryButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 17,
        fontWeight: '600',
    },
});
