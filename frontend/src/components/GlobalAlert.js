import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, Animated, DeviceEventEmitter, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react-native';
import GlassCard from './GlassCard';
import Theme from '../constants/Theme';

const { width } = Dimensions.get('window');

const GlobalAlert = () => {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        buttons: [],
        type: 'info',
    });

    const scaleAnim = useState(new Animated.Value(0.8))[0];
    const opacityAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        const sub = DeviceEventEmitter.addListener('GLOBAL_ALERT_SHOW', (data) => {
            setConfig(data);
            setVisible(true);
            
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        });

        return () => sub.remove();
    }, []);

    const handleClose = (onPress) => {
        Animated.parallel([
            Animated.timing(scaleAnim, {
                toValue: 0.8,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setVisible(false);
            if (onPress) onPress();
        });
    };

    if (!visible) return null;

    const getIcon = () => {
        const size = 32;
        switch (config.type) {
            case 'success': return <CheckCircle2 size={size} color="#10b981" />;
            case 'error': return <XCircle size={size} color="#ef4444" />;
            case 'warning': return <AlertCircle size={size} color="#f59e0b" />;
            default: return <Info size={size} color={Theme.colors.primary} />;
        }
    };

    return (
        <Modal transparent visible={visible} animationType="none">
            <BlurView intensity={80} tint="dark" style={styles.overlay}>
                <Animated.View style={[
                    styles.container, 
                    { transform: [{ scale: scaleAnim }], opacity: opacityAnim }
                ]}>
                    <GlassCard style={styles.alertCard} priority="high">
                        <View style={styles.header}>
                            <View style={[styles.iconContainer, { backgroundColor: config.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)' }]}>
                                {getIcon()}
                            </View>
                            <Text style={styles.title}>{config.title}</Text>
                        </View>
                        
                        <Text style={styles.message}>{config.message}</Text>
                        
                        <View style={styles.buttonContainer}>
                            {config.buttons.map((btn, index) => (
                                <TouchableOpacity 
                                    key={index}
                                    style={[
                                        styles.button, 
                                        btn.style === 'destructive' ? styles.destructiveBtn : 
                                        config.buttons.length === 1 ? styles.primaryBtn : styles.secondaryBtn,
                                        index > 0 && { marginLeft: 10 }
                                    ]}
                                    onPress={() => handleClose(btn.onPress)}
                                >
                                    <Text style={[
                                        styles.buttonText,
                                        (btn.style === 'destructive' || config.buttons.length === 1) ? styles.buttonTextMain : styles.buttonTextSub
                                    ]}>
                                        {btn.text || 'OK'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </GlassCard>
                </Animated.View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    container: {
        width: width * 0.85,
        maxWidth: 400,
    },
    alertCard: {
        padding: Theme.spacing.l,
        alignItems: 'center',
        borderRadius: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        color: Theme.colors.text,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    message: {
        color: Theme.colors.textMuted,
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
    },
    button: {
        flex: 1,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtn: {
        backgroundColor: Theme.colors.primary,
    },
    secondaryBtn: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: Theme.colors.glassBorder,
    },
    destructiveBtn: {
        backgroundColor: '#ef4444',
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    buttonTextMain: {
        color: '#fff',
    },
    buttonTextSub: {
        color: Theme.colors.textMuted,
    }
});

export default GlobalAlert;
