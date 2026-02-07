import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Calendar as CalendarIcon, ChevronDown, RotateCcw } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { GlassyCalendarModal } from './modals/GlassyCalendarModal';

interface DateFilterProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export const DateFilter = ({ selectedDate, onDateChange }: DateFilterProps) => {
    const [showModal, setShowModal] = useState(false);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (date: Date) => date.toDateString() === today.toDateString();

    const isYesterday = (date: Date) => {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return date.toDateString() === yesterday.toDateString();
    };

    const formatDateLabel = (date: Date) => {
        if (isToday(date)) return 'Today';
        if (isYesterday(date)) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
            <View style={styles.wrapper}>
                <TouchableOpacity
                    onPress={() => setShowModal(true)}
                    activeOpacity={0.8}
                    style={styles.trigger}
                >
                    <BlurView intensity={40} tint="light" style={styles.blurTrigger}>
                        <View className="flex-row items-center px-6 py-3">
                            <CalendarIcon size={18} color="#0d9488" className="mr-3" />
                            <Text style={styles.dateText}>{formatDateLabel(selectedDate)}</Text>
                            <ChevronDown size={18} color="#64748b" className="ml-2" />
                        </View>
                    </BlurView>
                </TouchableOpacity>

                {!isToday(selectedDate) && (
                    <TouchableOpacity
                        onPress={() => onDateChange(new Date())}
                        activeOpacity={0.7}
                        style={styles.todayButton}
                    >
                        <BlurView intensity={30} tint="light" style={styles.blurToday}>
                            <View className="flex-row items-center px-4 py-3">
                                <RotateCcw size={16} color="#0d9488" />
                            </View>
                        </BlurView>
                    </TouchableOpacity>
                )}
            </View>

            <GlassyCalendarModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                selectedDate={selectedDate}
                onDateChange={(date) => {
                    onDateChange(date);
                    if (Platform.OS === 'ios') {
                        // Keep open on iOS until confirmed or closed
                    } else {
                        setShowModal(false);
                    }
                }}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        zIndex: 100,
    },
    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    trigger: {
        flex: 1,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    blurTrigger: {
        width: '100%',
    },
    dateText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1e293b',
        flex: 1,
    },
    todayButton: {
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    blurToday: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
