import { useTimerStore } from '../../stores/timerStore'

export default function QuickActions() {
  const { timer, startTimer, pauseTimer, stopTimer } = useTimerStore()
  const timerState = timer.status
  
  const isRunning = ['focus', 'break', 'flow'].includes(timerState)
  
  const actions = [
    {
      icon: '⚙️',
      label: 'Settings',
      onClick: () => console.log('Settings')
    },
    {
      icon: '🔔',
      label: 'Notifications',
      onClick: () => console.log('Notifications')
    },
    {
      icon: '❓',
      label: 'Help',
      onClick: () => console.log('Help')
    }
  ]
  
  return (
    <div className="flex items-center gap-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="w-8 h-8 rounded-lg glass-panel--tertiary glass-panel--hover flex items-center justify-center text-caption text-tertiary hover:text-secondary transition-all"
          title={action.label}
        >
          {action.icon}
        </button>
      ))}
    </div>
  )
}