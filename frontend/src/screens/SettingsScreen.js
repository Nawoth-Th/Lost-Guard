import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import Theme from '../constants/Theme';
import { AuthContext } from '../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
    const { userInfo, updateProfile } = useContext(AuthContext);

    const [name, setName] = useState(userInfo?.name || '');
    const [email, setEmail] = useState(userInfo?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSaveProfile = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert('Error', 'Name and Email are required.');
            return;
        }

        const profileData = { name: name.trim(), email: email.trim() };

        if (newPassword) {
            if (newPassword.length < 6) {
                Alert.alert('Error', 'Password must be at least 6 characters.');
                return;
            }
            if (newPassword !== confirmPassword) {
                Alert.alert('Error', 'New passwords do not match.');
                return;
            }
            profileData.password = newPassword;
        }

        try {
            setLoading(true);
            await updateProfile(profileData);
            Alert.alert('Success ✅', 'Your profile has been updated!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ icon: Icon, label, value, onChangeText, placeholder, secureTextEntry, showToggle, onToggle, showPassword }) => (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <GlassCard style={styles.inputCard}>
                <View style={styles.inputIcon}>
                    <Icon size={18} color={Theme.colors.primary} />
                </View>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={Theme.colors.textMuted}
                    secureTextEntry={secureTextEntry && !showPassword}
                    autoCapitalize="none"
                />
                {showToggle && (
                    <TouchableOpacity onPress={onToggle} style={styles.eyeButton}>
                        {showPassword ? <EyeOff size={18} color={Theme.colors.textMuted} /> : <Eye size={18} color={Theme.colors.textMuted} />}
                    </TouchableOpacity>
                )}
            </GlassCard>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={[Theme.colors.background, '#0f172a']} style={StyleSheet.absoluteFill} />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <ChevronLeft color={Theme.colors.text} size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Account Settings</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    {/* Profile Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Profile Information</Text>
                        <InputField
                            icon={User}
                            label="Full Name"
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                        />
                        <InputField
                            icon={Mail}
                            label="Email Address"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                        />
                    </View>

                    {/* Password Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Change Password</Text>
                        <Text style={styles.sectionHint}>Leave blank to keep your current password</Text>
                        <InputField
                            icon={Lock}
                            label="New Password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Enter new password"
                            secureTextEntry
                            showToggle
                            showPassword={showNewPassword}
                            onToggle={() => setShowNewPassword(!showNewPassword)}
                        />
                        <InputField
                            icon={Lock}
                            label="Confirm New Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm new password"
                            secureTextEntry
                        />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity onPress={handleSaveProfile} disabled={loading} style={styles.saveButtonWrapper}>
                        <LinearGradient
                            colors={[Theme.colors.primary, Theme.colors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.saveButton}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Save size={20} color="#fff" />
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
                                </>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.l,
        height: 60,
    },
    backButton: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: Theme.colors.glass,
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 0.5, borderColor: Theme.colors.glassBorder,
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
    section: {
        marginBottom: 28,
    },
    sectionLabel: {
        color: Theme.colors.textMuted,
        fontSize: 12, fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4, marginLeft: 4,
    },
    sectionHint: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        marginBottom: 12, marginLeft: 4,
        fontStyle: 'italic',
    },
    inputGroup: {
        marginTop: 14,
    },
    inputLabel: {
        color: Theme.colors.text,
        fontSize: 13, fontWeight: '600',
        marginBottom: 6, marginLeft: 4,
    },
    inputCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 0,
        height: 52,
    },
    inputIcon: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: `${Theme.colors.primary}15`,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: Theme.colors.text,
        fontSize: 15,
        height: 52,
    },
    eyeButton: {
        padding: 8,
    },
    saveButtonWrapper: {
        marginTop: 10,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 6,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 10,
        borderRadius: 16,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SettingsScreen;
