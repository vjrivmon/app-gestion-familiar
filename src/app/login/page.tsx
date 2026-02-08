"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/providers/supabase-provider";
import { Loader2, Eye, EyeOff } from "lucide-react";

type Mode = "login" | "register";

export default function LoginPage() {
  const { supabase } = useSupabase();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "register") {
      if (!name.trim()) {
        setError("El nombre es obligatorio");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name: name.trim() },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("¡Cuenta creada! Revisa tu email para confirmarla.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message === "Invalid login credentials") {
          setError("Email o contraseña incorrectos");
        } else if (error.message === "Email not confirmed") {
          setError("Confirma tu email antes de iniciar sesión");
        } else {
          setError(error.message);
        }
      } else {
        router.push("/home");
      }
    }

    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo/Title */}
        <div className="text-center">
          <div className="text-6xl mb-4"></div>
          <h1 className="text-[28px] font-bold text-[var(--text-primary)]">
            App de Pus
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Gestión familiar inteligente
          </p>
        </div>

        {/* Tabs */}
        <div className="flex bg-[var(--separator)] rounded-xl p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2.5 rounded-lg text-[15px] font-medium transition-all ${
              mode === "login"
                ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)]"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2.5 rounded-lg text-[15px] font-medium transition-all ${
              mode === "register"
                ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm"
                : "text-[var(--text-muted)]"
            }`}
          >
            Crear cuenta
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label
                htmlFor="name"
                className="block text-[15px] font-medium mb-2"
              >
                Tu nombre
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vicente"
                required
                className="input"
                autoComplete="name"
                maxLength={30}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-[15px] font-medium mb-2"
            >
              Email
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
              autoFocus={mode === "login"}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[15px] font-medium mb-2"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "register" ? "Mínimo 6 caracteres" : "Tu contraseña"
                }
                required
                minLength={mode === "register" ? 6 : undefined}
                className="input pr-12"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)]"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && <p className="text-negative text-sm">{error}</p>}
          {success && (
            <p className="text-[var(--positive)] text-sm">{success}</p>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              !email ||
              !password ||
              (mode === "register" && !name.trim())
            }
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {mode === "register" ? "Creando cuenta..." : "Entrando..."}
              </>
            ) : mode === "register" ? (
              "Crear cuenta"
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        {/* Switch mode link */}
        <p className="text-center text-[13px] text-[var(--text-muted)]">
          {mode === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={switchMode}
                className="text-accent font-medium"
              >
                Regístrate
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={switchMode}
                className="text-accent font-medium"
              >
                Inicia sesión
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
