import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../src/lib/supabase';
import { signInWithGoogle } from '../../src/services/googleAuth';
import { useAuthStore } from '../../src/store/useAuthStore';

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const router = useRouter();
    const { setUser } = useAuthStore();

    const handleSignup = async () => {
        if (!name || !email || !password) {
            alert('Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        full_name: name.trim(),
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                setUser(data.user);
                router.replace('/(auth)/onboarding');
            }
        } catch (error: any) {
            console.error('Signup error:', error);
            alert(error.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setGoogleLoading(true);
        try {
            const result = await signInWithGoogle();
            if (result.success) {
                setTimeout(() => {
                    router.replace('/(auth)/onboarding');
                }, 1000);
            } else {
                alert(result.error || 'Failed to sign up with Google');
            }
        } catch (error) {
            console.error('Google signup error:', error);
            alert('Failed to sign up with Google');
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#0d9488', '#14b8a6']}
            style={styles.gradient}
        >
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <ArrowLeft size={24} color="white" />
                        </TouchableOpacity>

                        {/* Title */}
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Start your wellness journey today</Text>
                        </View>

                        {/* Form Card */}
                        <View style={styles.formCard}>
                            {/* Google Sign Up */}
                            <TouchableOpacity
                                onPress={handleGoogleSignup}
                                disabled={googleLoading}
                                style={styles.googleButton}
                                activeOpacity={0.8}
                            >
                                {googleLoading ? (
                                    <ActivityIndicator color="#0d9488" />
                                ) : (
                                    <>
                                        <Text style={styles.googleIcon}>🔐</Text>
                                        <Text style={styles.googleButtonText}>
                                            Continue with Google
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>or</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            {/* Name Input */}
                            <View style={styles.inputContainer}>
                                <User size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor="#94a3b8"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>

                            {/* Email Input */}
                            <View style={styles.inputContainer}>
                                <Mail size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                />
                            </View>

                            {/* Password Input */}
                            <View style={styles.inputContainer}>
                                <Lock size={20} color="#64748b" />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password (min 6 characters)"
                                    placeholderTextColor="#94a3b8"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                />
                            </View>

                            {/* Sign Up Button */}
                            <TouchableOpacity
                                onPress={handleSignup}
                                disabled={loading}
                                style={styles.signupButton}
                                activeOpacity={0.8}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={styles.signupButtonText}>Create Account</Text>
                                )}
                            </TouchableOpacity>

                            {/* Sign In Link */}
                            <View style={styles.signinContainer}>
                                <Text style={styles.signinText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => router.push('/login')}>
                                    <Text style={styles.signinLink}>Sign In</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    titleContainer: {
        marginTop: 20,
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
        marginBottom: 32,
    },
    googleButton: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    googleIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    googleButtonText: {
        color: '#334155',
        fontWeight: '600',
        fontSize: 16,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#e2e8f0',
    },
    dividerText: {
        marginHorizontal: 16,
        color: '#94a3b8',
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    input: {
        flex: 1,
        marginLeft: 12,
        color: '#0f172a',
        fontSize: 16,
    },
    signupButton: {
        backgroundColor: '#0d9488',
        borderRadius: 16,
        paddingVertical: 18,
        marginTop: 8,
        marginBottom: 16,
    },
    signupButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 17,
        fontWeight: 'bold',
    },
    signinContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signinText: {
        color: '#64748b',
        fontSize: 15,
    },
    signinLink: {
        color: '#0d9488',
        fontWeight: '600',
        fontSize: 15,
    },
});
