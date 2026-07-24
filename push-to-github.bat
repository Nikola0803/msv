@echo off
title Push MSV to GitHub
cd /d "C:\Users\PC\Desktop\Vint and MSV\msv"

echo.
echo  ============================================
echo    MSV ^> GitHub Push
echo  ============================================
echo.

:: Nuclear reset - wipe broken git history and start clean
rmdir /s /q .git
git init
git remote add origin https://github.com/Nikola0803/msv.git

:: Stage and commit everything
git add -A
set TIMESTAMP=%date:~6,4%-%date:~3,2%-%date:~0,2% %time:~0,5%
git commit -m "Update %TIMESTAMP%"

:: Force push over remote
echo  Pushing to github.com/Nikola0803/msv ...
echo.
git push origin master --force

echo.
if %errorlevel% == 0 (
    echo  ============================================
    echo    SUCCESS - live on GitHub!
    echo  ============================================
) else (
    echo  ============================================
    echo    Error - check output above.
    echo  ============================================
)
echo.
pause
