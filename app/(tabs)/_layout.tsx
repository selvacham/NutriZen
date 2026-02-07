import React, { useState, useEffect } from 'react';
import { Tabs, Redirect, useRouter, Link } from 'expo-router';
import { Home, Utensils, Activity, User, MessageCircle, Plus } from 'lucide-react-native';
import { Colors } from '../../src/constants/Colors';
import {
    useColorScheme,
    View,
    ActivityIndicator,
    TouchableOpacity,
    StyleSheet,
    Platform
} from 'react-native';
import { useAuthStore } from '../../src/store/useAuthStore';
import { QuickActionModal } from '../../src/components/modals/QuickActionModal';
import { SleepLogModal } from '../../src/components/modals/SleepLogModal';
import { FoodSearchModal } from '../../src/components/modals/FoodSearchModal';
import { ActivityLogModal } from '../../src/components/modals/ActivityLogModal';
import { AICoachModal } from '../../src/components/modals/AICoachModal';
import { useNutritionStore } from '../../src/store/useNutritionStore';
import { useActivityStore } from '../../src/store/useActivityStore';
import { useWaterStore } from '../../src/store/useWaterStore';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate
} from 'react-native-reanimated';

export default function TabLayout() {
    const colorScheme = useColorScheme();
    const { user, profile, loading } = useAuthStore();
    const router = useRouter();
    const { addLog: addFoodLog } = useNutritionStore();
    const { addLog: addActivityLog } = useActivityStore();
    const { addLog: addWaterLog } = useWaterStore();

    const [showQuickAction, setShowQuickAction] = useState(false);
    const [showSleepModal, setShowSleepModal] = useState(false);
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [showAICoach, setShowAICoach] = useState(false);

    // AI Coach Glow Animation
    const glowValue = useSharedValue(0);

    useEffect(() => {
        glowValue.value = withRepeat(
            withTiming(1, { duration: 2000 }),
            -1,
            true
        );
    }, []);

    const animatedGlowStyle = useAnimatedStyle(() => {
        const scale = interpolate(glowValue.value, [0, 1], [1, 1.1]);
        const shadowOpacity = interpolate(glowValue.value, [0, 1], [0.3, 0.6]);
        const shadowRadius = interpolate(glowValue.value, [0, 1], [10, 25]);

        return {
            transform: [{ scale }],
            shadowOpacity,
            shadowRadius,
        };
    });

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            </View>
        );
    }

    if (!user) {
        return <Redirect href="/(auth)" />;
    }

    const handleQuickAction = async (action: string) => {
        switch (action) {
            case 'food':
                setShowFoodModal(true);
                break;
            case 'workout':
                setShowActivityModal(true);
                break;
            case 'sleep':
                setShowQuickAction(false);
                setTimeout(() => router.push('/sleep'), 500);
                break;
            case 'water':
                setShowQuickAction(false);
                setTimeout(() => router.push('/water'), 500);
                break;
            case 'weight':
                setShowQuickAction(false);
                setTimeout(() => router.push('/weight'), 500);
                break;
            case 'steps':
                router.push('/(tabs)/activity');
                break;
            case 'ai-coach':
                setShowQuickAction(false);
                setShowAICoach(true);
                break;
        }
    };

    return (
        <View className="flex-1">
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                    headerShown: false,
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 24,
                        left: 20,
                        right: 20,
                        elevation: 0,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: colorScheme === 'dark' ? '#0f172a' : '#ffffff',
                        borderTopWidth: 0,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        paddingBottom: 0, // Reset for floating bar
                    },
                }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({ color, focused }) => <Home size={24} color={color} strokeWidth={focused ? 3 : 2} />,
                    }}
                />
                <Tabs.Screen
                    name="nutrition"
                    options={{
                        title: 'Nutrition',
                        tabBarIcon: ({ color, focused }) => <Utensils size={24} color={color} strokeWidth={focused ? 3 : 2} />,
                    }}
                />
                <Tabs.Screen
                    name="add"
                    options={{
                        title: '',
                        tabBarButton: () => (
                            <TouchableOpacity
                                onPress={() => setShowQuickAction(true)}
                                activeOpacity={0.9}
                                style={{
                                    top: -30,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 10,
                                    elevation: 10,
                                }}
                            >
                                <View style={styles.addButton}>
                                    <Plus size={32} color="white" />
                                </View>
                            </TouchableOpacity>
                        ),
                    }}
                    listeners={{
                        tabPress: (e) => {
                            e.preventDefault();
                        },
                    }}
                />

                <Tabs.Screen
                    name="ai-coach"
                    options={{
                        title: 'AI Coach',
                        href: null, // Hide from tab bar
                    }}
                />
                <Tabs.Screen
                    name="activity"
                    options={{
                        title: 'Activity',
                        tabBarIcon: ({ color, focused }) => <Activity size={24} color={color} strokeWidth={focused ? 3 : 2} />,
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({ color, focused }) => <User size={24} color={color} strokeWidth={focused ? 3 : 2} />,
                    }}
                />

            </Tabs>

            {showQuickAction && (
                <QuickActionModal
                    visible={showQuickAction}
                    onClose={() => setShowQuickAction(false)}
                    onAction={handleQuickAction}
                />
            )}

            {showSleepModal && (
                <SleepLogModal
                    visible={showSleepModal}
                    onClose={() => setShowSleepModal(false)}
                    userId={user.id}
                />
            )}

            {showFoodModal && (
                <FoodSearchModal
                    visible={showFoodModal}
                    onClose={() => setShowFoodModal(false)}
                    onSelectFood={async (food) => {
                        if (user?.id) {
                            try {
                                await addFoodLog({
                                    food_name: food.name,
                                    calories: food.calories,
                                    protein_g: food.protein,
                                    carbs_g: food.carbs,
                                    fats_g: food.fats,
                                    meal_type: food.category,
                                }, user.id);
                            } catch (error) {
                                console.error('Error adding food:', error);
                            }
                        }
                    }}
                />
            )}

            {showActivityModal && (
                <ActivityLogModal
                    visible={showActivityModal}
                    onClose={() => setShowActivityModal(false)}
                    onLogActivity={async (activity) => {
                        if (user?.id) {
                            await addActivityLog(activity, user.id);
                        }
                    }}
                    userWeight={profile?.current_weight_kg}
                />
            )}

            {showAICoach && (
                <AICoachModal
                    visible={showAICoach}
                    onClose={() => setShowAICoach(false)}
                />
            )}

            {/* Global AI Coach Chat Button - Bottom Right (above tabs) */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        bottom: 108,
                        right: 24,
                        zIndex: 50,
                    },
                    animatedGlowStyle
                ]}
            >
                <TouchableOpacity
                    onPress={() => setShowAICoach(true)}
                    className="w-14 h-14 bg-teal-500 rounded-full items-center justify-center shadow-2xl shadow-teal-500/40"
                    activeOpacity={0.8}
                >
                    <MessageCircle color="white" size={28} />
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    addButton: {
        width: 56,
        height: 56,
        backgroundColor: '#14b8a6', // Teal-500
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#14b8a6',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.6,
        shadowRadius: 16,
        elevation: 16,
    },
});
