import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveEvents } from '../services/api';

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await getActiveEvents();
      setEvents(response.data.data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-4">
      <div className="max-w-md mx-auto pt-8 pb-8">
        {/* Logo and Title */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-4xl font-bold text-white mb-2">CoopQuest</h1>
          <p className="text-blue-100 text-lg">
            Búsqueda del Tesoro Cooperativa
          </p>
        </div>

        {/* Description Card */}
        <div className="card mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-xl font-bold mb-3 text-gray-800">
            ¿Cómo funciona?
          </h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">1.</span>
              <span>Registra tu equipo en un evento</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">2.</span>
              <span>Escanea códigos QR en diferentes stands</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">3.</span>
              <span>Responde preguntas sobre cooperativismo</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">4.</span>
              <span>Suma puntos y compite en el ranking</span>
            </li>
          </ol>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="card text-center">
            <div className="spinner mx-auto text-primary"></div>
            <p className="mt-4 text-gray-600">Cargando eventos...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="card text-center">
            <div className="text-4xl mb-4">😔</div>
            <p className="text-gray-600">
              No hay eventos activos en este momento
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="card hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/register/${event.id}`)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-800">
                    {event.name}
                  </h3>
                  <span className="badge badge-success">Activo</span>
                </div>
                {event.description && (
                  <p className="text-gray-600 mb-3">{event.description}</p>
                )}
                <div className="text-sm text-gray-500 mb-3">
                  📍 {event.location}
                </div>
                <button className="btn btn-primary w-full">
                  ¡Unirme al evento!
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Admin Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/admin')}
            className="text-white hover:text-blue-200 text-sm underline"
          >
            Panel de Administración
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-blue-100 text-sm">
          <p>Desarrollado con ❤️ por gcoop</p>
          <p className="mt-1">Software Libre • AGPL-3.0</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
