# Social Media Application (Node.js · Express · MongoDB)

[![CI](https://github.com/AhmedElhawary129/socialMediaApp/actions/workflows/ci.yml/badge.svg)](https://github.com/AhmedElhawary129/socialMediaApp/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/Node-22%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-ready REST backend for a **social media** platform built with **Express (ES Modules)** and **MongoDB (Mongoose)**.  
Authentication uses **JWT** (access/refresh). File uploads can be handled locally (Multer) or via **Cloudinary**. Email flows supported via **Nodemailer**.

> **Node.js 22+ · Port 3000 · MIT License · CI enabled**

---

## Features

- **Core**: users, authentication (access/refresh), posts, comments, likes, follow system.
- **Media**: Multer (disk) with optional **Cloudinary** integration.
- **Security**: hashing (**bcrypt**), token helpers, environment isolation.
- **Email**: Nodemailer helpers (verification / unfreeze / notifications).
- **OAuth**: Google OAuth ready via `CLIENT_ID` (optional).
- **CI**: GitHub Actions (Node 22, install, optional build, non-blocking lint & tests).

---

## Tech Stack

- **Runtime**: Node.js (v22+)
- **Framework**: Express (ESM)
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT (access/refresh)
- **Uploads/Media**: Multer, Cloudinary
- **Email**: Nodemailer

---

## Project Structure

```
socialMediaApp/
├─ README.md
├─ LICENSE
├─ .github/
│  └─ workflows/
│     └─ ci.yml
├─ index.js                 # app entry & bootstrap (Express server)
├─ config/
│  ├─ .env                  # real secrets (DO NOT COMMIT)
│  └─ .env.example          # safe example (placeholders) ← commit this
├─ src/
│  ├─ DB/
│  │  ├─ connectionDB.js
│  │  └─ models/            # user/post/comment/... models
│  ├─ middleware/           # auth, validation, multer, etc.
│  ├─ modules/              # users, posts, comments, follows...
│  ├─ service/              # sendEmail.js, cloudinary helpers...
│  └─ utils/                # tokens, encryption, errors, features...
└─ package.json
```

---

## Quick Start

```bash
# 1) Install dependencies
npm install

# 2) Create environment file (do NOT commit real secrets)
mkdir -p config
cp config/.env.example config/.env
# then fill real values in config/.env

# 3) Run in development
npm run dev        # Node 22 watch mode
# or
npm start          # nodemon (if configured)

# URLs
# REST Base:   http://localhost:3000
```

---

## Environment Variables

Use `config/.env.example` as your template and keep real secrets only in `config/.env`.  

```env
# -------- Server --------
PORT="3000"
MODE=

# -------- Database --------
URI_CONNECTION="mongodb://127.0.0.1:27017/socialApp"

# -------- JWT / Auth --------
SECRET_KEY="CHANGE_ME"
ACCESS_SIGNATURE_USER="CHANGE_ME"
ACCESS_SIGNATURE_ADMIN="CHANGE_ME"
REFRESH_SIGNATURE_USER="CHANGE_ME"
REFRESH_SIGNATURE_ADMIN="CHANGE_ME"
PREFIX_TOKEN_ADMIN=
PREFIX_TOKEN_USER=

# -------- Hashing --------
SALT_ROUNDS="12"

# -------- Email (Nodemailer) --------
EMAIL="your_email@example.com"
PASSWORD="your_app_password"

# -------- Google OAuth --------
CLIENT_ID="your_google_client_id"

# -------- Cloudinary --------
CLOUD_NAME="your_cloud_name"
API_KEY="your_cloud_api_key"
API_SECRET="your_cloud_api_secret"
```

**.gitignore**
Ensure `.gitignore` excludes real env files:
```gitignore
# Environment
config/.env
config/*.env
*.env
```

---

## Scripts

> Scripts are read from `package.json`. Example:

```json
{
  "scripts": {
    "start": "nodemon index.js",
    "dev": "node --watch index.js",
    "test": "echo "Error: no test specified" && exit 1"
  }
}
```

- `npm run dev` – local development (Node watch)
- `npm start` – development (nodemon)
- `npm test` – currently placeholder (non-blocking in CI)

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
