Dim iURL 
Dim objShell

iURL = "http://localhost:8080/aps/APS_Setup/APSCode/index.html"

set objShell = CreateObject("WScript.Shell")
objShell.run(iURL)