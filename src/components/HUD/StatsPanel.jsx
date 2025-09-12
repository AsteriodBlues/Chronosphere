import { useTimerStore } from '../../stores/timerStore'

export default function StatsPanel() {
  const { timer } = useTimerStore()
  const completedSessions = timer.completedSessions || 0
  const totalFocusTime = completedSessions * 25 * 60 // Estimate based on completed sessions
  
  const stats = [
    {
      label: 'Focus Time Today',
      value: `${Math.floor(totalFocusTime / 3600)}h ${Math.floor((totalFocusTime % 3600) / 60)}m`,
      color: 'text-blue-400'
    },
    {
      label: 'Sessions Completed',
      value: completedSessions,
      color: 'text-green-400'
    },
    {
      label: 'Current Streak',
      value: timer.currentStreak || 0,
      color: 'text-orange-400'
    },
    {
      label: 'Productivity Score',
      value: `${Math.min(completedSessions * 10, 100)}%`,
      color: 'text-purple-400'
    }
  ]
  
  return (
    <div className="space-y-4">
      {stats.map((stat, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="text-ui text-secondary">{stat.label}</span>
          <span className={`text-ui font-semibold ${stat.color}`}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  )
}