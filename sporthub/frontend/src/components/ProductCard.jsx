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
      <div className="product-img">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} loading="lazy" />
        ) : (
          <div style={{ height: "100%", display: "grid", placeItems: "center", color: "rgba(234,240,255,0.65)" }}>
            No Image
          </div>
        )}
      </div>

      <div className="product-body">
        <div className="product-title">{product.name}</div>

        <div className="product-meta">
          {product.category && <span className="chip">{product.category}</span>}
          {typeof product.stock !== "undefined" && (
            <span className="chip">
              {Number(product.stock) > 0 ? `In stock: ${product.stock}` : "Out of stock"}
            </span>
          )}
        </div>

        <div className="price">Rs. {product.price}</div>
      </div>

      <div className="product-actions">
        <button className="btn btn-ghost btn-small" type="button" onClick={handleView}>
          View
        </button>

        <button className="btn btn-primary btn-small" type="button" onClick={handleAddToCart}>
          Add
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
