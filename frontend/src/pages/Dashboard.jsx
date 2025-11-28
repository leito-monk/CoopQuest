import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgress } from '../services/api';
import confetti from 'canvas-confetti';
import websocket from '../services/websocket';

function Dashboard() {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if team is registered
    const savedTeam = localStorage.getItem('coopquest_team');
    const token = localStorage.getItem('coopquest_token');

    if (!savedTeam || !token) {
      navigate('/');
      return;
    }

    const teamData = JSON.parse(savedTeam);
    setTeam(teamData);

    loadProgress();

    // Connect to WebSocket for real-time updates
    websocket.connect(teamData.eventId);
    websocket.addListener('dashboard', handleWebSocketMessage);

    return () => {
      websocket.removeListener('dashboard');
    };
  }, [navigate]);

  const handleWebSocketMessage = (data) => {
    if (data.type === 'leaderboard_update') {
      // Reload progress to get updated scores
      loadProgress();
    }
  };

  const loadProgress = async () => {
    try {
      const response = await getProgress();
      const { team: teamData, checkpoints } = response.data.data;
      
      setTeam(teamData);
      setProgress(checkpoints);

      // Check if all checkpoints are completed
      const completed = checkpoints.filter(cp => cp.status === 'completed');
      if (completed.length === checkpoints.length && checkpoints.length > 0) {
        celebrateCompletion();
      }
    } catch (error) {
      console.error('Error loading progress:', error);
      setError('Error al cargar el progreso');
    } finally {
      setLoading(false);
    }
  };

  const celebrateCompletion = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">✓ Completado</span>;
      case 'failed':
        return <span className="badge badge-error">✗ Fallido</span>;
      default:
        return <span className="badge badge-warning">Pendiente</span>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  const completedCount = progress.filter(cp => cp.status === 'completed').length;
  const failedCount = progress.filter(cp => cp.status === 'failed').length;
  const totalPoints = team?.score || 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="spinner mx-auto text-primary"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white p-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{team?.name}</h1>
              <p className="text-blue-100 text-sm">Tu equipo</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{totalPoints}</div>
              <div className="text-blue-100 text-sm">Puntos</div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{completedCount}</div>
              <div className="text-xs text-blue-100">Completados</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{failedCount}</div>
              <div className="text-xs text-blue-100">Fallidos</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{progress.length - completedCount - failedCount}</div>
              <div className="text-xs text-blue-100">Pendientes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Checkpoints List */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Checkpoints ({completedCount}/{progress.length})
          </h2>

          {progress.length === 0 ? (
            <div className="card text-center">
              <div className="text-4xl mb-3">😔</div>
              <p className="text-gray-600">
                No hay checkpoints disponibles
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {progress.map((checkpoint) => (
                <div
                  key={checkpoint.id}
                  className={`card ${
                    checkpoint.status === 'completed'
                      ? 'bg-green-50 border-2 border-green-200'
                      : checkpoint.status === 'failed'
                      ? 'bg-red-50 border-2 border-red-200'
                      : 'hover:shadow-lg transition-shadow'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">
                          {getStatusIcon(checkpoint.status)}
                        </span>
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {checkpoint.name}
                          </h3>
                          {checkpoint.description && (
                            <p className="text-sm text-gray-600">
                              {checkpoint.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-accent">
                          {checkpoint.points} puntos
                        </span>
                        {getStatusBadge(checkpoint.status)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completion Message */}
        {completedCount === progress.length && progress.length > 0 && (
          <div className="card bg-gradient-to-r from-accent/20 to-yellow-200/20 border-2 border-accent text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              ¡Felicitaciones!
            </h3>
            <p className="text-gray-700">
              Completaste todos los checkpoints con {totalPoints} puntos
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 shadow-lg">
        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/scanner')}
            className="btn btn-primary flex items-center justify-center pulse-ring"
          >
            📷 Escanear QR
          </button>
          <button
            onClick={() => navigate(`/leaderboard/${team?.eventId}`)}
            className="btn btn-outline flex items-center justify-center"
          >
            🏆 Ranking
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
