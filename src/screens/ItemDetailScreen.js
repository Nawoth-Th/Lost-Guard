import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Share, Alert, Image, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, MapPin, Clock, Share2, MessageCircle, CheckCircle2 } from 'lucide-native-react';
import GlassCard from '../components/GlassCard';
import Theme from '../constants/Theme';
import api from '../api/api';

const { width } = Dimensions.get('window');

const ItemDetailScreen = ({ route, navigation }) => {
    const { id } = route.params;
    const [item, setItem] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [matchesLoading, setMatchesLoading] = useState(true);

    const fetchItemDetails = async () => {
        try {
            const { data } = await api.get(`/items/${id}`);
            setItem(data);
            fetchMatches();
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

    useEffect(() => {
        fetchItemDetails();
    }, [id]);

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

    const serverUrl = api.defaults.baseURL.replace('/api', '');
    const imageUrl = item.image ? `${serverUrl}${item.image}` : null;

    const renderMatch = ({ item: match }) => (
        <TouchableOpacity 
            style={styles.matchCard}
            onPress={() => navigation.push('ItemDetail', { id: match._id })}
        >
            <Image 
                source={match.image ? { uri: `${serverUrl}${match.image}` } : null} 
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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <ChevronLeft color={Theme.colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Item Details</Text>
                    <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                        <Share2 color={Theme.colors.text} size={20} />
                    </TouchableOpacity>
                </View>

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
                        <Text style={styles.category}>{item.category}</Text>
                        <Text style={styles.title}>{item.title}</Text>
                        
                        <div className="flex flex-row gap-4">
                            <View style={styles.infoItem}>
                                <MapPin size={16} color={Theme.colors.primary} />
                                <Text style={styles.infoText}>{item.location}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Clock size={16} color={Theme.colors.primary} />
                                <Text style={styles.infoText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                            </View>
                        </div>
                    </View>

                    <GlassCard style={styles.descriptionCard}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{item.description}</Text>
                        <View style={styles.reporterInfo}>
                            <Text style={styles.reporterLabel}>Reported by:</Text>
                            <Text style={styles.reporterName}>{item.user?.name || 'Anonymous'}</Text>
                        </View>
                    </GlassCard>

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
                        {item.type === 'Found' && item.status !== 'Recovered' && (
                            <TouchableOpacity style={[styles.actionButtonMain, { marginBottom: 12 }]} onPress={handleClaim}>
                                <LinearGradient
                                    colors={[Theme.colors.primary, Theme.colors.accent]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.actionGradient}
                                >
                                    <CheckCircle2 color="#fff" size={20} style={{ marginRight: 8 }} />
                                    <Text style={styles.actionText}>Claim This Item</Text>
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
});

export default ItemDetailScreen;
