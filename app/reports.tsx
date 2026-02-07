import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, TrendingUp, Calendar, Target, Activity, Utensils } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useNutritionStore } from '../src/store/useNutritionStore';
import { useActivityStore } from '../src/store/useActivityStore';
import { useAuthStore } from '../src/store/useAuthStore';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const { logs: foodLogs } = useNutritionStore();
    const { logs: activityLogs } = useActivityStore();

    // Aggregate data for the last 7 days
    const chartData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const data = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            const dayName = days[date.getDay()];

            const dailyFood = foodLogs.filter(log => new Date(log.logged_at).toDateString() === dateStr);
            const dailyActivity = activityLogs.filter(log => new Date(log.performed_at).toDateString() === dateStr);

            const caloriesEaten = dailyFood.reduce((sum, log) => sum + log.calories, 0);
            const caloriesBurned = dailyActivity.reduce((sum, log) => sum + log.calories_burned, 0);

            data.push({
                day: dayName,
                eaten: caloriesEaten,
                burned: caloriesBurned,
                label: dayName.charAt(0)
            });
        }
        return data;
    }, [foodLogs, activityLogs]);

    const stats = useMemo(() => {
        const totalEaten = chartData.reduce((sum, d) => sum + d.eaten, 0);
        const totalBurned = chartData.reduce((sum, d) => sum + d.burned, 0);
        const avgEaten = Math.round(totalEaten / 7);
        const avgBurned = Math.round(totalBurned / 7);

        return {
            avgEaten,
            avgBurned,
            totalWorkouts: activityLogs.filter(log => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return new Date(log.performed_at) > oneWeekAgo;
            }).length,
            consistency: 85 // Mocked for now
        };
    }, [chartData, activityLogs]);

    return (
        <View className="flex-1 bg-white dark:bg-slate-950">
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Custom Header */}
                <View className="px-6 py-4 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl mr-4 border border-slate-100 dark:border-slate-800"
                    >
                        <ChevronLeft size={24} color="#0d9488" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-black text-slate-900 dark:text-white">Health Reports</Text>
                        <Text className="text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">Weekly Insights</Text>
                    </View>
                </View>

                <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
                    {/* Live Progress Card */}
                    <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                        <View className="bg-slate-900 rounded-[40px] p-8 mb-8 shadow-2xl overflow-hidden shadow-slate-900/40">
                            <LinearGradient
                                colors={['#1e293b', '#0f172a']}
                                className="absolute inset-0"
                            />
                            <View className="flex-row justify-between items-start mb-10">
                                <View>
                                    <View className="flex-row items-center bg-teal-500/10 px-3 py-1.5 rounded-full border border-teal-500/20 mb-3 self-start">
                                        <View className="w-2 h-2 rounded-full bg-teal-500 mr-2 animate-pulse" />
                                        <Text className="text-[10px] font-black text-teal-500 uppercase tracking-tighter">Live Insights</Text>
                                    </View>
                                    <Text className="text-white font-black text-2xl">Weekly Report</Text>
                                    <Text className="text-slate-400 font-bold text-xs">Based on your activity logs</Text>
                                </View>
                                <View className="bg-slate-800 p-4 rounded-3xl">
                                    <TrendingUp size={24} color="#14b8a6" />
                                </View>
                            </View>

                            <View className="flex-row justify-between">
                                <View className="flex-1 items-center">
                                    <Text className="text-white font-black text-2xl">{stats.avgEaten}</Text>
                                    <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">Avg Intake</Text>
                                </View>
                                <View className="w-[1px] h-8 bg-slate-800 self-center" />
                                <View className="flex-1 items-center">
                                    <Text className="text-white font-black text-2xl">{stats.avgBurned}</Text>
                                    <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">Avg Burned</Text>
                                </View>
                                <View className="w-[1px] h-8 bg-slate-800 self-center" />
                                <View className="flex-1 items-center">
                                    <Text className="text-white font-black text-2xl">{stats.totalWorkouts}</Text>
                                    <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">Workouts</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Chart Section */}
                    <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mb-8">
                        <View className="flex-row justify-between items-center mb-6 ml-1">
                            <Text className="text-xl font-black text-slate-900 dark:text-white">Calorie Trends</Text>
                            <View className="flex-row items-center bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
                                <View className="w-2 h-2 rounded-full bg-teal-500 mr-2" />
                                <Text className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Intake</Text>
                            </View>
                        </View>

                        <View className="bg-white dark:bg-slate-900/40 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800">
                            <View className="flex-row items-end justify-between h-[200px] mb-4 px-2">
                                {chartData.map((item, index) => {
                                    const maxVal = Math.max(...chartData.map(d => d.eaten), 1000);
                                    const height = (item.eaten / maxVal) * 160;

                                    return (
                                        <View key={index} className="items-center flex-1">
                                            <Animated.View
                                                entering={FadeInDown.delay(400 + index * 100).duration(600)}
                                                className="w-8 rounded-full overflow-hidden mb-2"
                                                style={{ height: Math.max(height, 8) }}
                                            >
                                                <LinearGradient
                                                    colors={['#14b8a6', '#0d9488']}
                                                    className="flex-1"
                                                />
                                            </Animated.View>
                                            <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">{item.day}</Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Legend/Axis Labels */}
                            <View className="flex-row justify-between items-center border-t border-slate-50 dark:border-slate-800 pt-4">
                                <View className="flex-row items-center">
                                    <View className="w-3 h-3 rounded-full bg-teal-500 mr-2" />
                                    <Text className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Daily Calories</Text>
                                </View>
                                <Text className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase">Max: {Math.max(...chartData.map(d => d.eaten), 2000)} kcal</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Activity Breakdown */}
                    <Animated.View entering={FadeInDown.delay(300).duration(600)} className="mb-8">
                        <Text className="text-xl font-black text-slate-900 dark:text-white mb-6 ml-1">Activity Breakdown</Text>
                        <View className="flex-row gap-4">
                            <View className="flex-1 bg-amber-50 dark:bg-amber-900/10 rounded-[32px] p-6 border border-amber-100 dark:border-amber-900/20">
                                <View className="bg-amber-100 dark:bg-amber-900/30 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                                    <Utensils size={24} color="#d97706" />
                                </View>
                                <Text className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Consistency</Text>
                                <Text className="text-slate-900 dark:text-white font-black text-2xl">{stats.consistency}%</Text>
                                <Text className="text-amber-600 dark:text-amber-400 text-[10px] font-bold mt-2">+5% from last week</Text>
                            </View>
                            <View className="flex-1 bg-blue-50 dark:bg-blue-900/10 rounded-[32px] p-6 border border-blue-100 dark:border-blue-900/20">
                                <View className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                                    <Activity size={24} color="#2563eb" />
                                </View>
                                <Text className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Target</Text>
                                <Text className="text-slate-900 dark:text-white font-black text-2xl">On Track</Text>
                                <Text className="text-blue-600 dark:text-blue-400 text-[10px] font-bold mt-2">12k steps avg</Text>
                            </View>
                        </View>
                    </Animated.View>

                    <View className="h-20" />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
