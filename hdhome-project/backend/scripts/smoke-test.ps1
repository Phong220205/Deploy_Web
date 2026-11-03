# Smoke test toàn diện cho HDHOME API (chạy backend local ở port 5000).
# Dùng: powershell -File scripts/smoke-test.ps1

$ErrorActionPreference = 'Continue'
$Base = if ($args.Count -gt 0) { $args[0] } else { 'http://localhost:5000/api' }
$pass = 0
$fail = 0

function Check($name, $condition, $detail) {
  if ($condition) { $script:pass++; Write-Host "  PASS  $name" -ForegroundColor Green }
  else { $script:fail++; Write-Host "  FAIL  $name :: $detail" -ForegroundColor Red }
}

function Get-Token($user, $pass) {
  try {
    $r = Invoke-RestMethod -Uri "$Base/auth/login" -Method POST -ContentType 'application/json' `
      -Body (@{ username = $user; password = $pass } | ConvertTo-Json)
    return $r.data.token
  } catch { return $null }
}

Write-Host "=== HDHOME smoke test @ $Base ===" -ForegroundColor Cyan

# 1. Health
try {
  $h = Invoke-RestMethod -Uri "$Base/health"
  Check 'health' ($h.status -eq 'ok') $h | Out-Null
} catch { Check 'health' $false $_.Exception.Message }

# 2. Login 3 role
$tokens = @{}
foreach ($c in @(
  @{ u = 'admin'; p = 'Admin@123' },
  @{ u = 'projectmanager'; p = 'Manager@123' },
  @{ u = 'technical'; p = 'Technical@123' }
)) {
  $t = Get-Token $c.u $c.p
  $tokens[$c.u] = $t
  Check "login $($c.u)" ($null -ne $t) 'token null'
}

# 3. Login sai mat khau -> 401
try {
  Invoke-RestMethod -Uri "$Base/auth/login" -Method POST -ContentType 'application/json' `
    -Body '{"username":"admin","password":"wrong"}' | Out-Null
  Check 'login sai mat khau bi tu choi' $false 'expected 401'
} catch { Check 'login sai mat khau bi tu choi' ($_.Exception.Response.StatusCode.value__ -eq 401) $_.Exception.Message }

# 4. Khong token -> 401
try {
  Invoke-RestMethod -Uri "$Base/dashboard/summary" | Out-Null
  Check 'endpoint can auth bi chan' $false 'expected 401'
} catch { Check 'endpoint can auth bi chan' ($_.Exception.Response.StatusCode.value__ -eq 401) $_.Exception.Message }

$admin = @{ Authorization = "Bearer $($tokens['admin'])" }
$mgr = @{ Authorization = "Bearer $($tokens['projectmanager'])" }
$tech = @{ Authorization = "Bearer $($tokens['technical'])" }

# 5. Dashboard summary
try {
  $s = Invoke-RestMethod -Uri "$Base/dashboard/summary" -Headers $admin
  Check 'dashboard summary' ($s.success -and $s.data.totalProjects -gt 0) "projects=$($s.data.totalProjects)"
} catch { Check 'dashboard summary' $false $_.Exception.Message }

# 6. Tao project voi status PAUSED (enum da dung chuan)
$stamp = Get-Date -Format 'HHmmssfff'
$projectCode = "SMOKE-PAUSED-$stamp"
try {
  $r = Invoke-RestMethod -Uri "$Base/projects" -Method POST -Headers $admin -ContentType 'application/json' `
    -Body (@{ project_code = $projectCode; project_name = 'Smoke PAUSED'; status = 'PAUSED'; progress = 15 } | ConvertTo-Json)
  Check 'tao project status PAUSED' ($r.success) $r.message
  $newProjectId = $r.data.project_id
} catch { Check 'tao project status PAUSED' $false $_.Exception.Message; $newProjectId = $null }

# 7. Tao project voi status ON_HOLD (enum cu -> phai bi tu choi 4xx, khong phai 500)
if ($newProjectId) {
  try {
    Invoke-RestMethod -Uri "$Base/projects" -Method POST -Headers $admin -ContentType 'application/json' `
      -Body (@{ project_code = "SMOKE-ONHOLD-$stamp"; project_name = 'Smoke ONHOLD'; status = 'ON_HOLD'; progress = 10 } | ConvertTo-Json) | Out-Null
    Check 'enum cu ON_HOLD bi tu choi' $false 'expected error'
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    Check 'enum cu ON_HOLD bi tu choi' ($code -ge 400 -and $code -lt 500) "got $code"
  }
}

