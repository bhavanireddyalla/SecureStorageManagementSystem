/**
 * API base URL shared with the web app backend.
 *
 * Set EXPO_PUBLIC_API_BASE_URL in mobile/.env
 * - Physical device: http://YOUR_LAN_IP:5000/api
 * - Android emulator: http://10.0.2.2:5000/api
 * - iOS simulator: http://localhost:5000/api
 */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:5000/api';
