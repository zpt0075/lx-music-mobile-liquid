/**
 * 让 `npm install` 之后项目能直接被 Metro / Gradle 用起来。
 *
 * 这个项目依赖三个只从 GitHub 源码包（codeload tar.gz）安装的私有 fork：
 *   - react-native-track-player
 *   - react-native-file-system
 *   - react-native-local-media-metadata
 * 源码包里没有编译后的 lib/ 目录，package.json 的 main 指向不存在的 lib/index.js，
 * Metro 会直接报 "main could not be resolved"。这里把 main 指回 TS 源码，
 * 由 Metro 的 babel 转换处理。
 *
 * 另外 react-native-track-player 的 trackPlayer.ts 用了
 *   import * as resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource'
 * 经 Babel ESM interop 之后拿到的是 { default: fn }，调用处会抛
 * "resolveAssetSource is not a function" —— add() 直接失败，表现为「歌曲链接获取失败」。
 * 这里做一次运行时兼容。
 *
 * 脚本是幂等的，重复执行无副作用。
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const nm = path.join(root, 'node_modules')

const MAIN_TO_SRC = [
  'react-native-track-player',
  'react-native-file-system',
  'react-native-local-media-metadata',
]

function log(msg) {
  process.stdout.write(`[patch] ${msg}\n`)
}

for (const name of MAIN_TO_SRC) {
  const file = path.join(nm, name, 'package.json')
  if (!fs.existsSync(file)) {
    log(`skip ${name} (not installed)`)
    continue
  }
  let raw = fs.readFileSync(file, 'utf8')
  const pkg = JSON.parse(raw)
  let changed = false
  if (pkg.main !== 'src/index.ts') {
    pkg.main = 'src/index.ts'
    changed = true
  }
  if (pkg.exports) {
    delete pkg.exports
    changed = true
  }
  if (!changed) {
    log(`ok   ${name}`)
    continue
  }
  fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n')
  log(`main->src/index.ts  ${name}`)
}

const trackPlayerFile = path.join(nm, 'react-native-track-player', 'src', 'trackPlayer.ts')
if (fs.existsSync(trackPlayerFile)) {
  const raw = fs.readFileSync(trackPlayerFile, 'utf8')
  if (raw.includes('const resolveAssetSource: (path: number | string) => any')) {
    log('ok   track-player resolveAssetSource')
  } else {
    const oldImport = "import * as resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource'"
    if (!raw.includes(oldImport)) {
      log('warn track-player: import line not found, skipped')
    } else {
      const replacement = [
        "import * as resolveAssetSourceModule from 'react-native/Libraries/Image/resolveAssetSource'",
        '',
        '// Babel 的 ESM interop 会把它变成 { default: fn }，这里兼容两种形态',
        'const resolveAssetSource: (path: number | string) => any = typeof (resolveAssetSourceModule as any) === \'function\'',
        '  ? (resolveAssetSourceModule as any)',
        '  : ((resolveAssetSourceModule as any).default ?? (resolveAssetSourceModule as any))',
      ].join('\n')
      fs.writeFileSync(trackPlayerFile, raw.replace(oldImport, replacement))
      log('fixed track-player resolveAssetSource')
    }
  }
}
