import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Registration failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-card-inner">
            <div className="auth-top">
              <div className="auth-brand">
                <div className="auth-logo">✨</div>
                <div>
                  <div className="auth-title">Create your SportHub account</div>
                  <div className="auth-subtitle">
                    Join the neon sports marketplace
                  </div>
                </div>
              </div>

              <span className="badge">New</span>
            </div>

            <div className="auth-divider" />

            <form onSubmit={submit}>
              <div className="form-group">
                <label className="field-label">Full Name</label>
                <div className="field">
                  <span className="icon">👤</span>
                  <input
                    type="text"
                    placeholder="Your full name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">Email</label>
                <div className="field">
                  <span className="icon">📧</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">Password</label>
                <div className="field">
                  <span className="icon">🔒</span>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Create a strong password"
                    required
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="auth-actions">
                <span style={{ color: "rgba(234,240,255,0.65)", fontSize: 13 }}>
                  Ready to shop? 🚀
                </span>
                <Link className="small-link" to="/login">
                  Already have an account? Login →
                </Link>
              </div>

              <button className="auth-submit" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>

            <div className="auth-bottom">
              <span>Already a member?</span>
              <Link to="/login" className="btn-mini">
                Go to Login
              </Link>
            </div>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <Link to="/" className="small-link">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
