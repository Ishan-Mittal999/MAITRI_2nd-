import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Phone, Shield, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { emergencyAPI, utils } from '../services/api'

const EmergencyAlert = ({ onEmergencyTrigger, emergencyMode, setEmergencyMode }) => {
  const [alertLevel, setAlertLevel] = useState('normal') // normal, warning, critical
  const [countdown, setCountdown] = useState(null)
  const [alertHistory, setAlertHistory] = useState([])
  const [isConfirming, setIsConfirming] = useState(false)
  const [sessionId] = useState(utils.generateSessionId())
  const [isLoading, setIsLoading] = useState(false)

  // Emergency alert levels
  const alertLevels = {
    normal: {
      label: 'Normal Operations',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-600',
      icon: Shield
    },
    warning: {
      label: 'Caution Required',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/20',
      borderColor: 'border-yellow-600',
      icon: AlertTriangle
    },
    critical: {
      label: 'Emergency Situation',
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-600',
      icon: AlertTriangle
    }
  }

  // Emergency types
  const emergencyTypes = [
    {
      id: 'medical',
      label: 'Medical Emergency',
      description: 'Health-related urgent situation',
      color: 'bg-red-600 hover:bg-red-700',
      icon: '🏥',
      severity: 'critical'
    },
    {
      id: 'technical',
      label: 'Technical Malfunction',
      description: 'Equipment or system failure',
      color: 'bg-orange-600 hover:bg-orange-700',
      icon: '⚙️',
      severity: 'high'
    },
    {
      id: 'psychological',
      label: 'Psychological Crisis',
      description: 'Mental health emergency',
      color: 'bg-purple-600 hover:bg-purple-700',
      icon: '🧠',
      severity: 'high'
    },
    {
      id: 'environmental',
      label: 'Environmental Hazard',
      description: 'Dangerous environmental condition',
      color: 'bg-yellow-600 hover:bg-yellow-700',
      icon: '⚠️',
      severity: 'medium'
    }
  ]

  // Load alert history on component mount
  useEffect(() => {
    loadAlertHistory()
  }, [])

  // Load alert history from backend
  const loadAlertHistory = async () => {
    try {
      const response = await emergencyAPI.getEmergencyAlerts({
        session_id: sessionId,
        limit: 10
      })
      
      if (response.success) {
        setAlertHistory(response.alerts)
      }
    } catch (error) {
      console.error('Failed to load alert history:', error)
    }
  }

  // Handle emergency alert with confirmation
  const handleEmergencyAlert = (type) => {
    setIsConfirming(true)
    setCountdown(5)

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          triggerEmergency(type)
          setIsConfirming(false)
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  // Cancel emergency alert
  const cancelEmergencyAlert = () => {
    setIsConfirming(false)
    setCountdown(null)
  }

  // Trigger emergency
  const triggerEmergency = async (type) => {
    setIsLoading(true)
    
    try {
      const emergencyData = {
        alert_type: type.id,
        alert_label: type.label,
        description: type.description,
        severity: type.severity,
        session_id: sessionId
      }

      const response = await emergencyAPI.createEmergencyAlert(emergencyData)
      
      if (response.success) {
        const newAlert = {
          ...response.alert,
          timestamp: new Date(response.alert.timestamp),
          status: 'sent'
        }

        setAlertHistory(prev => [newAlert, ...prev])
        setAlertLevel('critical')
        onEmergencyTrigger(newAlert)

        // Simulate ground response acknowledgment
        setTimeout(async () => {
          try {
            await emergencyAPI.acknowledgeAlert(newAlert.id)
            setAlertHistory(prev => 
              prev.map(alert => 
                alert.id === newAlert.id 
                  ? { ...alert, status: 'acknowledged', response_time: new Date() }
                  : alert
              )
            )
          } catch (error) {
            console.error('Failed to acknowledge alert:', error)
          }
        }, 3000)
      }
    } catch (error) {
      console.error('Failed to create emergency alert:', error)
      // Fallback to local alert
      const localAlert = {
        id: Date.now(),
        alert_type: type.id,
        alert_label: type.label,
        description: type.description,
        severity: type.severity,
        timestamp: new Date(),
        status: 'sent_local',
        session_id: sessionId
      }
      
      setAlertHistory(prev => [localAlert, ...prev])
      setAlertLevel('critical')
      onEmergencyTrigger(localAlert)
    } finally {
      setIsLoading(false)
    }
  }

  // Quick emergency button (one-click)
  const handleQuickEmergency = async () => {
    const quickEmergency = {
      id: 'general',
      label: 'General Emergency',
      description: 'Immediate assistance required',
      color: 'bg-red-600',
      icon: '🚨',
      severity: 'critical'
    }
    await triggerEmergency(quickEmergency)
  }

  // Auto-detect critical situations based on emotion data
  useEffect(() => {
    // This would integrate with emotion detection
    // For now, we'll simulate based on random conditions
    const checkCriticalConditions = () => {
      const shouldAlert = Math.random() < 0.05 // 5% chance for demo
      if (shouldAlert && alertLevel === 'normal') {
        setAlertLevel('warning')
        setTimeout(() => setAlertLevel('normal'), 10000) // Reset after 10 seconds
      }
    }

    const interval = setInterval(checkCriticalConditions, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [alertLevel])

  const currentAlert = alertLevels[alertLevel]
  const IconComponent = currentAlert.icon

  return (
    <div className="space-y-4">
      {/* Current Alert Status */}
      <Card className={`${currentAlert.bgColor} ${currentAlert.borderColor} border-2 p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <IconComponent className={`w-6 h-6 ${currentAlert.color}`} />
            <div>
              <h3 className={`font-semibold ${currentAlert.color}`}>
                {currentAlert.label}
              </h3>
              <p className="text-sm text-slate-300">
                System Status: {alertLevel === 'normal' ? 'All systems operational' : 'Attention required'}
              </p>
            </div>
          </div>
          
          {alertLevel !== 'normal' && (
            <Button
              onClick={() => setAlertLevel('normal')}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300"
            >
              Acknowledge
            </Button>
          )}
        </div>
      </Card>

      {/* Emergency Confirmation Modal */}
      {isConfirming && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <Card className="bg-red-900 border-red-600 p-6 max-w-sm mx-4">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Confirm Emergency Alert
              </h3>
              <p className="text-red-200 mb-4">
                Emergency signal will be sent in {countdown} seconds
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={cancelEmergencyAlert}
                  variant="outline"
                  className="flex-1 border-red-400 text-red-100 hover:bg-red-800"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setIsConfirming(false)
                    setCountdown(null)
                    handleQuickEmergency()
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={isLoading}
                >
                  Send Now
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quick Emergency Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={handleQuickEmergency}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-6 text-lg"
          disabled={isConfirming || isLoading}
        >
          <AlertTriangle className="w-6 h-6 mr-3" />
          {isLoading ? 'SENDING...' : 'EMERGENCY ALERT'}
        </Button>
      </motion.div>

      {/* Emergency Types */}
      <div className="grid grid-cols-2 gap-3">
        {emergencyTypes.map((type) => (
          <motion.div
            key={type.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => handleEmergencyAlert(type)}
              className={`w-full ${type.color} text-white p-4 h-auto flex flex-col items-center space-y-2`}
              disabled={isConfirming || isLoading}
            >
              <span className="text-2xl">{type.icon}</span>
              <div className="text-center">
                <div className="font-semibold text-sm">{type.label}</div>
                <div className="text-xs opacity-80">{type.description}</div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Communication Status */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-white flex items-center">
            <Phone className="w-4 h-4 mr-2 text-blue-400" />
            Ground Communication
          </h4>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Connected</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-400">Signal Strength</div>
            <div className="text-white font-medium">Strong (95%)</div>
          </div>
          <div>
            <div className="text-slate-400">Response Time</div>
            <div className="text-white font-medium">~3 seconds</div>
          </div>
        </div>
      </Card>

      {/* Alert History */}
      {alertHistory.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-700/50 p-4">
          <h4 className="font-semibold text-white mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2 text-slate-400" />
            Recent Alerts
          </h4>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {alertHistory.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.status === 'acknowledged' ? 'bg-green-400' : 
                    alert.status === 'sent_local' ? 'bg-orange-400' :
                    'bg-yellow-400'
                  }`}></div>
                  <span className="text-slate-300">{alert.alert_label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {alert.status === 'acknowledged' && (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  )}
                  <span className="text-slate-400 text-xs">
                    {utils.formatTimestamp(alert.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Safety Information */}
      <Alert className="bg-blue-900/20 border-blue-600/50">
        <Shield className="h-4 w-4" />
        <AlertDescription className="text-blue-200">
          Emergency alerts are sent directly to Mission Control and medical teams. 
          Use responsibly and only for genuine emergencies.
        </AlertDescription>
      </Alert>
    </div>
  )
}

export default EmergencyAlert

