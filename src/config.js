// API Configuration
export const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://tasktakr-backend.vercel.app' // Replace with your Vercel deployment URL
  : 'http://localhost:3000'; // Use localhost for development