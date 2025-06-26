import { useState, useEffect } from "react";
import Fuse from "fuse.js";
import { getProductos } from "../api";
import ProductCard from "./ProductCard";
import "./Productos.css";
import FiltroCategorias from "./Hud/FiltroCategoria";

const Productos = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtrosActivos, setFiltrosActivos] = useState({
    filtrosSeleccionados: [],
    precioMin: "",
    precioMax: "",
  });
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const productsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiResponse = await getProductos();
        const productos = apiResponse.data || [];

        if (productos.length > 0) {
          const inverted = [...productos].reverse();
          setProducts(inverted);
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

  useEffect(() => {
    if (products.length === 0) {
      setProductosFiltrados([]);
      return;
    }

    const fuseOptions = {
      keys: ["nombre", "descripcion"],
      threshold: 0.3,
    };

    let resultadosBusqueda = products;

    if (searchTerm.trim() !== "") {
      const fuse = new Fuse(products, fuseOptions);
      resultadosBusqueda = fuse.search(searchTerm).map((r) => r.item);

      if (!/\d/.test(searchTerm)) {
        resultadosBusqueda.sort((a, b) => {
          const numA = extraerNumeroModelo(a.nombre);
          const numB = extraerNumeroModelo(b.nombre);

          if (numA !== null && numB !== null) return numB - numA;
          if (numA !== null) return -1;
          if (numB !== null) return 1;
          return 0;
        });
      }
    }

    function extraerNumeroModelo(nombre) {
      const numeros = nombre.match(/\d{1,4}/g);
      if (!numeros) return null;
      const max = Math.max(...numeros.map((n) => parseInt(n)));
      return isNaN(max) ? null : max;
    }

    const productosFiltradosTemp = resultadosBusqueda.filter((product) => {
      const claveCategoria = `${product.categoria}-${product.subcategoria}`;
      const coincideCategoria =
        filtrosActivos.filtrosSeleccionados.length === 0 ||
        filtrosActivos.filtrosSeleccionados.includes(claveCategoria);

      const precio = Number(product.precio || 0);
      const min = filtrosActivos.precioMin ? Number(filtrosActivos.precioMin) : 0;
      const max = filtrosActivos.precioMax ? Number(filtrosActivos.precioMax) : Infinity;
      const coincidePrecio = precio >= min && precio <= max;

      return coincideCategoria && coincidePrecio;
    });

    setProductosFiltrados(productosFiltradosTemp);
    setCurrentPage(1);
  }, [products, searchTerm, filtrosActivos]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = productosFiltrados.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

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

      {/* Header con buscador */}
      <div className="search-header">
        <h1>Nuestros Productos</h1>
        <input
          className="buscador"
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Contenedor principal */}
      <div className="main-container">
        {/* Sidebar de filtros */}
        <aside className="filters-sidebar">
          <FiltroCategorias onFiltroChange={setFiltrosActivos} />
        </aside>

        {/* Contenido de productos */}
        <section className="products-section">
          {productosFiltrados.length === 0 ? (
            <div className="no-results">
              <p>No se encontraron productos.</p>
              {searchTerm && <p>Intenta con otro término de búsqueda.</p>}
            </div>
          ) : (
            <>
              <div className="products-grid">
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

              <div className="pagination-container">
                <div className="pagination">
                  {Array.from(
                    { length: Math.ceil(productosFiltrados.length / productsPerPage) },
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
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default Productos;