import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Trophy, Medal, Star, User } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import Theme from '../constants/Theme';
import api from '../api/api';

const LeaderboardScreen = ({ navigation }) => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await api.get('/users/leaderboard');
            setStats(data);
        } catch (error) {
            console.error('Fetch Leaderboard Error:', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchLeaderboard();
    };

    const renderRankIcon = (index) => {
        if (index === 0) return <Trophy size={24} color="#FBBF24" />;
        if (index === 1) return <Medal size={24} color="#94A3B8" />;
        if (index === 2) return <Medal size={24} color="#B45309" />;
        return <Text style={styles.rankNumber}>{index + 1}</Text>;
    };

    const renderUser = ({ item, index }) => (
        <GlassCard style={[styles.userCard, index < 3 && styles.topThreeCard]}>
            <View style={styles.rankContainer}>
                {renderRankIcon(index)}
            </View>
            <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { borderColor: index === 0 ? '#FBBF24' : Theme.colors.glassBorder }]}>
                    <User size={24} color={Theme.colors.textMuted} />
                </View>
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userStatus}>Verified Student</Text>
            </View>
            <View style={styles.scoreContainer}>
                <Star size={14} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.scoreText}>{item.trustScore}</Text>
            </View>
        </GlassCard>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Theme.colors.background, '#1e1b4b']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 100 }} /> {/* Spacer for global FloatingHeader */}

                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Top Guardians</Text>
                    <Text style={styles.heroSub}>Students who helps the campus community stay safe.</Text>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={stats}
                        renderItem={renderUser}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.l,
        height: 60,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Theme.colors.glass,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    headerTitle: {
        color: Theme.colors.text,
        fontSize: Theme.fontSizes.l,
        fontWeight: 'bold',
    },
    heroSection: {
        paddingHorizontal: Theme.spacing.l,
        paddingBottom: 24,
        paddingTop: 12,
    },
    heroTitle: {
        color: Theme.colors.text,
        fontSize: 28,
        fontWeight: 'bold',
    },
    heroSub: {
        color: Theme.colors.textMuted,
        fontSize: 14,
        marginTop: 4,
    },
    listContent: {
        padding: Theme.spacing.l,
        paddingBottom: 120, // Space for bottom menu
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginBottom: 12,
    },
    topThreeCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    rankContainer: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankNumber: {
        color: Theme.colors.textMuted,
        fontSize: 18,
        fontWeight: 'bold',
    },
    avatarContainer: {
        paddingHorizontal: 12,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Theme.colors.glass,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    userStatus: {
        color: Theme.colors.textMuted,
        fontSize: 12,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        gap: 6,
    },
    scoreText: {
        color: '#FBBF24',
        fontSize: 14,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default LeaderboardScreen;
