import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, ChevronLeft } from 'lucide-react-native';
import Theme from '../constants/Theme';

const FloatingHeader = ({ 
    title = "Lost Guard", 
    greeting, 
    onPlusPress, 
    showBack = false, 
    onBackPress, 
    showPlus = true,
    centerTitle = false,
    titleIcon = null,
    plusVariant = 'premium',
    rightIcon = null,
    onRightPress = null
}) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const handleRightPress = onRightPress || onPlusPress;

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
            <View style={styles.content} pointerEvents="box-none">
                {/* Left Section */}
                <View style={styles.leftContainer}>
                    {showBack ? (
                        <TouchableOpacity onPress={onBackPress || (() => navigation.goBack())} style={styles.sideButton}>
                            <ChevronLeft color={Theme.colors.text} size={28} />
                        </TouchableOpacity>
                    ) : !centerTitle ? (
                        <View>
                            {greeting && <Text style={styles.greeting}>{greeting}</Text>}
                            <Text style={styles.title}>{title}</Text>
                        </View>
                    ) : (
                        <View style={styles.placeholder} />
                    )}
                </View>

                {/* Center Section (Absolute Centered) */}
                {centerTitle && (
                    <View style={styles.centerContainer}>
                        {titleIcon && <View style={styles.iconWrapper}>{titleIcon}</View>}
                        <Text style={styles.title}>{title}</Text>
                    </View>
                )}
                
                {/* Right Section */}
                <View style={styles.rightContainer}>
                    {rightIcon ? (
                        <TouchableOpacity onPress={handleRightPress} style={styles.sideButton}>
                            {rightIcon}
                        </TouchableOpacity>
                    ) : showPlus ? (
                        <TouchableOpacity 
                            style={[styles.plusButton, plusVariant === 'dashboard' && styles.dashboardPlusButton]}
                            onPress={handleRightPress}
                            activeOpacity={0.8}
                        >
                            {plusVariant === 'dashboard' ? (
                                <Plus color={Theme.colors.primary} size={24} />
                            ) : (
                                <LinearGradient
                                    colors={Theme.colors.purpleGradient}
                                    style={styles.plusGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Plus color="#fff" size={24} />
                                </LinearGradient>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.placeholder} />
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingHorizontal: Theme.spacing.l,
        backgroundColor: 'transparent',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        height: 60,
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 44,
    },
    centerContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1,
    },
    rightContainer: {
        alignItems: 'flex-end',
        minWidth: 44,
    },
    placeholder: {
        width: 44,
    },
    sideButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 22,
    },
    iconWrapper: {
        marginRight: 8,
    },
    greeting: {
        color: Theme.colors.textMuted,
        fontSize: 14,
        marginBottom: 2,
    },
    title: {
        color: Theme.colors.text,
        fontSize: 24, // Slightly smaller for better fit when centered
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    plusButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        elevation: 8,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    dashboardPlusButton: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
    },
    plusGradient: {
        flex: 1,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default FloatingHeader;
