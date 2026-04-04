import React, { useState, useEffect, useCallback, useContext } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, MessageSquare, Clock } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import Theme from '../constants/Theme';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const InboxScreen = ({ navigation }) => {
    const { userInfo } = useContext(AuthContext);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInbox = async () => {
        try {
            const { data } = await api.get('/chat/inbox');
            setConversations(data);
        } catch (error) {
            console.error('Fetch Inbox Error:', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchInbox();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchInbox();
    }, []);

    const renderConversation = ({ item: conv }) => {
        const lastMsg = conv.lastMessage;
        const isSender = lastMsg.sender === userInfo._id;
        const otherUser = isSender ? conv.recipientDetails[0] : conv.senderDetails[0];
        const item = conv.itemDetails[0];

        if (!otherUser || !item) return null;

        return (
            <TouchableOpacity 
                onPress={() => navigation.navigate('Chat', { 
                    item: item, 
                    recipient: otherUser 
                })}
                style={styles.convWrapper}
            >
                <GlassCard style={styles.convCard}>
                    <View style={styles.unreadDot} />
                    <View style={styles.convInfo}>
                        <View style={styles.convHeader}>
                            <Text style={styles.userName}>{otherUser.name}</Text>
                            <Text style={styles.timestamp}>
                                {new Date(lastMsg.createdAt).toLocaleDateString()}
                            </Text>
                        </View>
                        <Text style={styles.itemTitle}>Regarding: {item.title}</Text>
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {isSender ? 'You: ' : ''}{lastMsg.content}
                        </Text>
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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color={Theme.colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Messages</Text>
                    <View style={{ width: 44 }} />
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={Theme.colors.primary} size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={conversations}
                        renderItem={renderConversation}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                        }
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <MessageSquare color={Theme.colors.textMuted} size={48} />
                                <Text style={styles.emptyText}>No messages yet</Text>
                                <Text style={styles.emptySubText}>When you contact others about items, your chats will appear here.</Text>
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
    },
    convWrapper: {
        marginBottom: Theme.spacing.m,
    },
    convCard: {
        padding: Theme.spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Theme.colors.primary,
        marginRight: 12,
    },
    convInfo: {
        flex: 1,
    },
    convHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    timestamp: {
        color: Theme.colors.textMuted,
        fontSize: 12,
    },
    itemTitle: {
        color: Theme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    lastMessage: {
        color: Theme.colors.textMuted,
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
        paddingHorizontal: 40,
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
    },
});

export default InboxScreen;
