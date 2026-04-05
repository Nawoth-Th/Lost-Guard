import React, { createContext, useState, useEffect } from 'react';
import { getStorageItemAsync, setStorageItemAsync, deleteStorageItemAsync } from '../utils/storage';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [userInfo, setUserInfo] = useState(null);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/users/login', { email, password });
            setUserInfo(data);
            setUserToken(data.token);
            await setStorageItemAsync('userToken', data.token);
            await setStorageItemAsync('userInfo', JSON.stringify(data));
        } catch (error) {
            console.error('Login Error:', error.response?.data?.message || error.message);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/users', { name, email, password });
            setUserInfo(data);
            setUserToken(data.token);
            await setStorageItemAsync('userToken', data.token);
            await setStorageItemAsync('userInfo', JSON.stringify(data));
        } catch (error) {
            console.error('Register Error:', error.response?.data?.message || error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setUserToken(null);
            setUserInfo(null);
            await deleteStorageItemAsync('userToken');
            await deleteStorageItemAsync('userInfo');
        } catch (error) {
            console.error('Logout Error:', error.message);
        }
    };

    const updateProfile = async (profileData) => {
        try {
            const { data } = await api.put('/users/profile', profileData);
            setUserInfo(data);
            setUserToken(data.token);
            await setStorageItemAsync('userToken', data.token);
            await setStorageItemAsync('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Update Profile Error:', error.response?.data?.message || error.message);
            throw error;
        }
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let token = await getStorageItemAsync('userToken');
            let info = await getStorageItemAsync('userInfo');
            
            if (token) {
                setUserToken(token);
                setUserInfo(JSON.parse(info));
            }
            setIsLoading(false);
        } catch (error) {
            console.error('isLoggedIn Error:', error.message);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value={{ login, register, logout, updateProfile, isLoading, userToken, userInfo }}>
            {children}
        </AuthContext.Provider>
    );
};
