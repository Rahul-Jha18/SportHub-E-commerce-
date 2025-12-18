import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

function CategoryFilter() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        const unique = new Set();
        res.data.forEach((p) => {
          if (p.category) unique.add(p.category);
        });
        setCategories(Array.from(unique).sort((a, b) => a.localeCompare(b)));
      })
      .catch(console.error);
  }, []);

  return (
    <div className="page-wrapper">
      <h1 className="section-title">Browse by Category</h1>
      <div className="glass" style={{ padding: 16, borderRadius: 16 }}>
        <div className="category-filter" style={{ marginBottom: 0 }}>
          {categories.map((cat) => (
            <Link key={cat} to={`/products/${encodeURIComponent(cat)}`} className="pill">
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryFilter;
