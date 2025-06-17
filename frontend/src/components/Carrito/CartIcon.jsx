import { useCart } from "./CartContext";
import './CartIcon.css'; // Assuming you have a CSS file for styling
import { FaShoppingCart } from 'react-icons/fa';

const CartIcon = () => {
  const { totalItems, toggleCart } = useCart();

  return (
    <button onClick={toggleCart} className="cart-icon">
      <FaShoppingCart size={20}  className="cart-icon-svg"/> 
      {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
    </button>
  );
};

export default CartIcon;