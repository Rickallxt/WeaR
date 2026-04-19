' WeaR — silent launcher
' Runs WeaR-Launch.bat with no console window.
Set shell = CreateObject("WScript.Shell")
shell.Run "cmd /c """ & Chr(34) & "D:\Claude WeaR\WeaR-Launch.bat" & Chr(34) & """", 0, False
