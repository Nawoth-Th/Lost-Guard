import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, MapPin, Clock, Archive as ArchiveIcon } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import Theme from '../constants/Theme';
import api from '../api/api';
import { getImageUrl } from '../utils/imageHelper';

const ArchivesScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchArchives = async () => {
        try {
            const { data } = await api.get('/items/archives');
            setItems(data);
        } catch (error) {
            console.error('Fetch Archives Error:', error.message);
            Alert.alert('Error', 'Failed to load your archives.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchArchives();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchArchives();
    }, []);

    const renderItem = ({ item }) => {
        const imageUrl = getImageUrl(item.image);

        return (
            <TouchableOpacity 
                style={styles.itemWrapper}
                onPress={() => navigation.navigate('ItemDetail', { id: item._id })}
            >
                <GlassCard style={styles.itemCard}>
                    <View style={styles.contentRow}>
                        <View style={styles.imageBox}>
                            {imageUrl ? (
                                <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                            ) : (
                                <View style={styles.imagePlaceholder}>
                                    <ArchiveIcon size={24} color={Theme.colors.textMuted} />
                                </View>
                            )}
                            <View style={[styles.typeBadge, { backgroundColor: item.type === 'Lost' ? '#ef4444' : '#10b981' }]}>
                                <Text style={styles.typeBadgeText}>{item.type}</Text>
                            </View>
                        </View>

                        <View style={styles.info}>
                            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                            <View style={styles.metaRow}>
                                <MapPin size={12} color={Theme.colors.textMuted} />
                                <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
                            </View>
                            <View style={styles.metaRow}>
                                <Clock size={12} color={Theme.colors.textMuted} />
                                <Text style={styles.metaText}>{new Date(item.updatedAt).toLocaleDateString()}</Text>
                            </View>
                            
                            <View style={styles.bottomRow}>
                                <View style={[styles.statusBadge, { borderColor: Theme.colors.textMuted }]}>
                                    <Text style={[styles.statusText, { color: Theme.colors.textMuted }]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
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
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <ArchiveIcon color={Theme.colors.textMuted} size={48} />
                                <Text style={styles.emptyText}>No archives</Text>
                                <Text style={styles.emptySubText}>Your historically found and closed reports will appear here after 1 hour.</Text>
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
    itemWrapper: {
        marginBottom: 16,
    },
    itemCard: {
        padding: 12,
    },
    contentRow: {
        flexDirection: 'row',
        gap: 12,
    },
    imageBox: {
        width: 90,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeBadge: {
        position: 'absolute',
        top: 4,
        left: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    typeBadgeText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
    },
    info: {
        flex: 1,
        justifyContent: 'space-between',
    },
    itemTitle: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    metaText: {
        color: Theme.colors.textMuted,
        fontSize: 12,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    statusBadge: {
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
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
        textAlign: 'center',
        color: Theme.colors.textMuted,
        fontSize: 14,
        marginTop: 8,
        paddingHorizontal: 32,
    }
});

export default ArchivesScreen;
