import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import Theme from '../constants/Theme';
import { AuthContext } from '../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useContext(AuthContext);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            await register(name, email, password);
            // AuthContext update handles screen navigation
        } catch (error) {
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
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
                <Text style={styles.title}>Lost Guard</Text>
                <Text style={styles.subtitle}>Create an account to join the community</Text>
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
                <GlassInput
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <LinearGradient
                        colors={[Theme.colors.primary, Theme.colors.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Register</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                        <Text style={styles.linkText}>Login</Text>
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
        minHeight: 50,
        justifyContent: 'center',
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
