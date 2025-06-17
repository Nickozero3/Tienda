import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProductCard.css";
import { useCart } from '../components/Carrito/CartContext'; // Ajusta la ruta según tu estructura


const ProductCard = ({ product}) => {
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();
   const { addToCart } = useCart(); // Destructuración correcta

  const isFromAPI = product.image?.includes("/uploads/");
  const initialSrc = isFromAPI
    ? `${process.env.PUBLIC_URL}${product.image}`
    : `${process.env.PUBLIC_URL}/images/${product.image}`;

  const [imageSrc, setImageSrc] = useState(initialSrc);
  const [fallbackTried, setFallbackTried] = useState(false);

  useEffect(() => {
    const isFromAPI = product.image?.includes("/uploads/");
    const calculatedSrc = isFromAPI
      ? `${process.env.PUBLIC_URL}${product.image}`
      : `${process.env.PUBLIC_URL}/images/${product.image}`;

    setFallbackTried(false);
    setImageSrc(calculatedSrc);
  }, [product]);

  const handleImageError = () => {
    if (!fallbackTried && !isFromAPI) {
      setImageSrc(`${process.env.PUBLIC_URL}/images/${product.image}`);
      setFallbackTried(true);
    } else {
      setImageSrc(`${process.env.PUBLIC_URL}/images/placeholder.png`);
    }
  };

  const handleCardClick = (e) => {
    // Evitar la navegación si el click proviene del botón
    if (!e.target.closest(".product-actions")) {
      navigate(`/seleccionado/${product.id}`);
    }
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image-container">
        {product.image ? (
          <img
            src={imageSrc}
            alt={product.name || `Imagen de ${product.id}`}
            className="product-image"
            onError={handleImageError}
          />
        ) : (
          <div className="image-placeholder">
            <span>Imagen no disponible</span>
          </div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-price">${product.price}</p>
      </div>

      <div className="product-actions">
        <button
          className={`product-button add-to-cart ${added ? "added" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
            setAdded(true);
            setTimeout(() => setAdded(false), 1000);
          }}
        >
          {added ? "✓ Añadido" : "Añadir al carrito"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
