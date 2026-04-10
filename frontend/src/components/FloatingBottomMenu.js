import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
    useSharedValue, 
    useAnimatedStyle, 
    withSpring, 
    withTiming, 
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, User, Trophy, MessageCircle, LayoutGrid } from 'lucide-react-native';
import Theme from '../constants/Theme';

const { width } = Dimensions.get('window');

const MenuItem = ({ item, index, animation, onPress }) => {
    const mockPositions = [
        { x: -95, y: -25 }, // Profile (far left)
        { x: -45, y: -80 }, // Trophy (top left)
        { x: 45, y: -80 },  // Message (top right)
        { x: 95, y: -25 },  // Search (far right)
    ];
    
    const pos = mockPositions[index];

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: interpolate(animation.value, [0, 1], [0, pos.x]) },
                { translateY: interpolate(animation.value, [0, 1], [0, pos.y]) },
                { scale: animation.value },
            ],
            opacity: animation.value,
        };
    });

    return (
        <Animated.View style={[styles.itemCircle, animatedStyle]}>
            <TouchableOpacity 
                style={styles.itemTouch}
                onPress={() => onPress(item.screen)}
            >
                <item.icon color="#fff" size={24} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const FloatingBottomMenu = ({ navigation }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const animation = useSharedValue(0);

    const toggleMenu = React.useCallback(() => {
        setIsOpen(prev => {
            const nextValue = !prev;
            animation.value = withTiming(nextValue ? 1 : 0, {
                duration: nextValue ? 300 : 200,
            });
            return nextValue;
        });
    }, []);

    const closeMenu = React.useCallback(() => {
        animation.value = withTiming(0, {
            duration: 200,
        });
        setIsOpen(false);
    }, []);

    const navigateTo = React.useCallback((screen) => {
        requestAnimationFrame(() => {
            navigation.navigate(screen);
        });
        closeMenu();
    }, [navigation, closeMenu]);

    const mainButtonStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${interpolate(animation.value, [0, 1], [0, 45])}deg` },
                { scale: interpolate(animation.value, [0, 1], [1, 0.9]) }
            ],
        };
    });

    const displayItems = [
        { icon: User, screen: 'Profile' },
        { icon: Trophy, screen: 'Leaderboard' },
        { icon: MessageCircle, screen: 'Inbox' },
        { icon: Search, screen: 'Home' },
    ];

    return (
        <View style={styles.container} pointerEvents="box-none">
            {isOpen && (
                <TouchableOpacity 
                    style={StyleSheet.absoluteFill} 
                    onPress={closeMenu} 
                    activeOpacity={1} 
                />
            )}

            <View style={styles.menuWrapper} pointerEvents="box-none">
                {displayItems.map((item, index) => (
                    <MenuItem 
                        key={index} 
                        item={item} 
                        index={index} 
                        animation={animation} 
                        onPress={navigateTo} 
                    />
                ))}

                <Animated.View style={[styles.mainButtonContainer, mainButtonStyle]}>
                    <TouchableOpacity onPress={toggleMenu} activeOpacity={0.9}>
                        <LinearGradient
                            colors={Theme.colors.purpleGradient}
                            style={styles.mainButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <LayoutGrid color="#fff" size={32} />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 200,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: 30, // Adjusted for safe area if needed
        zIndex: 1000,
    },
    menuWrapper: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainButtonContainer: {
        width: 80, // Slightly larger to accommodate rotation without clipping
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    mainButton: {
        width: 64,
        height: 64,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '45deg' }],
        elevation: 10,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
        backgroundColor: Theme.colors.background, // Match background to prevent outline issues
    },
    itemCircle: {
        position: 'absolute',
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: Theme.colors.menuBg,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5,
    },
    itemTouch: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default FloatingBottomMenu;
