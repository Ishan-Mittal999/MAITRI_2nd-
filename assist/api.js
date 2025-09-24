import axios from 'axios'

// API base URL - will be relative for production deployment
const API_BASE_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Emotion Analysis API
export const emotionAPI = {
  // Analyze emotion from video/audio data
  analyzeEmotion: async (data) => {
    try {
      const response = await api.post('/analyze', data)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to analyze emotion')
    }
  },

  // Get emotion logs
  getEmotionLogs: async (params = {}) => {
    try {
      const response = await api.get('/logs', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch emotion logs')
    }
  },

  // Get emotion summary
  getEmotionSummary: async (params = {}) => {
    try {
      const response = await api.get('/logs/summary', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch emotion summary')
    }
  },
}

// Emergency Alert API
export const emergencyAPI = {
  // Create emergency alert
  createEmergencyAlert: async (alertData) => {
    try {
      const response = await api.post('/emergency', alertData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create emergency alert')
    }
  },

  // Acknowledge emergency alert
  acknowledgeAlert: async (alertId) => {
    try {
      const response = await api.post(`/emergency/${alertId}/acknowledge`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to acknowledge alert')
    }
  },

  // Get emergency alerts
  getEmergencyAlerts: async (params = {}) => {
    try {
      const response = await api.get('/emergency', { params })
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch emergency alerts')
    }
  },
}

// Session Management API
export const sessionAPI = {
  // Create new session
  createSession: async (userData = {}) => {
    try {
      const response = await api.post('/session', userData)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create session')
    }
  },

  // End session
  endSession: async (sessionId) => {
    try {
      const response = await api.post(`/session/${sessionId}/end`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to end session')
    }
  },
}

// Health Check API
export const healthAPI = {
  // Check backend health
  checkHealth: async () => {
    try {
      const response = await api.get('/health')
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Health check failed')
    }
  },
}

// Utility functions
export const utils = {
  // Convert canvas to base64 for API transmission
  canvasToBase64: (canvas) => {
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1]
  },

  // Process audio data for API transmission
  processAudioData: (audioBuffer) => {
    // Convert audio buffer to features (placeholder)
    // In real implementation, this would extract mel-spectrograms, etc.
    return {
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      features: 'placeholder_audio_features'
    }
  },

  // Generate session ID
  generateSessionId: () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },

  // Format timestamp for display
  formatTimestamp: (timestamp) => {
    return new Date(timestamp).toLocaleString()
  },

  // Calculate time difference
  getTimeDifference: (start, end) => {
    const diff = new Date(end) - new Date(start)
    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  },
}

export default api

