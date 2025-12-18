import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/api";
import ProductCard from "../components/ProductCard";

const CATEGORY_TABS = [
  "all",
  "Football",
  "Cricket",
  "Gym",
  "Badminton",
  "Tennis",
  "Swimming",
  "Basketball",
];

function ProductList() {
  const { category } = useParams();
  const navigate = useNavigate();

  const initialCat = decodeURIComponent(category || "all");
  const [activeCat, setActiveCat] = useState(initialCat);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // keep activeCat in sync with URL
  useEffect(() => {
    setActiveCat(initialCat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const catLower = (activeCat || "all").toLowerCase();

        let res;
        if (catLower === "all") {
          res = await api.get("/products");
        } else {
          // backend expects category name (your current API)
          res = await api.get(`/products?category=${encodeURIComponent(activeCat)}`);
        }

        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeCat]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return products;

    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const cat = (p.category || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase(); // if you have brand
      const sport = (p.sport_type || "").toLowerCase();

      return (
        name.includes(s) ||
        cat.includes(s) ||
        brand.includes(s) ||
        sport.includes(s)
      );
    });
  }, [products, search]);

  const handleTab = (cat) => {
    setActiveCat(cat);
    // update URL too (nice UX + sharable link)
    navigate(`/products/${encodeURIComponent(cat)}`);
  };

  return (
    <div className="page-wrapper">
      <h2 className="section-title">
        {(activeCat || "all").toLowerCase() === "all"
          ? "All Products"
          : `${activeCat} Items`}
      </h2>

      {/* FILTER BAR */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        {CATEGORY_TABS.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`pill ${(activeCat || "").toLowerCase() === cat.toLowerCase() ? "active" : ""}`}
            onClick={() => handleTab(cat)}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: 16 }}>
        <input
          className="input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, category, brand, sport type…"
        />
      </div>

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

export default ProductList;
