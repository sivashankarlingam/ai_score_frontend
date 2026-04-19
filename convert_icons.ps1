Add-Type -AssemblyName System.Drawing
$src = "C:\Users\sivas\.gemini\antigravity\brain\9c6ab1c9-27ef-4cb1-99fa-a28ebefd71ed\aiscore_logo_png_1776584646645.png"
$destBase = "C:\ai_score_project\frontend\mobile_app\assets"

if (Test-Path $src) {
    try {
        $img = [System.Drawing.Image]::FromFile($src)
        $img.Save("$destBase\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $img.Save("$destBase\adaptive-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $img.Save("$destBase\splash-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
        $img.Dispose()
        Write-Host "Images converted successfully to PNG."
    } catch {
        Write-Error "Failed to convert image: $_"
    }
} else {
    Write-Error "Source image not found at $src"
}
