import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProducto } from "../../api";
import SubirDatos from "./Subirdatos";
import ModalEditarProducto from "../Hud/EditarProducto";
import { FaPlus } from "react-icons/fa";
import "./ListaProductos.css";

const url = process.env.REACT_APP_API_BASE_URL; // URL base del backend desde archivo .env

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

  // Obtener productos desde la API al cargar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch(`${url}/api/productos`);
        const data = await response.json();
        const invertidos = data.reverse()
        setProductos((invertidos));
        setFilteredProductos(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    };
    fetchProductos();
  }, []);

  // Bloquea el scroll cuando hay un modal abierto
  useEffect(() => {
    document.body.style.overflow = showModal || showEditModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal, showEditModal]);

  // Eliminar un producto desde la API y actualizar el estado
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

  // Modificar producto en el backend y actualizar el estado local
  const modificarProducto = async (id, formData) => {
    try {
      const response = await fetch(`${url}/api/productos/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}`);
      }

      const result = await response.json();
      if (!result.success || !result.producto) {
        throw new Error(result.error || "Producto no actualizado");
      }

      setProductos((prev) =>
        prev.map((p) => (p.id === result.producto.id ? result.producto : p))
      );
      setFilteredProductos((prev) =>
        prev.map((p) => (p.id === result.producto.id ? result.producto : p))
      );

      return result.producto;
    } catch (error) {
      console.error("Error en modificarProducto:", error);
      throw error;
    }
  };

  // Cuando se clickea el botón de editar, abre el modal con el producto seleccionado
  const handleEditClick = (id) => {
    const producto = productos.find((p) => p.id === Number(id));
    if (!producto) {
      alert("No se encontró el producto.");
      return;
    }
    setSelectedProduct(producto);
    setShowEditModal(true);
  };

  // Filtro y sugerencias al buscar productos
  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setSuggestions([]);
      setFilteredProductos(productos);
      return;
    }

    const term = searchTerm.toLowerCase();

    const filtered = productos.filter((p) => {
      const nombreMatch = p.nombre?.toLowerCase().includes(term);
      const idMatch = p.id?.toString().includes(term);
      return nombreMatch || idMatch;
    });

    setSuggestions(filtered.slice(0, 5));
    setFilteredProductos(filtered);
  }, [searchTerm, productos]);

  // Buscar producto y redirigir con el término
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/productos?busqueda=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Al hacer clic en una sugerencia
  const handleSuggestionClick = (product) => {
    setSearchTerm(product.nombre);
    setSuggestions([]);
    setFilteredProductos(
      productos.filter((p) =>
        p.nombre?.toLowerCase().includes(product.nombre.toLowerCase())
      )
    );
  };

  // Agregar nuevo producto al listado
  const handleProductAdded = (newProduct) => {
    setProductos((prev) => [...prev, newProduct]);
    setFilteredProductos((prev) => [...prev, newProduct]);
    setShowModal(false);
  };

  if (cargando) return <div className="loading-message">Cargando...</div>;

  return (
    <div className="listar-productos-container">
      <h2 className="productos-title">Listado de Productos</h2>

      {/* Buscador de productos */}
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

        {/* Botón para añadir productos */}
        <div className="add-button-container">
          <button onClick={() => setShowModal(true)} className="add-button">
            <FaPlus className="plus-icon" />
            Añadir Producto
          </button>
        </div>

        {/* Lista de sugerencias */}
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

      {/* Modal para crear producto */}
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

      {/* Modal para editar producto */}
      {showEditModal && selectedProduct && (
        <ModalEditarProducto
          producto={selectedProduct}
          onClose={() => setShowEditModal(false)}
          onUpdate={modificarProducto}
        />
      )}

      {/* Tabla de productos */}
      <table className="productos-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Imagen</th>
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
                  <img
                    src={`${url}${producto.imagen}`}
                    alt={producto.nombre || "Producto sin nombre"}
                    className="FotoTabla"
                  />
                </td>
                <td>
                  <a href={`/seleccionado/${producto.id}-${producto.nombre}`}>
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
              <td colSpan="5" className="no-products">
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
