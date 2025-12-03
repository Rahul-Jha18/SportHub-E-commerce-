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
        setCategories(Array.from(unique));
      })
      .catch(console.error);
  }, []);

  return (
    <div className="page-wrapper">
      <h1 className="section-title">Browse by Category</h1>
      <div className="category-filter">
        {categories.map((cat) => (
          <Link
            key={cat}
            to={`/products/${encodeURIComponent(cat)}`}
            className="category-pill"
          >
            {cat}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CategoryFilter;
