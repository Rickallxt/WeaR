# WeaR — App Launcher
# Starts the dev server if not already running, then opens the app in your browser.
$projectDir = "D:\Claude WeaR"
$serverUrl  = "http://localhost:5173"

function Test-ServerRunning {
    try {
        $req = [System.Net.WebRequest]::Create($serverUrl)
        $req.Timeout = 1200
        $req.Method = "HEAD"
        $res = $req.GetResponse()
        $res.Close()
        return $true
    } catch { return $false }
}

if (-not (Test-ServerRunning)) {
    Write-Host "Starting WeaR..." -ForegroundColor Cyan
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName        = "node"
    $startInfo.Arguments       = "dev.mjs"
    $startInfo.WorkingDirectory = $projectDir
    $startInfo.WindowStyle     = [System.Diagnostics.ProcessWindowStyle]::Minimized
    $startInfo.CreateNoWindow  = $false
    [System.Diagnostics.Process]::Start($startInfo) | Out-Null

    $waited = 0
    while (-not (Test-ServerRunning) -and $waited -lt 20) {
        Start-Sleep -Seconds 1
        $waited++
        Write-Host "  Waiting for server... ($waited s)" -ForegroundColor DarkGray
    }

    if (-not (Test-ServerRunning)) {
        Write-Host "Server did not start in time. Try running 'node dev.mjs' manually." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Start-Process $serverUrl
