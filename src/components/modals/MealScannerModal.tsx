import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, Check, RefreshCw, Zap } from 'lucide-react-native';
import { analyzeMealImage, VisionResult } from '../../services/visionService';
import { useNutritionStore } from '../../store/useNutritionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

interface MealScannerModalProps {
    visible: boolean;
    onClose: () => void;
}

export const MealScannerModal = ({ visible, onClose }: MealScannerModalProps) => {
    const { user } = useAuthStore();
    const { addLog } = useNutritionStore();

    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<VisionResult | null>(null);

    const pickImage = async (useCamera: boolean) => {
        const permissionResult = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert(`Permission Required`, `You need to allow ${useCamera ? 'camera' : 'gallery'} access to scan meals.`);
            return;
        }

        const result = useCamera
            ? await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true,
            })
            : await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5,
                base64: true,
            });

        if (!result.canceled && result.assets[0].base64) {
            setImage(result.assets[0].uri);
            handleAnalyze(result.assets[0].base64);
        }
    };

    const handleAnalyze = async (base64: string) => {
        setIsAnalyzing(true);
        setResult(null);
        try {
            const data = await analyzeMealImage(base64);
            setResult(data);
        } catch (error) {
            Alert.alert('Analysis Failed', 'Could not identify food. Please try a clearer photo.');
            setImage(null);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirm = async () => {
        if (user?.id && result) {
            try {
                await addLog({
                    food_name: result.food_name,
                    calories: result.calories,
                    protein_g: result.protein_g,
                    carbs_g: result.carbs_g,
                    fats_g: result.fats_g,
                    meal_type: result.meal_type,
                    food_group: result.food_group,
                }, user.id);
                onClose();
                reset();
            } catch (error) {
                Alert.alert('Error', 'Failed to save meal log.');
            }
        }
    };

    const reset = () => {
        setImage(null);
        setResult(null);
        setIsAnalyzing(false);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/80 justify-end">
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={onClose}
                    className="absolute inset-0"
                />

                <Animated.View
                    entering={FadeInDown.duration(400)}
                    className="bg-white dark:bg-slate-900 rounded-t-[40px] p-8 w-full min-h-[50%]"
                >
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-8">
                        <View className="flex-row items-center">
                            <Zap size={24} color="#0d9488" fill="#0d9488" />
                            <Text className="text-2xl font-black text-slate-900 dark:text-white">AI Vision Scanner</Text>
                        </View>
                        <TouchableOpacity
                            onPress={onClose}
                            className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center"
                        >
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    {!image ? (
                        <View className="gap-4">
                            <TouchableOpacity
                                onPress={() => pickImage(true)}
                                className="bg-teal-500 flex-row items-center justify-center py-6 rounded-3xl shadow-lg shadow-teal-500/30 active:scale-95"
                            >
                                <Camera size={24} color="white" />
                                <Text className="text-white font-black text-lg">Take a Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => pickImage(false)}
                                className="bg-slate-100 dark:bg-slate-800 flex-row items-center justify-center py-6 rounded-3xl active:scale-95"
                            >
                                <ImageIcon size={24} color="#64748b" />
                                <Text className="text-slate-600 dark:text-slate-300 font-black text-lg">Choose from Gallery</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <View className="w-full aspect-[4/3] rounded-[32px] overflow-hidden bg-slate-100 dark:bg-slate-800 mb-6 relative">
                                <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                                {isAnalyzing && (
                                    <View className="absolute inset-0 bg-black/40 items-center justify-center">
                                        <ActivityIndicator size="large" color="#0d9488" />
                                        <Text className="text-white font-black mt-4 text-lg">Analyzing Plate...</Text>
                                    </View>
                                )}
                            </View>

                            {result && (
                                <Animated.View entering={FadeIn.duration(400)}>
                                    <View className="mb-6 p-6 bg-teal-50 dark:bg-teal-900/20 rounded-3xl border border-teal-100 dark:border-teal-900/30">
                                        <Text className="text-teal-900 dark:text-teal-200 font-black text-2xl mb-1">{result.food_name}</Text>
                                        <Text className="text-teal-600 dark:text-teal-400 font-bold text-sm uppercase mb-4">{result.meal_type}</Text>

                                        <View className="flex-row justify-between">
                                            <Nutrient label="Cals" value={result.calories} />
                                            <Nutrient label="Prot" value={result.protein_g} />
                                            <Nutrient label="Carbs" value={result.carbs_g} />
                                            <Nutrient label="Fats" value={result.fats_g} />
                                        </View>
                                    </View>

                                    <View className="flex-row gap-4">
                                        <TouchableOpacity
                                            onPress={reset}
                                            className="flex-1 bg-slate-100 dark:bg-slate-800 py-5 rounded-3xl items-center"
                                        >
                                            <RefreshCw size={20} color="#64748b" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleConfirm}
                                            className="flex-[3] bg-teal-500 py-5 rounded-3xl items-center flex-row justify-center shadow-lg shadow-teal-500/30"
                                        >
                                            <Check size={24} color="white" />
                                            <Text className="text-white font-black text-lg">Confirm & Log</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            )}
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
};

const Nutrient = ({ label, value }: { label: string; value: number }) => (
    <View className="items-center">
        <Text className="text-teal-900 dark:text-white font-black text-lg">{Math.round(value)}</Text>
        <Text className="text-[10px] text-teal-600 dark:text-teal-400 font-black uppercase">{label}</Text>
    </View>
);
