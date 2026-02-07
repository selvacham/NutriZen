import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useWaterStore } from '../store/useWaterStore';
import { useNutritionStore } from '../store/useNutritionStore';
import { useAuthStore } from '../store/useAuthStore';
import { sendLocalNotification, registerForPushNotifications } from '../services/notifications';

/**
 * useNotificationEngine
 * Monitors user progress and triggers smart reminders.
 */
export const useNotificationEngine = () => {
    const { user, profile } = useAuthStore();
    const { getTotalForDate, dateLogs: waterLogs, goal: waterGoal } = useWaterStore();
    const { logs: foodLogs, getTotalsForDate: getFoodTotals } = useNutritionStore();

    useEffect(() => {
        // Initial setup
        registerForPushNotifications();
    }, []);

    // Monitor Water Progress
    useEffect(() => {
        if (!user) return;

        const currentWater = getTotalForDate();
        const hydrationPercentage = waterGoal > 0 ? (currentWater / waterGoal) * 100 : 0;

        // Smart Check: 2 PM check
        const now = new Date();
        if (now.getHours() === 14 && hydrationPercentage < 50) {
            // Only trigger once per day (could use a simple ref or store state)
            sendLocalNotification(
                "💧 Falling Behind?",
                `You've only hit ${Math.round(hydrationPercentage)}% of your water goal. Have a glass now!`
            );
        }

        // Milestone achievements
        if (hydrationPercentage >= 100 && waterLogs.length > 0) {
            const lastLog = waterLogs[0];
            const logTime = new Date(lastLog.logged_at);
            const timeDiff = now.getTime() - logTime.getTime();

            // If logged in the last minute
            if (timeDiff < 60000) {
                sendLocalNotification(
                    "🎉 Goal Reached!",
                    "You've crushed your hydration goal for today. Stay consistent!"
                );
            }
        }
    }, [waterLogs, waterGoal]);

    // Monitor Nutrition Progress
    useEffect(() => {
        if (!user || !profile) return;

        const totals = getFoodTotals();
        const totalCalories = totals.calories;
        const calorieGoal = profile.daily_calorie_goal || 2000;
        const remaining = calorieGoal - totalCalories;

        // Late evening check (8 PM)
        const now = new Date();
        if (now.getHours() === 20 && remaining > 500) {
            sendLocalNotification(
                "🍎 Need a Snack?",
                `You still have ${Math.round(remaining)} calories left in your budget. Want to log a light dinner?`
            );
        }
    }, [foodLogs, profile]);

    return null;
};
