from __future__ import annotations

import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "gatherly.db"

SEED_SESSIONS = [
    {
        "title": "Creative Coding Jam",
        "description": "Build playful browser sketches and learn how artists structure rapid code experiments.",
        "track": "Technology",
        "level": "Beginner",
        "city": "Sydney",
        "location": "Harbour Lab Studio",
        "session_date": "2026-06-18 18:30",
        "price": 35.0,
        "total_seats": 24,
        "available_seats": 24,
        "host_name": "Mira Dawson",
        "status": "Active",
    },
    {
        "title": "Community Storytelling Circle",
        "description": "Practice facilitation methods for reflective storytelling and local memory sharing.",
        "track": "Community",
        "level": "All Levels",
        "city": "Melbourne",
        "location": "Laneway Commons",
        "session_date": "2026-06-21 14:00",
        "price": 18.0,
        "total_seats": 30,
        "available_seats": 16,
        "host_name": "Jonah Reed",
        "status": "Active",
    },
    {
        "title": "Design Sprint for Volunteers",
        "description": "Learn a lightweight sprint process for testing ideas for clubs, schools, and neighbourhood projects.",
        "track": "Design",
        "level": "Intermediate",
        "city": "Brisbane",
        "location": "Riverfront Hub",
        "session_date": "2026-06-24 10:00",
        "price": 42.0,
        "total_seats": 20,
        "available_seats": 12,
        "host_name": "Priya Coleman",
        "status": "Active",
    },
    {
        "title": "Urban Gardening Basics",
        "description": "A practical introduction to small-space food growing, composting, and seasonal planning.",
        "track": "Sustainability",
        "level": "Beginner",
        "city": "Perth",
        "location": "Greenblock Yard",
        "session_date": "2026-06-27 09:30",
        "price": 25.0,
        "total_seats": 18,
        "available_seats": 8,
        "host_name": "Elliot Marsh",
        "status": "Active",
    },
    {
        "title": "Facilitation for Difficult Conversations",
        "description": "Explore group agreements, active listening, and de-escalation tools for sensitive sessions.",
        "track": "Leadership",
        "level": "Advanced",
        "city": "Adelaide",
        "location": "North Terrace Rooms",
        "session_date": "2026-07-02 17:45",
        "price": 55.0,
        "total_seats": 16,
        "available_seats": 6,
        "host_name": "Amelia Hart",
        "status": "Active",
    },
    {
        "title": "Photography Walk for Beginners",
        "description": "Join a guided photo walk and learn composition, light, and storytelling with any camera.",
        "track": "Arts",
        "level": "Beginner",
        "city": "Sydney",
        "location": "Botanic Loop Gate",
        "session_date": "2026-07-05 08:00",
        "price": 20.0,
        "total_seats": 22,
        "available_seats": 10,
        "host_name": "Rosa Lin",
        "status": "Active",
    },
    {
        "title": "Neighbourhood Podcast Workshop",
        "description": "Record and shape short-form audio stories with simple interview and editing techniques.",
        "track": "Media",
        "level": "Intermediate",
        "city": "Canberra",
        "location": "Signal House",
        "session_date": "2026-07-08 13:00",
        "price": 48.0,
        "total_seats": 14,
        "available_seats": 0,
        "host_name": "Theo Morgan",
        "status": "Full",
    },
    {
        "title": "Mindful Movement Session",
        "description": "Reset after work with gentle guided movement, breathwork, and community reflection.",
        "track": "Wellbeing",
        "level": "All Levels",
        "city": "Hobart",
        "location": "Seacliff Hall",
        "session_date": "2026-07-11 18:15",
        "price": 15.0,
        "total_seats": 26,
        "available_seats": 26,
        "host_name": "Nina Flores",
        "status": "Active",
    },
]


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db() -> None:
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                track TEXT NOT NULL,
                level TEXT NOT NULL,
                city TEXT NOT NULL,
                location TEXT NOT NULL,
                session_date TEXT NOT NULL,
                price REAL NOT NULL CHECK(price >= 0),
                total_seats INTEGER NOT NULL CHECK(total_seats >= 0),
                available_seats INTEGER NOT NULL CHECK(available_seats >= 0),
                host_name TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('Active', 'Full', 'Cancelled'))
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS reservations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reservation_ref TEXT NOT NULL UNIQUE,
                session_id INTEGER NOT NULL,
                user_name TEXT NOT NULL,
                user_email TEXT NOT NULL,
                quantity INTEGER NOT NULL CHECK(quantity > 0),
                total_amount REAL NOT NULL CHECK(total_amount >= 0),
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
            )
            """
        )

        existing_count = connection.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]
        if existing_count == 0:
            connection.executemany(
                """
                INSERT INTO sessions (
                    title, description, track, level, city, location, session_date,
                    price, total_seats, available_seats, host_name, status
                ) VALUES (
                    :title, :description, :track, :level, :city, :location, :session_date,
                    :price, :total_seats, :available_seats, :host_name, :status
                )
                """,
                SEED_SESSIONS,
            )
        _sync_session_statuses(connection)
        connection.commit()


def _sync_session_statuses(connection: sqlite3.Connection) -> None:
    rows = connection.execute("SELECT id, available_seats, status FROM sessions").fetchall()
    for row in rows:
        next_status = "Full" if row["available_seats"] == 0 else row["status"]
        if row["status"] != "Cancelled" and next_status != row["status"]:
            connection.execute(
                "UPDATE sessions SET status = ? WHERE id = ?",
                (next_status, row["id"]),
            )
