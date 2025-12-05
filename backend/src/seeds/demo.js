import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import QRCode from 'qrcode';
import pool, { query } from '../database/db.js';
import { generateQRCode } from '../utils/helpers.js';
import { generateBeautifulQR } from '../utils/qrGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Demo event data
const DEMO_EVENT = {
  name: 'Punto Coop 2025 - Demo',
  description: 'Evento de demostración con 5 checkpoints para testear CoopQuest',
  date: '2025-11-13T10:00:00',
  location: 'Buenos Aires, Argentina',
  status: 'active'
};

// Demo checkpoints
const DEMO_CHECKPOINTS = [
  {
    name: 'Stand de gcoop',
    description: 'Cooperativa de software libre fundada en 2007',
    question: '¿En qué año se fundó gcoop?',
    answer: '2007',
    points: 100,
    order_num: 1,
    qr_suffix: 'GCOOP'
  },
  {
    name: 'Stand de FACTTIC',
    description: 'Federación Argentina de Cooperativas de Trabajo de Tecnología',
    question: '¿Cuántas cooperativas tecnológicas integran FACTTIC actualmente?',
    answer: '30',
    points: 150,
    order_num: 2,
    qr_suffix: 'FACTTIC'
  },
  {
    name: 'Sala de Charlas Técnicas',
    description: 'Espacio para charlas sobre tecnología y software libre',
    question: '¿Qué significa "open source"?',
    answer: 'código abierto',
    points: 120,
    order_num: 3,
    qr_suffix: 'CHARLAS'
  },
  {
    name: 'Área de Networking',
    description: 'Espacio de encuentro y networking cooperativo',
    question: '¿Cuál es el número del principio cooperativo de educación, capacitación e información?',
    answer: 'quinto',
    points: 100,
    order_num: 4,
    qr_suffix: 'NETWORKING'
  },
  {
    name: 'Demo de IA con Software Libre',
    description: 'Demostración de inteligencia artificial con herramientas open source',
    question: '¿Qué tecnología de IA open source usa gcoop para sus chatbots?',
    answer: 'ollama',
    points: 200,
    order_num: 5,
    qr_suffix: 'IADEMO'
  }
];

// Collaborative challenges for networking
const COLLABORATIVE_CHALLENGES = [
  {
    challenge_type: 'trivia',
    question: '¿Cuál es el primer principio cooperativo? Acuerden la respuesta.',
    answer_hint: 'Tiene que ver con ser parte de la cooperativa',
    requires_exact_match: false,
    points: 50,
    time_limit_seconds: 120
  },
  {
    challenge_type: 'networking',
    question: 'Preséntense y descubran: ¿Qué tecnología usan ambos en sus cooperativas? Escriban una en común.',
    answer_hint: null,
    requires_exact_match: true,
    points: 50,
    time_limit_seconds: 180
  },
  {
    challenge_type: 'creative',
    question: 'Inventen un nombre para una cooperativa que combine lo que hacen ambos equipos.',
    answer_hint: null,
    requires_exact_match: true,
    points: 75,
    time_limit_seconds: 150
  },
  {
    challenge_type: 'math',
    question: 'Sumen la cantidad de integrantes de ambas cooperativas. Escriban el número.',
    answer_hint: null,
    requires_exact_match: true,
    points: 50,
    time_limit_seconds: 90
  },
  {
    challenge_type: 'trivia',
    question: '¿En qué año se fundó la primera cooperativa del mundo (Rochdale)? Acuerden el año.',
    answer_hint: 'Fue en el siglo XIX',
    requires_exact_match: true,
    points: 60,
    time_limit_seconds: 120
  },
  {
    challenge_type: 'networking',
    question: '¿Qué proyecto podrían hacer juntos? Escriban una palabra clave que lo describa.',
    answer_hint: null,
    requires_exact_match: true,
    points: 50,
    time_limit_seconds: 120
  },
  {
    challenge_type: 'trivia',
    question: 'Nombren 3 de los 7 principios cooperativos. Escríbanlos separados por comas.',
    answer_hint: 'Adhesión voluntaria, control democrático, participación económica...',
    requires_exact_match: false,
    points: 60,
    time_limit_seconds: 120
  }
];

async function generateQRCodeImage(checkpoint, event, filename) {
  try {
    // Create demo-qrs directory if it doesn't exist
    const qrDir = join(__dirname, '../../public/demo-qrs');
    await fs.mkdir(qrDir, { recursive: true });
    
    const filepath = join(qrDir, filename);
    
    // Generate beautiful QR code
    const qrBuffer = await generateBeautifulQR(checkpoint, event);
    
    // Save to file
    await fs.writeFile(filepath, qrBuffer);
    
    console.log(`  ✅ Generated QR code: ${filename}`);
    return filepath;
  } catch (error) {
    console.error(`  ❌ Error generating QR code ${filename}:`, error);
    throw error;
  }
}

