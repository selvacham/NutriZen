import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Scale, Plus, History, Target, TrendingDown, TrendingUp } from 'lucide-react-native';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useWeightStore } from '../../src/store/useWeightStore';

const { width } = Dimensions.get('window');

export default function WeightScreen() {
    const router = useRouter();
    const { user, profile } = useAuthStore();
    const { logs, unit, loading, fetchLogs, addLog, deleteLog, toggleUnit, convertWeight } = useWeightStore();
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (user?.id) {
            fetchLogs(user.id);
        }
    }, [user]);

    const handleAddWeight = async () => {
        if (!inputValue || isNaN(parseFloat(inputValue))) {
            Alert.alert('Invalid Input', 'Please enter a valid weight.');
            return;
        }
        if (!user?.id) return;

        await addLog(parseFloat(inputValue), user.id);
        setInputValue('');
        Alert.alert('Success', 'Weight logged successfully!');
    };

    const currentWeight = logs.length > 0 ? logs[0].weight_kg : (profile?.current_weight_kg || 0);
    const displayedWeight = convertWeight(currentWeight);
    const targetWeight = profile?.target_weight_kg || 0;
    const displayedTarget = convertWeight(targetWeight);

    const diff = currentWeight - targetWeight;
    const isWeightLoss = profile?.goal === 'Lose Weight';
    const hasReachedGoal = isWeightLoss ? currentWeight <= targetWeight : currentWeight >= targetWeight;
    const progressValue = Math.abs(convertWeight(Math.abs(diff)));
    const progressText = hasReachedGoal ? 'Goal Reached! 🏆' : `${progressValue} ${unit} to ${isWeightLoss ? 'lose' : 'gain'}`;

    return (
        <View className="flex-1 bg-slate-50 dark:bg-slate-950">
            {/* Top Background Pattern/Color */}
            <View className="absolute top-0 left-0 right-0 h-[45%] bg-teal-800 dark:bg-teal-900 overflow-hidden">
                <LinearGradient
                    colors={['#0d9488', '#0f766e', '#134e4a']}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
            </View>

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="flex-row justify-between items-center px-6 py-4">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 items-center justify-center bg-white/20 rounded-full"
                        activeOpacity={0.7}
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white font-black text-xl">Weight Tracker</Text>
                    <TouchableOpacity
                        onPress={toggleUnit}
                        className="px-4 py-2 bg-white/20 rounded-full border border-white/30"
                        activeOpacity={0.7}
                    >
                        <Text className="text-white font-bold">{unit.toUpperCase()}</Text>
                    </TouchableOpacity>
                </View>

                {/* Static Hero Section */}
                <Animated.View entering={FadeIn.duration(600)} className="items-center py-6">
                    <View className="w-44 h-44 bg-white/10 rounded-full items-center justify-center border-4 border-white/20 mb-4">
                        <Scale size={40} color="white" opacity={0.6} className="mb-1" />
                        <Text className="text-5xl font-black text-white">{displayedWeight}</Text>
                        <Text className="text-teal-100 font-bold uppercase tracking-widest text-[10px] mt-1">Current {unit}</Text>
                    </View>

                    <View className="flex-row gap-4 px-6 mb-2">
                        <View className="flex-1 bg-white/10 rounded-[32px] p-4 items-center border border-white/10">
                            <Target size={20} color="white" opacity={0.7} className="mb-1" />
                            <Text className="text-white font-black text-lg">{displayedTarget}</Text>
                            <Text className="text-teal-100/60 font-bold text-[8px] uppercase">Goal</Text>
                        </View>
                        <View className="flex-1 bg-white/10 rounded-[32px] p-4 items-center border border-white/10">
                            {diff > 0 ? <TrendingDown size={20} color="white" /> : <TrendingUp size={20} color="white" />}
                            <Text className="text-white font-black text-lg">{progressValue}</Text>
                            <Text className="text-teal-100/60 font-bold text-[8px] uppercase">Progress</Text>
                        </View>
                    </View>
                </Animated.View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Input Section */}
                    <View className="flex-1 bg-white dark:bg-slate-950 rounded-t-[40px] px-6 pt-10">
                        <View className="mb-8">
                            <Text className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-widest mb-4 ml-2">Log New Weight</Text>
                            <View className="flex-row gap-3">
                                <TextInput
                                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl px-6 py-5 text-xl font-bold text-slate-900 dark:text-white"
                                    placeholder={`Enter weight in ${unit}`}
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    value={inputValue}
                                    onChangeText={setInputValue}
                                />
                                <TouchableOpacity
                                    onPress={handleAddWeight}
                                    disabled={loading}
                                    className="bg-teal-500 w-16 h-16 rounded-3xl items-center justify-center shadow-lg shadow-teal-500/20 active:scale-95"
                                >
                                    <Plus size={32} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* History Section */}
                        <View className="mb-10">
                            <View className="flex-row justify-between items-center mb-6 px-2">
                                <View className="flex-row items-center gap-2">
                                    <History size={16} className="text-slate-400" />
                                    <Text className="text-slate-900 dark:text-white font-black text-lg">History</Text>
                                </View>
                                <Text className="text-slate-400 font-bold text-xs">{logs.length} logs</Text>
                            </View>

                            {logs.length === 0 ? (
                                <View className="bg-slate-50 dark:bg-slate-900/50 rounded-[32px] p-10 items-center justify-center border border-dashed border-slate-200 dark:border-slate-800">
                                    <Scale size={40} color="#94a3b8" className="mb-4" />
                                    <Text className="text-slate-400 text-center font-medium">No weight logs yet.{'\n'}Start today!</Text>
                                </View>
                            ) : (
                                logs.map((log, index) => (
                                    <Animated.View
                                        key={log.id}
                                        entering={FadeInDown.delay(index * 50)}
                                        layout={Layout.springify()}
                                        className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-[24px] mb-3 flex-row items-center justify-between border border-slate-100 dark:border-slate-800"
                                    >
                                        <View>
                                            <Text className="text-slate-900 dark:text-white font-black text-lg">
                                                {unit === 'kg' ? log.weight_kg : parseFloat((log.weight_kg * 2.20462).toFixed(1))} {unit}
                                            </Text>
                                            <Text className="text-slate-400 text-xs font-bold mt-1">
                                                {new Date(log.logged_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => {
                                                Alert.alert("Delete Log", "Are you sure?", [
                                                    { text: "Cancel" },
                                                    { text: "Delete", style: "destructive", onPress: () => deleteLog(log.id) }
                                                ]);
                                            }}
                                            className="w-10 h-10 items-center justify-center bg-rose-50 dark:bg-rose-900/10 rounded-full"
                                        >
                                            <Text className="text-rose-500 font-black">×</Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))
                            )}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
