// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CategoryFilter from "./components/CategoryFilter";

import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import KhaltiReturn from "./pages/KhaltiReturn";
import AdminProducts from "./pages/AdminProducts";

// Wrapper to require login
function RequireAuth({ children }) {
  const { auth } = useAuth();
  if (!auth) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="app-root">
          <div className="bg-orbs" />
          <Navbar />
          <main>
            <Routes>
              {/* PUBLIC ROUTES */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/categories" element={<CategoryFilter />} />
              <Route
                path="/offers"
                element={
                  <div className="page-wrapper">Offers coming soon…</div>
                }
              />
              <Route path="/payment/khalti" element={<KhaltiReturn />} />
              <Route
                path="/reviews"
                element={
                  <div className="page-wrapper">Reviews coming soon…</div>
                }
              />

              {/* PROTECTED ROUTES */}
              <Route
                path="/products/:category"
                element={
                  <RequireAuth>
                    <ProductList />
                  </RequireAuth>
                }
              />
              <Route
                path="/product/:id"
                element={
                  <RequireAuth>
                    <ProductDetail />
                  </RequireAuth>
                }
              />
              <Route
                path="/cart"
                element={
                  <RequireAuth>
                    <Cart />
                  </RequireAuth>
                }
              />
              <Route
                path="/checkout"
                element={
                  <RequireAuth>
                    <Checkout />
                  </RequireAuth>
                }
              />
              <Route
                path="/admin/products"
                element={
                  <RequireAuth>
                    <AdminProducts />
                  </RequireAuth>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
