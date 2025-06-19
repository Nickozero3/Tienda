import { useCart } from "./CartContext";
import { useEffect, useRef } from "react";
import "./CartPopup.css";


const url = process.env.REACT_APP_API_BASE_URL;

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

    let mensaje = " -- Pedido desde ***** Web --\n\n";
    mensaje += "Detalle del carrito: \n\n";

    cartItems.forEach((item) => {
      const cantidad = Number(item.quantity) || 0;
      const precio = Number(item.price) || 0;
      const subtotal = (item.price * cantidad).toFixed(2);

      mensaje += `  ${item.name}\n`;
      mensaje += `   Cantidad: ${cantidad}\n`;
      mensaje += `   Precio unitario: $${precio}\n`;
      mensaje += `   Subtotal: $${subtotal}\n\n`;
    });

    const total = Number(totalPrice) || 0;

    mensaje += `💰 *Total a pagar: $${total.toFixed(2)}*\n\n`;
    mensaje += "Comunicarme disponibilidad y métodos de pago.";

    const telefono = "5493548554840";
    window.open(
      `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
      "_blank"
    );
  };

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
                {cartItems.map((item) => {
                  const cantidad = Number(item.quantity) || 0;
                  const precio = item.price;
                  const subtotal = (precio * cantidad).toFixed(2);

                  return (
                    <div key={item.id} className="cart-item">
                      <img
                        src={`${url}${item.image}`}
                        alt={item.name}
                        className="item-imagen"
                      />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <div className="quantity-controls">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, cantidad - 1)
                            }
                            disabled={cantidad <= 1}
                          >
                            -
                          </button>
                          <span>{cantidad}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, cantidad + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="item-price">
                        ${subtotal}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="remove-btn"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="cart-summary">
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${totalPrice}</span>
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
