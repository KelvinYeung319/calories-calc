@echo off
start /b npm run dev

timeout /t 2 >nul

powershell -command "$wshell = New-Object -ComObject WScript.Shell; $wshell.SendKeys('o{ENTER}');"

exit