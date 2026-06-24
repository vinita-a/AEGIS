import Constants from 'expo-constants';
import { Platform } from 'react-native';

const resolveApiHost = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname;
  }

  const explicitBaseUrl = Constants?.expoConfig?.extra?.apiBaseUrl || Constants?.manifest?.extra?.apiBaseUrl;
  if (explicitBaseUrl) {
    return explicitBaseUrl;
  }

  const explicitHost = Constants?.expoConfig?.extra?.apiHost || Constants?.manifest?.extra?.apiHost;
  const explicitPort = Constants?.expoConfig?.extra?.apiPort || Constants?.manifest?.extra?.apiPort || 8000;
  if (explicitHost) {
    return `http://${explicitHost}:${explicitPort}`;
  }

  const hostUri =
    Constants.manifest?.debuggerHost ||
    Constants.manifest?.hostUri ||
    Constants.manifest?.packagerOpts?.hostUri ||
    Constants.manifest2?.debuggerHost ||
    Constants.manifest2?.hostUri ||
    Constants.manifest2?.packagerOpts?.hostUri ||
    Constants.expoGo?.hostUri ||
    Constants.expoGo?.debuggerHost ||
    Constants.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    const resolvedHost = host === '127.0.0.1' || host === 'localhost'
      ? (Platform.OS === 'android' ? '10.0.2.2' : 'localhost')
      : host;
    return `http://${resolvedHost}:${explicitPort}`;
  }

  return `http://${Platform.OS === 'android' ? '10.0.2.2' : 'localhost'}:${explicitPort}`;
};

export const API_BASE_URL = resolveApiHost();
