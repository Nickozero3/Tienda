import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProducto } from "../../api";
import SubirDatos from "./Subirdatos";
import ModalEditarProducto from "../Hud/EditarProducto";
import { FaPlus } from "react-icons/fa";
import "./ListaProductos.css";


const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://mohareact-production.up.railway.app'
  : 'http://localhost:5000';

const ListarProductos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Obtener productos iniciales
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/productos`);
        const data = await response.json();
        setProductos(data);
        setFilteredProductos(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchProductos();
  }, []);

  useEffect(() => {
    if (showModal || showEditModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal, showEditModal]);

  // Eliminar producto
  const eliminarProducto = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

    try {
      await deleteProducto(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
      setFilteredProductos((prev) => prev.filter((p) => p.id !== id));
      alert("Producto eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar el producto");
    }
  };

  // Modificar producto (PUT)// Función modificarProducto actualizada
  const modificarProducto = async (id, formData) => {
    console.log(`Iniciando modificación para producto ID: ${id}`);

    try {
      // Verificar contenido de FormData
      console.log("Contenido de FormData:");
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch(
        `http://localhost:5000/api/productos/${id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      console.log("Respuesta recibida, status:", response.status);

      // Manejar casos donde la respuesta no es JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error del servidor:", errorText);
        throw new Error(errorText || `Error ${response.status}`);
      }

      const result = await response.json();
      console.log("Respuesta JSON:", result);

      // Validación estricta de la respuesta
      if (!result.success || !result.producto) {
        console.error("Respuesta inválida:", result);
        throw new Error(
          result.error || "La respuesta no contiene el producto actualizado"
        );
      }

      console.log("Producto actualizado recibido:", result.producto);

      // Actualizar estado
      setProductos((prev) =>
        prev.map((p) => (p.id === result.producto.id ? result.producto : p))
      );
      setFilteredProductos((prev) =>
        prev.map((p) => (p.id === result.producto.id ? result.producto : p))
      );

      return result.producto;
    } catch (error) {
      console.error("Error en modificarProducto:", {
        message: error.message,
        stack: error.stack,
      });
      throw error;
    }
  };

  // Manejar clic en editar
  const handleEditClick = (id) => {
    const producto = productos.find((p) => p.id === Number(id));
    console.log("handleEditClick - producto encontrado:", producto);
    if (!producto) {
      alert("No se encontró el producto.");
      return;
    }
    setSelectedProduct(producto);
    setShowEditModal(true);
    // console.log("showEditModal seteado a true");
  };

  // Sugerencias y filtro de productos
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setSuggestions([]);
      setFilteredProductos(productos);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) || p.id.toString().includes(term)
    );

    setSuggestions(filtered.slice(0, 5));
    setFilteredProductos(filtered);
  }, [searchTerm, productos]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?busqueda=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleSuggestionClick = (product) => {
    setSearchTerm(product.nombre);
    setSuggestions([]);
    setFilteredProductos(
      productos.filter((p) =>
        p.nombre.toLowerCase().includes(product.nombre.toLowerCase())
      )
    );
  };

  const handleProductAdded = (newProduct) => {
    setProductos((prev) => [...prev, newProduct]);
    setFilteredProductos((prev) => [...prev, newProduct]);
    setShowModal(false);
  };

  if (cargando) return <div className="loading-message">Cargando...</div>;

  return (
    <div className="listar-productos-container">
      <h2 className="productos-title">Listado de Productos</h2>

      {/* Barra de búsqueda */}
      <div className="buscador-container">
        <form onSubmit={handleSearch} className="buscador-form">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar productos..."
            className="buscador-input"
          />
          <button type="submit" className="buscador-button">
            Buscar
          </button>
        </form>

        {/* Botón añadir producto */}
        <div className="add-button-container">
          <button onClick={() => setShowModal(true)} className="add-button">
            <FaPlus className="plus-icon" />
            Añadir Producto
          </button>
        </div>

        {/* Sugerencias */}
        {suggestions.length > 0 && (
          <ul className="sugerencias-lista">
            {suggestions.map((product) => (
              <li
                key={product.id}
                onClick={() => handleSuggestionClick(product)}
                className="sugerencia-item"
              >
                {product.nombre}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal añadir producto */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setShowModal(false)}
              className="close-modal-button"
            >
              ×
            </button>
            <SubirDatos
              onClose={() => setShowModal(false)}
              onSuccess={handleProductAdded}
            />
          </div>
        </div>
      )}

      {/* Modal editar producto */}
      {showEditModal && selectedProduct && (
        <ModalEditarProducto
          producto={selectedProduct}
          onClose={() => setShowEditModal(false)}
          onUpdate={modificarProducto}
        />
      )}

      {/* Tabla productos */}
      <table className="productos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProductos.length > 0 ? (
            filteredProductos.map((producto) => (
              <tr key={producto.id}>
                <td>{producto.id}</td>
                <td>
                  <a
                    href={`/seleccionado/${producto.id}-${producto.nombre}`}
                  >
                    {producto.nombre}
                  </a>
                </td>
                <td>${producto.precio}</td>
                <td>
                  <button
                    onClick={() => handleEditClick(producto.id)}
                    className="action-button edit-button"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminarProducto(producto.id)}
                    className="action-button delete-button"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="no-products">
                {searchTerm
                  ? "No se encontraron productos"
                  : "No hay productos registrados"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListarProductos;
