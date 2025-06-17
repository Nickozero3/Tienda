import { useState } from "react";
import "../AdminPanel/Subirdatos.css";

const EditarProducto = ({ producto, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    nombre: producto.nombre || "",
    precio: producto.precio || 0,
    descripcion: producto.descripcion || "",
    categoria: producto.categoria || "Celulares",
    subcategoria: producto.subcategoria || "",
    nuevaImagen: null,
    imagenPreview: producto.imagen || "/ages/placeholder.png",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);

  const categorias = {
    Celulares: ["iPhone", "Samsung", "Xiaomi", "Oppo", "Motorola"],
    Cables: ["USB-C", "Lightning", "Micro USB", "HDMI"],
    Accesorios: ["Protectores", "Soportes", "Adaptadores"],
    Fundas: ["iPhone", "Samsung", "Universal"],
    Audífonos: ["Inalámbricos", "Con cable", "Deportivos"],
    Cargadores: ["Inalámbricos", "Rápidos", "Automotriz"],
    Otros: ["Varios"],
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "precio" ? parseFloat(value) || 0 : value,
      ...(name === "categoria" && { subcategoria: "" }),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          nuevaImagen: file,
          imagenPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "Nombre es requerido";
    if (formData.precio <= 0) newErrors.precio = "Precio debe ser positivo";
    if (!formData.categoria.trim())
      newErrors.categoria = "Categoría es requerida";
    if (!formData.subcategoria.trim())
      newErrors.subcategoria = "Subcategoría es requerida";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    console.log("Iniciando envío de formulario");

    if (!validateForm()) {
      console.log("Validación de formulario fallida");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("nombre", formData.nombre);
      formDataToSend.append("precio", formData.precio.toString());
      formDataToSend.append("descripcion", formData.descripcion);
      formDataToSend.append("categoria", formData.categoria);
      formDataToSend.append("subcategoria", formData.subcategoria);

      if (formData.nuevaImagen) {
        console.log("Incluyendo nueva imagen en FormData");
        formDataToSend.append("imagen", formData.nuevaImagen);
      } else {
        console.log("Manteniendo imagen existente");
        formDataToSend.append("imagenUrl", producto.imagen);
      }

      console.log("Enviando datos al servidor...");
      const productoActualizado = await onUpdate(producto.id, formDataToSend);

      console.log("Actualización exitosa:", productoActualizado);
      onClose();
    } catch (error) {
      console.error("Error en onSubmit:", error);
      setError(error.message || "Error al actualizar el producto");
    }
  };


  
  return (
    <div className="modal-overlay">
      <div className="upload-container">
        <button onClick={onClose} className="close-button">
          &times;
        </button>
        <h3 className="form-title">Editar Producto</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={onSubmit} className="upload-form">
          <div className="form-content-wrapper">
            {/* Sección de imagen */}
            <div className="image-section">
              <div className="form-group">
                <label htmlFor="imagen">Imagen del Producto:</label>
                <div className="file-input-container">
                  <label htmlFor="imagen" className="file-label">
                    Cambiar imagen
                  </label>
                  <span className="file-name">
                    {formData.nuevaImagen
                      ? formData.nuevaImagen.name
                      : "Usar imagen actual"}
                  </span>
                  <input
                    type="file"
                    id="imagen"
                    name="imagen"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                {formData.imagenPreview && (
                  <div className="image-preview">
                    <img
                      src={formData.imagenPreview}
                      alt="Vista previa"
                      onError={(e) => {
                        e.target.src = "/Images/placeholder.png"; // Fallback si la imagen no carga071.
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sección de datos */}
            <div className="data-section">
              <div className="form-group">
                <label>Nombre del Producto:</label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={errors.nombre ? "error-input" : ""}
                />
                {errors.nombre && (
                  <span className="error-text">{errors.nombre}</span>
                )}
              </div>

              <div className="form-group">
                <label>Precio ($):</label>
                <input
                  type="number"
                  step="0.01"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  className={errors.precio ? "error-input" : ""}
                />
                {errors.precio && (
                  <span className="error-text">{errors.precio}</span>
                )}
              </div>

              <div className="form-group">
                <label>Descripción:</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Escribe una descripción detallada del producto"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoría:</label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className={errors.categoria ? "error-input" : ""}
                  >
                    {Object.keys(categorias).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.categoria && (
                    <span className="error-text">{errors.categoria}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Subcategoría:</label>
                  <select
                    name="subcategoria"
                    value={formData.subcategoria}
                    onChange={handleChange}
                    className={errors.subcategoria ? "error-input" : ""}
                  >
                    <option value="">Seleccione...</option>
                    {categorias[formData.categoria]?.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                  {errors.subcategoria && (
                    <span className="error-text">{errors.subcategoria}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="form-buttons">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="submit-btn">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditarProducto;
