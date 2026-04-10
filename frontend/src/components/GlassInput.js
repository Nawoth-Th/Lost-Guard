import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import Theme from '../constants/Theme';

const GlassInput = ({ style, leftIcon, rightIcon, rightIconOnPress, ...props }) => {
    return (
        <View style={styles.container}>
            {leftIcon && (
                <View style={styles.leftIconContainer}>
                    {leftIcon}
                </View>
            )}
            <TextInput
                style={[styles.input, style]}
                placeholderTextColor={Theme.colors.textMuted}
                {...props}
            />
            {rightIcon && (
                <TouchableOpacity onPress={rightIconOnPress} style={styles.rightIconContainer}>
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
    leftIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: `${Theme.colors.primary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    rightIconContainer: {
        padding: 8,
    }
});

export default GlassInput;
