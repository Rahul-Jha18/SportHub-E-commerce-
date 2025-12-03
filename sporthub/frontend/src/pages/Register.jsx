import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Registration failed";
      alert(msg);
    }
  };

  return (
    <div className="page-wrapper">
      <form onSubmit={submit} className="auth-form">
        <h2>Create Account</h2>

        <input
          type="text"
          placeholder="Full Name"
          required
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button>Register</button>
      </form>
    </div>
  );
}

export default Register;
