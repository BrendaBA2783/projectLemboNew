import express from 'express';
import UsuarioController from '../controllers/usuarioController.js';

const router = express.Router();

// Rutas para usuarios
router.get('/', UsuarioController.getAllUsuarios);
router.get('/:id', UsuarioController.getUsuarioById);
router.post('/', UsuarioController.createUsuario);

export default router; 