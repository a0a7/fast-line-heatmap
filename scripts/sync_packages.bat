@echo off
setlocal enabledelayedexpansion

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

:: Check if dist directory exists
if not exist "%PROJECT_ROOT%\dist" (
    echo Error: dist directory not found
    exit /b 1
)

echo Syncing Rust package...
:: Sync Rust package
if exist "%PROJECT_ROOT%\dist\rust" (
    :: Copy source code
    if exist "%PROJECT_ROOT%\dist\rust\src" rmdir /s /q "%PROJECT_ROOT%\dist\rust\src"
    xcopy /e /i "%PROJECT_ROOT%\core\src" "%PROJECT_ROOT%\dist\rust\src" >nul
    
    :: Keep the existing package Cargo.toml (it has distribution-specific config)
    if exist "%PROJECT_ROOT%\dist\rust\Cargo.toml" (
        echo   Keeping distribution Cargo.toml
    ) else (
        copy "%PROJECT_ROOT%\core\Cargo.toml" "%PROJECT_ROOT%\dist\rust\" >nul
        echo   Copied Cargo.toml
    )
    
    echo   Rust package synced
) else (
    echo   dist\rust directory not found
)

echo Building WebAssembly for JavaScript package...
:: Build WASM for JavaScript package
if exist "%PROJECT_ROOT%\dist\javascript" (
    cd /d "%PROJECT_ROOT%\core"
    
    :: Check if wasm-pack is installed
    where wasm-pack >nul 2>&1
    if !errorlevel! equ 0 (
        :: Build WASM
        wasm-pack build --target web --out-dir "../dist/javascript/wasm" --scope fastgeotoolkit
        echo   WebAssembly built for JavaScript package
    ) else (
        echo   wasm-pack not found. Install with: cargo install wasm-pack
    )
    
    cd /d "%PROJECT_ROOT%"
) else (
    echo   dist\javascript directory not found
)

:: Sync Python package
if exist "%PROJECT_ROOT%\dist\python" (
    :: Copy Rust source for Python compilation
    if not exist "%PROJECT_ROOT%\dist\python\src" mkdir "%PROJECT_ROOT%\dist\python\src"
    xcopy /e /y "%PROJECT_ROOT%\core\src\*" "%PROJECT_ROOT%\dist\python\src\" >nul
    
    :: Copy Cargo.toml for Python compilation
    if not exist "%PROJECT_ROOT%\dist\python\Cargo.toml" (
        copy "%PROJECT_ROOT%\core\Cargo.toml" "%PROJECT_ROOT%\dist\python\" >nul
        echo   Created Cargo.toml for Python packageit multi-language packages
    )
)

echo Package sync complete!

echo.
set /p "runtests=Run tests for core implementation? (y/N) "
if /i "%runtests%"=="y" (
    echo Running Rust tests...
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
