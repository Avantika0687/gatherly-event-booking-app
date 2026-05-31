import React from "react";
import StatusBadge from "./StatusBadge";

function ReservationCard({ reservation, onCancel }) {
  return (
    <article className="reservation-card">
      <div className="reservation-header">
        <div>
          <p className="eyebrow">Reservation {reservation.reservation_ref}</p>
          <h3>{reservation.session_title}</h3>
        </div>
        <StatusBadge status={reservation.status || "Active"} />
      </div>
      <dl className="reservation-meta">
        <div>
          <dt>Guest</dt>
          <dd>
            {reservation.user_name} · {reservation.user_email}
          </dd>
        </div>
        <div>
          <dt>Event</dt>
          <dd>
            {reservation.session_date} · {reservation.city}
          </dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{reservation.location}</dd>
        </div>
        <div>
          <dt>Seats</dt>
          <dd>{reservation.quantity}</dd>
        </div>
        <div>
          <dt>Total</dt>
          <dd>${reservation.total_amount.toFixed(2)}</dd>
        </div>
      </dl>
      <button className="ghost-button danger" onClick={() => onCancel(reservation.id)}>
        Cancel reservation
      </button>
    </article>
  );
}

export default ReservationCard;
