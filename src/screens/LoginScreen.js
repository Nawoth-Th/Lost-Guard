import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import Theme from '../constants/Theme';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // Implement backend login
        navigation.navigate('Home');
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
            <View style={styles.bottomGlow} />

            <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>

            <GlassCard style={styles.card}>
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

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <LinearGradient
                        colors={[Theme.colors.primary, Theme.colors.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        <Text style={styles.buttonText}>Sign In</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.linkText}>Register</Text>
                    </TouchableOpacity>
                </View>
            </GlassCard>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: Theme.spacing.l,
    },
    topGlow: {
        position: 'absolute',
        top: -100,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: Theme.colors.primary + '22',
    },
    bottomGlow: {
        position: 'absolute',
        bottom: -50,
        left: -50,
        width: 250,
        height: 250,
        borderRadius: 125,
        backgroundColor: Theme.colors.accent + '11',
    },
    header: {
        marginBottom: Theme.spacing.xl,
    },
    title: {
        fontSize: Theme.fontSizes.xl,
        fontWeight: 'bold',
        color: Theme.colors.text,
        textAlign: 'left',
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

export default LoginScreen;
