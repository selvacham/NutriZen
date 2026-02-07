import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSpring,
    Easing,
    interpolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Droplet, Plus } from 'lucide-react-native';
import { useWaterStore } from '../store/useWaterStore';
import { useAuthStore } from '../store/useAuthStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

export const SmartHydration = () => {
    const { user } = useAuthStore();
    const { getHydrationPercentage, getTotalForDate, addLog, goal } = useWaterStore();

    const percentage = getHydrationPercentage();
    const total = getTotalForDate();

    // Wave Animation
    const waveOffset = useSharedValue(0);
    const fillValue = useSharedValue(0);

    useEffect(() => {
        waveOffset.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.linear }),
            -1,
            false
        );
    }, []);

    useEffect(() => {
        fillValue.value = withSpring(percentage / 100, { damping: 20, stiffness: 90 });
    }, [percentage]);

    const waveStyle = useAnimatedStyle(() => {
        const translateY = interpolate(fillValue.value, [0, 1], [120, 0]);
        const translateX = interpolate(waveOffset.value, [0, 1], [0, -CARD_WIDTH]);

        return {
            transform: [
                { translateY },
                { translateX }
            ]
        };
    });

    const handleAddWater = (amount: number) => {
        if (user?.id) {
            addLog(amount, user.id);
        }
    };

    return (
        <View className="bg-white dark:bg-slate-900 rounded-[40px] p-8 mb-8 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative">
            {/* Background Wave Container */}
            <View className="absolute inset-0 bg-blue-50/30 dark:bg-blue-900/10">
                <Animated.View
                    style={[styles.waveContainer, waveStyle]}
                >
                    <LinearGradient
                        colors={['#3b82f6', '#2563eb']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        className="w-full h-full opacity-20 dark:opacity-30"
                    />
                </Animated.View>
            </View>

            <View className="flex-row justify-between items-start z-10">
                <View>
                    <View className="flex-row items-center mb-1">
                        <Droplet size={20} color="#3b82f6" fill="#3b82f6" className="mr-2" />
                        <Text className="text-slate-900 dark:text-white font-black text-xl">Hydration</Text>
                    </View>
                    <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
                        {total}ml / {goal}ml
                    </Text>
                </View>
                <View className="bg-blue-500 rounded-3xl px-4 py-2">
                    <Text className="text-white font-black text-lg">{percentage}%</Text>
                </View>
            </View>

            <View className="flex-row gap-4 mt-8 z-10">
                <TouchableOpacity
                    onPress={() => handleAddWater(250)}
                    className="flex-1 bg-blue-50 dark:bg-blue-900/30 py-4 rounded-[24px] items-center border border-blue-100 dark:border-blue-800"
                >
                    <Text className="text-blue-600 dark:text-blue-400 font-black text-sm">+250ml</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleAddWater(500)}
                    className="flex-1 bg-blue-500 py-4 rounded-[24px] items-center shadow-lg shadow-blue-500/30"
                >
                    <View className="flex-row items-center">
                        <Plus size={16} color="white" className="mr-1" />
                        <Text className="text-white font-black text-sm">500ml</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    waveContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: CARD_WIDTH * 2,
        height: 300,
    }
});
