import pool from '../config/database.js';

/**
 * Obtener todos los usuarios
 */
const getAllUsuarios = async (req, res) => {
  try {
    console.log('Intentando obtener usuarios...');
    const [rows] = await pool.query('SELECT id, nombre, email, role FROM usuarios');
    console.log('Usuarios encontrados:', rows);
    res.json({ data: rows });
  } catch (error) {
    console.error('Error detallado al obtener usuarios:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuarios',
      message: error.message,
      code: error.code
    });
  }
};

/**
 * Obtener un usuario por ID
 */
const getUsuarioById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Buscando usuario con ID:', id);
    const [rows] = await pool.query('SELECT id, nombre, email, role FROM usuarios WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ data: rows[0] });
  } catch (error) {
    console.error('Error detallado al obtener usuario:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuario',
      message: error.message,
      code: error.code
    });
  }
};

/**
 * Crear un nuevo usuario
 */
const createUsuario = async (req, res) => {
  try {
    const { nombre, email, password, role } = req.body;
    console.log('Intentando crear usuario con datos:', { nombre, email, role });
    
    // Validar datos requeridos
    if (!nombre || !email || !password || !role) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    // Verificar si el email ya existe
    const [existingUser] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Crear usuario
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, role) VALUES (?, ?, ?, ?)',
      [nombre, email, password, role]
    );
    
    res.status(201).json({ 
      message: 'Usuario creado correctamente',
      id: result.insertId 
    });
  } catch (error) {
    console.error('Error detallado al crear usuario:', error);
    res.status(500).json({ 
      error: 'Error al crear usuario',
      message: error.message,
      code: error.code
    });
  }
};

export default {
  getAllUsuarios,
  getUsuarioById,
  createUsuario
}; 