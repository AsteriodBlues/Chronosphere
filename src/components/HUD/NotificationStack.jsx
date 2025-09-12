import { useState, useEffect } from 'react'

export default function NotificationStack() {
  const [notifications, setNotifications] = useState([])
  
  // Example notification for demo
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications([
        {
          id: 1,
          type: 'success',
          title: 'Portal System Active',
          message: 'Navigation portals are now available',
          timestamp: Date.now()
        }
      ])
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])
  
  if (notifications.length === 0) return null
  
  return (
    <div className="space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="glass-panel glass-panel--secondary glass-panel--md w-64 animate-fade-in-right"
        >
          <div className="flex justify-between items-start mb-2">
            <div className={`text-ui font-semibold ${
              notification.type === 'success' ? 'text-success' :
              notification.type === 'error' ? 'text-error' :
              'text-primary'
            }`}>
              {notification.title}
            </div>
            <button 
              onClick={() => setNotifications([])}
              className="text-tertiary hover:text-secondary text-caption"
            >
              ✕
            </button>
          </div>
          <div className="text-small text-secondary">
            {notification.message}
          </div>
        </div>
      ))}
    </div>
  )
}