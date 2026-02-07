import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Badge } from '../store/useGamificationStore';

interface BadgeCardProps {
    badge: Badge;
}

export const BadgeCard = ({ badge }: BadgeCardProps) => {
    const isUnlocked = !!badge.unlockedAt;

    return (
        <View className={`w-[110px] items-center p-4 rounded-3xl mb-4 mr-2 border ${isUnlocked
                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20'
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800'
            }`}>
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-3 ${isUnlocked ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-200 dark:bg-slate-800'
                }`}>
                <Text style={{ fontSize: 24, opacity: isUnlocked ? 1 : 0.3 }}>
                    {badge.icon}
                </Text>
            </View>
            <Text
                className={`text-[10px] font-black uppercase text-center tracking-tighter ${isUnlocked ? 'text-amber-700 dark:text-amber-500' : 'text-slate-400'
                    }`}
                numberOfLines={1}
            >
                {badge.title}
            </Text>
            {isUnlocked && (
                <View className="mt-1 bg-amber-500 w-1 h-1 rounded-full" />
            )}
        </View>
    );
};
