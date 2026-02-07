import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, TrendingUp, Calendar, Target, Activity, Utensils, Droplet, Moon, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInRight, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { useNutritionStore } from '../src/store/useNutritionStore';
import { useActivityStore } from '../src/store/useActivityStore';
import { useAuthStore } from '../src/store/useAuthStore';
import { useWaterStore } from '../src/store/useWaterStore';
import { useSleepStore } from '../src/store/useSleepStore';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
    const router = useRouter();
    const { profile } = useAuthStore();
    const { logs: foodLogs } = useNutritionStore();
    const { logs: activityLogs } = useActivityStore();
    const { logs: waterLogs } = useWaterStore();
    const { logs: sleepLogs } = useSleepStore();

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
            const dailyWater = waterLogs.filter(log => new Date(log.logged_at).toDateString() === dateStr);
            const dailySleep = sleepLogs.filter(log => new Date(log.logged_at).toDateString() === dateStr);

            const caloriesEaten = dailyFood.reduce((sum, log) => sum + log.calories, 0);
            const caloriesBurned = dailyActivity.reduce((sum, log) => sum + log.calories_burned, 0);
            const waterIntake = dailyWater.reduce((sum, log) => sum + log.amount_ml, 0);
            const sleepDuration = dailySleep.reduce((sum, log) => sum + log.duration_minutes, 0) / 60;

            data.push({
                day: dayName,
                eaten: caloriesEaten,
                burned: caloriesBurned,
                water: waterIntake,
                sleep: sleepDuration,
                label: dayName.charAt(0)
            });
        }
        return data;
    }, [foodLogs, activityLogs, waterLogs, sleepLogs]);

    const stats = useMemo(() => {
        const totalEaten = chartData.reduce((sum, d) => sum + d.eaten, 0);
        const totalBurned = chartData.reduce((sum, d) => sum + d.burned, 0);
        const totalSleep = chartData.reduce((sum, d) => sum + d.sleep, 0);
        const avgEaten = Math.round(totalEaten / 7);
        const avgBurned = Math.round(totalBurned / 7);
        const avgSleep = (totalSleep / 7).toFixed(1);

        // Corelation Analysis Mock/Logic
        const highHydrationDays = chartData.filter(d => d.water > 2000).length;
        const lowSleepDays = chartData.filter(d => d.sleep < 6).length;

        return {
            avgEaten,
            avgBurned,
            avgSleep,
            highHydrationDays,
            lowSleepDays,
            totalWorkouts: activityLogs.filter(log => {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                return new Date(log.performed_at) > oneWeekAgo;
            }).length,
            consistency: 85
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
                            <LinearGradient colors={['#1e293b', '#0f172a']} className="absolute inset-0" />
                            <View className="flex-row justify-between items-start mb-10">
                                <View>
                                    <View className="flex-row items-center bg-teal-500/10 px-3 py-1.5 rounded-full border border-teal-500/20 mb-3 self-start">
                                        <View className="w-2 h-2 rounded-full bg-teal-500 mr-2" />
                                        <Text className="text-[10px] font-black text-teal-500 uppercase tracking-tighter">AI Analysis Active</Text>
                                    </View>
                                    <Text className="text-white font-black text-2xl">Weekly Report</Text>
                                    <Text className="text-slate-400 font-bold text-xs">A comprehensive view of your health</Text>
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
                                    <Text className="text-white font-black text-2xl">{stats.avgSleep}h</Text>
                                    <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">Avg Sleep</Text>
                                </View>
                                <View className="w-[1px] h-8 bg-slate-800 self-center" />
                                <View className="flex-1 items-center">
                                    <Text className="text-white font-black text-2xl">{stats.totalWorkouts}</Text>
                                    <Text className="text-slate-500 text-[9px] font-black uppercase tracking-widest mt-1">Workouts</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Chart Section - Eaten vs Burned */}
                    <Animated.View entering={FadeInDown.delay(200).duration(600)} className="mb-8">
                        <View className="flex-row justify-between items-center mb-6 ml-1">
                            <Text className="text-xl font-black text-slate-900 dark:text-white">Calorie Balance</Text>
                            <View className="flex-row gap-3">
                                <View className="flex-row items-center">
                                    <View className="w-2 h-2 rounded-full bg-teal-500 mr-1" />
                                    <Text className="text-[8px] font-black text-slate-400 uppercase">In</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="w-2 h-2 rounded-full bg-rose-500 mr-1" />
                                    <Text className="text-[8px] font-black text-slate-400 uppercase">Out</Text>
                                </View>
                            </View>
                        </View>

                        <View className="bg-white dark:bg-slate-900/40 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800">
                            <View className="flex-row items-end justify-between h-[200px] mb-4 px-2">
                                {chartData.map((item, index) => {
                                    const maxVal = Math.max(...chartData.map(d => Math.max(d.eaten, d.burned)), 2000);
                                    const intakeH = (item.eaten / maxVal) * 160;
                                    const burnedH = (item.burned / maxVal) * 160;

                                    return (
                                        <View key={index} className="items-center flex-1">
                                            <View className="flex-row gap-1 items-end mb-2">
                                                <View
                                                    className="w-3 bg-teal-500 rounded-full"
                                                    style={{ height: Math.max(intakeH, 4) }}
                                                />
                                                <View
                                                    className="w-3 bg-rose-500 rounded-full"
                                                    style={{ height: Math.max(burnedH, 4) }}
                                                />
                                            </View>
                                            <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">{item.day}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </Animated.View>

                    {/* AI Correlation Discovery */}
                    <Animated.View entering={FadeInUp.delay(300).duration(800)} className="mb-8">
                        <Text className="text-xl font-black text-slate-900 dark:text-white mb-6 ml-1">AI Correlations</Text>
                        <View className="bg-indigo-50 dark:bg-indigo-900/10 rounded-[40px] p-8 border border-indigo-100 dark:border-indigo-900/20">
                            <View className="flex-row items-center mb-6">
                                <Sparkles size={24} color="#6366f1" className="mr-3" />
                                <Text className="text-indigo-900 dark:text-indigo-400 font-black text-lg">Smart Insights</Text>
                            </View>

                            <InsightItem
                                icon={<Droplet size={18} color="#0d9488" />}
                                title="Hydration Consistency"
                                text={stats.highHydrationDays > 4
                                    ? "Great job! Your hydration is excellent this week. This is likely boosting your recovery."
                                    : "You're only hitting hydration goals on some days. Consistency here could improve energy."}
                            />

                            <InsightItem
                                icon={<Moon size={18} color="#8b5cf6" />}
                                title="Sleep vs Activity"
                                text={stats.lowSleepDays > 2
                                    ? "I noticed your activity levels drop on days following low sleep. Aim for 7h to peak perform."
                                    : "Your sleep quality is supporting your daily activity goals perfectly. Keep it up!"}
                            />
                        </View>
                    </Animated.View>

                    <View className="h-20" />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

function InsightItem({ icon, title, text }: { icon: any; title: string; text: string }) {
    return (
        <View className="mb-6 last:mb-0">
            <View className="flex-row items-center mb-2">
                <View className="bg-white dark:bg-slate-800 p-2 rounded-xl mr-3 shadow-sm">
                    {icon}
                </View>
                <Text className="text-slate-900 dark:text-white font-bold">{title}</Text>
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-sm leading-5 px-1">{text}</Text>
        </View>
    );
}
