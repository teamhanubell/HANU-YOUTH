import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getMessaging } from 'firebase/messaging'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'demo-app-id',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'demo-measurement-id'
}

// Initialize Firebase only if we have valid config
let app: any = null
let db: any = null
let auth: any = null
let storage: any = null
let messaging: any = null

try {
  // Check if we have a real Firebase config or just demo values
  const isDemoConfig = Object.values(firebaseConfig).some(value => 
    value.includes('demo-') || value === 'demo-api-key' || value === '123456789'
  )

  if (!isDemoConfig) {
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    auth = getAuth(app)
    storage = getStorage(app)
    messaging = getMessaging(app)
  }
} catch (error) {
  console.warn('Firebase initialization failed. Running in demo mode:', error)
}

// Export Firebase services or null if not initialized
export { db, auth, storage, messaging, app }
export default app