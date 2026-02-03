'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2 } from 'lucide-react'

export default function CameraPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara')
    }
  }, [])

  // Capture photo
  const capture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return
    
    setCapturing(true)
    
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    
    // Haptic feedback
    navigator.vibrate?.(50)
    
    // TODO: Send to OCR API
    console.log('Image captured, sending to OCR...')
    
    // For now, just go back
    setTimeout(() => {
      stream?.getTracks().forEach(t => t.stop())
      router.back()
    }, 1000)
  }, [stream, router])

  // Close camera
  const close = useCallback(() => {
    stream?.getTracks().forEach(t => t.stop())
    router.back()
  }, [stream, router])

  // Auto-start on mount
  useEffect(() => { startCamera() }, [startCamera])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => stream?.getTracks().forEach(t => t.stop())
  }, [stream])

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
        <p className="text-white text-center mb-4">{error}</p>
        <button onClick={close} className="btn-primary">
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className="w-full h-full object-cover" 
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top bar */}
        <div 
          className="flex justify-between items-center p-4"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 8px)' }}
        >
          <button onClick={close} className="w-10 h-10 flex items-center justify-center">
            <X className="w-7 h-7 text-white" />
          </button>
          <span className="text-white/70 text-sm text-center flex-1">
            Apunta a la etiqueta del precio
          </span>
          <div className="w-10" />
        </div>
        
        {/* Viewfinder */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-64 h-32 border-2 border-white/50 rounded-lg relative">
            <div className="absolute -top-1 -left-1 w-4 h-4 border-l-4 border-t-4 border-white rounded-tl" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-r-4 border-t-4 border-white rounded-tr" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-4 border-b-4 border-white rounded-bl" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-4 border-b-4 border-white rounded-br" />
          </div>
        </div>
        
        {/* Capture button */}
        <div 
          className="flex justify-center pb-8"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 32px)' }}
        >
          <button 
            onClick={capture}
            disabled={capturing}
            className="w-[72px] h-[72px] rounded-full border-4 border-white bg-surface/20 active:bg-surface/40 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {capturing && <Loader2 className="w-8 h-8 text-white animate-spin" />}
          </button>
        </div>
      </div>
    </div>
  )
}
