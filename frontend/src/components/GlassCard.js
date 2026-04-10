import { StyleSheet, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Theme from '../constants/Theme';

const GlassCard = ({ children, style, priority = 'low' }) => {
    // Optimization: BlurView on Android is heavy in lists. 
    // We only use full blur for 'high' priority items on Android.
    const shouldBlur = Platform.OS === 'ios' || priority === 'high';

    if (!shouldBlur) {
        return (
            <View style={[styles.container, styles.fallbackContainer, style]}>
                {children}
            </View>
        );
    }

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
    fallbackContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
});

export default GlassCard;
