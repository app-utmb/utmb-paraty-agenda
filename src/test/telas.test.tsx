import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GuiaAtleta } from '../screens/GuiaAtleta'
import { Inicio } from '../screens/Inicio'
import { Info } from '../screens/Info'
import { MapaExpo } from '../screens/MapaExpo'
import { Programacao } from '../screens/Programacao'
import { DetalheItem } from '../components/DetalheItem'
import { ReguaPatrocinadores } from '../components/ReguaPatrocinadores'
import { CONFIG_PADRAO } from '../data/normalize'
import type { ItemProgramacao } from '../data/types'
import { DURANTE_KIT, dadosDeTeste } from './fixtures'
import { renderizar, screen, within } from './utilitarios'

const dados = dadosDeTeste()
const item = (id: string) => dados.itens.find((i) => i.id === id) as ItemProgramacao

describe('tela Inicio', () => {
  it('mostra o que esta acontecendo agora', () => {
    renderizar(
      <Inicio dados={dados} aoAbrirItem={vi.fn()} aoIrPara={vi.fn()} referencia={DURANTE_KIT} />,
    )
    const secao = screen.getByRole('region', { name: /acontecendo agora/i })
    expect(within(secao).getByText('Retirada de kits')).toBeInTheDocument()
  })

  it('mostra os proximos itens em ordem', () => {
    renderizar(
      <Inicio dados={dados} aoAbrirItem={vi.fn()} aoIrPara={vi.fn()} referencia={DURANTE_KIT} />,
    )
    const secao = screen.getByRole('region', { name: /a seguir/i })
    const titulos = within(secao)
      .getAllByRole('button')
      .map((b) => b.textContent ?? '')
    expect(titulos[0]).toContain('Nutricao no ultra')
    expect(titulos[1]).toContain('Teste de calcados')
  })

  it('avisa quando nao ha nada acontecendo', () => {
    renderizar(
      <Inicio
        dados={dados}
        aoAbrirItem={vi.fn()}
        aoIrPara={vi.fn()}
        referencia={new Date('2026-09-17T03:00:00-03:00')}
      />,
    )
    expect(screen.getByText(/nada acontecendo neste momento/i)).toBeInTheDocument()
  })

  it('leva para as outras abas pelos atalhos', async () => {
    const irPara = vi.fn()
    renderizar(
      <Inicio dados={dados} aoAbrirItem={vi.fn()} aoIrPara={irPara} referencia={DURANTE_KIT} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /ver programação/i }))
    expect(irPara).toHaveBeenCalledWith('programacao')
    await userEvent.click(screen.getByRole('button', { name: /mapa da expo/i }))
    expect(irPara).toHaveBeenCalledWith('mapa')
  })

  it('abre o detalhe ao tocar em um item', async () => {
    const abrir = vi.fn()
    renderizar(
      <Inicio dados={dados} aoAbrirItem={abrir} aoIrPara={vi.fn()} referencia={DURANTE_KIT} />,
    )
    await userEvent.click(screen.getByText('Retirada de kits'))
    expect(abrir).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }))
  })
})

