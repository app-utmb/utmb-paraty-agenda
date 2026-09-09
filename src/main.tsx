import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { App } from './App'
import './styles/global.css'

// Atualiza o service worker em silencio: o atleta sempre pega a versao
// mais nova do app sem precisar fazer nada.
registerSW({ immediate: true })

const raiz = document.getElementById('root')
if (raiz) {
  createRoot(raiz).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
