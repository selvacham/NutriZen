import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
if (Platform.OS !== 'web') {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export async function registerForPushNotifications() {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return null;
        }

        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#14b8a6',
            });
        }

        return true;
    } catch (error) {
        console.error('Error registering for notifications:', error);
        return null;
    }
}

export async function scheduleWaterReminder() {
    try {
        // Cancel existing water reminders
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Schedule water reminders every 2 hours from 8 AM to 8 PM
        const hours = [8, 10, 12, 14, 16, 18, 20];

        for (const hour of hours) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '💧 Hydration Time!',
                    body: 'Remember to drink water and stay hydrated!',
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                    hour,
                    minute: 0,
                    repeats: true,
                },
            });
        }

        console.log('Water reminders scheduled successfully');
    } catch (error) {
        console.error('Error scheduling water reminders:', error);
    }
}

export async function scheduleMealReminder(mealType: 'breakfast' | 'lunch' | 'dinner') {
    try {
        const times = {
            breakfast: { hour: 8, minute: 0 },
            lunch: { hour: 13, minute: 0 },
            dinner: { hour: 19, minute: 0 },
        };

        const time = times[mealType];

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `🍽️ ${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Time!`,
                body: `Don't forget to log your ${mealType}!`,
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                hour: time.hour,
                minute: time.minute,
                repeats: true,
            },
        });

        console.log(`${mealType} reminder scheduled`);
    } catch (error) {
        console.error(`Error scheduling ${mealType} reminder:`, error);
    }
}

export async function sendLocalNotification(title: string, body: string) {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: null, // Send immediately
        });
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

export async function cancelAllNotifications() {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('All notifications cancelled');
    } catch (error) {
        console.error('Error cancelling notifications:', error);
    }
}
