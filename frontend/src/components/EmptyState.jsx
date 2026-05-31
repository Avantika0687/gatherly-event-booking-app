import React from "react";
import { Link } from "react-router-dom";

function EmptyState({ title, message, actionLabel, actionTo, actionButton, compact = false }) {
  return (
    <section className={`empty-panel ${compact ? "empty-panel-compact" : ""}`}>
      <h2>{title}</h2>
      <p>{message}</p>
      {actionTo ? (
        <Link to={actionTo} className="button-link">
          {actionLabel}
        </Link>
      ) : null}
      {actionButton ? actionButton : null}
    </section>
  );
}

export default EmptyState;
