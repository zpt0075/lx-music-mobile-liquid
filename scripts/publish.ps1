<#
.SYNOPSIS
  一键把本仓库发布到 GitHub（建仓库 + 推 main + 上传 APK 到 Release）。

.DESCRIPTION
  本机尚未登录 GitHub（没有 gh、没有 credential/ssh key），所以用一个 Personal Access Token 走 REST API。
  Token 只需要 repo 权限（classic: `repo`；fine-grained: Contents + Administration 读写）。

  用法：
    # 1) 在 https://github.com/settings/tokens 建一个 token
    # 2) 运行（token 不会写进仓库，只在本次会话内存里）
    $env:GITHUB_TOKEN = "ghp_xxx"
    ./scripts/publish.ps1 -Repo lx-music-mobile-liquid

    # 私有仓库 / 换 APK
    ./scripts/publish.ps1 -Repo lx-music-mobile-liquid -Private -Apk ..\dist\LXMusic-Liquid-arm64-v8a.apk

.NOTES
  - 幂等：仓库已存在就跳过创建；remote 已存在就改 URL；tag/Release 已存在就跳过。
  - 结束时会尝试把 remote 还原成不含 token 的地址，避免 token 留在 .git/config 里。
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)][string]$Token = $env:GITHUB_TOKEN,
  [Parameter(Mandatory = $false)][string]$Repo = 'lx-music-mobile-liquid',
  [Parameter(Mandatory = $false)][string]$Description = 'LX Music 移动版 UI 重构分支：Salt 亮色极简 + 原生液态玻璃（顶部/播放条/底栏）',
  [Parameter(Mandatory = $false)][switch]$Private,
  [Parameter(Mandatory = $false)][string]$Tag = 'v1.0.0',
  [Parameter(Mandatory = $false)][string]$Apk = '',
  [Parameter(Mandatory = $false)][string]$ApiRoot = 'https://api.github.com'
)

$ErrorActionPreference = 'Stop'
$git = 'git'
$here = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Push-Location $here
try {
  if (-not $Token) { throw '缺少 token：请先设置 $env:GITHUB_TOKEN，或用 -Token 传入' }

  $headers = @{
    Authorization          = "Bearer $Token"
    Accept                 = 'application/vnd.github+json'
    'X-GitHub-Api-Version' = '2022-11-28'
    'User-Agent'           = 'lx-music-liquid-publish'
  }

  Write-Host '==> 校验 token' -ForegroundColor Cyan
  $me = Invoke-RestMethod -Uri "$ApiRoot/user" -Headers $headers
  $owner = $me.login
  Write-Host "    登录身份: $owner"

  Write-Host '==> 确保仓库存在' -ForegroundColor Cyan
  $repoUrl = "$ApiRoot/repos/$owner/$Repo"
  $exists = $true
  try { Invoke-RestMethod -Uri $repoUrl -Headers $headers | Out-Null } catch { $exists = $false }
  if ($exists) {
    Write-Host "    已存在: $owner/$Repo"
  } else {
    $body = @{ name = $Repo; description = $Description; private = [bool]$Private; has_issues = $true; has_wiki = $false } | ConvertTo-Json
    Invoke-RestMethod -Uri "$ApiRoot/user/repos" -Method Post -Headers $headers -Body $body -ContentType 'application/json' | Out-Null
    Write-Host "    已创建: $owner/$Repo"
  }

  Write-Host '==> 推送 main' -ForegroundColor Cyan
  $authedUrl = "https://$owner`:$Token@github.com/$owner/$Repo.git"
  $cleanUrl = "https://github.com/$owner/$Repo.git"
  $remotes = & $git remote
  if ($remotes -contains 'origin') { & $git remote set-url origin $authedUrl } else { & $git remote add origin $authedUrl }
  # git 把进度写到 stderr，$ErrorActionPreference='Stop' 会把它当成异常；
  # 这里临时放宽，只以 $LASTEXITCODE 判定成败
  $ErrorActionPreference = 'Continue'
  & $git push -u origin main 2>&1 | ForEach-Object { Write-Host "    $_" }
  $pushCode = $LASTEXITCODE
  if ($pushCode -eq 0) {
    & $git push --tags 2>&1 | ForEach-Object { Write-Host "    $_" }
  }
  $ErrorActionPreference = 'Stop'
  & $git remote set-url origin $cleanUrl
  if ($pushCode -ne 0) { throw "git push 失败（exit $pushCode）" }

  if ($Apk) {
    if (-not (Test-Path $Apk)) { Write-Warning "找不到 APK：$Apk，跳过 Release"; }
    else {
      Write-Host "==> 发布 Release $Tag" -ForegroundColor Cyan
      $rel = $null
      try { $rel = Invoke-RestMethod -Uri "$repoUrl/releases/tags/$Tag" -Headers $headers } catch { }
      if (-not $rel) {
        $relBody = @{
          tag_name         = $Tag
          target_commitish = 'main'
          name             = "Liquid Glass $Tag"
          body             = "构建产物：arm64-v8a / x86_64 安装包。基于 lyswhut/lx-music-mobile（Apache-2.0）修改界面与交互。"
          draft            = $false
          prerelease       = $false
        } | ConvertTo-Json
        $rel = Invoke-RestMethod -Uri "$repoUrl/releases" -Method Post -Headers $headers -Body $relBody -ContentType 'application/json'
        Write-Host "    已创建 Release: $($rel.html_url)"
      } else {
        Write-Host "    Release 已存在: $($rel.html_url)"
      }

      $name = Split-Path -Leaf $Apk
      $uploadUrl = ($rel.upload_url -replace '\{.*\}$', '') + "?name=$name"
      Write-Host "==> 上传 $name"
      $upHeaders = @{ Authorization = "Bearer $Token"; 'User-Agent' = 'lx-music-liquid-publish'; Accept = 'application/vnd.github+json' }
      $asset = Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $upHeaders -ContentType 'application/vnd.android.package-archive' -InFile (Resolve-Path $Apk)
      Write-Host "    附件: $($asset.browser_download_url)"
    }
  }

  Write-Host ''
  Write-Host "完成 → https://github.com/$owner/$Repo" -ForegroundColor Green
}
finally {
  Pop-Location
}
