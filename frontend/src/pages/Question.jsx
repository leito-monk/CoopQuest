import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { submitAnswer } from '../services/api';
import confetti from 'canvas-confetti';

function Question() {
  const { checkpointId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [checkpoint, setCheckpoint] = useState(location.state?.checkpoint || null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Check if team is registered
    const token = localStorage.getItem('coopquest_token');
    if (!token) {
      navigate('/');
      return;
    }

    if (!checkpoint) {
      // If no checkpoint in state, redirect to dashboard
      navigate('/dashboard');
    }
  }, [checkpoint, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!answer.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await submitAnswer(checkpointId, answer.trim());
      const data = response.data.data;

      setResult(data);

      if (data.correct) {
        // Celebrate correct answer
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Update team score in localStorage
        const teamData = JSON.parse(localStorage.getItem('coopquest_team'));
        teamData.score = data.newScore;
        localStorage.setItem('coopquest_team', JSON.stringify(teamData));

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        // Show correct answer and redirect after 5 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 5000);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Error al enviar respuesta. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!checkpoint) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-4 flex items-center">
      <div className="max-w-2xl mx-auto w-full">
        {!result ? (
          // Question Form
          <div className="card animate-slide-up">
            {/* Checkpoint Info */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {checkpoint.name}
                </h2>
                <span className="text-xl font-bold text-accent">
                  {checkpoint.points} pts
                </span>
              </div>
              {checkpoint.description && (
                <p className="text-gray-600 mb-4">{checkpoint.description}</p>
              )}
            </div>

            {/* Question */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
              <div className="text-4xl mb-3 text-center">❓</div>
              <p className="text-lg text-gray-800 font-medium text-center">
                {checkpoint.question}
              </p>
            </div>

            {/* Answer Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Tu respuesta:
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Escribe tu respuesta aquí..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  disabled={submitting}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-outline"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !answer.trim()}
                >
                  {submitting ? 'Enviando...' : 'Responder'}
                </button>
              </div>
            </form>

            {/* Hint */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 <strong>Importante:</strong> Solo tienes una oportunidad para responder. 
                Si fallas, no podrás reintentar este checkpoint.
              </p>
            </div>
          </div>
        ) : result.correct ? (
          // Correct Answer
          <div className="card text-center animate-slide-up bg-green-50 border-4 border-green-500">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-green-800 mb-3">
              ¡Correcto!
            </h2>
            <p className="text-xl text-gray-700 mb-4">
              {result.message}
            </p>
            <div className="bg-green-200 rounded-lg p-4 mb-4">
              <div className="text-4xl font-bold text-green-800">
                +{checkpoint.points} puntos
              </div>
              <div className="text-sm text-green-700 mt-1">
                Nuevo puntaje: {result.newScore}
              </div>
            </div>
            <p className="text-gray-600">
              Redirigiendo al dashboard...
            </p>
          </div>
        ) : (
          // Incorrect Answer
          <div className="card text-center animate-slide-up bg-red-50 border-4 border-red-500">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-3xl font-bold text-red-800 mb-3">
              Respuesta Incorrecta
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              {result.message}
            </p>
            <div className="bg-red-200 rounded-lg p-4 mb-4">
              <div className="text-sm text-red-700 mb-1">
                La respuesta correcta era:
              </div>
              <div className="text-2xl font-bold text-red-900">
                {result.correctAnswer}
              </div>
            </div>
            <p className="text-gray-600">
              Este checkpoint se marcó como fallido.
            </p>
            <p className="text-gray-600 mt-2">
              Redirigiendo al dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Question;
