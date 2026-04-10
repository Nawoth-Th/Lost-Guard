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

const FloatingBottomMenu = ({ navigation }) => {
    const [isOpen, setIsOpen] = useState(false);
    const animation = useSharedValue(0);

    const toggleMenu = () => {
        const toValue = isOpen ? 0 : 1;
        animation.value = withSpring(toValue, {
            damping: 12,
            stiffness: 100,
        });
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        animation.value = withSpring(0);
        setIsOpen(false);
    };

    const navigateTo = (screen) => {
        closeMenu();
        navigation.navigate(screen);
    };

    const mainButtonStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${interpolate(animation.value, [0, 1], [0, 45])}deg` },
                { scale: interpolate(animation.value, [0, 1], [1, 0.9]) }
            ],
        };
    });

    const getItemStyle = (index) => {
        // Position items in an arc
        // 0: Trophy, 1: Message, 2: Profile, 3: Search
        // Angles: 210, 250, 290, 330 (degrees) - wait, that's downwards.
        // Let's use 150, 130, 110, 90 or similar for upwards arc.
        
        // Actually, let's just use fixed offsets for simplicity and precise control like the mockup
        const positions = [
            { x: -70, y: -70 }, // Trophy (Top Left)
            { x: -30, y: -110 }, // Inbox (Top Mid Left)
            { x: 30, y: -110 },  // Profile (Top Mid Right)
            { x: 70, y: -70 },  // Search (Top Right)
        ];

        // Adjusted positions based on mockup:
        // Trophy is top left of the diamond.
        // Message is top right of the diamond.
        // Profile is far left.
        // Search is far right.
        const mockPositions = [
            { x: -45, y: -80 }, // Trophy
            { x: 45, y: -80 },  // Message
            { x: -95, y: -25 }, // Profile
            { x: 95, y: -25 },  // Search
        ];
        
        const pos = mockPositions[index];

        return useAnimatedStyle(() => {
            return {
                transform: [
                    { translateX: interpolate(animation.value, [0, 1], [0, pos.x]) },
                    { translateY: interpolate(animation.value, [0, 1], [0, pos.y]) },
                    { scale: animation.value },
                ],
                opacity: animation.value,
            };
        });
    };

    const menuItems = [
        { icon: User, screen: 'Profile', color: '#6366f1' },
        { icon: Trophy, screen: 'Leaderboard', color: '#6366f1' },
        { icon: MessageCircle, screen: 'Inbox', color: '#6366f1' },
        { icon: Search, screen: 'Home', color: '#6366f1' }, // Search is on Home
    ];

    // Re-ordering to match mockup positions in the loop
    // index 0: Profile (far left)
    // index 1: Trophy (top left)
    // index 2: Inbox (top right)
    // index 3: Search (far right)
    const displayItems = [
        { icon: User, screen: 'Profile' },
        { icon: Trophy, screen: 'Leaderboard' },
        { icon: MessageCircle, screen: 'Inbox' },
        { icon: Search, screen: 'Home' },
    ];

    return (
        <View style={styles.container} pointerEvents="box-none">
            {/* Backdrop to close menu when open */}
            {isOpen && (
                <TouchableOpacity 
                    style={StyleSheet.absoluteFill} 
                    onPress={closeMenu} 
                    activeOpacity={1} 
                />
            )}

            <View style={styles.menuWrapper}>
                {/* Pop-up Items */}
                {displayItems.map((item, index) => (
                    <Animated.View key={index} style={[styles.itemCircle, getItemStyle(index)]}>
                        <TouchableOpacity 
                            style={styles.itemTouch}
                            onPress={() => navigateTo(item.screen)}
                        >
                            <item.icon color="#fff" size={24} />
                        </TouchableOpacity>
                    </Animated.View>
                ))}

                {/* Main Toggle Button */}
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
        zIndex: -1,
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
