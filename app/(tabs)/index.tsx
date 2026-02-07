import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Calendar, Settings, TrendingUp, Droplet, MessageCircle, Camera, LogOut, ShoppingBasket, Scale } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, interpolate, Easing } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useNutritionStore } from '../../src/store/useNutritionStore';
import { useActivityStore } from '../../src/store/useActivityStore';
import { useWaterStore } from '../../src/store/useWaterStore';
import { useGamificationStore } from '../../src/store/useGamificationStore';
import { useSleepStore } from '../../src/store/useSleepStore';
import { useWeightStore } from '../../src/store/useWeightStore';
import { FoodSearchModal } from '../../src/components/modals/FoodSearchModal';
import { MealScannerModal } from '../../src/components/modals/MealScannerModal';
import { DateFilter } from '../../src/components/DateFilter';
import { GroceryListModal } from '../../src/components/modals/GroceryListModal';
import { SmartHydration } from '../../src/components/SmartHydration';
import { Food } from '../../src/utils/foodDatabase';

export default function DashboardScreen() {
    const { user, profile } = useAuthStore();
    const router = useRouter();
    const { dateLogs: foodLogs, selectedDate, setSelectedDate, fetchDateLogs: fetchFoodLogs, getTotalsForDate, addLog } = useNutritionStore();
    const { steps, dateLogs: activityLogs, fetchDateLogs: fetchActivityLogs, getCaloriesBurnedForDate } = useActivityStore();
    const { dateLogs: waterLogs, fetchDateLogs: fetchWaterLogs, getTotalForDate: getWaterTotal, addLog: addWaterLog } = useWaterStore();
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [showGroceryList, setShowGroceryList] = useState(false);

    const { logs: weightLogs, fetchLogs: fetchWeightLogs, convertWeight, unit: weightUnit } = useWeightStore();

    useEffect(() => {
        if (user?.id) {
            fetchFoodLogs(user.id, selectedDate);
            fetchActivityLogs(user.id, selectedDate);
            fetchWaterLogs(user.id, selectedDate);
            fetchWeightLogs(user.id);
        }
    }, [user, selectedDate]);

    const totals = getTotalsForDate();
    const caloriesBurned = getCaloriesBurnedForDate();
    const dailyGoal = profile?.daily_calorie_goal || 2000;
    const caloriesRemaining = dailyGoal - totals.calories + caloriesBurned;

    const handleAddFood = async (food: Food) => {
        if (user?.id) {
            try {
                await addLog({
                    food_name: food.name,
                    calories: food.calories,
                    protein_g: food.protein,
                    carbs_g: food.carbs,
                    fats_g: food.fats,
                    meal_type: food.category,
                    food_group: food.foodGroup,
                }, user.id);
            } catch (error: any) {
                console.error('Error adding food:', error);
                Alert.alert('Error', 'Failed to add food. Please check your database setup.');
            }
        }
    };


    const userName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'User';
    const waterGoal = 3000; // 3 liters in ml
    const waterConsumed = getWaterTotal(); // in ml
    const stepsGoal = 10000;
    const proteinGoal = profile?.daily_calorie_goal ? Math.round(profile.daily_calorie_goal * 0.3 / 4) : 120;

    // AI Insights based on real data
    const getAIInsight = () => {
        const mealCount = foodLogs.length;
        const waterProgress = (waterConsumed / waterGoal) * 100;
        const calorieProgress = (totals.calories / dailyGoal) * 100;
        const proteinProgress = (totals.protein / proteinGoal) * 100;

        if (mealCount === 0) {
            return {
                text: "Start your day right! Log your first meal to begin tracking your nutrition journey. 🌅",
                type: 'info'
            };
        }

        if (waterProgress < 30) {
            return {
                text: `Hydration alert! You've only had ${(waterConsumed / 1000).toFixed(1)}L of water today. Drink up! 💧`,
                type: 'warning'
            };
        }

        if (proteinProgress > 90) {
            return {
                text: `Protein champion! You've hit ${Math.round(totals.protein)}g of protein today. Keep it up! 💪`,
                type: 'success'
            };
        }

        if (calorieProgress > 80 && calorieProgress < 110) {
            return {
                text: `Perfect balance! You're right on track with your calorie goal. Great job! 🎯`,
                type: 'success'
            };
        }

        if (activityLogs.length > 0) {
            return {
                text: `Active day! You've burned ${caloriesBurned} calories through ${activityLogs.length} workout${activityLogs.length > 1 ? 's' : ''}. 🔥`,
                type: 'info'
            };
        }

        return {
            text: `You've logged ${mealCount} meal${mealCount > 1 ? 's' : ''} today. Keep tracking to reach your goals! 📊`,
            type: 'info'
        };
    };

    const insight = getAIInsight();
    const timeOfDay = new Date().getHours();
    const greeting = timeOfDay < 12 ? 'Morning' : timeOfDay < 18 ? 'Afternoon' : 'Evening';

    return (
        <View className="flex-1 bg-white dark:bg-slate-950">
            <SafeAreaView className="flex-1" edges={['top']}>
                <Animated.ScrollView
                    className="flex-1 px-5"
                    showsVerticalScrollIndicator={false}
                    entering={FadeInDown.duration(500)}
                >
                    {/* Header */}
                    <View className="py-6 flex-row justify-between items-center">
                        <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                                <Text className="text-lg font-medium text-slate-500 dark:text-slate-400">Good {greeting}, {userName}!</Text>
                                {useGamificationStore.getState().streak > 0 && (
                                    <View className="ml-3 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full flex-row items-center border border-orange-100 dark:border-orange-900/10">
                                        <Text className="text-[12px] mr-1">🔥</Text>
                                        <Text className="text-[12px] text-orange-600 dark:text-orange-400 font-black">{useGamificationStore.getState().streak} Day Streak</Text>
                                    </View>
                                )}
                            </View>
                            <Text className="text-3xl font-bold text-slate-900 dark:text-white">
                                {totals.calories > 0 ? "You're doing great!" : "Ready to start?"}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert(
                                    "Log Out",
                                    "Are you sure you want to log out?",
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        {
                                            text: "Log Out",
                                            style: "destructive",
                                            onPress: async () => {
                                                const { signOut } = useAuthStore.getState();
                                                await signOut();
                                                router.replace('/(auth)');
                                            }
                                        }
                                    ]
                                );
                            }}
                            className="w-12 h-12 bg-rose-50 dark:bg-rose-950 rounded-2xl items-center justify-center border border-rose-100 dark:border-rose-900 shadow-sm"
                        >
                            <LogOut size={20} color="#f43f5e" strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    <DateFilter
                        selectedDate={selectedDate}
                        onDateChange={(date) => {
                            setSelectedDate(date);
                            useActivityStore.getState().setSelectedDate(date);
                            useWaterStore.getState().setSelectedDate(date);
                            useSleepStore.getState().setSelectedDate(date);
                        }}
                    />

                    {/* AI Insights Card */}
                    <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/ai-coach')}
                            activeOpacity={0.9}
                            className="mb-8 rounded-[32px] overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex-row"
                        >
                            {/* Colorful Accent Bar */}
                            <View className="w-1.5 bg-teal-500" />

                            <View className="flex-1 p-5">
                                <View className="flex-row items-center mb-2.5">
                                    <View className="w-7 h-7 bg-teal-50 dark:bg-teal-900/30 rounded-lg items-center justify-center mr-2">
                                        <MessageCircle size={14} color="#0d9488" />
                                    </View>
                                    <Text className="flex-1 text-slate-900 dark:text-white font-bold text-base">AI Coach Insights</Text>
                                    <View className="bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/10">
                                        <Text className="text-[10px] text-rose-500 font-black uppercase tracking-widest">Live</Text>
                                    </View>
                                </View>
                                <Text className="text-slate-600 dark:text-slate-400 text-sm leading-5 font-bold">
                                    {insight.text}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Main Calorie Card */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                        <View className="bg-white dark:bg-slate-900 rounded-[40px] p-8 mb-8 shadow-sm border border-slate-100 dark:border-slate-800 items-center">
                            <View className="w-56 h-56 rounded-full border-[12px] border-teal-50 dark:border-teal-900/30 items-center justify-center relative">
                                <View className="items-center">
                                    <Text className="text-5xl font-black text-slate-900 dark:text-white">
                                        {Math.max(0, caloriesRemaining).toLocaleString()}
                                    </Text>
                                    <Text className="text-base text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1">kcal left</Text>
                                </View>
                            </View>

                            <View className="flex-row mt-8 w-full justify-around">
                                <View className="items-center">
                                    <Text className="text-xl font-bold text-slate-900 dark:text-white">{totals.calories}</Text>
                                    <Text className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Eaten</Text>
                                </View>
                                <View className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />
                                <View className="items-center">
                                    <Text className="text-xl font-bold text-slate-900 dark:text-white">{caloriesBurned}</Text>
                                    <Text className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Burned</Text>
                                </View>
                                <View className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />
                                <View className="items-center">
                                    <Text className="text-xl font-bold text-slate-900 dark:text-white">{dailyGoal}</Text>
                                    <Text className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">Goal</Text>
                                </View>
                                <View className="w-[1px] h-8 bg-slate-100 dark:bg-slate-800" />
                                <TouchableOpacity
                                    onPress={() => setShowGroceryList(true)}
                                    className="items-center"
                                >
                                    <View className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-full items-center justify-center mb-1">
                                        <ShoppingBasket size={20} color="#f59e0b" />
                                    </View>
                                    <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">List</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                    {/* Quick Actions */}
                    <Animated.View entering={FadeInDown.delay(250).duration(500)}>
                        <View className="flex-row gap-4 mb-8">
                            <TouchableOpacity
                                onPress={() => setShowFoodModal(true)}
                                className="flex-1 bg-white dark:bg-slate-900 rounded-3xl p-5 flex-row items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm active:scale-95"
                                activeOpacity={0.8}
                            >
                                <Plus size={20} color="#0d9488" className="mr-2" />
                                <Text className="text-slate-900 dark:text-white font-bold">Add Food</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setShowScannerModal(true)}
                                className="flex-1 bg-indigo-600 rounded-3xl p-5 flex-row items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-95"
                                activeOpacity={0.8}
                            >
                                <Camera size={20} color="white" className="mr-2" />
                                <Text className="text-white font-bold">Scan Meal</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* Daily Targets */}
                    <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mb-8">
                        <Text className="text-xl font-bold text-slate-900 dark:text-white mb-4 ml-1">Daily Targets</Text>

                        {/* Interactive Hydration Widget */}
                        <SmartHydration />

                        <View className="bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                            {/* Weight Card */}
                            <TouchableOpacity
                                onPress={() => router.push('/weight')}
                                className="mb-6 flex-row items-center justify-between"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-teal-50 dark:bg-teal-900/30 rounded-xl items-center justify-center mr-3">
                                        <Scale size={20} color="#0d9488" />
                                    </View>
                                    <View>
                                        <Text className="text-base font-bold text-slate-800 dark:text-slate-200">Weight</Text>
                                        <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Track progress</Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="text-lg font-black text-slate-900 dark:text-white">
                                        {weightLogs.length > 0 ? convertWeight(weightLogs[0].weight) : (profile?.current_weight_kg || '--')} {weightUnit}
                                    </Text>
                                    <Text className="text-[10px] text-teal-600 font-bold">Updated {weightLogs.length > 0 ? 'Recently' : 'from Profile'}</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Steps */}
                            <View className="mb-6 text-slate-400">
                                <View className="flex-row justify-between items-center mb-2.5">
                                    <Text className="text-base font-bold text-slate-800 dark:text-slate-200">Steps</Text>
                                    <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        {steps.toLocaleString()} / {stepsGoal.toLocaleString()}
                                    </Text>
                                </View>
                                <View className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <View
                                        className="h-full bg-teal-500 rounded-full"
                                        style={{ width: `${Math.min(100, (steps / stepsGoal) * 100)}%` }}
                                    />
                                </View>
                            </View>

                            {/* Protein */}
                            <View>
                                <View className="flex-row justify-between items-center mb-2.5">
                                    <Text className="text-base font-bold text-slate-800 dark:text-slate-200">Protein</Text>
                                    <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        {Math.round(totals.protein)}g / {proteinGoal}g
                                    </Text>
                                </View>
                                <View className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <View
                                        className="h-full bg-amber-500 rounded-full"
                                        style={{ width: `${Math.min(100, (totals.protein / proteinGoal) * 100)}%` }}
                                    />
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Recent History */}
                    {foodLogs.length > 0 && (
                        <Animated.View entering={FadeInDown.delay(400).duration(500)} className="mb-10">
                            <View className="flex-row justify-between items-center mb-4 ml-1">
                                <Text className="text-xl font-bold text-slate-900 dark:text-white">Recent Meals</Text>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/nutrition')}>
                                    <Text className="text-teal-600 dark:text-teal-400 font-bold text-sm">View All</Text>
                                </TouchableOpacity>
                            </View>
                            {foodLogs.slice(-3).reverse().map((log, index) => (
                                <View
                                    key={log.id || index}
                                    className="bg-white dark:bg-slate-900 rounded-3xl p-4 mb-3 flex-row items-center border border-slate-100 dark:border-slate-800 shadow-sm"
                                >
                                    <View className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl items-center justify-center mr-4">
                                        <Text className="text-xl">🥗</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 dark:text-white font-bold text-base">{log.food_name}</Text>
                                        <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">{log.meal_type}</Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-slate-900 dark:text-white font-bold text-base">{log.calories}</Text>
                                        <Text className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">kcal</Text>
                                    </View>
                                </View>
                            ))}
                        </Animated.View>
                    )}

                    <View className="h-24" />
                </Animated.ScrollView>
            </SafeAreaView>
            <MealScannerModal
                visible={showScannerModal}
                onClose={() => setShowScannerModal(false)}
            />

            <FoodSearchModal
                visible={showFoodModal}
                onClose={() => setShowFoodModal(false)}
                onSelectFood={handleAddFood}
            />

            <GroceryListModal
                visible={showGroceryList}
                onClose={() => setShowGroceryList(false)}
            />
        </View>
    );
}
