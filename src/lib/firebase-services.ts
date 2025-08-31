import { db, auth } from './firebase'
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  setDoc
} from 'firebase/firestore'
import { User } from 'firebase/auth'

// Check if Firebase is initialized
const isFirebaseInitialized = () => {
  return db !== null && auth !== null
}

// Mock data for demo mode
const mockUsers = [
  {
    id: 'user123',
    email: 'user@example.com',
    username: 'researcher_youth',
    fullName: 'Alex Researcher',
    country: 'United States',
    level: 5,
    xp: 1250,
    coins: 450,
    gems: 25,
    dailyStreak: 7,
    isOnline: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const mockNotifications = [
  {
    id: 'notif1',
    userId: 'user123',
    type: 'achievement' as const,
    title: 'New Achievement Unlocked!',
    message: 'You\'ve completed your first research project',
    timestamp: new Date(),
    isRead: false
  },
  {
    id: 'notif2',
    userId: 'user123',
    type: 'system' as const,
    title: 'Welcome to HANU-YOUTH',
    message: 'Start your journey with AI-powered research',
    timestamp: new Date(Date.now() - 3600000),
    isRead: true
  }
]

// User Management Service
export class UserService {
  static async createUser(userData: {
    uid: string
    email: string
    username: string
    fullName?: string
    country?: string
    avatarUrl?: string
    bio?: string
  }) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock success
      return { success: true, data: userData }
    }

    try {
      const userRef = doc(db, 'users', userData.uid)
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Gamification fields
        level: 1,
        xp: 0,
        coins: 100,
        gems: 10,
        dailyStreak: 0,
        lastActiveAt: serverTimestamp(),
        totalSearches: 0,
        totalQuizzes: 0,
        totalInnovations: 0,
        isOnline: true
      })
      return { success: true, data: userData }
    } catch (error) {
      console.error('Error creating user:', error)
      return { success: false, error }
    }
  }

  static async getUser(uid: string) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock user
      const mockUser = mockUsers.find(u => u.id === uid)
      return mockUser 
        ? { success: true, data: mockUser }
        : { success: false, error: 'User not found' }
    }

    try {
      const userRef = doc(db, 'users', uid)
      const userDoc = await getDoc(userRef)
      if (userDoc.exists()) {
        return { success: true, data: userDoc.data() }
      }
      return { success: false, error: 'User not found' }
    } catch (error) {
      console.error('Error getting user:', error)
      return { success: false, error }
    }
  }

  static async updateUser(uid: string, updates: any) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock success
      return { success: true }
    }

    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating user:', error)
      return { success: false, error }
    }
  }

  static async updateUserActivity(uid: string) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock success
      return { success: true }
    }

    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        lastActiveAt: serverTimestamp(),
        isOnline: true
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating user activity:', error)
      return { success: false, error }
    }
  }

  static async getLeaderboard(limitCount: number = 10) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock leaderboard
      return { success: true, data: mockUsers.sort((a, b) => b.xp - a.xp).slice(0, limitCount) }
    }

    try {
      const usersRef = collection(db, 'users')
      const q = query(
        usersRef,
        orderBy('xp', 'desc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      const leaderboard = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return { success: true, data: leaderboard }
    } catch (error) {
      console.error('Error getting leaderboard:', error)
      return { success: false, error }
    }
  }
}

