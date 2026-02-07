import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, DimensionValue } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, ArrowLeft, BedDouble, Sun } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, {
    FadeIn,
    FadeInDown,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withDelay,
    interpolate,
    withSequence
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSleepStore } from '../../src/store/useSleepStore';

const Star = ({ delay, size, top, left }: { delay: number; size: number; top: DimensionValue; left: DimensionValue }) => {
    const opacity = useSharedValue(0.1);

    React.useEffect(() => {
        opacity.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(0.8, { duration: 1500 }),
                    withTiming(0.1, { duration: 1500 })
                ),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: interpolate(opacity.value, [0.1, 0.8], [0.8, 1.2]) }]
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    top,
                    left,
                    width: size,
                    height: size,
                    backgroundColor: 'white',
                    borderRadius: size / 2,
                    shadowColor: 'white',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: size,
                },
                animatedStyle,
            ]}
        />
    );
};

const AnimatedNightSky = () => {
    const moonTranslateY = useSharedValue(0);

    React.useEffect(() => {
        moonTranslateY.value = withRepeat(
            withTiming(-15, { duration: 4000 }),
            -1,
            true
        );
    }, []);

    const moonStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: moonTranslateY.value }]
    }));

    const stars = [
        { id: 1, size: 2, top: '10%', left: '15%', delay: 0 },
        { id: 2, size: 3, top: '15%', left: '45%', delay: 500 },
        { id: 3, size: 2, top: '8%', left: '80%', delay: 1000 },
        { id: 4, size: 4, top: '25%', left: '10%', delay: 300 },
        { id: 5, size: 2, top: '30%', left: '90%', delay: 1500 },
        { id: 6, size: 3, top: '45%', left: '20%', delay: 800 },
        { id: 7, size: 2, top: '55%', left: '85%', delay: 1200 },
        { id: 8, size: 3, top: '70%', left: '15%', delay: 2000 },
        { id: 9, size: 2, top: '75%', left: '50%', delay: 400 },
        { id: 10, size: 4, top: '85%', left: '30%', delay: 1700 },
        { id: 11, size: 2, top: '90%', left: '75%', delay: 900 },
        { id: 12, size: 3, top: '20%', left: '70%', delay: 600 },
    ];

    return (
        <View className="absolute inset-0 overflow-hidden">
            <LinearGradient
                colors={['#020617', '#1e1b4b', '#0f172a']}
                className="absolute inset-0"
            />
            {stars.map(star => (
                <Star
                    key={star.id}
                    size={star.size}
                    top={star.top as DimensionValue}
                    left={star.left as DimensionValue}
                    delay={star.delay}
                />
            ))}
            <Animated.View
                style={[
                    { position: 'absolute', top: 60, right: 40, opacity: 0.15 },
                    moonStyle
                ]}
            >
                <Moon size={150} color="white" />
            </Animated.View>
        </View>
    );
};

