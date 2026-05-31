# Gatherly

Gatherly is an original full-stack workshop and community session reservation platform. People can browse upcoming sessions, view session details, reserve seats, and cancel reservations. Admins can create, edit, and delete sessions from a simple dashboard.

## Tech Stack

- Frontend: React + Vite
- Backend: FastAPI
- Database: SQLite
- Styling: custom CSS
- API communication: browser `fetch`

## Folder Structure

```text
gatherly-session-booking-app/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── requirements.txt
│   └── gatherly.db
├── frontend/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── api.js
│       ├── style.css
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Sessions.jsx
│       │   ├── SessionDetails.jsx
│       │   ├── MyReservations.jsx
│       │   └── AdminDashboard.jsx
│       └── components/
│           ├── Navbar.jsx
│           ├── SessionCard.jsx
│           └── ReservationCard.jsx
├── .gitignore
└── README.md
```

## How to Run Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend runs on `http://127.0.0.1:8000`.

## How to Run Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs on `http://127.0.0.1:5173`.

## Backend API List

- `GET /sessions`
- `GET /sessions/{session_id}`
- `POST /sessions`
- `PUT /sessions/{session_id}`
- `DELETE /sessions/{session_id}`
- `GET /reservations`
- `GET /reservations/{reservation_id}`
- `POST /reservations`
- `DELETE /reservations/{reservation_id}`

## Current Features

- Seeded SQLite database with 8 sample sessions
- Session browsing with search and client-side filters
- Session details page with seat reservation form
- Reservation creation with generated references such as `GTH-0001`
- Seat availability updates when reservations are created or cancelled
- Automatic session status handling for `Active`, `Full`, and `Cancelled`
- Reservation list with cancel action
- Admin dashboard for session create, edit, and delete flows
- Responsive card-based interface with a soft blue/green theme

## Future Improvements

- Add authentication and user-specific reservation history
- Add pagination and server-side filtering
- Add form validation improvements and date pickers
- Add automated tests and deployment workflows