describe('tela Programacao', () => {
  const abrir = () =>
    renderizar(<Programacao dados={dados} aoAbrirItem={vi.fn()} referencia={DURANTE_KIT} />)

  it('abre no dia de hoje quando o evento esta rolando', () => {
    abrir()
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent('17')
  })

  it('abre no filtro Todos com a programacao completa do dia', () => {
    abrir()
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('Retirada de kits')).toBeInTheDocument()
    expect(screen.getByText('Nutricao no ultra')).toBeInTheDocument()
    expect(screen.getByText('Teste de calcados')).toBeInTheDocument()
  })

  it('lista os itens em ordem de horario com o destaque no topo', () => {
    abrir()
    const lista = screen.getByRole('tabpanel')
    const titulos = within(lista)
      .getAllByRole('button')
      .map((b) => b.textContent ?? '')
    expect(titulos[0]).toContain('Retirada de kits')
    expect(titulos[1]).toContain('Nutricao no ultra')
  })

  it('filtra por pilar', async () => {
    abrir()
    await userEvent.click(screen.getByRole('button', { name: 'Talks' }))
    expect(screen.getByText('Nutricao no ultra')).toBeInTheDocument()
    expect(screen.queryByText('Retirada de kits')).not.toBeInTheDocument()
    expect(screen.queryByText('Teste de calcados')).not.toBeInTheDocument()
  })

  it('troca de dia', async () => {
    abrir()
    await userEvent.click(screen.getByRole('tab', { name: /18/ }))
    expect(screen.getByText('Largada 100K')).toBeInTheDocument()
    expect(screen.queryByText('Retirada de kits')).not.toBeInTheDocument()
  })

  it('mostra a mensagem de vazio quando o filtro nao acha nada', async () => {
    abrir()
    await userEvent.click(screen.getByRole('tab', { name: /18/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Talks' }))
    expect(screen.getByText(/nenhum item para este filtro/i)).toBeInTheDocument()
  })

  it('conta os itens visiveis', async () => {
    abrir()
    expect(screen.getByText('3 itens')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Talks' }))
    expect(screen.getByText('1 item')).toBeInTheDocument()
  })

  it('mostra a etiqueta de inscricao apenas quando nao e entrada livre', () => {
    abrir()
    expect(screen.getByText('Inscrição prévia')).toBeInTheDocument()
    expect(screen.queryByText('Entrada livre')).not.toBeInTheDocument()
  })

  it('mostra os dias oficiais quando a planilha esta vazia', () => {
    renderizar(
      <Programacao
        dados={dadosDeTeste({ itens: [] })}
        aoAbrirItem={vi.fn()}
        referencia={DURANTE_KIT}
      />,
    )
    expect(screen.getAllByRole('tab')).toHaveLength(4)
  })
})

describe('detalhe do item', () => {
  it('mostra horario, local, palestrante e descricao', () => {
    renderizar(<DetalheItem item={item('a2')} aoFechar={vi.fn()} />)
    const dialogo = screen.getByRole('dialog')
    expect(within(dialogo).getByRole('heading', { name: 'Nutricao no ultra' })).toBeInTheDocument()
    expect(within(dialogo).getByText(/14:00 - 14:45/)).toBeInTheDocument()
    expect(within(dialogo).getByText('Palco Expo')).toBeInTheDocument()
    expect(within(dialogo).getByText('Ana Souza')).toBeInTheDocument()
    expect(within(dialogo).getByText('Estrategia de calorias')).toBeInTheDocument()
  })

  it('mostra o botao de inscricao com o link da planilha', () => {
    renderizar(<DetalheItem item={item('a3')} aoFechar={vi.fn()} />)
    const link = screen.getByRole('link', { name: /fazer inscrição/i })
    expect(link).toHaveAttribute('href', 'https://exemplo.com/inscricao')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('nao mostra botao de inscricao em item invite only', () => {
    renderizar(<DetalheItem item={item('a5')} aoFechar={vi.fn()} />)
    expect(screen.queryByRole('link', { name: /fazer inscrição/i })).not.toBeInTheDocument()
    expect(screen.getByText('Invite only')).toBeInTheDocument()
  })

  it('mostra a marca com a logo quando existe', () => {
    renderizar(<DetalheItem item={item('a3')} aoFechar={vi.fn()} />)
    expect(screen.getByText('The North Face')).toBeInTheDocument()
  })

  it('avisa quando o item nao tem descricao', () => {
    renderizar(<DetalheItem item={item('a5')} aoFechar={vi.fn()} />)
    expect(screen.getByText(/sem descrição no momento/i)).toBeInTheDocument()
  })

  it('fecha pelo botao', async () => {
    const fechar = vi.fn()
    renderizar(<DetalheItem item={item('a1')} aoFechar={fechar} />)
    await userEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(fechar).toHaveBeenCalled()
  })

  it('fecha com a tecla Escape', async () => {
    const fechar = vi.fn()
    renderizar(<DetalheItem item={item('a1')} aoFechar={fechar} />)
    await userEvent.keyboard('{Escape}')
    expect(fechar).toHaveBeenCalled()
  })
})

describe('tela Guia do Atleta', () => {
  it('abre o PDF do idioma ativo', () => {
    renderizar(<GuiaAtleta config={dados.config} />, { idioma: 'en' })
    expect(screen.getByRole('link', { name: /open the athlete guide/i })).toHaveAttribute(
      'href',
      'https://drive.google.com/guia-en',
    )
  })

  it('usa o PDF em portugues quando o idioma nao tem link proprio', () => {
    renderizar(<GuiaAtleta config={dados.config} />, { idioma: 'es' })
    expect(screen.getByRole('link', { name: /abrir la guía/i })).toHaveAttribute(
      'href',
      'https://drive.google.com/guia-pt',
    )
  })

  it('avisa quando o guia ainda nao foi publicado', () => {
    renderizar(<GuiaAtleta config={CONFIG_PADRAO} />)
    expect(screen.getByText(/guia ainda não foi publicado/i)).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

describe('tela Mapa da Expo', () => {
  it('mostra a imagem com texto alternativo', () => {
    renderizar(<MapaExpo config={dados.config} />)
    expect(screen.getByRole('img', { name: /planta da área da expo/i })).toHaveAttribute(
      'src',
      'https://exemplo.com/mapa.png',
    )
  })

  it('oferece controles de zoom para quem nao usa pinca', async () => {
    renderizar(<MapaExpo config={dados.config} />)
    const ampliar = screen.getByRole('button', { name: /ampliar/i })
    const reduzir = screen.getByRole('button', { name: /reduzir/i })
    expect(reduzir).toBeDisabled()
    await userEvent.click(ampliar)
    expect(reduzir).toBeEnabled()
  })

  it('avisa quando o mapa ainda nao foi publicado', () => {
    renderizar(<MapaExpo config={CONFIG_PADRAO} />)
    expect(screen.getByText(/mapa ainda não foi publicado/i)).toBeInTheDocument()
  })
})

describe('tela Info', () => {
  it('mostra os links de contato e do evento', () => {
    renderizar(<Info dados={dados} />)
    expect(screen.getByRole('link', { name: /ver no mapa/i })).toHaveAttribute(
      'href',
      'https://maps.app.goo.gl/exemplo',
    )
    expect(screen.getByRole('link', { name: /enviar email/i })).toHaveAttribute(
      'href',
      'mailto:paraty@service.utmb.world',
    )
    expect(screen.getByRole('link', { name: /whatsapp/i })).toBeInTheDocument()
  })

  it('explica como instalar e usar offline', () => {
    renderizar(<Info dados={dados} />)
    expect(screen.getByText(/adicionar à tela de início/i)).toBeInTheDocument()
    expect(screen.getByText(/funciona sem internet/i)).toBeInTheDocument()
  })

  it('mostra a origem dos dados', () => {
    renderizar(<Info dados={dadosDeTeste({ origem: 'cache' })} />)
    expect(screen.getByText(/última versão salva no aparelho/i)).toBeInTheDocument()
  })

  it('esconde links que a planilha nao preencheu', () => {
    renderizar(<Info dados={dadosDeTeste({ config: CONFIG_PADRAO })} />)
    expect(screen.queryByRole('link', { name: /whatsapp/i })).not.toBeInTheDocument()
  })
})

describe('regua de patrocinadores', () => {
  it('mostra a imagem da Config', () => {
    renderizar(<ReguaPatrocinadores url="https://exemplo.com/regua.png" />)
    expect(screen.getByRole('img', { name: /patrocinadores/i })).toBeInTheDocument()
  })

  it('nao ocupa espaco quando a Config esta vazia', () => {
    const { container } = renderizar(<ReguaPatrocinadores url="" />)
    expect(container).toBeEmptyDOMElement()
  })
})
