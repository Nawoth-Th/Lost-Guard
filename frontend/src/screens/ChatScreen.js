import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, Send, MoreVertical } from 'lucide-react-native';
import io from 'socket.io-client';
import Theme from '../constants/Theme';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const ChatScreen = ({ route, navigation }) => {
    const { item, recipient } = route.params;
    const { userInfo } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const socket = useRef(null);
    const flatListRef = useRef(null);

    // Generate unique room ID for this item + two users
    const userIds = [userInfo._id, recipient._id].sort();
    const room = `${item._id}_${userIds[0]}_${userIds[1]}`;

    const serverUrl = api.defaults.baseURL.replace('/api', '');

    useEffect(() => {
        // 1. Initialize Socket
        socket.current = io(serverUrl);

        // 2. Join Room
        socket.current.emit('join_room', { room });

        // 3. Listen for Messages
        socket.current.on('receive_message', (data) => {
            setMessages((prev) => [...prev, data]);
        });

        // 4. Fetch History
        fetchHistory();

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await api.get(`/chat/${room}`);
            setMessages(data);
        } catch (error) {
            console.error('Fetch History Error:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        const messageData = {
            room,
            chat: room,
            sender: userInfo._id,
            recipient: recipient._id,
            item: item._id,
            content: newMessage,
            createdAt: new Date().toISOString(),
        };

        // Emit via socket for real-time
        socket.current.emit('send_message', messageData);

        // Save to DB via API
        try {
            await api.post('/chat', messageData);
            setMessages((prev) => [...prev, messageData]);
            setNewMessage('');
        } catch (error) {
            console.error('Send Error:', error.message);
        }
    };

    const renderMessage = ({ item: msg }) => {
        const isMine = msg.sender === userInfo._id || msg.sender?._id === userInfo._id;
        return (
            <View style={[styles.messageWrapper, isMine ? styles.myMessageWrapper : styles.theirMessageWrapper]}>
                <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                    <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
                        {msg.content}
                    </Text>
                    <Text style={styles.timestamp}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
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
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color={Theme.colors.text} size={24} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.recipientName}>{recipient.name}</Text>
                        <Text style={styles.itemRef}>Regarding: {item.title}</Text>
                    </View>
                    <TouchableOpacity style={styles.moreButton}>
                        <MoreVertical color={Theme.colors.textMuted} size={20} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={Theme.colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(msg, index) => index.toString()}
                        contentContainerStyle={styles.messageList}
                        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
                    />
                )}

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <View style={styles.inputArea}>
                        <View style={styles.inputWrapper}>
                            <TextInput
                                style={styles.input}
                                placeholder="Type a message..."
                                placeholderTextColor={Theme.colors.textMuted}
                                value={newMessage}
                                onChangeText={setNewMessage}
                                multiline
                            />
                            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                                <LinearGradient
                                    colors={[Theme.colors.primary, Theme.colors.accent]}
                                    style={styles.sendGradient}
                                >
                                    <Send color="#fff" size={18} />
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
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
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.m,
        height: 70,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderBottomWidth: 0.5,
        borderBottomColor: Theme.colors.glassBorder,
    },
    backButton: {
        padding: 8,
    },
    headerInfo: {
        flex: 1,
        marginLeft: 8,
    },
    recipientName: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    itemRef: {
        color: Theme.colors.primary,
        fontSize: 12,
    },
    moreButton: {
        padding: 8,
    },
    messageList: {
        padding: Theme.spacing.m,
    },
    messageWrapper: {
        marginBottom: 12,
        maxWidth: '80%',
    },
    myMessageWrapper: {
        alignSelf: 'flex-end',
    },
    theirMessageWrapper: {
        alignSelf: 'flex-start',
    },
    bubble: {
        padding: 12,
        borderRadius: 20,
    },
    myBubble: {
        backgroundColor: Theme.colors.primary,
        borderBottomRightRadius: 4,
    },
    theirBubble: {
        backgroundColor: Theme.colors.glass,
        borderBottomLeftRadius: 4,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    myMessageText: {
        color: '#fff',
    },
    theirMessageText: {
        color: Theme.colors.text,
    },
    timestamp: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.5)',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    inputArea: {
        padding: Theme.spacing.m,
        paddingBottom: Platform.OS === 'ios' ? 0 : Theme.spacing.m,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.glass,
        borderRadius: 24,
        paddingLeft: 16,
        paddingRight: 6,
        paddingVertical: 6,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    input: {
        flex: 1,
        color: Theme.colors.text,
        maxHeight: 100,
        paddingTop: 8,
        paddingBottom: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
    },
    sendGradient: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen;
