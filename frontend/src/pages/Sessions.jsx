import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import { getSavedEventIds } from "../components/FavoriteButton";
import SessionCard from "../components/SessionCard";
import { useToast } from "../context/ToastContext";

function Sessions() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    city: "All",
    track: "All",
    level: "All",
    savedOnly: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedEventIds, setSavedEventIds] = useState(() => getSavedEventIds());

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    function syncSavedEvents() {
      setSavedEventIds(getSavedEventIds());
    }

    window.addEventListener("storage", syncSavedEvents);
    window.addEventListener("gatherly:saved-events-updated", syncSavedEvents);
    return () => {
      window.removeEventListener("storage", syncSavedEvents);
      window.removeEventListener("gatherly:saved-events-updated", syncSavedEvents);
    };
  }, []);

  async function loadEvents() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getSessions();
      setSessions(data);
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

  const options = useMemo(() => {
    const cities = ["All", ...new Set(sessions.map((session) => session.city))];
    const tracks = ["All", ...new Set(sessions.map((session) => session.track))];
    const levels = ["All", ...new Set(sessions.map((session) => session.level))];
    return { cities, tracks, levels };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();

    return sessions.filter((session) => {
      const matchesSearch =
        !searchValue ||
        session.title.toLowerCase().includes(searchValue) ||
        session.description.toLowerCase().includes(searchValue);
      const matchesCity = filters.city === "All" || session.city === filters.city;
      const matchesTrack = filters.track === "All" || session.track === filters.track;
      const matchesLevel = filters.level === "All" || session.level === filters.level;
      const matchesSaved = !filters.savedOnly || savedEventIds.includes(session.id);

      return matchesSearch && matchesCity && matchesTrack && matchesLevel && matchesSaved;
    });
  }, [filters, savedEventIds, sessions]);

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function resetFilters() {
    setFilters({
      search: "",
      city: "All",
      track: "All",
      level: "All",
      savedOnly: false,
    });
  }

  return (
    <section className="stack-page">
      <section className="events-page-banner">
        <div className="events-page-banner-overlay" />
        <div className="events-page-banner-content">
          <p className="eyebrow">Gatherly events</p>
          <h1>Explore Events</h1>
          <p>Find local workshops, creative gatherings, and community experiences.</p>
        </div>
      </section>

      <div className="page-heading">
        <div>
          <p className="eyebrow">Event catalogue</p>
          <h1>Browse upcoming events</h1>
        </div>
        <button className="ghost-button" onClick={loadEvents}>
          Refresh
        </button>
      </div>

      <div className="filter-bar events-filter-bar">
        <input
          type="search"
          placeholder="Search by title or description"
          value={filters.search}
          onChange={(event) => updateFilter("search", event.target.value)}
        />
        <select value={filters.city} onChange={(event) => updateFilter("city", event.target.value)}>
          {options.cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <select
          value={filters.track}
          onChange={(event) => updateFilter("track", event.target.value)}
        >
          {options.tracks.map((track) => (
            <option key={track} value={track}>
              {track}
            </option>
          ))}
        </select>
        <select
          value={filters.level}
          onChange={(event) => updateFilter("level", event.target.value)}
        >
          {options.levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`ghost-button saved-filter-button ${filters.savedOnly ? "active" : ""}`}
          onClick={() => updateFilter("savedOnly", !filters.savedOnly)}
        >
          {filters.savedOnly ? "Showing Saved Events" : "Saved Events"}
        </button>
      </div>

      {loading ? <p>Loading events...</p> : null}
      {error ? <p className="error-banner">{error}</p> : null}

      {!loading && !filteredSessions.length ? (
        <EmptyState
          title="No events found"
          message="Try clearing your search, turning off the saved filter, or broadening the city, track, or level filters."
          actionButton={
            <button type="button" className="ghost-button" onClick={resetFilters}>
              Clear filters
            </button>
          }
        />
      ) : null}

      <div className="card-grid">
        {filteredSessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </section>
  );
}

export default Sessions;
