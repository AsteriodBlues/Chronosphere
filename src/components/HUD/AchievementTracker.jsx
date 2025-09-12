import { useTimerStore } from '../../stores/timerStore'

export default function AchievementTracker() {
  const { timer } = useTimerStore()
  const completedSessions = timer.completedSessions || 0
  
  const achievements = [
    {
      id: 'first_focus',
      title: 'First Focus',
      description: 'Complete your first focus session',
      progress: Math.min(completedSessions, 1),
      target: 1,
      unlocked: completedSessions >= 1,
      icon: '🎯'
    },
    {
      id: 'focus_streak',
      title: 'Focus Streak',
      description: 'Complete 5 sessions in a row',
      progress: Math.min(completedSessions, 5),
      target: 5,
      unlocked: completedSessions >= 5,
      icon: '🔥'
    },
    {
      id: 'productivity_master',
      title: 'Productivity Master',
      description: 'Complete 10 focus sessions',
      progress: Math.min(completedSessions, 10),
      target: 10,
      unlocked: completedSessions >= 10,
      icon: '👑'
    }
  ]
  
  return (
    <div className="space-y-4">
      {achievements.map(achievement => (
        <div 
          key={achievement.id}
          className={`p-3 rounded-lg transition-all ${
            achievement.unlocked 
              ? 'glass-panel--secondary border border-success border-opacity-30' 
              : 'glass-panel--tertiary'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`text-lg ${achievement.unlocked ? 'animate-pulse' : 'opacity-50'}`}>
              {achievement.icon}
            </div>
            <div className="flex-1">
              <div className={`text-ui font-medium ${
                achievement.unlocked ? 'text-success' : 'text-secondary'
              }`}>
                {achievement.title}
              </div>
              <div className="text-small text-tertiary mt-1">
                {achievement.description}
              </div>
              
              {/* Progress Bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-500 ${
                      achievement.unlocked ? 'bg-success' : 'bg-gray-500'
                    }`}
                    style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                  />
                </div>
                <div className="text-micro text-quaternary mt-1">
                  {achievement.progress}/{achievement.target}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}