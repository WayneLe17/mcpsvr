'use client'
import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    // Handle visibility
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Wait for animation to complete
    }, duration)

    // Handle progress bar
    const interval = 10 // Update progress every 10ms
    const steps = duration / interval
    const stepSize = 100 / steps
    
    const progressTimer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress - stepSize
        return newProgress > 0 ? newProgress : 0
      })
    }, interval)

    return () => {
      clearTimeout(timer)
      clearInterval(progressTimer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-full">
            <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" strokeWidth={2.5} />
          </div>
        )
      case 'error':
        return (
          <div className="p-2 bg-red-100 dark:bg-red-800/50 rounded-full">
            <AlertCircle className="h-7 w-7 text-red-600 dark:text-red-400" strokeWidth={2.5} />
          </div>
        )
      case 'info':
        return (
          <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-full">
            <Info className="h-7 w-7 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
          </div>
        )
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
      case 'error':
        return 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
      case 'info':
        return 'bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300'
    }
  }

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div
        className={`flex flex-col p-6 rounded-xl shadow-xl border-2 ${getBgColor()} min-w-[350px] max-w-lg backdrop-blur-sm bg-opacity-95 transform transition-all duration-300 hover:scale-102 overflow-hidden relative`}
        style={{
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-4 animate-pulse">{getIcon()}</div>
          <div className="flex-1 mr-3">
            <div className="font-bold text-lg mb-1">
              {type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Information'}
            </div>
            <div className="text-base whitespace-pre-wrap break-words">
              {message}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(onClose, 300)
            }}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors duration-200 rounded-full p-1.5 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-gray-200 mt-4 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              type === 'success' ? 'bg-green-600' :
              type === 'error' ? 'bg-red-600' :
              'bg-blue-600'
            } transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export interface ToastContextType {
  showToast: (message: string, type: ToastType) => void
}

export interface ToastProviderProps {
  children: React.ReactNode
}

export function useToast() {
  const [toasts, setToasts] = useState<{ id: string; message: string; type: ToastType }[]>([])

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const closeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const ToastContainer = () => (
    <div className="fixed bottom-0 right-0 z-50 p-8 space-y-6">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            zIndex: 9999 - index,
            transform: `translateY(${-index * 16}px)`,
            opacity: 1 - (index * 0.15) // Fade out older toasts
          }}
          className="transition-all duration-300 ease-in-out"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => closeToast(toast.id)}
            duration={6000} // Even longer duration for better readability
          />
        </div>
      ))}
    </div>
  )

  return { showToast, ToastContainer }
}