@echo off
setlocal enabledelayedexpansion

:: Sync script for fastGeoToolkit multi-language packages
:: This script syncs the core development code from core\ to all package directories

echo Syncing fastGeoToolkit packages...

:: Get the script directory and project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

echo Project root: %PROJECT_ROOT%

:: Check if core directory exists
if not exist "%PROJECT_ROOT%\core" (
    echo Error: core directory not found
    exit /b 1
)

:: Check if packages directory exists
if not exist "%PROJECT_ROOT%\packages" (
    echo Error: packages directory not found
    exit /b 1
)

echo Syncing Rust package...
:: Sync Rust package
if exist "%PROJECT_ROOT%\packages\rust" (
    :: Copy source code
    if exist "%PROJECT_ROOT%\packages\rust\src" rmdir /s /q "%PROJECT_ROOT%\packages\rust\src"
    xcopy /e /i "%PROJECT_ROOT%\core\src" "%PROJECT_ROOT%\packages\rust\src" >nul
    
    :: Keep the existing package Cargo.toml (it has distribution-specific config)
    if exist "%PROJECT_ROOT%\packages\rust\Cargo.toml" (
        echo   Keeping distribution Cargo.toml
    ) else (
        copy "%PROJECT_ROOT%\core\Cargo.toml" "%PROJECT_ROOT%\packages\rust\" >nul
        echo   Copied Cargo.toml
    )
    
    echo   Rust package synced
) else (
    echo   packages\rust directory not found
)

echo 🌐 Building WebAssembly for JavaScript package...
:: Build WASM for JavaScript package
if exist "%PROJECT_ROOT%\packages\javascript" (
    cd /d "%PROJECT_ROOT%\core"
    
    :: Check if wasm-pack is installed
    where wasm-pack >nul 2>&1
    if !errorlevel! equ 0 (
        :: Build WASM
        wasm-pack build --target web --out-dir "../packages/javascript/wasm" --scope fastgeotoolkit
        echo   WebAssembly built for JavaScript package
    ) else (
        echo   wasm-pack not found. Install with: cargo install wasm-pack
    )
    
    cd /d "%PROJECT_ROOT%"
) else (
    echo   packages\javascript directory not found
)

echo 🐍 Syncing Python package...
:: Sync Python package
if exist "%PROJECT_ROOT%\packages\python" (
    :: Copy Rust source for Python compilation
    if not exist "%PROJECT_ROOT%\packages\python\src" mkdir "%PROJECT_ROOT%\packages\python\src"
    xcopy /e /y "%PROJECT_ROOT%\core\src\*" "%PROJECT_ROOT%\packages\python\src\" >nul
    
    :: Copy Cargo.toml for maturin, but adapt it for Python
    if not exist "%PROJECT_ROOT%\packages\python\Cargo.toml" (
        copy "%PROJECT_ROOT%\core\Cargo.toml" "%PROJECT_ROOT%\packages\python\" >nul
        echo   Created Cargo.toml for Python package
    )
    
    echo   Python package synced
) else (
    echo   packages\python directory not found
)

echo Syncing R package...
:: Sync R package
if exist "%PROJECT_ROOT%\packages\r" (
    :: Copy Rust source for R compilation
    if not exist "%PROJECT_ROOT%\packages\r\src" mkdir "%PROJECT_ROOT%\packages\r\src"
    xcopy /e /y "%PROJECT_ROOT%\core\src\*" "%PROJECT_ROOT%\packages\r\src\" >nul
    
    :: Copy Cargo.toml for R compilation
    if not exist "%PROJECT_ROOT%\packages\r\src\Cargo.toml" (
        copy "%PROJECT_ROOT%\core\Cargo.toml" "%PROJECT_ROOT%\packages\r\src\" >nul
        echo   Created Cargo.toml for R package
    )
    
    echo   R package synced
) else (
    echo   packages\r directory not found
)

echo 🎉 Package sync complete!

echo.
set /p "runtests=🧪 Run tests for core implementation? (y/N) "
if /i "%runtests%"=="y" (
    echo 🧪 Running Rust tests...
    cd /d "%PROJECT_ROOT%\core"
    cargo test
    echo Tests completed
    cd /d "%PROJECT_ROOT%"
)

echo.
echo Next steps:
echo   1. Review changes in each package directory
echo   2. Update version numbers if needed: .\scripts\update_version.bat x.y.z
echo   3. Build and test each package individually
echo   4. Commit and tag for release

pause
