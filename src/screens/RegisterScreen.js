import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import Theme from '../constants/Theme';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = () => {
        // Implement backend registration
        navigation.navigate('Login');
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={[Theme.colors.background, '#1e1b4b']}
                style={StyleSheet.absoluteFill}
            />
            
            <View style={styles.topGlow} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Join Us</Text>
                    <Text style={styles.subtitle}>Create an account to start reporting</Text>
                </View>

                <GlassCard style={styles.card}>
                    <GlassInput
                        placeholder="Full Name"
                        value={name}
                        onChangeText={setName}
                    />
                    <GlassInput
                        placeholder="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <GlassInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity style={styles.button} onPress={handleRegister}>
                        <LinearGradient
                            colors={[Theme.colors.primary, Theme.colors.accent]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.buttonText}>Register Now</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.linkText}>Login</Text>
                        </TouchableOpacity>
                    </View>
                </GlassCard>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: Theme.spacing.l,
    },
    topGlow: {
        position: 'absolute',
        top: -100,
        left: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: Theme.colors.secondary + '22',
    },
    header: {
        marginBottom: Theme.spacing.xl,
        marginTop: 60,
    },
    title: {
        fontSize: Theme.fontSizes.xl,
        fontWeight: 'bold',
        color: Theme.colors.text,
    },
    subtitle: {
        fontSize: Theme.fontSizes.m,
        color: Theme.colors.textMuted,
        marginTop: Theme.spacing.s,
    },
    card: {
        width: '100%',
        padding: Theme.spacing.l,
    },
    button: {
        marginTop: Theme.spacing.m,
        borderRadius: Theme.spacing.s,
        overflow: 'hidden',
    },
    buttonGradient: {
        paddingVertical: Theme.spacing.m,
        alignItems: 'center',
    },
    buttonText: {
        color: Theme.colors.text,
        fontSize: Theme.fontSizes.m,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        marginTop: Theme.spacing.l,
        justifyContent: 'center',
    },
    footerText: {
        color: Theme.colors.textMuted,
    },
    linkText: {
        color: Theme.colors.primary,
        fontWeight: 'bold',
    },
});

export default RegisterScreen;
