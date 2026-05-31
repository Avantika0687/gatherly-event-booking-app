import React from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return (
      <EmptyState
        title="Profile unavailable"
        message="Please login or sign up to view your Gatherly profile."
        actionTo="/login"
        actionLabel="Login"
      />
    );
  }

  return (
    <section className="stack-page">
      <article className="details-card profile-card">
        <p className="eyebrow">Your profile</p>
        <h1>{user.name || "Gatherly guest"}</h1>
        <dl className="details-meta">
          <div>
            <dt>Name</dt>
            <dd>{user.name || "Not set"}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{user.role === "admin" ? "Admin" : "User"}</dd>
          </div>
          <div>
            <dt>Access</dt>
            <dd>Frontend demo account</dd>
          </div>
          <div>
            <dt>Saved in</dt>
            <dd>Local storage</dd>
          </div>
        </dl>
        <div className="hero-actions">
          <Link to="/reservations" className="button-link">
            View reservations
          </Link>
          <Link to="/sessions" className="ghost-button">
            Browse events
          </Link>
        </div>
      </article>
    </section>
  );
}

export default Profile;
