import { useState, useEffect, useMemo } from 'react'
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const CATEGORIAS_DESPESA = ['Casa', 'Alimentação', 'Transporte', 'Saúde', 'Bebé', 'Lazer', 'Outros']

function formatarEuro(valor) {
  return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(valor)
}

function mesAtualStr() {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

export default function Financas({ utilizador }) {
  const [movimentos, setMovimentos] = useState(null)
  const [mesFiltro, setMesFiltro] = useState(mesAtualStr())
  const [tipo, setTipo] = useState('despesa')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS_DESPESA[0])

  useEffect(() => {
    const q = query(collection(db, 'financas'), orderBy('criadoEm', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setMovimentos(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  async function adicionarMovimento(e) {
    e.preventDefault()
    const valorNum = parseFloat(valor.replace(',', '.'))
    if (!descricao.trim() || isNaN(valorNum) || valorNum <= 0) return

    await addDoc(collection(db, 'financas'), {
      tipo,
      descricao: descricao.trim(),
      valor: valorNum,
      categoria: tipo === 'despesa' ? categoria : null,
      registadoPor: utilizador,
      mes: mesFiltro,
      criadoEm: serverTimestamp(),
    })
    setDescricao('')
    setValor('')
  }

  async function removerMovimento(id) {
    await deleteDoc(doc(db, 'financas', id))
  }

  const movimentosDoMes = useMemo(() => {
    if (!movimentos) return []
    return movimentos.filter((m) => m.mes === mesFiltro)
  }, [movimentos, mesFiltro])

  const totais = useMemo(() => {
    const receitas = movimentosDoMes.filter((m) => m.tipo === 'receita').reduce((s, m) => s + m.valor, 0)
    const despesas = movimentosDoMes.filter((m) => m.tipo === 'despesa').reduce((s, m) => s + m.valor, 0)
    return { receitas, despesas, saldo: receitas - despesas }
  }, [movimentosDoMes])

  const mesesDisponiveis = useMemo(() => {
    const hoje = new Date()
    const meses = []
    for (let i = -6; i <= 1; i++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1)
      meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
    return meses
  }, [])

  function labelMes(mesStr) {
    const [ano, mes] = mesStr.split('-').map(Number)
    return new Date(ano, mes - 1, 1).toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
  }

  if (movimentos === null) {
    return <p className="text-center text-ink-800/40 py-12">A carregar…</p>
  }

  return (
    <div className="space-y-6">
      {/* Seletor de mês */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-ink-800/60 shrink-0">Mês:</label>
        <select
          value={mesFiltro}
          onChange={(e) => setMesFiltro(e.target.value)}
          className="focus-ring rounded-lg border border-clay-200 px-3.5 py-2 text-ink-900 focus:border-clay-400 outline-none transition bg-white capitalize"
        >
          {mesesDisponiveis.map((m) => (
            <option key={m} value={m} className="capitalize">{labelMes(m)}</option>
          ))}
        </select>
      </div>

      {/* Totais */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-4 text-center">
          <p className="text-xs text-ink-800/50 uppercase tracking-wide mb-1">Receitas</p>
          <p className="font-display text-lg sm:text-xl font-semibold text-sage-600">{formatarEuro(totais.receitas)}</p>
        </div>
        <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-4 text-center">
          <p className="text-xs text-ink-800/50 uppercase tracking-wide mb-1">Despesas</p>
          <p className="font-display text-lg sm:text-xl font-semibold text-clay-600">{formatarEuro(totais.despesas)}</p>
        </div>
        <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-4 text-center">
          <p className="text-xs text-ink-800/50 uppercase tracking-wide mb-1">Saldo</p>
          <p className={`font-display text-lg sm:text-xl font-semibold ${totais.saldo >= 0 ? 'text-sage-600' : 'text-red-500'}`}>
            {formatarEuro(totais.saldo)}
          </p>
        </div>
      </div>

      {/* Formulário de novo movimento */}
      <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTipo('despesa')}
            className={`focus-ring flex-1 py-2 rounded-lg font-medium text-sm transition ${
              tipo === 'despesa' ? 'bg-clay-500 text-white' : 'bg-clay-50 text-ink-800/60'
            }`}
          >
            Despesa
          </button>
          <button
            onClick={() => setTipo('receita')}
            className={`focus-ring flex-1 py-2 rounded-lg font-medium text-sm transition ${
              tipo === 'receita' ? 'bg-sage-500 text-white' : 'bg-clay-50 text-ink-800/60'
            }`}
          >
            Receita
          </button>
        </div>

        <form onSubmit={adicionarMovimento} className="space-y-3">
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição (ex: Supermercado)"
            className="focus-ring w-full rounded-lg border border-clay-200 px-3.5 py-2.5 text-ink-900 placeholder:text-ink-800/30 focus:border-clay-400 outline-none transition"
          />
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00 €"
              className="focus-ring w-32 rounded-lg border border-clay-200 px-3.5 py-2.5 text-ink-900 placeholder:text-ink-800/30 focus:border-clay-400 outline-none transition"
            />
            {tipo === 'despesa' && (
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="focus-ring flex-1 rounded-lg border border-clay-200 px-3.5 py-2.5 text-ink-900 focus:border-clay-400 outline-none transition bg-white"
              >
                {CATEGORIAS_DESPESA.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
            <button
              type="submit"
              className={`focus-ring shrink-0 text-white font-medium rounded-lg px-5 transition ${
                tipo === 'despesa' ? 'bg-clay-500 hover:bg-clay-600' : 'bg-sage-500 hover:bg-sage-600'
              }`}
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>

      {/* Lista de movimentos */}
      <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-6">
        <h3 className="font-display text-lg text-ink-900 font-medium mb-4 capitalize">{labelMes(mesFiltro)}</h3>
        {movimentosDoMes.length === 0 ? (
          <p className="text-ink-800/40 text-sm text-center py-6">Sem movimentos registados este mês.</p>
        ) : (
          <ul className="space-y-2">
            {movimentosDoMes.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 bg-clay-50 rounded-lg px-4 py-3">
                <div className="min-w-0">
                  <p className="text-ink-900 truncate">{m.descricao}</p>
                  <p className="text-xs text-ink-800/40">
                    {m.registadoPor}{m.categoria ? ` · ${m.categoria}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`font-medium tabular-nums ${m.tipo === 'receita' ? 'text-sage-600' : 'text-clay-600'}`}>
                    {m.tipo === 'receita' ? '+' : '-'}{formatarEuro(m.valor)}
                  </span>
                  <button onClick={() => removerMovimento(m.id)} className="focus-ring text-ink-800/30 hover:text-red-500 transition" aria-label="Remover movimento">✕</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
