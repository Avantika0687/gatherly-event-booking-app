import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function ProfileDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="profile-dropdown" ref={containerRef}>
      <button
        type="button"
        className={`profile-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{user?.email}</span>
        <span className="profile-caret">{open ? "▲" : "▼"}</span>
      </button>

      {open ? (
        <div className="profile-menu">
          <div className="profile-summary">
            <strong>{user?.email}</strong>
            <span>Role: {isAdmin ? "Admin" : "User"}</span>
          </div>
          <Link to="/reservations" className="profile-menu-item" onClick={() => setOpen(false)}>
            My Reservations
          </Link>
          {isAdmin ? (
            <Link to="/admin" className="profile-menu-item" onClick={() => setOpen(false)}>
              Admin Dashboard
            </Link>
          ) : null}
          <button
            type="button"
            className="profile-menu-item profile-menu-button"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ProfileDropdown;
