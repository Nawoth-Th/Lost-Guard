import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Context
import { AuthProvider, AuthContext } from './src/context/AuthContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import ReportItemScreen from './src/screens/ReportItemScreen';
import ClaimScreen from './src/screens/ClaimScreen';
import ChatScreen from './src/screens/ChatScreen';
import InboxScreen from './src/screens/InboxScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MyItemsScreen from './src/screens/MyItemsScreen';
import MyClaimsScreen from './src/screens/MyClaimsScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ArchivesScreen from './src/screens/ArchivesScreen';

// Components
import FloatingHeader from './src/components/FloatingHeader';
import FloatingBottomMenu from './src/components/FloatingBottomMenu';
import { View, StyleSheet, DeviceEventEmitter } from 'react-native';
import Theme from './src/constants/Theme';
import { ShieldCheck, Share2 } from 'lucide-react-native';

const Stack = createNativeStackNavigator();
const navigationRef = React.createRef();

function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}

function AppStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
            <Stack.Screen name="ReportItem" component={ReportItemScreen} />
            <Stack.Screen name="Claim" component={ClaimScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Inbox" component={InboxScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="MyItems" component={MyItemsScreen} />
            <Stack.Screen name="MyClaims" component={MyClaimsScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} /> 
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
            <Stack.Screen name="Archives" component={ArchivesScreen} />
        </Stack.Navigator>
    );
}

function AppContent({ currentRoute }) {
    const { userInfo } = React.useContext(AuthContext);
    const [activeAdminTab, setActiveAdminTab] = React.useState('Claims');

    React.useEffect(() => {
        const sub = DeviceEventEmitter.addListener('MODERATION_TAB_CHANGE', (data) => {
            setActiveAdminTab(data.tab);
        });
        return () => sub.remove();
    }, []);
    
    const hideMenuOn = ['ReportItem', 'Chat', 'Claim', 'ItemDetail', 'Settings'];
    const showMenu = !hideMenuOn.includes(currentRoute);

    const getTitle = (route) => {
        switch(route) {
            case 'Home': return 'Lost Guard';
            case 'Profile': return 'My Profile';
            case 'Leaderboard': return 'Leaderboard';
            case 'Inbox': return 'Inbox';
            case 'Settings': return 'Settings';
            case 'MyItems': return 'My Items';
            case 'MyClaims': return 'My Claims';
            case 'Archives': return 'Archives';
            case 'ReportItem': return 'Report Item';
            case 'AdminDashboard': return 'Moderation';
            default: return 'Lost Guard';
        }
    };

    const isMainScreen = ['Home', 'Profile', 'Leaderboard', 'Inbox'].includes(currentRoute);
    const hidePlusOn = ['MyClaims', 'Claim', 'ReportItem'];
    
    // Hide plus button on Admin Dashboard if "Claims" tab is active
    const showPlus = !hidePlusOn.includes(currentRoute) && 
                    !(currentRoute === 'AdminDashboard' && activeAdminTab === 'Claims');

    const hideHeaderOn = ['Chat'];
    const showHeader = !hideHeaderOn.includes(currentRoute);

    const handlePlusPress = () => {
        if (currentRoute === 'AdminDashboard') {
            DeviceEventEmitter.emit('MODERATION_ADD');
        } else if (currentRoute === 'ItemDetail') {
            DeviceEventEmitter.emit('ITEM_SHARE');
        } else {
            navigationRef.current?.navigate('ReportItem');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <AppStack />
            {/* These components are floating and global */}
            {showHeader && (
                <FloatingHeader 
                    title={getTitle(currentRoute)}
                    greeting={currentRoute === 'Home' ? `Hey ${userInfo?.name || 'there'}!` : null}
                    showBack={!isMainScreen}
                    showPlus={showPlus}
                    centerTitle={currentRoute === 'AdminDashboard'}
                    titleIcon={currentRoute === 'AdminDashboard' ? <ShieldCheck color="#FBBF24" size={20} /> : null}
                    plusVariant={currentRoute === 'AdminDashboard' ? 'dashboard' : 'premium'}
                    rightIcon={currentRoute === 'ItemDetail' ? <Share2 color={Theme.colors.text} size={20} /> : null}
                    onBackPress={() => navigationRef.current?.goBack()}
                    onPlusPress={handlePlusPress}
                    onRightPress={handlePlusPress}
                />
            )}
            {showMenu && <FloatingBottomMenu navigation={navigationRef.current} />}
        </View>
    );
}

function Navigation() {
    const { userToken, isLoading } = React.useContext(AuthContext);
    const [currentRoute, setCurrentRoute] = React.useState('Home');

    if (isLoading) {
        return null;
    }

    return (
        <NavigationContainer 
            ref={navigationRef}
            onStateChange={() => {
                const routeName = navigationRef.current?.getCurrentRoute()?.name;
                setCurrentRoute(routeName);
            }}
        >
            {userToken ? <AppContent currentRoute={currentRoute} /> : <AuthStack />}
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <StatusBar style="light" />
                <Navigation />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
