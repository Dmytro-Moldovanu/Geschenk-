import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const docsDir = resolve(root, 'docs')
const indexPath = resolve(docsDir, 'index.html')

let html = await readFile(indexPath, 'utf8')

html = html.replace(
  /<script>\s*if \(window\.location\.protocol === 'file:'\)[\s\S]*?<\/script>/,
  '',
)

const stylesheetMatch = html.match(/<link rel="stylesheet"[^>]*href="\.\/([^"]+)"[^>]*>/)
if (!stylesheetMatch) throw new Error('Stylesheet im Build nicht gefunden.')
const css = await readFile(resolve(docsDir, stylesheetMatch[1]), 'utf8')
// Callback verwenden: "$&" im gebündelten Code darf nicht als
// Platzhalter für den gefundenen HTML-Text behandelt werden.
const safeCss = css.replace(/<\/style/gi, '<\\/style')
html = html.replace(stylesheetMatch[0], () => `<style>${safeCss}</style>`)

const scriptMatch = html.match(/<script type="module"[^>]*src="\.\/([^"]+)"[^>]*><\/script>/)
if (!scriptMatch) throw new Error('JavaScript-Datei im Build nicht gefunden.')
const javascript = await readFile(resolve(docsDir, scriptMatch[1]), 'utf8')
// Auch eingebettete Skripte vor schließenden Script-Tags im Code schützen.
const safeJavascript = javascript.replace(/<\/script/gi, '<\\/script')
html = html.replace(scriptMatch[0], () => `<script type="module">${safeJavascript}</script>`)

const favicon = await readFile(resolve(docsDir, 'favicon.svg'), 'utf8')
const faviconData = `data:image/svg+xml;base64,${Buffer.from(favicon).toString('base64')}`
html = html.replace(/href="\.\/favicon\.svg"/, `href="${faviconData}"`)

// Das Titelbild muss auch beim direkten Öffnen der HTML-Datei funktionieren.
const giftImageBuffer = await readFile(resolve(root, 'public', 'geschenkbox.png'))
const giftImageData = `data:image/png;base64,${giftImageBuffer.toString('base64')}`

// Kompatibilitätsskripte für die lokale Offline-Ansicht direkt einbetten.
for (const scriptName of ['animation-upgrade.js', 'hero-upgrade.js', 'validation-feedback.js']) {
  const tag = `<script src="./${scriptName}" defer></script>`
  if (html.includes(tag)) {
    const source = (await readFile(resolve(docsDir, scriptName), 'utf8')).replace(/<\/script/gi, '<\\/script').replaceAll('./geschenkbox.png', giftImageData)
    html = html.replace(tag, `<script>${source}</script>`)
  }
}

// Die ältere vorkompilierte Version zeigt so Hinweise zu fehlenden Pflichtangaben.
const extraStyleTag = '<link rel="stylesheet" href="./validation-feedback.css">'
if (html.includes(extraStyleTag)) {
  const extraStyle = await readFile(resolve(docsDir, 'validation-feedback.css'), 'utf8')
  html = html.replace(extraStyleTag, () => `<style>${extraStyle}</style>`)
}
await writeFile(resolve(root, 'WEBSEITE_OEFFNEN.html'), html, 'utf8')
