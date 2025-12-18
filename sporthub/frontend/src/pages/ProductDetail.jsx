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

  if (!product) return <p className="page-wrapper">Loading…</p>;

  return (
    <div className="page-wrapper">
      <h2 className="section-title">Product Details</h2>

      <div className="product-detail">
        <div className="product-detail-media">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} />
          ) : (
            <div style={{ height: 320, display: "grid", placeItems: "center", color: "rgba(234,240,255,0.65)" }}>
              No Image
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <h1>{product.name}</h1>

          <div className="product-meta" style={{ marginBottom: 8 }}>
            {product.category && <span className="chip">{product.category}</span>}
          </div>

          <div className="price" style={{ fontSize: 18 }}>
            Rs. {product.price}
          </div>

          <p className="product-detail-desc">
            {product.description || "No description available."}
          </p>

          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" onClick={() => addToCart(product)}>
              Add to Cart
            </button>
            <button className="btn btn-ghost" onClick={() => window.history.back()}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
