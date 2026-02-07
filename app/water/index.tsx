import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Minus, Info, Share2, MoreHorizontal } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useWaterStore } from '../../src/store/useWaterStore';
import Animated, { useSharedValue, useAnimatedProps, withTiming, withSpring, interpolate, Extrapolation, useAnimatedStyle } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const { width } = Dimensions.get('window');

export default function WaterScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { dateLogs, goal, fetchDateLogs, addLog, deleteLog, getTotalForDate } = useWaterStore();
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (user?.id) {
            fetchDateLogs(user.id);
        }
    }, [user]);

    const currentAmount = getTotalForDate();
    const progress = Math.min(currentAmount / goal, 1);

    // Animation values
    const progressValue = useSharedValue(0);

    useEffect(() => {
        progressValue.value = withTiming(progress, { duration: 1000 });
    }, [progress]);

    const handleAddWater = async () => {
        if (!user?.id || adding) return;
        setAdding(true);
        try {
            await addLog(250, user.id);
        } catch (error) {
            console.error(error);
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveLastLog = async () => {
        if (dateLogs.length > 0 && !adding) {
            setAdding(true);
            try {
                await deleteLog(dateLogs[0].id);
            } catch (error) {
                console.error(error);
            } finally {
                setAdding(false);
            }
        }
    };

    // Circular Progress Props
    const size = width * 0.6;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const animatedProps = useAnimatedProps(() => {
        return {
            strokeDashoffset: circumference * (1 - progressValue.value),
        };
    });

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950">
            {/* Header */}
            <View className="flex-row justify-between items-center px-6 py-4">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <ChevronLeft size={28} className="text-slate-900 dark:text-white" />
                </TouchableOpacity>
                <View className="flex-row gap-4">
                    <TouchableOpacity className="p-2">
                        <Share2 size={24} className="text-slate-900 dark:text-white" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="flex-1 items-center px-6 pt-4">
                <Text className="text-slate-500 dark:text-slate-400 text-lg mb-8">
                    Today, {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </Text>

                {/* Main Progress Circle */}
                <View style={{ width: size, height: size }} className="justify-center items-center mb-12 relative">
                    <Svg width={size} height={size}>
                        {/* Background Circle */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#e2e8f0" // slate-200
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        {/* Progress Circle */}
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#3b82f6" // blue-500
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeLinecap="round"
                            origin={`${size / 2}, ${size / 2}`}
                            rotation="-90"
                            animatedProps={animatedProps}
                        />
                    </Svg>

                    {/* Center Content */}
                    <View className="absolute items-center justify-center">
                        <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mb-2">
                            <Text className="text-3xl">💧</Text>
                        </View>
                        <Text className="text-3xl font-bold text-slate-900 dark:text-white">
                            {currentAmount}
                            <Text className="text-lg text-slate-500 font-normal"> ml</Text>
                        </Text>
                        <Text className="text-slate-500 dark:text-slate-400">
                            Goal: {goal}ml
                        </Text>
                    </View>
                </View>

                {/* Controls */}
                <View className="flex-row items-center justify-between w-full px-12 mb-12">
                    <TouchableOpacity
                        onPress={handleRemoveLastLog}
                        className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
                        disabled={dateLogs.length === 0}
                    >
                        <Minus size={24} className={dateLogs.length === 0 ? "text-slate-300" : "text-slate-600 dark:text-slate-300"} />
                    </TouchableOpacity>

                    <View className="items-center">
                        <TouchableOpacity
                            onPress={handleAddWater}
                            className="w-20 h-20 rounded-full bg-blue-500 items-center justify-center shadow-lg shadow-blue-500/30"
                            activeOpacity={0.8}
                        >
                            <Plus size={40} color="white" />
                        </TouchableOpacity>
                        <Text className="text-slate-900 dark:text-white font-medium mt-3">1 Glass (250 ml)</Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleAddWater}
                        className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center"
                    >
                        <Plus size={24} className="text-blue-600 dark:text-blue-300" />
                    </TouchableOpacity>
                </View>

                {/* Additional Info Cards */}
                <View className="w-full gap-4">
                    <View className="flex-row justify-between items-center p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                        <Text className="text-slate-900 dark:text-white font-medium">Reminder</Text>
                        <TouchableOpacity>
                            <Text className="text-blue-500 font-medium">Add</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex-row items-center gap-4">
                        <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl items-center justify-center">
                            <Info size={20} className="text-blue-500" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1">Today's Tip</Text>
                            <Text className="text-slate-900 dark:text-white text-sm">Drink water before meals to help control appetite.</Text>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
