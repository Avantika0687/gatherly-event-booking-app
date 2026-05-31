import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import FavoriteButton from "../components/FavoriteButton";
import SeatProgress from "../components/SeatProgress";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const initialForm = {
  quantity: 1,
};

function getCountdownLabel(sessionDate) {
  const eventDate = new Date(sessionDate);
  if (Number.isNaN(eventDate.getTime())) {
    return "Date to be confirmed";
  }

  const today = new Date();
  const diffMs = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "Event date passed";
  }
  if (diffDays === 0) {
    return "Starts today";
  }
  if (diffDays === 1) {
    return "Starts in 1 day";
  }

  return `Starts in ${diffDays} days`;
}

function SessionDetails() {
  const { sessionId } = useParams();
  const { isLoggedIn, user } = useAuth();
  const { showToast } = useToast();
  const [session, setSession] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    loadEvent();
  }, [sessionId]);

  async function loadEvent() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getSession(sessionId);
      setSession(data);
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

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isLoggedIn || !user) {
      showToast({
        type: "info",
        message: "Please login or sign up to reserve an event.",
      });
      return;
    }

    if (!Number(form.quantity) || Number(form.quantity) < 1) {
      showToast({
        type: "error",
        message: "Please enter a valid quantity.",
      });
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const reservation = await api.createReservation({
        session_id: Number(sessionId),
        user_name: user.name,
        user_email: user.email,
        quantity: Number(form.quantity),
      });
      setConfirmation({
        reservation_ref: reservation.reservation_ref,
        session_title: session.title,
        user_name: user.name,
        user_email: user.email,
        quantity: Number(form.quantity),
        total_amount: reservation.total_amount,
        status: reservation.status || "Confirmed",
      });
      setForm(initialForm);
      await loadEvent();
      showToast({
        type: "success",
        message: "Event reservation confirmed successfully.",
      });
    } catch (submitError) {
      setError(submitError.message);
      showToast({
        type: "error",
        message: submitError.message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const countdownLabel = useMemo(() => {
    return session ? getCountdownLabel(session.session_date) : "";
  }, [session]);

  if (loading) {
    return <p>Loading event details...</p>;
  }

  if (error && !session) {
    return <p className="error-banner">{error}</p>;
  }

  return (
    <section className="stack-page">
      <Link to="/sessions" className="ghost-button back-button">
        Back to events
      </Link>

      <article className="session-banner event-banner">
        <div className="session-banner-copy">
          <p className="eyebrow">Event spotlight</p>
          <div className="session-banner-top">
            <StatusBadge status={session.status} />
            <span className="track-pill">{session.track}</span>
          </div>
          <h1>{session.title}</h1>
          <p>{session.description}</p>
          <div className="event-banner-tools">
            <FavoriteButton eventId={session.id} />
            <span className="countdown-pill">{countdownLabel}</span>
          </div>
        </div>
        <div className="session-banner-meta">
          <div className="meta-highlight">
            <span>Level</span>
            <strong>{session.level}</strong>
          </div>
          <div className="meta-highlight">
            <span>City</span>
            <strong>{session.city}</strong>
          </div>
          <div className="meta-highlight">
            <span>Location</span>
            <strong>{session.location}</strong>
          </div>
          <div className="meta-highlight">
            <span>Event date</span>
            <strong>{session.session_date}</strong>
          </div>
          <div className="meta-highlight">
            <span>Price</span>
            <strong>${session.price.toFixed(2)}</strong>
          </div>
          <div className="meta-highlight">
            <span>Event status</span>
            <strong>{session.status}</strong>
          </div>
        </div>
      </article>

      {confirmation ? (
        <article className="details-card confirmation-card ticket-card">
          <div className="ticket-card-top">
            <div>
              <p className="eyebrow">Event pass</p>
              <h2>Your reservation is confirmed</h2>
            </div>
            <StatusBadge status={confirmation.status} />
          </div>
          <dl className="details-meta">
            <div>
              <dt>Reservation reference</dt>
              <dd>{confirmation.reservation_ref}</dd>
            </div>
            <div>
              <dt>Event title</dt>
              <dd>{confirmation.session_title}</dd>
            </div>
            <div>
              <dt>User name</dt>
              <dd>{confirmation.user_name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{confirmation.user_email}</dd>
            </div>
            <div>
              <dt>Quantity</dt>
              <dd>{confirmation.quantity}</dd>
            </div>
            <div>
              <dt>Total amount</dt>
              <dd>${Number(confirmation.total_amount).toFixed(2)}</dd>
            </div>
          </dl>
          <div className="hero-actions">
            <Link to="/reservations" className="button-link">
              View My Reservations
            </Link>
            <Link to="/sessions" className="ghost-button">
              Browse More Events
            </Link>
          </div>
        </article>
      ) : null}

      <section className="details-layout">
        <article className="details-card">
          <p className="eyebrow">Event details</p>
          <h2>Everything you need before booking</h2>
          <dl className="details-meta">
            <div>
              <dt>Track</dt>
              <dd>{session.track}</dd>
            </div>
            <div>
              <dt>Host</dt>
              <dd>{session.host_name}</dd>
            </div>
            <div>
              <dt>Available seats</dt>
              <dd>{session.available_seats}</dd>
            </div>
            <div>
              <dt>Total seats</dt>
              <dd>{session.total_seats}</dd>
            </div>
          </dl>
          <SeatProgress
            availableSeats={session.available_seats}
            totalSeats={session.total_seats}
          />
        </article>

        <aside className="details-card reserve-card">
          <p className="eyebrow">Reserve event</p>
          <h2>Reserve your place</h2>

          {!isLoggedIn ? (
            <EmptyState
              compact
              title="Please login or sign up to reserve an event."
              message="Guest booking is disabled in this demo. Sign in to continue with your reservation."
              actionButton={
                <div className="hero-actions">
                  <Link to="/login" className="button-link">
                    Login
                  </Link>
                  <Link to="/signup" className="ghost-button">
                    Sign Up
                  </Link>
                </div>
              }
            />
          ) : (
            <form className="form-grid reserve-form" onSubmit={handleSubmit}>
              <label>
                Name
                <input type="text" value={user.name} readOnly />
              </label>
              <label>
                Email
                <input type="email" value={user.email} readOnly />
              </label>
              <label className="full-width">
                Quantity
                <input
                  type="number"
                  min="1"
                  max={Math.max(session.available_seats, 1)}
                  value={form.quantity}
                  onChange={(event) => updateForm("quantity", event.target.value)}
                  required
                  disabled={session.status !== "Active" || session.available_seats === 0}
                />
              </label>
              {error ? <p className="error-banner full-width">{error}</p> : null}
              <button
                type="submit"
                className="button-link button-reset"
                disabled={submitting || session.status !== "Active" || session.available_seats === 0}
              >
                {submitting ? "Reserving..." : "Reserve Event"}
              </button>
            </form>
          )}
        </aside>
      </section>
    </section>
  );
}

export default SessionDetails;
