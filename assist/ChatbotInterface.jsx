import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Volume2, VolumeX, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

const ChatbotInterface = ({ currentEmotion, isMonitoring }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m MAITRI, your AI wellness companion. I\'m here to support your emotional well-being during your mission.',
      timestamp: new Date(),
      emotion: 'neutral'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  // Supportive messages based on emotions
  const supportiveMessages = {
    happy: [
      "It's wonderful to see you in such a positive state! Keep up the great energy.",
      "Your positive mood is fantastic. Remember to share this energy with your crew.",
      "Great to see you're feeling good! This is an excellent time for creative tasks."
    ],
    sad: [
      "I notice you might be feeling down. Remember, it's normal to have these moments in space.",
      "Take a moment to breathe deeply. Try looking at Earth through the window if possible.",
      "Your feelings are valid. Consider reaching out to your crew or ground support for connection."
    ],
    neutral: [
      "You seem calm and balanced. This is a great state for focused work.",
      "Your steady emotional state is perfect for routine tasks and planning.",
      "Maintaining this balanced state shows good emotional regulation."
    ],
    stressed: [
      "I detect some stress. Let's try a quick breathing exercise: inhale for 4, hold for 4, exhale for 6.",
      "Stress is normal in challenging environments. Consider taking a short break if possible.",
      "Try progressive muscle relaxation: tense and release each muscle group for 5 seconds."
    ],
    fatigued: [
      "You seem tired. If possible, consider a short rest or power nap.",
      "Fatigue can affect decision-making. Prioritize essential tasks and delegate when possible.",
      "Try some gentle stretching or light exercise to boost your energy levels."
    ]
  }

  // Wellness tips and exercises
  const wellnessTips = [
    "Remember to stay hydrated - dehydration can affect mood and cognitive function.",
    "Take time to appreciate the unique view of Earth from your position.",
    "Maintain your sleep schedule as much as possible for optimal mental health.",
    "Regular communication with loved ones on Earth can boost emotional well-being.",
    "Practice gratitude by noting three positive things from your day."
  ]

  // Auto-generate supportive messages based on emotion changes
  useEffect(() => {
    if (currentEmotion && isMonitoring) {
      const emotionMessages = supportiveMessages[currentEmotion.label] || supportiveMessages.neutral
      
      // Only send message if emotion has changed or score is concerning
      if (currentEmotion.score < 50 || Math.random() < 0.3) {
        setTimeout(() => {
          const randomMessage = emotionMessages[Math.floor(Math.random() * emotionMessages.length)]
          addBotMessage(randomMessage, currentEmotion.label)
        }, 2000)
      }
    }
  }, [currentEmotion?.label])

  // Add bot message
  const addBotMessage = (content, emotion = 'neutral') => {
    setIsTyping(true)
    
    setTimeout(() => {
      const newMessage = {
        id: Date.now(),
        type: 'bot',
        content,
        timestamp: new Date(),
        emotion
      }
      
      setMessages(prev => [...prev, newMessage])
      setIsTyping(false)
      
      // Text-to-speech if enabled
      if (isSpeechEnabled) {
        speakMessage(content)
      }
    }, 1500)
  }

  // Add user message
  const addUserMessage = (content) => {
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    
    // Generate bot response
    setTimeout(() => {
      generateBotResponse(content)
    }, 1000)
  }

  // Generate contextual bot response
  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    let response = ''

    if (lowerMessage.includes('stress') || lowerMessage.includes('anxious')) {
      response = "I understand you're feeling stressed. Let's try a breathing exercise together. Breathe in slowly for 4 counts, hold for 4, then exhale for 6. Repeat this 3 times."
    } else if (lowerMessage.includes('tired') || lowerMessage.includes('fatigue')) {
      response = "Fatigue is common in space environments. If possible, try to rest. Even a 10-minute break can help restore your energy."
    } else if (lowerMessage.includes('lonely') || lowerMessage.includes('isolated')) {
      response = "Feeling isolated is natural in space. Remember that your crew and ground support are always here for you. Consider scheduling a call with loved ones."
    } else if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      response = "I'm here to help! You can talk to me about anything, practice breathing exercises, or I can provide wellness tips. What would be most helpful right now?"
    } else {
      // Default supportive responses
      const responses = [
        "Thank you for sharing that with me. How are you feeling right now?",
        "I appreciate you opening up. Is there anything specific I can help you with?",
        "Your well-being is important. Remember that it's okay to take breaks when needed.",
        "I'm here to listen and support you. What's on your mind?"
      ]
      response = responses[Math.floor(Math.random() * responses.length)]
    }

    addBotMessage(response)
  }

  // Text-to-speech function
  const speakMessage = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.7
      speechSynthesis.speak(utterance)
    }
  }

  // Handle message send
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      addUserMessage(inputMessage)
      setInputMessage('')
    }
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Quick action buttons
  const quickActions = [
    { label: 'Breathing Exercise', action: () => addBotMessage("Let's do a breathing exercise. Breathe in for 4 counts... hold for 4... exhale for 6. Repeat 3 times.") },
    { label: 'Wellness Tip', action: () => addBotMessage(wellnessTips[Math.floor(Math.random() * wellnessTips.length)]) },
    { label: 'Motivation', action: () => addBotMessage("You're doing an incredible job! Your mission is important and you're making a difference. Stay strong!") }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-400" />
          AI Support Assistant
        </h3>
        
        <Button
          onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
          variant="outline"
          size="sm"
          className={`border-slate-600 ${isSpeechEnabled ? 'bg-blue-900/50 text-blue-300' : 'text-slate-400'}`}
        >
          {isSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </Button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-slate-900/30 rounded-lg p-4 overflow-y-auto max-h-96 mb-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' ? 'bg-blue-600' : 'bg-green-600'
                  }`}>
                    {message.type === 'user' ? 
                      <User className="w-4 h-4 text-white" /> : 
                      <Bot className="w-4 h-4 text-white" />
                    }
                  </div>
                  
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-700 text-slate-100'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-2 mb-4"
          >
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex space-x-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          className="flex-1 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
        />
        <Button 
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default ChatbotInterface

