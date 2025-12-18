import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { auth, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleCartClick = () => {
    if (!auth) {
      alert("Please login to view your cart.");
      navigate("/login");
    } else {
      navigate("/cart");
    }
  };

  const totalQty = cart.reduce((s, i) => s + (i.quantity || 0), 0);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="nav-logo">
          <span className="logo-badge"><img src="https://d1csarkz8obe9u.cloudfront.net/posterpreviews/sports-logo-football-logo-design-template-3ce28d4e7f05e330ed86407f63c53dc8_screen.jpg?ts=1676704351" alt="" /></span>
          SportHub
        </Link>

        <div className="nav-center">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Home
          </NavLink>
          <NavLink to="/products/all" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Products
          </NavLink>
          <NavLink to="/offers" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Offers
          </NavLink>
          <NavLink to="/categories" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Categories
          </NavLink>
          <NavLink to="/reviews" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            Reviews
          </NavLink>
        </div>

        <div className="nav-right">
          {auth?.user?.role === "admin" && <span className="badge">Admin</span>}

          <button className="cart-btn" onClick={handleCartClick}>
            🛒 Cart
            <span className={`cart-count ${totalQty ? "pulse" : ""}`}>{totalQty}</span>
          </button>

          {!auth ? (
            <>
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="badge">
                Hello,&nbsp;<strong>{auth.user?.name || "User"}</strong>
              </span>
              <button className="btn btn-danger" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
