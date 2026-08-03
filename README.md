# Secure Storage Management System

End-to-end storage platform with a shared Node.js backend, React web app, and React Native (Expo) mobile app.

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express, JWT, bcrypt, Multer, AWS S3 |
| Database | Microsoft SQL Server |
| Web | React 19 + Vite + Tailwind |
| Mobile | React Native via **Expo SDK 54** (not bare RN CLI) |

### Why Expo for mobile?

The assignment mentions React Native CLI. This project uses **Expo**, which is still React Native and supports Android/iOS with the same JS APIs. Native `android/` and `ios/` folders are available via Expo prebuild (`npx expo run:android`). Document this choice in your submission email if reviewers expect bare CLI.

## Project structure

```text
SecureStorageManagementSystem/
  Backend/     Express API + S3 + MSSQL
  web/         React website
  mobile/      Expo React Native app
  docs/        Postman collection
```

## Database design (summary)

- **Users** — UserId, Name, Email, PasswordHash, Role (`admin` | `viewer`)
- **Folders** — FolderId, FolderName, ParentFolderId (nested folders), CreatedBy
- **Files** — FileId, FolderId, OriginalName, StoredName/S3 key, FileType, FileSize, UploadedBy
- Private objects live in **Amazon S3**; metadata only is stored in SQL Server
- Downloads/previews use **time-limited presigned URLs** (or authenticated stream endpoints)

## Environment variables

### Backend (`Backend/.env`)

```env
PORT=5000
JWT_SECRET=your-secret
JWT_EXPIRES_IN=1d
DB_USER=...
DB_PASSWORD=...
DB_SERVER=...
DB_DATABASE=SecureStorageDB
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
AWS_BUCKET_NAME=...
```

### Web (`web/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Mobile (`mobile/.env`)

```env
# Physical device (same Wi-Fi as your PC):
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LAN_IP:5000/api

# Android emulator:
# EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000/api
```

Do **not** commit real secrets. Use the `.env.example` files as templates.

## Setup

### 1. Backend

```bash
cd Backend
npm install
# configure .env
npm start
```

### 2. Web

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

### 3. Mobile

```bash
cd mobile
npm install
cp .env.example .env
# set EXPO_PUBLIC_API_BASE_URL for your device
npm start
```

Open with Expo Go, or build Android with:

```bash
npx expo run:android
```

## Roles

| Role | Capabilities |
|------|----------------|
| Admin | Folders/files CRUD, upload, user management, dashboard |
| Viewer | Browse, search, preview, download only |

Role checks are enforced on the **backend**. Login is shared; UI routes by role after auth.

## Security notes

- Passwords hashed with bcrypt
- JWT on protected routes
- Admin-only mutating APIs
- Public self-registration is disabled (`POST /api/auth/register` requires Admin)
- Create accounts via Admin **User Management** (`POST /api/users`)
- Files are not publicly accessible; access requires a valid session


