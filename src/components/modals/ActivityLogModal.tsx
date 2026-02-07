import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView, FlatList } from 'react-native';
import { X, Search } from 'lucide-react-native';
import { Activity, activities, calculateCaloriesBurned } from '../../utils/activityCalculator';

interface ActivityLogModalProps {
    visible: boolean;
    onClose: () => void;
    onLogActivity: (activity: { activity_type: string; duration_minutes: number; calories_burned: number }) => void;
    userWeight?: number;
}

export function ActivityLogModal({ visible, onClose, onLogActivity, userWeight = 70 }: ActivityLogModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
    const [duration, setDuration] = useState('');
    const [filteredActivities, setFilteredActivities] = useState<Activity[]>(activities);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setFilteredActivities(activities);
        } else {
            const lowerQuery = query.toLowerCase();
            setFilteredActivities(activities.filter(a => a.name.toLowerCase().includes(lowerQuery)));
        }
    };

    const handleSelectActivity = (activity: Activity) => {
        setSelectedActivity(activity);
    };

    const handleLog = () => {
        if (!selectedActivity || !duration) return;

        const durationNum = parseInt(duration);
        if (isNaN(durationNum) || durationNum <= 0) return;

        const caloriesBurned = calculateCaloriesBurned(selectedActivity.met, durationNum, userWeight);

        onLogActivity({
            activity_type: selectedActivity.name,
            duration_minutes: durationNum,
            calories_burned: caloriesBurned,
        });

        // Reset
        setSelectedActivity(null);
        setDuration('');
        setSearchQuery('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white dark:bg-slate-950 rounded-t-3xl h-[85%]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                        <Text className="text-xl font-bold text-slate-900 dark:text-white">Log Activity</Text>
                        <TouchableOpacity onPress={onClose} className="w-10 h-10 items-center justify-center">
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {!selectedActivity ? (
                        <>
                            {/* Search Bar */}
                            <View className="p-5">
                                <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-2xl px-4 py-3">
                                    <Search size={20} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 ml-3 text-slate-900 dark:text-white"
                                        placeholder="Search activities..."
                                        placeholderTextColor="#94a3b8"
                                        value={searchQuery}
                                        onChangeText={handleSearch}
                                    />
                                </View>
                            </View>

                            {/* Activity List */}
                            <FlatList
                                data={filteredActivities}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => handleSelectActivity(item)}
                                        className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 mb-3 flex-row items-center"
                                    >
                                        <Text className="text-3xl mr-4">{item.icon}</Text>
                                        <View className="flex-1">
                                            <Text className="text-lg font-semibold text-slate-900 dark:text-white">
                                                {item.name}
                                            </Text>
                                            <Text className="text-sm text-gray-500">MET: {item.met}</Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            />
                        </>
                    ) : (
                        <ScrollView className="flex-1 p-5">
                            <View className="items-center mb-8">
                                <Text className="text-5xl mb-4">{selectedActivity.icon}</Text>
                                <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {selectedActivity.name}
                                </Text>
                            </View>

                            <View className="mb-6">
                                <Text className="text-sm font-semibold text-gray-500 mb-2">Duration (minutes)</Text>
                                <TextInput
                                    className="bg-slate-100 dark:bg-slate-900 rounded-2xl px-4 py-4 text-lg text-slate-900 dark:text-white"
                                    placeholder="30"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="numeric"
                                    value={duration}
                                    onChangeText={setDuration}
                                />
                            </View>

                            {duration && parseInt(duration) > 0 && (
                                <View className="bg-teal-50 dark:bg-teal-950/30 rounded-2xl p-4 mb-6">
                                    <Text className="text-center text-gray-600 dark:text-gray-400 mb-1">
                                        Estimated Calories Burned
                                    </Text>
                                    <Text className="text-center text-3xl font-bold text-teal-600 dark:text-teal-400">
                                        {calculateCaloriesBurned(selectedActivity.met, parseInt(duration), userWeight)} cal
                                    </Text>
                                </View>
                            )}

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setSelectedActivity(null)}
                                    className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-2xl py-4"
                                >
                                    <Text className="text-center font-semibold text-slate-700 dark:text-slate-300">
                                        Back
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleLog}
                                    disabled={!duration || parseInt(duration) <= 0}
                                    className={`flex-1 rounded-2xl py-4 ${duration && parseInt(duration) > 0
                                            ? 'bg-teal-500'
                                            : 'bg-slate-300 dark:bg-slate-700'
                                        }`}
                                >
                                    <Text className="text-center font-semibold text-white">
                                        Log Activity
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    );
}
