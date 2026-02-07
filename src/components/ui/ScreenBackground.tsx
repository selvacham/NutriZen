import React from 'react';
import { View, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ScreenBackgroundProps extends ViewProps {
    children?: React.ReactNode;
}

export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({ children, className, style, ...props }) => {
    return (
        <View className={`flex-1 bg-slate-900 ${className}`} style={style} {...props}>
            <LinearGradient
                // Deep Teal/Slate Gradient: Slate-900 -> Teal-900 -> Teal-800
                colors={['#0f172a', '#134e4a', '#115e59']}
                locations={[0, 0.6, 1]}
                className="absolute w-full h-full"
            />
            {children}
        </View>
    );
};
