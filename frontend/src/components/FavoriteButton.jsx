import React, { useEffect, useState } from "react";

export const SAVED_EVENTS_STORAGE_KEY = "gatherly-saved-events";

export function getSavedEventIds() {
  const storedValue = window.localStorage.getItem(SAVED_EVENTS_STORAGE_KEY);
  if (!storedValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(storedValue);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSavedEventIds(savedIds) {
  window.localStorage.setItem(SAVED_EVENTS_STORAGE_KEY, JSON.stringify(savedIds));
  window.dispatchEvent(new CustomEvent("gatherly:saved-events-updated"));
}

function FavoriteButton({ eventId, labelSaved = "Saved", labelUnsaved = "Save Event", onToggle }) {
  const [isSaved, setIsSaved] = useState(() => getSavedEventIds().includes(eventId));

  useEffect(() => {
    function syncSavedState() {
      setIsSaved(getSavedEventIds().includes(eventId));
    }

    window.addEventListener("storage", syncSavedState);
    window.addEventListener("gatherly:saved-events-updated", syncSavedState);
    return () => {
      window.removeEventListener("storage", syncSavedState);
      window.removeEventListener("gatherly:saved-events-updated", syncSavedState);
    };
  }, [eventId]);

  function handleToggle() {
    const savedIds = getSavedEventIds();
    const nextSaved = !savedIds.includes(eventId);
    const nextIds = nextSaved ? [...savedIds, eventId] : savedIds.filter((id) => id !== eventId);

    persistSavedEventIds(nextIds);
    setIsSaved(nextSaved);

    if (onToggle) {
      onToggle(nextSaved);
    }
  }

  return (
    <button
      type="button"
      className={`favorite-button ${isSaved ? "saved" : ""}`}
      onClick={handleToggle}
    >
      <span>{isSaved ? "★" : "☆"}</span>
      <span>{isSaved ? labelSaved : labelUnsaved}</span>
    </button>
  );
}

export default FavoriteButton;
