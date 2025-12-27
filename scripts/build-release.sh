#!/bin/bash
# Build release APK/AAB for G88 app

set -e

echo "========================================="
echo "G88 Release Build Script"
echo "========================================="
echo ""

cd "$(dirname "$0")/.."

# Check if keystore is configured
if ! grep -q "^G88_RELEASE_STORE_FILE" android/gradle.properties 2>/dev/null; then
    echo "❌ ERROR: Release keystore not configured!"
    echo ""
    echo "Please run: ./scripts/generate-keystore.sh"
    echo "Then update android/gradle.properties with your keystore credentials."
    exit 1
fi

echo "Select build type:"
echo "1) AAB (Android App Bundle) - Required for Google Play Store"
echo "2) APK (for testing/distribution outside Play Store)"
echo "3) Both"
read -p "Enter choice (1-3): " choice

case $choice in
    1|3)
        echo ""
        echo "📦 Building AAB..."
        cd android
        ./gradlew clean
        ./gradlew bundleRelease

        if [ -f "app/build/outputs/bundle/release/app-release.aab" ]; then
            AAB_SIZE=$(du -h app/build/outputs/bundle/release/app-release.aab | cut -f1)
            echo "✅ AAB built successfully!"
            echo "📍 Location: android/app/build/outputs/bundle/release/app-release.aab"
            echo "📊 Size: $AAB_SIZE"
        else
            echo "❌ AAB build failed"
            exit 1
        fi

        if [ "$choice" != "3" ]; then
            break
        fi
        ;&
    2|3)
        echo ""
        echo "📦 Building APK..."
        cd android 2>/dev/null || true
        ./gradlew assembleRelease

        if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
            APK_SIZE=$(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)
            echo "✅ APK built successfully!"
            echo "📍 Location: android/app/build/outputs/apk/release/app-release.apk"
            echo "📊 Size: $APK_SIZE"
        else
            echo "❌ APK build failed"
            exit 1
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "✅ Build Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Test the release build on a physical device"
echo "2. Upload AAB to Google Play Console"
echo "3. Fill in store listing details"
echo ""
