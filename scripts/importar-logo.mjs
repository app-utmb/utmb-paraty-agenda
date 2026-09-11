// Importa um logo que chegou como arquivo (PNG, JPG, SVG ou PDF) para
// public/logos/<nome>.png, aparado e encaixado em 256x256 transparente.
//
// Uso:
//   node scripts/importar-logo.mjs <arquivo> <nome> [--escurecer] [--recorte x,y,w,h]
//
// --escurecer  para logo branco com fundo transparente: o app mostra os logos
//              sobre um quadro branco, onde branco some. Recolore em azul escuro.
// --negativo   para logo claro sobre fundo escuro chapado, como um gabarito de
//              testeira: o brilho vira transparencia e o logo sai em azul
//              escuro sobre fundo transparente.
// --recorte    fracoes de 0 a 1 da imagem, para tirar so o logo de uma arte
//              maior.
import { execFile } from 'node:child_process'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, extname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import sharp from 'sharp'

const execArquivo = promisify(execFile)
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [arquivo, nome, ...opcoes] = process.argv.slice(2)
if (!arquivo || !nome) {
  console.error('uso: node scripts/importar-logo.mjs <arquivo> <nome> [--escurecer] [--recorte x,y,w,h]')
  process.exit(1)
}

const LADO = 256
const ESCURO = { r: 11, g: 27, b: 58 }
const escurecer = opcoes.includes('--escurecer')
const negativo = opcoes.includes('--negativo')
const iRecorte = opcoes.indexOf('--recorte')
const recorte = iRecorte >= 0 ? opcoes[iRecorte + 1].split(',').map(Number) : null

let fonte
if (extname(arquivo).toLowerCase() === '.pdf') {
  const tmp = resolve(raiz, `.logo-${nome}.png`)
  await execArquivo('sips', ['-s', 'format', 'png', '--resampleWidth', '1600', arquivo, '--out', tmp])
  fonte = await readFile(tmp)
  await rm(tmp, { force: true })
} else {
  // SVG entra com densidade alta para nao sair borrado.
  fonte = await sharp(await readFile(arquivo), { density: 300 }).png().toBuffer()
}

let img = sharp(fonte).ensureAlpha()
if (recorte) {
  const { width, height } = await img.metadata()
  const [x, y, w, h] = recorte
  img = sharp(
    await img
      .extract({
        left: Math.round(x * width),
        top: Math.round(y * height),
        width: Math.round(w * width),
        height: Math.round(h * height),
      })
      .toBuffer(),
  )
}

if (negativo) {
  const { data, info } = await img.clone().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += info.channels) {
    const brilho = Math.max(data[i], data[i + 1], data[i + 2])
    data[i] = ESCURO.r
    data[i + 1] = ESCURO.g
    data[i + 2] = ESCURO.b
    data[i + 3] = brilho
  }
  img = sharp(data, { raw: info })
}

let buf = await img.trim({ threshold: 12 }).png().toBuffer()

if (escurecer) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += info.channels) {
    data[i] = ESCURO.r
    data[i + 1] = ESCURO.g
    data[i + 2] = ESCURO.b
  }
  buf = await sharp(data, { raw: info }).png().toBuffer()
}

const png = await sharp(buf)
  .resize(LADO, LADO, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toBuffer()
await writeFile(resolve(raiz, 'public/logos', `${nome}.png`), png)
console.log(`public/logos/${nome}.png, ${Math.round(png.length / 1024)} KB`)
