import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import { useCart } from "../context/CartContext";

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(console.error);
  }, [id]);

  if (!product) return <p className="page-wrapper">Loading...</p>;

  return (
    <div className="page-wrapper">
      <div className="product-detail">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} />
        )}

        <div className="product-detail-info">
          <h1>{product.name}</h1>
          {product.category && (
            <p className="product-detail-category">{product.category}</p>
          )}

          <h2 className="product-detail-price">Rs. {product.price}</h2>

          <p className="product-detail-description">
            {product.description || "No description available."}
          </p>

          <button onClick={() => addToCart(product)} style={{ marginTop: 16 }}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
