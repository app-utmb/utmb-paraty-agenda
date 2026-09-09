// Gera planilha/Paraty-Agenda.xlsx com as abas Programacao e Config,
// a partir dos CSVs em planilha/. Rode com: npm run planilha
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ExcelJS from 'exceljs'

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/** Leitor de CSV simples, suficiente para os arquivos que nos mesmos geramos. */
function lerCsv(caminho) {
  const texto = readFileSync(caminho, 'utf8').replace(/\r\n/g, '\n').trimEnd()
  const linhas = []
  let campo = ''
  let linha = []
  let aspas = false
  for (let i = 0; i < texto.length; i += 1) {
    const c = texto[i]
    if (aspas) {
      if (c === '"' && texto[i + 1] === '"') {
        campo += '"'
        i += 1
      } else if (c === '"') aspas = false
      else campo += c
    } else if (c === '"') aspas = true
    else if (c === ',') {
      linha.push(campo)
      campo = ''
    } else if (c === '\n') {
      linha.push(campo)
      linhas.push(linha)
      linha = []
      campo = ''
    } else campo += c
  }
  linha.push(campo)
  linhas.push(linha)
  return linhas
}

const livro = new ExcelJS.Workbook()
livro.creator = 'Paraty Brazil by UTMB'

for (const [aba, arquivo, larguras] of [
  ['Programacao', 'planilha/Programacao.csv', [12, 12, 14, 12, 10, 11, 34, 34, 34, 44, 44, 44, 24, 24, 24, 18, 18, 30, 12, 30, 10]],
  ['Config', 'planilha/Config.csv', [30, 60]],
]) {
  const folha = livro.addWorksheet(aba, { views: [{ state: 'frozen', ySplit: 1 }] })
  const linhas = lerCsv(resolve(raiz, arquivo))
  linhas.forEach((l) => folha.addRow(l))
  folha.getRow(1).font = { bold: true }
  folha.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0E1729' },
  }
  folha.getRow(1).font = { bold: true, color: { argb: 'FFF2F6FF' } }
  larguras.forEach((w, i) => {
    folha.getColumn(i + 1).width = w
  })
  folha.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: linhas[0].length } }
}

const destino = resolve(raiz, 'planilha/Paraty-Agenda.xlsx')
writeFileSync(destino, Buffer.from(await livro.xlsx.writeBuffer()))
console.log('gerado', destino)
