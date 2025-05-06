import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import sensorRoutes from './routes/sensorRoutes.js';
import insumoRoutes from './routes/insumoRoutes.js';
import cultivoRoutes from './routes/cultivoRoutes.js';
import cicloCultivoRoutes from './routes/cicloCultivoRoutes.js';
import produccionRoutes from './routes/produccionRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import db from './config/database.js';
import fs from 'fs';

// Load environment variables
dotenv.config();

console.log('Usuario de BD:', process.env.DB_USER);
console.log('Contraseña de BD:', process.env.DB_PASSWORD);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const sensorUploadsDir = path.join(uploadsDir, 'sensors');
const cultivoUploadsDir = path.join(uploadsDir, 'cultivos');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(sensorUploadsDir)) {
  fs.mkdirSync(sensorUploadsDir, { recursive: true });
}
if (!fs.existsSync(cultivoUploadsDir)) {
  fs.mkdirSync(cultivoUploadsDir, { recursive: true });
}

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the frontend
app.use(express.static(path.join(__dirname, '../public')));

// Test DB Connection
db.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection error:', err.message);
  });

// API Routes
app.use('/api/sensores', sensorRoutes);
app.use('/api/insumos', insumoRoutes);
app.use('/api/cultivos', cultivoRoutes);
app.use('/api/ciclos-cultivo', cicloCultivoRoutes);
app.use('/api/producciones', produccionRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Root route
app.get('/api', (req, res) => {
  res.send('Agricultural Management System API');
});

// Catch-all route to serve the frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  console.log(err.stack);
  process.exit(1);
});