import express from 'express';
import ProduccionController from '../controllers/produccionController.js';

const router = express.Router();

// Rutas para producciones
router.post('/', ProduccionController.create);
router.get('/', ProduccionController.getAll);
router.get('/rango', ProduccionController.getByDateRange);
router.get('/:id', ProduccionController.getById);
router.put('/:id', ProduccionController.update);
router.delete('/:id', ProduccionController.delete);
router.get('/ciclo/:cicloId', ProduccionController.getByCicloId);
router.patch('/:id/estado', ProduccionController.updateStatus);

export default router;