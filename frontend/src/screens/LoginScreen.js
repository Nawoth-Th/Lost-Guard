import React, { useState, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/GlassInput';
import Theme from '../constants/Theme';
import { AuthContext } from '../context/AuthContext';
import { showGlassAlert } from '../utils/alertHelper';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            showGlassAlert('Error', 'Please fill in all fields', [], { type: 'error' });
            return;
        }

        try {
            setLoading(true);
            await login(email, password);
            // AuthContext update handles screen navigation
        } catch (error) {
            showGlassAlert('Login Failed', error.response?.data?.message || 'Something went wrong', [], { type: 'error' });
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
                <Text style={styles.subtitle}>Welcome back, sign in to continue</Text>
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
                    secureTextEntry={!showPassword}
                    rightIcon={showPassword ? <EyeOff size={20} color={Theme.colors.textMuted} /> : <Eye size={20} color={Theme.colors.textMuted} />}
                    rightIconOnPress={() => setShowPassword(!showPassword)}
                />

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleLogin}
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
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
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

export default LoginScreen;