export default function SleepScreen() {
    const router = useRouter();
    const { bedtime, waketime, setSleepSchedule } = useSleepStore();
    const [view, setView] = useState<'dashboard' | 'setup'>('dashboard');

    const safeParseDate = (dateStr: string) => {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) return date;
        // Try parsing as number if it's a timestamp string
        const timestamp = Number(dateStr);
        if (!isNaN(timestamp)) return new Date(timestamp);
        return new Date(); // Fallback
    };

    const [tempBedtime, setTempBedtime] = useState(safeParseDate(bedtime));
    const [tempWaketime, setTempWaketime] = useState(safeParseDate(waketime));
    const [showBedtimePicker, setShowBedtimePicker] = useState(false);
    const [showWaketimePicker, setShowWaketimePicker] = useState(false);

    const onBedtimeChange = (event: any, selectedDate?: Date) => {
        setShowBedtimePicker(false);
        if (selectedDate) setTempBedtime(selectedDate);
    };

    const onWaketimeChange = (event: any, selectedDate?: Date) => {
        setShowWaketimePicker(false);
        if (selectedDate) setTempWaketime(selectedDate);
    };

    const handleSaveSetup = () => {
        setSleepSchedule(tempBedtime.toISOString(), tempWaketime.toISOString());
        setView('dashboard');
    };

    const calculateDuration = (start: string, end: string) => {
        const startDate = safeParseDate(start);
        const endDate = safeParseDate(end);

        let startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
        let endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

        if (endMinutes <= startMinutes) {
            endMinutes += 24 * 60;
        }

        const diffMinutes = endMinutes - startMinutes;
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;

        return { display: `${hours}h ${mins > 0 ? `${mins}m` : ''}`, minutes: diffMinutes };
    };

    const duration = calculateDuration(bedtime, waketime);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View className="flex-1 bg-[#020617]">
            <AnimatedNightSky />

            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center border-b border-white/10">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full bg-white/10">
                        <ArrowLeft color="white" size={24} />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold ml-4">Sleep Tracker</Text>
                </View>

                {view === 'dashboard' ? (
                    <Animated.ScrollView entering={FadeIn} className="flex-1 px-6 pt-6">

                        {/* Sleep Goal Card */}
                        <View className="items-center mb-10 mt-4">
                            <View className="w-48 h-48 rounded-full border-8 border-indigo-500/30 items-center justify-center relative">
                                <View className="absolute inset-0 rounded-full border-8 border-indigo-400 border-t-transparent -rotate-45" />
                                <Moon size={40} color="#818cf8" className="mb-2" />
                                <Text className="text-4xl font-bold text-white max-w-[80%] text-center">{duration.display}</Text>
                                <Text className="text-indigo-200">Sleep Duration</Text>
                            </View>
                        </View>

                        <Text className="text-lg font-bold text-white mb-4">Your Schedule</Text>

                        <View className="flex-row gap-4 mb-8">
                            {/* Bedtime Card */}
                            <TouchableOpacity
                                onPress={() => setView('setup')}
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 items-start active:bg-white/10"
                            >
                                <View className="p-2 bg-indigo-500/20 rounded-xl mb-3">
                                    <Moon size={24} color="#818cf8" />
                                </View>
                                <Text className="text-slate-400 text-sm">Bedtime</Text>
                                <Text className="text-white text-xl font-bold mt-1">{formatTime(safeParseDate(bedtime))}</Text>
                            </TouchableOpacity>

                            {/* Wake Up Card */}
                            <TouchableOpacity
                                onPress={() => setView('setup')}
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-5 items-start active:bg-white/10"
                            >
                                <View className="p-2 bg-amber-500/20 rounded-xl mb-3">
                                    <Sun size={24} color="#fbbf24" />
                                </View>
                                <Text className="text-slate-400 text-sm">Wake Up</Text>
                                <Text className="text-white text-xl font-bold mt-1">{formatTime(safeParseDate(waketime))}</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="bg-indigo-950/50 rounded-2xl p-6 border border-indigo-900/50 mb-8">
                            <View className="flex-row items-center mb-4">
                                <BedDouble size={24} color="#a5b4fc" className="mr-3" />
                                <Text className="text-white font-bold text-lg">Sleep Tips</Text>
                            </View>
                            <Text className="text-indigo-200 leading-6">
                                Consistent sleep / wake times can improve your sleep quality by up to 40%. Try to stick to your schedule even on weekends!
                            </Text>
                        </View>

                    </Animated.ScrollView>
                ) : (
                    <Animated.View entering={FadeInDown} className="flex-1 px-6 pt-6">
                        <Text className="text-2xl font-bold text-white mb-2">Edit Schedule</Text>
                        <Text className="text-indigo-200 mb-8">Set your ideal sleep routine.</Text>

                        {/* Bedtime Picker */}
                        <View className="bg-white/5 rounded-2xl p-4 mb-4 border border-white/10">
                            <Text className="text-slate-400 mb-2">Bedtime</Text>
                            <TouchableOpacity
                                onPress={() => setShowBedtimePicker(true)}
                                className="flex-row items-center justify-between"
                            >
                                <Text className="text-3xl font-bold text-white">{formatTime(tempBedtime)}</Text>
                                <View className="bg-indigo-600 px-4 py-2 rounded-lg">
                                    <Text className="text-white font-bold">Change</Text>
                                </View>
                            </TouchableOpacity>
                            {showBedtimePicker && (
                                <DateTimePicker
                                    value={tempBedtime}
                                    mode="time"
                                    display="spinner"
                                    onChange={onBedtimeChange}
                                    themeVariant="dark"
                                />
                            )}
                        </View>

                        {/* Waketime Picker */}
                        <View className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/10">
                            <Text className="text-slate-400 mb-2">Wake Up</Text>
                            <TouchableOpacity
                                onPress={() => setShowWaketimePicker(true)}
                                className="flex-row items-center justify-between"
                            >
                                <Text className="text-3xl font-bold text-white">{formatTime(tempWaketime)}</Text>
                                <View className="bg-amber-600 px-4 py-2 rounded-lg">
                                    <Text className="text-white font-bold">Change</Text>
                                </View>
                            </TouchableOpacity>
                            {showWaketimePicker && (
                                <DateTimePicker
                                    value={tempWaketime}
                                    mode="time"
                                    display="spinner"
                                    onChange={onWaketimeChange}
                                    themeVariant="dark"
                                />
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={handleSaveSetup}
                            className="bg-indigo-500 w-full py-4 rounded-xl items-center shadow-lg shadow-indigo-500/20"
                        >
                            <Text className="text-white font-bold text-lg">Save Schedule</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </SafeAreaView>
        </View>
    );
}
