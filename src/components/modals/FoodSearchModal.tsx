import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { X, Search } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Food, searchFoods } from '../../utils/foodDatabase';

interface FoodSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectFood: (food: Food) => void;
}

export function FoodSearchModal({ visible, onClose, onSelectFood }: FoodSearchModalProps) {
    const { colorScheme } = useColorScheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<Food[]>(searchFoods(''));

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setResults(searchFoods(query));
    };

    const handleSelect = (food: Food) => {
        onSelectFood(food);
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
            <View className={`flex-1 bg-black/60 justify-end ${colorScheme === 'dark' ? 'dark' : ''}`}>
                <View className="bg-white dark:bg-slate-900 rounded-t-[40px] h-[85%] shadow-2xl overflow-hidden border-t border-slate-100 dark:border-slate-800">
                    {/* Header Handle */}
                    <View className="items-center pt-3 pb-1">
                        <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </View>

                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 py-4">
                        <Text className="text-2xl font-black text-slate-900 dark:text-white">Add Food</Text>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-10 h-10 items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full"
                        >
                            <X size={20} className="text-slate-500 dark:text-slate-400" />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="px-6 pb-4">
                        <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 py-3.5 border border-slate-100 dark:border-slate-800">
                            <Search size={20} className="text-slate-400 dark:text-slate-500" />
                            <TextInput
                                className="flex-1 ml-3 text-slate-900 dark:text-white font-bold text-base"
                                placeholder="Search healthy foods..."
                                placeholderTextColor="#94a3b8"
                                value={searchQuery}
                                onChangeText={handleSearch}
                            />
                        </View>
                    </View>

                    {/* Food List */}
                    <FlatList
                        data={results}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => handleSelect(item)}
                                className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-5 mb-4 border border-slate-100 dark:border-slate-800 active:scale-[0.98]"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-1">
                                        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">
                                            {item.name}
                                        </Text>
                                        <Text className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{item.servingSize}</Text>
                                    </View>
                                    <View className="bg-teal-50 dark:bg-teal-900/30 px-3 py-1.5 rounded-xl border border-teal-100/50 dark:border-teal-800/50">
                                        <Text className="text-teal-600 dark:text-teal-400 font-black text-sm">
                                            {item.calories} <Text className="text-[10px] font-bold">CAL</Text>
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between mt-1 bg-white/50 dark:bg-slate-900/40 p-3 rounded-2xl">
                                    <MacroItem label="Protein" value={`${item.protein}g`} color="text-teal-600 dark:text-teal-400" />
                                    <View className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800" />
                                    <MacroItem label="Carbs" value={`${item.carbs}g`} color="text-amber-600 dark:text-amber-400" />
                                    <View className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800" />
                                    <MacroItem label="Fats" value={`${item.fats}g`} color="text-rose-600 dark:text-rose-400" />
                                </View>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}

function MacroItem({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <View className="items-center flex-1">
            <Text className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase mb-0.5">{label}</Text>
            <Text className={`text-sm font-bold ${color}`}>{value}</Text>
        </View>
    );
}