// Chat Service
export class ChatService {
  static async sendMessage(messageData: {
    senderId: string
    receiverId?: string
    groupId?: string
    content: string
    type: 'text' | 'image' | 'file'
    attachments?: any[]
  }) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock success
      return { success: true, data: 'mock-message-id' }
    }

    try {
      const messagesRef = collection(db, 'messages')
      const messageDoc = await addDoc(messagesRef, {
        ...messageData,
        createdAt: serverTimestamp(),
        isRead: false,
        isDeleted: false
      })
      return { success: true, data: messageDoc.id }
    } catch (error) {
      console.error('Error sending message:', error)
      return { success: false, error }
    }
  }

  static async getMessages(userId: string, otherUserId?: string, groupId?: string) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return empty messages
      return { success: true, data: [] }
    }

    try {
      const messagesRef = collection(db, 'messages')
      let q
      
      if (groupId) {
        q = query(
          messagesRef,
          where('groupId', '==', groupId),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      } else if (otherUserId) {
        q = query(
          messagesRef,
          where('senderId', 'in', [userId, otherUserId]),
          where('receiverId', 'in', [userId, otherUserId]),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      } else {
        q = query(
          messagesRef,
          where('receiverId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(50)
        )
      }

      const querySnapshot = await getDocs(q)
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Record<string, any>)
      }))
      return { success: true, data: messages }
    } catch (error) {
      console.error('Error getting messages:', error)
      return { success: false, error }
    }
  }

  static subscribeToMessages(userId: string, callback: (messages: any[]) => void) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return empty callback
      callback([])
      return () => {} // Return unsubscribe function
    }

    const messagesRef = collection(db, 'messages')
    const q = query(
      messagesRef,
      where('receiverId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(messages)
    })
  }
}

// Research Service
export class ResearchService {
  static async saveResearch(researchData: {
    userId: string
    title: string
    topic: string
    sources: any[]
    aiSummary: string
    keyInsights: string[]
    category: string
    tags: string[]
  }) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock success
      return { success: true, data: 'mock-research-id' }
    }

    try {
      const researchRef = collection(db, 'research')
      const researchDoc = await addDoc(researchRef, {
        ...researchData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPublic: false,
        likes: 0,
        views: 0
      })
      return { success: true, data: researchDoc.id }
    } catch (error) {
      console.error('Error saving research:', error)
      return { success: false, error }
    }
  }

  static async getUserResearch(userId: string) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return empty research
      return { success: true, data: [] }
    }

    try {
      const researchRef = collection(db, 'research')
      const q = query(
        researchRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const research = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return { success: true, data: research }
    } catch (error) {
      console.error('Error getting user research:', error)
      return { success: false, error }
    }
  }

  static async getPublicResearch(limitCount: number = 20) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return empty research
      return { success: true, data: [] }
    }

    try {
      const researchRef = collection(db, 'research')
      const q = query(
        researchRef,
        where('isPublic', '==', true),
        orderBy('likes', 'desc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      const research = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return { success: true, data: research }
    } catch (error) {
      console.error('Error getting public research:', error)
      return { success: false, error }
    }
  }
}

// Events/Hackathons Service
export class EventService {
  static async createEvent(eventData: {
    title: string
    description: string
    type: 'hackathon' | 'conference' | 'workshop' | 'competition'
    startDate: Timestamp
    endDate: Timestamp
    location: string
    isVirtual: boolean
    maxParticipants?: number
    tags: string[]
    requirements: string[]
    prizes: any[]
    organizerId: string
  }) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock success
      return { success: true, data: 'mock-event-id' }
    }

    try {
      const eventsRef = collection(db, 'events')
      const eventDoc = await addDoc(eventsRef, {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        participants: 0,
        status: 'upcoming'
      })
      return { success: true, data: eventDoc.id }
    } catch (error) {
      console.error('Error creating event:', error)
      return { success: false, error }
    }
  }

  static async getUpcomingEvents(limitCount: number = 10) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock events
      const mockEvents = [
        {
          id: 'event1',
          title: 'UN Youth Climate Summit',
          description: 'Global youth summit focusing on climate action',
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
          location: 'United Nations Headquarters',
          isVirtual: false,
          participants: 150,
          status: 'upcoming'
        }
      ]
      return { success: true, data: mockEvents }
    }

    try {
      const eventsRef = collection(db, 'events')
      const q = query(
        eventsRef,
        where('isActive', '==', true),
        where('status', '==', 'upcoming'),
        orderBy('startDate', 'asc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return { success: true, data: events }
    } catch (error) {
      console.error('Error getting upcoming events:', error)
      return { success: false, error }
    }
  }

  static async joinEvent(eventId: string, userId: string) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock success
      return { success: true }
    }

    try {
      const participationRef = collection(db, 'event_participants')
      await addDoc(participationRef, {
        eventId,
        userId,
        joinedAt: serverTimestamp(),
        status: 'registered'
      })
      
      // Update event participant count
      const eventRef = doc(db, 'events', eventId)
      await updateDoc(eventRef, {
        participants: increment(1)
      })
      
      return { success: true }
    } catch (error) {
      console.error('Error joining event:', error)
      return { success: false, error }
    }
  }
}

