# Secure Storage Mobile

Expo-based React Native client for the Secure Storage Management System.

> **Assignment note:** The brief asks for React Native CLI. This app uses **Expo SDK 54**, which is still React Native and can produce Android/iOS builds (`npx expo run:android`). Mention Expo in your submission if needed.

## Features

- Login with Admin / Viewer routing
- Dashboard (Admin), Files, Folders, Users (Admin), Profile
- Upload with type/size validation and progress
- Preview / secure download
- Search, rename, move, delete with confirmations
- Bottom-tab navigation and field-level validation

## Setup

```bash
cd mobile
npm install
cp .env.example .env
```

Set `EXPO_PUBLIC_API_BASE_URL`:

| Target | Example |
|--------|---------|
| Physical phone | `http://192.168.x.x:5000/api` |
| Android emulator | `http://10.0.2.2:5000/api` |
| iOS simulator | `http://localhost:5000/api` |

```bash
npm start
```

Use **Expo Go** and connect with an `exp://YOUR_LAN_IP:PORT` URL (not `http://localhost`).

Press `s` in the terminal if it says “development build” so it switches to **Expo Go**.

### Android APK / native run

```bash
npx expo run:android
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | Expo (`--lan --go`) |
| `npm run android` | Native Android run |
| `npm test` | Jest |
| `npm run lint` | ESLint |
