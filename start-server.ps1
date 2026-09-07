# Native Windows PowerShell HTTP Server using TcpListener
param([int]$Port = 5173)

$ip = [System.Net.IPAddress]::Loopback
try {
    $listener = New-Object System.Net.Sockets.TcpListener($ip, $Port)
    $listener.Server.SetSocketOption([System.Net.Sockets.SocketOptionLevel]::Socket, [System.Net.Sockets.SocketOptionName]::ReuseAddress, $true)
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
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".jsx"   = "application/javascript; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".woff2" = "font/woff2"
}

$standaloneFile = [System.IO.Path]::Combine($baseDir, "standalone.html")

while ($true) {
    $client = $null
    try {
        $client = $listener.AcceptTcpClient()
        $client.ReceiveTimeout = 2000
        $client.SendTimeout = 3000
        $stream = $client.GetStream()

        # Read the initial HTTP request buffer
        $buffer = New-Object byte[] 8192
        $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
        if ($bytesRead -le 0) {
            $client.Close()
            continue
        }

        $requestText = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
        $firstLine = $requestText.Split("`n")[0].Trim()
        $parts = $firstLine.Split(" ")
        if ($parts.Length -lt 2) {
            $client.Close()
            continue
        }

        $method = $parts[0]
        $rawUrl = $parts[1]
        $cleanPath = $rawUrl.Split("?")[0].TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($cleanPath) -or $cleanPath -eq "standalone.html") {
            $fileBytes = [System.IO.File]::ReadAllBytes($standaloneFile)
            $ct = "text/html; charset=utf-8"
            $status = "200 OK"
        } else {
            $targetFile = [System.IO.Path]::Combine($baseDir, [System.Uri]::UnescapeDataString($cleanPath))
            if (-not (Test-Path $targetFile -PathType Leaf)) {
                $publicCandidate = [System.IO.Path]::Combine($baseDir, "public", [System.Uri]::UnescapeDataString($cleanPath))
                if (Test-Path $publicCandidate -PathType Leaf) {
                    $targetFile = $publicCandidate
                } else {
                    $targetFile = $standaloneFile
                }
            }

            if (Test-Path $targetFile -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($targetFile).ToLower()
                $ct = $mimeTypes[$ext]
                if (-not $ct) { $ct = "application/octet-stream" }
                $fileBytes = [System.IO.File]::ReadAllBytes($targetFile)
                $status = "200 OK"
            } else {
                $fileBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $ct = "text/plain"
                $status = "404 Not Found"
            }
        }

        $header = "HTTP/1.1 $status`r`n" +
                  "Content-Type: $ct`r`n" +
                  "Content-Length: $($fileBytes.Length)`r`n" +
                  "Access-Control-Allow-Origin: *`r`n" +
                  "Connection: close`r`n`r`n"
        $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($header)

        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($fileBytes, 0, $fileBytes.Length)
        $stream.Flush()

        # Graceful TCP shutdown prevents RST packets
        try {
            $client.Client.Shutdown([System.Net.Sockets.SocketShutdown]::Both)
        } catch {}
        $client.Close()
    } catch {
        try { if ($client) { $client.Close() } } catch {}
    }
}
