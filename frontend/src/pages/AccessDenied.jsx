import React from "react";
import { Link } from "react-router-dom";

function AccessDenied() {
  return (
    <section className="stack-page">
      <article className="details-card access-card">
        <p className="eyebrow">Restricted area</p>
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page.</p>
        <Link to="/" className="button-link">
          Go to Home
        </Link>
      </article>
    </section>
  );
}

export default AccessDenied;
