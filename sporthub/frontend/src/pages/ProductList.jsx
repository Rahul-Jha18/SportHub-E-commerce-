import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import ProductCard from "../components/ProductCard";

function ProductList() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);

  const decodedCategory = decodeURIComponent(category || "all");

  useEffect(() => {
    const load = async () => {
      try {
        if (decodedCategory.toLowerCase() === "all") {
          const res = await api.get("/products");
          setProducts(res.data);
        } else {
          const res = await api.get(`/products?category=${decodedCategory}`);
          setProducts(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [decodedCategory]);

  return (
    <div className="page-wrapper">
      <h2 className="section-title">
        {decodedCategory.toLowerCase() === "all"
          ? "All Products"
          : `${decodedCategory} Items`}
      </h2>

      {products.length === 0 ? (
        <div className="empty">No products found in this category.</div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductList;
