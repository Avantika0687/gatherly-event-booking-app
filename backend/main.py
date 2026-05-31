from __future__ import annotations

import sqlite3
from datetime import datetime
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import get_connection, init_db

app = FastAPI(title="Gatherly API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SessionBase(BaseModel):
    title: str
    description: str
    track: str
    level: str
    city: str
    location: str
    session_date: str
    price: float = Field(ge=0)
    total_seats: int = Field(ge=0)
    available_seats: int = Field(ge=0)
    host_name: str
    status: Literal["Active", "Full", "Cancelled"] = "Active"


class SessionCreate(SessionBase):
    pass


class SessionUpdate(SessionBase):
    pass


class ReservationCreate(BaseModel):
    session_id: int
    user_name: str
    user_email: str
    quantity: int = Field(gt=0)


class ReservationResponse(BaseModel):
    id: int
    reservation_ref: str
    session_id: int
    user_name: str
    user_email: str
    quantity: int
    total_amount: float
    status: str
    created_at: str
    session_title: Optional[str] = None
    session_date: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None


def session_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "track": row["track"],
        "level": row["level"],
        "city": row["city"],
        "location": row["location"],
        "session_date": row["session_date"],
        "price": row["price"],
        "total_seats": row["total_seats"],
        "available_seats": row["available_seats"],
        "host_name": row["host_name"],
        "status": row["status"],
    }


def reservation_to_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "reservation_ref": row["reservation_ref"],
        "session_id": row["session_id"],
        "user_name": row["user_name"],
        "user_email": row["user_email"],
        "quantity": row["quantity"],
        "total_amount": row["total_amount"],
        "status": row["status"],
        "created_at": row["created_at"],
        "session_title": row["session_title"] if "session_title" in row.keys() else None,
        "session_date": row["session_date"] if "session_date" in row.keys() else None,
        "city": row["city"] if "city" in row.keys() else None,
        "location": row["location"] if "location" in row.keys() else None,
    }


def derive_session_status(available_seats: int, requested_status: str) -> str:
    if requested_status == "Cancelled":
        return "Cancelled"
    if available_seats == 0:
        return "Full"
    return "Active"


def get_session_or_404(connection: sqlite3.Connection, session_id: int) -> sqlite3.Row:
    session = connection.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


def get_reservation_or_404(connection: sqlite3.Connection, reservation_id: int) -> sqlite3.Row:
    reservation = connection.execute(
        """
        SELECT r.*, s.title AS session_title, s.session_date, s.city, s.location
        FROM reservations r
        JOIN sessions s ON s.id = r.session_id
        WHERE r.id = ?
        """,
        (reservation_id,),
    ).fetchone()
    if reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return reservation


def generate_reservation_ref(connection: sqlite3.Connection) -> str:
    row = connection.execute("SELECT COUNT(*) AS total FROM reservations").fetchone()
    next_number = row["total"] + 1
    return f"GTH-{next_number:04d}"


@app.on_event("startup")
def startup_event() -> None:
    init_db()


@app.get("/")
def root() -> dict:
    return {"message": "Gatherly backend is running"}


@app.get("/sessions")
def list_sessions() -> list[dict]:
    with get_connection() as connection:
        rows = connection.execute("SELECT * FROM sessions ORDER BY session_date ASC").fetchall()
        return [session_to_dict(row) for row in rows]


@app.get("/sessions/{session_id}")
def get_session(session_id: int) -> dict:
    with get_connection() as connection:
        row = get_session_or_404(connection, session_id)
        return session_to_dict(row)


