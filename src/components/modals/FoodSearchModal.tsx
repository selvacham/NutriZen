import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    FlatList,
    ScrollView,
    StyleSheet,
    Pressable,
} from 'react-native';
import { X, Search } from 'lucide-react-native';
import { Food, searchFoods } from '../../utils/foodDatabase';

interface FoodSearchModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectFood: (food: Food) => void;
    initialMealType?: string;
}

export function FoodSearchModal({ visible, onClose, onSelectFood, initialMealType }: FoodSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<Food[]>(searchFoods(''));
    const [selectedFood, setSelectedFood] = useState<Food | null>(null);
    const [manualGroup, setManualGroup] = useState<string>('');
    const [manualMealType, setManualMealType] = useState<string>('');
    const [activeTab, setActiveTab] = useState('All');

    React.useEffect(() => {
        if (visible) {
            if (initialMealType) {
                const formattedMealType = initialMealType.charAt(0).toUpperCase() + initialMealType.slice(1);
                setManualMealType(formattedMealType);
                setActiveTab(formattedMealType);
                filterFoods('', formattedMealType);
            } else {
                setManualMealType('Breakfast');
                setActiveTab('All');
                filterFoods('', 'All');
            }
        }
    }, [visible, initialMealType]);

    const foodGroups = ['Proteins', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Fats', 'Snacks', 'Beverages'];
    const mealTabs = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'];

    const filterFoods = (query: string, tab: string) => {
        let results = searchFoods(query);
        if (tab !== 'All') {
            const tabLower = tab.toLowerCase().replace('snacks', 'snack');
            results = results.filter(f => f.category === tabLower);
        }
        setResults(results);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        filterFoods(query, activeTab);
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        filterFoods(searchQuery, tab);
    };

    const handleSelect = (food: Food) => {
        setSelectedFood(food);
        setManualGroup(food.foodGroup);
        if (!manualMealType) {
            setManualMealType(
                food.category.charAt(0).toUpperCase() +
                food.category.slice(1).replace('snack', 'snacks')
            );
        }
    };

    const handleLog = () => {
        if (!selectedFood) return;

        const category = manualMealType.toLowerCase().startsWith('snack')
            ? 'snack'
            : manualMealType.toLowerCase();

        onSelectFood({
            ...selectedFood,
            foodGroup: manualGroup as any,
            category: category as any
        });
        setSelectedFood(null);
        setSearchQuery('');
        setManualMealType('');
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60 justify-end">
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
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {!selectedFood ? (
                        <>
                            {/* Category Tabs */}
                            <View className="px-6 mb-4">
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    className="flex-row"
                                >
                                    {mealTabs.map((tab) => (
                                        <TouchableOpacity
                                            key={tab}
                                            onPress={() => handleTabChange(tab)}
                                            className="px-8 py-3 rounded-2xl mr-3 border-2"
                                            style={[
                                                activeTab === tab
                                                    ? { backgroundColor: '#14b8a6', borderColor: '#14b8a6' }
                                                    : { backgroundColor: '#f8fafc', borderColor: '#f1f5f9' }
                                            ]}
                                        >
                                            <Text className={`font-black text-sm ${activeTab === tab ? 'text-white' : 'text-slate-600'}`}>
                                                {tab}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Search Bar */}
                            <View className="px-6 pb-6">
                                <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 py-4 border border-slate-100 dark:border-slate-800">
                                    <Search size={22} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 ml-3 text-slate-900 dark:text-white font-bold text-lg"
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
                                                <View className="flex-row items-center gap-2">
                                                    <Text className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{item.servingSize}</Text>
                                                    <View className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                    <Text className="text-xs text-teal-600 dark:text-teal-400 font-bold">{item.foodGroup}</Text>
                                                </View>
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
                        </>
                    ) : (
                        <ScrollView className="flex-1 px-6 pt-2">
                            <View className="items-center mb-8">
                                <View className="w-20 h-20 bg-teal-50 dark:bg-teal-900/30 rounded-[30px] items-center justify-center mb-4">
                                    <Text className="text-4xl text-teal-600 dark:text-teal-400">🥗</Text>
                                </View>
                                <Text className="text-3xl font-black text-slate-900 dark:text-white text-center mb-1">
                                    {selectedFood.name}
                                </Text>
                                <Text className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    {selectedFood.servingSize} • {selectedFood.calories} Calories
                                </Text>
                            </View>

                            {/* Macro Breakdown */}
                            <View className="flex-row justify-between bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-6 mb-8 border border-slate-100 dark:border-slate-800">
                                <View className="items-center flex-1">
                                    <Text className="text-xs text-slate-400 font-black uppercase mb-1">Protein</Text>
                                    <Text className="text-xl font-black text-teal-600 dark:text-teal-400">{selectedFood.protein}g</Text>
                                </View>
                                <View className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 self-center" />
                                <View className="items-center flex-1">
                                    <Text className="text-xs text-slate-400 font-black uppercase mb-1">Carbs</Text>
                                    <Text className="text-xl font-black text-amber-600 dark:text-amber-400">{selectedFood.carbs}g</Text>
                                </View>
                                <View className="w-[1px] h-8 bg-slate-200 dark:bg-slate-800 self-center" />
                                <View className="items-center flex-1">
                                    <Text className="text-xs text-slate-400 font-black uppercase mb-1">Fats</Text>
                                    <Text className="text-xl font-black text-rose-600 dark:text-rose-400">{selectedFood.fats}g</Text>
                                </View>
                            </View>

                            {/* Meal Type Selection - FIXED */}
                            <View className="mb-6">
                                <Text className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 ml-1">Log as Meal Type</Text>
                                <View style={styles.tabContainer}>
                                    {mealTabs.filter(t => t !== 'All').map((tab) => (
                                        <TouchableOpacity
                                            key={tab}
                                            onPress={() => setManualMealType(tab)}
                                            activeOpacity={0.7}
                                            style={[
                                                styles.tabButton,
                                                manualMealType === tab ? styles.tabButtonActive : styles.tabButtonInactive
                                            ]}
                                        >
                                            <Text style={[
                                                styles.tabText,
                                                manualMealType === tab ? styles.tabTextActive : styles.tabTextInactive
                                            ]}>
                                                {tab}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Group Selection - FIXED */}
                            <View className="mb-8">
                                <Text className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 ml-1">Select Food Group</Text>
                                <View style={styles.tabContainer}>
                                    {foodGroups.map((group) => (
                                        <TouchableOpacity
                                            key={group}
                                            onPress={() => setManualGroup(group)}
                                            activeOpacity={0.7}
                                            style={[
                                                styles.tabButton,
                                                manualGroup === group ? styles.tabButtonActive : styles.tabButtonInactive
                                            ]}
                                        >
                                            <Text style={[
                                                styles.tabText,
                                                manualGroup === group ? styles.tabTextActive : styles.tabTextInactive
                                            ]}>
                                                {group}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Action Buttons */}
                            <View className="flex-row gap-4 mb-10">
                                <TouchableOpacity
                                    onPress={() => setSelectedFood(null)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-3xl py-5 active:scale-95"
                                >
                                    <Text className="text-center font-bold text-slate-600 dark:text-slate-300">Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleLog}
                                    className="flex-[2] bg-teal-500 rounded-3xl py-5 shadow-lg shadow-teal-500/20 active:scale-95"
                                >
                                    <Text className="text-center font-black text-white text-lg">Log Food</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
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

// FIXED StyleSheet - Replaces problematic NativeWind shadow classes
const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tabButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 2,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonActive: {
        backgroundColor: '#14b8a6',
        borderColor: '#14b8a6',
        shadowColor: '#14b8a6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    tabButtonInactive: {
        backgroundColor: '#f8fafc',
        borderColor: '#e2e8f0',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
    },
    tabTextActive: {
        color: 'white',
        fontWeight: '900',
    },
    tabTextInactive: {
        color: '#64748b',
    },
});
