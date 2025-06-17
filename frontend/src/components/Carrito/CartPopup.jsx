import { useCart } from "./CartContext";
import { useEffect, useRef } from "react";

const CartPopup = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
    isCartOpen,
    closeCart,
  } = useCart();

  const popupRef = useRef();

  const enviarWhatsApp = () => {
    if (cartItems.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    // Crear mensaje estructurado
    let mensaje = " -- Pedido desde ***** Web --\n\n";
    mensaje += "Detalle del carrito: \n\n";

    cartItems.forEach((item) => {
      mensaje += `  ${item.name}\n`;
      mensaje += `   Cantidad: ${item.quantity}\n`;
      mensaje += `   Precio unitario: $${item.price.toFixed(2)}\n`;
      mensaje += `   Subtotal: $${(item.price * item.quantity).toFixed(2)}\n\n`;
    });

    mensaje += `💰 *Total a pagar: $${totalPrice.toFixed(2)}*\n\n`;
    mensaje += "Comunicarme disponibilidad y métodos de pago.";

    // Codificar y abrir WhatsApp
    const telefono = "5493548554840"; // Código de país + número
    window.open(
      `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closeCart();
      }
    };

    if (isCartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartOpen, closeCart]);

  if (!isCartOpen) return null;

  return (
    <div className="cart-popup-overlay">
      <div className="cart-popup" ref={popupRef}>
        <div className="popup-header">
          <h3>Tu Carrito ({totalItems})</h3>
          <button onClick={closeCart} className="close-btn">
            &times;
          </button>
        </div>

        <div className="popup-content">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>Tu carrito está vacío</p>
              <button onClick={closeCart} className="continue-shopping">
                Seguir comprando
              </button>
            </div>
          ) : (
            <>
              <div className="items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img
                      src={
                        item.image
                          ? `/images/${item.image}` // Si existe item.image
                          : item.imagen
                          ? `/uploads/${item.imagen}` // Si existe item.imagen (nota: ruta diferente)
                          : "/images/placeholder.png" // Imagen por defecto
                      }
                      alt={item.name}
                      className="item-image"
                    />
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="remove-btn"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <button
                  className="checkout-btn whatsapp-btn"
                  onClick={enviarWhatsApp}
                >
                  Completar compra por WhatsApp
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPopup;
