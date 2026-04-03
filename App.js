import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import Theme from './src/constants/Theme';

// Import Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import ReportItemScreen from './src/screens/ReportItemScreen';

const Stack = createStackNavigator();

const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
        ...DarkTheme.colors,
        background: Theme.colors.background,
        primary: Theme.colors.primary,
        card: Theme.colors.background,
        text: Theme.colors.text,
        border: Theme.colors.glassBorder,
    },
};

export default function App() {
    return (
        <NavigationContainer theme={CustomDarkTheme}>
            <StatusBar style="light" />
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerShown: false,
                    gestureEnabled: true,
                    headerTransparent: true,
                    headerTintColor: Theme.colors.text,
                    headerTitleStyle: { fontWeight: 'bold' },
                }}
            >
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ReportItem" component={ReportItemScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
