CREATE TABLE IF NOT EXISTS producciones (
  id_produccion VARCHAR(20) PRIMARY KEY,
  id_ciclo_cultivo VARCHAR(20) NOT NULL,
  fecha_produccion DATETIME NOT NULL,
  cantidad DECIMAL(10,2) NOT NULL,
  unidad VARCHAR(20) NOT NULL,
  descripcion TEXT,
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_ciclo_cultivo) REFERENCES ciclos_cultivo(id_ciclo) ON DELETE CASCADE
); 