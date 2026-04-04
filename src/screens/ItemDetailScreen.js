import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, MapPin, Clock, Share2, MessageCircle } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import Theme from '../constants/Theme';

const { width } = Dimensions.get('window');

const ItemDetailScreen = ({ route, navigation }) => {
    // In a real app, you'd fetch this by ID. For now, we'll use dummy data or generic info.
    const { id } = route.params || { id: 'unknown' };
    
    // Dummy item data for demonstration
    const getItemData = (id) => {
        const items = {
            '1': {
                title: 'iPhone 15 Pro',
                category: 'Electronics',
                location: 'Central Park, NY',
                date: '2h ago',
                description: 'Lost a blue iPhone 15 Pro near the Bethesda Terrace. It has a clear case and a small scratch on the bottom left corner.',
                type: 'Lost',
            },
            '2': {
                title: 'Golden Retriever',
                category: 'Pets',
                location: 'Brooklyn, NY',
                date: '5h ago',
                description: 'Found a friendly Golden Retriever near Prospect Park. No collar, seems well-trained.',
                type: 'Found',
            },
            '3': {
                title: 'Leather Wallet',
                category: 'Accessories',
                location: 'Subway Station',
                date: '1d ago',
                description: 'Lost a black leather wallet at the 42nd St - Port Authority station. Contains ID and several cards.',
                type: 'Lost',
            }
        };
        return items[id] || items['1'];
    };

    const item = getItemData(id);

    const handleShare = async () => {
        try {
            const result = await Share.share({
                message: `${item.type} Item: ${item.title}\nLocation: ${item.location}\nDescription: ${item.description}\n\nShared via Lost & Found App`,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleContact = () => {
        Alert.alert(
            "Contact Owner",
            "This will open a chat with the reporter once the messaging system is fully integrated.",
            [{ text: "OK", onPress: () => console.log("OK Pressed") }]
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Theme.colors.background, '#1e1b4b']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                {/* Header */}
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
                    {/* Image Placeholder */}
                    <View style={styles.imageContainer}>
                        <LinearGradient
                            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                            style={styles.imagePlaceholder}
                        >
                            <Text style={styles.imagePlaceholderText}>Image Preview</Text>
                        </LinearGradient>
                        <View style={[styles.typeBadge, { backgroundColor: item.type === 'Lost' ? '#ef4444' : '#10b981' }]}>
                            <Text style={styles.typeBadgeText}>{item.type}</Text>
                        </View>
                    </View>

                    {/* Main Info */}
                    <View style={styles.mainInfo}>
                        <Text style={styles.category}>{item.category}</Text>
                        <Text style={styles.title}>{item.title}</Text>
                        
                        <View style={styles.infoRow}>
                            <View style={styles.infoItem}>
                                <MapPin size={16} color={Theme.colors.primary} />
                                <Text style={styles.infoText}>{item.location}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Clock size={16} color={Theme.colors.primary} />
                                <Text style={styles.infoText}>{item.date}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Description */}
                    <GlassCard style={styles.descriptionCard}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.descriptionText}>{item.description}</Text>
                    </GlassCard>

                    {/* Contact Button */}
                    <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
                        <LinearGradient
                            colors={[Theme.colors.primary, Theme.colors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.contactGradient}
                        >
                            <MessageCircle color="#fff" size={20} style={{ marginRight: 8 }} />
                            <Text style={styles.contactText}>Contact Owner</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
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
    infoRow: {
        flexDirection: 'row',
        gap: 16,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        color: Theme.colors.textMuted,
        fontSize: 14,
    },
    descriptionCard: {
        padding: Theme.spacing.l,
        marginBottom: Theme.spacing.xl,
    },
    sectionTitle: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    descriptionText: {
        color: Theme.colors.textMuted,
        lineHeight: 22,
        fontSize: 15,
    },
    contactButton: {
        borderRadius: Theme.spacing.s,
        overflow: 'hidden',
        elevation: 8,
    },
    contactGradient: {
        paddingVertical: Theme.spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: Theme.fontSizes.m,
    },
});

export default ItemDetailScreen;
