import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  adminLogin, createEvent, createCheckpoint, getCheckpointQR, exportEventResults, 
  adminGetEvents, adminGetCheckpoints, adminUpdateEvent, adminDeleteEvent, 
  adminUpdateCheckpoint, adminDeleteCheckpoint,
  adminGetChallenges, adminCreateChallenge, adminUpdateChallenge, adminDeleteChallenge,
  adminGetEncounters, adminGetEncounterStats
} from '../services/api';

function Admin() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('events'); // events, checkpoints, stats

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminLogin(password);
      setAuthenticated(true);
      localStorage.setItem('admin_password', password);
    } catch (error) {
      setError('Contraseña incorrecta');
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 p-4 flex items-center justify-center">
        <div className="card max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔐</div>
            <h1 className="text-2xl font-bold text-gray-800">
              Panel de Administración
            </h1>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Contraseña de administrador
              </label>
              <input
                type="password"
                className="input"
                placeholder="Ingresa la contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading || !password}
            >
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800 text-sm underline"
            >
              Volver al inicio
            </button>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Para desarrollo:</strong> La contraseña por defecto es{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">admin123</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">🔧 Panel Admin</h1>
              <p className="text-gray-300 text-sm">CoopQuest</p>
            </div>
            <button
              onClick={() => {
                setAuthenticated(false);
                localStorage.removeItem('admin_password');
                navigate('/');
              }}
              className="btn btn-outline text-white border-white hover:bg-white hover:text-gray-800"
            >
              Cerrar sesión
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'events'
                  ? 'bg-white text-gray-800'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              📅 Eventos
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'stats'
                  ? 'bg-white text-gray-800'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              👥 Equipos en Vivo
            </button>
            <button
              onClick={() => setActiveTab('checkpoints')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'checkpoints'
                  ? 'bg-white text-gray-800'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              📍 Checkpoints
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'challenges'
                  ? 'bg-white text-gray-800'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              🤝 Desafíos
            </button>
            <button
              onClick={() => setActiveTab('encounters')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'encounters'
                  ? 'bg-white text-gray-800'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              📊 Encuentros
            </button>
            <button
              onClick={() => setActiveTab('qr-generator')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'qr-generator'
                  ? 'bg-white text-gray-800'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              📱 Generar QR
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'instructions'
                  ? 'bg-white text-gray-800'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              📚 Instrucciones
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6">
        {activeTab === 'events' && <EventsTab password={password} />}
        {activeTab === 'stats' && <StatsTab password={password} />}
        {activeTab === 'checkpoints' && <CheckpointsTab password={password} />}
        {activeTab === 'challenges' && <ChallengesTab password={password} />}
        {activeTab === 'encounters' && <EncountersTab password={password} />}
        {activeTab === 'qr-generator' && <QRGeneratorTab password={password} />}
        {activeTab === 'instructions' && <InstructionsTab />}
      </div>
    </div>
  );
}

function EventsTab({ password }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    status: 'draft'
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await adminGetEvents(password);
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingEvent) {
        await adminUpdateEvent(editingEvent.id, formData, password);
      } else {
        await createEvent(formData, password);
      }
      
      setShowForm(false);
      setEditingEvent(null);
      setFormData({ name: '', description: '', date: '', location: '', status: 'draft' });
      await loadEvents();
    } catch (error) {
      alert('Error al guardar el evento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || '',
      date: event.date ? event.date.split('T')[0] : '',
      location: event.location || '',
      status: event.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este evento? Se eliminarán también sus checkpoints.')) {
      return;
    }

    try {
      await adminDeleteEvent(id, password);
      await loadEvents();
    } catch (error) {
      alert('Error al eliminar el evento: ' + error.message);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      finished: 'bg-blue-100 text-blue-800'
    };
    const labels = {
      draft: 'Borrador',
      active: 'Activo',
      finished: 'Finalizado'
    };
    return <span className={`badge ${styles[status]}`}>{labels[status]}</span>;
  };

  if (loading && events.length === 0) {
    return <div className="text-center py-8">Cargando eventos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📅 Gestión de Eventos
          </h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingEvent(null);
              setFormData({ name: '', description: '', date: '', location: '', status: 'draft' });
            }}
            className="btn btn-primary"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Evento'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-bold mb-4">
              {editingEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Nombre del Evento *
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Descripción
                </label>
                <textarea
                  className="input"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  className="input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Estado *
                </label>
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="draft">Borrador</option>
                  <option value="active">Activo</option>
                  <option value="finished">Finalizado</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : editingEvent ? 'Actualizar' : 'Crear Evento'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                }}
                className="btn btn-outline"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay eventos creados. Crea tu primer evento o carga los datos demo.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
                      {statusBadge(event.status)}
                    </div>
                    {event.description && (
                      <p className="text-gray-600 mb-2">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {event.date && (
                        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                      )}
                      {event.location && <span>📍 {event.location}</span>}
                      <span>🎯 {event.checkpoint_count || 0} checkpoints</span>
                      <span>👥 {event.team_count || 0} equipos</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(event)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CheckpointsTab({ password }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCheckpoint, setEditingCheckpoint] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    question: '',
    answer: '',
    points: 100,
    order_num: 1
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadCheckpoints();
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const response = await adminGetEvents(password);
      const data = response.data.data || [];
      setEvents(data);
      if (data.length > 0 && !selectedEventId) {
        setSelectedEventId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadCheckpoints = async () => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const response = await adminGetCheckpoints(selectedEventId, password);
      setCheckpoints(response.data.data || []);
    } catch (error) {
      console.error('Error loading checkpoints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingCheckpoint) {
        await adminUpdateCheckpoint(editingCheckpoint.id, formData, password);
      } else {
        await createCheckpoint(selectedEventId, formData, password);
      }
      
      setShowForm(false);
      setEditingCheckpoint(null);
      setFormData({ name: '', description: '', question: '', answer: '', points: 100, order_num: 1 });
      await loadCheckpoints();
    } catch (error) {
      alert('Error al guardar el checkpoint: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (checkpoint) => {
    setEditingCheckpoint(checkpoint);
    setFormData({
      name: checkpoint.name,
      description: checkpoint.description || '',
      question: checkpoint.question,
      answer: checkpoint.answer,
      points: checkpoint.points,
      order_num: checkpoint.order_num
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este checkpoint?')) {
      return;
    }

    try {
      await adminDeleteCheckpoint(id, password);
      await loadCheckpoints();
    } catch (error) {
      alert('Error al eliminar el checkpoint: ' + error.message);
    }
  };

  const downloadQR = async (checkpoint) => {
    try {
      // Get blob directly from API (response.data is already extracted)
      const blobData = await getCheckpointQR(checkpoint.id, password);
      const url = window.URL.createObjectURL(blobData);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `checkpoint-${checkpoint.order_num}-${checkpoint.name.toLowerCase().replace(/\s+/g, '-')}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error al descargar el QR: ' + error.message);
    }
  };

  if (events.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-600 mb-4">
          No hay eventos creados. Crea un evento primero para poder agregar checkpoints.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Seleccionar Evento
          </label>
          <select
            className="input max-w-md"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} ({event.checkpoint_count || 0} checkpoints)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            📍 Checkpoints del Evento
          </h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingCheckpoint(null);
              const nextOrder = checkpoints.length > 0 ? Math.max(...checkpoints.map(c => c.order_num)) + 1 : 1;
              setFormData({ name: '', description: '', question: '', answer: '', points: 100, order_num: nextOrder });
            }}
            className="btn btn-primary"
            disabled={!selectedEventId}
          >
            {showForm ? 'Cancelar' : '+ Nuevo Checkpoint'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-bold mb-4">
              {editingCheckpoint ? 'Editar Checkpoint' : 'Crear Nuevo Checkpoint'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Nombre del Checkpoint *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: Stand de gcoop"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Descripción
                </label>
                <textarea
                  className="input"
                  rows="2"
                  placeholder="Descripción opcional del checkpoint"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Pregunta *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: ¿En qué año se fundó gcoop?"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Respuesta Correcta *
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: 2007"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  💡 La respuesta no distingue mayúsculas/minúsculas ni acentos
                </p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Puntos *
                </label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Orden *
                </label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  value={formData.order_num}
                  onChange={(e) => setFormData({ ...formData, order_num: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : editingCheckpoint ? 'Actualizar' : 'Crear Checkpoint'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCheckpoint(null);
                }}
                className="btn btn-outline"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading && checkpoints.length === 0 ? (
          <div className="text-center py-8">Cargando checkpoints...</div>
        ) : checkpoints.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay checkpoints en este evento. Crea tu primer checkpoint.
          </div>
        ) : (
          <div className="space-y-4">
            {checkpoints.sort((a, b) => a.order_num - b.order_num).map((checkpoint) => (
              <div key={checkpoint.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-primary">#{checkpoint.order_num}</span>
                      <h3 className="text-xl font-bold text-gray-800">{checkpoint.name}</h3>
                      <span className="badge badge-info">{checkpoint.points} pts</span>
                    </div>
                    {checkpoint.description && (
                      <p className="text-gray-600 text-sm mb-2">{checkpoint.description}</p>
                    )}
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-2">
                      <p className="text-sm font-semibold text-gray-700">❓ {checkpoint.question}</p>
                      <p className="text-sm text-green-700 mt-1">✅ Respuesta: {checkpoint.answer}</p>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">QR: {checkpoint.qr_code}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => downloadQR(checkpoint)}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      title="Descargar QR"
                    >
                      📱
                    </button>
                    <button
                      onClick={() => handleEdit(checkpoint)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(checkpoint.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QRGeneratorTab({ password }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [checkpoints, setCheckpoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCheckpoints, setSelectedCheckpoints] = useState([]);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadCheckpoints();
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const response = await adminGetEvents(password);
      const data = response.data.data || [];
      setEvents(data);
      if (data.length > 0 && !selectedEventId) {
        setSelectedEventId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadCheckpoints = async () => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const response = await adminGetCheckpoints(selectedEventId, password);
      setCheckpoints(response.data.data || []);
    } catch (error) {
      console.error('Error loading checkpoints:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCheckpoint = (id) => {
    setSelectedCheckpoints(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const downloadSelected = async () => {
    if (selectedCheckpoints.length === 0) {
      alert('Selecciona al menos un checkpoint');
      return;
    }

    setLoading(true);
    try {
      for (const checkpointId of selectedCheckpoints) {
        const checkpoint = checkpoints.find(c => c.id === checkpointId);
        const blob = await getCheckpointQR(checkpointId, password);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `checkpoint-${checkpoint.order_num}-${checkpoint.name.toLowerCase().replace(/\s+/g, '-')}.png`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        // Pequeña pausa entre descargas
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      alert(`${selectedCheckpoints.length} códigos QR descargados exitosamente`);
    } catch (error) {
      alert('Error al descargar QR codes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = async () => {
    const allIds = checkpoints.map(c => c.id);
    setSelectedCheckpoints(allIds);
    
    setLoading(true);
    try {
      for (const checkpoint of checkpoints.sort((a, b) => a.order_num - b.order_num)) {
        const blob = await getCheckpointQR(checkpoint.id, password);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `checkpoint-${checkpoint.order_num}-${checkpoint.name.toLowerCase().replace(/\s+/g, '-')}.png`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      alert(`${checkpoints.length} códigos QR descargados exitosamente`);
    } catch (error) {
      alert('Error al descargar QR codes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (events.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-600 mb-4">
          No hay eventos creados. Crea un evento y sus checkpoints primero.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📱 Generador de Códigos QR
        </h2>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Seleccionar Evento
          </label>
          <select
            className="input max-w-md"
            value={selectedEventId}
            onChange={(e) => {
              setSelectedEventId(e.target.value);
              setSelectedCheckpoints([]);
            }}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} ({event.checkpoint_count || 0} checkpoints)
              </option>
            ))}
          </select>
        </div>

        {checkpoints.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Este evento no tiene checkpoints. Crea checkpoints primero en la pestaña "Checkpoints".
          </div>
        ) : (
          <>
            <div className="flex gap-3 mb-6">
              <button
                onClick={downloadSelected}
                className="btn btn-primary"
                disabled={loading || selectedCheckpoints.length === 0}
              >
                {loading ? 'Generando...' : `Descargar Seleccionados (${selectedCheckpoints.length})`}
              </button>
              <button
                onClick={downloadAll}
                className="btn btn-secondary"
                disabled={loading}
              >
                {loading ? 'Generando...' : 'Descargar Todos'}
              </button>
              <button
                onClick={() => setSelectedCheckpoints(checkpoints.map(c => c.id))}
                className="btn btn-outline"
              >
                Seleccionar Todos
              </button>
              <button
                onClick={() => setSelectedCheckpoints([])}
                className="btn btn-outline"
              >
                Deseleccionar Todos
              </button>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 text-sm">
                💡 <strong>Tip:</strong> Imprime los códigos QR en tamaño A4 o carta para mejor legibilidad. 
                Cada código incluye información de seguridad para prevenir falsificaciones.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {checkpoints.sort((a, b) => a.order_num - b.order_num).map((checkpoint) => (
                <div
                  key={checkpoint.id}
                  onClick={() => toggleCheckpoint(checkpoint.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCheckpoints.includes(checkpoint.id)
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCheckpoints.includes(checkpoint.id)}
                      onChange={() => toggleCheckpoint(checkpoint.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-primary">#{checkpoint.order_num}</span>
                        <span className="badge badge-info text-xs">{checkpoint.points} pts</span>
                      </div>
                      <h3 className="font-bold text-gray-800">{checkpoint.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{checkpoint.question}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InstructionsTab() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          📚 Guía de Uso
        </h2>

        <div className="space-y-6">
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              1. Cargar Datos de Prueba
            </h3>
            <p className="text-gray-700 mb-2">
              Para testear la aplicación con el evento demo pre-configurado:
            </p>
            <code className="block bg-gray-100 p-3 rounded">
              cd backend && npm run seed:demo
            </code>
            <p className="text-sm text-gray-600 mt-2">
              Esto creará el evento "Punto Coop 2025 - Demo" con 5 checkpoints y sus códigos QR.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              2. Códigos QR
            </h3>
            <p className="text-gray-700 mb-2">
              Los códigos QR de prueba se encuentran en:
            </p>
            <code className="block bg-gray-100 p-3 rounded text-sm">
              backend/public/demo-qrs/
            </code>
            <p className="text-sm text-gray-600 mt-2">
              Imprime estos códigos y colócalos en diferentes lugares para testear.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              3. Respuestas de los Checkpoints
            </h3>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <ul className="space-y-1 text-sm">
                <li>🏢 <strong>Stand de gcoop:</strong> 2007</li>
                <li>🤝 <strong>Stand de FACTTIC:</strong> 30</li>
                <li>💬 <strong>Sala de Charlas:</strong> código abierto</li>
                <li>👥 <strong>Área de Networking:</strong> quinto (o 5)</li>
                <li>🤖 <strong>Demo de IA:</strong> ollama</li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              4. API Endpoints
            </h3>
            <p className="text-gray-700 mb-2">
              Consulta la documentación completa en:
            </p>
            <code className="block bg-gray-100 p-3 rounded">
              API_DOCS.md
            </code>
          </section>
        </div>
      </div>
    </div>
  );
}

function ChallengesTab({ password }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [formData, setFormData] = useState({
    challenge_type: 'trivia',
    question: '',
    answer_hint: '',
    requires_exact_match: false,
    points: 50,
    time_limit_seconds: 120
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadChallenges();
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const response = await adminGetEvents(password);
      const data = response.data.data || [];
      setEvents(data);
      if (data.length > 0 && !selectedEventId) {
        setSelectedEventId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadChallenges = async () => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const response = await adminGetChallenges(selectedEventId, password);
      setChallenges(response.data.data || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const challengeData = {
        ...formData,
        event_id: selectedEventId
      };

      if (editingChallenge) {
        await adminUpdateChallenge(editingChallenge.id, challengeData, password);
      } else {
        await adminCreateChallenge(challengeData, password);
      }
      
      setShowForm(false);
      setEditingChallenge(null);
      setFormData({
        challenge_type: 'trivia',
        question: '',
        answer_hint: '',
        requires_exact_match: false,
        points: 50,
        time_limit_seconds: 120
      });
      await loadChallenges();
    } catch (error) {
      alert('Error al guardar el desafío: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      challenge_type: challenge.challenge_type,
      question: challenge.question,
      answer_hint: challenge.answer_hint || '',
      requires_exact_match: challenge.requires_exact_match,
      points: challenge.points,
      time_limit_seconds: challenge.time_limit_seconds
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este desafío?')) {
      return;
    }

    try {
      await adminDeleteChallenge(id, password);
      await loadChallenges();
    } catch (error) {
      alert('Error al eliminar el desafío: ' + error.message);
    }
  };

  const challengeTypeLabels = {
    trivia: '🧠 Trivia',
    math: '🔢 Matemático',
    creative: '🎨 Creativo',
    networking: '🤝 Networking'
  };

  if (events.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-600 mb-4">
          No hay eventos creados. Crea un evento primero para poder agregar desafíos colaborativos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Seleccionar Evento
          </label>
          <select
            className="input max-w-md"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            🤝 Desafíos Colaborativos
          </h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingChallenge(null);
              setFormData({
                challenge_type: 'trivia',
                question: '',
                answer_hint: '',
                requires_exact_match: false,
                points: 50,
                time_limit_seconds: 120
              });
            }}
            className="btn btn-primary"
            disabled={!selectedEventId}
          >
            {showForm ? 'Cancelar' : '+ Nuevo Desafío'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-bold mb-4">
              {editingChallenge ? 'Editar Desafío' : 'Crear Nuevo Desafío'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Tipo de Desafío *
                </label>
                <select
                  className="input"
                  value={formData.challenge_type}
                  onChange={(e) => setFormData({ ...formData, challenge_type: e.target.value })}
                  required
                >
                  <option value="trivia">🧠 Trivia</option>
                  <option value="math">🔢 Matemático</option>
                  <option value="creative">🎨 Creativo</option>
                  <option value="networking">🤝 Networking</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Puntos *
                </label>
                <input
                  type="number"
                  className="input"
                  min="1"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Pregunta / Desafío *
                </label>
                <textarea
                  className="input"
                  rows="3"
                  placeholder="Ej: ¿Cuál es el primer principio cooperativo? Acuerden la respuesta."
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Pista (opcional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: Tiene que ver con ser parte de la cooperativa"
                  value={formData.answer_hint}
                  onChange={(e) => setFormData({ ...formData, answer_hint: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Tiempo Límite (segundos) *
                </label>
                <input
                  type="number"
                  className="input"
                  min="30"
                  max="600"
                  value={formData.time_limit_seconds}
                  onChange={(e) => setFormData({ ...formData, time_limit_seconds: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_exact_match}
                    onChange={(e) => setFormData({ ...formData, requires_exact_match: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-700">
                    Requiere respuesta exacta (ambos deben escribir lo mismo)
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : editingChallenge ? 'Actualizar' : 'Crear Desafío'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingChallenge(null);
                }}
                className="btn btn-outline"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading && challenges.length === 0 ? (
          <div className="text-center py-8">Cargando desafíos...</div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay desafíos en este evento. Crea tu primer desafío colaborativo.
          </div>
        ) : (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-primary">
                        {challengeTypeLabels[challenge.challenge_type]}
                      </span>
                      <span className="badge badge-info">{challenge.points} pts</span>
                      <span className="badge badge-warning">{challenge.time_limit_seconds}s</span>
                      {challenge.requires_exact_match && (
                        <span className="badge bg-purple-100 text-purple-800">Exacto</span>
                      )}
                    </div>
                    <p className="text-gray-800 mb-2">{challenge.question}</p>
                    {challenge.answer_hint && (
                      <p className="text-sm text-gray-500 italic">💡 Pista: {challenge.answer_hint}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(challenge)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(challenge.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EncountersTab({ password }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [encounters, setEncounters] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadEncounters();
      loadStats();
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const response = await adminGetEvents(password);
      const data = response.data.data || [];
      setEvents(data);
      if (data.length > 0 && !selectedEventId) {
        setSelectedEventId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadEncounters = async () => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const response = await adminGetEncounters(selectedEventId, password);
      setEncounters(response.data.data || []);
    } catch (error) {
      console.error('Error loading encounters:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!selectedEventId) return;
    
    try {
      const response = await adminGetEncounterStats(selectedEventId, password);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statusLabels = {
    pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    completed: { label: 'Completado', color: 'bg-green-100 text-green-800' },
    failed: { label: 'Fallido', color: 'bg-red-100 text-red-800' },
    expired: { label: 'Expirado', color: 'bg-gray-100 text-gray-800' }
  };

  if (events.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-600 mb-4">
          No hay eventos creados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Seleccionar Evento
          </label>
          <select
            className="input max-w-md"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📊 Estadísticas de Encuentros
        </h2>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalTeams}</div>
              <div className="text-sm text-gray-600">Equipos</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.completedEncounters}</div>
              <div className="text-sm text-gray-600">Exitosos</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{stats.failedEncounters}</div>
              <div className="text-sm text-gray-600">Fallidos</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-600">{stats.totalPointsAwarded}</div>
              <div className="text-sm text-gray-600">Puntos Otorgados</div>
            </div>
          </div>
        )}

        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Historial de Encuentros ({encounters.length})
        </h3>

        {loading ? (
          <div className="text-center py-8">Cargando encuentros...</div>
        ) : encounters.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay encuentros registrados en este evento.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {encounters.map((encounter) => (
              <div key={encounter.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl">🤝</div>
                    <div>
                      <div className="font-bold text-gray-800">
                        {encounter.scanner_team_name} → {encounter.scanned_team_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {encounter.challenge_type && (
                          <span className="mr-2">
                            Desafío: {encounter.challenge_type}
                          </span>
                        )}
                        {new Date(encounter.started_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {encounter.points_awarded > 0 && (
                      <span className="text-green-600 font-bold">
                        +{encounter.points_awarded} pts
                      </span>
                    )}
                    <span className={`badge ${statusLabels[encounter.status]?.color || 'bg-gray-100'}`}>
                      {statusLabels[encounter.status]?.label || encounter.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Stats Tab Component
function StatsTab({ password }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadTeamsStats();
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (!autoRefresh || !selectedEventId) return;

    const interval = setInterval(() => {
      loadTeamsStats();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, selectedEventId]);

  const loadEvents = async () => {
    try {
      const response = await adminGetEvents(password);
      const data = response.data.data || [];
      setEvents(data);
      if (data.length > 0 && !selectedEventId) {
        setSelectedEventId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadTeamsStats = async () => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const response = await adminGetTeamsStats(selectedEventId, password);
      setTeams(response.data.data || []);
    } catch (error) {
      console.error('Error loading teams stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (events.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-600 mb-4">
          No hay eventos creados. Crea un evento primero.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            👥 Equipos en Vivo
          </h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-600">
                Auto-actualizar (5s)
              </span>
            </label>
            <button
              onClick={loadTeamsStats}
              disabled={loading}
              className="btn btn-outline"
            >
              {loading ? '🔄 Cargando...' : '🔄 Actualizar'}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Seleccionar Evento
          </label>
          <select
            className="input max-w-md"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} ({event.status})
              </option>
            ))}
          </select>
        </div>

        {loading && teams.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            Cargando equipos...
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No hay equipos registrados en este evento
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team, index) => (
              <div key={team.id} className="card bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-bold text-blue-600">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {team.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Código QR: {team.personalQRCode}
                      </p>
                      <p className="text-xs text-gray-400">
                        Registrado: {new Date(team.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {team.score} pts
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Checkpoints */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">📍</span>
                      <h4 className="font-semibold text-gray-800">Checkpoints</h4>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {team.checkpoints.completed}/{team.checkpoints.total}
                    </div>
                    <div className="text-sm text-gray-500">completados</div>
                    {team.checkpoints.items.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {team.checkpoints.items.slice(0, 3).map((cp) => (
                          <div key={cp.id} className="text-xs text-gray-600 flex items-center gap-1">
                            {cp.status === 'completed' ? '✅' : '⏳'} {cp.checkpoint_name}
                          </div>
                        ))}
                        {team.checkpoints.items.length > 3 && (
                          <div className="text-xs text-gray-400">
                            +{team.checkpoints.items.length - 3} más
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Challenges */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🤝</span>
                      <h4 className="font-semibold text-gray-800">Desafíos</h4>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {team.challenges.total}
                    </div>
                    <div className="text-sm text-gray-500">completados</div>
                    {team.challenges.items.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {team.challenges.items.slice(0, 3).map((ch) => (
                          <div key={ch.id} className="text-xs text-gray-600">
                            ✅ +{ch.points_awarded} pts
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Encounters */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">🤜🤛</span>
                      <h4 className="font-semibold text-gray-800">Encuentros</h4>
                    </div>
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {team.encounters.completed}/{team.encounters.total}
                    </div>
                    <div className="text-sm text-gray-500">exitosos</div>
                    {team.encounters.total > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        <div>✅ {team.encounters.completed} completados</div>
                        <div>❌ {team.encounters.failed} fallidos</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
