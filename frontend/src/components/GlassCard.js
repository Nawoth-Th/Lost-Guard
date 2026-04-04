import React from 'react';
import { StyleSheet, View } from 'react-native';
import Theme from '../constants/Theme';

const GlassCard = ({ children, style }) => {
    return (
        <View style={[styles.container, style]}>
            <View style={styles.innerContainer}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: Theme.spacing.m,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    innerContainer: {
        padding: Theme.spacing.m,
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
});

export default GlassCard;
