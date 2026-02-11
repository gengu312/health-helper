Write-Host "开始构建安卓调试包 (Debug APK)..." -ForegroundColor Cyan

# Check if android folder exists
if (-not (Test-Path "android")) {
    Write-Error "找不到 android 目录。请在项目根目录下运行此脚本。"
    exit 1
}

Push-Location android

# Clean
Write-Host "正在清理旧的构建..." -ForegroundColor Yellow
./gradlew clean

# Build
Write-Host "正在编译 APK (这可能需要几分钟)..." -ForegroundColor Yellow
./gradlew assembleDebug

if ($LASTEXITCODE -ne 0) {
    Write-Error "构建失败。请检查上方的错误信息。"
    Pop-Location
    exit 1
}

Pop-Location

# Copy to root
$sourcePath = "android/app/build/outputs/apk/debug/app-debug.apk"
$destPath = "health-helper-debug.apk"

if (Test-Path $sourcePath) {
    Copy-Item $sourcePath -Destination $destPath -Force
    Write-Host "构建成功！" -ForegroundColor Green
    Write-Host "APK 文件已复制到: $PWD\$destPath" -ForegroundColor Green
} else {
    Write-Error "构建似乎成功了，但找不到输出文件: $sourcePath"
}
