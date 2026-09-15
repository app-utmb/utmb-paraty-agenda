import { useCallback, useEffect, useMemo, useState } from 'react'
import { CHAVE_ABA, abaSalva, abasVisiveis, type Aba } from './abas'
import { DetalheBeneficio } from './components/DetalheBeneficio'
import { DetalheItem } from './components/DetalheItem'
import { DetalheMarca } from './components/DetalheMarca'
import { IconeNuvemCortada } from './components/Icones'
import { NavInferior } from './components/NavInferior'
import { PuxarParaAtualizar } from './components/PuxarParaAtualizar'
import { SeletorIdioma } from './components/SeletorIdioma'
import { SeletorTema } from './components/SeletorTema'
import { StatusAtualizacao } from './components/StatusAtualizacao'
import type { PontoMapa } from './data/mapa'
import type { Beneficio, ItemProgramacao } from './data/types'
import type { Idioma } from './data/types'
import { DICIONARIOS, IdiomaContext, LOCALES, idiomaInicial, salvarIdioma } from './i18n'
import { Ativacoes } from './screens/Ativacoes'
import { GuiaAtleta } from './screens/GuiaAtleta'
import { Inicio } from './screens/Inicio'
import { Info } from './screens/Info'
import { Programacao } from './screens/Programacao'
import { iniciarMetricas, registrar, registrarAba } from './metricas'
import { aplicarTema, proximoTema, salvarTema, temaInicial, type Tema } from './tema'
import { useDados } from './useDados'
import { useFavoritos } from './useFavoritos'

/** Ponto para os testes fixarem o "agora" das telas de Inicio e Programacao. */
interface Props {
  referencia?: Date
}

