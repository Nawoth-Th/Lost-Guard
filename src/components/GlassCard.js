import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Theme from '../constants/Theme';

const GlassCard = ({ children, style }) => {
    return (
        <View style={[styles.container, style]}>
            <BlurView intensity={Theme.blur.intensity} tint={Theme.blur.tint} style={styles.blurContainer}>
                {children}
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: Theme.spacing.m,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
        backgroundColor: Theme.colors.glass,
    },
    blurContainer: {
        padding: Theme.spacing.m,
        width: '100%',
    },
});

export default GlassCard;
