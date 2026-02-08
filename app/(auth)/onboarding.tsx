import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    TextInput,
    ScrollView,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ArrowRight, Check } from 'lucide-react-native';
import Animated, {
    FadeInRight,
    FadeOutLeft,
    FadeInDown,
    Layout
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressBar } from '../../src/components/ui/ProgressBar';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';

const { width } = Dimensions.get('window');

const STEPS = [
    {
        id: 'goal',
        title: "What's your goal?",
        subtitle: "We'll tailor your plan based on this",
        options: [
            { label: 'Lose Weight', icon: '📉' },
            { label: 'Maintain Weight', icon: '⚖️' },
            { label: 'Gain Muscle', icon: '💪' }
        ]
    },
    {
        id: 'gender',
        title: "Choose your gender",
        subtitle: "Helps us calculate your metabolism",
        options: [
            { label: 'Male', icon: '👨' },
            { label: 'Female', icon: '👩' },
            { label: 'Other', icon: '✨' }
        ]
    },
    {
        id: 'activity',
        title: "How active are you?",
        subtitle: "Be honest for better results!",
        options: [
            { label: 'Sedentary', icon: '🪑' },
            { label: 'Lightly Active', icon: '🚶' },
            { label: 'Moderately Active', icon: '🏃' },
            { label: 'Very Active', icon: '🔥' }
        ]
    },
    {
        id: 'diet',
        title: "Dietary preference?",
        subtitle: "We'll suggest meals you love",
        options: [
            { label: 'Veg', icon: '🥦' },
            { label: 'Non-Veg', icon: '🍗' },
            { label: 'Keto', icon: '🥑' },
            { label: 'Vegan', icon: '🌿' }
        ]
    },
    {
        id: 'measurements',
        title: "Your measurements",
        subtitle: "Let's get your starting point",
        type: 'measurements'
    },
    {
        id: 'water',
        title: "Daily water goal",
        subtitle: "Stay hydrated! We'll remind you",
        type: 'water'
    },
    {
        id: 'target',
        title: "Set your target",
        subtitle: "What weight are we aiming for?",
        type: 'target'
    }
];

const activityLevelMap: Record<string, string> = {
    'Sedentary': 'sedentary',
    'Lightly Active': 'lightly_active',
    'Moderately Active': 'moderately_active',
    'Very Active': 'very_active',
};

const dietPreferenceMap: Record<string, string> = {
    'Veg': 'veg',
    'Non-Veg': 'non-veg',
    'Keto': 'keto',
    'Vegan': 'vegan',
};

