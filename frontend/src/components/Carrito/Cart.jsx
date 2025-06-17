import React from 'react';
import { useCart } from './CartContext';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart,
    totalItems,
    totalPrice
  } = useCart();

  return (
    <div className="cart">
      <h2>Carrito de Compras ({totalItems} items)</h2>
      
      {cartItems.length === 0 ? (
        <p>Tu carrito está vacío</p>
      ) : (
        <>
          <ul className="cart-items">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>${item.price.toFixed(2)}</p>
                </div>
                <div className="item-actions">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  />
                  <button onClick={() => removeFromCart(item.id)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="cart-summary">
            <h3>Total: ${totalPrice.toFixed(2)}</h3>
            <button onClick={clearCart}>Vaciar Carrito</button>
            <button className="checkout">Finalizar Compra</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;