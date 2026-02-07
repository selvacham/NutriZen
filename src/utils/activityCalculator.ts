// Activity Calculator using MET (Metabolic Equivalent of Task) values
export interface Activity {
    id: string;
    name: string;
    met: number; // Metabolic Equivalent of Task
    icon: string;
}

export const activities: Activity[] = [
    { id: '1', name: 'Walking (Slow)', met: 2.5, icon: '🚶' },
    { id: '2', name: 'Walking (Moderate)', met: 3.5, icon: '🚶‍♂️' },
    { id: '3', name: 'Walking (Brisk)', met: 4.5, icon: '🚶‍♀️' },
    { id: '4', name: 'Running (5 km/h)', met: 8.0, icon: '🏃' },
    { id: '5', name: 'Running (8 km/h)', met: 11.0, icon: '🏃‍♂️' },
    { id: '6', name: 'Running (10 km/h)', met: 13.0, icon: '🏃‍♀️' },
    { id: '7', name: 'Cycling (Leisure)', met: 4.0, icon: '🚴' },
    { id: '8', name: 'Cycling (Moderate)', met: 8.0, icon: '🚴‍♂️' },
    { id: '9', name: 'Cycling (Vigorous)', met: 12.0, icon: '🚴‍♀️' },
    { id: '10', name: 'Swimming (Leisure)', met: 6.0, icon: '🏊' },
    { id: '11', name: 'Swimming (Moderate)', met: 8.0, icon: '🏊‍♂️' },
    { id: '12', name: 'Swimming (Vigorous)', met: 10.0, icon: '🏊‍♀️' },
    { id: '13', name: 'Gym - Weight Training', met: 6.0, icon: '🏋️' },
    { id: '14', name: 'Gym - Cardio', met: 7.0, icon: '💪' },
    { id: '15', name: 'Yoga', met: 2.5, icon: '🧘' },
    { id: '16', name: 'Pilates', met: 3.0, icon: '🤸' },
    { id: '17', name: 'Dancing', met: 4.5, icon: '💃' },
    { id: '18', name: 'Badminton', met: 5.5, icon: '🏸' },
    { id: '19', name: 'Tennis', met: 7.0, icon: '🎾' },
    { id: '20', name: 'Football', met: 8.0, icon: '⚽' },
    { id: '21', name: 'Cricket', met: 4.5, icon: '🏏' },
    { id: '22', name: 'Basketball', met: 6.5, icon: '🏀' },
    { id: '23', name: 'Hiking', met: 6.0, icon: '🥾' },
    { id: '24', name: 'Jump Rope', met: 12.0, icon: '🪢' },
    { id: '25', name: 'Aerobics', met: 7.0, icon: '🤾' },
];

/**
 * Calculate calories burned based on activity, duration, and user weight
 * Formula: Calories = MET × weight(kg) × duration(hours)
 */
export function calculateCaloriesBurned(
    activityMet: number,
    durationMinutes: number,
    weightKg: number = 70 // Default weight if not provided
): number {
    const durationHours = durationMinutes / 60;
    const calories = activityMet * weightKg * durationHours;
    return Math.round(calories);
}

export function getActivityByName(name: string): Activity | undefined {
    return activities.find(activity => activity.name === name);
}

export function searchActivities(query: string): Activity[] {
    if (!query.trim()) return activities;

    const lowerQuery = query.toLowerCase();
    return activities.filter(activity =>
        activity.name.toLowerCase().includes(lowerQuery)
    );
}
