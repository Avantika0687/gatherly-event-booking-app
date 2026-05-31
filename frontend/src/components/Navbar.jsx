import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, logout, user } = useAuth();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = isLoggedIn
    ? [
        { to: "/", label: "Home" },
        { to: "/sessions", label: "Events" },
        { to: "/reservations", label: "My Reservations" },
        ...(isAdmin ? [{ to: "/admin", label: "Admin Dashboard" }] : []),
      ]
    : [
        { to: "/", label: "Home" },
        { to: "/login", label: "Login" },
        { to: "/signup", label: "Sign Up", accent: true },
      ];

  function handleLogout() {
    logout();
    setMobileOpen(false);
    showToast({
      type: "success",
      message: "Logged out successfully.",
    });
    navigate("/");
  }

  const profileLabel = user?.email || user?.name || "Profile";

  return (
    <header className="navbar">
      <div className="brand-block">
        <NavLink to="/" className="brand-mark" onClick={() => setMobileOpen(false)}>
          Gatherly
        </NavLink>
        <p className="brand-copy">Discover and reserve memorable local events.</p>
      </div>

      <button
        type="button"
        className="mobile-nav-toggle"
        onClick={() => setMobileOpen((current) => !current)}
      >
        {mobileOpen ? "Close" : "Menu"}
      </button>

      <div className={`nav-cluster ${mobileOpen ? "open" : ""}`}>
        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? link.accent
                    ? "button-link active-auth"
                    : "nav-link active"
                  : link.accent
                    ? "button-link"
                    : "nav-link"
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {isLoggedIn ? (
          <div className="auth-actions">
            <ProfileDropdown user={user} onLogout={handleLogout} />
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default Navbar;
