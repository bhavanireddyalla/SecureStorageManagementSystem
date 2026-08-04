# Secure Storage Management System

End-to-end storage platform with a shared Node.js backend, React web app, and **React Native CLI** Android app (not Expo).

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js + Express, JWT, bcrypt, Multer, AWS S3 |
| Database | Microsoft SQL Server |
| Web | React 19 + Vite + Tailwind |
| Mobile | React Native CLI 0.76 (Android) |

## Project structure

```text
SecureStorageManagementSystem/
  Backend/     Express API + S3 + MSSQL
  web/         React website
  mobile/      React Native CLI Android app
  docs/        Notes / Postman
```

## Database design (summary)

- **Users** — UserId, Name, Email, PasswordHash, Role (`admin` | `viewer`)
- **Folders** — FolderId, FolderName, ParentFolderId (nested folders), CreatedBy
- **Files** — FileId, FolderId, OriginalName, StoredName/S3 key, FileType, FileSize, UploadedBy
- File bytes live in **private Amazon S3**; SQL Server stores metadata only
- Downloads/previews use **JWT + time-limited S3 presigned URLs**

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

### Mobile (`mobile/src/constants/config.ts`)

```ts
// Physical device (same Wi-Fi as your PC):
export const API_BASE_URL = 'http://YOUR_LAN_IP:5000/api';

// Android emulator:
// export const API_BASE_URL = 'http://10.0.2.2:5000/api';
```

Do **not** commit real secrets.

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

### 3. Mobile (React Native CLI)

```bash
cd mobile
npm install
# set API URL in src/constants/config.ts
npm start
```

In another terminal:

```bash
cd mobile
npm run android
```

### Release APK (Windows)

```bash
cd mobile\android
.\gradlew.bat assembleRelease
```

APK output:

`mobile\android\app\build\outputs\apk\release\app-release.apk`

## Roles

| Role | Capabilities |
|------|----------------|
| Admin | Folders/files CRUD, upload, user management, dashboard |
| Viewer | Browse, search, preview, download only |

Role checks are enforced on the **backend**. One login page; UI routes by role after auth.

## Submission links


| GitHub | https://github.com/bhavanireddyalla/SecureStorageManagementSystem |
| Android APK (React Native CLI) | https://drive.google.com/file/d/18bgAfEIZf1VNGlM34fxdp1pRYcP1qkPs/view?usp=sharing |
| APK direct download | https://drive.google.com/uc?export=download&id=18bgAfEIZf1VNGlM34fxdp1pRYcP1qkPs |
| Web app | Optional — run locally from `web/` |
| Backend API | Optional — run locally from `Backend/` |

## Demo credentials


**Admin ----- `bhavs@gmail.com` password: `Bhavs@123` 
Viewer ---- `testviewer@gmail.com`password: `Test@123` 
**
## Security notes

- Passwords hashed with bcrypt
- JWT on protected routes
- Admin-only mutating APIs
- Public self-registration disabled; create users via Admin User Management
- Files are not publicly accessible; access requires a valid session
