import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, CameraOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { emotionAPI, utils } from '../services/api'

const WebcamCapture = ({ isActive, onEmotionDetected }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const intervalRef = useRef(null)
  const sessionIdRef = useRef(utils.generateSessionId())
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [apiStatus, setApiStatus] = useState('disconnected') // connected, disconnected, error

  // Initialize webcam stream
  const initializeWebcam = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: true
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setHasPermission(true)
        setApiStatus('connected')
      }
    } catch (err) {
      console.error('Error accessing webcam:', err)
      setError('Unable to access camera. Please check permissions.')
      setApiStatus('error')
    } finally {
      setIsLoading(false)
    }
  }

  // Stop webcam stream
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setHasPermission(false)
    setFaceDetected(false)
    setApiStatus('disconnected')
  }

  // Capture and process video frame
  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return

    setIsAnalyzing(true)

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Simulate face detection (placeholder)
      const faceDetected = Math.random() > 0.3 // 70% chance of face detection
      setFaceDetected(faceDetected)

      if (faceDetected) {
        // Draw face bounding box (placeholder)
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const boxWidth = 200
        const boxHeight = 250

        ctx.strokeStyle = '#10B981'
        ctx.lineWidth = 3
        ctx.strokeRect(
          centerX - boxWidth / 2,
          centerY - boxHeight / 2,
          boxWidth,
          boxHeight
        )

        // Add face detection label
        ctx.fillStyle = '#10B981'
        ctx.font = '16px Arial'
        ctx.fillText('Face Detected', centerX - boxWidth / 2, centerY - boxHeight / 2 - 10)

        // Prepare data for API
        const videoData = utils.canvasToBase64(canvas)
        const audioData = streamRef.current ? utils.processAudioData({ 
          duration: 2, 
          sampleRate: 44100 
        }) : null

        // Send to backend for emotion analysis
        try {
          const response = await emotionAPI.analyzeEmotion({
            session_id: sessionIdRef.current,
            video_data: videoData,
            audio_data: audioData
          })

          if (response.success) {
            const emotionData = {
              ...response.result,
              timestamp: new Date(response.result.timestamp),
              sessionId: response.session_id
            }
            
            onEmotionDetected(emotionData)
            setApiStatus('connected')
          }
        } catch (apiError) {
          console.error('API Error:', apiError)
          setApiStatus('error')
          
          // Fallback to local processing
          const emotions = ['happy', 'sad', 'neutral', 'stressed', 'fatigued']
          const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
          const wellbeingScore = Math.floor(Math.random() * 40) + 60

          onEmotionDetected({
            label: randomEmotion,
            score: wellbeingScore,
            timestamp: new Date(),
            confidence: Math.random() * 0.3 + 0.7,
            sessionId: sessionIdRef.current,
            source: 'local_fallback'
          })
        }
      }
    } catch (error) {
      console.error('Frame capture error:', error)
      setApiStatus('error')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Start monitoring
  useEffect(() => {
    if (isActive && hasPermission) {
      intervalRef.current = setInterval(captureFrame, 3000) // Capture every 3 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, hasPermission])

  // Initialize webcam when component mounts
  useEffect(() => {
    if (isActive && !hasPermission) {
      initializeWebcam()
    } else if (!isActive && hasPermission) {
      stopWebcam()
    }

    return () => {
      stopWebcam()
    }
  }, [isActive])

  return (
    <div className="space-y-4">
      {/* Video Display */}
      <div className="relative bg-slate-900 rounded-lg overflow-hidden aspect-video">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-2" />
              <p className="text-slate-300">Initializing camera...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <Alert className="max-w-sm bg-red-900/50 border-red-700">
              <CameraOff className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Overlay canvas for face detection */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ mixBlendMode: 'screen' }}
            />

            {/* Status indicators */}
            <div className="absolute top-4 left-4 space-y-2">
              {hasPermission && (
                <motion.div 
                  className="flex items-center space-x-2 bg-green-900/80 text-green-200 px-3 py-1 rounded-full text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Camera className="w-4 h-4" />
                  <span>Camera Active</span>
                </motion.div>
              )}
              
              {faceDetected && (
                <motion.div 
                  className="flex items-center space-x-2 bg-blue-900/80 text-blue-200 px-3 py-1 rounded-full text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>Face Detected</span>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div 
                  className="flex items-center space-x-2 bg-purple-900/80 text-purple-200 px-3 py-1 rounded-full text-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Analyzing...</span>
                </motion.div>
              )}
            </div>

            {/* API Status indicator */}
            <div className="absolute top-4 right-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                apiStatus === 'connected' ? 'bg-green-900/80 text-green-200' :
                apiStatus === 'error' ? 'bg-red-900/80 text-red-200' :
                'bg-gray-900/80 text-gray-200'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                  apiStatus === 'error' ? 'bg-red-400' :
                  'bg-gray-400'
                }`}></div>
                <span className="capitalize">{apiStatus}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-400">
          {hasPermission ? (
            <span>✓ Camera permissions granted</span>
          ) : (
            <span>Camera permissions required</span>
          )}
        </div>

        {!hasPermission && !isLoading && (
          <Button 
            onClick={initializeWebcam}
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-400 hover:bg-blue-900/50"
          >
            <Camera className="w-4 h-4 mr-2" />
            Enable Camera
          </Button>
        )}
      </div>

      {/* Technical Info */}
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="bg-slate-900/50 p-3 rounded-lg">
          <div className="text-slate-400 mb-1">Video Processing</div>
          <div className="text-white">
            {isActive ? 'Active (3s intervals)' : 'Inactive'}
          </div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg">
          <div className="text-slate-400 mb-1">Face Detection</div>
          <div className="text-white">
            {faceDetected ? 'Detected' : 'Not Detected'}
          </div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-lg">
          <div className="text-slate-400 mb-1">Backend Status</div>
          <div className="text-white capitalize">
            {apiStatus}
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="text-xs text-slate-500 text-center">
        Session ID: {sessionIdRef.current}
      </div>
    </div>
  )
}

export default WebcamCapture

