import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductoById } from '../api';
import './seleccionado.css'; // Asegúrate de tener estilos adecuados
const url = process.env.REACT_APP_API_BASE_URL


const Seleccionado = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        const response = await getProductoById(id);
        setProducto(response.data);
      } catch (error) {
        console.error("Error:", error);
        navigate('/productos'); // Redirige si hay error
      } finally {
        setLoading(false);
      }
    };

    fetchProducto();
  }, [id, navigate]);

  if (loading) return <div className="loading">Cargando producto...</div>;
  if (!producto) return <div className="error">Producto no encontrado</div>;

  return (
    <div className="producto-detalle">
      <button onClick={() => navigate(-1)} className="back-button">
        &larr; Volver
      </button>
      
      <div className="producto-content">
        <div className="producto-imagen-container">
          <img 
            src={`${url}${producto.imagen}`} 
            alt={producto.nombre || 'Imagen del producto'}
            onError={(e) => {
              e.target.src = `${process.env.PUBLIC_URL}/images/placeholder.png`;
              e.target.alt = 'Imagen no disponible';
            }}
          />
        </div>
        
        <div className="producto-info">
          <h1>{producto.nombre}</h1>
          
          <div className="producto-meta">
            <span className="producto-precio">
              ${producto.precio.toFixed(2)}
            </span>
            {producto.categoria && (
              <span className="producto-categoria">{producto.categoria}</span>
            )}
          </div>
          
          <p className="producto-descripcion">
            {producto.descripcion}
          </p>
          
          <div className="producto-acciones">
            <button className="btn-primario">
              Añadir al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Seleccionado;