async function seed() {
  try {
    console.log('\n🌱 Starting demo data seeding...\n');
    
    // Check if demo event already exists
    const existingEvent = await query(
      "SELECT id FROM events WHERE name = $1",
      [DEMO_EVENT.name]
    );
    
    if (existingEvent.rows.length > 0) {
      console.log('⚠️  Demo event already exists. Deleting old data...');
      await query('DELETE FROM events WHERE name = $1', [DEMO_EVENT.name]);
    }
    
    // Create demo event
    console.log('📅 Creating demo event...');
    const eventResult = await query(
      `INSERT INTO events (name, description, date, location, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [DEMO_EVENT.name, DEMO_EVENT.description, DEMO_EVENT.date, DEMO_EVENT.location, DEMO_EVENT.status]
    );
    
    const event = eventResult.rows[0];
    console.log(`  ✅ Event created: ${event.name} (ID: ${event.id})\n`);
    
    // Create checkpoints and generate QR codes
    console.log('📍 Creating checkpoints and generating QR codes...\n');
    
    const checkpoints = [];
    
    for (const cp of DEMO_CHECKPOINTS) {
      // Generate QR code string
      const qrCode = `COOPQUEST-2025-CP${cp.order_num.toString().padStart(3, '0')}-${cp.qr_suffix}`;
      
      // Insert checkpoint
      const cpResult = await query(
        `INSERT INTO checkpoints (event_id, name, description, qr_code, question, answer, points, order_num)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [event.id, cp.name, cp.description, qrCode, cp.question, cp.answer, cp.points, cp.order_num]
      );
      
      const checkpoint = cpResult.rows[0];
      checkpoints.push(checkpoint);
      
      console.log(`  📍 ${cp.name}`);
      console.log(`     QR Code: ${qrCode}`);
      console.log(`     Question: ${cp.question}`);
      console.log(`     Answer: ${cp.answer}`);
      console.log(`     Points: ${cp.points}`);
      
      // Generate QR code image
      const filename = `checkpoint-${cp.order_num}-${cp.qr_suffix.toLowerCase()}.png`;
      await generateQRCodeImage(checkpoint, event, filename);
      console.log('');
    }
    
    // Create README for QR codes
    const readmeContent = `# CoopQuest - Demo QR Codes

Estos son los códigos QR de prueba para el evento demo "Punto Coop 2025 - Demo".

## Códigos QR Generados:

${DEMO_CHECKPOINTS.map((cp, idx) => `
### ${idx + 1}. ${cp.name}
- **Archivo**: checkpoint-${cp.order_num}-${cp.qr_suffix.toLowerCase()}.png
- **Código**: COOPQUEST-2025-CP${cp.order_num.toString().padStart(3, '0')}-${cp.qr_suffix}
- **Pregunta**: ${cp.question}
- **Respuesta**: ${cp.answer}
- **Puntos**: ${cp.points}
`).join('\n')}

## Cómo usar:

1. Imprime estos códigos QR
2. Colócalos en diferentes lugares de tu evento de prueba
3. Los participantes pueden escanearlos con la app CoopQuest
4. Al escanear, verán la pregunta y podrán responder

## Respuestas rápidas para testing:

${DEMO_CHECKPOINTS.map((cp, idx) => `${idx + 1}. ${cp.name}: **${cp.answer}**`).join('\n')}

## Información del Evento Demo:

- **Nombre**: ${DEMO_EVENT.name}
- **Fecha**: 13 de noviembre de 2025
- **Estado**: Activo (listo para jugar)
`;
    
    const readmePath = join(__dirname, '../../public/demo-qrs/README.md');
    await fs.writeFile(readmePath, readmeContent);
    console.log('  ✅ Created README.md in demo-qrs directory\n');
    
    // Create collaborative challenges
    console.log('🤝 Creating collaborative challenges for networking...\n');
    
    const challenges = [];
    for (const ch of COLLABORATIVE_CHALLENGES) {
      const chResult = await query(
        `INSERT INTO collaborative_challenges 
         (event_id, challenge_type, question, answer_hint, requires_exact_match, points, time_limit_seconds)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [event.id, ch.challenge_type, ch.question, ch.answer_hint, ch.requires_exact_match, ch.points, ch.time_limit_seconds]
      );
      
      const challenge = chResult.rows[0];
      challenges.push(challenge);
      
      console.log(`  🤝 ${ch.challenge_type.toUpperCase()}: ${ch.question.substring(0, 50)}...`);
    }
    console.log('');
    
    // Print summary
    console.log('╔═══════════════════════════════════════════════════════╗');
    console.log('║                                                       ║');
    console.log('║   ✅ Demo data seeded successfully!                  ║');
    console.log('║                                                       ║');
    console.log('╚═══════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📊 Summary:`);
    console.log(`   - Event: ${event.name}`);
    console.log(`   - Event ID: ${event.id}`);
    console.log(`   - Checkpoints: ${checkpoints.length}`);
    console.log(`   - Collaborative Challenges: ${challenges.length}`);
    console.log(`   - QR Codes generated: ${checkpoints.length}`);
    console.log('');
    console.log('📁 QR codes location: backend/public/demo-qrs/');
    console.log('');
    console.log('🎮 Next steps:');
    console.log('   1. Start the backend: npm run dev');
    console.log('   2. Start the frontend: cd ../frontend && npm run dev');
    console.log('   3. Register a team with the demo event');
    console.log('   4. Scan the QR codes from backend/public/demo-qrs/');
    console.log('   5. Try the collaborative networking feature!');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding demo data:', error);
    process.exit(1);
  }
}

// Run seed
seed();
