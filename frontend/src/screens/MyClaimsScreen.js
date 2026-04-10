import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ClipboardList, Clock, CheckCircle2, XCircle, MapPin, Package } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import Theme from '../constants/Theme';
import api from '../api/api';

const MyClaimsScreen = ({ navigation }) => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyClaims = async () => {
        try {
            const { data } = await api.get('/claims?type=sent');
            setClaims(data);
        } catch (error) {
            console.error('Fetch My Claims Error:', error.message);
            Alert.alert('Error', 'Failed to load your claims.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMyClaims();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchMyClaims();
    }, []);

    const renderClaim = ({ item: claim }) => {
        const item = claim.item;
        if (!item) return null;

        return (
            <TouchableOpacity 
                style={styles.claimWrapper}
                onPress={() => navigation.navigate('ItemDetail', { id: item._id })}
            >
                <GlassCard style={styles.claimCard}>
                    <View style={styles.claimHeader}>
                        <View style={[styles.statusBox, { 
                            backgroundColor: claim.status === 'Pending' ? 'rgba(251, 191, 36, 0.1)' : 
                                           claim.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                           'rgba(239, 68, 68, 0.1)'
                        }]}>
                            {claim.status === 'Pending' ? <Clock size={14} color="#FBBF24" /> :
                             claim.status === 'Approved' ? <CheckCircle2 size={14} color="#10B981" /> :
                             <XCircle size={14} color="#EF4444" />}
                            <Text style={[styles.statusText, { 
                                color: claim.status === 'Pending' ? '#FBBF24' : 
                                       claim.status === 'Approved' ? '#10B981' : 
                                       '#EF4444'
                            }]}>{claim.status}</Text>
                        </View>
                        <Text style={styles.timestamp}>{new Date(claim.createdAt).toLocaleDateString()}</Text>
                    </View>

                    <View style={styles.itemRow}>
                        <View style={styles.itemIconBox}>
                            <Package size={20} color={Theme.colors.primary} />
                        </View>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                            <View style={styles.locationRow}>
                                <MapPin size={10} color={Theme.colors.textMuted} />
                                <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.messageRow}>
                        <Text style={styles.messageLabel}>Your Message:</Text>
                        <Text style={styles.messageText} numberOfLines={2}>{claim.message}</Text>
                    </View>

                    {claim.status === 'Approved' && (
                        <View style={styles.approvedNotice}>
                            <CheckCircle2 size={12} color="#10b981" />
                            <Text style={styles.approvedText}>The reporter has verified your claim. Contact them to arrange pickup!</Text>
                        </View>
                    )}
                </GlassCard>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Theme.colors.background, '#0f172a']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 100 }} /> {/* Spacer for global FloatingHeader */}

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={Theme.colors.primary} size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={claims}
                        renderItem={renderClaim}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <ClipboardList color={Theme.colors.textMuted} size={48} />
                                <Text style={styles.emptyText}>No claims found</Text>
                                <Text style={styles.emptySubText}>Claims you've submitted for items will appear here.</Text>
                            </View>
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
    listContent: {
        padding: Theme.spacing.l,
        paddingBottom: 150, // Space for bottom menu
    },
    claimWrapper: {
        marginBottom: 16,
    },
    claimCard: {
        padding: 16,
    },
    claimHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    statusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    timestamp: {
        color: Theme.colors.textMuted,
        fontSize: 12,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    itemIconBox: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    locationText: {
        color: Theme.colors.textMuted,
        fontSize: 12,
    },
    messageRow: {
        borderTopWidth: 0.5,
        borderTopColor: Theme.colors.glassBorder,
        paddingTop: 12,
    },
    messageLabel: {
        color: Theme.colors.textMuted,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    messageText: {
        color: Theme.colors.text,
        fontSize: 13,
        lineHeight: 18,
    },
    approvedNotice: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        padding: 10,
        borderRadius: 8,
        marginTop: 12,
        gap: 8,
    },
    approvedText: {
        color: '#10b981',
        fontSize: 11,
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: Theme.colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
    },
    emptySubText: {
        color: Theme.colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
});

export default MyClaimsScreen;
