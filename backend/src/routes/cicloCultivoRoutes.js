const express = require('express');
const router = express.Router();
const cicloCultivoController = require('../controllers/cicloCultivoController');

// Rutas básicas CRUD
router.get('/', cicloCultivoController.getAllCiclos);
router.get('/:id', cicloCultivoController.getCicloById);
router.post('/', cicloCultivoController.createCiclo);
router.put('/:id', cicloCultivoController.updateCiclo);
router.delete('/:id', cicloCultivoController.deleteCiclo);

// Rutas adicionales
router.get('/estado/:estado', cicloCultivoController.getCiclosByEstado);
router.post('/:id/insumos', cicloCultivoController.addInsumo);
router.post('/:id/sensores', cicloCultivoController.addSensor);

module.exports = router; 