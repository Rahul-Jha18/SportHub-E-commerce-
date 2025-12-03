// src/components/Navbar.jsx
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

  return (
    <nav className="navbar">
      {/* LEFT: Logo */}
      <div className="nav-left">
        <Link to="/" className="nav-logo">
          🏀 SportHub
        </Link>
      </div>

      {/* CENTER MENU */}
      <div className="nav-center">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/products/all">Products</NavLink>
        <NavLink to="/offers">Offers</NavLink>
        <NavLink to="/categories">Categories</NavLink>
        <NavLink to="/reviews">Reviews</NavLink>
      </div>

      {/* RIGHT: CART + AUTH */}
      <div className="nav-right">
        <button className="cart-btn" onClick={handleCartClick}>
          🛒 <span>{cart.length}</span>
        </button>

        {!auth ? (
          <>
            <Link to="/login" className="nav-auth">
              Login
            </Link>
            <Link to="/register" className="nav-auth">
              Register
            </Link>
          </>
        ) : (
          <>
            <span className="nav-user">
              Hello,&nbsp;<strong>{auth.user?.name || "User"}</strong>
            </span>
            <button className="logout-btn" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
