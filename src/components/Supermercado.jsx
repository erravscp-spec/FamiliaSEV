import { useState, useEffect } from 'react'
import {
  collection, addDoc, deleteDoc, doc, updateDoc,
  onSnapshot, query, orderBy, serverTimestamp, writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'

const CATEGORIAS = ['Frescos', 'Mercearia', 'Limpeza', 'Higiene', 'Bebidas', 'Outros']

export default function Supermercado() {
  const [itens, setItens] = useState(null)
  const [novoNome, setNovoNome] = useState('')
  const [novaCategoria, setNovaCategoria] = useState(CATEGORIAS[0])
  const [filtro, setFiltro] = useState('Todos')
  const [aLimpar, setALimpar] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'supermercado'), orderBy('criadoEm', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  async function adicionarItem(e) {
    e.preventDefault()
    if (!novoNome.trim()) return
    await addDoc(collection(db, 'supermercado'), {
      nome: novoNome.trim(),
      categoria: novaCategoria,
      comprado: false,
      criadoEm: serverTimestamp(),
    })
    setNovoNome('')
  }

  async function alternarComprado(item) {
    await updateDoc(doc(db, 'supermercado', item.id), { comprado: !item.comprado })
  }

  async function removerItem(id) {
    await deleteDoc(doc(db, 'supermercado', id))
  }

  async function limparComprados() {
    const comprados = itens.filter((i) => i.comprado)
    if (comprados.length === 0) return
    setALimpar(true)
    try {
      const batch = writeBatch(db)
      comprados.forEach((item) => {
        batch.delete(doc(db, 'supermercado', item.id))
      })
      await batch.commit()
    } finally {
      setALimpar(false)
    }
  }

  if (itens === null) {
    return <p className="text-center text-ink-800/40 py-12">A carregar…</p>
  }

  const total = itens.length
  const comprados = itens.filter((i) => i.comprado).length

  const itensFiltrados = filtro === 'Todos' ? itens : itens.filter((i) => i.categoria === filtro)

  const agrupados = CATEGORIAS.reduce((acc, cat) => {
    const doCategoria = itensFiltrados.filter((i) => i.categoria === cat)
    if (doCategoria.length > 0) acc[cat] = doCategoria
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-ink-900 font-medium">Lista de supermercado</h2>
          {total > 0 && <span className="text-sage-700 font-medium tabular-nums">{comprados}/{total}</span>}
        </div>
        {total > 0 && (
          <div className="h-2.5 bg-clay-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 transition-all duration-500"
              style={{ width: `${(comprados / total) * 100}%` }}
            />
          </div>
        )}

        {total === 0 && (
          <p className="text-ink-800/50 text-sm text-center py-6">A lista está vazia. Adiciona o primeiro artigo abaixo.</p>
        )}
      </div>

      {/* Adicionar novo item */}
      <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-6">
        <form onSubmit={adicionarItem} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Nome do artigo (ex: Leite)"
            className="focus-ring flex-1 rounded-lg border border-clay-200 px-3.5 py-2.5 text-ink-900 placeholder:text-ink-800/30 focus:border-clay-400 outline-none transition"
          />
          <select
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            className="focus-ring rounded-lg border border-clay-200 px-3.5 py-2.5 text-ink-900 focus:border-clay-400 outline-none transition bg-white"
          >
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            type="submit"
            className="focus-ring bg-sage-500 hover:bg-sage-600 text-white font-medium rounded-lg px-5 py-2.5 transition shrink-0"
          >
            Adicionar
          </button>
        </form>
      </div>

      {total > 0 && (
        <>
          {/* Filtro por categoria + limpar comprados */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['Todos', ...CATEGORIAS].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltro(cat)}
                  className={`focus-ring shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                    filtro === cat
                      ? 'bg-clay-500 text-white'
                      : 'bg-white text-ink-800/60 border border-clay-100 hover:border-clay-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {comprados > 0 && (
              <button
                onClick={limparComprados}
                disabled={aLimpar}
                className="focus-ring shrink-0 text-sm text-ink-800/50 hover:text-red-500 disabled:opacity-50 transition whitespace-nowrap"
              >
                Limpar comprados
              </button>
            )}
          </div>

          {/* Lista agrupada por categoria */}
          <div className="space-y-5">
            {Object.entries(agrupados).map(([categoria, lista]) => (
              <div key={categoria} className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-5">
                <h3 className="font-display text-base text-ink-800/70 font-medium mb-3">{categoria}</h3>
                <ul className="space-y-1.5">
                  {lista.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 group">
                      <button
                        onClick={() => alternarComprado(item)}
                        className={`focus-ring shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition ${
                          item.comprado
                            ? 'bg-sage-500 border-sage-500 text-white'
                            : 'border-clay-300 hover:border-clay-400'
                        }`}
                        aria-label={item.comprado ? 'Marcar como não comprado' : 'Marcar como comprado'}
                      >
                        {item.comprado && '✓'}
                      </button>
                      <span className={`flex-1 transition ${item.comprado ? 'text-ink-800/40 line-through' : 'text-ink-900'}`}>
                        {item.nome}
                      </span>
                      <button
                        onClick={() => removerItem(item.id)}
                        className="focus-ring text-ink-800/0 group-hover:text-ink-800/30 hover:!text-red-500 transition shrink-0"
                        aria-label="Remover item"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
