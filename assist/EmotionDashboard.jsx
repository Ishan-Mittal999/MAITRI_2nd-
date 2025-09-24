import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Heart, Brain, Zap } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Card } from '@/components/ui/card'

const EmotionDashboard = ({ currentEmotion, isMonitoring }) => {
  const [emotionHistory, setEmotionHistory] = useState([])
  const [trend, setTrend] = useState('stable')

  // Emotion configurations
  const emotionConfig = {
    happy: {
      emoji: '😊',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-600',
      description: 'Positive and content'
    },
    sad: {
      emoji: '😢',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-600',
      description: 'Feeling down or melancholic'
    },
    neutral: {
      emoji: '😐',
      color: 'text-gray-400',
      bgColor: 'bg-gray-900/20',
      borderColor: 'border-gray-600',
      description: 'Calm and balanced'
    },
    stressed: {
      emoji: '😰',
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/20',
      borderColor: 'border-orange-600',
      description: 'Experiencing tension or pressure'
    },
    fatigued: {
      emoji: '😴',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-600',
      description: 'Tired or low energy'
    }
  }

  // Update emotion history
  useEffect(() => {
    if (currentEmotion && isMonitoring) {
      setEmotionHistory(prev => {
        const newHistory = [...prev, currentEmotion].slice(-10) // Keep last 10 readings
        
        // Calculate trend
        if (newHistory.length >= 3) {
          const recent = newHistory.slice(-3)
          const avgRecent = recent.reduce((sum, e) => sum + e.score, 0) / recent.length
          const older = newHistory.slice(-6, -3)
          
          if (older.length > 0) {
            const avgOlder = older.reduce((sum, e) => sum + e.score, 0) / older.length
            if (avgRecent > avgOlder + 5) setTrend('improving')
            else if (avgRecent < avgOlder - 5) setTrend('declining')
            else setTrend('stable')
          }
        }
        
        return newHistory
      })
    }
  }, [currentEmotion, isMonitoring])

  const currentConfig = emotionConfig[currentEmotion?.label] || emotionConfig.neutral

  // Get wellbeing status
  const getWellbeingStatus = (score) => {
    if (score >= 80) return { status: 'Excellent', color: 'text-green-400' }
    if (score >= 60) return { status: 'Good', color: 'text-blue-400' }
    if (score >= 40) return { status: 'Fair', color: 'text-yellow-400' }
    return { status: 'Needs Attention', color: 'text-red-400' }
  }

  const wellbeingStatus = getWellbeingStatus(currentEmotion?.score || 0)

  // Get trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Emotion Display */}
      <motion.div 
        className={`${currentConfig.bgColor} ${currentConfig.borderColor} border-2 rounded-xl p-6 text-center`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        key={currentEmotion?.label}
      >
        <motion.div 
          className="text-6xl mb-3"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {currentConfig.emoji}
        </motion.div>
        
        <h3 className={`text-2xl font-bold ${currentConfig.color} capitalize mb-2`}>
          {currentEmotion?.label || 'No Data'}
        </h3>
        
        <p className="text-slate-300 text-sm mb-4">
          {currentConfig.description}
        </p>

        {currentEmotion?.confidence && (
          <div className="text-xs text-slate-400">
            Confidence: {Math.round(currentEmotion.confidence * 100)}%
          </div>
        )}
      </motion.div>

      {/* Wellbeing Score */}
      <Card className="bg-slate-900/50 border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-400" />
            Wellbeing Score
          </h4>
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className="text-sm text-slate-400 capitalize">{trend}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-white">
              {currentEmotion?.score || 0}
            </span>
            <span className={`text-sm font-medium ${wellbeingStatus.color}`}>
              {wellbeingStatus.status}
            </span>
          </div>

          <Progress 
            value={currentEmotion?.score || 0} 
            className="h-3"
          />

          <div className="flex justify-between text-xs text-slate-400">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50 p-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-sm text-slate-400">Mental State</div>
              <div className="text-lg font-semibold text-white capitalize">
                {currentEmotion?.label || 'Unknown'}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 p-4">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-yellow-400" />
            <div>
              <div className="text-sm text-slate-400">Energy Level</div>
              <div className="text-lg font-semibold text-white">
                {currentEmotion?.score > 70 ? 'High' : 
                 currentEmotion?.score > 40 ? 'Medium' : 'Low'}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent History */}
      {emotionHistory.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-700/50 p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Recent Readings</h4>
          <div className="space-y-2">
            {emotionHistory.slice(-5).reverse().map((emotion, index) => (
              <motion.div 
                key={emotion.timestamp.getTime()}
                className="flex items-center justify-between text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{emotionConfig[emotion.label]?.emoji}</span>
                  <span className="text-slate-300 capitalize">{emotion.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-medium">{emotion.score}</span>
                  <span className="text-slate-400 text-xs">
                    {emotion.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Status Message */}
      {!isMonitoring && (
        <Card className="bg-yellow-900/20 border-yellow-600/50 p-4">
          <div className="text-center text-yellow-200">
            <p className="text-sm">Monitoring is currently inactive</p>
            <p className="text-xs text-yellow-300 mt-1">
              Start monitoring to begin emotional analysis
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default EmotionDashboard

