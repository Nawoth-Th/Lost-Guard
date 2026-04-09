import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, User, Package, ClipboardList, ShieldCheck, LogOut, Settings, ChevronRight, Archive } from 'lucide-react-native';
import GlassCard from '../components/GlassCard';
import Theme from '../constants/Theme';
import { AuthContext } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
    const { userInfo, logout } = useContext(AuthContext);

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Logout", onPress: logout, style: "destructive" }
            ]
        );
    };

    const MenuItem = ({ icon: Icon, title, subtitle, onPress, color = Theme.colors.text }) => (
        <TouchableOpacity onPress={onPress} style={styles.menuItemWrapper}>
            <GlassCard style={styles.menuItem}>
                <View style={[styles.iconBox, { backgroundColor: `${color}15` }]}>
                    <Icon size={22} color={color} />
                </View>
                <View style={styles.menuText}>
                    <Text style={styles.menuTitle}>{title}</Text>
                    {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
                </View>
                <ChevronRight size={18} color={Theme.colors.textMuted} />
            </GlassCard>
        </TouchableOpacity>
    );

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
                    <Text style={styles.headerTitle}>Profile</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.backButton}>
                        <Settings color={Theme.colors.text} size={22} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* User Info Header */}
                    <View style={styles.userHeader}>
                        <LinearGradient
                            colors={[Theme.colors.primary, Theme.colors.accent]}
                            style={styles.avatarContainer}
                        >
                            <User size={40} color="#fff" />
                        </LinearGradient>
                        <Text style={styles.userName}>{userInfo?.name || 'Guest User'}</Text>
                        <Text style={styles.userEmail}>{userInfo?.email || 'user@example.com'}</Text>
                        
                        {userInfo?.isAdmin && (
                            <View style={styles.adminBadge}>
                                <ShieldCheck size={14} color="#FBBF24" />
                                <Text style={styles.adminBadgeText}>ADMINISTRATOR</Text>
                            </View>
                        )}
                    </View>

                    {/* Menu Sections */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>My Activity</Text>
                        <MenuItem 
                            icon={Package} 
                            title="My Reported Items" 
                            subtitle="Track items you've posted"
                            onPress={() => navigation.navigate('MyItems')}
                            color={Theme.colors.primary}
                        />
                        <MenuItem 
                            icon={Archive} 
                            title="Archives" 
                            subtitle="View past and recovered items"
                            onPress={() => navigation.navigate('Archives')}
                            color={Theme.colors.primary}
                        />
                        <MenuItem 
                            icon={ClipboardList} 
                            title="My Claims" 
                            subtitle="Status of items you've claimed"
                            onPress={() => navigation.navigate('MyClaims')}
                            color={Theme.colors.accent}
                        />
                    </View>

                    {userInfo?.isAdmin && (
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>Moderation</Text>
                            <MenuItem 
                                icon={ShieldCheck} 
                                title="Admin Dashboard" 
                                subtitle="Review all pending claims globally"
                                onPress={() => navigation.navigate('AdminDashboard')}
                                color="#FBBF24"
                            />
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Account</Text>
                        <MenuItem 
                            icon={LogOut} 
                            title="Logout" 
                            onPress={handleLogout}
                            color="#ef4444"
                        />
                    </View>
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
    scrollContent: {
        padding: Theme.spacing.l,
    },
    userHeader: {
        alignItems: 'center',
        marginBottom: Theme.spacing.xl,
        marginTop: Theme.spacing.m,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        elevation: 8,
        shadowColor: Theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    userName: {
        color: Theme.colors.text,
        fontSize: 22,
        fontWeight: 'bold',
    },
    userEmail: {
        color: Theme.colors.textMuted,
        fontSize: 14,
        marginTop: 4,
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 12,
        borderWidth: 0.5,
        borderColor: 'rgba(251, 191, 36, 0.3)',
        gap: 6,
    },
    adminBadgeText: {
        color: '#FBBF24',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    section: {
        marginBottom: Theme.spacing.l,
    },
    sectionLabel: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    menuItemWrapper: {
        marginBottom: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
    },
    menuTitle: {
        color: Theme.colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    menuSubtitle: {
        color: Theme.colors.textMuted,
        fontSize: 12,
        marginTop: 2,
    },
});

export default ProfileScreen;
