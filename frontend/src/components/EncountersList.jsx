import { useState, useEffect } from 'react';
import { getPendingEncounters } from '../services/api';

function EncountersList({ onTeamsUpdate }) {
  const [pendingTeams, setPendingTeams] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEncounters();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadEncounters, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadEncounters = async () => {
    try {
      const response = await getPendingEncounters();
      const { pendingTeams: teams, stats: encounterStats } = response.data.data;
      setPendingTeams(teams);
      setStats(encounterStats);
      
      if (onTeamsUpdate) {
        onTeamsUpdate(teams, encounterStats);
      }
    } catch (err) {
      console.error('Error loading encounters:', err);
      setError('Error al cargar encuentros');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card text-center">
        <div className="spinner mx-auto text-primary"></div>
        <p className="mt-2 text-gray-600 text-sm">Cargando equipos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-2 border-red-200 text-center">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={loadEncounters}
          className="mt-2 text-sm text-red-600 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const completedEncounters = parseInt(stats?.completed_encounters || 0);
  const totalTeams = parseInt(stats?.total_teams || 0);
  const completionPercentage = totalTeams > 0 ? Math.round((completedEncounters / totalTeams) * 100) : 0;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          🤝 Encuentros Cooperativos
        </h3>
        <button 
          onClick={loadEncounters}
          className="text-primary hover:text-blue-700 text-sm"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {completedEncounters}/{totalTeams}
            </div>
            <div className="text-xs text-gray-600">Equipos conocidos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-accent">
              {stats?.total_encounter_points || 0}
            </div>
            <div className="text-xs text-gray-600">Puntos de encuentros</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {completionPercentage}% completado
          </p>
        </div>

        {/* Badges */}
        {completedEncounters >= 10 && (
          <div className="mt-3 text-center">
            <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold">
              🏆 Networker
            </span>
          </div>
        )}
        {completionPercentage >= 80 && (
          <div className="mt-2 text-center">
            <span className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
              ⭐ Super Cooperativo
            </span>
          </div>
        )}
      </div>

      {/* Pending Teams */}
      {pendingTeams.length === 0 ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-gray-600 text-sm">
            {totalTeams === 0 
              ? 'No hay otros equipos registrados aún'
              : '¡Conociste a todos los equipos!'}
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Escanea el QR de estos equipos para iniciar un encuentro:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pendingTeams.map((team) => (
              <div 
                key={team.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <span className="text-xl mr-3">👋</span>
                  <div>
                    <p className="font-semibold text-gray-800">{team.name}</p>
                    <p className="text-xs text-gray-500">{team.score} puntos</p>
                  </div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Pendiente
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-xs text-green-800">
          💡 <strong>¿Cómo funciona?</strong> Escanea el QR personal de otro equipo. 
          Ambos recibirán un desafío colaborativo que deben resolver juntos. 
          ¡Si ambos responden correctamente, ganan puntos!
        </p>
      </div>
    </div>
  );
}

export default EncountersList;
