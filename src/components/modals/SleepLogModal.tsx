import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { X, Moon, Star } from 'lucide-react-native';
import { useSleepStore } from '../../store/useSleepStore';

interface SleepLogModalProps {
    visible: boolean;
    onClose: () => void;
    userId: string;
}

export const SleepLogModal = ({ visible, onClose, userId }: SleepLogModalProps) => {
    const { addLog, loading } = useSleepStore();
    const [duration, setDuration] = useState('');
    const [quality, setQuality] = useState<'Excellent' | 'Good' | 'Fair' | 'Poor'>('Good');
    const [notes, setNotes] = useState('');

    const handleSave = async () => {
        if (!duration) return;

        try {
            await addLog({
                duration_minutes: parseFloat(duration) * 60,
                quality,
                notes,
            }, userId);
            onClose();
            setDuration('');
            setNotes('');
            setQuality('Good');
        } catch (error) {
            console.error('Failed to save sleep log:', error);
            alert('Failed to save sleep log');
        }
    };

    const qualityOptions: ('Excellent' | 'Good' | 'Fair' | 'Poor')[] = ['Excellent', 'Good', 'Fair', 'Poor'];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Log Sleep</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        {/* Duration Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Duration (hours)</Text>
                            <View style={styles.inputContainer}>
                                <Moon size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 7.5"
                                    keyboardType="numeric"
                                    value={duration}
                                    onChangeText={setDuration}
                                />
                            </View>
                        </View>

                        {/* Quality Selection */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Quality</Text>
                            <View style={styles.qualityContainer}>
                                {qualityOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.qualityOption,
                                            quality === option && styles.qualityOptionSelected
                                        ]}
                                        onPress={() => setQuality(option)}
                                    >
                                        <Text style={[
                                            styles.qualityText,
                                            quality === option && styles.qualityTextSelected
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Notes Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Notes (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="How did you feel upon waking up?"
                                multiline
                                numberOfLines={3}
                                value={notes}
                                onChangeText={setNotes}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            <Text style={styles.saveButtonText}>
                                {loading ? 'Saving...' : 'Save Sleep Log'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    closeButton: {
        padding: 4,
    },
    form: {
        gap: 20,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 16,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 16,
        fontSize: 16,
        color: '#0f172a',
    },
    textArea: {
        backgroundColor: '#f1f5f9',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 100,
        textAlignVertical: 'top',
    },
    qualityContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    qualityOption: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    qualityOptionSelected: {
        backgroundColor: '#f0fdfa',
        borderColor: '#14b8a6',
    },
    qualityText: {
        fontSize: 14,
        color: '#64748b',
        fontWeight: '500',
    },
    qualityTextSelected: {
        color: '#0d9488',
        fontWeight: '600',
    },
    saveButton: {
        backgroundColor: '#14b8a6',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
