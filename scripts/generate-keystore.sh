#!/bin/bash
# Script to generate Android release keystore for G88 app

echo "========================================="
echo "G88 Release Keystore Generator"
echo "========================================="
echo ""
echo "This script will generate a release keystore for signing your Android app."
echo "IMPORTANT: Store the keystore file and passwords securely!"
echo "If you lose the keystore, you won't be able to update your app on Google Play."
echo ""

# Navigate to the correct directory
cd "$(dirname "$0")/../android/app" || exit 1

KEYSTORE_FILE="g88-release-key.keystore"
KEY_ALIAS="g88-key-alias"

# Check if keystore already exists
if [ -f "$KEYSTORE_FILE" ]; then
    echo "⚠️  WARNING: Keystore file already exists: $KEYSTORE_FILE"
    read -p "Do you want to overwrite it? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        exit 1
    fi
    rm "$KEYSTORE_FILE"
fi

echo "Generating keystore..."
echo ""
echo "You will be prompted for:"
echo "  1. Keystore password (remember this!)"
echo "  2. Key password (remember this!)"
echo "  3. Your details (name, organization, etc.)"
echo ""

keytool -genkeypair -v \
    -storetype PKCS12 \
    -keystore "$KEYSTORE_FILE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Keystore generated successfully!"
    echo ""
    echo "📁 Location: $(pwd)/$KEYSTORE_FILE"
    echo ""
    echo "========================================="
    echo "NEXT STEPS:"
    echo "========================================="
    echo ""
    echo "1. BACKUP this keystore file to a secure location!"
    echo "   You will need it for all future app updates."
    echo ""
    echo "2. Update mobile/android/gradle.properties with:"
    echo "   G88_RELEASE_STORE_FILE=$KEYSTORE_FILE"
    echo "   G88_RELEASE_KEY_ALIAS=$KEY_ALIAS"
    echo "   G88_RELEASE_STORE_PASSWORD=<your_keystore_password>"
    echo "   G88_RELEASE_KEY_PASSWORD=<your_key_password>"
    echo ""
    echo "3. Get the SHA-1 fingerprint for Google Maps API restriction:"
    echo "   keytool -list -v -keystore $KEYSTORE_FILE -alias $KEY_ALIAS"
    echo ""
    echo "4. Add the SHA-1 to Google Cloud Console:"
    echo "   - Go to APIs & Services > Credentials"
    echo "   - Create/edit Android-restricted API key"
    echo "   - Add package name: com.g88.app"
    echo "   - Add the SHA-1 fingerprint"
    echo ""
else
    echo "❌ Failed to generate keystore"
    exit 1
fi
