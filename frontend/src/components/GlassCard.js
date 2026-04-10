import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Theme from '../constants/Theme';

const GlassCard = ({ children, style }) => {
    return (
        <BlurView
            intensity={StyleSheet.flatten(style)?.blurIntensity || Theme.blur.intensity}
            tint={StyleSheet.flatten(style)?.blurTint || Theme.blur.tint}
            style={[styles.container, style]}
        >
            {children}
        </BlurView>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: Theme.spacing.m,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
        backgroundColor: Theme.colors.glass,
        padding: Theme.spacing.m,
        width: '100%',
        overflow: 'hidden',
    },
});

export default GlassCard;
