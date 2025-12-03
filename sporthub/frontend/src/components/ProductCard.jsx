// src/components/ProductCard.jsx
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { auth } = useAuth();
  const navigate = useNavigate();

  if (!product) return null;

  const handleView = () => {
    if (!auth) {
      alert("Please login to view product details.");
      navigate("/login");
      return;
    }
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = () => {
    if (!auth) {
      alert("Please login to add items to cart.");
      navigate("/login");
      return;
    }
    addToCart(product);
  };

  return (
    <div className="product-card">
      {product.image_url && (
        <img src={product.image_url} alt={product.name} loading="lazy" />
      )}

      <h3>{product.name}</h3>
      {product.category && (
        <p className="product-category">{product.category}</p>
      )}
      <p className="product-price">Rs. {product.price}</p>

      <div className="product-card-actions">
        <button type="button" onClick={handleView}>
          View
        </button>

        <button type="button" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
