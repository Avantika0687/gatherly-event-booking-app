import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h2>Gatherly</h2>
          <p>
            Gatherly helps people discover events, reserve seats, and support local learning
            communities through a simple event booking experience.
          </p>
        </div>
        <div>
          <h3>Quick links</h3>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/sessions">Events</Link>
            <Link to="/reservations">My Reservations</Link>
            <Link to="/admin">Admin Dashboard</Link>
          </div>
        </div>
        <div>
          <h3>Demo note</h3>
          <p>Learning project for QA, automation, and CI/CD practice</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
