# ResumeForgeAI Production Health Check Script
# This script pings key production routes to ensure they are live and returning 200 OK.

$baseUrl = "https://resumeforgeai.in"
$routes = @("/en-in", "/en-in/login", "/en-in/ai-resume-builder", "/en-in/jobs")
$successCount = 0

Write-Host "--- ResumeForgeAI Production Health Check ---" -ForegroundColor Cyan

foreach ($route in $routes) {
    $url = "$baseUrl$route"
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "[PASS] $route ($($response.StatusCode))" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "[FAIL] $route ($($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        $err = $_.Exception.Message
        Write-Host "[CRITICAL] $route is unreachable! Error: $err" -ForegroundColor Red
    }
}

$status = if ($successCount -eq $routes.Count) { "HEALTHY" } else { "DEGRADED" }
Write-Host "`nFinal Status: $status ($successCount/$($routes.Count) routes active)" -ForegroundColor Yellow
