import Constants from 'expo-constants';

const BACKEND_PORT = 8000;

// Expo Go / dev builds already know the LAN IP of the machine running Metro,
// because the phone used it to load this JS bundle. The backend runs on the
// same machine (see README), so we reuse that IP instead of hardcoding one -
// no per-developer edits needed when laptops or networks change.
function resolveApiHost() {
  const hostUri =
    Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost;
  const lanHost = hostUri?.split(':')?.[0];

  // Optional escape hatch (e.g. backend running on a different machine than
  // Metro, or an emulator setup) via a EXPO_PUBLIC_API_HOST env var / .env entry.
  return process.env.EXPO_PUBLIC_API_HOST || lanHost || 'localhost';
}

export const API_HOST = resolveApiHost();
export const API_BASE_URL = `http://${API_HOST}:${BACKEND_PORT}`;
