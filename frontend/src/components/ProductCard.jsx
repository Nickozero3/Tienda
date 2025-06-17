import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import "./ProductCard.css";
import { useCart } from '../components/Carrito/CartContext';

const ProductCard = memo(({ product }) => {
  const [added, setAdded] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);

  const url = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (!product.image) {
      setImageError(true);
      return;
    }
    setImageError(false);
  }, [product.image, url]);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = (e) => {
    if (!e.target.closest(".product-actions")) {
      navigate(`/seleccionado/${product.id}`);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      {console.log(`${url}${product.image}`)}
      <div className="product-image-container">
        {!imageError ? (
          <img
            src={`${url}${product.image}`}
            alt={product.name || `Product ${product.id}`}
            className="product-image"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder">
            <span>Imagen no disponible</span>
          </div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-price">${product.price?.toLocaleString()}</p>
      </div>

      <div className="product-actions">
        <button
          className={`product-button add-to-cart ${added ? "added" : ""}`}
          onClick={handleAddToCart}
          aria-label={added ? "Producto añadido" : "Añadir al carrito"}
        >
          {added ? "✓ Añadido" : "Añadir al carrito"}
        </button>
      </div>
    </div>
  );
});

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    price: PropTypes.number,
    image: PropTypes.string,
  }).isRequired,
};

export default ProductCard;