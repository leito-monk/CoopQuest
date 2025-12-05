import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { scanQR, scanParticipantQR } from '../services/api';

function Scanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [encounterData, setEncounterData] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    // Check if team is registered
    const token = localStorage.getItem('coopquest_token');
    if (!token) {
      navigate('/');
      return;
    }

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      const html5QrCode = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanError
      );

      setScanning(true);
      setMessage('Apunta la cámara al código QR');
    } catch (err) {
      console.error('Error starting scanner:', err);
      setError('No se pudo acceder a la cámara. Por favor verifica los permisos.');
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const isParticipantQR = (qrCode) => {
    return qrCode && qrCode.startsWith('COOPTEAM-');
  };

  const onScanSuccess = async (decodedText) => {
    // Stop scanner temporarily
    setScanning(false);
    setMessage('Código detectado, verificando...');

    try {
      await stopScanner();

      // Check if it's a participant QR code
      if (isParticipantQR(decodedText)) {
        // Handle participant scan
        const response = await scanParticipantQR(decodedText);
        const data = response.data.data;
        
        // Navigate to dashboard with encounter active
        navigate('/dashboard', {
          state: { 
            encounterStarted: true,
            encounter: data.encounter,
            scannedTeam: data.scannedTeam
          }
        });
      } else {
        // Handle checkpoint scan
        const response = await scanQR(decodedText);
        const result = response.data.data;

        if (result.type === 'participant') {
          // Backend detected it's a participant QR - scan via encounters endpoint
          const encounterResponse = await scanParticipantQR(result.qrCode);
          const data = encounterResponse.data.data;
          
          navigate('/dashboard', {
            state: { 
              encounterStarted: true,
              encounter: data.encounter,
              scannedTeam: data.scannedTeam
            }
          });
        } else {
          // Regular checkpoint
          const { checkpoint } = result;
          navigate(`/question/${checkpoint.id}`, {
            state: { checkpoint }
          });
        }
      }
    } catch (err) {
      console.error('Error scanning QR:', err);
      const errorMessage = err.response?.data?.message || 'Código QR inválido';
      setError(errorMessage);

      // Restart scanner after 3 seconds
      setTimeout(() => {
        setError('');
        setMessage('Apunta la cámara al código QR');
        startScanner();
      }, 3000);
    }
  };

  const onScanError = () => {
    // Ignore scan errors (they happen frequently while scanning)
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              stopScanner();
              navigate('/dashboard');
            }}
            className="text-white hover:text-gray-300 flex items-center"
          >
            ← Volver
          </button>
          <h1 className="text-xl font-bold">Escanear QR</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* QR Reader Container */}
          <div className="relative mb-6">
            <div
              id="qr-reader"
              className="rounded-lg overflow-hidden shadow-2xl"
            ></div>
            
            {/* Scanning Frame Overlay */}
            {scanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {message && !error && (
            <div className="bg-blue-500 text-white px-4 py-3 rounded-lg text-center mb-4 animate-pulse">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg text-center mb-4">
              {error}
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-800 text-white p-4 rounded-lg">
            <h3 className="font-bold mb-2">💡 Instrucciones</h3>
            <ul className="text-sm space-y-1 text-gray-300">
              <li>• Centra el código QR en el cuadro</li>
              <li>• Mantén el teléfono estable</li>
              <li>• Asegúrate de tener buena iluminación</li>
              <li>• El escaneo es automático</li>
            </ul>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                📍 <strong>Checkpoint:</strong> Responde una pregunta para ganar puntos
              </p>
              <p className="text-sm text-gray-400 mt-1">
                🤝 <strong>Participante:</strong> Inicia un desafío colaborativo con otro equipo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Input (Optional) */}
      <div className="bg-gray-800 p-4">
        <div className="max-w-md mx-auto text-center">
          <button
            onClick={() => {
              stopScanner();
              navigate('/dashboard');
            }}
            className="text-gray-400 hover:text-white text-sm underline"
          >
            ¿Problemas con la cámara? Volver al dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default Scanner;
