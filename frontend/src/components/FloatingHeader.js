import { Plus, ChevronLeft } from 'lucide-react-native';
import Theme from '../constants/Theme';

const FloatingHeader = ({ title = "Lost Guard", greeting, onPlusPress, showBack, onBackPress, showPlus = true }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <View style={styles.content}>
                <View style={styles.leftContainer}>
                    {showBack && (
                        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
                            <ChevronLeft color={Theme.colors.text} size={28} />
                        </TouchableOpacity>
                    )}
                    <View>
                        {greeting && !showBack && <Text style={styles.greeting}>{greeting}</Text>}
                        <Text style={styles.title}>{title}</Text>
                    </View>
                </View>
                
                {showPlus && (
                    <TouchableOpacity 
                        style={styles.plusButton}
                        onPress={onPlusPress}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={Theme.colors.purpleGradient}
                            style={styles.plusGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Plus color="#fff" size={24} />
                        </LinearGradient>
                    </TouchableOpacity>
                )}
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
    },
    leftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 22,
    },
    greeting: {
        color: Theme.colors.textMuted,
        fontSize: 14,
        marginBottom: 2,
    },
    title: {
        color: Theme.colors.text,
        fontSize: 28,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    plusButton: {
        width: 54,
        height: 54,
        borderRadius: 27,
        elevation: 10,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    plusGradient: {
        flex: 1,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default FloatingHeader;
