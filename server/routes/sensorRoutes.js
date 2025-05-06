import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { 
  createSensor, 
  getAllSensors, 
  getSensorById, 
  updateSensor, 
  toggleSensorStatus,
  saveSensorReading,
  getSensorReadings
} from '../controllers/sensorController.js';

const router = express.Router();

// Set up multer for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads/sensors');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'sensor-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Routes
router.post('/', upload.single('imagen'), createSensor);
router.get('/', getAllSensors);
router.get('/:id', getSensorById);
router.put('/:id', upload.single('imagen'), updateSensor);
router.patch('/:id/estado', toggleSensorStatus);
router.post('/lecturas', saveSensorReading);
router.get('/:id/lecturas', getSensorReadings);

export default router;