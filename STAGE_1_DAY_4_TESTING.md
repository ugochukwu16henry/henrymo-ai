# 🧪 Stage 1 Day 4: Testing Guide

**Testing Development Environment & Documentation**

---

## ✅ Test 1: Development Scripts

### Test Setup Script

**Windows:**
```powershell
.\scripts\setup.ps1
```

**Expected:**
- ✅ Checks prerequisites (Node.js, pnpm, Docker)
- ✅ Installs dependencies
- ✅ Starts Docker services
- ✅ Sets up database
- ✅ Seeds initial data

### Test Dev Script

**Windows:**
```powershell
.\scripts\dev.ps1
```

**Expected:**
- ✅ Starts Docker services
- ✅ Shows PostgreSQL status
- ✅ Displays next steps

---

## ✅ Test 2: Documentation Files

Verify all documentation files exist and are readable:

```powershell
# Check all docs exist
Test-Path docs/DEVELOPMENT_SETUP.md
Test-Path docs/ENVIRONMENT_VARIABLES.md
Test-Path docs/CONTRIBUTING.md
Test-Path docs/API_DOCUMENTATION.md
Test-Path docs/DEPLOYMENT.md
```

**Expected:**
- ✅ All 5 documentation files exist
- ✅ Files are readable
- ✅ Content is comprehensive

---

## ✅ Test 3: Environment Templates

### API Template

```powershell
Test-Path apps/api/env.example.txt
Get-Content apps/api/env.example.txt | Select-Object -First 5
```

**Expected:**
- ✅ Template file exists
- ✅ Contains environment variables
- ✅ Has comments/descriptions

### Frontend Template

```powershell
Test-Path apps/hub/hub/env.example
Get-Content apps/hub/hub/env.example
```

**Expected:**
- ✅ Template file exists
- ✅ Contains frontend variables
- ✅ Has NEXT_PUBLIC_API_URL

---

## ✅ Test 4: Script Functionality

### Test Database Reset (Optional - ⚠️ Deletes Data)

```powershell
# Only run if you want to test reset
.\scripts\reset-db.ps1
```

**Expected:**
- ✅ Asks for confirmation
- ✅ Resets database if confirmed
- ✅ Reapplies schema and seeds

---

## ✅ Test 5: Documentation Links

### Check README Links

```powershell
Get-Content README.md | Select-String "docs/"
```

**Expected:**
- ✅ README contains links to all docs
- ✅ Links are correct paths

---

## 📊 Test Results Summary

After running all tests, you should have:

- ✅ Setup script works
- ✅ Dev script works
- ✅ All documentation files exist
- ✅ Environment templates exist
- ✅ README updated with doc links

---

## 🎯 Day 4 Complete!

If all tests pass, **Day 4 is complete!**

**Next:** Stage 2 - Authentication & User Management (Day 5)

---

**Super Admin:** Henry Maobughichi Ugochukwu

