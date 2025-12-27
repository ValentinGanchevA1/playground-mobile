@echo off
REM Script to generate Android release keystore for G88 app (Windows)

echo =========================================
echo G88 Release Keystore Generator
echo =========================================
echo.
echo This script will generate a release keystore for signing your Android app.
echo IMPORTANT: Store the keystore file and passwords securely!
echo If you lose the keystore, you won't be able to update your app on Google Play.
echo.
pause

cd /d "%~dp0\..\android\app"

set KEYSTORE_FILE=g88-release-key.keystore
set KEY_ALIAS=g88-key-alias

REM Check if keystore already exists
if exist "%KEYSTORE_FILE%" (
    echo WARNING: Keystore file already exists: %KEYSTORE_FILE%
    set /p confirm="Do you want to overwrite it? (yes/no): "
    if not "!confirm!"=="yes" (
        echo Aborted.
        exit /b 1
    )
    del "%KEYSTORE_FILE%"
)

echo Generating keystore...
echo.
echo You will be prompted for:
echo   1. Keystore password (remember this!)
echo   2. Key password (remember this!)
echo   3. Your details (name, organization, etc.)
echo.

keytool -genkeypair -v -storetype PKCS12 -keystore "%KEYSTORE_FILE%" -alias "%KEY_ALIAS%" -keyalg RSA -keysize 2048 -validity 10000

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Keystore generated successfully!
    echo.
    echo Location: %CD%\%KEYSTORE_FILE%
    echo.
    echo =========================================
    echo NEXT STEPS:
    echo =========================================
    echo.
    echo 1. BACKUP this keystore file to a secure location!
    echo    You will need it for all future app updates.
    echo.
    echo 2. Update mobile\android\gradle.properties with:
    echo    G88_RELEASE_STORE_FILE=%KEYSTORE_FILE%
    echo    G88_RELEASE_KEY_ALIAS=%KEY_ALIAS%
    echo    G88_RELEASE_STORE_PASSWORD=^<your_keystore_password^>
    echo    G88_RELEASE_KEY_PASSWORD=^<your_key_password^>
    echo.
    echo 3. Get the SHA-1 fingerprint for Google Maps API restriction:
    echo    keytool -list -v -keystore %KEYSTORE_FILE% -alias %KEY_ALIAS%
    echo.
    echo 4. Add the SHA-1 to Google Cloud Console:
    echo    - Go to APIs ^& Services ^> Credentials
    echo    - Create/edit Android-restricted API key
    echo    - Add package name: com.g88.app
    echo    - Add the SHA-1 fingerprint
    echo.
) else (
    echo Failed to generate keystore
    exit /b 1
)

pause
