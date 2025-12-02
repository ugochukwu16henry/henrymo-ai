# Test Database Connection After Password Error Fix

Write-Host ""
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "🧪 TESTING DATABASE CONNECTION" -ForegroundColor Yellow
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""

# Check if database container is running
Write-Host "1️⃣  Checking database container..." -ForegroundColor Yellow
$dbStatus = docker-compose ps postgres --format "{{.Status}}" 2>&1
if ($dbStatus -like "*Up*") {
    Write-Host "   ✅ Database container is running" -ForegroundColor Green
} else {
    Write-Host "   ❌ Database container is not running" -ForegroundColor Red
    Write-Host "   Starting it now..." -ForegroundColor Yellow
    docker-compose up -d postgres
    Start-Sleep -Seconds 5
}

Write-Host ""

# Test database connection
Write-Host "2️⃣  Testing database connection..." -ForegroundColor Yellow

$testScript = @"
require('dotenv').config({ path: 'apps/api/.env' });
const { Pool } = require('pg');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'henmo_ai_dev',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  connectionTimeoutMillis: 5000,
};

// Try individual params first
let pool;
try {
  pool = new Pool(config);
  console.log('Using individual connection parameters');
} catch (e) {
  // Fallback to DATABASE_URL
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/henmo_ai_dev';
  pool = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 5000 });
  console.log('Using DATABASE_URL');
}

pool.query('SELECT NOW() as time, version() as version')
  .then(result => {
    console.log('✅ Connection successful!');
    console.log('   Time:', result.rows[0].time);
    console.log('   PostgreSQL Version:', result.rows[0].version.split(',')[0]);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Connection failed:', error.message);
    if (error.message.includes('password')) {
      console.error('');
      console.error('Password authentication issue. Please check:');
      console.error('   - docker-compose.yml: POSTGRES_PASSWORD');
      console.error('   - apps/api/.env: DATABASE_URL or DB_PASSWORD');
      console.error('');
      console.error('Expected password: postgres');
    }
    process.exit(1);
  });
"@

# Save test script temporarily
$testScriptPath = "test-db-connection-temp.js"
$testScript | Out-File -Encoding utf8 -FilePath $testScriptPath

try {
    $output = node $testScriptPath 2>&1
    Write-Host $output
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "=" * 70 -ForegroundColor Green
        Write-Host "✅ DATABASE CONNECTION SUCCESSFUL!" -ForegroundColor Green
        Write-Host "=" * 70 -ForegroundColor Green
        Write-Host ""
        Write-Host "🚀 You can now start the API server:" -ForegroundColor Cyan
        Write-Host "   cd apps/api" -ForegroundColor White
        Write-Host "   pnpm run dev" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "=" * 70 -ForegroundColor Red
        Write-Host "❌ DATABASE CONNECTION FAILED" -ForegroundColor Red
        Write-Host "=" * 70 -ForegroundColor Red
        Write-Host ""
        Write-Host "🔧 Troubleshooting steps:" -ForegroundColor Yellow
        Write-Host "   1. Verify database container is running" -ForegroundColor White
        Write-Host "   2. Check apps/api/.env has correct DATABASE_URL" -ForegroundColor White
        Write-Host "   3. Ensure password matches docker-compose.yml (postgres)" -ForegroundColor White
        Write-Host ""
        Write-Host "📚 See FIX_DATABASE_PASSWORD_ERROR.md for details" -ForegroundColor Cyan
        Write-Host ""
    }
} catch {
    Write-Host "❌ Error running test: $_" -ForegroundColor Red
} finally {
    # Clean up
    if (Test-Path $testScriptPath) {
        Remove-Item $testScriptPath -ErrorAction SilentlyContinue
    }
}

