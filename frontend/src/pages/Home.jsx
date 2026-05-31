import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import EmptyState from "../components/EmptyState";
import SessionCard from "../components/SessionCard";
import TrackCard from "../components/TrackCard";
import { getSavedEventIds } from "../components/FavoriteButton";
import { useToast } from "../context/ToastContext";

const featuredTracks = [
  {
    name: "Tech",
    description: "Hands-on product demos, emerging tools, and collaborative build nights.",
    accentClass: "tech",
    symbol: "</>",
  },
  {
    name: "Creative",
    description: "Story circles, design labs, and maker events with room to experiment.",
    accentClass: "creative",
    symbol: "✦",
  },
  {
    name: "Wellness",
    description: "Gentle movement, mindful routines, and events that reset your week.",
    accentClass: "wellness",
    symbol: "☼",
  },
  {
    name: "Career",
    description: "Mentor meetups, portfolio reviews, and growth-focused community events.",
    accentClass: "career",
    symbol: "↑",
  },
  {
    name: "Community",
    description: "Neighbourhood gatherings and shared learning experiences for everyone.",
    accentClass: "community",
    symbol: "◎",
  },
];

function Home() {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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
    try {
      const data = await api.getSessions();
      setEvents(data);
    } catch (loadError) {
      showToast({
        type: "error",
        message: loadError.message,
      });
    } finally {
      setLoading(false);
    }
  }

  const featuredEvents = useMemo(() => {
    return [...events]
      .sort((first, second) => {
        const firstPriority = first.status === "Active" ? 0 : 1;
        const secondPriority = second.status === "Active" ? 0 : 1;
        if (firstPriority !== secondPriority) {
          return firstPriority - secondPriority;
        }
        return String(first.session_date).localeCompare(String(second.session_date));
      })
      .slice(0, 4);
  }, [events]);

  const savedEvents = useMemo(() => {
    return events.filter((event) => savedEventIds.includes(event.id)).slice(0, 3);
  }, [events, savedEventIds]);

  return (
    <div className="home-stack">
      <section className="hero-home">
        <div className="hero-home-overlay" />
        <div className="hero-home-content">
          <p className="eyebrow">Gatherly event booking</p>
          <h1>Discover events that bring people together</h1>
          <p>
            Browse workshops, creative circles, wellness events, and community learning
            experiences.
          </p>
          <div className="hero-actions">
            <Link to="/sessions" className="button-link">
              Explore Events
            </Link>
            <Link to="/signup" className="ghost-button hero-ghost">
              Sign Up
            </Link>
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Featured events</p>
            <h2>Pick your next experience</h2>
          </div>
          <Link to="/sessions" className="ghost-button">
            Browse all events
          </Link>
        </div>
        {loading ? <p>Loading featured events...</p> : null}
        {!loading && !featuredEvents.length ? (
          <EmptyState
            title="No featured events yet"
            message="New events will appear here once they are available."
            actionTo="/sessions"
            actionLabel="Explore events"
          />
        ) : (
          <div className="card-grid">
            {featuredEvents.map((event) => (
              <SessionCard key={event.id} session={event} />
            ))}
          </div>
        )}
      </section>

      <section className="track-showcase">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Browse by category</p>
            <h2>Five colorful event tracks for every kind of guest</h2>
          </div>
        </div>
        <div className="track-grid">
          {featuredTracks.map((track) => (
            <TrackCard key={track.name} track={track} />
          ))}
        </div>
      </section>

      <section className="feature-ribbon">
        <article className="feature-panel">
          <p className="eyebrow">About Gatherly</p>
          <h2>Built for real-world community events</h2>
          <p>
            Gatherly is a lightweight event booking platform for workshops, creative meetups,
            wellness gatherings, and learning-focused community programs.
          </p>
        </article>
        <article className="feature-panel">
          <p className="eyebrow">Who it helps</p>
          <h2>Made for hosts and attendees</h2>
          <p>
            Organisers can manage event listings while guests can quickly discover, save, and
            reserve the events they want to attend.
          </p>
        </article>
        <article className="feature-panel">
          <p className="eyebrow">Why it matters</p>
          <h2>Better visibility for local learning</h2>
          <p>
            Clear event details, seat tracking, and simple reservations make it easier for
            communities to fill rooms and keep learning accessible.
          </p>
        </article>
      </section>

      {savedEvents.length ? (
        <section className="featured-section">
          <div className="page-heading">
            <div>
              <p className="eyebrow">Saved events</p>
              <h2>Quick access to your favourites</h2>
            </div>
          </div>
          <div className="card-grid">
            {savedEvents.map((event) => (
              <SessionCard key={`saved-${event.id}`} session={event} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="support-panel">
        <div>
          <p className="eyebrow">Contact and support</p>
          <h2>Need help with the demo?</h2>
        </div>
        <div className="support-copy">
          <p>support@gatherly.demo</p>
          <span>For demo support only</span>
        </div>
      </section>
    </div>
  );
}

export default Home;
