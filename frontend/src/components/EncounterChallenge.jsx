import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveEncounter, submitEncounterAnswer } from '../services/api';
import websocket from '../services/websocket';
import confetti from 'canvas-confetti';

function EncounterChallenge({ encounter: initialEncounter, onComplete }) {
  const navigate = useNavigate();
  const [encounter, setEncounter] = useState(initialEncounter);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(initialEncounter?.timeRemaining || 120);
  const [hasAnswered, setHasAnswered] = useState(initialEncounter?.hasAnswered || false);
  const [otherHasAnswered, setOtherHasAnswered] = useState(initialEncounter?.otherHasAnswered || false);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    if (data.encounterId !== encounter?.id) return;

    switch (data.type) {
      case 'encounter:answered':
        if (data.teamId !== encounter?.scanner_team_id && !encounter?.isScanner) {
          setOtherHasAnswered(true);
        } else if (data.teamId !== encounter?.scanned_team_id && encounter?.isScanner) {
          setOtherHasAnswered(true);
        }
        break;

      case 'encounter:completed':
        setResult({
          success: data.success,
          points: data.points
        });
        if (data.success) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        break;

      case 'encounter:expired':
        setResult({
          success: false,
          expired: true
        });
        break;
    }
  }, [encounter]);

  useEffect(() => {
    websocket.addListener('encounter_challenge', handleWebSocketMessage);
    return () => websocket.removeListener('encounter_challenge');
  }, [handleWebSocketMessage]);

  // Timer
  useEffect(() => {
    if (result || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setResult({ success: false, expired: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [result]);

  // Refresh encounter status periodically
  useEffect(() => {
    if (result) return;

    const refreshStatus = async () => {
      try {
        const response = await getActiveEncounter();
        const data = response.data.data;
        if (data) {
          setEncounter(data);
          setTimeRemaining(data.timeRemaining || 0);
          setHasAnswered(data.hasAnswered);
          setOtherHasAnswered(data.otherHasAnswered);
        }
      } catch (error) {
        console.error('Error refreshing encounter:', error);
      }
    };

    const interval = setInterval(refreshStatus, 5000);
    return () => clearInterval(interval);
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await submitEncounterAnswer(encounter.id, answer.trim());
      const data = response.data.data;

      setHasAnswered(true);

      if (data.completed) {
        setResult({
          success: data.success,
          points: data.points,
          message: data.message
        });
        if (data.success) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert(error.response?.data?.message || 'Error al enviar respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (onComplete) {
      onComplete(result);
    } else {
      navigate('/dashboard');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const otherTeamName = encounter?.isScanner 
    ? encounter?.scanned_team_name 
    : encounter?.scanner_team_name;

  if (!encounter) {
    return null;
  }

  // Show result screen
  if (result) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div className={`card max-w-md w-full text-center animate-slide-up ${
          result.success 
            ? 'bg-green-50 border-4 border-green-500' 
            : 'bg-red-50 border-4 border-red-500'
        }`}>
          <div className="text-6xl mb-4">
            {result.expired ? '⏰' : result.success ? '🎉' : '😔'}
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${
            result.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.expired 
              ? '¡Tiempo Agotado!' 
              : result.success 
                ? '¡Encuentro Exitoso!' 
                : 'Las respuestas no coincidieron'}
          </h2>
          
          {result.success && (
            <div className="bg-green-200 rounded-lg p-4 mb-4">
              <div className="text-3xl font-bold text-green-800">
                +{result.points} puntos
              </div>
              <p className="text-sm text-green-700 mt-1">
                ¡Ambos equipos ganaron!
              </p>
            </div>
          )}

          <p className="text-gray-700 mb-4">
            {result.message || (result.expired 
              ? 'No respondieron a tiempo. ¡Mejor suerte la próxima!' 
              : result.success 
                ? '¡Excelente trabajo en equipo!' 
                : 'Deben coordinar mejor la respuesta')}
          </p>

          <button
            onClick={handleClose}
            className="btn btn-primary w-full"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="card max-w-md w-full animate-slide-up bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🤝</div>
          <h2 className="text-xl font-bold text-gray-800">
            ¡Encuentro Cooperativo!
          </h2>
          <p className="text-primary font-semibold">
            Con: {otherTeamName}
          </p>
        </div>

        {/* Timer */}
        <div className={`text-center mb-4 p-3 rounded-lg ${
          timeRemaining < 30 ? 'bg-red-100' : 'bg-blue-100'
        }`}>
          <div className={`text-3xl font-bold ${
            timeRemaining < 30 ? 'text-red-600 animate-pulse' : 'text-blue-600'
          }`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
        </div>

        {/* Challenge */}
        <div className="bg-white p-4 rounded-lg mb-4 border-2 border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-primary uppercase">
              Desafío {encounter.challenge_type}
            </span>
            <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
              {encounter.challenge_points || 50} pts
            </span>
          </div>
          <p className="text-gray-800 font-medium">
            {encounter.challenge_question}
          </p>
          {encounter.challenge_hint && (
            <p className="text-sm text-gray-500 mt-2 italic">
              💡 Pista: {encounter.challenge_hint}
            </p>
          )}
        </div>

        {/* Status indicators */}
        <div className="flex justify-center gap-4 mb-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            hasAnswered ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <span>{hasAnswered ? '✅' : '⏳'}</span>
            <span className="text-sm">Tú</span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            otherHasAnswered ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <span>{otherHasAnswered ? '✅' : '⏳'}</span>
            <span className="text-sm">Otro equipo</span>
          </div>
        </div>

        {/* Answer Form */}
        {!hasAnswered ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-2">
                Tu respuesta:
              </label>
              <input
                type="text"
                className="input"
                placeholder="Escriban la respuesta acordada..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={submitting}
                autoFocus
              />
              {encounter.requires_exact_match && (
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Las respuestas deben ser exactamente iguales
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting || !answer.trim()}
            >
              {submitting ? 'Enviando...' : '📤 Enviar Respuesta'}
            </button>
          </form>
        ) : (
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2 animate-bounce">⏳</div>
            <p className="text-gray-700">
              ¡Respuesta enviada! Esperando al otro equipo...
            </p>
          </div>
        )}

        {/* Important note */}
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            💬 <strong>¡Coordinen!</strong> Acuerden la respuesta verbalmente antes de escribir. 
            Ambos deben escribir lo mismo para ganar puntos.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EncounterChallenge;
