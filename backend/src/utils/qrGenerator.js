import QRCode from 'qrcode';
import Jimp from 'jimp';

/**
 * Genera un código QR hermoso con información del evento y checkpoint
 * @param {Object} checkpoint - Objeto del checkpoint con toda su información
 * @param {Object} event - Objeto del evento asociado
 * @returns {Promise<Buffer>} - Buffer del PNG generado
 */
export async function generateBeautifulQR(checkpoint, event) {
  try {
    const width = 800;
    const height = 1000;

    // Crear imagen base con gradiente azul
    const image = new Jimp(width, height);
    
    // Simular gradiente vertical
    for (let y = 0; y < height; y++) {
      const ratio = y / height;
      // De #2563eb a #1e40af
      const r = Math.floor(37 - ratio * (37 - 30));
      const g = Math.floor(99 - ratio * (99 - 64));
      const b = Math.floor(235 - ratio * (235 - 175));
      const color = Jimp.rgbaToInt(r, g, b, 255);
      
      for (let x = 0; x < width; x++) {
        image.setPixelColor(color, x, y);
      }
    }

    // Generar código QR como buffer
    const qrBuffer = await QRCode.toBuffer(checkpoint.qr_code, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#1e40af',
        light: '#ffffff'
      }
    });

    // Cargar el QR generado
    const qrImage = await Jimp.read(qrBuffer);
    
    // Crear sección superior blanca con bordes redondeados
    const boxWidth = width - 80;
    const boxHeight = 180;
    const boxX = 40;
    const boxY = 40;
    const whiteColor = 0xffffffff;
    
    // Dibujar rectángulo blanco
    for (let y = boxY; y < boxY + boxHeight; y++) {
      for (let x = boxX; x < boxX + boxWidth; x++) {
        image.setPixelColor(whiteColor, x, y);
      }
    }

    // Crear fondo blanco para el QR
    const qrBgSize = 440;
    const qrBgX = (width - qrBgSize) / 2;
    const qrBgY = 260;
    
    // Dibujar fondo blanco con esquinas redondeadas
    for (let y = qrBgY; y < qrBgY + qrBgSize; y++) {
      for (let x = qrBgX; x < qrBgX + qrBgSize; x++) {
        image.setPixelColor(whiteColor, x, y);
      }
    }

    // Componer el QR sobre el fondo blanco (centrado)
    const qrX = (width - 400) / 2;
    const qrY = 280;
    image.composite(qrImage, qrX, qrY);

    // Badge de puntos (círculo verde)
    const badgeX = width - 100;
    const badgeY = 110;
    const badgeRadius = 35;
    const greenColor = 0x10b981ff;
    
    // Dibujar círculo
    for (let dy = -badgeRadius; dy <= badgeRadius; dy++) {
      for (let dx = -badgeRadius; dx <= badgeRadius; dx++) {
        if (dx * dx + dy * dy <= badgeRadius * badgeRadius) {
          const px = badgeX + dx;
          const py = badgeY + dy;
          if (px >= 0 && px < width && py >= 0 && py < height) {
            image.setPixelColor(greenColor, px, py);
          }
        }
      }
    }

    // Cargar fuentes
    const fontTitle = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const fontSubtitle = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
    const fontWhite = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
    const fontWhiteSmall = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

    // Título del evento (en la caja blanca)
    const eventTitle = (event.name || 'Evento').substring(0, 40);
    image.print(
      fontTitle,
      boxX + 20,
      boxY + 40,
      {
        text: eventTitle,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      boxWidth - 40,
      50
    );

    // Información del checkpoint (en la caja blanca)
    const checkpointInfo = `Checkpoint ${checkpoint.order_num || ''}: ${checkpoint.name}`.substring(0, 50);
    image.print(
      fontSubtitle,
      boxX + 20,
      boxY + 110,
      {
        text: checkpointInfo,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
      },
      boxWidth - 40,
      40
    );

    // Texto de puntos en el badge
    image.print(
      fontWhiteSmall,
      badgeX - 20,
      badgeY - 8,
      {
        text: `${checkpoint.points}`,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      },
      40
    );

    // Instrucciones principales
    image.print(
      fontWhite,
      0,
      720,
      {
        text: 'Escanea para registrar',
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      },
      width
    );

    image.print(
      fontWhiteSmall,
      0,
      760,
      {
        text: 'tu paso por este checkpoint',
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      },
      width
    );

    // Detalles del evento
    let detailY = 820;
    
    if (event.location) {
      const locationText = `Lugar: ${event.location}`.substring(0, 60);
      image.print(
        fontWhiteSmall,
        0,
        detailY,
        {
          text: locationText,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
        },
        width
      );
      detailY += 30;
    }
    
    if (event.date) {
      const eventDate = new Date(event.date);
      const dateStr = eventDate.toLocaleDateString('es-AR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
      image.print(
        fontWhiteSmall,
        0,
        detailY,
        {
          text: `Fecha: ${dateStr}`,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
        },
        width
      );
      detailY += 30;
    }

    // Footer con branding
    image.print(
      fontWhiteSmall,
      0,
      height - 80,
      {
        text: 'CoopQuest - Busqueda del Tesoro Cooperativa',
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      },
      width
    );

    image.print(
      fontWhiteSmall,
      0,
      height - 50,
      {
        text: 'gcoop - Cooperativa de Software Libre',
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
      },
      width
    );

    // Si hay pregunta, añadir indicador
    if (checkpoint.question) {
      image.print(
        fontWhiteSmall,
        0,
        height - 20,
        {
          text: '¡Este checkpoint tiene una pregunta!',
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
        },
        width
      );
    }

    // Convertir a buffer PNG
    return await image.getBufferAsync(Jimp.MIME_PNG);
  } catch (error) {
    console.error('Error generando QR hermoso:', error);
    throw error;
  }
}
