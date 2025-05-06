import express from 'express';
import {
  createCicloCultivo,
  getAllCiclosCultivo,
  getCicloCultivoById,
  updateCicloCultivo,
  toggleCicloCultivoStatus,
  getCiclosByCrop
} from '../controllers/cicloCultivoController.js';

const router = express.Router();

// Routes
router.post('/', createCicloCultivo);
router.get('/', getAllCiclosCultivo);
router.get('/:id', getCicloCultivoById);
router.put('/:id', updateCicloCultivo);
router.patch('/:id/estado', toggleCicloCultivoStatus);
router.get('/cultivo/:cropId', getCiclosByCrop);

export default router;