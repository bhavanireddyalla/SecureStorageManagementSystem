# Secure Storage — Android (React Native CLI)

React Native **CLI** Android app sharing the same backend as the web app.

This is **not** an Expo project.

## Stack

- React Native 0.76 (CLI)
- React Navigation (stack + bottom tabs)
- Axios + AsyncStorage
- `react-native-document-picker` for uploads

## Setup

```bash
cd mobile
npm install
```

Set API URL in `src/constants/config.ts`:

- Physical device: `http://YOUR_LAN_IP:5000/api`
- Emulator: `http://10.0.2.2:5000/api`

```bash
npm start
npm run android
```

## Release APK

```bash
cd android
.\gradlew.bat assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`
