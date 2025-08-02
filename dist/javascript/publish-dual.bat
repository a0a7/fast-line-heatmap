@echo off
REM Dual publishing script for npm and GitHub Packages (Windows)
echo 🚀 Publishing to both npm and GitHub Packages...

REM Build the package
echo 📦 Building package...
call npm run build
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%

REM Backup original package.json
copy package.json package.json.backup

REM 1. Publish to npm (public registry)
echo 📤 Publishing to npm...
call npm publish --access public
if %ERRORLEVEL% neq 0 goto :restore

REM 2. Modify package.json for GitHub Packages using PowerShell
echo 🔧 Preparing for GitHub Packages...
powershell -Command "$pkg = Get-Content 'package.json' | ConvertFrom-Json; $pkg.name = '@a0a7/fastgeotoolkit'; $pkg.publishConfig = @{registry='https://npm.pkg.github.com'; access='public'}; $pkg | ConvertTo-Json -Depth 10 | Set-Content 'package.json'"

REM 3. Publish to GitHub Packages
echo 📤 Publishing to GitHub Packages...
call npm publish
if %ERRORLEVEL% neq 0 goto :restore

echo ✅ Successfully published to both registries!
echo 📦 npm: https://www.npmjs.com/package/fastgeotoolkit
echo 📦 GitHub: https://github.com/a0a7/fastgeotoolkit/packages
goto :restore

:restore
REM Restore original package.json
echo 🔄 Restoring original package.json...
move package.json.backup package.json
exit /b %ERRORLEVEL%
