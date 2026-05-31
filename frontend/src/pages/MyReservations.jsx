import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import ReservationCard from "../components/ReservationCard";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function MyReservations() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState(user?.email || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearchTerm(user?.email || "");
  }, [user]);

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getReservations();
      setReservations(data);
    } catch (loadError) {
      setError(loadError.message);
      showToast({
        type: "error",
        message: loadError.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(reservationId) {
    try {
      await api.deleteReservation(reservationId);
      await loadReservations();
      showToast({
        type: "success",
        message: "Reservation cancelled successfully.",
      });
    } catch (cancelError) {
      setError(cancelError.message);
      showToast({
        type: "error",
        message: cancelError.message,
      });
    }
  }

  const filteredReservations = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      return reservations;
    }
    return reservations.filter((reservation) => {
      const haystack = [
        reservation.reservation_ref,
        reservation.session_title,
        reservation.user_email,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(search);
    });
  }, [reservations, searchTerm]);

  return (
    <section className="stack-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Reservation centre</p>
          <h1>My reservations</h1>
        </div>
        <button className="ghost-button" onClick={loadReservations}>
          Refresh
        </button>
      </div>

      <div className="filter-bar single">
        <input
          type="search"
          placeholder="Search by reservation reference, session title, or email"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      {loading ? <p>Loading reservations...</p> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      {!loading && !filteredReservations.length ? (
        <EmptyState
          title="No reservations found"
          message="Try a different search, or reserve a place from an event details page."
          actionTo="/sessions"
          actionLabel="Browse events"
        />
      ) : null}

      <div className="reservation-list">
        {filteredReservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            onCancel={handleCancel}
          />
        ))}
      </div>
    </section>
  );
}

export default MyReservations;
