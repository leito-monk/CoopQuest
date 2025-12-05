import { useState, useEffect } from 'react';

function PersonalQRCode({ personalQRCode, teamName }) {
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (personalQRCode) {
      generateQRCode();
    }
  }, [personalQRCode]);

  const generateQRCode = async () => {
    try {
      // Use a QR code generation service or library
      // For now, we'll use a simple API approach
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(personalQRCode)}&bgcolor=ffffff&color=2563eb`;
      setQrDataUrl(qrUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!personalQRCode) {
    return null;
  }

  return (
    <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-primary/20">
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-800 mb-2">
          🎫 Tu QR Personal
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Muestra este código para que otros equipos te escaneen
        </p>
        
        <div className="bg-white p-4 rounded-lg inline-block shadow-md mb-4">
          {loading ? (
            <div className="w-[200px] h-[200px] flex items-center justify-center">
              <div className="spinner text-primary"></div>
            </div>
          ) : (
            <img 
              src={qrDataUrl} 
              alt={`QR de ${teamName}`}
              className="w-[200px] h-[200px]"
            />
          )}
        </div>
        
        <p className="text-xs text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded inline-block">
          {personalQRCode}
        </p>
        
        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            💡 <strong>Tip:</strong> Cuando otro equipo escanea tu QR, ¡ambos deben resolver un desafío juntos para ganar puntos!
          </p>
        </div>
      </div>
    </div>
  );
}

export default PersonalQRCode;
