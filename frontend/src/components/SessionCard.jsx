import React from "react";
import { Link } from "react-router-dom";
import FavoriteButton from "./FavoriteButton";
import SeatProgress from "./SeatProgress";
import StatusBadge from "./StatusBadge";

function getTrackClass(track) {
  const value = String(track || "").toLowerCase();

  if (value.includes("tech")) {
    return "tech";
  }
  if (value.includes("creative")) {
    return "creative";
  }
  if (value.includes("wellness")) {
    return "wellness";
  }
  if (value.includes("career")) {
    return "career";
  }
  if (value.includes("community")) {
    return "community";
  }

  return "default";
}

function SessionCard({ session }) {
  return (
    <article className={`session-card session-card-${getTrackClass(session.track)}`}>
      <div className="session-card-header">
        <div className="session-card-top">
          <StatusBadge status={session.status} />
          <span className="track-pill">{session.track}</span>
        </div>
        <div className="event-card-actions">
          <FavoriteButton eventId={session.id} />
        </div>
      </div>

      <div className="session-card-body">
        <div className="session-card-copy">
          <h3>{session.title}</h3>
          <p>{session.description}</p>
        </div>

        <dl className="session-meta">
          <div>
            <dt>Event date</dt>
            <dd>{session.session_date}</dd>
          </div>
          <div>
            <dt>City</dt>
            <dd>{session.city}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{session.location}</dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>${session.price.toFixed(2)}</dd>
          </div>
        </dl>

        <div className="session-card-middle">
          <SeatProgress
            availableSeats={session.available_seats}
            totalSeats={session.total_seats}
          />
        </div>

        <div className="session-card-footer">
          <strong>{session.level}</strong>
          <Link to={`/sessions/${session.id}`} className="button-link view-event-button">
            View Event
          </Link>
        </div>
      </div>
    </article>
  );
}

export default SessionCard;
