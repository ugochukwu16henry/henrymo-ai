# Installing FFmpeg on Windows

This guide provides multiple methods to install FFmpeg on Windows for video generation.

---

## Method 1: Using winget (Windows Package Manager) - Recommended

If you have Windows 10/11 with winget installed:

```powershell
winget install --id=Gyan.FFmpeg -e --source winget
```

After installation, you may need to:

1. Restart your terminal/PowerShell
2. Add FFmpeg to PATH if it's not automatically added

---

## Method 2: Using Chocolatey

If you have Chocolatey installed:

```powershell
choco install ffmpeg
```

---

## Method 3: Manual Installation

### Step 1: Download FFmpeg

1. Go to https://www.gyan.dev/ffmpeg/builds/
2. Download the latest "ffmpeg-release-essentials.zip"
3. Extract the ZIP file to a location like `C:\ffmpeg`

### Step 2: Add to PATH

1. Open System Properties → Environment Variables
2. Under "System variables", find and select "Path"
3. Click "Edit"
4. Click "New" and add: `C:\ffmpeg\bin`
5. Click "OK" on all dialogs

### Step 3: Verify Installation

Open a new PowerShell/Command Prompt and run:

```powershell
ffmpeg -version
```

You should see FFmpeg version information.

---

## Method 4: Using Scoop

If you have Scoop installed:

```powershell
scoop install ffmpeg
```

---

## Quick Test After Installation

After installing FFmpeg, restart your terminal and test:

```powershell
ffmpeg -version
ffprobe -version
```

Both commands should show version information.

---

## For Docker/Development

If you're running the API in Docker, you'll need to install FFmpeg in the Docker container. Add this to your Dockerfile:

```dockerfile
RUN apt-get update && apt-get install -y ffmpeg
```

---

## Troubleshooting

### FFmpeg not found after installation

- Restart your terminal/PowerShell
- Check if FFmpeg is in your PATH: `echo $env:PATH` (PowerShell)
- Manually add FFmpeg bin directory to PATH

### Permission errors

- Run PowerShell as Administrator
- Check if antivirus is blocking FFmpeg

---

**Note:** After installation, restart your API server for the changes to take effect.
