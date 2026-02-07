import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { Send, X, Trash2, MessageSquare, Sparkles, ChevronDown } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, SlideInDown, SlideOutDown, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/useAuthStore';
import { useAICoachStore, ChatMessage } from '../../store/useAICoachStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const QUICK_ASKS = [
    { label: "Daily Calories?", icon: "🔥" },
    { label: "Protein Ideas", icon: "🍳" },
    { label: "Am I on track?", icon: "📊" },
    { label: "Water goal?", icon: "💧" }
];

interface AICoachModalProps {
    visible: boolean;
    onClose: () => void;
}

export const AICoachModal = ({ visible, onClose }: AICoachModalProps) => {
    const { user } = useAuthStore();
    const { messages, loading, fetchMessages, sendMessage, clearMessages } = useAICoachStore();
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<ScrollView | null>(null);

    useEffect(() => {
        if (visible && user?.id) {
            fetchMessages(user.id);
        }
    }, [visible, user]);

    useEffect(() => {
        if (scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages, loading]);

    const handleSend = async (textOverride?: string) => {
        const text = (textOverride || inputText).trim();
        if (!text || !user?.id || loading) return;

        if (!textOverride) setInputText('');
        await sendMessage(text, user.id);
    };

    const handleClear = () => {
        if (user?.id) {
            clearMessages(user.id);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onClose}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.container}
                >
                    <Animated.View
                        entering={SlideInDown.springify().damping(20).mass(0.5).stiffness(100)}
                        exiting={SlideOutDown.duration(250)}
                        style={styles.sheet}
                    >
                        {/* Header */}
                        <LinearGradient
                            colors={['#14b8a6', '#0d9488']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.header}
                        >
                            <View style={styles.headerContent}>
                                <View style={styles.aiInfo}>
                                    <View style={styles.aiAvatar}>
                                        <Sparkles size={20} color="white" />
                                    </View>
                                    <View>
                                        <Text style={styles.headerTitle}>AI Coach</Text>
                                        <Text style={styles.headerSubtitle}>Live Assistant</Text>
                                    </View>
                                </View>
                                <View style={styles.headerActions}>
                                    <TouchableOpacity
                                        onPress={handleClear}
                                        style={styles.iconButton}
                                    >
                                        <Trash2 size={20} color="white" opacity={0.8} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={onClose}
                                        style={styles.iconButton}
                                    >
                                        <X size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </LinearGradient>

                        {/* Quick Asks */}
                        <View style={styles.quickAsksContainer}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.quickAsksScroll}
                            >
                                {QUICK_ASKS.map((ask) => (
                                    <TouchableOpacity
                                        key={ask.label}
                                        onPress={() => handleSend(ask.label)}
                                        style={styles.quickAskCard}
                                    >
                                        <Text style={styles.quickAskIcon}>{ask.icon}</Text>
                                        <Text style={styles.quickAskText}>{ask.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Chat Messages */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.messages}
                            contentContainerStyle={styles.messagesContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {messages.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyIcon}>
                                        <MessageSquare size={40} color="#94a3b8" />
                                    </View>
                                    <Text style={styles.emptyTitle}>How can I help you today?</Text>
                                    <Text style={styles.emptySubtitle}>
                                        Ask me about your diet, workouts, or track your progress live.
                                    </Text>
                                </View>
                            ) : (
                                messages.map((message, index) => (
                                    <MessageBubble key={message.id || index} message={message} />
                                ))
                            )}
                            {loading && (
                                <View style={styles.loadingBubble}>
                                    <View style={styles.thinkingDots}>
                                        <Text style={styles.loadingText}>Coaching...</Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Input Area */}
                        <View style={styles.inputArea}>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Type your message..."
                                    placeholderTextColor="#94a3b8"
                                    value={inputText}
                                    onChangeText={setInputText}
                                    multiline
                                    maxLength={500}
                                    editable={!loading}
                                />
                                <TouchableOpacity
                                    onPress={() => handleSend()}
                                    disabled={!inputText.trim() || loading}
                                    style={[
                                        styles.sendButton,
                                        (!inputText.trim() || loading) && styles.sendButtonDisabled
                                    ]}
                                >
                                    <Send size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';

    return (
        <Animated.View
            entering={FadeInDown.duration(300)}
            style={[
                styles.bubbleContainer,
                isUser ? styles.userBubbleContainer : styles.aiBubbleContainer
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.aiBubble
                ]}
            >
                <Text style={isUser ? styles.userText : styles.aiText}>
                    {message.content}
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    container: {
        maxHeight: SCREEN_HEIGHT * 0.85,
    },
    sheet: {
        backgroundColor: '#f8fafc',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
        height: '100%',
    },
    header: {
        paddingTop: 20,
        paddingBottom: 25,
        paddingHorizontal: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    aiInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    aiAvatar: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    quickAsksContainer: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
    },
    quickAsksScroll: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 10,
    },
    quickAskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    quickAskIcon: {
        fontSize: 16,
        marginRight: 8,
    },
    quickAskText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#64748b',
    },
    messages: {
        flex: 1,
    },
    messagesContent: {
        padding: 24,
        paddingBottom: 40,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        backgroundColor: '#f1f5f9',
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1e293b',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
    },
    bubbleContainer: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    userBubbleContainer: {
        justifyContent: 'flex-end',
    },
    aiBubbleContainer: {
        justifyContent: 'flex-start',
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        maxWidth: '85%',
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    userBubble: {
        backgroundColor: '#14b8a6',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 4,
    },
    userText: {
        color: 'white',
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '500',
    },
    aiText: {
        color: '#334155',
        fontSize: 15,
        lineHeight: 22,
    },
    loadingBubble: {
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
    },
    loadingText: {
        color: '#0d9488',
        fontSize: 13,
        fontWeight: 'bold',
    },
    inputArea: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderColor: '#f1f5f9',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#f1f5f9',
    },
    input: {
        flex: 1,
        color: '#1e293b',
        fontSize: 15,
        maxHeight: 100,
        paddingVertical: 8,
    },
    sendButton: {
        width: 44,
        height: 44,
        backgroundColor: '#14b8a6',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        shadowColor: '#14b8a6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    sendButtonDisabled: {
        backgroundColor: '#cbd5e1',
        shadowOpacity: 0,
    },
    thinkingDots: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});
