"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSupabase } from "@/providers/supabase-provider";
import { useConfigHogar } from "@/hooks/use-config-hogar";
import {
  ArrowLeft,
  LogOut,
  Users,
  Copy,
  Check,
  Calculator,
  Sliders,
  Download,
  Info,
  Loader2,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GroupedList,
  GroupedListItem,
  GroupedListCell,
} from "@/components/ui/grouped-list";

// Versión de la app
const APP_VERSION = "0.1.0";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useSupabase();
  const {
    config,
    loading: loadingConfig,
    updateNombres,
    hogarId,
  } = useConfigHogar();

  // Estados
  const [loggingOut, setLoggingOut] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [editingNames, setEditingNames] = useState(false);
  const [nameM1, setNameM1] = useState("");
  const [nameM2, setNameM2] = useState("");
  const [savingNames, setSavingNames] = useState(false);

  // Código de invitación temporal (en producción vendría del hogar)
  const inviteCode = "HOGAR-2024";

  // Cerrar sesión
  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }, [supabase, router]);

  // Copiar código de invitación
  const handleCopyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCodeCopied(true);
      if (navigator.vibrate) navigator.vibrate(10);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error("Error copying:", err);
    }
  }, [inviteCode]);

  // Exportar datos
  const handleExport = useCallback(async () => {
    setExporting(true);

    try {
      // Obtener todos los datos del hogar
      const hogarId = "00000000-0000-0000-0000-000000000001"; // TODO: real hogar_id

      const [
        { data: ingresos },
        { data: gastos },
        { data: becas },
        { data: prestamos },
        { data: metas },
        { data: tareas },
        { data: transferencias },
      ] = await Promise.all([
        supabase.from("ingresos").select("*").eq("hogar_id", hogarId),
        supabase.from("gastos").select("*").eq("hogar_id", hogarId),
        supabase.from("becas").select("*").eq("hogar_id", hogarId),
        supabase.from("prestamos").select("*").eq("hogar_id", hogarId),
        supabase.from("metas").select("*").eq("hogar_id", hogarId),
        supabase.from("tareas_hogar").select("*").eq("hogar_id", hogarId),
        supabase.from("transferencias").select("*").eq("hogar_id", hogarId),
      ]);

      const exportData = {
        version: APP_VERSION,
        exportedAt: new Date().toISOString(),
        hogarId,
        config,
        data: {
          ingresos: ingresos || [],
          gastos: gastos || [],
          becas: becas || [],
          prestamos: prestamos || [],
          metas: metas || [],
          tareas: tareas || [],
          transferencias: transferencias || [],
        },
      };

      // Crear blob y descargar
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `app-de-pus-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSuccess(true);
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (err) {
      console.error("Error exporting:", err);
    } finally {
      setExporting(false);
    }
  }, [supabase, config]);

  // Nombres de los miembros
  const nombre1 = config?.nombres?.m1 || "Miembro 1";
  const nombre2 = config?.nombres?.m2 || "Miembro 2";

  // Abrir edición de nombres
  const handleEditNames = useCallback(() => {
    setNameM1(nombre1);
    setNameM2(nombre2);
    setEditingNames(true);
  }, [nombre1, nombre2]);

  // Guardar nombres
  const handleSaveNames = useCallback(async () => {
    const trimM1 = nameM1.trim();
    const trimM2 = nameM2.trim();
    if (!trimM1 || !trimM2) return;

    setSavingNames(true);
    const success = await updateNombres({ m1: trimM1, m2: trimM2 });
    setSavingNames(false);

    if (success) {
      setEditingNames(false);
      if (navigator.vibrate) navigator.vibrate(10);
    }
  }, [nameM1, nameM2, updateNombres]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--background)] border-b border-[var(--separator)]">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Ajustes</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-24">
        {/* Sección: Cuenta */}
        <GroupedList title="Cuenta">
          <GroupedListCell
            label="Email"
            value={user?.email || "No conectado"}
          />
          <GroupedListItem
            onClick={handleLogout}
            destructive
            leftIcon={
              loggingOut ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <LogOut className="w-5 h-5" />
              )
            }
          >
            {loggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
          </GroupedListItem>
        </GroupedList>

        {/* Sección: Hogar */}
        <GroupedList title="Hogar">
          {/* Código de invitación */}
          <GroupedListItem
            onClick={handleCopyCode}
            leftIcon={
              codeCopied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )
            }
            rightContent={
              <span className="font-mono text-sm bg-[var(--border)] px-2 py-1 rounded">
                {inviteCode}
              </span>
            }
          >
            Código de invitación
          </GroupedListItem>

          {/* Miembros */}
          {!editingNames ? (
            <GroupedListItem
              onClick={hogarId ? handleEditNames : undefined}
              leftIcon={<Users className="w-5 h-5" />}
              rightContent={
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                      {nombre1.charAt(0).toUpperCase()}
                    </div>
                    <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {nombre2.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <Pencil className="w-4 h-4 text-[var(--text-muted)]" />
                </div>
              }
            >
              Miembros
            </GroupedListItem>
          ) : (
            <>
              <div className="px-4 py-3 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(nameM1.charAt(0) || "?").toUpperCase()}
                  </div>
                  <input
                    type="text"
                    value={nameM1}
                    onChange={(e) => setNameM1(e.target.value)}
                    placeholder="Nombre miembro 1"
                    className="flex-1 bg-[var(--background)] rounded-lg px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-accent"
                    maxLength={20}
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {(nameM2.charAt(0) || "?").toUpperCase()}
                  </div>
                  <input
                    type="text"
                    value={nameM2}
                    onChange={(e) => setNameM2(e.target.value)}
                    placeholder="Nombre miembro 2"
                    className="flex-1 bg-[var(--background)] rounded-lg px-3 py-2 text-[15px] outline-none focus:ring-2 focus:ring-accent"
                    maxLength={20}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setEditingNames(false)}
                    className="flex-1 py-2 rounded-lg text-[15px] bg-[var(--background)] text-[var(--text-secondary)]"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveNames}
                    disabled={
                      savingNames ||
                      !nameM1.trim() ||
                      !nameM2.trim() ||
                      !hogarId
                    }
                    className="flex-1 py-2 rounded-lg text-[15px] bg-accent text-white font-medium disabled:opacity-50"
                  >
                    {savingNames ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            </>
          )}
        </GroupedList>

        {/* Sección: Datos */}
        <GroupedList title="Datos">
          <GroupedListItem
            onClick={() => router.push("/finanzas/config")}
            showChevron
            leftIcon={<Sliders className="w-5 h-5" />}
          >
            Configurar saldos iniciales
          </GroupedListItem>

          <GroupedListItem
            onClick={() => router.push("/finanzas/calculadora")}
            showChevron
            leftIcon={<Calculator className="w-5 h-5" />}
          >
            Calculadora de piso
          </GroupedListItem>
        </GroupedList>

        {/* Sección: App */}
        <GroupedList title="App">
          <GroupedListCell
            label="Versión"
            value={APP_VERSION}
            leftIcon={<Info className="w-5 h-5" />}
          />

          <GroupedListItem
            onClick={handleExport}
            leftIcon={
              exporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : exportSuccess ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Download className="w-5 h-5" />
              )
            }
          >
            {exporting
              ? "Exportando..."
              : exportSuccess
                ? "¡Exportado!"
                : "Exportar datos (JSON)"}
          </GroupedListItem>
        </GroupedList>

        {/* Info adicional */}
        <div className="text-center text-sm text-[var(--text-muted)] pt-4">
          <p>App de Pus </p>
          <p>
            Hecho con para {nombre1} e {nombre2}
          </p>
        </div>
      </div>
    </div>
  );
}
