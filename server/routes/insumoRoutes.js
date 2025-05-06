import express from 'express';
import {
  createInsumo,
  getAllInsumos,
  getInsumoById,
  updateInsumo,
  deleteInsumo,
  toggleInsumoStatus,
  getInsumosByCycle
} from '../controllers/insumoController.js';

const router = express.Router();

// Routes
router.post('/', createInsumo);
router.get('/', getAllInsumos);
router.get('/:id', getInsumoById);
router.put('/:id', updateInsumo);
router.delete('/:id', deleteInsumo);
router.patch('/:id/status', toggleInsumoStatus);
router.get('/ciclo/:cycleId', getInsumosByCycle);

export default router;