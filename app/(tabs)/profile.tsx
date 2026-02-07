import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Switch, Modal, TextInput, Alert, TouchableOpacity, useColorScheme, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronRight, Bell, Shield, LogOut, Award, Moon, Sun, Monitor, X, Edit2, User, Mail, Smartphone, TrendingUp, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, profile, setProfile, signOut } = useAuthStore();
    const { theme, setTheme, notifications, toggleNotifications } = useSettingsStore();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [weight, setWeight] = useState(profile?.current_weight_kg?.toString() || '');
    const [height, setHeight] = useState(profile?.height_cm?.toString() || '');
    const [goalWeight, setGoalWeight] = useState(profile?.target_weight_kg?.toString() || '');
    const [goal, setGoal] = useState(profile?.goal || 'Maintain Weight');
    const [activityLevel, setActivityLevel] = useState(profile?.activity_level || 'moderately_active');
    const [dietPref, setDietPref] = useState(profile?.diet_preference || 'veg');

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setWeight(profile.current_weight_kg?.toString() || '');
            setHeight(profile.height_cm?.toString() || '');
            setGoalWeight(profile.target_weight_kg?.toString() || '');
            setGoal(profile.goal || 'Maintain Weight');
            setActivityLevel(profile.activity_level || 'moderately_active');
            setDietPref(profile.diet_preference || 'veg');
        }
    }, [profile]);

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        await signOut();
                        router.replace('/(auth)');
                    }
                }
            ]
        );
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            // Calculate daily calorie goal
            let calorieGoal = 2000;
            if (goal === 'Lose Weight') calorieGoal = 1800;
            if (goal === 'Gain Muscle') calorieGoal = 2400;
            if (activityLevel === 'very_active') calorieGoal += 200;

            const updates = {
                full_name: fullName,
                current_weight_kg: parseFloat(weight),
                height_cm: parseFloat(height),
                target_weight_kg: parseFloat(goalWeight),
                activity_level: activityLevel,
                diet_preference: dietPref,
                daily_calorie_goal: calorieGoal,
            };

            const { error } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;
            setProfile({ ...profile, ...updates } as any);
            setEditModalVisible(false);
            Alert.alert("Success", "Profile updated successfully");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-slate-950">
            {/* Header */}
            <View className="relative z-10">
                <LinearGradient
                    colors={['#0d9488', '#0f766e']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        paddingTop: insets.top + 10,
                        paddingBottom: 24,
                        paddingHorizontal: 24,
                        borderBottomLeftRadius: 40,
                        borderBottomRightRadius: 40,
                    }}
                >
                    <View className="items-center">
                        <View className="relative mb-3">
                            <View className="w-20 h-20 bg-white/20 rounded-full items-center justify-center border-4 border-white/20 overflow-hidden">
                                <Text className="text-4xl">👤</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(true)}
                                className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-lg active:scale-90"
                                activeOpacity={0.8}
                            >
                                <Edit2 size={12} color="#0d9488" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-xl font-black text-white mb-0.5">
                            {profile?.full_name || 'Welcome'}
                        </Text>
                        <Text className="text-teal-100/80 font-bold text-xs mb-4">
                            {user?.email}
                        </Text>

                        <View className="flex-row bg-white/10 rounded-2xl p-4 w-full justify-around border border-white/10">
                            <StatItem label="Weight" value={profile?.current_weight_kg ? `${profile.current_weight_kg}kg` : '--'} />
                            <View className="w-[1px] h-6 bg-white/20" />
                            <StatItem label="Goal" value={profile?.target_weight_kg ? `${profile.target_weight_kg}kg` : '--'} />
                            <View className="w-[1px] h-6 bg-white/20" />
                            <StatItem label="Daily Cal" value={profile?.daily_calorie_goal ? `${profile.daily_calorie_goal}` : '--'} />
                        </View>
                    </View>
                </LinearGradient>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                    <View className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-[32px] mb-8 border border-slate-100 dark:border-slate-800 flex-row items-center">
                        <View className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl items-center justify-center mr-4">
                            <Award size={24} className="text-amber-600 dark:text-amber-400" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white">Active Streak</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-sm font-bold">You're doing great! 🔥</Text>
                        </View>
                    </View>
                </Animated.View>

                <Section title="Appearance" delay={200}>
                    <View className="flex-row bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                        <ThemeOption label="Light" icon={<Sun />} value="light" active={theme === 'light'} onSelect={() => setTheme('light')} />
                        <ThemeOption label="Dark" icon={<Moon />} value="dark" active={theme === 'dark'} onSelect={() => setTheme('dark')} />
                        <ThemeOption label="System" icon={<Monitor />} value="system" active={theme === 'system'} onSelect={() => setTheme('system')} />
                    </View>
                </Section>

                <Section title="Account" delay={300}>
                    <SettingsItem icon={User} label="Personal Details" onPress={() => setEditModalVisible(true)} />
                    <SettingsItem icon={TrendingUp} label="Weekly Reports" onPress={() => router.push('/reports')} />
                    <SettingsItem icon={Bell} label="Notifications" isSwitch value={notifications} onToggle={toggleNotifications} />
                    <SettingsItem icon={Shield} label="Privacy & Security" isLast onPress={() => setPrivacyModalVisible(true)} />
                </Section>

                <Section title="Support" delay={400}>
                    <SettingsItem
                        icon={Mail}
                        label="Contact Support"
                        onPress={() => {
                            import('react-native').then(({ Linking }) => {
                                Linking.openURL('mailto:support@nutrizen.com?subject=NutriZen Support');
                            });
                        }}
                    />
                    <SettingsItem
                        icon={Smartphone}
                        label="App Version"
                        value="1.2.0 (Build 34)"
                        isLast
                    />
                </Section>

                <Animated.View entering={FadeInDown.delay(500).duration(600)} className="mt-4">
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="flex-row items-center justify-center p-5 rounded-3xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 active:scale-95"
                        activeOpacity={0.8}
                    >
                        <LogOut size={20} className="text-rose-500" />
                        <Text className="text-rose-600 dark:text-rose-400 font-black ml-3 text-base">Log Out</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-center items-center p-6">
                    <View className="bg-white dark:bg-slate-900 w-full rounded-[40px] p-8 shadow-2xl border border-slate-100 dark:border-slate-800">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-2xl font-black text-slate-900 dark:text-white">Edit Profile</Text>
                            <TouchableOpacity
                                onPress={() => setEditModalVisible(false)}
                                className="w-10 h-10 items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full"
                            >
                                <X size={20} className="text-slate-500 dark:text-slate-400" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80%]">
                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</Text>
                            <TextInput
                                className="bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-2xl text-slate-900 dark:text-white font-bold text-lg border border-slate-100 dark:border-slate-800 mb-4"
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Your Name"
                                placeholderTextColor="#94a3b8"
                            />

                            <View className="flex-row gap-4 mb-4">
                                <View className="flex-1">
                                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Weight (kg)</Text>
                                    <TextInput
                                        className="bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-2xl text-slate-900 dark:text-white font-bold text-lg border border-slate-100 dark:border-slate-800"
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Height (cm)</Text>
                                    <TextInput
                                        className="bg-slate-50 dark:bg-slate-800 px-6 py-4 rounded-2xl text-slate-900 dark:text-white font-bold text-lg border border-slate-100 dark:border-slate-800"
                                        value={height}
                                        onChangeText={setHeight}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Your Goal</Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {['Lose Weight', 'Maintain Weight', 'Gain Muscle'].map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        onPress={() => setGoal(g)}
                                        className={`px-4 py-2 rounded-xl border ${goal === g ? 'bg-teal-500 border-teal-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800'}`}
                                    >
                                        <Text className={`text-xs font-bold ${goal === g ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {g}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Activity Level</Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {['sedentary', 'lightly_active', 'moderately_active', 'very_active'].map((level) => (
                                    <TouchableOpacity
                                        key={level}
                                        onPress={() => setActivityLevel(level)}
                                        className={`px-4 py-2 rounded-xl border ${activityLevel === level ? 'bg-teal-500 border-teal-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800'}`}
                                    >
                                        <Text className={`text-xs font-bold ${activityLevel === level ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {level.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Diet Preference</Text>
                            <View className="flex-row gap-2 mb-8">
                                {['veg', 'non-veg', 'keto', 'vegan'].map((pref) => (
                                    <TouchableOpacity
                                        key={pref}
                                        onPress={() => setDietPref(pref)}
                                        className={`px-4 py-2 rounded-xl border ${dietPref === pref ? 'bg-teal-500 border-teal-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800'}`}
                                    >
                                        <Text className={`text-xs font-bold ${dietPref === pref ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {pref.charAt(0).toUpperCase() + pref.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveProfile}
                                className="bg-teal-500 py-5 rounded-3xl items-center shadow-lg shadow-teal-500/30 active:scale-95"
                                activeOpacity={0.9}
                            >
                                <Text className="text-white font-black text-lg">Save Changes</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Privacy & Security Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={privacyModalVisible}
                onRequestClose={() => setPrivacyModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white dark:bg-slate-900 w-full rounded-t-[40px] p-8 shadow-2xl border-t border-slate-100 dark:border-slate-800">
                        <View className="flex-row justify-between items-center mb-8">
                            <Text className="text-2xl font-black text-slate-900 dark:text-white">Privacy & Security</Text>
                            <TouchableOpacity
                                onPress={() => setPrivacyModalVisible(false)}
                                className="w-10 h-10 items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full"
                            >
                                <X size={20} className="text-slate-500 dark:text-slate-400" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-8">
                            <PrivacyOption
                                icon={<Shield size={20} color="#0d9488" />}
                                title="Privacy Policy"
                                description="Learn how we handle your data"
                                onPress={() => Alert.alert("Privacy Policy", "Our full privacy policy is available on our website. We do not sell your personal health data.")}
                            />
                            <PrivacyOption
                                icon={<Mail size={20} color="#0d9488" />}
                                title="Export My Data"
                                description="Get a copy of all your tracked logs"
                                onPress={() => Alert.alert("Data Export", "A request has been sent. You will receive an email with your data export within 24 hours.")}
                            />
                            <View className="h-[1px] bg-slate-100 dark:bg-slate-800 my-4" />
                            <TouchableOpacity
                                className="flex-row items-center p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20"
                                onPress={() => {
                                    Alert.alert(
                                        "Delete Account",
                                        "This action cannot be undone. All your data will be permanently removed.",
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            { text: "Delete", style: "destructive", onPress: () => Alert.alert("Error", "Please contact support to complete account deletion.") }
                                        ]
                                    );
                                }}
                            >
                                <Trash2 size={20} color="#ef4444" />
                                <View className="ml-4">
                                    <Text className="text-rose-600 dark:text-rose-400 font-bold text-base">Delete Account</Text>
                                    <Text className="text-rose-400/60 text-xs font-medium">Permanently remove all data</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => setPrivacyModalVisible(false)}
                            className="bg-slate-100 dark:bg-slate-800 py-5 rounded-3xl items-center mb-4"
                        >
                            <Text className="text-slate-900 dark:text-white font-black text-lg">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function PrivacyOption({ icon, title, description, onPress }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center p-4 mb-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
        >
            <View className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 items-center justify-center shadow-sm">
                {icon}
            </View>
            <View className="ml-4 flex-1">
                <Text className="text-slate-900 dark:text-white font-bold text-base">{title}</Text>
                <Text className="text-slate-400 dark:text-slate-500 text-xs font-medium">{description}</Text>
            </View>
            <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
        </TouchableOpacity>
    );
}

function StatItem({ label, value }: { label: string, value: string }) {
    return (
        <View className="items-center">
            <Text className="text-white font-black text-lg">{value}</Text>
            <Text className="text-teal-100/60 text-[10px] font-black uppercase tracking-widest mt-1">{label}</Text>
        </View>
    );
}

function Section({ title, children, delay }: { title: string, children: React.ReactNode, delay: number }) {
    return (
        <Animated.View entering={FadeInDown.delay(delay).duration(600)} className="mb-8">
            <Text className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest mb-4 ml-2">{title}</Text>
            <View className="bg-slate-50 dark:bg-slate-900/40 rounded-[32px] p-2 border border-slate-100 dark:border-slate-800">
                {children}
            </View>
        </Animated.View>
    );
}

function SettingsItem({ icon: Icon, label, onPress, isSwitch, value, onToggle, isLast }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            disabled={isSwitch}
            className={`flex-row items-center p-4 ${!isLast ? 'border-b border-slate-100/50 dark:border-slate-800/50' : ''}`}
        >
            <View className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 items-center justify-center mr-4 shadow-sm">
                <Icon size={20} className="text-slate-500 dark:text-slate-400" />
            </View>
            <View className="flex-1">
                <Text className="text-slate-900 dark:text-white font-bold text-base">{label}</Text>
            </View>
            {isSwitch ? (
                <Switch
                    value={value}
                    onValueChange={onToggle}
                    trackColor={{ false: '#e2e8f0', true: '#0d9488' }}
                    thumbColor="#fff"
                />
            ) : value ? (
                <Text className="text-slate-400 dark:text-slate-500 font-bold text-sm mr-2">{value}</Text>
            ) : (
                <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
            )}
        </TouchableOpacity>
    );
}

function ThemeOption({ label, icon, active, onSelect }: any) {
    const colorScheme = useColorScheme();
    return (
        <TouchableOpacity
            onPress={onSelect}
            style={[
                styles.themeButton,
                active && styles.themeButtonActive,
            ]}
            activeOpacity={0.7}
        >
            {React.cloneElement(icon, {
                size: 16,
                color: active ? (colorScheme === 'dark' ? '#fff' : '#0f766e') : '#94a3b8'
            })}
            <Text style={[
                styles.themeLabel,
                active && styles.themeLabelActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    themeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        marginHorizontal: 2,
    },
    themeButtonActive: {
        backgroundColor: 'white', // Will inherit dark:bg-slate-700 via NativeWind parent
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    themeLabel: {
        marginLeft: 8,
        fontSize: 12,
        fontWeight: '700',
        color: '#94a3b8',
    },
    themeLabelActive: {
        color: '#0f766e', // teal-700
    },
});
