import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

const CATEGORY_TABS = [
  "ALL",
  "Football",
  "Cricket",
  "Gym",
  "Badminton",
  "Tennis",
  "Swimming",
  "Basketball",
];

function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/products");
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();

    return products.filter((p) => {
      const matchCat =
        activeCat === "ALL" || (p.category || "").toLowerCase() === activeCat.toLowerCase();

      if (!matchCat) return false;

      if (!s) return true;

      const name = (p.name || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase(); // optional if you have brand
      const sport = (p.sport_type || "").toLowerCase();

      return name.includes(s) || cat.includes(s) || brand.includes(s) || sport.includes(s);
    });
  }, [products, activeCat, search]);

  const handleTab = (cat) => {
    setActiveCat(cat);
  };

  const goToCategoryPage = () => {
    // open products page with current category selected
    const cat = activeCat === "ALL" ? "all" : activeCat;
    navigate(`/products/${encodeURIComponent(cat)}`);
  };

  return (
    <div className="page-wrapper">
      {/* HERO */}
      <div className="hero glass">
        <div className="hero-content">
          <h1>Welcome to SportHub</h1>
          <p>
            Premium sports gear store — search, filter and shop with a smooth UI.
          </p>

          <div className="hero-actions">
            <button className="btn btn-primary" onClick={goToCategoryPage}>
              Shop {activeCat === "ALL" ? "All" : activeCat}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => window.scrollTo({ top: 520, behavior: "smooth" })}
            >
              Explore
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="search-wrap">
        <input
          className="input"
          type="text"
          placeholder="Search by name, category, brand, sport type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div className="category-filter">
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`pill ${activeCat === cat ? "active" : ""}`}
            onClick={() => handleTab(cat)}
          >
            {cat === "ALL" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* AD BANNER */}
      <div className="ad-banner">
        <h2>🔥 Mega Sports Sale! Up to 40% OFF 🔥</h2>
        <p>Filter by category + search to find your gear faster.</p>
      </div>

      {/* TRENDING */}
      <h2 className="section-title">Trending Now</h2>
      {loading ? (
        <div className="empty">Loading products…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">No products match your filter/search.</div>
      ) : (
        <div className="product-grid">
          {filtered.slice(0, 6).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* ALL PRODUCTS */}
      <h2 className="section-title" style={{ marginTop: 20 }}>
        All Products
      </h2>

      {loading ? (
        <div className="empty">Loading products…</div>
      ) : filtered.length === 0 ? (
        <div className="empty">No products found.</div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
