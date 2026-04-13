import React, { useState, useEffect, useContext, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Share, Alert, Image, ActivityIndicator, FlatList, DeviceEventEmitter } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, MapPin, Clock, Share2, MessageCircle, CheckCircle2, History, ShieldCheck } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import Theme from '../constants/Theme';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageHelper';

const { width } = Dimensions.get('window');

const ItemDetailScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const { userInfo } = useContext(AuthContext);
    const [item, setItem] = useState(null);
    const [matches, setMatches] = useState([]);
    const [statusLogs, setStatusLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [matchesLoading, setMatchesLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [hasClaimed, setHasClaimed] = useState(false);
    const [claimStatus, setClaimStatus] = useState(null);

    const fetchItemDetails = async () => {
        try {
            const { data } = await api.get(`/items/${id}`);
            setItem(data);
            fetchMatches();
            fetchClaimStatus();
        } catch (error) {
            console.error('Fetch Item Error:', error.response?.data?.message || error.message);
            Alert.alert('Error', 'Could not load item details.');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const fetchMatches = async () => {
        try {
            const { data } = await api.get(`/items/${id}/matches`);
            setMatches(data);
        } catch (error) {
            console.error('Fetch Matches Error:', error.message);
        } finally {
            setMatchesLoading(false);
        }
    };

    const fetchClaimStatus = async () => {
        if (!userInfo) return;
        try {
            const { data } = await api.get(`/claims/status/${id}`);
            setHasClaimed(data.hasClaimed);
            setClaimStatus(data.status);
        } catch (error) {
            console.error('Fetch Claim Status Error:', error.message);
        }
    };

    const fetchStatusLogs = async () => {
        // Only fetch if reporter or admin
        const isReporter = item && userInfo && item.user?._id === userInfo._id;
        const isAdmin = userInfo && userInfo.isAdmin;

        if (!isReporter && !isAdmin) return;

        setLogsLoading(true);
        try {
            const { data } = await api.get(`/items/${id}/logs`);
            setStatusLogs(data);
        } catch (error) {
            console.error('Fetch Logs Error:', error.message);
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        fetchItemDetails();
    }, [id]);

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('ITEM_SHARE', handleShare);
        return () => sub.remove();
    }, [item]);

    useEffect(() => {
        if (item) {
            fetchStatusLogs();
        }
    }, [item]);

    const handleShare = async () => {
        if (!item) return;
        try {
            await Share.share({
                message: `${item.type} Item: ${item.title}\nLocation: ${item.location}\nDescription: ${item.description}\n\nShared via Lost & Found App`,
            });
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleContact = () => {
        navigation.navigate('Chat', { 
            item: item, 
            recipient: item.user 
        });
    };

    const handleClaim = () => {
        navigation.navigate('Claim', { item: item });
    };

    // Refresh data on screen focus
    useFocusEffect(
        useCallback(() => {
            if (id) {
                fetchClaimStatus();
            }
        }, [id])
    );

    const toggleHubStatus = async (hubName = '') => {
        try {
            const { data } = await api.patch(`/items/${id}/hub`, {
                isAtHub: !item.isAtHub,
                hubName: !item.isAtHub ? hubName : ''
            });
            setItem(data);
            fetchStatusLogs();
            Alert.alert('Success', `Item status updated to ${!item.isAtHub ? 'Secured at Hub' : 'In Circulation'}`);
        } catch (error) {
            console.error('Update Hub Error:', error.response?.data?.message || error.message);
            Alert.alert('Error', 'Failed to update hub status.');
        }
    };

    const handleArchive = () => {
        Alert.alert(
            "Item Found",
            "Are you sure you want to mark this item as found? It will be archived.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Yes, I found it", 
                    onPress: async () => {
                        try {
                            const { data } = await api.put(`/items/${id}/status`, { status: 'Recovered' });
                            setItem(data);
                            fetchStatusLogs();
                            Alert.alert('Success', 'Item archived successfully!');
                        } catch (error) {
                            console.error('Archive Error:', error.response?.data?.message || error.message);
                            Alert.alert('Error', 'Failed to archive item.');
                        }
                    }
                }
            ]
        );
    };

    const handleHubToggle = () => {
        if (!item.isAtHub) {
            // Alert.prompt is iOS only. For a universal fix, we'll use Alert to confirm
            // and then Admin can update Hub name via a secondary input if needed.
            // But for this project, let's keep it simple with Alert.alert if Android.
            
            Alert.alert(
                "Verify Drop-off",
                "Is this item secured at the University Security Gate?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Confirm", onPress: () => toggleHubStatus('Main Security Gate (NAB)') }
                ]
            );
        } else {
            // If releasing
            Alert.alert(
                "Release Item",
                "Are you sure you want to release this item from the hub?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Release", onPress: () => toggleHubStatus(), style: 'destructive' }
                ]
            );
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <LinearGradient
                    colors={[Theme.colors.background, '#1e1b4b']}
                    style={StyleSheet.absoluteFill}
                />
                <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
        );
    }

    if (!item) return null;

    const imageUrl = getImageUrl(item.image);

    const renderMatch = ({ item: match }) => (
        <TouchableOpacity 
            style={styles.matchCard}
            onPress={() => navigation.push('ItemDetail', { id: match._id })}
        >
            <Image 
            source={match.image ? { uri: getImageUrl(match.image) } : null} 
                style={styles.matchImage}
            />
            <View style={styles.matchInfo}>
                <Text style={styles.matchTitle} numberOfLines={1}>{match.title}</Text>
                <Text style={styles.matchCategory}>{match.category}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Theme.colors.background, '#1e1b4b']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 100 }} /> {/* Spacer for global FloatingHeader */}

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <View style={styles.imageContainer}>
                        {imageUrl ? (
                            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
                        ) : (
                            <LinearGradient
                                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                                style={styles.imagePlaceholder}
                            >
                                <Text style={styles.imagePlaceholderText}>No Image Available</Text>
                            </LinearGradient>
                        )}
                        <View style={[styles.typeBadge, { backgroundColor: item.type === 'Lost' ? '#ef4444' : '#10b981' }]}>
                            <Text style={styles.typeBadgeText}>{item.type}</Text>
                        </View>
                    </View>

                    <View style={styles.mainInfo}>
                        <View style={styles.titleRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.category}>{item.category}</Text>
                                <Text style={styles.title}>{item.title}</Text>
                            </View>
                            {item.isAtHub && (
                                <View style={styles.hubBadge}>
                                    <ShieldCheck size={18} color="#10b981" />
                                    <Text style={styles.hubBadgeText}>VERIFIED</Text>
                                </View>
                            )}
                        </View>
                        
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                            <View style={styles.infoItem}>
                                <MapPin size={16} color={Theme.colors.primary} />
                                <Text style={styles.infoText}>{item.location}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Clock size={16} color={Theme.colors.primary} />
                                <Text style={styles.infoText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                            </View>
                            {item.isAtHub && (
                                <View style={styles.infoItem}>
                                    <ShieldCheck size={16} color="#10b981" />
                                    <Text style={[styles.infoText, { color: '#10b981', fontWeight: 'bold' }]}>Secured at: {item.hubName}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    <GlassCard style={styles.descriptionCard}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{item.description}</Text>
                        <View style={styles.reporterInfo}>
                            <Text style={styles.reporterLabel}>Reported by:</Text>
                            <Text style={styles.reporterName}>{item.user?.name || 'Anonymous'}</Text>
                        </View>
                    </GlassCard>

                    {item.isAtHub && (
                        <GlassCard style={styles.verifiedHubCard}>
                            <View style={styles.verifiedHubHeader}>
                                <ShieldCheck size={24} color="#10b981" />
                                <Text style={styles.verifiedHubTitle}>Verified at Hub</Text>
                            </View>
                            <Text style={styles.verifiedHubInstruction}>
                                Your item has been verified by campus security. Please visit <Text style={{fontWeight: 'bold', color: '#fff'}}>{item.hubName}</Text> with your Student ID to collect it.
                            </Text>
                        </GlassCard>
                    )}

                    {userInfo?.isAdmin && (
                        <GlassCard style={styles.adminHubPanel}>
                            <Text style={styles.adminPanelTitle}>🛡️ Moderation: Hub Management</Text>
                            <Text style={styles.adminPanelDesc}>
                                Bridge the physical handover. Use this to mark items as secured by campus authorities.
                            </Text>
                            <TouchableOpacity 
                                style={[styles.hubToggleButton, { backgroundColor: item.isAtHub ? '#ef4444' : '#10b981' }]} 
                                onPress={handleHubToggle}
                            >
                                <ShieldCheck size={20} color="#fff" />
                                <Text style={styles.hubToggleText}>
                                    {item.isAtHub ? 'Release from Hub' : 'Secure at Hub'}
                                </Text>
                            </TouchableOpacity>
                        </GlassCard>
                    )}

                    {(userInfo?.isAdmin || item.user?._id === userInfo?._id) && (
                        <View style={styles.logsSection}>
                            <View style={styles.sectionHeader}>
                                <History size={20} color={Theme.colors.primary} style={{ marginRight: 8 }} />
                                <Text style={styles.sectionTitle}>Status Timeline</Text>
                            </View>
                            
                            {statusLogs.length > 0 ? (
                                <View style={styles.timelineContainer}>
                                    {statusLogs.map((log, index) => (
                                        <View key={log._id} style={styles.timelineItem}>
                                            <View style={styles.timelineLineContainer}>
                                                <View style={[styles.timelineDot, { backgroundColor: index === 0 ? Theme.colors.primary : Theme.colors.textMuted }]} />
                                                {index !== statusLogs.length - 1 && <View style={styles.timelineLine} />}
                                            </View>
                                            <View style={styles.timelineContent}>
                                                <Text style={styles.logStatus}>{log.status}</Text>
                                                <Text style={styles.logRemarks}>{log.remarks}</Text>
                                                <Text style={styles.logDate}>
                                                    {new Date(log.createdAt).toLocaleString(undefined, { 
                                                        month: 'short', 
                                                        day: 'numeric', 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.emptyLogsText}>No history recorded yet.</Text>
                            )}
                        </View>
                    )}

                    {matches.length > 0 && (
                        <View style={styles.matchesSection}>
                            <Text style={styles.sectionTitle}>Suggested Matches</Text>
                            <FlatList
                                data={matches}
                                renderItem={renderMatch}
                                keyExtractor={match => match._id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.matchesList}
                            />
                        </View>
                    )}

                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Status:</Text>
                        <View style={[styles.statusBadge, { borderColor: item.status === 'Recovered' ? '#10b981' : Theme.colors.primary }]}>
                            <Text style={[styles.statusText, { color: item.status === 'Recovered' ? '#10b981' : Theme.colors.primary }]}>
                                {item.status}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        {item.type === 'Found' && item.status !== 'Recovered' && item.user?._id !== userInfo?._id && (
                            <TouchableOpacity 
                                style={[
                                    styles.actionButtonMain, 
                                    { marginBottom: 12 },
                                    hasClaimed && { opacity: 0.8 }
                                ]} 
                                onPress={hasClaimed ? null : handleClaim}
                                disabled={hasClaimed}
                            >
                                <LinearGradient
                                    colors={hasClaimed ? ['#4b5563', '#374151'] : [Theme.colors.primary, Theme.colors.accent]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.actionGradient}
                                >
                                    <CheckCircle2 color="#fff" size={20} style={{ marginRight: 8 }} />
                                    <Text style={styles.actionText}>
                                        {hasClaimed ? 'Already sent a claim request' : 'Claim This Item'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}

                        {item.type === 'Lost' && item.status !== 'Recovered' && item.user?._id === userInfo?._id && (
                            <TouchableOpacity 
                                style={[styles.actionButtonMain, { marginBottom: 12 }]} 
                                onPress={handleArchive}
                            >
                                <LinearGradient
                                    colors={['#10b981', '#059669']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.actionGradient}
                                >
                                    <CheckCircle2 color="#fff" size={20} style={{ marginRight: 8 }} />
                                    <Text style={styles.actionText}>I found that item</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity style={styles.actionButtonMain} onPress={handleContact}>
                            <LinearGradient
                                colors={['#334155', '#1e293b']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.actionGradient}
                            >
                                <MessageCircle color="#fff" size={20} style={{ marginRight: 8 }} />
                                <Text style={styles.actionText}>Contact Reporter</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.l,
        height: 60,
    },
    headerButton: {
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
    scrollContent: {
        padding: Theme.spacing.l,
        paddingBottom: 40,
    },
    imageContainer: {
        width: '100%',
        height: 250,
        borderRadius: Theme.spacing.m,
        overflow: 'hidden',
        marginBottom: Theme.spacing.l,
        borderWidth: 1,
        borderColor: Theme.colors.glassBorder,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePlaceholderText: {
        color: Theme.colors.textMuted,
        fontSize: Theme.fontSizes.m,
    },
    typeBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        elevation: 4,
    },
    typeBadgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
        textTransform: 'uppercase',
    },
    mainInfo: {
        marginBottom: Theme.spacing.l,
    },
    category: {
        color: Theme.colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    title: {
        color: Theme.colors.text,
        fontSize: Theme.fontSizes.xl,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginRight: 16,
    },
    infoText: {
        color: Theme.colors.textMuted,
        fontSize: 14,
    },
    descriptionCard: {
        padding: Theme.spacing.l,
        marginBottom: Theme.spacing.l,
    },
    sectionTitle: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    descriptionText: {
        color: Theme.colors.textMuted,
        lineHeight: 22,
        fontSize: 15,
        marginBottom: Theme.spacing.m,
    },
    reporterInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 0.5,
        borderTopColor: Theme.colors.glassBorder,
        paddingTop: Theme.spacing.m,
        gap: 8,
    },
    reporterLabel: {
        color: Theme.colors.textMuted,
        fontSize: 12,
    },
    reporterName: {
        color: Theme.colors.text,
        fontWeight: 'bold',
        fontSize: 14,
    },
    matchesSection: {
        marginBottom: Theme.spacing.xl,
    },
    matchesList: {
        gap: 12,
    },
    matchCard: {
        width: 140,
        backgroundColor: Theme.colors.glass,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    matchImage: {
        width: '100%',
        height: 80,
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    matchInfo: {
        padding: 8,
    },
    matchTitle: {
        color: Theme.colors.text,
        fontSize: 12,
        fontWeight: 'bold',
    },
    matchCategory: {
        color: Theme.colors.textMuted,
        fontSize: 10,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 12,
        marginBottom: Theme.spacing.xl,
        paddingHorizontal: 4,
    },
    statusLabel: {
        color: Theme.colors.textMuted,
        fontSize: 14,
    },
    statusBadge: {
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    actions: {
        marginBottom: 20,
    },
    actionButtonMain: {
        borderRadius: Theme.spacing.s,
        overflow: 'hidden',
        elevation: 4,
    },
    actionGradient: {
        paddingVertical: Theme.spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: Theme.fontSizes.m,
    },
    logsSection: {
        marginBottom: Theme.spacing.xl,
        paddingHorizontal: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    timelineContainer: {
        paddingLeft: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        minHeight: 70,
    },
    timelineLineContainer: {
        width: 20,
        alignItems: 'center',
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 6,
        zIndex: 1,
    },
    timelineLine: {
        width: 2,
        flex: 1,
        backgroundColor: Theme.colors.glassBorder,
        marginVertical: -4,
    },
    timelineContent: {
        flex: 1,
        paddingLeft: 12,
        paddingBottom: 20,
    },
    logStatus: {
        color: Theme.colors.text,
        fontSize: 14,
        fontWeight: 'bold',
    },
    logRemarks: {
        color: Theme.colors.textMuted,
        fontSize: 13,
        marginTop: 2,
    },
    logDate: {
        color: Theme.colors.textMuted,
        fontSize: 11,
        marginTop: 4,
        opacity: 0.7,
    },
    emptyLogsText: {
        color: Theme.colors.textMuted,
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 10,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    hubBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.2)',
        gap: 6,
    },
    hubBadgeText: {
        color: '#10b981',
        fontSize: 10,
        fontWeight: 'bold',
    },
    verifiedHubCard: {
        padding: Theme.spacing.l,
        marginBottom: Theme.spacing.l,
        borderLeftWidth: 4,
        borderLeftColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
    },
    verifiedHubHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
    },
    verifiedHubTitle: {
        color: '#10b981',
        fontSize: 16,
        fontWeight: 'bold',
    },
    verifiedHubInstruction: {
        color: Theme.colors.textMuted,
        fontSize: 14,
        lineHeight: 20,
    },
    adminHubPanel: {
        padding: Theme.spacing.l,
        marginBottom: Theme.spacing.l,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        backgroundColor: 'rgba(239, 68, 68, 0.02)',
    },
    adminPanelTitle: {
        color: Theme.colors.text,
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    adminPanelDesc: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        marginBottom: 16,
    },
    hubToggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    hubToggleText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});

export default ItemDetailScreen;
