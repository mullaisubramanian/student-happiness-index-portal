# Native Windows PowerShell HTTP Server using TcpListener
param([int]$Port = 5173)

$ip = [System.Net.IPAddress]::Loopback
try {
    $listener = New-Object System.Net.Sockets.TcpListener($ip, $Port)
    $listener.Start()
    Write-Host "Happiness Index server listening on http://localhost:$Port/"
} catch {
    Write-Host "Failed to start server on port $Port : $_"
    exit 1
}

$baseDir = $PSScriptRoot
if (-not $baseDir) { $baseDir = Get-Location }

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".htm"   = "text/html; charset=utf-8"
    ".css"   = "text/css"
    ".js"    = "application/javascript"
    ".jsx"   = "application/javascript"
    ".json"  = "application/json"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".woff2" = "font/woff2"
}

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)
        
        $requestLine = $reader.ReadLine()
        if (-not $requestLine) {
            $client.Close()
            continue
        }

        # Read headers
        while ($true) {
            $h = $reader.ReadLine()
            if ([string]::IsNullOrWhiteSpace($h)) { break }
        }

        $parts = $requestLine.Split(" ")
        $method = $parts[0]
        $url = if ($parts.Length -gt 1) { $parts[1] } else { "/" }

        $cleanPath = $url.Split("?")[0].TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($cleanPath)) {
            $cleanPath = "standalone.html"
        }

        $targetFile = [System.IO.Path]::Combine($baseDir, [System.Uri]::UnescapeDataString($cleanPath))

        if (-not (Test-Path $targetFile -PathType Leaf)) {
            $publicCandidate = [System.IO.Path]::Combine($baseDir, "public", [System.Uri]::UnescapeDataString($cleanPath))
            if (Test-Path $publicCandidate -PathType Leaf) {
                $targetFile = $publicCandidate
            } else {
                # Fallback to standalone.html for SPA routes
                $targetFile = [System.IO.Path]::Combine($baseDir, "standalone.html")
            }
        }

        if (Test-Path $targetFile -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
            $ct = $mimeTypes[$ext]
            if (-not $ct) { $ct = "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($targetFile)
            $header = "HTTP/1.1 200 OK`r`n" +
                      "Content-Type: $ct`r`n" +
                      "Content-Length: $($bytes.Length)`r`n" +
                      "Access-Control-Allow-Origin: *`r`n" +
                      "Connection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($bytes, 0, $bytes.Length)
            $stream.Flush()
        } else {
            $msg = "404 Not Found"
            $msgBytes = [System.Text.Encoding]::UTF8.GetBytes($msg)
            $header = "HTTP/1.1 404 Not Found`r`nContent-Length: $($msgBytes.Length)`r`nConnection: close`r`n`r`n"
            $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)
            $stream.Write($headerBytes, 0, $headerBytes.Length)
            $stream.Write($msgBytes, 0, $msgBytes.Length)
            $stream.Flush()
        }

        $client.Close()
    } catch {
        # Handle connection reset or client disconnect
    }
}
