strCmd1 = "D:\app\run_app.bat"
strCmd2 = "D:\app\run_ws.bat"
Set wshShell = CreateObject("WScript.Shell")
nWindowStyle = 0 ' 激活并显示窗口
bWaitOnReturn = 0 ' 不必等待程序执行完毕再执行下一条语句
wshShell.Run strCmd1,nWindowStyle,bWaitOnReturn
wshShell.Run strCmd2,nWindowStyle,bWaitOnReturn

