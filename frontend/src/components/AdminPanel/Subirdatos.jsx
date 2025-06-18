import React, { useState } from 'react';
import './Subirdatos.css';

const url = process.env.REACT_APP_API_BASE_URL;


const SubirDatos = ({ onClose, onSuccess }) => {
  const [producto, setProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria: 'Celulares',
    subcategoria: '',
    imagen: null,
    imagenPreview: null
  });

  const categorias = {
    Celulares: ['iPhone', 'Samsung', 'Xiaomi', 'Oppo', 'Motorola'],
    Cables: ['USB-C', 'Lightning', 'Micro USB', 'HDMI'],
    Accesorios: ['Protectores', 'Soportes', 'Adaptadores'],
    Fundas: ['iPhone', 'Samsung', 'Universal'],
    'Audífonos': ['Inalámbricos', 'Con cable', 'Deportivos'],
    Cargadores: ['Inalámbricos', 'Rápidos', 'Automotriz'],
    Otros: ['Varios']
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProducto(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'categoria' && { subcategoria: '' })
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProducto(prev => ({
          ...prev,
          imagen: file,
          imagenPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!producto.nombre || !producto.descripcion || !producto.precio || !producto.imagen || !producto.subcategoria) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nombre', producto.nombre);
      formData.append('descripcion', producto.descripcion);
      formData.append('precio', producto.precio);
      formData.append('categoria', producto.categoria);
      formData.append('subcategoria', producto.subcategoria);
      formData.append('imagen', producto.imagen, producto.imagen.name);

      const response = await fetch(`${url}/api/productos`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la respuesta del servidor');
      }

      alert('Producto subido correctamente!');
      if (onSuccess) onSuccess(data);
      
      setProducto({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: 'Celulares',
        subcategoria: '',
        imagen: null,
        imagenPreview: null
      });

    } catch (error) {
      console.error('Error al subir producto:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="upload-container">
        <button className="close-button" onClick={onClose}>
          &times;
        </button>
        
        <form className="upload-form" onSubmit={handleSubmit}>
          <div className="form-content-wrapper">
            {/* Sección de imagen (izquierda en desktop, abajo en móvil) */}
            <div className="image-section">
              <div className="form-group">
                <label htmlFor="imagen">Imagen del Producto:</label>
                <div className="file-input-container">
                  <label htmlFor="imagen" className="file-label">
                    Seleccionar archivo
                  </label>
                  <span className="file-name">
                    {producto.imagen ? producto.imagen.name : 'Ningún archivo seleccionado'}
                  </span>
                  <input
                    type="file"
                    id="imagen"
                    name="imagen"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                  />
                </div>
                {producto.imagenPreview && (
                  <div className="image-preview">
                    <img src={producto.imagenPreview} alt="Vista previa" />
                  </div>
                )}
              </div>
            </div>

            {/* Sección de datos (centro en desktop, arriba en móvil) */}
            <div className="data-section">
              <div className="form-group">
                <label htmlFor="nombre">Nombre del Producto:</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={producto.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción: </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  placeholder='Escribe una descripción detallada del producto (Maximo 256 caracteres)'
                  value={producto.descripcion}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="precio">Precio ($):</label>
                <input
                  type="number"
                  id="precio"
                  name="precio"
                  value={producto.precio}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoria">Categoría:</label>
                  <select
                    id="categoria"
                    name="categoria"
                    value={producto.categoria}
                    onChange={handleChange}
                    required
                  >
                    {Object.keys(categorias).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="subcategoria">Subcategoría:</label>
                  <select
                    id="subcategoria"
                    name="subcategoria"
                    value={producto.subcategoria}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione...</option>
                    {categorias[producto.categoria]?.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Botones (abajo en todos los dispositivos) */}
          <div className="form-buttons">
              <button 
              type="button" 
              className="cancel-btn"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button type="submit" className="submit-btn">Subir Producto</button>
          
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubirDatos;