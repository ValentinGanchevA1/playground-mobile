@echo off
REM G88 Android Release Build Script for Windows
REM Generates signed AAB (Android App Bundle) for Google Play Store

setlocal EnableDelayedExpansion

echo.
echo ============================================
echo    G88 Android Release Build (Windows)
echo ============================================
echo.

set APP_NAME=G88
set BUILD_DIR=android\app\build\outputs
set RELEASE_DIR=releases

REM Check prerequisites
echo [1/6] Checking prerequisites...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js not found
    exit /b 1
)
echo      Node.js: OK

where java >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Java not found
    exit /b 1
)
echo      Java: OK

if not defined ANDROID_HOME (
    if not defined ANDROID_SDK_ROOT (
        echo ERROR: ANDROID_HOME or ANDROID_SDK_ROOT not set
        exit /b 1
    )
)
echo      Android SDK: OK
echo.

REM Setup production environment
echo [2/6] Setting up production environment...
if not exist ".env.production" (
    echo ERROR: .env.production not found
    echo Please create .env.production with production API URL
    exit /b 1
)

if exist ".env" (
    copy /Y .env .env.backup >nul
)
copy /Y .env.production .env >nul
echo      Production environment configured
echo.

REM Clean previous builds
echo [3/6] Cleaning previous builds...
cd android
call gradlew.bat clean
cd ..
echo      Clean complete
echo.

REM Build Release AAB
echo [4/6] Building Release AAB for Play Store...
cd android
call gradlew.bat bundleRelease
cd ..

if exist "%BUILD_DIR%\bundle\release\app-release.aab" (
    echo      AAB built successfully!
) else (
    echo ERROR: AAB build failed
    goto :restore_env
)
echo.

REM Build Release APK
echo [5/6] Building Release APK for testing...
cd android
call gradlew.bat assembleRelease
cd ..

if exist "%BUILD_DIR%\apk\release\app-release.apk" (
    echo      APK built successfully!
) else (
    echo ERROR: APK build failed
    goto :restore_env
)
echo.

REM Organize releases
echo [6/6] Organizing release files...
if not exist "%RELEASE_DIR%" mkdir "%RELEASE_DIR%"

REM Get timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "TIMESTAMP=%dt:~0,8%_%dt:~8,6%"

set RELEASE_NAME=g88_release_%TIMESTAMP%

if exist "%BUILD_DIR%\bundle\release\app-release.aab" (
    copy /Y "%BUILD_DIR%\bundle\release\app-release.aab" "%RELEASE_DIR%\%RELEASE_NAME%.aab" >nul
    echo      AAB: %RELEASE_DIR%\%RELEASE_NAME%.aab
)

if exist "%BUILD_DIR%\apk\release\app-release.apk" (
    copy /Y "%BUILD_DIR%\apk\release\app-release.apk" "%RELEASE_DIR%\%RELEASE_NAME%.apk" >nul
    echo      APK: %RELEASE_DIR%\%RELEASE_NAME%.apk
)
echo.

:restore_env
REM Restore development environment
echo Restoring development environment...
if exist ".env.backup" (
    move /Y .env.backup .env >nul
)
echo      Development environment restored
echo.

echo ============================================
echo    BUILD COMPLETED SUCCESSFULLY!
echo ============================================
echo.
echo Release files are in: %RELEASE_DIR%\
echo.
echo Next steps:
echo   1. Test the APK on physical devices
echo   2. Upload the AAB to Google Play Console
echo   3. Fill out Store Listing information
echo   4. Complete Content Rating questionnaire
echo   5. Set up pricing and distribution
echo.

endlocal
