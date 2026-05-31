import React from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AccessDenied from "./pages/AccessDenied";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyReservations from "./pages/MyReservations";
import Profile from "./pages/Profile";
import SessionDetails from "./pages/SessionDetails";
import Sessions from "./pages/Sessions";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <Sessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:sessionId"
            element={
              <ProtectedRoute>
                <SessionDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <MyReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <section className="empty-panel">
                <h2>Page not found</h2>
                <p>The page you requested is not available in Gatherly.</p>
                <NavLink to="/" className="button-link">
                  Go to Home
                </NavLink>
              </section>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