export default function OnboardingScreen() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState<Record<string, any>>({});
    const [weight, setWeight] = useState('74');
    const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
    const [height, setHeight] = useState('175');
    const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
    const [targetWeight, setTargetWeight] = useState('68');
    const [waterGoal, setWaterGoal] = useState('2250');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { user, saveProfile } = useAuthStore();

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            await handleComplete();
        }
    };

    const handleComplete = async () => {
        if (!user?.id) {
            Alert.alert('Error', 'Please sign in again.');
            router.replace('/(auth)/login');
            return;
        }

        console.log('[Onboarding] Starting for user:', user.id);
        setLoading(true);

        try {
            // 👇 YOUR PERFECT PAYLOAD (already matches DB)
            const profilePayload = {
                id: user.id,
                full_name: user?.user_metadata?.full_name,
                gender: selections.gender?.toLowerCase(),
                height_cm: parseFloat(height),
                current_weight_kg: parseFloat(weight),
                target_weight_kg: parseFloat(targetWeight),
                activity_level: activityLevelMap[selections.activity],
                diet_preference: dietPreferenceMap[selections.diet],
                daily_calorie_goal: 1800,
                updated_at: new Date().toISOString(),
                water_goal_ml: parseFloat(waterGoal),
                sleep_goal_hours: 8.0,  // Fixed float
                bedtime: null,
                waketime: null
            };

            console.log('[Onboarding] Payload ready:', JSON.stringify(profilePayload, null, 2));

            // 👇 USE STORE ACTION
            console.log('[Onboarding] Saving via store...');
            await saveProfile(profilePayload);

            console.log('[Onboarding] ✅ SAVED. Redirecting...');

            // Allow state to settle
            setTimeout(() => {
                router.replace('/(tabs)');
            }, 100);

        } catch (error: any) {
            console.error('[Onboarding] ERROR:', error);
            Alert.alert('Save Failed', error.message);
        } finally {
            setLoading(false);
        }
    };
    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const selectOption = (option: string) => {
        setSelections(prev => ({ ...prev, [STEPS[currentStep].id]: option }));

        // Auto-advance after selection
        setTimeout(() => {
            handleNext();
        }, 500);
    };

    const currentStepData = STEPS[currentStep];

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950 px-8">
            {/* Top Navigation */}
            <View className="py-6 flex-row items-center justify-between">
                <Text className="text-slate-400 dark:text-slate-500 font-black text-xs uppercase tracking-[3px]">
                    Step {currentStep + 1} / {STEPS.length}
                </Text>
                <TouchableOpacity
                    onPress={() => router.replace('/(tabs)')}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-900 rounded-full"
                >
                    <Text className="text-slate-500 font-bold text-xs uppercase tracking-wider">
                        Skip
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View className="mb-10">
                <ProgressBar
                    progress={(currentStep + 1) / STEPS.length}
                    color="#14b8a6"
                />
            </View>

            {/* Main Content */}
            <View className="flex-1">
                <Animated.View
                    key={currentStep}
                    entering={FadeInRight.duration(400)}
                    exiting={FadeOutLeft.duration(400)}
                    className="w-full"
                >
                    <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                        <Text className="text-4xl font-black text-slate-900 dark:text-white mb-2 leading-tight">
                            {currentStepData.title}
                        </Text>
                        <Text className="text-lg text-slate-500 dark:text-slate-400 font-bold mb-8">
                            {currentStepData.subtitle}
                        </Text>
                    </Animated.View>

                    <View className="gap-4">
                        {('options' in currentStepData && currentStepData.options) ? (
                            currentStepData.options.map((option: any, index: number) => {
                                const isSelected = selections[currentStepData.id] === option.label;
                                return (
                                    <Animated.View
                                        key={option.label}
                                        entering={FadeInDown.delay(200 + index * 100).duration(500)}
                                    >
                                        <TouchableOpacity
                                            onPress={() => selectOption(option.label)}
                                            disabled={loading}
                                            activeOpacity={0.7}
                                            className={`p-6 rounded-3xl border-2 flex-row items-center justify-between shadow-sm ${isSelected
                                                ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-900/20'
                                                : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50'
                                                }`}
                                        >
                                            <View className="flex-row items-center">
                                                <View className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl items-center justify-center mr-4 shadow-sm">
                                                    <Text className="text-2xl">{option.icon}</Text>
                                                </View>
                                                <Text className={`text-xl font-black ${isSelected
                                                    ? 'text-teal-700 dark:text-teal-400'
                                                    : 'text-slate-700 dark:text-slate-300'
                                                    }`}>
                                                    {option.label}
                                                </Text>
                                            </View>
                                            {isSelected && (
                                                <View className="w-8 h-8 bg-teal-500 rounded-full items-center justify-center">
                                                    <Check size={18} color="white" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    </Animated.View>
                                );
                            })
                        ) : currentStepData.type === 'measurements' ? (
                            <View>
                                <Text className="text-slate-400 dark:text-slate-500 font-black text-xs uppercase tracking-widest mb-3 ml-1">
                                    Current Weight
                                </Text>
                                <View className="flex-row gap-4 mb-6">
                                    <TextInput
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 py-4 rounded-2xl text-slate-900 dark:text-white font-bold text-lg border border-slate-100 dark:border-slate-800"
                                        value={weight}
                                        onChangeText={setWeight}
                                        keyboardType="numeric"
                                        placeholder="74"
                                    />
                                    <View className="flex-row bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
                                        {(['kg', 'lbs'] as const).map(u => (
                                            <TouchableOpacity
                                                key={u}
                                                onPress={() => setWeightUnit(u)}
                                                className={`px-4 justify-center rounded-xl ${weightUnit === u ? 'bg-white dark:bg-slate-800 shadow-sm' : ''
                                                    }`}
                                            >
                                                <Text className={`font-bold uppercase text-[10px] ${weightUnit === u ? 'text-teal-500' : 'text-slate-400'
                                                    }`}>
                                                    {u}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <Text className="text-slate-400 dark:text-slate-500 font-black text-xs uppercase tracking-widest mb-3 ml-1">
                                    Current Height
                                </Text>
                                <View className="flex-row gap-4 mb-8">
                                    <TextInput
                                        className="flex-1 bg-slate-50 dark:bg-slate-900 px-6 py-4 rounded-2xl text-slate-900 dark:text-white font-bold text-lg border border-slate-100 dark:border-slate-800"
                                        value={height}
                                        onChangeText={setHeight}
                                        keyboardType="numeric"
                                        placeholder="175"
                                    />
                                    <View className="flex-row bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl">
                                        {(['cm', 'ft'] as const).map(u => (
                                            <TouchableOpacity
                                                key={u}
                                                onPress={() => setHeightUnit(u)}
                                                className={`px-4 justify-center rounded-xl ${heightUnit === u ? 'bg-white dark:bg-slate-800 shadow-sm' : ''
                                                    }`}
                                            >
                                                <Text className={`font-bold uppercase text-[10px] ${heightUnit === u ? 'text-teal-500' : 'text-slate-400'
                                                    }`}>
                                                    {u}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={handleNext}
                                    className="bg-teal-500 py-5 rounded-3xl items-center shadow-lg shadow-teal-500/30"
                                >
                                    <Text className="text-white font-black text-lg">Next</Text>
                                </TouchableOpacity>
                            </View>
                        ) : currentStepData.type === 'water' ? (
                            <View>
                                <Text className="text-slate-400 dark:text-slate-500 font-black text-xs uppercase tracking-widest mb-3 ml-1">
                                    Daily Water Goal
                                </Text>
                                <TextInput
                                    className="bg-slate-50 dark:bg-slate-900 px-6 py-5 rounded-3xl text-slate-900 dark:text-white font-bold text-lg border border-slate-100 dark:border-slate-800 mb-4"
                                    value={waterGoal}
                                    onChangeText={setWaterGoal}
                                    keyboardType="numeric"
                                    placeholder="2250"
                                />
                                <Text className="text-slate-400 dark:text-slate-500 text-sm mb-6">
                                    {parseFloat(waterGoal || '0') / 1000}L • Recommended: 2-3L daily
                                </Text>
                                <TouchableOpacity
                                    onPress={handleNext}
                                    className="bg-teal-500 py-5 rounded-3xl items-center shadow-lg shadow-teal-500/30"
                                >
                                    <Text className="text-white font-black text-lg">Next</Text>
                                </TouchableOpacity>
                            </View>
                        ) : currentStepData.type === 'target' ? (
                            <View>
                                <Text className="text-slate-400 dark:text-slate-500 font-black text-xs uppercase tracking-widest mb-3 ml-1">
                                    Target Weight ({weightUnit})
                                </Text>
                                <TextInput
                                    className="bg-slate-50 dark:bg-slate-900 px-6 py-5 rounded-3xl text-slate-900 dark:text-white font-bold text-lg border border-slate-100 dark:border-slate-800 mb-8"
                                    value={targetWeight}
                                    onChangeText={setTargetWeight}
                                    keyboardType="numeric"
                                    placeholder="68"
                                />

                                <TouchableOpacity
                                    onPress={handleComplete}
                                    disabled={loading}
                                    className="bg-teal-500 py-5 rounded-3xl items-center shadow-lg shadow-teal-500/30"
                                >
                                    <Text className="text-white font-black text-lg">
                                        {loading ? 'Saving...' : 'Finish'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}
