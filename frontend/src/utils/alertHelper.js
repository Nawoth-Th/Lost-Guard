import { DeviceEventEmitter } from 'react-native';

/**
 * Show a themed glassmorphism alert.
 * 
 * @param {string} title - Alert Title
 * @param {string} message - Alert Message
 * @param {Array} buttons - Array of button objects: { text, onPress, style }
 * @param {Object} options - Additional options: { type: 'success' | 'error' | 'warning', icon: string }
 */
export const showGlassAlert = (title, message, buttons = [], options = {}) => {
    DeviceEventEmitter.emit('GLOBAL_ALERT_SHOW', {
        title,
        message,
        buttons: buttons.length > 0 ? buttons : [{ text: 'OK' }],
        type: options.type || 'info', 
        icon: options.icon || null
    });
};
