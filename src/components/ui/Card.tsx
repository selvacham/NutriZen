import React from 'react';
import { View, ViewProps, TouchableOpacity } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends ViewProps {
    onPress?: () => void;
    variant?: 'default' | 'outline' | 'glass';
}

export function Card({ className, children, onPress, variant = 'default', ...props }: CardProps) {
    const variants = {
        default: 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm',
        outline: 'bg-transparent border-slate-200 dark:border-slate-700',
        glass: 'bg-white/10 dark:bg-slate-900/10 backdrop-blur-md border-white/20 dark:border-slate-800/20',
    };

    const combinedClassName = cn(
        'rounded-3xl border p-4',
        variants[variant],
        className
    );

    if (onPress) {
        return (
            <TouchableOpacity
                className={combinedClassName}
                onPress={onPress}
                activeOpacity={0.7}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View
            className={combinedClassName}
            {...props}
        >
            {children}
        </View>
    );
}
