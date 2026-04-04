import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, MapPin, Tag, ChevronLeft } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import Theme from '../constants/Theme';

const ReportItemScreen = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('Lost'); // Default

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
                        <TouchableOpacity style={styles.imagePicker}>
                            <Camera color={Theme.colors.textMuted} size={40} />
                            <Text style={styles.imagePickerText}>Upload Image</Text>
                        </TouchableOpacity>

                        <Text style={styles.label}>Item Title</Text>
                        <GlassInput
                            placeholder="What did you lose/find?"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.label}>Category</Text>
                        <GlassInput
                            placeholder="e.g. Electronics, Pets"
                        />

                        <Text style={styles.label}>Description</Text>
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

                        <Text style={styles.label}>Location</Text>
                        <View style={styles.locationContainer}>
                            <MapPin size={18} color={Theme.colors.primary} style={styles.locationIcon} />
                            <GlassInput
                                placeholder="Where did it happen?"
                                style={{ flex: 1, marginBottom: 0, borderWidth: 0 }}
                                value={location}
                                onChangeText={setLocation}
                            />
                        </View>

                        <TouchableOpacity style={styles.submitButton}>
                            <LinearGradient
                                colors={[Theme.colors.primary, Theme.colors.accent]}
                                style={styles.submitGradient}
                            >
                                <Text style={styles.submitText}>Submit Report</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </GlassCard>
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
        height: 150,
        borderRadius: Theme.spacing.s,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: Theme.colors.glassBorder,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Theme.spacing.l,
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
    },
    submitText: {
        color: Theme.colors.text,
        fontWeight: 'bold',
        fontSize: Theme.fontSizes.m,
    },
});

export default ReportItemScreen;
