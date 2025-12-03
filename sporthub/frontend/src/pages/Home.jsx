import { useEffect, useState } from "react";
import api from "../api/api";
import ProductCard from "../components/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api
      .get("/products")
      .then((res) => {
        setProducts(res.data);
        setFiltered(res.data);

        const cats = [...new Set(res.data.map((p) => p.category).filter(Boolean))];
        setCategories(cats);
      })
      .catch(console.error);
  }, []);

  // SEARCH FILTER
  useEffect(() => {
    const s = search.toLowerCase();
    setFiltered(
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          (p.category && p.category.toLowerCase().includes(s))
      )
    );
  }, [search, products]);

  // CATEGORY FILTER
  const filterCategory = (cat) => {
    if (cat === "ALL") {
      setFiltered(products);
    } else {
      setFiltered(products.filter((p) => p.category === cat));
    }
  };

  return (
    <div className="page-wrapper">
      {/* HERO BANNER */}
      <div className="hero-banner">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Welcome to SportHub</h1>
          <p>Your one-stop destination for all sports equipment & accessories.</p>
          <button className="hero-btn" onClick={() => filterCategory("ALL")}>
            Shop Now
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search sports items, categories, equipment…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CATEGORY FILTERS */}
      <div className="category-filter">
        <div className="category-pill" onClick={() => filterCategory("ALL")}>
          All
        </div>
        {categories.map((cat) => (
          <div
            key={cat}
            className="category-pill"
            onClick={() => filterCategory(cat)}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* AD BANNER */}
      <div className="ad-banner">
        <h2>🔥 Mega Sports Sale! Up to 40% OFF 🔥</h2>
        <p>Limited time offers on Football, Cricket, Badminton and more.</p>
      </div>

      {/* TRENDING SECTION */}
      <h2 className="section-title">Trending Now</h2>
      <div className="product-grid">
        {filtered.slice(0, 6).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* ALL PRODUCTS */}
      <h2 className="section-title" style={{ marginTop: 30 }}>
        All Products
      </h2>
      <div className="product-grid">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}

export default Home;
