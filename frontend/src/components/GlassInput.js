import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import Theme from '../constants/Theme';

const GlassInput = ({ style, rightIcon, rightIconOnPress, ...props }) => {
    return (
        <View style={styles.container}>
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor={Theme.colors.textMuted}
                {...props}
            />
            {rightIcon && (
                <TouchableOpacity onPress={rightIconOnPress} style={styles.iconContainer}>
                    {rightIcon}
                </TouchableOpacity>
            )}
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        color: Theme.colors.text,
        fontSize: Theme.fontSizes.m,
        height: 48,
        flex: 1,
    },
    iconContainer: {
        padding: 8,
    }
});

export default GlassInput;
