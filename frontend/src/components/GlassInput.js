import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Theme from '../constants/Theme';

const GlassInput = ({ style, ...props }) => {
    return (
        <View style={styles.container}>
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor={Theme.colors.textMuted}
                {...props}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: Theme.colors.glass,
        borderRadius: Theme.spacing.s,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
        marginBottom: Theme.spacing.m,
        paddingHorizontal: Theme.spacing.m,
        paddingVertical: Theme.spacing.s,
    },
    input: {
        color: Theme.colors.text,
        fontSize: Theme.fontSizes.m,
        height: 48,
    },
});

export default GlassInput;
