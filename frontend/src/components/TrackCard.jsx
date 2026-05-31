import React from "react";

function TrackCard({ track }) {
  return (
    <article className={`track-card ${track.accentClass}`}>
      <span className="track-symbol" aria-hidden="true">
        {track.symbol}
      </span>
      <h3>{track.name}</h3>
      <p>{track.description}</p>
    </article>
  );
}

export default TrackCard;
