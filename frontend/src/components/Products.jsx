import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProductos } from "../api";
import ProductCard from "./ProductCard";
import "./Products.css";
import FiltroCategorias from "./Hud/FiltroCategoria";

const Productos = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtrosActivos, setFiltrosActivos] = useState({
    filtrosSeleccionados: [],
    precioMin: "",
    precioMax: "",
  });

  const productsPerPage = 10;
  const searchTerm = searchParams.get("busqueda") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiResponse = await getProductos();

        if (apiResponse.data?.length > 0) {
          setProducts(apiResponse.data);
        } else {
          throw new Error("No se encontraron productos disponibles");
        }
      } catch (apiError) {
        console.error("Error al obtener productos:", apiError);
        setError(`Error de conexión: ${apiError.message}`);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros
  const productosFiltrados = products.filter((product) => {
    const nombre = String(product.nombre || "").toLowerCase();
    const coincideBusqueda =
      searchTerm === "" || nombre.includes(searchTerm.toLowerCase());

    const claveCategoria = `${product.categoria}-${product.subcategoria}`;
    const coincideCategoria =
      filtrosActivos.filtrosSeleccionados.length === 0 ||
      filtrosActivos.filtrosSeleccionados.includes(claveCategoria);

    const precio = Number(product.precio || 0);
    const min = filtrosActivos.precioMin ? Number(filtrosActivos.precioMin) : 0;
    const max = filtrosActivos.precioMax
      ? Number(filtrosActivos.precioMax)
      : Infinity;
    const coincidePrecio = precio >= min && precio <= max;

    return coincideBusqueda && coincideCategoria && coincidePrecio;
  });

  // Calcular productos para la página actual
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = productosFiltrados.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Cambiar página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <main className="product-page">
      {error && <div className="alert alert-info">{error}</div>}

      <h1>
        {searchTerm ? `Resultados para: "${searchTerm}"` : "Nuestros Productos"}
      </h1>

      <div className="product-layout">
        <div className="filters-sidebar">
          <FiltroCategorias onFiltroChange={setFiltrosActivos} />
        </div>

        <div className="products-content">
          {productosFiltrados.length === 0 ? (
            <div className="no-results">
              <p>No se encontraron productos.</p>
              {searchTerm && <p>Intenta con otro término de búsqueda.</p>}
            </div>
          ) : (
            <>
              <div className="products-container">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.nombre,
                      price: product.precio,
                      image: `${product.imagen}`,
                      description: product.descripcion,
                    }}
                  />
                ))}
              </div>

              {/* Paginación */}
              <div className="pagination">
                {Array.from(
                  {
                    length: Math.ceil(
                      productosFiltrados.length / productsPerPage
                    ),
                  },
                  (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={currentPage === i + 1 ? "active" : ""}
                    >
                      {i + 1}
                    </button>
                  )
                )}
              </div>

              <div className="page-info">
                Mostrando {indexOfFirstProduct + 1}-
                {Math.min(indexOfLastProduct, productosFiltrados.length)} de{" "}
                {productosFiltrados.length} productos
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Productos;
