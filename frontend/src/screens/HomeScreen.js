import React, { useState, useContext, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, RefreshControl, Platform, Image, InteractionManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Plus, MapPin, Clock, MessageCircle, User, Trophy, Bell } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import Theme from '../constants/Theme';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';
import { getImageUrl } from '../utils/imageHelper';

const HomeScreen = ({ navigation }) => {
    const { logout, userInfo } = useContext(AuthContext);
    const [items, setItems] = useState([]);
    const [suggestedItems, setSuggestedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('All Items');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const fetchSuggestedItems = async () => {
        try {
            // 1. Get user's active lost items
            const { data: myItems } = await api.get('/items/myitems');
            const lostItems = myItems.filter(i => i.type === 'Lost' && i.status === 'Pending');
            
            if (lostItems.length > 0) {
                // 2. Get matches for the most recent lost item
                const { data: matches } = await api.get(`/items/${lostItems[0]._id}/matches`);
                setSuggestedItems(matches);
            } else {
                setSuggestedItems([]);
            }
        } catch (error) {
            console.error('Fetch Suggested Error:', error.message);
        }
    };

    const fetchItems = async (keyword = '') => {
        try {
            const { data } = await api.get(`/items${keyword ? `?keyword=${keyword}` : ''}`);
            setItems(data);
        } catch (error) {
            console.error('Fetch Items Error:', error.response?.data?.message || error.message);
            Alert.alert('Error', 'Could not fetch items.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        // Zero-Lag Startup: Defer all heavy work until the UI thread is dead quiet
        const task = InteractionManager.runAfterInteractions(() => {
            // Priority 1: Fetch main items after a tiny window to allow menu entrance
            const mainTimer = setTimeout(() => {
                fetchItems(searchQuery);
            }, 100);

            // Priority 2: Fetch complex match data much later
            const suggestionTimer = setTimeout(() => {
                fetchSuggestedItems();
            }, 2000);

            return () => {
                clearTimeout(mainTimer);
                clearTimeout(suggestionTimer);
            };
        });
        return () => task.cancel();
    }, [searchQuery]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchItems(searchQuery);
    }, [searchQuery]);

    const filteredItems = items.filter(item => {
        return activeTab === 'All Items' || item.type === activeTab;
    });

    const renderSuggestedItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.suggestedCard}
            onPress={() => navigation.navigate('ItemDetail', { id: item._id })}
        >
            <GlassCard style={styles.suggestedGlass}>
                <Image source={{ uri: getImageUrl(item.image) }} style={styles.suggestedImage} />
                <View style={styles.suggestedInfo}>
                    <Text style={styles.suggestedTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.suggestedLoc}>
                        <MapPin size={10} color={Theme.colors.primary} />
                        <Text style={styles.suggestedLocText}>{item.location}</Text>
                    </View>
                </View>
                <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>Match ✨</Text>
                </View>
            </GlassCard>
        </TouchableOpacity>
    );

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: logout, style: "destructive" }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.itemWrapper}
            onPress={() => navigation.navigate('ItemDetail', { id: item._id })}
        >
            <GlassCard style={styles.itemCard} priority="low">
                <View style={styles.cardHeader}>
                    <View style={[styles.badge, { backgroundColor: item.type === 'Lost' ? '#ef444433' : '#10b98133' }]}>
                        <Text style={[styles.badgeText, { color: item.type === 'Lost' ? '#f87171' : '#34d399' }]}>
                            {item.type}
                        </Text>
                    </View>
                    <Text style={styles.categoryText}>{item.category}</Text>
                </View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <View style={styles.cardFooter}>
                    <View style={styles.footerInfo}>
                        <MapPin size={14} color={Theme.colors.textMuted} />
                        <Text style={styles.footerText}>{item.location}</Text>
                    </View>
                    <View style={styles.footerInfo}>
                        <Clock size={14} color={Theme.colors.textMuted} />
                        <Text style={styles.footerText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
            </GlassCard>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[Theme.colors.background, '#0f172a']}
                style={StyleSheet.absoluteFill}
            />

            {/* Global FloatingHeader handles greeting and Add Item now */}
            
            <View style={{ height: 110 }} /> {/* Spacer for FloatingHeader */}

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Lost & Found Items</Text>
                </View>
            </View>

            {showSearch && (
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search items, locations..."
                        placeholderTextColor={Theme.colors.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />
                </View>
            )}

            <FlatList
                data={filteredItems}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                }
                ListHeaderComponent={
                    <>
                        {suggestedItems.length > 0 && (
                            <View style={styles.suggestedSection}>
                                <Text style={styles.sectionTitle}>Suggested for You ✨</Text>
                                <FlatList
                                    horizontal
                                    data={suggestedItems}
                                    renderItem={renderSuggestedItem}
                                    keyExtractor={item => `suggested-${item._id}`}
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.suggestedList}
                                />
                            </View>
                        )}
                        <View style={styles.tabs}>
                            {['All Items', 'Lost', 'Found'].map((tab) => (
                                <TouchableOpacity 
                                    key={tab}
                                    style={[styles.tab, activeTab === tab && styles.activeTab]}
                                    onPress={() => setActiveTab(tab)}
                                >
                                    <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No items found matching your filters</Text>
                    </View>
                }
            />


            {/* FloatingBottomMenu is global now */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 10 : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.l,
        marginVertical: Theme.spacing.m,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    greeting: {
        color: Theme.colors.textMuted,
        fontSize: Theme.fontSizes.m,
    },
    headerTitle: {
        color: Theme.colors.text,
        fontSize: Theme.fontSizes.xl,
        fontWeight: 'bold',
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Theme.colors.glass,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    actionButtonActive: {
        backgroundColor: Theme.colors.primary + '33',
        borderColor: Theme.colors.primary,
    },
    searchContainer: {
        paddingHorizontal: Theme.spacing.l,
        marginBottom: Theme.spacing.m,
    },
    searchInput: {
        backgroundColor: Theme.colors.glass,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        color: Theme.colors.text,
        fontSize: 16,
    },
    tabs: {
        flexDirection: 'row',
        paddingHorizontal: Theme.spacing.l,
        marginBottom: Theme.spacing.m,
    },
    tab: {
        marginRight: Theme.spacing.m,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: Theme.colors.primary,
    },
    tabText: {
        color: Theme.colors.textMuted,
        fontWeight: 'bold',
    },
    activeTabText: {
        color: Theme.colors.text,
    },
    listContent: {
        paddingHorizontal: Theme.spacing.l,
        paddingBottom: 120, // More padding for floating menu
    },
    itemWrapper: {
        marginBottom: Theme.spacing.m,
    },
    itemCard: {
        padding: Theme.spacing.m,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Theme.spacing.s,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: Theme.fontSizes.s,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    categoryText: {
        color: Theme.colors.textMuted,
        fontSize: 12,
    },
    itemTitle: {
        color: Theme.colors.text,
        fontSize: Theme.fontSizes.m,
        fontWeight: 'bold',
        marginBottom: Theme.spacing.s,
    },
    cardFooter: {
        flexDirection: 'row', gap: 16,
    },
    footerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    footerText: {
        color: Theme.colors.textMuted,
        fontSize: 12,
    },
    emptyContainer: {
        paddingVertical: 50,
        alignItems: 'center',
    },
    emptyText: {
        color: Theme.colors.textMuted,
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 64,
        height: 64,
        borderRadius: 32,
        elevation: 8,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    fabGradient: {
        flex: 1,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    suggestedSection: {
        marginBottom: Theme.spacing.l,
    },
    sectionTitle: {
        color: Theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: Theme.spacing.m,
    },
    suggestedList: {
        paddingRight: Theme.spacing.l,
    },
    suggestedCard: {
        width: 160,
        marginRight: Theme.spacing.m,
    },
    suggestedGlass: {
        padding: 8,
        borderRadius: 16,
    },
    suggestedImage: {
        width: '100%',
        height: 100,
        borderRadius: 12,
        marginBottom: 8,
    },
    suggestedInfo: {
        paddingHorizontal: 4,
    },
    suggestedTitle: {
        color: Theme.colors.text,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    suggestedLoc: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    suggestedLocText: {
        color: Theme.colors.textMuted,
        fontSize: 10,
    },
    matchBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: Theme.colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    matchBadgeText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
});

export default HomeScreen;
