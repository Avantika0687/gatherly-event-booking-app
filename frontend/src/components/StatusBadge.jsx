import React from "react";

function normalizeStatus(status) {
  return String(status || "Active").toLowerCase();
}

function StatusBadge({ status }) {
  const normalizedStatus = normalizeStatus(status);

  return <span className={`status-pill ${normalizedStatus}`}>{status}</span>;
}

export default StatusBadge;
