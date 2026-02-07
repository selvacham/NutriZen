import React from 'react';
import { View, Modal, StyleSheet, Platform, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Animated, { FadeIn } from 'react-native-reanimated';

interface GlassyCalendarModalProps {
    visible: boolean;
    onClose: () => void;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export function GlassyCalendarModal({ visible, onClose, selectedDate, onDateChange }: GlassyCalendarModalProps) {
    const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
        if (event.type === 'set' && date) {
            onDateChange(date);
            onClose();
        } else if (event.type === 'dismissed') {
            onClose();
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Pressable style={styles.overlay} onPress={onClose}>
                    <BlurView intensity={30} style={StyleSheet.absoluteFill} tint="dark" />
                </Pressable>

                <Animated.View
                    entering={FadeIn.duration(200)}
                    style={styles.content}
                >
                    <BlurView intensity={80} tint="light" style={styles.blurContent}>
                        <View className="p-4 items-center justify-center">
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                                onChange={handleDateChange}
                                maximumDate={new Date()}
                                themeVariant="light"
                                accentColor="#14b8a6"
                            />
                        </View>
                    </BlurView>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        width: Platform.OS === 'ios' ? '85%' : 'auto',
        backgroundColor: 'transparent',
        borderRadius: 32,
        overflow: 'hidden',
    },
    blurContent: {
        borderRadius: 32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.5)',
    },
});
