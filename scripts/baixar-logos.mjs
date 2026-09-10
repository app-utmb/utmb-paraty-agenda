// Baixa as logos das marcas a partir dos links do Google Drive,
// converte para PNG, apara a margem em branco e padroniza o tamanho.
// Rode com: node scripts/baixar-logos.mjs
//
// O Drive bloqueia hotlink de imagem, entao as logos ficam no repositorio
// e sao servidas pelo proprio app. Ver README, secao "Logos das marcas".
import { execFile } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import sharp from 'sharp'

const execArquivo = promisify(execFile)
const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const destino = resolve(raiz, 'public/logos')
const temporario = resolve(raiz, '.logos-tmp')

const LADO = 256

/** Marca e o id do arquivo no Google Drive. */
const LOGOS = [
  ['columbia', null],
  ['hoka', '1Gqfs99XpPvNwscEv_Z5_QdDwxyqqBLby'],
  ['tricky', '1Ogu8hHX_-uMORCLn3bC5mu56zXd7m4JQ'],
  ['vivas-move', '1j83d7-6svxQJqvCvra1NedfFysMyTAwf'],
  ['coros', '1XDr6ZsrpUC88goVPwT4LyYJMIv1F2UfC'],
  ['nnormal', '1sSw1jY5QUZUXyqTEc4hFEWX_Uu8llGgG'],
  ['runlastic', '1vfX7pAfCq2NBvFUPTKO_FaljzLiqNKmQ'],
  ['aimo', '1D8FG1cBucWdw9TXsKzcvwqW8Mq5L9O-p'],
  ['bananinha', '1WNuBcaXs11-Kw-pEk_6jm6_n-hBqaHyN'],
  ['expedition', '1X2gj5eBnYYJW3CXNxGpFHksrma7wOYLb'],
  ['nautika', '1U4vAgUuNUGVGUNfzdFvxrJw_0BtIB0yh'],
  ['sumaca', '1EJX6z0NE_c7spEqgqsbw5uUyhFj5P7bJ'],
  ['yopp', '1K2EE6nNz09YKwqoOpZnj6CplFNr2ZpEl'],
  // Estas duas marcas mandaram pasta em vez de arquivo. Os ids abaixo sao o
  // PNG escolhido dentro da pasta de cada uma.
  ['dr-peanut', '1vObA9zY89npFn3yc5b_BH7ys9Ohf8nNL'],
  ['liquidz', '1cx7vIr_31V1ZWsIiA967DNdukm0AdjtO'],
]

async function baixar(id, caminho) {
  const resp = await fetch(`https://drive.google.com/uc?export=download&id=${id}`, {
    redirect: 'follow',
  })
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
  const buf = Buffer.from(await resp.arrayBuffer())
  await writeFile(caminho, buf)
  return buf
}

/** PDF vira PNG pelo sips, que ja vem no macOS. */
async function paraPng(entrada, saida) {
  await execArquivo('sips', ['-s', 'format', 'png', entrada, '--out', saida])
  return readFile(saida)
}

/** Apara a moldura vazia e encaixa num quadrado com fundo transparente. */
async function padronizar(buf) {
  const aparado = await sharp(buf).trim({ threshold: 12 }).toBuffer()
  return sharp(aparado)
    .resize(LADO, LADO, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
}

await mkdir(destino, { recursive: true })
await mkdir(temporario, { recursive: true })

const feitos = []
const falhos = []

for (const [marca, id] of LOGOS) {
  if (!id) {
    falhos.push(`${marca}: sem arquivo, a marca ainda nao enviou`)
    continue
  }
  try {
    const bruto = resolve(temporario, `${marca}.bin`)
    const buf = await baixar(id, bruto)
    const ehPdf = buf.subarray(0, 4).toString('latin1') === '%PDF'
    const fonte = ehPdf ? await paraPng(bruto, resolve(temporario, `${marca}.png`)) : buf
    const png = await padronizar(fonte)
    await writeFile(resolve(destino, `${marca}.png`), png)
    const { width, height } = await sharp(png).metadata()
    feitos.push(`${marca}.png (${width}x${height}, ${Math.round(png.length / 1024)} KB)`)
  } catch (erro) {
    falhos.push(`${marca}: ${erro instanceof Error ? erro.message : 'falhou'}`)
  }
}

await rm(temporario, { recursive: true, force: true })

console.log(`\n${feitos.length} logos prontas:`)
feitos.forEach((l) => console.log('  ' + l))
if (falhos.length) {
  console.log(`\n${falhos.length} pendentes:`)
  falhos.forEach((l) => console.log('  ' + l))
}
