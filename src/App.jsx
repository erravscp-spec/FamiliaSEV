import { useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Login from './components/Login'
import Gravidez from './components/Gravidez'
import Checklist from './components/Checklist'
import Supermercado from './components/Supermercado'
import Calendario from './components/Calendario'
import Financas from './components/Financas'

const SEPARADORES = [
  { id: 'gravidez', label: 'Gravidez', icone: '🤰' },
  { id: 'checklist', label: 'Checklist', icone: '🛒' },
  { id: 'supermercado', label: 'Mercado', icone: '🛍️' },
  { id: 'calendario', label: 'Calendário', icone: '📅' },
  { id: 'financas', label: 'Finanças', icone: '💰' },
]

export default function App() {
  const [user, setUser] = useState(undefined) // undefined = a verificar, null = sem sessão
  const [separadorAtivo, setSeparadorAtivo] = useState('gravidez')
  const [utilizador, setUtilizador] = useState(() => localStorage.getItem('quemSouEu') || null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u))
    return unsub
  }, [])

  function escolherUtilizador(nome) {
    localStorage.setItem('quemSouEu', nome)
    setUtilizador(nome)
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-clay-50">
        <p className="text-ink-800/40">A carregar…</p>
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  // Depois de autenticado, perguntar quem está a usar (para identificar registos de finanças)
  if (!utilizador) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-clay-50 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-3">👋</div>
          <h1 className="font-display text-2xl text-ink-900 font-semibold mb-6">Quem é que está a usar?</h1>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => escolherUtilizador('Eduardo')}
              className="focus-ring flex-1 bg-white border border-clay-200 hover:border-clay-400 rounded-xl2 py-6 font-medium text-ink-900 transition"
            >
              Eduardo
            </button>
            <button
              onClick={() => escolherUtilizador('Sara')}
              className="focus-ring flex-1 bg-white border border-clay-200 hover:border-clay-400 rounded-xl2 py-6 font-medium text-ink-900 transition"
            >
              Sara
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-clay-50 pb-24 sm:pb-8">
      {/* Cabeçalho */}
      <header className="bg-white border-b border-clay-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <h1 className="font-display text-lg font-semibold text-ink-900">O Nosso Cantinho</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { localStorage.removeItem('quemSouEu'); setUtilizador(null) }}
              className="focus-ring text-sm text-ink-800/50 hover:text-ink-900 transition"
            >
              {utilizador}
            </button>
            <button
              onClick={() => signOut(auth)}
              className="focus-ring text-sm text-ink-800/40 hover:text-red-500 transition"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Navegação desktop */}
        <nav className="max-w-2xl mx-auto px-4 hidden sm:flex gap-1 -mb-px overflow-x-auto">
          {SEPARADORES.map((sep) => (
            <button
              key={sep.id}
              onClick={() => setSeparadorAtivo(sep.id)}
              className={`focus-ring px-4 py-3 text-sm font-medium border-b-2 transition ${
                separadorAtivo === sep.id
                  ? 'border-clay-500 text-clay-700'
                  : 'border-transparent text-ink-800/50 hover:text-ink-900'
              }`}
            >
              {sep.icone} {sep.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Conteúdo */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {separadorAtivo === 'gravidez' && <Gravidez />}
        {separadorAtivo === 'checklist' && <Checklist />}
        {separadorAtivo === 'supermercado' && <Supermercado />}
        {separadorAtivo === 'calendario' && <Calendario />}
        {separadorAtivo === 'financas' && <Financas utilizador={utilizador} />}
      </main>

      {/* Navegação mobile (fixa no fundo) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-clay-100 flex">
        {SEPARADORES.map((sep) => (
          <button
            key={sep.id}
            onClick={() => setSeparadorAtivo(sep.id)}
            className={`focus-ring flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition ${
              separadorAtivo === sep.id ? 'text-clay-600' : 'text-ink-800/40'
            }`}
          >
            <span className="text-base">{sep.icone}</span>
            {sep.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
