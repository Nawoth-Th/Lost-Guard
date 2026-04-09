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

const Stack = createNativeStackNavigator();

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

function Navigation() {
    const { userToken, isLoading } = React.useContext(AuthContext);

    if (isLoading) {
        return null;
    }

    return (
        <NavigationContainer>
            {userToken ? <AppStack /> : <AuthStack />}
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
