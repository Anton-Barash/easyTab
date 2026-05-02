# easyTab - Build Instructions

## Desktop (Windows) Build

### Prerequisites
- Node.js 18+ installed
- Windows 10/11

### Build Steps

1. Install dependencies:
```bash
npm install
```

2. Build the web application:
```bash
npm run build
```

3. Package for Windows:
```bash
npm run electron:build:win
```

The executable will be created in the `release` folder:
- `easyTab-Setup-x.x.x.exe` - Installer
- `easyTab-x.x.x.exe` - Portable version

---

## Mobile (Android) Build

### Prerequisites
- Node.js 18+ installed
- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK) 11+

### First Time Setup

1. Install dependencies:
```bash
npm install
```

2. Initialize Capacitor:
```bash
npm run android:init
```

3. Add Android platform:
```bash
npm run android:add
```

### Build Steps

1. Build the web application:
```bash
npm run build
```

2. Copy web assets to Android:
```bash
npm run android:copy
```

3. Build debug APK:
```bash
cd android && ./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Build Release APK

```bash
cd android && ./gradlew assembleRelease
```

The release APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

---

## Development Mode

### Web Development
```bash
npm run dev
```

### Desktop Development
```bash
npm run electron:dev
```

### Mobile Development (Android)
```bash
npm run dev
# In another terminal:
npm run android:copy
npx cap sync android
cd android && ./gradlew build
```

---

## File Structure

```
easyTab/
├── electron/
│   ├── main.cjs        # Electron main process
│   └── preload.cjs     # Preload script for IPC
├── src/
│   ├── utils/
│   │   └── fileSystemAdapter.js  # Cross-platform file system
│   └── ...
├── capacitor.config.ts # Capacitor configuration
├── package.json       # Build scripts and dependencies
└── release/           # Built executables (Windows)
```

---

## Capacitor Plugins

The following plugins are installed for mobile file access:
- `@capacitor/filesystem` - Read/write files
- `@capacitor/app` - App lifecycle
- `@capacitor/motion` - Device motion
- `@capacitor-community/file-opener` - Open files

---

## Troubleshooting

### Android: Permission Denied
Ensure the app has the correct permissions in `android/app/src/main/AndroidManifest.xml`.

### Android: APK Not Installing
Enable "Install from unknown sources" in device settings.

### Electron: Module Not Found
Run `npm install` to ensure all dependencies are installed.
