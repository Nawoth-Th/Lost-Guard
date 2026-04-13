import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, MapPin, Tag, ChevronLeft, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import Theme from '../constants/Theme';
import api from '../api/api';
import { showGlassAlert } from '../utils/alertHelper';
import { getStorageItemAsync } from '../utils/storage';

const ReportItemScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [locationBlock, setLocationBlock] = useState('');
    const [verificationQuestion, setVerificationQuestion] = useState('');
    const [verificationAnswer, setVerificationAnswer] = useState('');
    const [type, setType] = useState('Lost');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [categories, setCategories] = useState([]);
    const [locations, setLocations] = useState([]);
    const [fetchingMetadata, setFetchingMetadata] = useState(true);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [catRes, locRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/locations')
                ]);
                setCategories(catRes.data);
                setLocations(locRes.data);
            } catch (error) {
                console.error('Fetch Metadata Error:', error.message);
            } finally {
                setFetchingMetadata(false);
            }
        };
        fetchMetadata();
    }, []);

    const handleLocationSelect = (locName) => {
        const selectedLoc = locations.find(l => l.name === locName);
        setLocation(locName);
        if (selectedLoc) {
            setLocationBlock(selectedLoc.block);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showGlassAlert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!', [], { type: 'error' });
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description || !category || !location) {
            showGlassAlert('Error', 'Please fill in all required fields', [], { type: 'error' });
            return;
        }

        setLoading(true);
        try {
            let imagePath = '';

            // 1. Upload Image if exists
            if (image) {
                const formData = new FormData();
                
                if (Platform.OS === 'web') {
                    const response = await fetch(image.uri);
                    const blob = await response.blob();
                    formData.append('image', blob, 'photo.jpg');
                } else {
                    const uriParts = image.uri.split('.');
                    const fileType = uriParts[uriParts.length - 1] || 'jpeg';

                    formData.append('image', {
                        uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
                        name: `photo.${fileType}`,
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
                    throw new Error('Failed to upload image to the server');
                }
                
                const uploadedPath = await uploadResponse.json();
                imagePath = uploadedPath;
            }

            if (type === 'Found' && (!verificationQuestion || !verificationAnswer)) {
                showGlassAlert('Error', 'Please provide a security question and answer for found items', [], { type: 'error' });
                setLoading(false);
                return;
            }

            // 2. Create Item
            const itemData = {
                title,
                description,
                category,
                location,
                locationBlock,
                type,
                image: imagePath,
                verificationQuestion,
                verificationAnswer,
            };

            await api.post('/items', itemData);
            
            showGlassAlert(
                'Thank you!', 
                'Your report has been successfully submitted. Helping others find their lost items is what makes our community great!', 
                [{ text: 'OK', onPress: () => navigation.navigate('Home') }],
                { type: 'success' }
            );
        } catch (error) {
            console.error('Report Error:', error.response?.data?.message || error.message);
            showGlassAlert('Error', error.response?.data?.message || 'Failed to submit report', [], { type: 'error' });
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
                        <View style={styles.typeSelector}>
                            <TouchableOpacity 
                                style={[styles.typeButton, type === 'Lost' && styles.activeType]}
                                onPress={() => setType('Lost')}
                            >
                                <Text style={[styles.typeText, type === 'Lost' && styles.activeTypeText]}>Lost</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.typeButton, type === 'Found' && styles.activeType]}
                                onPress={() => setType('Found')}
                            >
                                <Text style={[styles.typeText, type === 'Found' && styles.activeTypeText]}>Found</Text>
                            </TouchableOpacity>
                        </View>

                        <GlassCard style={styles.card}>
                            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                                {image ? (
                                    <View style={styles.imagePreviewContainer}>
                                        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                                        <TouchableOpacity style={styles.removeImage} onPress={() => setImage(null)}>
                                            <X color="#fff" size={16} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <>
                                        <Camera color={Theme.colors.textMuted} size={40} />
                                        <Text style={styles.imagePickerText}>Upload Image</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <Text style={styles.label}>Item Title *</Text>
                            <GlassInput
                                placeholder="What did you lose/find?"
                                value={title}
                                onChangeText={setTitle}
                            />

                            <Text style={styles.label}>Category *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                                {categories.map((cat) => (
                                    <TouchableOpacity 
                                        key={cat._id}
                                        style={[styles.chip, category === cat.name && styles.activeChip]}
                                        onPress={() => setCategory(cat.name)}
                                    >
                                        <Text style={[styles.chipText, category === cat.name && styles.activeChipText]}>{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={styles.label}>Description *</Text>
                            <View style={styles.textAreaContainer}>
                                <TextInput
                                    style={styles.textArea}
                                    placeholder="Provide more details..."
                                    placeholderTextColor={Theme.colors.textMuted}
                                    multiline
                                    numberOfLines={4}
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>

                            <Text style={styles.label}>Precise Location *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
                                {locations.map((loc) => (
                                    <TouchableOpacity 
                                        key={loc._id}
                                        style={[styles.chip, location === loc.name && styles.activeChip]}
                                        onPress={() => handleLocationSelect(loc.name)}
                                    >
                                        <Text style={[styles.chipText, location === loc.name && styles.activeChipText]}>{loc.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {type === 'Found' && (
                                <View style={styles.securitySection}>
                                    <View style={styles.divider} />
                                    <Text style={styles.securityTitle}>Ownership Verification 🛡️</Text>
                                    <Text style={styles.securitySub}>Set a question only the owner can answer to avoid false claims.</Text>
                                    
                                    <Text style={styles.label}>Verification Question *</Text>
                                    <GlassInput
                                        placeholder="e.g. What is the color of the pouch?"
                                        value={verificationQuestion}
                                        onChangeText={setVerificationQuestion}
                                    />

                                    <Text style={styles.label}>Correct Answer *</Text>
                                    <GlassInput
                                        placeholder="The actual answer..."
                                        value={verificationAnswer}
                                        onChangeText={setVerificationAnswer}
                                    />
                                </View>
                            )}

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
                                        <Text style={styles.submitText}>Submit Report</Text>
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
    typeSelector: {
        flexDirection: 'row',
        backgroundColor: Theme.colors.glass,
        borderRadius: 25,
        padding: 4,
        marginBottom: Theme.spacing.l,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 21,
    },
    activeType: {
        backgroundColor: Theme.colors.primary,
    },
    typeText: {
        color: Theme.colors.textMuted,
        fontWeight: 'bold',
    },
    activeTypeText: {
        color: Theme.colors.text,
    },
    card: {
        padding: Theme.spacing.l,
    },
    imagePicker: {
        width: '100%',
        height: 180,
        borderRadius: Theme.spacing.s,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: Theme.colors.glassBorder,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Theme.spacing.l,
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
        marginBottom: Theme.spacing.m,
        padding: Theme.spacing.m,
    },
    textArea: {
        color: Theme.colors.text,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Theme.colors.glass,
        borderRadius: Theme.spacing.s,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
        paddingHorizontal: Theme.spacing.s,
        marginBottom: Theme.spacing.xl,
    },
    locationIcon: {
        marginLeft: 8,
    },
    submitButton: {
        borderRadius: Theme.spacing.s,
        overflow: 'hidden',
    },
    submitGradient: {
        paddingVertical: Theme.spacing.m,
        alignItems: 'center',
        minHeight: 50,
        justifyContent: 'center',
    },
    submitText: {
        color: Theme.colors.text,
        fontWeight: 'bold',
        fontSize: Theme.fontSizes.m,
    },
    chipContainer: {
        flexDirection: 'row',
        marginBottom: Theme.spacing.m,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Theme.colors.glass,
        borderWidth: 0.5,
        borderColor: Theme.colors.glassBorder,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeChip: {
        backgroundColor: Theme.colors.primary,
        borderColor: Theme.colors.primary,
    },
    chipText: {
        color: Theme.colors.textMuted,
        fontSize: 13,
        fontWeight: '600',
    },
    activeChipText: {
        color: Theme.colors.text,
    },
    securitySection: {
        marginTop: Theme.spacing.m,
        marginBottom: Theme.spacing.l,
    },
    divider: {
        height: 1,
        backgroundColor: Theme.colors.glassBorder,
        marginBottom: Theme.spacing.m,
    },
    securityTitle: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    securitySub: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        marginBottom: Theme.spacing.m,
    },
});

export default ReportItemScreen;