@app.post("/sessions", status_code=201)
def create_session(payload: SessionCreate) -> dict:
    if payload.available_seats > payload.total_seats:
        raise HTTPException(status_code=400, detail="Available seats cannot exceed total seats")

    status = derive_session_status(payload.available_seats, payload.status)
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO sessions (
                title, description, track, level, city, location, session_date,
                price, total_seats, available_seats, host_name, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.title,
                payload.description,
                payload.track,
                payload.level,
                payload.city,
                payload.location,
                payload.session_date,
                payload.price,
                payload.total_seats,
                payload.available_seats,
                payload.host_name,
                status,
            ),
        )
        connection.commit()
        row = connection.execute("SELECT * FROM sessions WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return session_to_dict(row)


@app.put("/sessions/{session_id}")
def update_session(session_id: int, payload: SessionUpdate) -> dict:
    if payload.available_seats > payload.total_seats:
        raise HTTPException(status_code=400, detail="Available seats cannot exceed total seats")

    with get_connection() as connection:
        get_session_or_404(connection, session_id)
        status = derive_session_status(payload.available_seats, payload.status)
        connection.execute(
            """
            UPDATE sessions
            SET title = ?, description = ?, track = ?, level = ?, city = ?, location = ?,
                session_date = ?, price = ?, total_seats = ?, available_seats = ?, host_name = ?, status = ?
            WHERE id = ?
            """,
            (
                payload.title,
                payload.description,
                payload.track,
                payload.level,
                payload.city,
                payload.location,
                payload.session_date,
                payload.price,
                payload.total_seats,
                payload.available_seats,
                payload.host_name,
                status,
                session_id,
            ),
        )
        connection.commit()
        row = connection.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
        return session_to_dict(row)


@app.delete("/sessions/{session_id}")
def delete_session(session_id: int) -> dict:
    with get_connection() as connection:
        get_session_or_404(connection, session_id)
        connection.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        connection.commit()
        return {"message": "Session deleted successfully"}


@app.get("/reservations")
def list_reservations() -> list[ReservationResponse]:
    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT r.*, s.title AS session_title, s.session_date, s.city, s.location
            FROM reservations r
            JOIN sessions s ON s.id = r.session_id
            ORDER BY r.created_at DESC
            """
        ).fetchall()
        return [reservation_to_dict(row) for row in rows]


@app.get("/reservations/{reservation_id}")
def get_reservation(reservation_id: int) -> ReservationResponse:
    with get_connection() as connection:
        row = get_reservation_or_404(connection, reservation_id)
        return reservation_to_dict(row)


@app.post("/reservations", status_code=201)
def create_reservation(payload: ReservationCreate) -> ReservationResponse:
    with get_connection() as connection:
        session = get_session_or_404(connection, payload.session_id)
        if session["status"] == "Cancelled":
            raise HTTPException(status_code=400, detail="Cancelled sessions cannot be reserved")
        if payload.quantity > session["available_seats"]:
            raise HTTPException(status_code=400, detail="Requested seats exceed availability")

        remaining_seats = session["available_seats"] - payload.quantity
        next_status = derive_session_status(remaining_seats, session["status"])
        reservation_ref = generate_reservation_ref(connection)
        total_amount = round(payload.quantity * session["price"], 2)
        created_at = datetime.utcnow().isoformat(timespec="seconds")

        cursor = connection.execute(
            """
            INSERT INTO reservations (
                reservation_ref, session_id, user_name, user_email, quantity,
                total_amount, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                reservation_ref,
                payload.session_id,
                payload.user_name,
                payload.user_email,
                payload.quantity,
                total_amount,
                "Confirmed",
                created_at,
            ),
        )
        connection.execute(
            "UPDATE sessions SET available_seats = ?, status = ? WHERE id = ?",
            (remaining_seats, next_status, payload.session_id),
        )
        connection.commit()

        row = connection.execute(
            """
            SELECT r.*, s.title AS session_title, s.session_date, s.city, s.location
            FROM reservations r
            JOIN sessions s ON s.id = r.session_id
            WHERE r.id = ?
            """,
            (cursor.lastrowid,),
        ).fetchone()
        return reservation_to_dict(row)


@app.delete("/reservations/{reservation_id}")
def cancel_reservation(reservation_id: int) -> dict:
    with get_connection() as connection:
        reservation = connection.execute(
            "SELECT * FROM reservations WHERE id = ?",
            (reservation_id,),
        ).fetchone()
        if reservation is None:
            raise HTTPException(status_code=404, detail="Reservation not found")

        session = get_session_or_404(connection, reservation["session_id"])
        restored_available = min(
            session["total_seats"],
            session["available_seats"] + reservation["quantity"],
        )
        next_status = derive_session_status(restored_available, session["status"])
        connection.execute("DELETE FROM reservations WHERE id = ?", (reservation_id,))
        connection.execute(
            "UPDATE sessions SET available_seats = ?, status = ? WHERE id = ?",
            (restored_available, next_status, reservation["session_id"]),
        )
        connection.commit()
        return {"message": "Reservation cancelled successfully"}
