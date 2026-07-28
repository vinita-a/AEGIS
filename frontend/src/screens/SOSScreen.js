import React, { useState, useEffect, useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GlobalContext } from '../contexts/GlobalContext';

export default function SOSScreen() {
  const [countdown, setCountdown] = useState(15);
  const [status, setStatus] = useState('Holding...');
  const [dispatching, setDispatching] = useState(false);
  const hasTriggered = useRef(false);
  const navigation = useNavigation();
  const { location, userProfile, activeSOS, triggerSOS, cancelSOS, sosError } = useContext(GlobalContext);

  const sendEmergencySMS = () => {
    const phone = userProfile.emergencyContactPhone;
    if (!phone || !location) return;
    const mapsLink = `https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;
    const message = `EMERGENCY! I need immediate help. My live location: ${mapsLink}`;
    // iOS expects '&' before body, Android expects '?'
    const separator = Platform.OS === 'ios' ? '&' : '?';
    Linking.openURL(`sms:${phone}${separator}body=${encodeURIComponent(message)}`).catch((err) =>
      console.error('Failed to open SMS composer:', err)
    );
  };

  const dispatchSOS = async () => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;
    setDispatching(true);
    await triggerSOS();
    setDispatching(false);
    sendEmergencySMS();
    setStatus('Alerting emergency contact & broadcasting your location!');
  };

  useEffect(() => {
    if (hasTriggered.current) return;
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      dispatchSOS();
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleTriggerNow = () => {
    setCountdown(0);
    dispatchSOS();
  };

  const handleCancel = () => {
    cancelSOS();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>EMERGENCY SOS</Text>

      <View style={styles.pulseContainer}>
        <Text style={styles.timerText}>{countdown > 0 ? countdown : '!'}</Text>
      </View>

      <Text style={styles.statusText}>{dispatching ? 'Dispatching...' : status}</Text>

      {countdown > 0 && (
        <Text style={styles.subText}>Activating automatically in {countdown}s</Text>
      )}

      {activeSOS?.status === 'active' && !userProfile.emergencyContactPhone && (
        <Text style={styles.warnText}>
          No emergency contact on file — add one from your profile to auto-notify them.
        </Text>
      )}

      {sosError && <Text style={styles.warnText}>{sosError}</Text>}

      {countdown > 0 && (
        <TouchableOpacity style={styles.triggerNowBtn} onPress={handleTriggerNow}>
          <Text style={styles.triggerNowText}>SOS NOW</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
        <Text style={styles.cancelText}>CANCEL & I'M SAFE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 40,
  },
  pulseContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 5,
    borderColor: '#fff',
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  subText: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
    marginBottom: 50,
  },
  warnText: {
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 16,
    maxWidth: '85%',
  },
  triggerNowBtn: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 30,
  },
  triggerNowText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: '#000',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
