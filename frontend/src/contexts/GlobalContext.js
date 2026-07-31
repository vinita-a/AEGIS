import React, { createContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { API_BASE_URL } from '../config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isContextLoaded, setIsContextLoaded] = useState(false);

  // Populated after login (SOSScreen.js needs this to identify the victim & text the contact)
  const [userProfile, setUserProfile] = useState({
    name: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  // The currently dispatched SOS record (null when no SOS is active), and any dispatch error
  const [activeSOS, setActiveSOS] = useState(null);
  const [sosError, setSosError] = useState(null);

  const toggleSOS = () => setIsSOSActive(!isSOSActive);
  const addNotification = (notification) => setNotifications((prev) => [notification, ...prev]);
  const removeNotification = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearNotifications = () => setNotifications([]);
  
  const handleSetUser = async (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    await AsyncStorage.setItem('@aegis_user', JSON.stringify(userData));
  };

  const logout = async () => { 
    setUser(null); 
    setIsLoggedIn(false); 
    await AsyncStorage.removeItem('@aegis_user');
  };

  useEffect(() => {
    const loadState = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@aegis_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error("Failed to load user state", e);
      } finally {
        setIsContextLoaded(true);
      }
    };
    loadState();
  }, []);

  const triggerSOS = async () => {
    if (!location) {
      setSosError('Location not available yet. Please wait for GPS lock.');
      return null;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/sos/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: userProfile.name || 'Unknown',
          user_phone: userProfile.phone || 'Unknown',
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }),
      });
      if (!response.ok) throw new Error('SOS trigger request failed');
      const data = await response.json();
      setActiveSOS(data);
      setSosError(null);
      return data;
    } catch (err) {
      console.error('SOS trigger failed:', err);
      setSosError('Could not reach AEGIS servers — the emergency SMS will still be sent.');
      return null;
    }
  };

  const cancelSOS = async () => {
    const sosId = activeSOS?.id;
    setActiveSOS(null);
    setIsSOSActive(false);
    if (sosId) {
      try {
        await fetch(`${API_BASE_URL}/api/sos/${sosId}/cancel`, { method: 'PATCH' });
      } catch (err) {
        console.error('SOS cancel failed:', err);
      }
    }
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: 2,
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );

      const headingSubscription = await Location.watchHeadingAsync((newHeading) => {
        setLocation((prev) => prev ? { ...prev, coords: { ...prev.coords, heading: newHeading.trueHeading } } : prev);
      });
      
      return () => {
        locationSubscription.remove();
        headingSubscription.remove();
      };
    })();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        isSOSActive,
        toggleSOS,
        location,
        errorMsg,
        userProfile,
        setUserProfile,
        activeSOS,
        triggerSOS,
        cancelSOS,
        sosError,
        user,
        setUser: handleSetUser,
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
        isLoggedIn,
        setIsLoggedIn,
        logout,
        isContextLoaded,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
