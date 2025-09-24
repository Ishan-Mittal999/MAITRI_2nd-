import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Shield, AlertTriangle, Activity } from 'lucide-react'
import WebcamCapture from './components/WebcamCapture'
import EmotionDashboard from './components/EmotionDashboard'
import ChatbotInterface from './components/ChatbotInterface'
import EmergencyAlert from './components/EmergencyAlert'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import './App.css'

function App() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState({
    label: 'neutral',
    score: 75,
    timestamp: new Date()
  })
  const [emergencyMode, setEmergencyMode] = useState(false)

  const handleStartMonitoring = () => {
    setIsMonitoring(true)
  }

  const handleStopMonitoring = () => {
    setIsMonitoring(false)
  }

  const handleEmotionUpdate = (emotionData) => {
    setCurrentEmotion(emotionData)
  }

  const handleEmergencyAlert = () => {
    setEmergencyMode(true)
    // Trigger emergency protocols
    console.log('Emergency alert triggered!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Header */}
      <motion.header 
        className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">MAITRI Web Assistant</h1>
              <p className="text-blue-200 text-sm">Astronaut Well-being Monitor</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-white text-sm">
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
              </span>
            </div>
            
            <Button
              onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
              variant={isMonitoring ? "destructive" : "default"}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          
          {/* Left Panel - Webcam and Controls */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-400" />
                  Video Monitor
                </h2>
                {isMonitoring && (
                  <div className="flex items-center space-x-2 text-red-400">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Recording Active</span>
                  </div>
                )}
              </div>
              
              <WebcamCapture 
                isActive={isMonitoring}
                onEmotionDetected={handleEmotionUpdate}
              />
            </Card>

            {/* Emergency Alert Panel */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
              <EmergencyAlert 
                onEmergencyTrigger={handleEmergencyAlert}
                emergencyMode={emergencyMode}
                setEmergencyMode={setEmergencyMode}
              />
            </Card>
          </motion.div>

          {/* Right Panel - Dashboard and Chat */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-green-400" />
                  Emotional Analysis
                </h2>
              </div>
              
              <EmotionDashboard 
                currentEmotion={currentEmotion}
                isMonitoring={isMonitoring}
              />
            </Card>

            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6 flex-1">
              <ChatbotInterface 
                currentEmotion={currentEmotion}
                isMonitoring={isMonitoring}
              />
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Emergency Overlay */}
      {emergencyMode && (
        <motion.div 
          className="fixed inset-0 bg-red-900/80 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Card className="bg-red-800 border-red-600 p-8 max-w-md mx-4">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Emergency Alert Sent</h3>
              <p className="text-red-200 mb-6">Ground support has been notified of your emergency situation.</p>
              <Button 
                onClick={() => setEmergencyMode(false)}
                variant="outline"
                className="border-red-400 text-red-100 hover:bg-red-700"
              >
                Acknowledge
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

export default App

