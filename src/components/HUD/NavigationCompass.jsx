import { usePortalStore } from '../../systems/PortalManager'

export default function NavigationCompass({ expanded = false }) {
  const { portals, currentPortal, navigateToPortal } = usePortalStore()
  
  const visiblePortals = Array.from(portals.values())
    .filter(portal => portal.isVisible)
    .slice(0, expanded ? 6 : 3)
  
  if (!expanded) {
    return (
      <div className="w-12 h-12 rounded-full glass-panel glass-panel--tertiary flex items-center justify-center">
        <div className="text-caption text-secondary">🧭</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      <div className="text-label text-tertiary mb-3">Navigation</div>
      
      {/* Current Portal */}
      {currentPortal && (
        <div className="glass-panel glass-panel--tertiary p-2 rounded-lg">
          <div className="text-small text-primary">Current: {currentPortal}</div>
        </div>
      )}
      
      {/* Available Portals */}
      <div className="space-y-2">
        {visiblePortals.map(portal => (
          <button
            key={portal.id}
            onClick={() => navigateToPortal(portal.id)}
            className="w-full text-left p-2 rounded-lg glass-panel--hover transition-all text-small text-secondary hover:text-primary"
          >
            {portal.label}
          </button>
        ))}
      </div>
    </div>
  )
}