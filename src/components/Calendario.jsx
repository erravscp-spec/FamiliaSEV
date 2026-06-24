import { useState, useEffect, useMemo } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const NOMES_MES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]
const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function chaveData(date) {
  const ano = date.getFullYear()
  const mes = String(date.getMonth() + 1).padStart(2, '0')
  const dia = String(date.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}` // YYYY-MM-DD, sempre na hora local
}

export default function Calendario() {
  const hoje = new Date()
  const [mesAtual, setMesAtual] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1))
  const [diaSelecionado, setDiaSelecionado] = useState(chaveData(hoje))
  const [eventos, setEventos] = useState([])
  const [novoTexto, setNovoTexto] = useState('')

  useEffect(() => {
    const q = query(collection(db, 'eventos'), orderBy('data', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setEventos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const eventosPorDia = useMemo(() => {
    const mapa = {}
    eventos.forEach((ev) => {
      if (!mapa[ev.data]) mapa[ev.data] = []
      mapa[ev.data].push(ev)
    })
    return mapa
  }, [eventos])

  const proximosEventos = useMemo(() => {
    const hojeStr = chaveData(hoje)
    return eventos.filter((ev) => ev.data >= hojeStr).slice(0, 5)
  }, [eventos])

  function diasDoMes() {
    const ano = mesAtual.getFullYear()
    const mes = mesAtual.getMonth()
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    const offsetInicio = primeiroDia.getDay()

    const dias = []
    for (let i = 0; i < offsetInicio; i++) dias.push(null)
    for (let d = 1; d <= ultimoDia.getDate(); d++) dias.push(new Date(ano, mes, d))
    return dias
  }

  async function adicionarEvento(e) {
    e.preventDefault()
    if (!novoTexto.trim()) return
    await addDoc(collection(db, 'eventos'), {
      texto: novoTexto.trim(),
      data: diaSelecionado,
      criadoEm: serverTimestamp(),
    })
    setNovoTexto('')
  }

  async function removerEvento(id) {
    await deleteDoc(doc(db, 'eventos', id))
  }

  function mudarMes(delta) {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + delta, 1))
  }

  const hojeStr = chaveData(hoje)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-5 sm:p-6">
        {/* Cabeçalho do mês */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => mudarMes(-1)} className="focus-ring text-ink-800/50 hover:text-ink-900 px-2 py-1 rounded transition" aria-label="Mês anterior">‹</button>
          <h2 className="font-display text-xl text-ink-900 font-medium">
            {NOMES_MES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
          </h2>
          <button onClick={() => mudarMes(1)} className="focus-ring text-ink-800/50 hover:text-ink-900 px-2 py-1 rounded transition" aria-label="Mês seguinte">›</button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 mb-2">
          {DIAS_SEMANA.map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-ink-800/40 py-1">{d}</div>
          ))}
        </div>

        {/* Grelha de dias */}
        <div className="grid grid-cols-7 gap-1">
          {diasDoMes().map((dia, i) => {
            if (!dia) return <div key={i} />
            const chave = chaveData(dia)
            const temEventos = eventosPorDia[chave]?.length > 0
            const isHoje = chave === hojeStr
            const isSelecionado = chave === diaSelecionado

            return (
              <button
                key={i}
                onClick={() => setDiaSelecionado(chave)}
                className={`focus-ring relative aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition ${
                  isSelecionado
                    ? 'bg-clay-500 text-white font-medium'
                    : isHoje
                    ? 'bg-clay-100 text-clay-700 font-medium'
                    : 'hover:bg-clay-50 text-ink-900'
                }`}
              >
                {dia.getDate()}
                {temEventos && (
                  <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelecionado ? 'bg-white' : 'bg-sage-500'}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Eventos do dia selecionado */}
      <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-6">
        <h3 className="font-display text-lg text-ink-900 font-medium mb-4">
          {new Date(diaSelecionado + 'T00:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h3>

        <form onSubmit={adicionarEvento} className="flex gap-2 mb-4">
          <input
            type="text"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Ex: Consulta médica às 10h"
            className="focus-ring flex-1 rounded-lg border border-clay-200 px-3.5 py-2.5 text-ink-900 placeholder:text-ink-800/30 focus:border-clay-400 outline-none transition"
          />
          <button
            type="submit"
            className="focus-ring bg-sage-500 hover:bg-sage-600 text-white font-medium rounded-lg px-5 transition shrink-0"
          >
            Adicionar
          </button>
        </form>

        {(eventosPorDia[diaSelecionado] || []).length === 0 ? (
          <p className="text-ink-800/40 text-sm text-center py-4">Sem eventos para este dia.</p>
        ) : (
          <ul className="space-y-2">
            {eventosPorDia[diaSelecionado].map((ev) => (
              <li key={ev.id} className="flex items-center justify-between gap-3 bg-clay-50 rounded-lg px-4 py-3">
                <span className="text-ink-900">{ev.texto}</span>
                <button onClick={() => removerEvento(ev.id)} className="focus-ring text-ink-800/30 hover:text-red-500 transition shrink-0" aria-label="Remover evento">✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Próximos eventos */}
      {proximosEventos.length > 0 && (
        <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-6">
          <h3 className="font-display text-lg text-ink-900 font-medium mb-4">Próximos eventos</h3>
          <ul className="space-y-2">
            {proximosEventos.map((ev) => (
              <li key={ev.id} className="flex items-center justify-between gap-3">
                <span className="text-ink-900">{ev.texto}</span>
                <span className="text-xs text-ink-800/40 shrink-0">
                  {new Date(ev.data + 'T00:00:00').toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
