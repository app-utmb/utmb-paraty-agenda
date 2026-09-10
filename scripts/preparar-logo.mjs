// Gera as duas versoes da logo do evento a partir do PNG branco original.
// Rode com: node scripts/preparar-logo.mjs [caminho-do-png]
//
// A arte vem em branco com fundo transparente, o que so funciona sobre o
// tema escuro. Para o tema claro a mesma silhueta e recolorida em azul
// escuro. O "BY UTMB" tem as letras vazadas, entao no tema claro elas
// mostram o fundo da tela e continuam legiveis.
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const origem = process.argv[2] ?? '/Users/phi/Downloads/png-branco.png'
const LARGURA = 900
const ESCURO = { r: 11, g: 27, b: 58 }

const base = sharp(origem).trim({ threshold: 1 }).resize({ width: LARGURA })

const claro = await base.clone().png({ compressionLevel: 9 }).toBuffer()
await writeFile(resolve(raiz, 'public/logo-evento.png'), claro)

// Mantem a mascara de transparencia e troca o branco pelo azul escuro.
const { data, info } = await base.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true })
for (let i = 0; i < data.length; i += info.channels) {
  data[i] = ESCURO.r
  data[i + 1] = ESCURO.g
  data[i + 2] = ESCURO.b
}
const escuro = await sharp(data, { raw: info }).png({ compressionLevel: 9 }).toBuffer()
await writeFile(resolve(raiz, 'public/logo-evento-escura.png'), escuro)

const m = await sharp(claro).metadata()
console.log(`logo-evento.png (branca) e logo-evento-escura.png: ${m.width}x${m.height}`)
