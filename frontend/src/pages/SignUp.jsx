import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const initialForm = {
  name: "",
  email: "",
  password: "",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignUp() {
  const navigate = useNavigate();
  const { adminEmail, signUp } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      showToast({
        type: "error",
        message: "Name cannot be empty.",
      });
      return;
    }

    if (!emailPattern.test(form.email.trim())) {
      showToast({
        type: "error",
        message: "Enter a valid email address.",
      });
      return;
    }

    if (form.email.trim().toLowerCase() === adminEmail) {
      showToast({
        type: "error",
        message: "Admin email is reserved and cannot be used for sign up.",
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
      signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      showToast({
        type: "success",
        message: "Sign up successful. Your user account is ready.",
      });
      navigate("/", { replace: true });
    } catch (signUpError) {
      showToast({
        type: "error",
        message: signUpError.message,
      });
    }
  }

  return (
    <section className="auth-layout">
      <article className="auth-card auth-card-wide">
        <p className="eyebrow">Create your profile</p>
        <h1>Sign up for Gatherly</h1>
        <p className="auth-copy">
          Create a user account with any valid email format, except the reserved admin email.
        </p>

        <form className="form-grid auth-form" onSubmit={handleSubmit}>
          <label className="full-width">
            Name
            <input
              type="text"
              placeholder="Enter name"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              placeholder="Enter email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              required
            />
          </label>
          <label>
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
            Sign Up
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login" className="inline-link">
            Login
          </Link>
        </p>
      </article>
    </section>
  );
}

export default SignUp;
