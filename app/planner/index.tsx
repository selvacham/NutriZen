import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Sparkles, Clock, Utensils, Zap, Plus, RefreshCw } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useNutritionStore } from '../../src/store/useNutritionStore';
import { generateMealSuggestion } from '../../src/services/visionService';

export default function MealPlannerScreen() {
    const router = useRouter();
    const { profile, user } = useAuthStore();
    const { getTotalsForDate, addLog } = useNutritionStore();
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState<any>(null);

    const totals = getTotalsForDate();
    const calorieGoal = profile?.daily_calorie_goal || 2000;
    const remaining = {
        calories: Math.max(0, calorieGoal - totals.calories),
        protein: Math.max(0, (profile?.target_weight_kg || 70) * 1.8 - totals.protein), // Simple protein goal estimation
        carbs: Math.max(0, (calorieGoal * 0.45 / 4) - totals.carbs),
        fats: Math.max(0, (calorieGoal * 0.25 / 9) - totals.fats),
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const result = await generateMealSuggestion(remaining, profile?.goal || 'Maintain Weight');
            if (result) {
                setSuggestion(result);
            } else {
                Alert.alert('Try Again', 'We couldn\'t generate a suggestion right now.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while planning your meal.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogMeal = async () => {
        if (!user || !suggestion) return;

        try {
            await addLog({
                food_name: suggestion.meal_name,
                calories: suggestion.macros.calories,
                protein_g: suggestion.macros.protein,
                carbs_g: suggestion.macros.carbs,
                fats_g: suggestion.macros.fats,
                meal_type: 'lunch', // Default, user can adjust in log if we had a picker
                food_group: 'Snacks' // Generic
            }, user.id);

            Alert.alert('Success', 'Meal added to your daily log!');
            router.back();
        } catch (error) {
            Alert.alert('Error', 'Failed to log meal.');
        }
    };

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            <LinearGradient
                colors={['#6366f1', '#4f46e5', '#3730a3']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%' }}
            />

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="flex-row justify-between items-center px-6 py-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center bg-white/20 rounded-full"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-black text-xl">AI Meal Planner</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                    {/* Budget Card */}
                    <Animated.View entering={FadeInDown.duration(600)} className="bg-white/10 border border-white/20 p-5 rounded-[32px] mb-8">
                        <Text className="text-indigo-100 font-bold uppercase tracking-widest text-[10px] mb-2 text-center">Remaining Macro Budget</Text>
                        <View className="flex-row justify-around">
                            <View className="items-center">
                                <Text className="text-white font-black text-xl">{Math.round(remaining.calories)}</Text>
                                <Text className="text-indigo-200 text-[8px] font-bold uppercase">Kcal</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-white font-black text-xl">{Math.round(remaining.protein)}g</Text>
                                <Text className="text-indigo-200 text-[8px] font-bold uppercase">Protein</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-white font-black text-xl">{Math.round(remaining.carbs)}g</Text>
                                <Text className="text-indigo-200 text-[8px] font-bold uppercase">Carbs</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Generator Section */}
                    {!suggestion && !loading && (
                        <Animated.View entering={FadeInUp.delay(200)} className="items-center py-10">
                            <View className="w-24 h-24 bg-indigo-500/20 rounded-full items-center justify-center mb-6">
                                <Sparkles size={48} color="#818cf8" />
                            </View>
                            <Text className="text-slate-900 dark:text-white font-black text-2xl text-center mb-2">Need Inspiration?</Text>
                            <Text className="text-slate-500 text-center mb-8 px-8">Let the AI suggest a perfect meal based on your remaining goals.</Text>
                            <TouchableOpacity
                                onPress={handleGenerate}
                                className="bg-indigo-600 px-10 py-5 rounded-[24px] flex-row items-center gap-2 shadow-lg shadow-indigo-600/30"
                            >
                                <Sparkles size={20} color="white" />
                                <Text className="text-white font-black text-lg">Plan My Meal</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {loading && (
                        <View className="items-center py-20">
                            <ActivityIndicator size="large" color="#4f46e5" />
                            <Text className="text-slate-500 font-bold mt-4">Consulting the AI Chef...</Text>
                        </View>
                    )}

                    {suggestion && !loading && (
                        <Animated.View entering={FadeInDown.duration(800)} className="mb-10">
                            <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-800">
                                <Text className="text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest mb-2">Suggested Meal</Text>
                                <Text className="text-slate-900 dark:text-white font-black text-2xl mb-2">{suggestion.meal_name}</Text>
                                <Text className="text-slate-500 dark:text-slate-400 mb-6">{suggestion.description}</Text>

                                <View className="flex-row gap-4 mb-8">
                                    <View className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl items-center">
                                        <Clock size={16} color="#6366f1" className="mb-1" />
                                        <Text className="text-slate-900 dark:text-white font-black">{suggestion.prep_time}</Text>
                                        <Text className="text-slate-400 text-[8px] font-bold uppercase">Prep</Text>
                                    </View>
                                    <View className="flex-1 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl items-center">
                                        <Zap size={16} color="#f59e0b" className="mb-1" />
                                        <Text className="text-slate-900 dark:text-white font-black">{suggestion.macros.calories}</Text>
                                        <Text className="text-slate-400 text-[8px] font-bold uppercase">Kcal</Text>
                                    </View>
                                </View>

                                <Text className="text-slate-900 dark:text-white font-black text-lg mb-4">Ingredients</Text>
                                {suggestion.ingredients.map((ing: string, i: number) => (
                                    <View key={i} className="flex-row items-center gap-3 mb-2">
                                        <View className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                        <Text className="text-slate-600 dark:text-slate-400">{ing}</Text>
                                    </View>
                                ))}

                                <TouchableOpacity
                                    onPress={handleLogMeal}
                                    className="bg-teal-500 p-5 rounded-[24px] flex-row items-center justify-center gap-2 mt-8 shadow-lg shadow-teal-500/20"
                                >
                                    <Plus size={20} color="white" />
                                    <Text className="text-white font-black text-lg">Log this Meal</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleGenerate}
                                    className="flex-row items-center justify-center gap-2 py-4"
                                >
                                    <RefreshCw size={16} color="#94a3b8" />
                                    <Text className="text-slate-400 font-bold">Try another suggestion</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
