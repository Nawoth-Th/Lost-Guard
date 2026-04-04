import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ShieldCheck, CheckCircle, XCircle, User, Package } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import Theme from '../constants/Theme';
import api from '../api/api';

const AdminDashboardScreen = ({ navigation }) => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAllClaims = async () => {
        try {
            const { data } = await api.get('/claims?type=all');
            setClaims(data);
        } catch (error) {
            console.error('Fetch All Claims Error:', error.message);
            Alert.alert('Error', 'Failed to load claims.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAllClaims();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAllClaims();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/claims/${id}`, { status });
            Alert.alert('Success', `Claim ${status} successfully.`);
            fetchAllClaims(); // Reload
        } catch (error) {
            Alert.alert('Error', 'Failed to update claim status.');
        }
    };

    const renderClaim = ({ item: claim }) => {
        return (
            <GlassCard style={styles.claimCard}>
                <View style={styles.claimHeader}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatarMini}>
                            <User size={12} color={Theme.colors.primary} />
                        </View>
                        <Text style={styles.userName}>{claim.requester.name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { 
                        backgroundColor: claim.status === 'Pending' ? 'rgba(251, 191, 36, 0.1)' : 
                                       claim.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 
                                       'rgba(239, 68, 68, 0.1)',
                        borderColor: claim.status === 'Pending' ? '#FBBF24' : 
                                   claim.status === 'Approved' ? '#10B981' : 
                                   '#EF4444'
                    }]}>
                        <Text style={[styles.statusText, { 
                            color: claim.status === 'Pending' ? '#FBBF24' : 
                                   claim.status === 'Approved' ? '#10B981' : 
                                   '#EF4444'
                        }]}>{claim.status}</Text>
                    </View>
                </View>

                <View style={styles.itemRef}>
                    <Package size={14} color={Theme.colors.textMuted} />
                    <Text style={styles.itemTitle}>Item: {claim.item?.title || 'Unknown'}</Text>
                </View>

                <Text style={styles.message}>{claim.message}</Text>

                {claim.status === 'Pending' && (
                    <View style={styles.actions}>
                        <TouchableOpacity 
                            style={[styles.actionBtn, styles.rejectBtn]} 
                            onPress={() => handleUpdateStatus(claim._id, 'Rejected')}
                        >
                            <XCircle size={18} color="#ef4444" />
                            <Text style={styles.rejectText}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.actionBtn, styles.approveBtn]} 
                            onPress={() => handleUpdateStatus(claim._id, 'Approved')}
                        >
                            <CheckCircle size={18} color="#10b981" />
                            <Text style={styles.approveText}>Approve</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </GlassCard>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Theme.colors.background, '#0f172a']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color={Theme.colors.text} size={24} />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <ShieldCheck size={20} color="#FBBF24" />
                        <Text style={styles.headerTitle}>Moderation</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.statsBar}>
                    <Text style={styles.statsText}>{claims.filter(c => c.status === 'Pending').length} Pending Claims</Text>
                </View>

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
                                <ShieldCheck color={Theme.colors.textMuted} size={48} />
                                <Text style={styles.emptyText}>No claims found</Text>
                                <Text style={styles.emptySubText}>Global claims awaiting verification will appear here.</Text>
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        color: Theme.colors.text,
        fontSize: Theme.fontSizes.l,
        fontWeight: 'bold',
    },
    statsBar: {
        paddingHorizontal: Theme.spacing.l,
        paddingBottom: 12,
    },
    statsText: {
        color: Theme.colors.textMuted,
        fontSize: 14,
    },
    listContent: {
        padding: Theme.spacing.l,
    },
    claimCard: {
        padding: 16,
        marginBottom: 16,
    },
    claimHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    avatarMini: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userName: {
        color: Theme.colors.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 0.5,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    itemRef: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    itemTitle: {
        color: Theme.colors.primary,
        fontSize: 13,
        fontWeight: '600',
    },
    message: {
        color: Theme.colors.textMuted,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        borderTopWidth: 0.5,
        borderTopColor: Theme.colors.glassBorder,
        paddingTop: 16,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        borderWidth: 0.5,
    },
    rejectBtn: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    approveBtn: {
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderColor: 'rgba(16, 185, 129, 0.2)',
    },
    rejectText: {
        color: '#ef4444',
        fontWeight: 'bold',
        fontSize: 14,
    },
    approveText: {
        color: '#10b981',
        fontWeight: 'bold',
        fontSize: 14,
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
    }
});

export default AdminDashboardScreen;
