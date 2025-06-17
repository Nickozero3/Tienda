import { useCart } from "./CartContext";

const CartPanel = () => {
  const {
    cartItems,
    removeFromCart,
    totalItems,
    totalPrice,
    isCartOpen,
    closeCart,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="cart-panel">
      <div className="cart-header">
        <h3>Tu Carrito ({totalItems})</h3>
        <button onClick={closeCart} className="close-btn">
          ×
        </button>
      </div>

      {cartItems.length === 0 ? (
        <p className="empty-cart">El carrito está vacío</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image} alt={item.name} width={50} />
                <div>
                  <h4>{item.name}</h4>
                  <p>${item.price} × {item.quantity}</p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button className="checkout-btn">Finalizar Compra</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPanel;