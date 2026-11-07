#!/bin/bash
# Real Ludo - 1-Click Android APK Build Script (Capacitor)

echo "=========================================="
echo "🎲 Real Ludo - Building Android APK"
echo "=========================================="

# 1. Build Vite web assets
echo "📦 Step 1: Building Web Assets (Vite)..."
npm run build

# 2. Capacitor Sync
echo "🔄 Step 2: Syncing Capacitor Android Project..."
npx cap sync android

# 3. Compile APK with Gradle
echo "🔨 Step 3: Compiling APK with Gradle..."
cd android || exit 1
if [ -f "./gradlew" ]; then
    chmod +x ./gradlew
    ./gradlew assembleDebug
else
    gradle assembleDebug
fi

echo "=========================================="
echo "✅ Build Complete! Your APK is located at:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
echo "=========================================="
