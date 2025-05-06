const express = require('express');
const router = express.Router();

// Importar rutas de cada módulo
const sensorRoutes = require('./sensorRoutes');
const cultivoRoutes = require('./cultivoRoutes');
const insumoRoutes = require('./insumoRoutes');
const cicloCultivoRoutes = require('./cicloCultivoRoutes');

// Registrar rutas
router.use('/api/sensores', sensorRoutes);
router.use('/api/cultivos', cultivoRoutes);
router.use('/api/insumos', insumoRoutes);
router.use('/api/ciclos', cicloCultivoRoutes);

module.exports = router; 