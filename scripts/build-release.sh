#!/bin/bash
# G88 Android Release Build Script
# Generates signed AAB (Android App Bundle) for Google Play Store

set -e

echo "🚀 G88 Android Release Build"
echo "=============================="

# Configuration
APP_NAME="G88"
BUILD_DIR="./android/app/build/outputs"
RELEASE_DIR="./releases"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo -e "\n${YELLOW}Checking prerequisites...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found${NC}"
        exit 1
    fi
    
    # Check Java
    if ! command -v java &> /dev/null; then
        echo -e "${RED}❌ Java not found${NC}"
        exit 1
    fi
    
    # Check Android SDK
    if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
        echo -e "${RED}❌ ANDROID_HOME or ANDROID_SDK_ROOT not set${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All prerequisites met${NC}"
}

# Clean previous builds
clean_build() {
    echo -e "\n${YELLOW}Cleaning previous builds...${NC}"
    cd android
    ./gradlew clean
    cd ..
    echo -e "${GREEN}✅ Clean complete${NC}"
}

# Copy production environment
setup_env() {
    echo -e "\n${YELLOW}Setting up production environment...${NC}"
    
    if [ ! -f ".env.production" ]; then
        echo -e "${RED}❌ .env.production not found${NC}"
        echo "Please create .env.production with production API URL"
        exit 1
    fi
    
    # Backup current .env
    if [ -f ".env" ]; then
        cp .env .env.backup
    fi
    
    # Use production env
    cp .env.production .env
    
    echo -e "${GREEN}✅ Production environment configured${NC}"
}

# Build Release AAB (for Play Store)
build_aab() {
    echo -e "\n${YELLOW}Building Release AAB...${NC}"
    cd android
    ./gradlew bundleRelease
    cd ..
    
    AAB_PATH="$BUILD_DIR/bundle/release/app-release.aab"
    if [ -f "$AAB_PATH" ]; then
        echo -e "${GREEN}✅ AAB built successfully${NC}"
        echo "   Path: $AAB_PATH"
    else
        echo -e "${RED}❌ AAB build failed${NC}"
        exit 1
    fi
}

# Build Release APK (for direct installation/testing)
build_apk() {
    echo -e "\n${YELLOW}Building Release APK...${NC}"
    cd android
    ./gradlew assembleRelease
    cd ..
    
    APK_PATH="$BUILD_DIR/apk/release/app-release.apk"
    if [ -f "$APK_PATH" ]; then
        echo -e "${GREEN}✅ APK built successfully${NC}"
        echo "   Path: $APK_PATH"
    else
        echo -e "${RED}❌ APK build failed${NC}"
        exit 1
    fi
}

# Copy to releases directory
organize_releases() {
    echo -e "\n${YELLOW}Organizing release files...${NC}"
    
    mkdir -p "$RELEASE_DIR"
    
    # Get version from package.json
    VERSION=$(node -p "require('./package.json').version")
    VERSION_CODE=$(grep "versionCode" android/app/build.gradle | head -1 | awk '{print $2}')
    
    DATE=$(date +%Y%m%d_%H%M%S)
    RELEASE_NAME="g88_v${VERSION}_${VERSION_CODE}_${DATE}"
    
    # Copy AAB
    if [ -f "$BUILD_DIR/bundle/release/app-release.aab" ]; then
        cp "$BUILD_DIR/bundle/release/app-release.aab" "$RELEASE_DIR/${RELEASE_NAME}.aab"
        echo "   AAB: $RELEASE_DIR/${RELEASE_NAME}.aab"
    fi
    
    # Copy APK
    if [ -f "$BUILD_DIR/apk/release/app-release.apk" ]; then
        cp "$BUILD_DIR/apk/release/app-release.apk" "$RELEASE_DIR/${RELEASE_NAME}.apk"
        echo "   APK: $RELEASE_DIR/${RELEASE_NAME}.apk"
    fi
    
    echo -e "${GREEN}✅ Release files organized${NC}"
}

# Restore development environment
restore_env() {
    echo -e "\n${YELLOW}Restoring development environment...${NC}"
    
    if [ -f ".env.backup" ]; then
        mv .env.backup .env
        echo -e "${GREEN}✅ Development environment restored${NC}"
    fi
}

# Main execution
main() {
    echo "Build Type: $1"
    
    check_prerequisites
    clean_build
    setup_env
    
    case "$1" in
        "aab")
            build_aab
            ;;
        "apk")
            build_apk
            ;;
        "all"|"")
            build_aab
            build_apk
            ;;
        *)
            echo "Usage: $0 [aab|apk|all]"
            exit 1
            ;;
    esac
    
    organize_releases
    restore_env
    
    echo -e "\n${GREEN}🎉 Build completed successfully!${NC}"
    echo "=============================="
    echo "Release files are in: $RELEASE_DIR"
}

main "$@"