export function App({ referencia }: Props = {}) {
  const [idioma, setIdiomaEstado] = useState<Idioma>(() => idiomaInicial())
  const [aba, setAba] = useState<Aba>(() => {
    try {
      const salva = abaSalva(localStorage.getItem(CHAVE_ABA))
      if (salva) return salva
    } catch {
      // Sem armazenamento: abre no Inicio.
    }
    return 'inicio'
  })
  const [tema, setTema] = useState<Tema>(() => temaInicial())
  const [itemAberto, setItemAberto] = useState<ItemProgramacao | null>(null)
  const [beneficioAberto, setBeneficioAberto] = useState<Beneficio | null>(null)
  const [pontoAberto, setPontoAberto] = useState<PontoMapa | null>(null)
  const { dados, carregando, atualizando, erroRede, atualizar } = useDados()
  const favoritos = useFavoritos()
  const [agendaAberta, setAgendaAberta] = useState(false)

  const definirIdioma = useCallback((novo: Idioma) => {
    setIdiomaEstado(novo)
    salvarIdioma(novo)
  }, [])

  useEffect(() => {
    iniciarMetricas()
    registrarAba(aba)
    // So a aba de abertura; as trocas seguintes contam em trocarAba.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const abrirItem = useCallback((item: ItemProgramacao | null) => {
    setItemAberto(item)
    if (item) {
      registrar('item_aberto', {
        item_id: item.id,
        titulo: item.titulo.pt,
        pilar: item.pilar,
        marca: item.marca,
        data: item.data,
      })
    }
  }, [])

  const abrirPonto = useCallback((ponto: PontoMapa | null) => {
    setPontoAberto(ponto)
    if (ponto) registrar('marca_aberta', { marca: ponto.nome, estande: ponto.estande || null })
  }, [])

  const trocarAba = useCallback((nova: Aba) => {
    registrarAba(nova)
    setAba(nova)
    setItemAberto(null)
    setBeneficioAberto(null)
    setPontoAberto(null)
    try {
      localStorage.setItem(CHAVE_ABA, nova)
    } catch {
      // Sem armazenamento a aba nao e lembrada, e so isso.
    }
    window.scrollTo({ top: 0 })
  }, [])

  useEffect(() => {
    document.documentElement.lang = LOCALES[idioma]
  }, [idioma])

  useEffect(() => {
    aplicarTema(tema)
  }, [tema])

  const trocarTema = useCallback(() => {
    setTema((atual) => {
      const novo = proximoTema(atual)
      salvarTema(novo)
      return novo
    })
  }, [])

  const contexto = useMemo(
    () => ({ idioma, definirIdioma, t: DICIONARIOS[idioma] }),
    [idioma, definirIdioma],
  )
  const t = contexto.t

  const config = dados?.config
  const temGuia = Boolean(config && Object.values(config.guiaAtletaUrl).some(Boolean))
  const abas = abasVisiveis(temGuia)
  // Aba guardada que deixou de existir, como o Guia sem link, cai no Inicio.
  const abaAtiva: Aba = abas.includes(aba) ? aba : 'inicio'
  const temaAtivo = tema

  return (
    <IdiomaContext.Provider value={contexto}>
      <a className="pular-para-conteudo" href="#conteudo">
        {t.abas.programacao}
      </a>

      <div className="app">
        <header className="cabecalho">
          <div className="cabecalho__marca">
            <img
              className="cabecalho__logo"
              src={`${import.meta.env.BASE_URL}${
                temaAtivo === 'claro' ? 'logo-evento-escura.png' : 'logo-evento.png'
              }`}
              alt={config?.eventoNome ?? 'Paraty Brazil by UTMB'}
              width={900}
              height={479}
            />
          </div>
          <div className="cabecalho__acoes">
            <SeletorTema tema={tema} aoTrocar={trocarTema} />
            <SeletorIdioma />
          </div>
        </header>

        <PuxarParaAtualizar aoAtualizar={atualizar} atualizando={atualizando}>
          <main className="conteudo" id="conteudo" tabIndex={-1}>
            {erroRede && dados && (
              <p className="aviso-offline">
                <IconeNuvemCortada />
                {t.status.semRede}
              </p>
            )}

            {!dados ? (
              <div className="vazio" aria-live="polite">
                <p className="vazio__titulo">
                  {carregando ? t.comum.carregando : t.comum.erro}
                </p>
                {!carregando && (
                  <button
                    type="button"
                    className="botao botao--pequeno"
                    style={{ marginTop: 14 }}
                    onClick={() => void atualizar()}
                  >
                    {t.comum.tentarDeNovo}
                  </button>
                )}
              </div>
            ) : (
              <>
                {abaAtiva === 'inicio' && (
                  <Inicio
                    dados={dados}
                    aoAbrirItem={abrirItem}
                    favoritos={favoritos}
                    aoAbrirAgenda={() => {
                      setAgendaAberta(true)
                      trocarAba('programacao')
                    }}
                    referencia={referencia}
                  />
                )}
                {abaAtiva === 'programacao' && (
                  <Programacao
                    dados={dados}
                    aoAbrirItem={abrirItem}
                    favoritos={favoritos}
                    agendaAberta={agendaAberta}
                    aoAlternarAgenda={setAgendaAberta}
                    referencia={referencia}
                  />
                )}
                {abaAtiva === 'ativacoes' && (
                  <Ativacoes
                    dados={dados}
                    aoAbrirPonto={abrirPonto}
                    aoAbrirBeneficio={setBeneficioAberto}
                  />
                )}
                {abaAtiva === 'guia' && <GuiaAtleta config={dados.config} />}
                {abaAtiva === 'info' && <Info dados={dados} />}

                <StatusAtualizacao
                  dados={dados}
                  atualizando={atualizando}
                  aoAtualizar={() => void atualizar()}
                />
              </>
            )}
          </main>
        </PuxarParaAtualizar>

        <div className="rodape-fixo">
          <div className="rodape-fixo__interno">
            <NavInferior abas={abas} ativa={abaAtiva} aoTrocar={trocarAba} />
          </div>
        </div>
      </div>

      {itemAberto && <DetalheItem item={itemAberto} aoFechar={() => setItemAberto(null)} />}

      {beneficioAberto && (
        <DetalheBeneficio
          beneficio={beneficioAberto}
          aoFechar={() => setBeneficioAberto(null)}
        />
      )}

      {pontoAberto && dados && (
        <DetalheMarca
          ponto={pontoAberto}
          itens={dados.itens}
          beneficios={dados.beneficios}
          aoFechar={() => setPontoAberto(null)}
        />
      )}
    </IdiomaContext.Provider>
  )
}
