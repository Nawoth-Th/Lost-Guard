import React from 'react';
import { StyleSheet, View } from 'react-native';
import Theme from '../constants/Theme';

const GlassCard = ({ children, style }) => {
    return (
        <View style={[styles.container, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: Theme.spacing.m,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        padding: Theme.spacing.m,
        width: '100%',
    },
});

export default GlassCard;
