import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, createEvent, createCheckpoint, getCheckpointQR, exportEventResults, adminGetEvents, adminGetCheckpoints, adminUpdateEvent, adminDeleteEvent, adminUpdateCheckpoint, adminDeleteCheckpoint } from '../services/api';

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
        {activeTab === 'checkpoints' && <CheckpointsTab password={password} />}
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

export default Admin;
