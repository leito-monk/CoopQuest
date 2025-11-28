import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, registerTeam } from '../services/api';

function Register() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const response = await getEventById(eventId);
      setEvent(response.data.data);
    } catch (error) {
      console.error('Error loading event:', error);
      setError('No se pudo cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError('Por favor ingresa un nombre para tu equipo');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const response = await registerTeam(eventId, teamName.trim());
      const { team, token } = response.data.data;

      // Save to localStorage
      localStorage.setItem('coopquest_token', token);
      localStorage.setItem('coopquest_team', JSON.stringify(team));

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error registering team:', error);
      setError(
        error.response?.data?.message || 
        'Error al registrar el equipo. Por favor intenta de nuevo.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="spinner mx-auto text-primary"></div>
          <p className="mt-4 text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-4xl mb-4">😔</div>
          <p className="text-gray-600 mb-4">Evento no encontrado</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-4">
      <div className="max-w-md mx-auto pt-8 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-white hover:text-blue-200 mb-4 inline-flex items-center"
          >
            ← Volver
          </button>
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Registrar Equipo
          </h1>
        </div>

        {/* Event Info */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {event.name}
          </h2>
          {event.description && (
            <p className="text-gray-600 mb-3">{event.description}</p>
          )}
          <div className="text-sm text-gray-500">
            📍 {event.location}
          </div>
        </div>

        {/* Registration Form */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Nombre del Equipo
              </label>
              <input
                type="text"
                className="input"
                placeholder="Ej: Los Cooperativistas"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                maxLength={50}
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-1">
                Máximo 50 caracteres
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting || !teamName.trim()}
            >
              {submitting ? (
                <>
                  <div className="spinner inline-block mr-2 !w-5 !h-5"></div>
                  Registrando...
                </>
              ) : (
                '¡Comenzar la búsqueda!'
              )}
            </button>
          </form>
        </div>

        {/* Instructions */}
        <div className="card mt-6 bg-blue-50 border-2 border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">💡 Importante</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Cada equipo puede registrarse una sola vez</li>
            <li>• Guarda tu sesión para continuar después</li>
            <li>• Necesitarás acceso a la cámara para escanear QR</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Register;
