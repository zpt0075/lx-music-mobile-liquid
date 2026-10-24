/**
 * 自定义音源脚本（占位文件）
 *
 * 这个仓库不附带任何第三方音源脚本 —— 音源脚本里通常带有作者自己的接口密钥，
 * 属于第三方的私有内容，不适合随代码一起分发。
 *
 * 想启用自动导入：
 *   1. 把你自己的音源脚本全文（`globalThis.lx` 那套 API 的 JS 文件）读成一个字符串；
 *   2. 在本文件里导出它，例如：
 *
 *        const script = `...脚本原文...`
 *        export default script
 *
 *   3. 重新构建即可，`src/dev/seedEmSource.ts` 会在启动时自动导入并切换过去。
 *
 * 也可以完全不碰代码：在 App 里「设置 → 自定义源 → 导入」手动选文件，
 * 效果完全一样（`seedEmSource` 发现同名源已存在时不会重复导入）。
 *
 * 留空时 `seedEmSource` 会直接跳过，不影响 App 正常使用。
 */
const script = ''

export default script
