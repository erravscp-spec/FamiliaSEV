import { useState, useEffect } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const DATA_PREVISTA = new Date('2026-12-13T00:00:00')
const DURACAO_TOTAL_DIAS = 280 // 40 semanas, ponto de partida convencional

function calcularProgresso() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const dataPrevistaZero = new Date(DATA_PREVISTA)
  dataPrevistaZero.setHours(0, 0, 0, 0)

  const msPorDia = 1000 * 60 * 60 * 24
  const diasRestantes = Math.round((dataPrevistaZero - hoje) / msPorDia)
  const diasDecorridos = DURACAO_TOTAL_DIAS - diasRestantes

  const semanaAtual = Math.floor(diasDecorridos / 7)
  const diaDaSemana = diasDecorridos % 7

  let trimestre = 1
  if (semanaAtual >= 27) trimestre = 3
  else if (semanaAtual >= 13) trimestre = 2

  const percentagem = Math.min(100, Math.max(0, (diasDecorridos / DURACAO_TOTAL_DIAS) * 100))

  return { diasRestantes, semanaAtual, diaDaSemana, trimestre, percentagem }
}

export default function Gravidez() {
  const [progresso, setProgresso] = useState(calcularProgresso())
  const [notas, setNotas] = useState([])
  const [novaNota, setNovaNota] = useState('')
  const [aGuardar, setAGuardar] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setProgresso(calcularProgresso()), 1000 * 60 * 60)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const q = query(collection(db, 'marcos'), orderBy('criadoEm', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setNotas(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  async function adicionarNota(e) {
    e.preventDefault()
    if (!novaNota.trim()) return
    setAGuardar(true)
    try {
      await addDoc(collection(db, 'marcos'), {
        texto: novaNota.trim(),
        criadoEm: serverTimestamp(),
      })
      setNovaNota('')
    } finally {
      setAGuardar(false)
    }
  }

  async function removerNota(id) {
    await deleteDoc(doc(db, 'marcos', id))
  }

  const { diasRestantes, semanaAtual, diaDaSemana, trimestre, percentagem } = progresso
  const raio = 88
  const circunferencia = 2 * Math.PI * raio
  const offset = circunferencia - (percentagem / 100) * circunferencia

  return (
    <div className="space-y-6">
      {/* Anel de progresso - elemento principal */}
      <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="relative w-56 h-56 shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
              <circle cx="100" cy="100" r={raio} fill="none" stroke="#F5E8DC" strokeWidth="14" />
              <circle
                cx="100" cy="100" r={raio} fill="none"
                stroke="#B86F42" strokeWidth="14" strokeLinecap="round"
                strokeDasharray={circunferencia}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-5xl font-semibold text-clay-700 tabular-nums">
                {diasRestantes > 0 ? diasRestantes : 0}
              </span>
              <span className="text-ink-800/60 text-sm mt-1">
                {diasRestantes > 0 ? 'dias até ao parto' : diasRestantes === 0 ? 'é hoje!' : 'dias depois da data'}
              </span>
            </div>
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <p className="text-ink-800/50 text-sm uppercase tracking-wide">Semana de gravidez</p>
              <p className="font-display text-2xl text-ink-900 font-medium">
                Semana {semanaAtual}{diaDaSemana > 0 ? ` + ${diaDaSemana} dia${diaDaSemana > 1 ? 's' : ''}` : ''}
              </p>
            </div>
            <div>
              <p className="text-ink-800/50 text-sm uppercase tracking-wide">Trimestre</p>
              <p className="font-display text-xl text-sage-700 font-medium">{trimestre}º trimestre</p>
            </div>
            <div>
              <p className="text-ink-800/50 text-sm uppercase tracking-wide">Data prevista</p>
              <p className="text-ink-900">13 de dezembro de 2026</p>
            </div>
          </div>
        </div>
      </div>

      {/* Marcos e notas */}
      <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-6">
        <h2 className="font-display text-xl text-ink-900 font-medium mb-4">Marcos e notas</h2>

        <form onSubmit={adicionarNota} className="flex gap-2 mb-5">
          <input
            type="text"
            value={novaNota}
            onChange={(e) => setNovaNota(e.target.value)}
            placeholder="Ex: Ecografia das 20 semanas — tudo bem"
            className="focus-ring flex-1 rounded-lg border border-clay-200 px-3.5 py-2.5 text-ink-900 placeholder:text-ink-800/30 focus:border-clay-400 outline-none transition"
          />
          <button
            type="submit"
            disabled={aGuardar}
            className="focus-ring bg-sage-500 hover:bg-sage-600 disabled:opacity-60 text-white font-medium rounded-lg px-5 transition shrink-0"
          >
            Adicionar
          </button>
        </form>

        {notas.length === 0 ? (
          <p className="text-ink-800/40 text-sm text-center py-6">Ainda não há marcos registados. Adiciona o primeiro acima.</p>
        ) : (
          <ul className="space-y-2">
            {notas.map((nota) => (
              <li key={nota.id} className="flex items-start justify-between gap-3 bg-clay-50 rounded-lg px-4 py-3">
                <div>
                  <p className="text-ink-900">{nota.texto}</p>
                  {nota.criadoEm?.toDate && (
                    <p className="text-xs text-ink-800/40 mt-1">
                      {nota.criadoEm.toDate().toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removerNota(nota.id)}
                  className="focus-ring text-ink-800/30 hover:text-red-500 transition shrink-0"
                  aria-label="Remover nota"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
