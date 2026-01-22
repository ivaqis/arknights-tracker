$cacheFile = "C:\Users\makiv\AppData\Local\PlatformProcess\QtWebEngine\Default\GPUCache\data_2"
$content = Get-Content -Encoding UTF8 -Raw $cacheFile
$content -match "ef-webview\.gryphline\.com"

if ($content -match "ef-webview\.gryphline\.com") {
    Write-Host "Found ef-webview URL in cache!" -ForegroundColor Green
    # Попробуем найти токен
    $content -match "token=[^&\s]+"
} else {
    Write-Host "No ef-webview URL found in data_2" -ForegroundColor Yellow
}