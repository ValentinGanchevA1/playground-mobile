@echo off
REM Build release APK/AAB for G88 app (Windows)

setlocal enabledelayedexpansion

echo =========================================
echo G88 Release Build Script
echo =========================================
echo.

cd /d "%~dp0\.."

REM Check if keystore is configured
findstr /C:"G88_RELEASE_STORE_FILE" android\gradle.properties >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Release keystore not configured!
    echo.
    echo Please run: scripts\generate-keystore.bat
    echo Then update android\gradle.properties with your keystore credentials.
    exit /b 1
)

echo Select build type:
echo 1^) AAB (Android App Bundle) - Required for Google Play Store
echo 2^) APK (for testing/distribution outside Play Store)
echo 3^) Both
set /p choice="Enter choice (1-3): "

if "%choice%"=="1" goto build_aab
if "%choice%"=="2" goto build_apk
if "%choice%"=="3" goto build_both
echo Invalid choice
exit /b 1

:build_aab
echo.
echo Building AAB...
cd android
call gradlew clean
call gradlew bundleRelease

if exist "app\build\outputs\bundle\release\app-release.aab" (
    echo.
    echo AAB built successfully!
    echo Location: android\app\build\outputs\bundle\release\app-release.aab
) else (
    echo AAB build failed
    exit /b 1
)

if "%choice%"=="3" goto build_apk_continue
goto done

:build_both
cd android
call gradlew clean

:build_apk
echo.
echo Building APK...
cd android 2>nul
call gradlew assembleRelease

:build_apk_continue
if exist "app\build\outputs\apk\release\app-release.apk" (
    echo.
    echo APK built successfully!
    echo Location: android\app\build\outputs\apk\release\app-release.apk
) else (
    echo APK build failed
    exit /b 1
)

:done
echo.
echo =========================================
echo Build Complete!
echo =========================================
echo.
echo Next steps:
echo 1. Test the release build on a physical device
echo 2. Upload AAB to Google Play Console
echo 3. Fill in store listing details
echo.

pause
