import { useState, useEffect } from 'react'
import {
  collection, addDoc, deleteDoc, doc, updateDoc,
  onSnapshot, query, orderBy, serverTimestamp, writeBatch
} from 'firebase/firestore'
import { db } from '../firebase'

const CATEGORIAS = ['Quarto', 'Roupa', 'Higiene', 'Alimentação', 'Passeio', 'Outros']

const ITENS_SUGERIDOS = [
  { nome: 'Berço', categoria: 'Quarto' },
  { nome: 'Colchão para o berço', categoria: 'Quarto' },
  { nome: 'Roupa de cama (jogo)', categoria: 'Quarto' },
  { nome: 'Termómetro de quarto', categoria: 'Quarto' },
  { nome: 'Babá eletrónica', categoria: 'Quarto' },
  { nome: 'Bodies (pack recém-nascido)', categoria: 'Roupa' },
  { nome: 'Pijamas', categoria: 'Roupa' },
  { nome: 'Casaco/agasalho', categoria: 'Roupa' },
  { nome: 'Meias e luvas', categoria: 'Roupa' },
  { nome: 'Gorro', categoria: 'Roupa' },
  { nome: 'Fraldas recém-nascido', categoria: 'Higiene' },
  { nome: 'Toalhitas', categoria: 'Higiene' },
  { nome: 'Banheira de bebé', categoria: 'Higiene' },
  { nome: 'Termómetro corporal', categoria: 'Higiene' },
  { nome: 'Kit de higiene (tesoura, aspirador nasal)', categoria: 'Higiene' },
  { nome: 'Creme para assaduras', categoria: 'Higiene' },
  { nome: 'Biberões', categoria: 'Alimentação' },
  { nome: 'Esterilizador de biberões', categoria: 'Alimentação' },
  { nome: 'Babetes', categoria: 'Alimentação' },
  { nome: 'Cadeira de carro (ovo)', categoria: 'Passeio' },
  { nome: 'Carrinho de bebé', categoria: 'Passeio' },
  { nome: 'Mochila/saco de muda', categoria: 'Passeio' },
  { nome: 'Sling ou marsúpio', categoria: 'Passeio' },
]

export default function Checklist() {
  const [itens, setItens] = useState(null) // null = ainda a carregar
  const [novoNome, setNovoNome] = useState('')
  const [novaCategoria, setNovaCategoria] = useState(CATEGORIAS[0])
  const [filtro, setFiltro] = useState('Todos')
  const [aPopular, setAPopular] = useState(false)

  useEffect(() => {
    const q = query(collection(db, 'checklist'), orderBy('criadoEm', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      setItens(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  async function popularComSugestoes() {
    setAPopular(true)
    try {
      const batch = writeBatch(db)
      ITENS_SUGERIDOS.forEach((item) => {
        const ref = doc(collection(db, 'checklist'))
        batch.set(ref, { ...item, comprado: false, criadoEm: serverTimestamp() })
      })
      await batch.commit()
    } finally {
      setAPopular(false)
    }
  }

  async function adicionarItem(e) {
    e.preventDefault()
    if (!novoNome.trim()) return
    await addDoc(collection(db, 'checklist'), {
      nome: novoNome.trim(),
      categoria: novaCategoria,
      comprado: false,
      criadoEm: serverTimestamp(),
    })
    setNovoNome('')
  }

  async function alternarComprado(item) {
    await updateDoc(doc(db, 'checklist', item.id), { comprado: !item.comprado })
  }

  async function removerItem(id) {
    await deleteDoc(doc(db, 'checklist', id))
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
          <h2 className="font-display text-xl text-ink-900 font-medium">Lista de compras</h2>
          <span className="text-sage-700 font-medium tabular-nums">{comprados}/{total}</span>
        </div>
        <div className="h-2.5 bg-clay-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-sage-500 transition-all duration-500"
            style={{ width: total > 0 ? `${(comprados / total) * 100}%` : '0%' }}
          />
        </div>

        {total === 0 && (
          <div className="text-center py-8">
            <p className="text-ink-800/50 mb-4">A lista está vazia.</p>
            <button
              onClick={popularComSugestoes}
              disabled={aPopular}
              className="focus-ring bg-clay-500 hover:bg-clay-600 disabled:opacity-60 text-white font-medium rounded-lg px-5 py-2.5 transition"
            >
              {aPopular ? 'A preencher…' : 'Começar com lista sugerida'}
            </button>
          </div>
        )}
      </div>

      {total > 0 && (
        <>
          {/* Adicionar novo item */}
          <div className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-6">
            <form onSubmit={adicionarItem} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nome do artigo"
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

          {/* Filtro por categoria */}
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
