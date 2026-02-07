import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, useColorScheme } from 'react-native';
import { Utensils, Dumbbell, Scale, Droplets, Footprints, Moon, ChevronRight, X, Sparkles } from 'lucide-react-native';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';

interface QuickActionModalProps {
    visible: boolean;
    onClose: () => void;
    onAction: (action: string) => void;
}

const actions = [
    { id: 'food', label: 'Food', icon: Utensils, color: '#f97316' },
    { id: 'workout', label: 'Workout', icon: Dumbbell, color: '#ec4899' },
    { id: 'weight', label: 'Weight', icon: Scale, color: '#0d9488' },
    { id: 'water', label: 'Water', icon: Droplets, color: '#3b82f6' },
    { id: 'steps', label: 'Steps', icon: Footprints, color: '#8b5cf6' },
    { id: 'sleep', label: 'Sleep', icon: Moon, color: '#0f172a' },
    { id: 'ai-coach', label: 'AI Coach', icon: Sparkles, color: '#14b8a6' },
];

export const QuickActionModal = ({ visible, onClose, onAction }: QuickActionModalProps) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View
                    entering={SlideInDown.duration(300)}
                    style={[styles.sheet, isDark && styles.sheetDark]}
                >
                    <View style={styles.header}>
                        <Text style={[styles.title, isDark && styles.titleDark]}>What Would You Like to Track?</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color={isDark ? "#94a3b8" : "#64748b"} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionsContainer}>
                        {actions.map((action, index) => (
                            <Animated.View
                                key={action.id}
                                entering={FadeInDown.delay(index * 30).duration(300)}
                            >
                                <TouchableOpacity
                                    style={styles.actionItem}
                                    onPress={() => {
                                        onAction(action.id);
                                        onClose();
                                    }}
                                >
                                    <View style={styles.actionLeft}>
                                        <View style={[styles.iconContainer, isDark && styles.iconContainerDark, { borderColor: action.color }]}>
                                            <action.icon size={24} color={action.color} />
                                        </View>
                                        <Text style={[styles.actionLabel, isDark && styles.actionLabelDark]}>{action.label}</Text>
                                    </View>
                                    <ChevronRight size={20} color={isDark ? "#475569" : "#cbd5e1"} />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    closeButton: {
        padding: 4,
    },
    actionsContainer: {
        gap: 16,
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    actionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    sheetDark: {
        backgroundColor: '#0f172a',
    },
    titleDark: {
        color: '#f8fafc',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    iconContainerDark: {
        backgroundColor: '#1e293b',
    },
    actionLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#0f172a',
    },
    actionLabelDark: {
        color: '#f8fafc',
    },
});
