import { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import "./ProductCard.css";
import { useCart } from '../components/Carrito/CartContext';

const ProductCard = memo(({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
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
      <span className="label-oferta">OFERTAS</span>

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
          <div className="product-image">
            <img src="/images/placeholder.png" alt="Imagen no disponible" />
          </div>
        )}
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="label-disponible">DISPONIBLE</p>

        {product.specs && <p className="product-specs">{product.specs}</p>}
        
        <div className="product-pricing">
          {product.originalPrice && (
            <span className="original-price">{product.originalPrice}</span>
          )}
          <span className="current-price">${product.price?.toLocaleString()}</span>
          {product.discount && (
            <span className="discount-badge">{product.discount} OFF</span>
          )}
        </div>

        {product.installment && (
          <p className="installment">{product.installment}</p>
        )}
        
        {product.shipping && (
          <p className="shipping">
            Envío <strong>{product.shipping}</strong>
          </p>
        )}
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
    specs: PropTypes.string,
    price: PropTypes.number,
    originalPrice: PropTypes.string,
    discount: PropTypes.string,
    installment: PropTypes.string,
    shipping: PropTypes.string,
    image: PropTypes.string,
  }).isRequired,
};

export default ProductCard;