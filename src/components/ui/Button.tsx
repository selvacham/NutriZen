import React from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    textClassName?: string;
}

export function Button({ title, variant = 'primary', size = 'md', loading, className, textClassName, ...props }: ButtonProps) {
    const variants = {
        primary: 'bg-teal-500',
        secondary: 'bg-emerald-500',
        outline: 'border border-teal-500 bg-transparent',
        ghost: 'bg-transparent',
    };

    const textVariants = {
        primary: 'text-white',
        secondary: 'text-white',
        outline: 'text-teal-500',
        ghost: 'text-slate-600 dark:text-slate-400',
    };

    const sizes = {
        sm: 'px-3 py-1.5 rounded-xl',
        md: 'px-5 py-3 rounded-2xl',
        lg: 'px-8 py-4 rounded-3xl',
    };

    const textSizes = {
        sm: 'text-sm font-medium',
        md: 'text-base font-semibold',
        lg: 'text-lg font-bold',
    };

    return (
        <TouchableOpacity
            className={cn(
                'items-center justify-center flex-row',
                variants[variant],
                sizes[size],
                props.disabled || loading ? 'opacity-50' : 'opacity-100',
                className
            )}
            activeOpacity={0.8}
            {...props}
        >
            <Text className={cn(textVariants[variant], textSizes[size], textClassName)}>
                {loading ? 'Processing...' : title}
            </Text>
        </TouchableOpacity>
    );
}
