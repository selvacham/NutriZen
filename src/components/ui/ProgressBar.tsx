import React from 'react';
import { View } from 'react-native';

interface ProgressBarProps {
    progress: number; // 0 to 1
    color?: string;
}

export function ProgressBar({ progress, color = '#2DD4BF' }: ProgressBarProps) {
    return (
        <View className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <View
                style={{
                    width: `${progress * 100}%`,
                    backgroundColor: color,
                    height: '100%',
                    borderRadius: 9999,
                }}
            />
        </View>
    );
}
