import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, ChevronLeft, X, Send, ShieldCheck } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import Theme from '../constants/Theme';
import api from '../api/api';
import { getStorageItemAsync } from '../utils/storage';

const ClaimScreen = ({ route, navigation }) => {
    const { item } = route.params;
    const [message, setMessage] = useState('');
    const [verificationAnswer, setVerificationAnswer] = useState('');
    const [proofImage, setProofImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera roll permissions are required.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            setProofImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!message) {
            Alert.alert('Error', 'Please provide a message with details to prove ownership.');
            return;
        }

        setLoading(true);
        try {
            let proofImagePath = '';

            // 1. Upload Proof Image if exists
            if (proofImage) {
                const formData = new FormData();
                if (Platform.OS === 'web') {
                    const response = await fetch(proofImage.uri);
                    const blob = await response.blob();
                    formData.append('image', blob, 'proof.jpg');
                } else {
                    const uriParts = proofImage.uri.split('.');
                    const fileType = uriParts[uriParts.length - 1] || 'jpeg';

                    formData.append('image', {
                        uri: Platform.OS === 'ios' ? proofImage.uri.replace('file://', '') : proofImage.uri,
                        name: `proof.${fileType}`,
                        type: `image/${fileType}`,
                    });
                }

                const token = await getStorageItemAsync('userToken');
                const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

                const uploadResponse = await fetch(`${BASE_URL}/upload`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                        // Explicitly NOT setting Content-Type so fetch auto-generates the multipart boundary
                    },
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload proof image to the server');
                }
                
                const uploadedPath = await uploadResponse.json();
                proofImagePath = uploadedPath;
            }

            // 2. Submit Claim
            await api.post('/claims', {
                itemId: item._id,
                message,
                proofImage: proofImagePath,
                verificationAnswer,
            });

            Alert.alert('Success', 'Claim submitted successfully! The owner will review your request.', [
                { text: 'OK', onPress: () => navigation.navigate('Home') }
            ]);
        } catch (error) {
            console.error('Claim Error:', error.response?.data?.message || error.message);
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit claim');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[Theme.colors.background, '#1e1b4b']}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 100 }} /> {/* Spacer for global FloatingHeader */}

                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.itemRef}>Claiming: {item.title}</Text>
                        
                        <GlassCard style={styles.card}>
                            {item.verificationQuestion && (
                                <View style={styles.verificationSection}>
                                    <View style={styles.verificationHeader}>
                                        <ShieldCheck size={20} color={Theme.colors.primary} />
                                        <Text style={styles.verificationTitle}>Security Question</Text>
                                    </View>
                                    <Text style={styles.questionText}>"{item.verificationQuestion}"</Text>
                                    <Text style={styles.label}>Your Answer *</Text>
                                    <GlassInput
                                        placeholder="Answer correctly to prove ownership..."
                                        value={verificationAnswer}
                                        onChangeText={setVerificationAnswer}
                                        style={styles.answerInput}
                                    />
                                    <View style={styles.divider} />
                                </View>
                            )}
                            
                            <Text style={styles.instruction}>
                                Provide a detailed description or proof (like a photo of the receipt, specific identifying marks, or the serial number) to help the owner verify you.
                            </Text>

                            <Text style={styles.label}>Your Message *</Text>
                            <View style={styles.textAreaContainer}>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Describe how you know this item is yours..."
                                    placeholderTextColor={Theme.colors.textMuted}
                                    multiline
                                    numberOfLines={6}
                                    value={message}
                                    onChangeText={setMessage}
                                />
                            </View>

                            <Text style={styles.label}>Proof Image (Optional)</Text>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {proofImage ? (
                                    <View style={styles.imagePreviewContainer}>
                                        <Image source={{ uri: proofImage.uri }} style={styles.imagePreview} />
                                        <TouchableOpacity style={styles.removeImage} onPress={() => setProofImage(null)}>
                                            <X color="#fff" size={16} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <>
                                        <Camera color={Theme.colors.textMuted} size={32} />
                                        <Text style={styles.imagePickerText}>Upload Proof Photo</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={styles.submitButton} 
                                onPress={handleSubmit}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={[Theme.colors.primary, Theme.colors.accent]}
                                    style={styles.submitGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <>
                                            <Send color="#fff" size={18} style={{ marginRight: 8 }} />
                                            <Text style={styles.submitText}>Submit Claim Request</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </GlassCard>
                    </ScrollView>
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
        paddingBottom: 120, // Space for bottom menu
    },
    itemRef: {
        color: Theme.colors.primary,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: Theme.spacing.l,
        textAlign: 'center',
    },
    card: {
        padding: Theme.spacing.l,
    },
    instruction: {
        color: Theme.colors.textMuted,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: Theme.spacing.l,
        fontStyle: 'italic',
    },
    label: {
        color: Theme.colors.text,
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    textAreaContainer: {
        backgroundColor: Theme.colors.glass,
        borderRadius: Theme.spacing.s,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
        marginBottom: Theme.spacing.l,
        padding: Theme.spacing.m,
    },
    textArea: {
        color: Theme.colors.text,
        textAlignVertical: 'top',
        minHeight: 120,
    },
    imagePicker: {
        width: '100%',
        height: 150,
        borderRadius: Theme.spacing.s,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: Theme.colors.glassBorder,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Theme.spacing.xl,
        overflow: 'hidden',
    },
    imagePreviewContainer: {
        width: '100%',
        height: '100%',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    removeImage: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePickerText: {
        color: Theme.colors.textMuted,
        marginTop: 8,
        fontSize: 12,
    },
    submitButton: {
        borderRadius: Theme.spacing.s,
        overflow: 'hidden',
    },
    submitGradient: {
        paddingVertical: Theme.spacing.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    submitText: {
        color: Theme.colors.text,
        fontWeight: 'bold',
        fontSize: Theme.fontSizes.m,
    },
    verificationSection: {
        marginBottom: Theme.spacing.l,
    },
    verificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    verificationTitle: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    questionText: {
        color: Theme.colors.primary,
        fontSize: 15,
        fontWeight: '600',
        fontStyle: 'italic',
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        padding: 12,
        borderRadius: 8,
        marginBottom: Theme.spacing.m,
    },
    answerInput: {
        marginBottom: Theme.spacing.m,
    },
    divider: {
        height: 1,
        backgroundColor: Theme.colors.glassBorder,
        marginVertical: Theme.spacing.m,
    },
});

export default ClaimScreen;
