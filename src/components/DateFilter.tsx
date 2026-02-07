import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DateFilterProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export const DateFilter = ({ selectedDate, onDateChange }: DateFilterProps) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (date: Date) => {
        return date.toDateString() === today.toDateString();
    };

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

    const [showPicker, setShowPicker] = useState(false);

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        onDateChange(newDate);
    };

    const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (date) {
            onDateChange(date);
        }
    };

    return (
        <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
            <View style={styles.pillContainer}>
                <TouchableOpacity
                    onPress={() => changeDate(-1)}
                    style={styles.arrowButton}
                >
                    <ChevronLeft size={20} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.dateDisplay}>
                    <Text style={styles.dateLabel}>{formatDateLabel(selectedDate)}</Text>
                    {!isToday(selectedDate) && (
                        <TouchableOpacity
                            onPress={() => onDateChange(new Date())}
                            style={styles.todayBadge}
                        >
                            <Text style={styles.todayBadgeText}>Back to Today</Text>
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => changeDate(1)}
                    style={styles.arrowButton}
                >
                    <ChevronRight size={20} color="#64748b" />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => setShowPicker(true)}
            >
                <CalendarIcon size={20} color="#0d9488" />
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: 'transparent',
    },
    pillContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 12,
    },
    arrowButton: {
        padding: 4,
    },
    dateDisplay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateLabel: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1e293b',
    },
    calendarButton: {
        width: 44,
        height: 44,
        backgroundColor: '#ccfbf1',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    todayBadge: {
        marginTop: 2,
        paddingHorizontal: 8,
        paddingVertical: 2,
        backgroundColor: '#0d9488',
        borderRadius: 10,
    },
    todayBadgeText: {
        fontSize: 10,
        color: 'white',
        fontWeight: '900',
    }
});
