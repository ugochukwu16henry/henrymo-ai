# Update Super Admin Credentials
# Updates existing super admin or creates new one with new credentials

Write-Host "🔐 Updating Super Admin Credentials..." -ForegroundColor Cyan
Write-Host ""

$newEmail = "ugochukwuhenry16@gmail.com"
$newPassword = "1995Mobuchi@."

# Check if Node.js and bcryptjs are available
Write-Host "📦 Generating password hash..." -ForegroundColor Yellow

$hashScript = @"
const bcrypt = require('bcryptjs');
bcrypt.hash('$newPassword', 10).then(hash => {
  console.log(hash);
});
"@

$hashScript | Out-File -Encoding utf8 -FilePath "temp_hash_gen.js" -ErrorAction SilentlyContinue

try {
    $passwordHash = node temp_hash_gen.js
    $passwordHash = $passwordHash.Trim()
    
    if ([string]::IsNullOrWhiteSpace($passwordHash)) {
        throw "Failed to generate hash"
    }
    
    Write-Host "✅ Password hash generated" -ForegroundColor Green
    Write-Host ""
    
    # Update or create super admin
    Write-Host "🔧 Updating database..." -ForegroundColor Yellow
    
    $updateScript = @"
-- Check if super admin exists with old email
DO `$`$
DECLARE
    existing_id UUID;
BEGIN
    -- Check for old email
    SELECT id INTO existing_id FROM users WHERE email = 'admin@henrymo-ai.com' AND role = 'super_admin';
    
    IF existing_id IS NOT NULL THEN
        -- Update existing super admin
        UPDATE users 
        SET email = '$newEmail',
            password_hash = '$passwordHash',
            name = 'Henry Maobughichi Ugochukwu',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = existing_id;
        RAISE NOTICE 'Super admin updated (old email found)';
    ELSE
        -- Check for new email
        SELECT id INTO existing_id FROM users WHERE email = '$newEmail' AND role = 'super_admin';
        
        IF existing_id IS NOT NULL THEN
            -- Update existing super admin with new email
            UPDATE users 
            SET password_hash = '$passwordHash',
                name = 'Henry Maobughichi Ugochukwu',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = existing_id;
            RAISE NOTICE 'Super admin password updated';
        ELSE
            -- Create new super admin
            INSERT INTO users (
                id, email, password_hash, name, role, subscription_tier,
                is_email_verified, is_active, country_code, created_at, updated_at
            ) VALUES (
                gen_random_uuid(),
                '$newEmail',
                '$passwordHash',
                'Henry Maobughichi Ugochukwu',
                'super_admin',
                'enterprise',
                true,
                true,
                'NG',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            );
            RAISE NOTICE 'Super admin created';
        END IF;
    END IF;
END;
`$`$;
"@
    
    $updateScript | Out-File -Encoding utf8 -FilePath "temp_update_admin.sql" -ErrorAction SilentlyContinue
    
    docker-compose exec -T postgres psql -U postgres -d henmo_ai_dev -f - < temp_update_admin.sql
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Super admin credentials updated successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📧 Email: $newEmail" -ForegroundColor Yellow
        Write-Host "🔑 Password: [CONFIRMED]" -ForegroundColor Yellow
        Write-Host ""
    } else {
        throw "Database update failed"
    }
    
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternative: Use seed script:" -ForegroundColor Yellow
    Write-Host "   cd packages/database && node scripts/seed.js" -ForegroundColor Gray
    exit 1
} finally {
    # Cleanup temp files
    Remove-Item "temp_hash_gen.js" -ErrorAction SilentlyContinue
    Remove-Item "temp_update_admin.sql" -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "✅ Process complete!" -ForegroundColor Green
Write-Host ""

