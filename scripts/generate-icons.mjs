// Gera os icones do app e a imagem de compartilhamento a partir da logo
// oficial em branco, sobre o azul-marinho da marca.
// Rode com: npm run icons
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const LOGO = resolve(raiz, 'public/logo-evento.png')
/** Azul-marinho do titulo do mapa oficial do evento. */
const MARINHO = '#000840'

/** Logo branca centralizada num retangulo marinho, ocupando `fracao` da largura. */
async function arte(largura, altura, fracao) {
  const logo = await sharp(LOGO)
    .resize({ width: Math.round(largura * fracao), height: Math.round(altura * fracao), fit: 'inside' })
    .png()
    .toBuffer()
  return sharp({ create: { width: largura, height: altura, channels: 4, background: MARINHO } })
    .composite([{ input: logo, gravity: 'center' }])
    .flatten({ background: MARINHO })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

await mkdir(resolve(raiz, 'public/icons'), { recursive: true })
const saidas = [
  // O iPhone nao respeita transparencia no atalho, entao o fundo e chapado.
  ['icons/apple-touch-icon.png', 180, 180, 0.74],
  ['icons/icon-192.png', 192, 192, 0.74],
  ['icons/icon-512.png', 512, 512, 0.74],
  // Maskable: o Android recorta em circulo, a arte fica na zona segura central.
  ['icons/icon-maskable-512.png', 512, 512, 0.56],
  ['favicon.png', 64, 64, 0.84],
  // Previa do link no WhatsApp e redes sociais.
  ['og.png', 1200, 630, 0.52],
]
for (const [arquivo, l, a, f] of saidas) {
  await writeFile(resolve(raiz, 'public', arquivo), await arte(l, a, f))
  console.log(`gerado ${arquivo} (${l}x${a})`)
}
