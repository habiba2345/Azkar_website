<div align="center">

# 🌙 أذكاري · Adhkar

**منصّة أذكار إسلامية تفاعلية — اقرأ، سبّح، اكسب نقاطًا، واقرأ القرآن في مكان واحد.**
*An interactive Islamic remembrance (Adhkar) platform with a tasbih counter, a points-and-rewards system, personal adhkar, and a built-in Quran reader.*

![Django](https://img.shields.io/badge/Django-4.2-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.16-A30000)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Auth](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
![UI](https://img.shields.io/badge/UI-Arabic%20%C2%B7%20RTL-8B1E3F)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Data Model](#data-model)
- [Permissions](#permissions)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Production Checklist](#production-checklist)
- [Roadmap](#roadmap)

---

## Overview

**أذكاري** هو تطبيق ويب كامل (Full-Stack) يساعد المسلم على المداومة على الأذكار اليومية. الأذكار منظّمة في أقسام (الصباح، المساء، النوم…)، ولكل ذكر عدّاد تسبيح، وعند إتمامه يكسب المستخدم نقاطًا تفتح له جوائز. كما يقدر كل مستخدم أن يكتب أذكاره الخاصة في قسم **«ذكر حر»**، ويقرأ القرآن الكريم من صفحة مخصّصة.

**Adhkari** is a full-stack web app built around daily remembrance habits. Adhkar are organised into categories, every dhikr has a tasbih counter, completing one earns points, and points unlock rewards. Users can also write and manage their own adhkar in a dedicated **"Free Dhikr"** category and read the Quran from a dedicated page.

The interface is fully Arabic (RTL) and uses the *Tajawal* and *Amiri* typefaces.

---

## Features

### For every visitor
- **Browse and search** adhkar and categories without signing in.
- **Tasbih counter** on every dhikr: counts up to the dhikr's target and stops exactly there, with a reset button.
- **Quran reader**: list of all 114 surahs and full-surah reading in Uthmani script.

### For signed-in users
- **Registration and login** with JWT (access + refresh tokens).
- **Complete a dhikr** once per day to earn its points; a duplicate completion on the same day is rejected.
- **Persistent counter**: the tasbih progress is saved per user and per dhikr, so it is restored when the user comes back.
- **Free Dhikr**: write your own dhikr (title + text only), edit it, or delete it. It is placed in the *«ذكر حر»* category automatically and its target is set by the system.
- **Rewards**: rewards unlock automatically as total points cross each reward's threshold.
- **Reminders**: create, enable/disable, and delete daily reminder times.
- **Profile**: username, email, total points, and unlocked rewards.

### For administrators
- Full control over categories, official adhkar, and rewards (through the API and Django admin).
- Can edit or remove any dhikr, including users' free adhkar.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Django 4.2, Django REST Framework 3.16 |
| Auth | Djoser + SimpleJWT (Bearer tokens) |
| Database | SQLite (development) |
| External data | [alquran.cloud](https://alquran.cloud) API, cached server-side |
| Frontend | React 19, React Router 7, Axios |
| Tooling | Vite 8, oxlint |

---

## Architecture

```
┌──────────────────────┐        HTTPS / JSON         ┌─────────────────────────────┐
│   React + Vite SPA   │  ───── Bearer JWT ───────▶  │   Django REST Framework     │
│  (adhkar-frontend)   │  ◀────────────────────────  │        (AdhkarApp)          │
└──────────────────────┘                             │                             │
                                                     │  adhkar/   categories+adhkar│
                                                     │  racking/  progress+reminders│
                                                     │  users/    accounts+rewards │
                                                     │  quran/    proxy + cache  ──┼──▶ alquran.cloud
                                                     └──────────────┬──────────────┘
                                                                    │
                                                              ┌─────▼─────┐
                                                              │  SQLite   │
                                                              └───────────┘
```

**Points flow:** `POST /racking/userprogress/` → a `post_save` signal adds the earned points to the user's total → any reward whose threshold is now reached is unlocked automatically.

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Backend

```bash
cd AdhkarApp
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # optional: access to /admin/
python manage.py runserver
```

The API is served at `http://127.0.0.1:8000`, and the admin panel at `/admin/`.
The migrations create the **«ذكر حر»** category automatically.

### 2. Frontend

```bash
cd "adhkar-frontend (1)"
npm install
cp .env.example .env
npm run dev
```

Build for production with `npm run build` (output in `dist/`).

---

## Configuration

| Variable | Where | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | `adhkar-frontend (1)/.env` | `http://127.0.0.1:8000` | Base URL of the backend (no trailing slash) |

Notable backend settings (`AdhkarApp/AdhkarApp/settings.py`):

| Setting | Value |
|---|---|
| Access token lifetime | 1 day |
| Refresh token lifetime | 7 days |
| Auth header | `Authorization: Bearer <access>` |
| Login field | `username` |
| Password confirmation on sign-up | required (`re_password`) |

---

## Data Model

```
User ───────────────┐
 (username, email,  │ 1..*
  total_points)     ├────────▶ UserProgress ◀──────── Adhkar ◀──── Category
                    │           (completed_at,         (title,       (name,
                    │            points_earned)         content,      description)
                    │ 1..*                              points_value,
                    ├────────▶ Notification             owner → User, nullable)
                    │           (reminder_time,
                    │            is_enabled)
                    │ 1..*
                    └────────▶ UserReward ◀──────── Reward
                                (unlocked_at)         (title, description,
                                                       points_threshold, image)
```

- `Adhkar.owner` is **null** for official adhkar and set to the author for free adhkar.
- `Adhkar.points_value` is both the points awarded on completion and the tasbih counter's target.

---

## Permissions

| Action | Visitor | User | Admin |
|---|:---:|:---:|:---:|
| Read adhkar and categories | ✅ | ✅ | ✅ |
| Create a dhikr | ❌ | ✅ *(free category only)* | ✅ *(any category)* |
| Edit / delete a dhikr | ❌ | ✅ *(own only)* | ✅ *(any)* |
| Manage categories | ❌ | ❌ | ✅ |
| Complete a dhikr, reminders, profile | ❌ | ✅ | ✅ |

For regular users the server **ignores** any `category`, `owner`, or `points_value` sent in the request: the category is always *«ذكر حر»*, the owner is the requester, and the points are set by the system. Ownership checks are enforced server-side, not just hidden in the UI.

---

## API Reference

All request and response bodies are JSON. Protected routes require `Authorization: Bearer <access>`.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/users/` | Register (`username`, `email`, `password`, `re_password`) |
| `POST` | `/auth/jwt/create/` | Log in → `access` + `refresh` |
| `POST` | `/auth/jwt/refresh/` | Refresh the access token |

### Adhkar and categories

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/adhkar/adhkar/?search=` | Public | List adhkar (search by title or category name) |
| `POST` | `/adhkar/adhkar/` | User | Create a dhikr |
| `GET` | `/adhkar/adhkar/<id>/` | Public | Retrieve a dhikr |
| `PATCH` | `/adhkar/adhkar/<id>/` | Owner / Admin | Update a dhikr |
| `DELETE` | `/adhkar/adhkar/<id>/` | Owner / Admin | Delete a dhikr |
| `GET` | `/adhkar/categories/` | Public | List categories (with `adhkar_count`) |
| `POST` `PATCH` `DELETE` | `/adhkar/categories/…` | Admin | Manage categories |

Each dhikr includes `owner_username` and `is_owner` so the client knows when to show edit and delete controls.

**Example: create a free dhikr**

```http
POST /adhkar/adhkar/
Authorization: Bearer <access>

{ "title": "ذكر يومي", "content": "سبحان الله وبحمده" }
```

```json
{
  "id": 51,
  "category": 5,
  "title": "ذكر يومي",
  "content": "سبحان الله وبحمده",
  "points_value": 33,
  "owner": 12,
  "owner_username": "habiba99",
  "is_owner": true
}
```

### Quran

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/quran/surahs/` | All 114 surahs (names, ayah count, Meccan/Medinan) |
| `GET` | `/quran/surahs/<1–114>/` | Full surah text; optional `?edition=` |

Responses are cached for 24 hours. If the upstream service is unreachable the API returns `503` with an Arabic error message; an invalid surah number returns `400`.

### Progress, reminders, and profile

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/racking/userprogress/` | Mark a dhikr as completed today (`{ "adhkar": <id> }`) |
| `GET` `POST` | `/racking/notifications/` | List / create reminders |
| `GET` `PATCH` `DELETE` | `/racking/notifications/<id>/` | Manage a reminder |
| `GET` | `/users/userprofile/` | Current user's profile and points |
| `GET` | `/users/MyReward/` | Rewards unlocked by the current user |
| `GET` `POST` | `/users/reward/` | List rewards (create: admin) |

---

## Project Structure

```
AdhkarApp/
├── README.md
├── AdhkarApp/                      # Django backend
│   ├── AdhkarApp/                  # settings, root URLs
│   ├── adhkar/                     # categories, adhkar, ownership & permissions
│   ├── racking/                    # daily progress, reminders, points signal
│   ├── users/                      # custom user, rewards
│   ├── quran/                      # cached proxy to alquran.cloud (no models)
│   ├── media/                      # uploaded reward images
│   └── manage.py
└── adhkar-frontend (1)/            # React frontend
    └── src/
        ├── api/                    # adhkar, quran, auth, racking, rewards clients
        ├── components/             # AdhkarCard, AddDhikrForm, Navbar, …
        ├── context/                # AuthContext (JWT session)
        ├── hooks/                  # useAuth
        ├── pages/                  # Home, Categories, Adhkar, Quran, Rewards,
        │                           # Reminders, Profile, Login, Register
        └── styles/                 # global.css (design tokens, RTL)
```

---

## Design Decisions

- **Server-enforced ownership.** Users can only change their own adhkar; the category, owner, and points of a user-created dhikr are decided by the server, so they cannot be spoofed from the client.
- **Quran through a proxy.** The frontend never calls a third-party API directly. The backend caches responses for a day, reduces latency and upstream load, and lets the data source change without touching the client.
- **Once-a-day completion.** Points can be earned once per dhikr per day, which keeps the points system meaningful.
- **Client-side counter persistence.** The tasbih count is stored in `localStorage`, keyed by username and dhikr id. This keeps the interaction instant and requires no extra API calls.
- **Idempotent bootstrap.** A data migration creates the *«ذكر حر»* category, and the API recreates it on demand if it is ever deleted.

---

## Production Checklist

The defaults are tuned for local development. Before deploying:

- [ ] Set `DEBUG = False` and fill in `ALLOWED_HOSTS`.
- [ ] Move `SECRET_KEY` to an environment variable.
- [ ] Replace `CORS_ALLOW_ALL_ORIGINS = True` with an explicit `CORS_ALLOWED_ORIGINS` list.
- [ ] Switch from SQLite to PostgreSQL (or similar).
- [ ] Serve static and media files from a web server or object storage.
- [ ] Configure a shared cache (e.g. Redis) so the Quran cache works across workers.
- [ ] Build the frontend (`npm run build`) and set `VITE_API_URL` to the production API.

---

## Roadmap

- [ ] Sync the tasbih counter to the server so it follows the user across devices.
- [ ] Exclude personal adhkar from points to prevent point farming.
- [ ] Audio recitation and translation editions for the Quran reader.
- [ ] Bookmarks and "continue reading" for the Quran.
- [ ] Push / email delivery for reminders.
- [ ] Automated test suite and CI.
