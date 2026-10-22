# Turns the SVG artwork in demo-sources/ into JPEG files in public/demo/, using Microsoft Edge (headless) and System.Drawing.
# Run from the project folder:  powershell -File scripts/render-demo-images.ps1   (add names to render only some)
param([string[]]$Only)

$root = Split-Path -Parent $PSScriptRoot
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
if (-not (Test-Path $edge)) { throw "Microsoft Edge was not found." }

Add-Type -AssemblyName System.Drawing
$jpeg = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object Drawing.Imaging.EncoderParameter([Drawing.Imaging.Encoder]::Quality, [long]88)

$tmp = Join-Path ([IO.Path]::GetTempPath()) "kt-demo-render"
New-Item -ItemType Directory -Force $tmp | Out-Null
New-Item -ItemType Directory -Force (Join-Path $root "public\demo") | Out-Null

Get-ChildItem (Join-Path $root "demo-sources") -Filter *.svg | ForEach-Object {
  $name = $_.BaseName
  if ($Only -and ($Only -notcontains $name)) { return }
  $html = Join-Path $tmp "$name.html"
  $png = Join-Path $tmp "$name.png"
  Set-Content -Path $html -Encoding utf8 -Value ("<html><body style='margin:0;overflow:hidden'>" + (Get-Content $_.FullName -Raw) + "</body></html>")
  Remove-Item $png -ErrorAction SilentlyContinue
  & $edge --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1024,768 "--screenshot=$png" ("file:///" + ($html -replace '\\', '/')) 2>$null | Out-Null
  $deadline = (Get-Date).AddSeconds(20)
  while (-not (Test-Path $png) -and (Get-Date) -lt $deadline) { Start-Sleep -Milliseconds 200 }
  if (-not (Test-Path $png)) { Write-Host "FAILED to render $name"; return }
  Start-Sleep -Milliseconds 300
  $img = [Drawing.Image]::FromFile($png)
  $target = Join-Path $root "public\demo\$name.jpg"
  $img.Save($target, $jpeg, $ep)
  $img.Dispose()
  Write-Host ("rendered {0}.jpg ({1} KB)" -f $name, [math]::Round((Get-Item $target).Length / 1KB))
}
