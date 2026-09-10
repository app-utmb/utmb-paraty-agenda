import { useCallback, useEffect, useMemo, useState } from 'react'
import { CHAVE_ABA, ehAba, type Aba } from './abas'
import { DetalheBeneficio } from './components/DetalheBeneficio'
import { DetalheItem } from './components/DetalheItem'
import { IconeNuvemCortada } from './components/Icones'
import { NavInferior } from './components/NavInferior'
import { PuxarParaAtualizar } from './components/PuxarParaAtualizar'
import { ReguaPatrocinadores } from './components/ReguaPatrocinadores'
import { SeletorIdioma } from './components/SeletorIdioma'
import { StatusAtualizacao } from './components/StatusAtualizacao'
import type { Beneficio, ItemProgramacao } from './data/types'
import type { Idioma } from './data/types'
import { DICIONARIOS, IdiomaContext, LOCALES, idiomaInicial, salvarIdioma } from './i18n'
import { Beneficios } from './screens/Beneficios'
import { GuiaAtleta } from './screens/GuiaAtleta'
import { Inicio } from './screens/Inicio'
import { Info } from './screens/Info'
import { MapaExpo } from './screens/MapaExpo'
import { Programacao } from './screens/Programacao'
import { useDados } from './useDados'

/** Ponto para os testes fixarem o "agora" das telas de Inicio e Programacao. */
interface Props {
  referencia?: Date
}

export function App({ referencia }: Props = {}) {
  const [idioma, setIdiomaEstado] = useState<Idioma>(() => idiomaInicial())
  const [aba, setAba] = useState<Aba>(() => {
    try {
      const salva = localStorage.getItem(CHAVE_ABA)
      if (ehAba(salva)) return salva
    } catch {
      // Sem armazenamento: abre no Inicio.
    }
    return 'inicio'
  })
  const [itemAberto, setItemAberto] = useState<ItemProgramacao | null>(null)
  const [beneficioAberto, setBeneficioAberto] = useState<Beneficio | null>(null)
  const { dados, carregando, atualizando, erroRede, atualizar } = useDados()

  const definirIdioma = useCallback((novo: Idioma) => {
    setIdiomaEstado(novo)
    salvarIdioma(novo)
  }, [])

  const trocarAba = useCallback((nova: Aba) => {
    setAba(nova)
    setItemAberto(null)
    setBeneficioAberto(null)
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

  const contexto = useMemo(
    () => ({ idioma, definirIdioma, t: DICIONARIOS[idioma] }),
    [idioma, definirIdioma],
  )
  const t = contexto.t

  const config = dados?.config

  return (
    <IdiomaContext.Provider value={contexto}>
      <a className="pular-para-conteudo" href="#conteudo">
        {t.abas.programacao}
      </a>

      <div className="app">
        <header className="cabecalho">
          <div className="cabecalho__marca">
            <p className="cabecalho__nome">{config?.eventoNome ?? 'Paraty Brazil by UTMB'}</p>
            <span className="cabecalho__datas">{config?.eventoDatas ?? ''}</span>
          </div>
          <SeletorIdioma />
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
                {aba === 'inicio' && (
                  <Inicio
                    dados={dados}
                    aoAbrirItem={setItemAberto}
                    aoIrPara={trocarAba}
                    referencia={referencia}
                  />
                )}
                {aba === 'programacao' && (
                  <Programacao
                    dados={dados}
                    aoAbrirItem={setItemAberto}
                    referencia={referencia}
                  />
                )}
                {aba === 'beneficios' && (
                  <Beneficios beneficios={dados.beneficios} aoAbrir={setBeneficioAberto} />
                )}
                {aba === 'mapa' && <MapaExpo config={dados.config} />}
                {aba === 'guia' && <GuiaAtleta config={dados.config} />}
                {aba === 'info' && <Info dados={dados} />}

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
            <ReguaPatrocinadores url={config?.reguaPatrocinadoresUrl ?? ''} />
            <NavInferior ativa={aba} aoTrocar={trocarAba} />
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
    </IdiomaContext.Provider>
  )
}
