// API Configuration
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://tasktakr-backend.vercel.app' // Production backend URL
  : Platform.OS === 'web'
    ? 'http://localhost:3000' // Web development
    : 'http://10.0.2.2:3000'; // Android emulator development

// Import Platform from react-native at the top
import { Platform } from 'react-native';