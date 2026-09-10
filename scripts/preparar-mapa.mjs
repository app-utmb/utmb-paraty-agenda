// Gera public/mapa-expo.png a partir do PDF do Mapa Village UTMB 2026.
// Rode com: node scripts/preparar-mapa.mjs [caminho-do-pdf]
//
// Duas areas saem do mapa interativo por decisao do evento: o CAEX e o
// estacionamento de carga e descarga. Elas sao pintadas de branco em vez de
// recortadas, para o mapa manter as proporcoes e a legenda de setores.
import { execFile } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import sharp from 'sharp'

const execArquivo = promisify(execFile)
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pdf = process.argv[2] ?? '/Users/phi/Downloads/mapa expo 2026.pdf'
const LARGURA = 2880

/** Retangulos a esconder, em fracao da largura e da altura da imagem. */
const ESCONDER = [
  // Estacionamento, carga e descarga.
  { x: 0.855, y: 0.278, w: 0.125, h: 0.44 },
  // CAEX e a seta que aponta para ele.
  { x: 0.783, y: 0.165, w: 0.072, h: 0.205 },
]

const bruto = resolve(raiz, '.mapa-bruto.png')
await execArquivo('sips', ['-s', 'format', 'png', '--resampleWidth', String(LARGURA), pdf, '--out', bruto])

const base = sharp(bruto).flatten({ background: '#ffffff' })
const { width, height } = await base.metadata()
if (!width || !height) throw new Error('nao consegui ler o tamanho do mapa')

const tampas = ESCONDER.map((r) => ({
  input: {
    create: {
      width: Math.round(r.w * width),
      height: Math.round(r.h * height),
      channels: 4,
      background: '#ffffff',
    },
  },
  left: Math.round(r.x * width),
  top: Math.round(r.y * height),
}))

const png = await base.composite(tampas).png({ compressionLevel: 9 }).toBuffer()
await writeFile(resolve(raiz, 'public/mapa-expo.png'), png)
await execArquivo('rm', ['-f', bruto])
console.log(`mapa-expo.png ${width}x${height}, ${Math.round(png.length / 1024)} KB`)
