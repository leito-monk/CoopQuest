import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <div className="card max-w-md w-full text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Página no encontrada
        </h1>
        <p className="text-gray-600 mb-6">
          La página que buscas no existe o fue movida.
        </p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default NotFound;
