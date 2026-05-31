import React from "react";

function SeatProgress({ availableSeats, totalSeats }) {
  const total = Math.max(Number(totalSeats) || 0, 1);
  const available = Math.max(Number(availableSeats) || 0, 0);
  const reservedRatio = Math.min(100, Math.max(0, ((total - available) / total) * 100));
  const availabilityClass =
    available === 0 ? "full" : available <= Math.max(3, total * 0.2) ? "low" : "open";

  return (
    <div className="seat-progress">
      <div className="seat-progress-copy">
        <span>Available: {available} / {total} seats</span>
        <span>{available === 0 ? "Sold out" : available <= Math.max(3, total * 0.2) ? "Limited" : "Open"}</span>
      </div>
      <div className="seat-progress-track" aria-hidden="true">
        <div
          className={`seat-progress-fill ${availabilityClass}`}
          style={{ width: `${reservedRatio}%` }}
        />
      </div>
    </div>
  );
}

export default SeatProgress;
