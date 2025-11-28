import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/api';
import websocket from '../services/websocket';

function Leaderboard() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadLeaderboard();

    // Connect to WebSocket for real-time updates
    websocket.connect(eventId);
    websocket.addListener('leaderboard', handleWebSocketMessage);

    // Refresh every 10 seconds as fallback
    const interval = setInterval(loadLeaderboard, 10000);

    return () => {
      websocket.removeListener('leaderboard');
      clearInterval(interval);
    };
  }, [eventId]);

  const handleWebSocketMessage = (data) => {
    if (data.type === 'leaderboard_update' && data.eventId === eventId) {
      setLeaderboard(data.data);
      setLastUpdate(new Date());
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await getLeaderboard(eventId);
      setLeaderboard(response.data.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (position) => {
    switch (position) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${position + 1}.`;
    }
  };

  const getTeamColor = (position) => {
    switch (position) {
      case 0:
        return 'bg-yellow-50 border-yellow-400 border-2';
      case 1:
        return 'bg-gray-50 border-gray-400 border-2';
      case 2:
        return 'bg-orange-50 border-orange-400 border-2';
      default:
        return 'bg-white';
    }
  };

  const isMyTeam = (teamName) => {
    const myTeam = JSON.parse(localStorage.getItem('coopquest_team') || '{}');
    return myTeam.name === teamName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="spinner mx-auto text-primary"></div>
          <p className="mt-4 text-gray-600">Cargando clasificación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-white hover:text-blue-200 mb-4 flex items-center"
          >
            ← Volver al dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">🏆 Ranking</h1>
              <p className="text-blue-100 text-sm">
                Actualizado: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={loadLeaderboard}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-2xl mx-auto p-4">
        {leaderboard.length === 0 ? (
          <div className="card text-center">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-600">
              No hay equipos registrados todavía
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((team, index) => (
              <div
                key={team.id}
                className={`card ${getTeamColor(index)} ${
                  isMyTeam(team.name) ? 'ring-2 ring-primary' : ''
                } transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="text-3xl font-bold mr-4 min-w-[50px] text-center">
                      {getMedalEmoji(index)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800 flex items-center">
                        {team.name}
                        {isMyTeam(team.name) && (
                          <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded-full">
                            Tu equipo
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>✅ {team.completed_checkpoints} completados</span>
                        <span>❌ {team.failed_checkpoints} fallidos</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-3xl font-bold text-primary">
                      {team.score}
                    </div>
                    <div className="text-xs text-gray-500">puntos</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (team.completed_checkpoints / team.total_checkpoints) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {leaderboard.length > 0 && (
          <div className="card mt-6 bg-blue-50 border-2 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3">📊 Estadísticas</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {leaderboard.length}
                </div>
                <div className="text-sm text-blue-700">Equipos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {Math.max(...leaderboard.map(t => t.score))}
                </div>
                <div className="text-sm text-blue-700">Puntaje más alto</div>
              </div>
            </div>
          </div>
        )}

        {/* Auto-update indicator */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <div className="inline-flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Actualización en tiempo real
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
