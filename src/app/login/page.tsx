'use client'

import { useState } from 'react'
import { useSupabase } from '@/providers/supabase-provider'
import { Loader2, Mail } from 'lucide-react'

export default function LoginPage() {
  const { supabase } = useSupabase()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo/Title */}
        <div className="text-center">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-[28px] font-bold text-[var(--text-primary)]">App de Pus</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Compra inteligente para ti e Irene
          </p>
        </div>

        {sent ? (
          <div className="card text-center">
            <Mail className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h2 className="text-xl font-semibold mb-2">¡Email enviado!</h2>
            <p className="text-[var(--text-secondary)]">
              Revisa tu bandeja de entrada y haz clic en el enlace para entrar.
            </p>
            <button
              onClick={() => setSent(false)}
              className="mt-4 text-accent underline"
            >
              Usar otro email
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[15px] font-medium mb-2">
                Tu email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vicente@ejemplo.com"
                required
                className="input"
                autoComplete="email"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-negative text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Entrar con Magic Link'
              )}
            </button>

            <p className="text-center text-[13px] text-[var(--text-muted)]">
              Sin contraseñas. Te enviaremos un enlace seguro a tu email.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
