import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, Plus, MapPin, Clock } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import Theme from '../constants/Theme';

const SAMPLE_ITEMS = [
    { id: '1', title: 'iPhone 15 Pro', category: 'Electronics', location: 'Central Park', date: '2h ago', type: 'Lost' },
    { id: '2', title: 'Golden Retriever', category: 'Pets', location: 'Brooklyn', date: '5h ago', type: 'Found' },
    { id: '3', title: 'Leather Wallet', category: 'Accessories', location: 'Subway Station', date: '1d ago', type: 'Lost' },
];

const HomeScreen = ({ navigation }) => {
    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.itemWrapper}
            onPress={() => navigation.navigate('ItemDetail', { id: item.id })}
        >
            <GlassCard style={styles.itemCard}>
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
                        <Text style={styles.footerText}>{item.date}</Text>
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

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hey there!</Text>
                    <Text style={styles.headerTitle}>Lost & Found</Text>
                </View>
                <TouchableOpacity style={styles.searchButton}>
                    <Search color={Theme.colors.text} size={24} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                    <Text style={[styles.tabText, styles.activeTabText]}>All Items</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>Lost</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab}>
                    <Text style={styles.tabText}>Found</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={SAMPLE_ITEMS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity 
                style={styles.fab}
                onPress={() => navigation.navigate('ReportItem')}
            >
                <LinearGradient
                    colors={[Theme.colors.primary, Theme.colors.accent]}
                    style={styles.fabGradient}
                >
                    <Plus color="#fff" size={28} />
                </LinearGradient>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.l,
        marginVertical: Theme.spacing.m,
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
    searchButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Theme.colors.glass,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
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
        paddingBottom: 100,
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
        flexDirection: 'row',
        gap: 16,
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
});

export default HomeScreen;
