import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      navigate("/");
    } catch {
      alert("Invalid credentials");
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
                <div className="auth-logo">🏀</div>
                <div>
                  <div className="auth-title">Login to SportHub</div>
                  <div className="auth-subtitle">
                    Neon gear • fast checkout • clean UI
                  </div>
                </div>
              </div>

              <span className="badge">Secure</span>
            </div>

            <div className="auth-divider" />

            <form onSubmit={submit}>
              <div className="form-group">
                <label className="field-label">Email</label>
                <div className="field">
                  <span className="icon">📧</span>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="field-label">Password</label>
                <div className="field">
                  <span className="icon">🔒</span>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                  Welcome back 👋
                </span>
                <Link className="small-link" to="/register">
                  New here? Register →
                </Link>
              </div>

              <button className="auth-submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="auth-bottom">
              <span>Don’t have an account?</span>
              <Link to="/register" className="btn-mini">
                Create Account
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

export default Login;
