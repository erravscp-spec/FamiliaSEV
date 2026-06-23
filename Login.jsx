import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [aCarregar, setACarregar] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setACarregar(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErro('Email ou palavra-passe incorretos.')
      } else {
        setErro('Não foi possível entrar. Tenta novamente.')
      }
    } finally {
      setACarregar(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-clay-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌿</div>
          <h1 className="font-display text-3xl text-ink-900 font-semibold">O Nosso Cantinho</h1>
          <p className="text-ink-800/60 mt-2 font-body text-sm">Entra para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl2 shadow-sm border border-clay-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring w-full rounded-lg border border-clay-200 px-3.5 py-2.5 text-ink-900 placeholder:text-ink-800/30 focus:border-clay-400 outline-none transition"
              placeholder="o-vosso-email@exemplo.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1.5">Palavra-passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring w-full rounded-lg border border-clay-200 px-3.5 py-2.5 text-ink-900 focus:border-clay-400 outline-none transition"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {erro && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{erro}</p>
          )}

          <button
            type="submit"
            disabled={aCarregar}
            className="focus-ring w-full bg-clay-500 hover:bg-clay-600 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 transition"
          >
            {aCarregar ? 'A entrar…' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-xs text-ink-800/40 mt-6">
          Conta partilhada — usa o email e palavra-passe que criaram juntos no Firebase.
        </p>
      </div>
    </div>
  )
}
