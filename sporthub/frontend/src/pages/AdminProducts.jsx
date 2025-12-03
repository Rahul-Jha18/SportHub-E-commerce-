import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const { auth } = useAuth();

  useEffect(() => {
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch(console.error);
  }, []);

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Delete failed (Admin only)");
    }
  };

  if (auth?.user?.role !== "admin") {
    return (
      <div className="page-wrapper">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <h1>Admin - Products</h1>

      {products.length === 0 ? (
        <div className="empty">No products available.</div>
      ) : (
        products.map((p) => (
          <div key={p.id} className="admin-item">
            {p.image_url && (
              <img
                src={p.image_url}
                alt={p.name}
                className="admin-item-img"
              />
            )}
            <div className="admin-item-info">
              <strong>{p.name}</strong>
              <p>Rs. {p.price}</p>
              {p.category && <p>Category: {p.category}</p>}
            </div>
            <div className="admin-item-buttons">
              <button onClick={() => deleteProduct(p.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminProducts;