# 8. Tao contract voi status DRAFT / SIGNED
foreach ($st in @('DRAFT', 'SIGNED')) {
  try {
    $r = Invoke-RestMethod -Uri "$Base/contracts" -Method POST -Headers $admin -ContentType 'application/json' `
      -Body (@{ contract_number = "SMOKE-CT-$st-$stamp"; project_id = $newProjectId; contract_value = 1000000; status = $st } | ConvertTo-Json)
    Check "tao contract status $st" ($r.success) $r.message
  } catch { Check "tao contract status $st" $false $_.Exception.Message }
}

# 9. Tao user voi status LOCKED
try {
  $r = Invoke-RestMethod -Uri "$Base/users" -Method POST -Headers $admin -ContentType 'application/json' `
    -Body (@{ username = "smoke_locked_$stamp"; password = 'Smoke@123'; full_name = 'Smoke Locked'; role_id = 2; status = 'LOCKED' } | ConvertTo-Json)
  Check 'tao user status LOCKED' ($r.success) $r.message
  $uid = $r.data.user_id
} catch { Check 'tao user status LOCKED' $false $_.Exception.Message; $uid = $null }

# 10. User LOCKED khong duoc dang nhap
if ($uid) {
  $t = Get-Token "smoke_locked_$stamp" 'Smoke@123'
  Check 'user LOCKED khong login duoc' ($null -eq $t) 'token khong null'
}

# 11. Technical chi thay duoc duoc gan cong
try {
  $all = Invoke-RestMethod -Uri "$Base/projects?limit=100" -Headers $admin
  $mine = Invoke-RestMethod -Uri "$Base/projects?limit=100" -Headers $tech
  Check 'technical bi gioi han du an' ($mine.data.Count -gt 0 -and $mine.data.Count -lt $all.data.Count) `
    "all=$($all.data.Count) mine=$($mine.data.Count)"
} catch { Check 'technical bi gioi han du an' $false $_.Exception.Message }

# 12. Public projects co du lieu
try {
  $p = Invoke-RestMethod -Uri "$Base/public/projects"
  Check 'public projects co du lieu' ($p.data.Count -gt 0) "count=$($p.data.Count)"
} catch { Check 'public projects co du lieu' $false $_.Exception.Message }

# 13. Public detail
try {
  $d = Invoke-RestMethod -Uri "$Base/public/projects/1"
  Check 'public project detail' ($d.success) $d.message
} catch { Check 'public project detail' $false $_.Exception.Message }

# 14. Tao contact request (public)
try {
  $r = Invoke-RestMethod -Uri "$Base/public/contacts" -Method POST -ContentType 'application/json' `
    -Body (@{ full_name = 'Smoke Test'; phone = "090000$(Get-Random -Minimum 1000 -Maximum 9999)"; email = 'smoke@example.com'; subject = "Smoke $(Get-Random -Minimum 1000 -Maximum 9999)"; message = 'Smoke test message' } | ConvertTo-Json)
  Check 'tao contact request' ($r.success) $r.message
} catch { Check 'tao contact request' $false $_.Exception.Message }

# 15. Don dep du lieu smoke
if ($newProjectId) {
  try { Invoke-RestMethod -Uri "$Base/projects/$newProjectId" -Method Delete -Headers $admin | Out-Null } catch {}
}
if ($uid) {
  try { Invoke-RestMethod -Uri "$Base/users/$uid" -Method Delete -Headers $admin | Out-Null } catch {}
}

Write-Host ""
Write-Host "PASS: $pass   FAIL: $fail" -ForegroundColor $(if ($fail -eq 0) { 'Green' } else { 'Red' })
if ($fail -gt 0) { exit 1 }
