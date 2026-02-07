import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, Clock, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOutUp, Layout } from 'react-native-reanimated';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useActivityStore, ActivityLog } from '../../src/store/useActivityStore';
import { useNutritionStore } from '../../src/store/useNutritionStore';
import { useWaterStore } from '../../src/store/useWaterStore';
import { useSleepStore } from '../../src/store/useSleepStore';
import { ActivityLogModal } from '../../src/components/modals/ActivityLogModal';
import { DateFilter } from '../../src/components/DateFilter';

export default function ActivityScreen() {
    const router = useRouter();
    const { user, profile } = useAuthStore();
    const { dateLogs, steps, selectedDate, setSelectedDate, fetchDateLogs, addLog, deleteLog, getCaloriesBurnedForDate } = useActivityStore();
    const [showActivityModal, setShowActivityModal] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchDateLogs(user.id, selectedDate);
        }
    }, [user, selectedDate]);

    const handleLogActivity = async (activity: { activity_type: string; duration_minutes: number; calories_burned: number; activity_group: string }) => {
        if (user?.id) {
            await addLog(activity, user.id);
        }
    };

    const handleDeleteActivity = async (id: string) => {
        await deleteLog(id);
    };

    const stepsGoal = 10000;

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
            <Animated.ScrollView
                className="px-5"
                showsVerticalScrollIndicator={false}
                entering={FadeInDown.duration(500)}
            >
                <View className="py-6 flex-row justify-between items-center">
                    <View>
                        <Text className="text-3xl font-bold text-slate-900 dark:text-white">Activity</Text>
                        <Text className="text-gray-500 dark:text-gray-400 mt-1">Track your workouts & movement</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowActivityModal(true)}
                        className="w-12 h-12 bg-teal-500 rounded-2xl items-center justify-center shadow-lg shadow-teal-500/20 active:scale-95"
                        activeOpacity={0.9}
                    >
                        <Plus color="white" size={24} />
                    </TouchableOpacity>
                </View>

                <DateFilter
                    selectedDate={selectedDate}
                    onDateChange={(date) => {
                        setSelectedDate(date);
                        useNutritionStore.getState().setSelectedDate(date);
                        useWaterStore.getState().setSelectedDate(date);
                        useSleepStore.getState().setSelectedDate(date);
                    }}
                />

                {/* Stats Cards */}
                <Animated.View entering={FadeInDown.delay(100).duration(500)} className="flex-row gap-3 mb-6">
                    <Card className="flex-1 p-5 items-center">
                        <Text className="text-3xl mb-1">🔥</Text>
                        <Text className="text-2xl font-bold text-slate-900 dark:text-white">{getCaloriesBurnedForDate()}</Text>
                        <Text className="text-xs text-gray-500">Calories Burned</Text>
                    </Card>
                    <Card className="flex-1 p-5 items-center">
                        <Text className="text-3xl mb-1">⏱️</Text>
                        <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                            {dateLogs.reduce((sum: number, log: ActivityLog) => sum + log.duration_minutes, 0)}
                        </Text>
                        <Text className="text-xs text-gray-500">Minutes Active</Text>
                    </Card>
                </Animated.View>

                {/* Steps Card */}
                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <Card className="mb-6 p-5">
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                <Text className="text-3xl mr-3">👟</Text>
                                <View>
                                    <Text className="text-lg font-bold text-slate-900 dark:text-white">Steps</Text>
                                    <Text className="text-sm text-gray-500">{steps.toLocaleString()} / {stepsGoal.toLocaleString()}</Text>
                                </View>
                            </View>
                            <Text className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                                {Math.round((steps / stepsGoal) * 100)}%
                            </Text>
                        </View>
                        <View className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <View
                                style={{ width: `${Math.min(100, (steps / stepsGoal) * 100)}%` }}
                                className="h-full bg-teal-500 rounded-full"
                            />
                        </View>
                    </Card>
                </Animated.View>

                {/* Today's Workouts */}
                <Animated.View entering={FadeInDown.delay(300).duration(500)} className="mb-6">
                    <Text className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                        {selectedDate.toDateString() === new Date().toDateString() ? "Today's" : "Day's"} Workouts
                    </Text>
                    {dateLogs.length > 0 ? (
                        dateLogs.map((log: ActivityLog, index: number) => (
                            <Animated.View
                                key={log.id}
                                entering={FadeInDown.delay(index * 100).springify()}
                                exiting={FadeOutUp}
                            >
                                <Card className="mb-3 p-4">
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1">
                                            <Text className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                                                {log.activity_type}
                                            </Text>
                                            <View className="flex-row items-center gap-3">
                                                <View className="flex-row items-center">
                                                    <Clock size={14} color="#94a3b8" />
                                                    <Text className="text-sm text-gray-500 ml-1">{log.duration_minutes} min</Text>
                                                </View>
                                                <View className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                <Text className="text-sm text-gray-500 font-bold uppercase tracking-tighter">🔥 {log.calories_burned} cal</Text>
                                                {log.activity_group && (
                                                    <>
                                                        <View className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                        <Text className="text-sm text-teal-600 dark:text-teal-400 font-bold">{log.activity_group}</Text>
                                                    </>
                                                )}
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeleteActivity(log.id)} className="p-2">
                                            <Trash2 size={18} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                </Card>
                            </Animated.View>
                        ))
                    ) : (
                        <View className="items-center py-12">
                            <Text className="text-6xl mb-4">💪</Text>
                            <Text className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No workouts logged yet</Text>
                            <Text className="text-gray-500 text-center">Tap the + button to log your first activity</Text>
                        </View>
                    )}
                </Animated.View>

                <View className="h-24" />
            </Animated.ScrollView>


            <ActivityLogModal
                visible={showActivityModal}
                onClose={() => setShowActivityModal(false)}
                onLogActivity={handleLogActivity}
                userWeight={profile?.current_weight_kg}
            />
        </SafeAreaView>
    );
}
