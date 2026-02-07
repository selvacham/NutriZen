import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useAICoachStore, ChatMessage } from '../../src/store/useAICoachStore';

export default function AICoachScreen() {
    const { user } = useAuthStore();
    const { messages, loading, fetchMessages, sendMessage } = useAICoachStore();
    const [inputText, setInputText] = useState('');
    const scrollViewRef = useRef<any>(null);

    useEffect(() => {
        if (user?.id) {
            fetchMessages(user.id);
        }
    }, [user]);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || !user?.id || loading) return;

        const text = inputText.trim();
        setInputText('');
        await sendMessage(text, user.id);
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-950" edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={0}
            >
                {/* Header */}
                <View className="px-5 py-6 border-b border-slate-200 dark:border-slate-800">
                    <View className="flex-row items-center">
                        <View className="w-12 h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full items-center justify-center mr-3">
                            <Text className="text-2xl">🤖</Text>
                        </View>
                        <View>
                            <Text className="text-xl font-bold text-slate-900 dark:text-white">AI Coach</Text>
                            <Text className="text-sm text-gray-500">Your personal nutrition assistant</Text>
                        </View>
                    </View>
                </View>

                {/* Messages */}
                <Animated.ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-5"
                    contentContainerStyle={{ paddingVertical: 20 }}
                    showsVerticalScrollIndicator={false}
                    entering={FadeInDown.duration(500)}
                >
                    {messages.length === 0 ? (
                        <Animated.View
                            entering={FadeInDown.delay(200).duration(500)}
                            className="flex-1 items-center justify-center py-12"
                        >
                            <Text className="text-6xl mb-4">💬</Text>
                            <Text className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Start a conversation</Text>
                            <Text className="text-gray-500 text-center px-8">
                                Ask me anything about nutrition, workouts, or your progress!
                            </Text>
                        </Animated.View>
                    ) : (
                        messages.map((message, index) => (
                            <Animated.View
                                key={message.id || index}
                                entering={FadeInUp.springify()}
                            >
                                <MessageBubble message={message} />
                            </Animated.View>
                        ))
                    )}
                    {loading && (
                        <Animated.View
                            entering={FadeInUp.springify()}
                            className="flex-row items-center mb-4"
                        >
                            <View className="bg-slate-100 dark:bg-slate-900 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
                                <Text className="text-slate-600 dark:text-slate-400">Thinking...</Text>
                            </View>
                        </Animated.View>
                    )}
                </Animated.ScrollView>

                {/* Input */}
                <View className="px-5 py-4 border-t border-slate-200 dark:border-slate-800">
                    <View className="flex-row items-center bg-slate-100 dark:bg-slate-900 rounded-2xl px-4 py-2">
                        <TextInput
                            className="flex-1 text-slate-900 dark:text-white py-2"
                            placeholder="Ask me anything..."
                            placeholderTextColor="#94a3b8"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={!inputText.trim() || loading}
                            className={`ml-2 w-10 h-10 rounded-full items-center justify-center ${inputText.trim() && !loading ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                        >
                            <Send size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === 'user';

    return (
        <View className={`flex-row mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <View
                className={`rounded-2xl px-4 py-3 max-w-[80%] ${isUser
                    ? 'bg-teal-500 rounded-br-sm'
                    : 'bg-slate-100 dark:bg-slate-900 rounded-bl-sm'
                    }`}
            >
                <Text className={isUser ? 'text-white' : 'text-slate-900 dark:text-white'}>
                    {message.content}
                </Text>
            </View>
        </View>
    );
}
