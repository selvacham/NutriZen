import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOutUp, Layout, ZoomIn } from 'react-native-reanimated';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useNutritionStore, FoodLog } from '../../src/store/useNutritionStore';
import { useActivityStore } from '../../src/store/useActivityStore';
import { useWaterStore } from '../../src/store/useWaterStore';
import { useSleepStore } from '../../src/store/useSleepStore';
import { FoodSearchModal } from '../../src/components/modals/FoodSearchModal';
import { DateFilter } from '../../src/components/DateFilter';
import { Food } from '../../src/utils/foodDatabase';

export default function NutritionScreen() {
    const { user } = useAuthStore();
    const { dateLogs, selectedDate, setSelectedDate, fetchDateLogs, addLog, deleteLog, getTotalsForDate } = useNutritionStore();
    const [showFoodModal, setShowFoodModal] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchDateLogs(user.id, selectedDate);
        }
    }, [user, selectedDate]);

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
                }, user.id);
            } catch (error: any) {
                console.error('Error adding food:', error);
                Alert.alert('Error', 'Failed to add food. Please check your database setup.');
            }
        }
    };

    const handleDeleteFood = (id: string) => {
        Alert.alert(
            "Delete Log",
            "Are you sure you want to remove this meal?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteLog(id) }
            ]
        );
    };

    const totals = getTotalsForDate();
    const mealsByType = {
        breakfast: dateLogs.filter((l: FoodLog) => l.meal_type === 'breakfast'),
        lunch: dateLogs.filter((l: FoodLog) => l.meal_type === 'lunch'),
        dinner: dateLogs.filter((l: FoodLog) => l.meal_type === 'dinner'),
        snack: dateLogs.filter((l: FoodLog) => l.meal_type === 'snack'),
    };

    return (
        <View className="flex-1 bg-white dark:bg-slate-950">
            <SafeAreaView className="flex-1" edges={['top']}>
                <Animated.ScrollView
                    className="flex-1 px-5"
                    showsVerticalScrollIndicator={false}
                    entering={FadeInDown.duration(500)}
                >
                    <View className="py-6">
                        <Text className="text-3xl font-bold text-slate-900 dark:text-white">Nutrition</Text>
                        <Text className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Track your meals & macros</Text>
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

                    {/* Today's Summary */}
                    <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                        <View className="bg-slate-50 dark:bg-slate-900/50 rounded-[32px] p-6 mb-8 border border-slate-100 dark:border-slate-800">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white mb-6">Today's Summary</Text>
                            <View className="flex-row justify-between">
                                <MacroCard label="Calories" value={totals.calories} unit="kcal" color="text-teal-600 dark:text-teal-400" />
                                <MacroCard label="Protein" value={Math.round(totals.protein)} unit="g" color="text-amber-600 dark:text-amber-400" />
                                <MacroCard label="Carbs" value={Math.round(totals.carbs)} unit="g" color="text-blue-600 dark:text-blue-400" />
                                <MacroCard label="Fats" value={Math.round(totals.fats)} unit="g" color="text-rose-600 dark:text-rose-400" />
                            </View>
                        </View>
                    </Animated.View>

                    {/* Meals by Type */}
                    <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                        <MealSection title="Breakfast" meals={mealsByType.breakfast} onDelete={handleDeleteFood} />
                        <MealSection title="Lunch" meals={mealsByType.lunch} onDelete={handleDeleteFood} />
                        <MealSection title="Dinner" meals={mealsByType.dinner} onDelete={handleDeleteFood} />
                        <MealSection title="Snacks" meals={mealsByType.snack} onDelete={handleDeleteFood} />
                    </Animated.View>

                    {dateLogs.length === 0 && (
                        <Animated.View
                            entering={FadeInDown.delay(300).duration(500)}
                            className="items-center py-16"
                        >
                            <View className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full items-center justify-center mb-6">
                                <Text className="text-5xl">🍽️</Text>
                            </View>
                            <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2">No meals logged yet</Text>
                            <Text className="text-slate-500 dark:text-slate-400 text-center font-medium max-w-[250px]">
                                Your nutrition data will appear here. Start by adding your first meal!
                            </Text>
                        </Animated.View>
                    )}

                    <View className="h-24" />
                </Animated.ScrollView>
            </SafeAreaView>

            {/* Add Food FAB */}
            <TouchableOpacity
                onPress={() => setShowFoodModal(true)}
                className="absolute bottom-40 right-5 w-16 h-16 bg-teal-500 rounded-full items-center justify-center shadow-xl shadow-teal-500/40 active:scale-95"
                activeOpacity={0.9}
            >
                <Plus color="white" size={32} />
            </TouchableOpacity>

            <FoodSearchModal
                visible={showFoodModal}
                onClose={() => setShowFoodModal(false)}
                onSelectFood={handleAddFood}
            />
        </View>
    );
}

function MacroCard({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
    return (
        <Animated.View
            entering={ZoomIn.delay(100).springify()}
            className="items-center flex-1"
        >
            <Text className={`text-2xl font-black ${color}`}>{value}</Text>
            <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{unit}</Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold">{label}</Text>
        </Animated.View>
    );
}

function MealSection({ title, meals, onDelete }: { title: string; meals: FoodLog[]; onDelete: (id: string) => void }) {
    if (meals.length === 0) return null;

    const totalCals = meals.reduce((sum, m) => sum + m.calories, 0);

    return (
        <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className="text-xl font-bold text-slate-900 dark:text-white">{title}</Text>
                <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                    <Text className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{totalCals} kcal</Text>
                </View>
            </View>
            {meals.map((meal, index) => (
                <Animated.View
                    key={meal.id}
                    entering={FadeInDown.delay(index * 100).springify()}
                    exiting={FadeOutUp}
                >
                    <View className="bg-white dark:bg-slate-900 rounded-3xl p-5 mb-3 flex-row items-center border border-slate-100 dark:border-slate-800 shadow-sm">
                        <View className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl items-center justify-center mr-4">
                            <Text className="text-2xl">🥗</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                                {meal.food_name}
                            </Text>
                            <View className="flex-row gap-3 mt-1">
                                <Text className="text-[10px] font-bold text-slate-400 uppercase">P: {Math.round(meal.protein_g)}g</Text>
                                <Text className="text-[10px] font-bold text-slate-400 uppercase">C: {Math.round(meal.carbs_g)}g</Text>
                                <Text className="text-[10px] font-bold text-slate-400 uppercase">F: {Math.round(meal.fats_g)}g</Text>
                            </View>
                        </View>
                        <View className="items-end mr-4">
                            <Text className="text-teal-600 dark:text-teal-400 font-black text-lg">{meal.calories}</Text>
                            <Text className="text-[8px] font-black text-slate-400 uppercase">kcal</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => onDelete(meal.id)}
                            className="w-10 h-10 bg-rose-50 dark:bg-rose-900/20 rounded-xl items-center justify-center active:scale-95"
                        >
                            <Trash2 size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            ))}
        </View>
    );
}
