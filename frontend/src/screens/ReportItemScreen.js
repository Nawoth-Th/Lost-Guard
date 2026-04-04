import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, MapPin, Tag, ChevronLeft, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import Theme from '../constants/Theme';
import api from '../api/api';

const ReportItemScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('Lost');
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description || !category || !location) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        try {
            let imagePath = '';

            // 1. Upload Image if exists
            if (image) {
                const formData = new FormData();
                const uriParts = image.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formData.append('image', {
                    uri: image.uri,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`,
                });

                const { data: uploadedPath } = await api.post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                imagePath = uploadedPath;
            }

            // 2. Create Item
            const itemData = {
                title,
                description,
                category,
                location,
                type,
                image: imagePath,
            };

            await api.post('/items', itemData);
            
            Alert.alert('Success', 'Item reported successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Home') }
            ]);
        } catch (error) {
            console.error('Report Error:', error.response?.data?.message || error.message);
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit report');
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
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                        <ChevronLeft color={Theme.colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Report Item</Text>
                    <View style={{ width: 44 }} />
                </View>

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
                            <GlassInput
                                placeholder="e.g. Electronics, Pets"
                                value={category}
                                onChangeText={setCategory}
                            />

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

                            <Text style={styles.label}>Location *</Text>
                            <View style={styles.locationContainer}>
                                <MapPin size={18} color={Theme.colors.primary} style={styles.locationIcon} />
                                <GlassInput
                                    placeholder="Where did it happen?"
                                    style={{ flex: 1, marginBottom: 0, borderWidth: 0 }}
                                    value={location}
                                    onChangeText={setLocation}
                                />
                            </View>

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
        paddingBottom: 40,
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
});

export default ReportItemScreen;
