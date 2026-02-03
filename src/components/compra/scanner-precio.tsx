'use client'

import { useState, useRef } from 'react'
import { Camera, X, Check, Loader2, Edit3 } from 'lucide-react'
import { Drawer } from 'vaul'
import { eurosToCentimos, centimosToEuros } from '@/types/compra'

interface ScannerPrecioProps {
  open: boolean
  onClose: () => void
  onConfirm: (precio: number) => void
  productoNombre?: string
}

export function ScannerPrecio({ open, onClose, onConfirm, productoNombre }: ScannerPrecioProps) {
  const [mode, setMode] = useState<'choose' | 'camera' | 'manual'>('choose')
  const [imageData, setImageData] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [precioDetectado, setPrecioDetectado] = useState<number | null>(null)
  const [precioManual, setPrecioManual] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Convertir a base64
    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64 = event.target?.result as string
      setImageData(base64)
      setMode('camera')
      
      // Enviar a OCR
      setScanning(true)
      setError(null)
      
      try {
        const response = await fetch('/api/scan-precio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 })
        })
        
        const data = await response.json()
        
        if (data.precio !== null) {
          setPrecioDetectado(data.precio)
          setPrecioManual(centimosToEuros(data.precio))
        } else {
          setError('No se pudo detectar el precio. Introduce manualmente.')
          setMode('manual')
        }
      } catch (err) {
        console.error('OCR error:', err)
        setError('Error al escanear. Introduce manualmente.')
        setMode('manual')
      } finally {
        setScanning(false)
      }
    }
    reader.readAsDataURL(file)
  }
  
  const handleConfirm = () => {
    let precio: number
    
    if (mode === 'camera' && precioDetectado !== null) {
      precio = precioDetectado
    } else {
      precio = eurosToCentimos(precioManual)
    }
    
    if (precio > 0) {
      onConfirm(precio)
      resetAndClose()
    }
  }
  
  const resetAndClose = () => {
    setMode('choose')
    setImageData(null)
    setPrecioDetectado(null)
    setPrecioManual('')
    setError(null)
    onClose()
  }
  
  return (
    <Drawer.Root open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-[20px] outline-none">
          <div className="p-4">
            {/* Handle */}
            <div className="w-12 h-1 bg-[var(--separator)] rounded-full mx-auto mb-4" />
            
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Añadir precio</h2>
                {productoNombre && (
                  <p className="text-sm text-[var(--text-secondary)]">{productoNombre}</p>
                )}
              </div>
              <button onClick={resetAndClose} className="p-2 -mr-2">
                <X className="w-6 h-6 text-[var(--text-muted)]" />
              </button>
            </div>
            
            {/* Choose mode */}
            {mode === 'choose' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCapture}
                  className="hidden"
                />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 rounded-2xl bg-accent/10 border-2 border-accent flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-[17px]">Escanear precio</div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      Haz una foto a la etiqueta
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setMode('manual')}
                  className="w-full p-4 rounded-2xl bg-[var(--separator)] flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--text-muted)] flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-[17px]">Introducir manualmente</div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      Escribe el precio
                    </div>
                  </div>
                </button>
              </div>
            )}
            
            {/* Camera mode - scanning or result */}
            {mode === 'camera' && (
              <div className="space-y-4">
                {/* Image preview */}
                {imageData && (
                  <div className="relative rounded-xl overflow-hidden bg-black">
                    <img 
                      src={imageData} 
                      alt="Etiqueta" 
                      className="w-full max-h-48 object-contain"
                    />
                    {scanning && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-white">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Escaneando...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Detected price */}
                {precioDetectado !== null && !scanning && (
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500">
                    <div className="text-sm text-green-600 mb-1">Precio detectado</div>
                    <div className="text-3xl font-bold text-green-600">
                      {centimosToEuros(precioDetectado)}€
                    </div>
                  </div>
                )}
                
                {/* Edit option */}
                {!scanning && (
                  <button
                    onClick={() => setMode('manual')}
                    className="text-accent text-sm font-medium"
                  >
                    Editar manualmente
                  </button>
                )}
                
                {/* Confirm */}
                {precioDetectado !== null && !scanning && (
                  <button
                    onClick={handleConfirm}
                    className="w-full py-4 rounded-xl bg-accent text-white font-semibold text-[17px] flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    Confirmar precio
                  </button>
                )}
              </div>
            )}
            
            {/* Manual mode */}
            {mode === 'manual' && (
              <div className="space-y-4">
                {error && (
                  <p className="text-sm text-[var(--text-secondary)] bg-[var(--separator)] p-3 rounded-xl">
                    {error}
                  </p>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Precio
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={precioManual}
                      onChange={(e) => setPrecioManual(e.target.value)}
                      placeholder="0,00"
                      className="w-full p-4 pr-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--separator)] text-2xl font-bold text-center"
                      autoFocus
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-[var(--text-muted)]">
                      €
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleConfirm}
                  disabled={!precioManual || eurosToCentimos(precioManual) <= 0}
                  className="w-full py-4 rounded-xl bg-accent text-white font-semibold text-[17px] disabled:opacity-50"
                >
                  Guardar precio
                </button>
              </div>
            )}
          </div>
          
          {/* Safe area bottom */}
          <div className="h-8" />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
