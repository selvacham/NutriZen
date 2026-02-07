import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { X, Plus, Sparkles, Trash2, CheckCircle2, Circle, ShoppingBasket } from 'lucide-react-native';
import { useGroceryStore, GroceryItem } from '../../store/useGroceryStore';
import { useNutritionStore } from '../../store/useNutritionStore';
import { generateGrocerySuggestions } from '../../services/visionService';
import Animated, { FadeInDown, FadeOutUp, Layout } from 'react-native-reanimated';

interface GroceryListModalProps {
    visible: boolean;
    onClose: () => void;
}

export function GroceryListModal({ visible, onClose }: GroceryListModalProps) {
    const { items, addItem, toggleItem, removeItem, clearBought } = useGroceryStore();
    const { dateLogs } = useNutritionStore();
    const [newItemName, setNewItemName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState('All');

    const categories = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Proteins', 'Grains', 'Snacks', 'Other'];

    const handleAddItem = () => {
        if (newItemName.trim()) {
            addItem(newItemName.trim());
            setNewItemName('');
        }
    };

    const handleAIItems = async () => {
        setIsGenerating(true);
        try {
            // Take last 20 logs for context
            const suggestions = await generateGrocerySuggestions(dateLogs.slice(0, 20));
            suggestions.forEach((item: any) => {
                // Check if item already exists
                const exists = items.find(i => i.name.toLowerCase() === item.name.toLowerCase());
                if (!exists) {
                    addItem(item.name, item.category, true);
                }
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const filteredItems = items.filter(item =>
        activeTab === 'All' || item.category === activeTab
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60 justify-end">
                <View className="bg-white dark:bg-slate-900 rounded-t-[40px] h-[90%] shadow-2xl overflow-hidden">
                    {/* Header Handle */}
                    <View className="items-center pt-3 pb-1">
                        <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 py-4">
                        <View>
                            <Text className="text-2xl font-black text-slate-900 dark:text-white">Grocery List</Text>
                            <Text className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Smart Shopping</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-10 h-10 items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full"
                        >
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {/* AI Generate Button */}
                    <View className="px-6 mb-4">
                        <TouchableOpacity
                            onPress={handleAIItems}
                            disabled={isGenerating}
                            className="bg-teal-500 rounded-2xl py-4 flex-row items-center justify-center shadow-lg shadow-teal-500/20 active:scale-95"
                        >
                            {isGenerating ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Sparkles size={20} color="white" className="mr-2" />
                                    <Text className="text-white font-black text-base ml-2">Generate AI Suggestions</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Add Item Input */}
                    <View className="px-6 mb-6">
                        <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 py-3 border border-slate-100 dark:border-slate-800">
                            <TextInput
                                className="flex-1 text-slate-900 dark:text-white font-bold text-lg"
                                placeholder="Add custom item..."
                                placeholderTextColor="#94a3b8"
                                value={newItemName}
                                onChangeText={setNewItemName}
                                onSubmitEditing={handleAddItem}
                            />
                            <TouchableOpacity
                                onPress={handleAddItem}
                                className="w-10 h-10 bg-teal-500/10 rounded-xl items-center justify-center"
                            >
                                <Plus size={24} color="#14b8a6" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Category Tabs */}
                    <View className="px-6 mb-6">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setActiveTab(cat)}
                                    className="px-6 py-2.5 rounded-2xl mr-3 border-2"
                                    style={
                                        activeTab === cat
                                            ? { backgroundColor: '#14b8a6', borderColor: '#14b8a6' }
                                            : { backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }
                                    }
                                >
                                    <Text className={`font-black text-sm ${activeTab === cat ? 'text-white' : 'text-slate-600'}`}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* List */}
                    <FlatList
                        data={filteredItems}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View className="items-center justify-center py-20">
                                <View className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center mb-6">
                                    <ShoppingBasket size={40} color="#94a3b8" />
                                </View>
                                <Text className="text-lg font-bold text-slate-900 dark:text-white mb-2">Your list is empty</Text>
                                <Text className="text-slate-500 dark:text-slate-400 text-center px-10">Add items manually or use AI to generate a list based on your diet.</Text>
                            </View>
                        )}
                        renderItem={({ item }) => (
                            <Animated.View
                                entering={FadeInDown}
                                exiting={FadeOutUp}
                                layout={Layout.springify()}
                                className="flex-row items-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-4 mb-3 border border-slate-100 dark:border-slate-800"
                            >
                                <TouchableOpacity
                                    onPress={() => toggleItem(item.id)}
                                    className="mr-4"
                                >
                                    {item.is_bought ? (
                                        <CheckCircle2 size={24} color="#14b8a6" fill="#14b8a620" />
                                    ) : (
                                        <Circle size={24} color="#cbd5e1" />
                                    )}
                                </TouchableOpacity>

                                <View className="flex-1">
                                    <Text className={`text-lg font-bold ${item.is_bought ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                                        {item.name}
                                    </Text>
                                    <View className="flex-row items-center gap-2 mt-0.5">
                                        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</Text>
                                        {item.suggested_by_ai && (
                                            <>
                                                <View className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                <View className="flex-row items-center">
                                                    <Sparkles size={8} color="#14b8a6" />
                                                    <Text className="text-[10px] font-black text-teal-600 dark:text-teal-400 uppercase tracking-widest ml-1">AI Suggestion</Text>
                                                </View>
                                            </>
                                        )}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => removeItem(item.id)}
                                    className="w-10 h-10 items-center justify-center"
                                >
                                    <Trash2 size={18} color="#f43f5e" />
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    />

                    {/* Footer Actions */}
                    {items.filter(i => i.is_bought).length > 0 && (
                        <View className="absolute bottom-10 left-6 right-6">
                            <TouchableOpacity
                                onPress={clearBought}
                                className="bg-rose-500 rounded-2xl py-4 items-center shadow-lg shadow-rose-500/20"
                            >
                                <Text className="text-white font-black text-base">Clear Bought Items</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}
