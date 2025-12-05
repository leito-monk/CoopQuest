import { useEffect, useState } from 'react';

function EncounterNotification({ message, type = 'info', onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Wait for animation
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch (type) {
      case 'team_joined':
        return {
          bg: 'bg-green-500',
          icon: '🆕',
          title: 'Nuevo Equipo'
        };
      case 'encounter_started':
        return {
          bg: 'bg-blue-500',
          icon: '🤝',
          title: 'Encuentro Iniciado'
        };
      case 'encounter_completed':
        return {
          bg: 'bg-purple-500',
          icon: '🎉',
          title: 'Encuentro Completado'
        };
      case 'team_online':
        return {
          bg: 'bg-green-400',
          icon: '🟢',
          title: 'Equipo Conectado'
        };
      case 'team_offline':
        return {
          bg: 'bg-gray-500',
          icon: '⚫',
          title: 'Equipo Desconectado'
        };
      default:
        return {
          bg: 'bg-blue-500',
          icon: '📢',
          title: 'Notificación'
        };
    }
  };

  const styles = getStyles();

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${styles.bg} text-white rounded-lg shadow-lg p-4`}>
        <div className="flex items-start gap-3">
          <span className="text-2xl">{styles.icon}</span>
          <div className="flex-1">
            <p className="font-bold text-sm">{styles.title}</p>
            <p className="text-white/90 text-sm">{message}</p>
          </div>
          <button 
            onClick={() => {
              setIsVisible(false);
              if (onClose) setTimeout(onClose, 300);
            }}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

// Container component to manage multiple notifications
export function NotificationContainer({ notifications, onRemove }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <EncounterNotification
          key={notification.id || index}
          message={notification.message}
          type={notification.type}
          onClose={() => onRemove(notification.id || index)}
        />
      ))}
    </div>
  );
}

export default EncounterNotification;
