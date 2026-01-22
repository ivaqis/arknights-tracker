Add-Type -AssemblyName System.Web

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Endfield Gacha URL Extractor" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Log file location (SDK logs)
$logLocation = "$env:USERPROFILE\AppData\LocalLow\Gryphline\Endfield\sdklogs\HGWebview.log"

# API host for validation
$apiHost = "ef-webview.gryphline.com"

# Check if log file exists
if (-Not (Test-Path $logLocation)) {
    Write-Host "Cannot find log file!" -ForegroundColor Red
    Write-Host "Expected location: $logLocation" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Make sure you have opened gacha history in game first!" -ForegroundColor Yellow
    return
}

Write-Host "Found log file: $logLocation" -ForegroundColor Green
Write-Host "Reading log..." -ForegroundColor Cyan
Write-Host ""

# Read the log file
try {
    $logContent = Get-Content -Path $logLocation -Raw -ErrorAction Stop
}
catch {
    Write-Host "Failed to read log file!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    return
}

# Search for WebPortal URL with token
$urlPattern = "WebPortal url: (https://ef-webview\.gryphline\.com[^\s]+u8_token=[^\s]+)"

if ($logContent -match $urlPattern) {
    $fullUrl = $matches[1]
    Write-Host "Found gacha URL in log!" -ForegroundColor Green
    Write-Host ""
    
    # Extract just the token parameter for API use
    if ($fullUrl -match "u8_token=([^&\s]+)") {
        $token = $matches[1]
        
        # Also extract server and other params
        $server = "3" # default
        if ($fullUrl -match "server=(\d+)") {
            $server = $matches[1]
        }
        
        # Build API URL
        $apiUrl = "https://ef-webview.gryphline.com/api/record/char?lang=en-us&pool_type=E_CharacterGachaPoolType_Beginner&token=$token&server_id=$server"
        
        # Test the URL
        Write-Host "Validating URL..." -ForegroundColor Cyan
        try {
            $response = Invoke-WebRequest -Uri $apiUrl -UseBasicParsing -TimeoutSec 10 | ConvertFrom-Json
            
            if ($response.code -eq 0) {
                Write-Host "URL is valid!" -ForegroundColor Green
            }
            else {
                Write-Host "URL validation returned code: $($response.code)" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "Could not validate URL (might still work)" -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host "SUCCESS! URL extracted and copied!" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Full URL:" -ForegroundColor White
        Write-Host $fullUrl -ForegroundColor Gray
        Write-Host ""
        Write-Host "API URL (for trackers):" -ForegroundColor White
        Write-Host $apiUrl -ForegroundColor White
        Write-Host ""
        
        # Copy API URL to clipboard
        Set-Clipboard -Value $apiUrl
        Write-Host "API URL copied to clipboard!" -ForegroundColor Green
        Write-Host "You can paste it into your gacha tracker tool." -ForegroundColor Green
    }
    else {
        Write-Host "Found URL but couldn't extract token!" -ForegroundColor Red
        Write-Host $fullUrl -ForegroundColor Yellow
    }
}
else {
    Write-Host "No gacha URL found in log file!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Open Endfield game" -ForegroundColor Yellow
    Write-Host "2. Go to gacha/summon screen" -ForegroundColor Yellow
    Write-Host "3. Open gacha history" -ForegroundColor Yellow
    Write-Host "4. Run this script again" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "The URL is logged when you open the gacha history screen." -ForegroundColor Cyan
}