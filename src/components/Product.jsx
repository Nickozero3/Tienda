import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProductos } from "../api";
import ProductCard from "./ProductCard";
import "./Product.css";

const Productos = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  const searchTerm = searchParams.get('busqueda') || '';

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
        setProducts([]); // Set empty array instead of mock data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar productos según término de búsqueda
  const filteredProducts = searchTerm
    ? products.filter(product =>
        String(product.nombre || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : products;
  
  // Calcular productos para la página actual
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

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
      {error && (
        <div className="alert alert-info">
          {error}
        </div>
      )}
      
      <h1>
        {searchTerm ? `Resultados para: "${searchTerm}"` : 'Nuestros Productos'}
      </h1>
      
      {filteredProducts.length === 0 ? (
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
                  image: product.imagen,
                  description: product.descripcion
                }}
              />
            ))}
          </div>

          {/* Componente de paginación */}
          <div className="pagination">
            {Array.from({ length: Math.ceil(filteredProducts.length / productsPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={currentPage === i + 1 ? "active" : ""}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="page-info">
            Mostrando {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} de {filteredProducts.length} productos
          </div>
        </>
      )}
    </main>
  );
};

export default Productos;