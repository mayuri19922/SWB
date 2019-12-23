Dim iURL 
Dim objShell

iURL = "http://localhost:9090/swb/login.html"

set objShell = CreateObject("WScript.Shell")
objShell.run(iURL)