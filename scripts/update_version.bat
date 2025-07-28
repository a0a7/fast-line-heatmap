@echo off
setlocal enabledelayedexpansion

:: Version update script for fastGeoToolkit
:: Updates version numbers across all package manifests

if "%1"=="" (
    echo Usage: %0 ^<version^>
    echo Example: %0 0.1.4
    exit /b 1
)

set "NEW_VERSION=%1"
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

echo Updating fastGeoToolkit to version %NEW_VERSION%...

:: Update Rust packages
echo Updating Rust package versions...

:: Update main core Cargo.toml
if exist "%PROJECT_ROOT%\core\Cargo.toml" (
    powershell -Command "(Get-Content '%PROJECT_ROOT%\core\Cargo.toml') -replace '^version = \".*\"', 'version = \"%NEW_VERSION%\"' | Set-Content '%PROJECT_ROOT%\core\Cargo.toml'"
    echo   Updated core\Cargo.toml
)

:: Update packages/rust Cargo.toml
if exist "%PROJECT_ROOT%\packages\rust\Cargo.toml" (
    powershell -Command "(Get-Content '%PROJECT_ROOT%\packages\rust\Cargo.toml') -replace '^version = \".*\"', 'version = \"%NEW_VERSION%\"' | Set-Content '%PROJECT_ROOT%\packages\rust\Cargo.toml'"
    echo   Updated packages\rust\Cargo.toml
)

:: Update JavaScript package.json files
echo 🌐 Updating JavaScript package versions...

:: Update main package.json
if exist "%PROJECT_ROOT%\core\package.json" (
    powershell -Command "(Get-Content '%PROJECT_ROOT%\core\package.json') -replace '\"version\": \".*\"', '\"version\": \"%NEW_VERSION%\"' | Set-Content '%PROJECT_ROOT%\core\package.json'"
    echo   Updated core\package.json
)

:: Update packages/javascript package.json
if exist "%PROJECT_ROOT%\packages\javascript\package.json" (
    powershell -Command "(Get-Content '%PROJECT_ROOT%\packages\javascript\package.json') -replace '\"version\": \".*\"', '\"version\": \"%NEW_VERSION%\"' | Set-Content '%PROJECT_ROOT%\packages\javascript\package.json'"
    echo   Updated packages\javascript\package.json
)

:: Update Python package
echo 🐍 Updating Python package version...

if exist "%PROJECT_ROOT%\packages\python\pyproject.toml" (
    powershell -Command "(Get-Content '%PROJECT_ROOT%\packages\python\pyproject.toml') -replace '^version = \".*\"', 'version = \"%NEW_VERSION%\"' | Set-Content '%PROJECT_ROOT%\packages\python\pyproject.toml'"
    echo   Updated packages\python\pyproject.toml
)

:: Update Python __init__.py
if exist "%PROJECT_ROOT%\packages\python\python\fastgeotoolkit\__init__.py" (
    powershell -Command "(Get-Content '%PROJECT_ROOT%\packages\python\python\fastgeotoolkit\__init__.py') -replace '__version__ = \".*\"', '__version__ = \"%NEW_VERSION%\"' | Set-Content '%PROJECT_ROOT%\packages\python\python\fastgeotoolkit\__init__.py'"
    echo   Updated packages\python\__init__.py
)

:: Update R package
echo Updating R package version...

if exist "%PROJECT_ROOT%\packages\r\DESCRIPTION" (
    powershell -Command "(Get-Content '%PROJECT_ROOT%\packages\r\DESCRIPTION') -replace '^Version: .*', 'Version: %NEW_VERSION%' | Set-Content '%PROJECT_ROOT%\packages\r\DESCRIPTION'"
    echo   Updated packages\r\DESCRIPTION
)

:: Update demo package.json
echo Updating demo version...

if exist "%PROJECT_ROOT%\demo\package.json" (
    powershell -Command "(Get-Content '%PROJECT_ROOT%\demo\package.json') -replace '\"version\": \".*\"', '\"version\": \"%NEW_VERSION%\"' | Set-Content '%PROJECT_ROOT%\demo\package.json'"
    echo   Updated demo\package.json
)

echo Version update complete!
echo.
echo Updated files:
echo   - core\Cargo.toml
echo   - core\package.json
echo   - packages\rust\Cargo.toml
echo   - packages\javascript\package.json
echo   - packages\python\pyproject.toml
echo   - packages\python\__init__.py
echo   - packages\r\DESCRIPTION
echo   - demo\package.json
echo.
echo Next steps:
echo   1. Review the changes: git diff
echo   2. Test all packages: .\scripts\sync_packages.bat
echo   3. Commit changes: git add . ^&^& git commit -m "Bump version to %NEW_VERSION%"
echo   4. Tag release: git tag v%NEW_VERSION%

pause
