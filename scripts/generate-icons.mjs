// Gera os icones PNG do PWA a partir do favicon.svg.
// Rode com: npm run icons
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const origem = resolve(raiz, 'public/favicon.svg')
const destino = resolve(raiz, 'public/icons')

const FUNDO = { r: 7, g: 13, b: 28, alpha: 1 }

const saidas = [
  { nome: 'icon-192.png', tamanho: 192, margem: 0 },
  { nome: 'icon-512.png', tamanho: 512, margem: 0 },
  { nome: 'apple-touch-icon.png', tamanho: 180, margem: 0 },
  // Maskable precisa de area de seguranca: o desenho ocupa 80% do quadro.
  { nome: 'icon-maskable-512.png', tamanho: 512, margem: 0.1 },
]

await mkdir(destino, { recursive: true })
const svg = await readFile(origem)

for (const { nome, tamanho, margem } of saidas) {
  const interno = Math.round(tamanho * (1 - margem * 2))
  const deslocamento = Math.round((tamanho - interno) / 2)
  const desenho = await sharp(svg).resize(interno, interno).png().toBuffer()
  const png = await sharp({
    create: { width: tamanho, height: tamanho, channels: 4, background: FUNDO },
  })
    .composite([{ input: desenho, top: deslocamento, left: deslocamento }])
    .png()
    .toBuffer()
  await writeFile(resolve(destino, nome), png)
  console.log(`gerado ${nome} (${tamanho}x${tamanho})`)
}
