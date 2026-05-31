import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";

const emptySession = {
  title: "",
  description: "",
  track: "",
  level: "Beginner",
  city: "",
  location: "",
  session_date: "",
  price: 0,
  total_seats: 10,
  available_seats: 10,
  host_name: "",
  status: "Active",
};

function AdminDashboard() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState(emptySession);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    track: "All",
    level: "All",
    city: "All",
    status: "All",
  });

  useEffect(() => {
    loadEvents();
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

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function startEdit(session) {
    setEditingId(session.id);
    setForm({
      ...session,
      price: Number(session.price),
      total_seats: Number(session.total_seats),
      available_seats: Number(session.available_seats),
    });
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptySession);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      price: Number(form.price),
      total_seats: Number(form.total_seats),
      available_seats: Number(form.available_seats),
    };

    try {
      if (editingId) {
        await api.updateSession(editingId, payload);
        showToast({
          type: "success",
          message: "Event updated successfully.",
        });
      } else {
        await api.createSession(payload);
        showToast({
          type: "success",
          message: "Event created successfully.",
        });
      }
      resetForm();
      await loadEvents();
    } catch (submitError) {
      setError(submitError.message);
      showToast({
        type: "error",
        message: submitError.message,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(sessionId) {
    try {
      await api.deleteSession(sessionId);
      if (editingId === sessionId) {
        resetForm();
      }
      await loadEvents();
      showToast({
        type: "success",
        message: "Event deleted successfully.",
      });
    } catch (deleteError) {
      setError(deleteError.message);
      showToast({
        type: "error",
        message: deleteError.message,
      });
    }
  }

  const filterOptions = useMemo(() => {
    const tracks = ["All", ...new Set(sessions.map((session) => session.track))];
    const levels = ["All", ...new Set(sessions.map((session) => session.level))];
    const cities = ["All", ...new Set(sessions.map((session) => session.city))];
    const statuses = ["All", ...new Set(sessions.map((session) => session.status))];
    return { tracks, levels, cities, statuses };
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    const searchValue = filters.search.trim().toLowerCase();
    return sessions.filter((session) => {
      const matchesSearch =
        !searchValue ||
        session.title.toLowerCase().includes(searchValue) ||
        session.description.toLowerCase().includes(searchValue);
      const matchesTrack = filters.track === "All" || session.track === filters.track;
      const matchesLevel = filters.level === "All" || session.level === filters.level;
      const matchesCity = filters.city === "All" || session.city === filters.city;
      const matchesStatus = filters.status === "All" || session.status === filters.status;

      return matchesSearch && matchesTrack && matchesLevel && matchesCity && matchesStatus;
    });
  }, [filters, sessions]);

  return (
    <section className="admin-layout">
      <article className="details-card">
        <div className="page-heading compact">
          <div>
            <p className="eyebrow">Admin tools</p>
            <h1>{editingId ? "Edit Event" : "Create Event"}</h1>
            <p className="admin-note">Demo admin access - no role validation enabled</p>
          </div>
          {editingId ? (
            <button className="ghost-button" onClick={resetForm}>
              Clear form
            </button>
          ) : null}
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            Event title
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              required
            />
          </label>
          <label>
            Track
            <input
              type="text"
              value={form.track}
              onChange={(event) => updateForm("track", event.target.value)}
              required
            />
          </label>
          <label className="full-width">
            Description
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => updateForm("description", event.target.value)}
              required
            />
          </label>
          <label>
            Level
            <select value={form.level} onChange={(event) => updateForm("level", event.target.value)}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>All Levels</option>
            </select>
          </label>
          <label>
            City
            <input
              type="text"
              value={form.city}
              onChange={(event) => updateForm("city", event.target.value)}
              required
            />
          </label>
          <label>
            Location
            <input
              type="text"
              value={form.location}
              onChange={(event) => updateForm("location", event.target.value)}
              required
            />
          </label>
          <label>
            Event date
            <input
              type="text"
              placeholder="2026-08-14 18:00"
              value={form.session_date}
              onChange={(event) => updateForm("session_date", event.target.value)}
              required
            />
          </label>
          <label>
            Host name
            <input
              type="text"
              value={form.host_name}
              onChange={(event) => updateForm("host_name", event.target.value)}
              required
            />
          </label>
          <label>
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => updateForm("price", event.target.value)}
              required
            />
          </label>
          <label>
            Total seats
            <input
              type="number"
              min="0"
              value={form.total_seats}
              onChange={(event) => updateForm("total_seats", event.target.value)}
              required
            />
          </label>
          <label>
            Available seats
            <input
              type="number"
              min="0"
              value={form.available_seats}
              onChange={(event) => updateForm("available_seats", event.target.value)}
              required
            />
          </label>
          <label>
            Event status
            <select
              value={form.status}
              onChange={(event) => updateForm("status", event.target.value)}
            >
              <option>Active</option>
              <option>Full</option>
              <option>Cancelled</option>
            </select>
          </label>
          {error ? <p className="error-banner full-width">{error}</p> : null}
          <button type="submit" className="button-link button-reset" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Save Event" : "Create Event"}
          </button>
        </form>
      </article>

      <article className="details-card">
        <div className="page-heading compact">
          <div>
            <p className="eyebrow">Current events</p>
            <h2>Manage events</h2>
          </div>
          <button className="ghost-button" onClick={loadEvents}>
            Refresh
          </button>
        </div>

        <div className="filter-bar admin-filter-bar">
          <input
            type="search"
            placeholder="Search by title or description"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
          />
          <select value={filters.track} onChange={(event) => updateFilter("track", event.target.value)}>
            {filterOptions.tracks.map((track) => (
              <option key={track} value={track}>
                {track}
              </option>
            ))}
          </select>
          <select value={filters.level} onChange={(event) => updateFilter("level", event.target.value)}>
            {filterOptions.levels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <select value={filters.city} onChange={(event) => updateFilter("city", event.target.value)}>
            {filterOptions.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            {filterOptions.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {loading ? <p>Loading events...</p> : null}

        {!loading && !filteredSessions.length ? (
          <EmptyState
            compact
            title="No events found"
            message="Try broadening the filters or clearing the search to see more events."
          />
        ) : null}

        <div className="admin-session-list">
          {filteredSessions.map((session) => (
            <div key={session.id} className="admin-session-row">
              <div className="admin-session-copy">
                <div className="admin-session-heading">
                  <h3>{session.title}</h3>
                  <StatusBadge status={session.status} />
                </div>
                <p>
                  {session.city} · {session.session_date} · {session.available_seats} seats left
                </p>
                <div className="admin-chip-row">
                  <span className="track-pill">{session.track}</span>
                  <span className="meta-chip">{session.level}</span>
                </div>
              </div>
              <div className="admin-row-actions">
                <button className="ghost-button" onClick={() => startEdit(session)}>
                  Edit Event
                </button>
                <button className="ghost-button danger" onClick={() => handleDelete(session.id)}>
                  Delete Event
                </button>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export default AdminDashboard;
