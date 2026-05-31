import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const initialForm = {
  email: "",
  password: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const navigate = useNavigate();
  const { adminEmail, login } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!emailPattern.test(form.email.trim())) {
      showToast({
        type: "error",
        message: "Enter a valid email address.",
      });
      return;
    }

    if (!form.password.trim()) {
      showToast({
        type: "error",
        message: "Password cannot be empty.",
      });
      return;
    }

    try {
      const loggedInUser = login({
        email: form.email.trim(),
        password: form.password,
      });

      showToast({
        type: "success",
        message:
          loggedInUser.role === "admin"
            ? "Admin login successful."
            : "Login successful. Welcome back to Gatherly.",
      });
      navigate("/", { replace: true });
    } catch (loginError) {
      showToast({
        type: "error",
        message: loginError.message,
      });
    }
  }

  return (
    <section className="auth-layout">
      <article className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Login to Gatherly</h1>
        <p className="auth-copy">
          Admin demo access uses <strong>{adminEmail}</strong>. All other users must sign up
          first.
        </p>

        <form className="form-grid auth-form" onSubmit={handleSubmit}>
          <label className="full-width">
            Email
            <input
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </label>
          <label className="full-width">
            Password
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              required
            />
          </label>
          <button type="submit" className="button-link button-reset">
            Login
          </button>
        </form>

        <p className="auth-footer">
          New here?{" "}
          <Link to="/signup" className="inline-link">
            Create an account
          </Link>
        </p>
      </article>
    </section>
  );
}

export default Login;
