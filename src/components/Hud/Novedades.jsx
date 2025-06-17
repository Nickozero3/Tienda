import React, { useState, useEffect } from "react";
import { getProductos } from "../../api";
import ProductCard from "../ProductCard";
import "./Novedades.css";

const ProductSection = () => {
  const [randomProducts, setRandomProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiResponse = await getProductos();
        
        if (apiResponse.data?.length > 0) {
          // Get the 4 most recent products (reversed to show newest first)
          const recentProducts = [...apiResponse.data].reverse().slice(0, 4);
          setRandomProducts(recentProducts);
        } else {
          throw new Error("No hay productos disponibles");
        }
      } catch (apiError) {
        console.error("Error al cargar productos:", apiError);
        setError("No se pudieron cargar los productos");
        setRandomProducts([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    // Simulate async loading with timeout
    const timer = setTimeout(() => {
      fetchData();
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="product-section">
        <span className="nov">Novedades</span>
        <div className="loading-spinner">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="product-section">
      <span className="nov">Novedades</span>
      {error && (
        <div className="alert alert-info">
          {error}
        </div>
      )}
      <div className="products-container">
        {randomProducts.length > 0 ? (
          randomProducts.map((product) => (
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
          ))
        ) : (
          !error && <p>No hay productos disponibles</p>
        )}
      </div>
    </div>
  );
};

export default ProductSection;