# Social Media Application (Node.js + Express + MongoDB)

A production‑ready backend for a social media application built with **Node.js**, **Express**, **MongoDB (Mongoose)**, **Socket.IO**, and modern tooling. It provides user authentication, posts, comments, likes, media uploads (Cloudinary), real‑time chat, and robust validation/security by default.

[![CI](https://github.com/AhmedElhawary129/socialMediaApp/actions/workflows/ci.yml/badge.svg)](https://github.com/AhmedElhawary129/socialMediaApp/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/Node-22%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socketdotio&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Table of Contents
- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Run Locally](#run-locally)
  - [Build \& Run in Production](#build--run-in-production)
- [API Overview](#api-overview)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Posts](#posts)
  - [Comments](#comments)
  - [Chat \& Realtime](#chat--realtime)
  - [Pagination](#pagination)
  - [Error Format](#error-format)
- [Security \& Hardening](#security--hardening)
- [Conventions](#conventions)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [CI](#ci)
- [License](#license)

---

## Features
- **Authentication & Authorization**
  - Email/password sign‑up, sign‑in, email confirmation (OTP)
  - JWT based access/refresh tokens (separate signatures for user/admin roles)
  - Role‑based access control (user, admin, superAdmin)
- **User Profiles**
  - Profile, cover images (Cloudinary), profile sharing
  - Friend requests, add/remove friend, block/unblock
- **Content**
  - Posts with text + media attachments (images/videos)
  - Comments (and replies) with reactions/likes
  - Archive/freeze toggles for moderation workflows
- **Realtime Chat**
  - One‑to‑one chat via Socket.IO with online presence
  - Message delivery events and persistence in MongoDB
- **DX & Safety**
  - Validation with Joi and request schemas
  - Express rate‑limiting, CORS, and (optionally) Helmet + compression
  - Centralized error handling and consistent error shape
  - Utilities for Cloudinary, Nodemailer, token management, hashing

> _Note:_ GraphQL packages may be present in `package.json` for future use but are not currently used by this project.

---

## Architecture Overview
- **`index.js`**: App entrypoint; bootstraps Express server, connects Socket.IO, mounts routes, and global middlewares.
- **`src/app.controller.js`**: Application wiring — CORS, rate‑limit, JSON parsing, routes registration, fallback 404/error handlers.
- **Database (`src/DB/`)**:
  - Connection setup and shared DB services
  - Mongoose models for **User**, **Post**, **Comment**, **Chat**
  - Common enums and helpers
- **Middlewares (`src/middleware/`)**: Auth (JWT for HTTP and sockets), Multer upload handlers, validation (Joi), etc.
- **Modules (`src/modules/`)**: Feature‑oriented folders `users/`, `posts/`, `comments/`, `chat/` with controllers, services, and routes.
- **Utilities (`src/utils/`)**: Crypto, token, email, Cloudinary, pagination helpers, error classes.

---

## Tech Stack
- **Runtime**: Node.js (ESM)
- **Framework**: Express
- **Database**: MongoDB with Mongoose
- **Realtime**: Socket.IO
- **Auth**: JWT (access/refresh), bcrypt
- **Uploads**: Multer + Cloudinary
- **Email**: Nodemailer (Gmail App Password)
- **Validation**: Joi
- **Ops**: express‑rate‑limit, CORS, (optional) Helmet, compression

---

## Project Structure
```
socialMediaApp/
├─ index.js
├─ src/
│  ├─ app.controller.js
│  ├─ DB/
│  │  ├─ connection.js
│  │  ├─ models/
│  │  │  ├─ User.js
│  │  │  ├─ Post.js
│  │  │  ├─ Comment.js
│  │  │  └─ Chat.js
│  │  └─ enums.js
│  ├─ middleware/
│  │  ├─ auth.js
│  │  ├─ multer.js
│  │  └─ validation.js
│  ├─ modules/
│  │  ├─ users/
│  │  ├─ posts/
│  │  ├─ comments/
│  │  └─ chat/
│  └─ utils/
│     ├─ cloudinary.js
│     ├─ email.js
│     ├─ tokens.js
│     ├─ hash.js
│     ├─ paginate.js
│     └─ errors.js
└─ config/
   └─ .env
```

> The exact filenames may vary slightly; the structure above reflects the organization philosophy used by the project.

---

## Getting Started

### Prerequisites
- **Node.js**: v22.x or later
- **MongoDB**: 6.x or later (local or Atlas)
- A **Cloudinary** account (for media) and **Gmail App Password** (for email)

### Installation
```bash
# 1) Install dependencies
npm install

# 2) Copy env template and fill it
cp config/.env.example config/.env
# or create config/.env manually (see below)
```

### Environment Variables
Create `config/.env` with the following keys:

```dotenv
# Server
PORT=3000
MODE=DEV

# Database
URI_CONNECTION=mongodb://localhost:27017/socialApp

# Auth (token prefixes + signatures per role and token kind)
PREFIX_TOKEN_USER=user_prefix
PREFIX_TOKEN_ADMIN=admin_prefix
ACCESS_SIGNATURE_USER=change_me_access_user
REFRESH_SIGNATURE_USER=change_me_refresh_user
ACCESS_SIGNATURE_ADMIN=change_me_access_admin
REFRESH_SIGNATURE_ADMIN=change_me_refresh_admin

# Password/Encryption
SALT_ROUNDS=10
SECRET_KEY=change_me_aes_secret

# Cloudinary
CLOUD_NAME=
API_KEY=
API_SECRET=

# Email (Gmail w/ App Password)
EMAIL=you@example.com
PASSWORD=your_app_password

# OAuth (optional - Google)
CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

> Keep secrets out of version control. Use `.env` files only in development and a secure secret manager in production.

### Run Locally
```bash
# Development (auto‑reload)
npm run dev

# Production‑like start
npm run start
```
The API will be available at `http://localhost:3000/` (unless you change `PORT`).

### Build & Run in Production
- Set `MODE=PROD` (or remove noisy logs).
- Restrict CORS to trusted origins.
- Consider enabling `helmet` and `compression`:
  ```js
  import helmet from "helmet";
  import compression from "compression";
  app.use(helmet());
  app.use(compression());
  ```
- Run under a process manager (PM2, systemd, Docker) and configure health checks.
- Use **MongoDB Atlas** or a managed service with backups.

---

## API Overview

### Authentication
- **Access Token**: short‑lived; sent as `Authorization: <PREFIX_TOKEN_USER> <token>`
- **Refresh Token**: for rotation; stored server‑side/DB or safely by the client (depending on your strategy)
- **Roles**: `user`, `admin`, `superAdmin` (admin tokens use `PREFIX_TOKEN_ADMIN`)

Common endpoints (paths may vary slightly):
- `POST /users/signUp`
- `POST /users/signIn`
- `POST /users/confirmEmail`
- `POST /users/resendOTP`
- `POST /users/refreshToken`
- `POST /users/changePassword` (auth required)
- `PATCH /users/updateEmail` (auth required)
- `GET  /users/profile` (auth required)

### Users
- Upload profile/cover images: `POST /users/uploadProfileImage`, `POST /users/uploadCoverImage`
- Social graph: `POST /users/add/:userId`, `DELETE /users/remove/:userId`
- Moderation: `POST /users/blockUser/:userId`, `DELETE /users/unBlockUser/:userId`
- Admin: `PATCH /users/updateRole`

### Posts
- CRUD with media attachments:
  - `POST /posts` (multer + Cloudinary)
  - `GET  /posts/:id`
  - `PATCH /posts/:id`
  - `DELETE /posts/:id`
- Visibility flags: `archive`, `frozen`
- Listing endpoints (examples):
  - `GET /posts` (public feed / filters)
  - `GET /users/:userId/posts` (user feed)

### Comments
- Nested comments & replies:
  - `POST /posts/:refId/comments`
  - `PATCH /comments/:id`
  - `DELETE /comments/:id`
- Reactions/likes supported per comment (and per post if enabled)

### Chat & Realtime
- **REST**
  - `GET /chat/:userId` → returns chat (with populated messages)
- **Socket.IO events**
  - Client emits `registerAccount` with JWT in handshake → server maps `socket.id` to user
  - `sendMessage` → creates/updates chat; server emits `receiveMessage` to target user if online
  - `logout` / disconnect → cleans up online map

> For production, prefer room names = userId and emit with `io.to(targetUserId).emit('receiveMessage', payload)`.

### Pagination
- Query params: `page`, `limit`, `sort`
- Response shape (example):
```json
{
  "items": [/* documents */],
  "total": 123,
  "page": 2,
  "pages": 13
}
```

### Error Format
All errors use a consistent JSON shape:
```json
{
  "status": "error",
  "message": "Human‑readable message",
  "code": "OPTIONAL_ERROR_CODE",
  "details": {}
}
```
HTTP status codes reflect the error category (400/401/403/404/409/429/500).

---

## Security & Hardening
- **CORS**: In production, whitelist trusted origins only.
- **Rate Limiting**: Currently 50 requests/15min per IP at app level — adjust per route (Auth endpoints especially).
- **JWT**: Separate signatures per role and token type; enforce expiration and refresh token rotation.
- **Uploads**: Validate MIME types; prefer Cloudinary folders per user (`social/<userId>/...`).
- **Headers**: Enable `helmet()` to set secure headers.
- **Secrets**: Store secrets in a secret manager (not in `.env` in production).
- **Indexes**:
  - `User.email` unique
  - `Post.userId, Post.createdAt`
  - `Comment.refId, Comment.onModel, Comment.createdAt`
  - Composite on `Chat.mainUser + Chat.subParticipant`

---

## Conventions
- **Code Style**: JavaScript (ESM). Recommended to use ESLint + Prettier (optional).
- **Commit Messages**: Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, etc.).
- **HTTP**: Use nouns and plural collection names; prefer PATCH for partial updates.
- **Validation**: All inputs validated with Joi schemas in module validators.

---

## Testing
- Unit tests for utilities and middlewares (Jest recommended).
- Integration tests for core flows (auth → posts → comments → chat).

_Run tests (example):_
```bash
npm run test
```

---

## Troubleshooting
- **Cannot connect to MongoDB**: Check `URI_CONNECTION` and that MongoDB is running; ensure network access for Atlas.
- **Invalid token**: Ensure correct prefix is used (`Bearer` vs `Admin`), token not expired, and signatures match env.
- **Uploads failing**: Verify Cloudinary credentials and allowed MIME types in upload middleware.
- **Emails not sent**: Use Gmail **App Password**; verify `EMAIL` and `PASSWORD` envs.

---

## Roadmap
- [ ] Full text search for posts & users
- [ ] Notifications center (websocket) for likes/comments/friend requests
- [ ] Groups & group chats
- [ ] Admin dashboard endpoints & analytics
- [ ] E2E tests and load testing (k6/Artillery)

---

## CI

GitHub Actions workflow lives at **`.github/workflows/ci.yml`** and does:

- Node **22** setup, `npm ci`
- **Build** (skips gracefully if no `build` script exists)
- **Lint (non-blocking)**
- **Test (non-blocking)**

The CI badge at the top reflects the latest run status.

---

## License

Released under the **MIT License**. See [LICENSE](LICENSE) for details.