// Gamification Service
export class GamificationService {
  static async updateUserProgress(userId: string, progressData: {
    xp?: number
    coins?: number
    gems?: number
    dailyStreak?: number
    totalSearches?: number
    totalQuizzes?: number
    totalInnovations?: number
  }) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock success
      return { success: true }
    }

    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        ...progressData,
        updatedAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating user progress:', error)
      return { success: false, error }
    }
  }

  static async awardAchievement(userId: string, achievementId: string) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock success
      return { success: true }
    }

    try {
      const achievementRef = collection(db, 'user_achievements')
      await addDoc(achievementRef, {
        userId,
        achievementId,
        unlockedAt: serverTimestamp(),
        progress: 100
      })
      return { success: true }
    } catch (error) {
      console.error('Error awarding achievement:', error)
      return { success: false, error }
    }
  }

  static async getUserAchievements(userId: string) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return empty achievements
      return { success: true, data: [] }
    }

    try {
      const achievementsRef = collection(db, 'user_achievements')
      const q = query(
        achievementsRef,
        where('userId', '==', userId),
        orderBy('unlockedAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const achievements = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return { success: true, data: achievements }
    } catch (error) {
      console.error('Error getting user achievements:', error)
      return { success: false, error }
    }
  }
}

// Notifications Service
export class NotificationService {
  static async sendNotification(notificationData: {
    userId: string
    type: 'achievement' | 'message' | 'event' | 'system' | 'gamification'
    title: string
    message: string
    data?: any
  }) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock success
      return { success: true }
    }

    try {
      const notificationsRef = collection(db, 'notifications')
      await addDoc(notificationsRef, {
        ...notificationData,
        createdAt: serverTimestamp(),
        isRead: false,
        isDelivered: false
      })
      return { success: true }
    } catch (error) {
      console.error('Error sending notification:', error)
      return { success: false, error }
    }
  }

  static async getUserNotifications(userId: string) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock notifications
      const userNotifications = mockNotifications.filter(n => n.userId === userId)
      return { success: true, data: userNotifications }
    }

    try {
      const notificationsRef = collection(db, 'notifications')
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(20)
      )
      const querySnapshot = await getDocs(q)
      const notifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return { success: true, data: notifications }
    } catch (error) {
      console.error('Error getting user notifications:', error)
      return { success: false, error }
    }
  }

  static async markNotificationAsRead(notificationId: string) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock success
      return { success: true }
    }

    try {
      const notificationRef = doc(db, 'notifications', notificationId)
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return { success: false, error }
    }
  }

  static subscribeToNotifications(userId: string, callback: (notifications: any[]) => void) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock notifications
      const userNotifications = mockNotifications.filter(n => n.userId === userId)
      callback(userNotifications)
      return () => {} // Return unsubscribe function
    }

    const notificationsRef = collection(db, 'notifications')
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(notifications)
    })
  }
}

// Real-time presence service
export class PresenceService {
  static async updateOnlineStatus(userId: string, isOnline: boolean) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock success
      return { success: true }
    }

    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        isOnline,
        lastActiveAt: serverTimestamp()
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating online status:', error)
      return { success: false, error }
    }
  }

  static subscribeToOnlineUsers(callback: (users: any[]) => void) {
    if (!isFirebaseInitialized()) {
      // Demo mode - return mock online users
      callback(mockUsers.filter(u => u.isOnline))
      return () => {} // Return unsubscribe function
    }

    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('isOnline', '==', true))
    
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(users)
    })
  }
}

// Helper function for Firebase increment
function increment(value: number) {
  return { field: value }
}