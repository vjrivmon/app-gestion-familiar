# Implementation Playbook — Mobile First UI

> Code snippets listos para copiar. Next.js 15 + Tailwind + shadcn/ui.

---

## 1. PWA Setup (Next.js)

### next.config.js
```js
const withPWA = require('@ducanh2912/next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // ... next config
})
```

### layout.tsx — Root
```tsx
import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2F2F7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export const metadata: Metadata = {
  title: 'App Name',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'App Name',
  },
}
```

### globals.css — Safe Areas + iOS Fixes
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --sat: env(safe-area-inset-top);
    --sab: env(safe-area-inset-bottom);
    --sal: env(safe-area-inset-left);
    --sar: env(safe-area-inset-right);
    
    /* Tab bar height */
    --tab-bar-height: calc(49px + var(--sab));
  }
  
  html {
    /* Prevent rubber banding */
    overscroll-behavior: none;
    /* Smooth momentum scrolling */
    -webkit-overflow-scrolling: touch;
  }
  
  body {
    /* Prevent pull-to-refresh in standalone */
    overscroll-behavior-y: none;
    /* Padding for tab bar */
    padding-bottom: var(--tab-bar-height);
  }
  
  /* Prevent iOS zoom on focus */
  input, select, textarea {
    font-size: 16px !important;
  }
  
  /* Disable highlight on tap */
  * {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* Selection prevention on interactive elements */
  button, a, [role="button"] {
    -webkit-user-select: none;
    user-select: none;
  }
}
```

---

## 2. Camera Integration (Browser API)

### Camera Capture Component
```tsx
'use client'
import { useRef, useState, useCallback } from 'react'

interface CameraCaptureProps {
  onCapture: (imageData: string) => void
  onClose: () => void
}

export function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturing, setCapturing] = useState(false)

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Back camera
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
      }
    } catch (err) {
      console.error('Camera access denied:', err)
    }
  }, [])

  // Capture photo
  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    
    // Haptic feedback
    navigator.vibrate?.(50)
    
    // Stop camera
    stream?.getTracks().forEach(t => t.stop())
    
    onCapture(imageData)
  }, [stream, onCapture])

  // Auto-start on mount
  useEffect(() => { startCamera() }, [startCamera])
  // Cleanup on unmount
  useEffect(() => {
    return () => stream?.getTracks().forEach(t => t.stop())
  }, [stream])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video ref={videoRef} autoPlay playsInline muted
             className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 flex flex-col">
        {/* Top bar */}
        <div className="flex justify-between p-4" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <button onClick={onClose} className="text-white text-lg">✕</button>
          <span className="text-white/70 text-sm">Apunta a la etiqueta del precio</span>
        </div>
        
        {/* Viewfinder */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-64 h-32 border-2 border-white/50 rounded-lg" />
        </div>
        
        {/* Capture button */}
        <div className="flex justify-center pb-8" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <button onClick={capture}
                  className="w-[72px] h-[72px] rounded-full border-4 border-white bg-white/20 active:bg-white/40 transition-colors" />
        </div>
      </div>
    </div>
  )
}
```

---

## 3. OCR Price Extraction (Gemini Flash)

### API Route: /api/ocr-price/route.ts
```ts
import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json()
  
  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')
  
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  
  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data,
      },
    },
    `Extract the price from this product label/tag. 
     Return ONLY a JSON object: {"price": <number>, "product": "<name if visible>", "confidence": <0-1>}
     If no price is found, return {"price": null, "product": null, "confidence": 0}
     Price should be in euros (number, not string). Example: 2.49 not "2,49€"`,
  ])

  const text = result.response.text()
  
  try {
    const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim())
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ price: null, product: null, confidence: 0, raw: text })
  }
}
```

---

## 4. Supabase Realtime Sync

### Hook: useRealtimeList
```tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeList<T extends { id: string }>(table: string) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    supabase.from(table).select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems((data as T[]) || [])
        setLoading(false)
      })

    // Realtime subscription
    const channel = supabase.channel(`${table}-changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems(prev => [payload.new as T, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setItems(prev => prev.map(i => i.id === (payload.new as T).id ? payload.new as T : i))
          } else if (payload.eventType === 'DELETE') {
            setItems(prev => prev.filter(i => i.id !== (payload.old as any).id))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [table])

  return { items, loading }
}
```

---

## 5. Pull to Refresh

```tsx
import { useState, useCallback } from 'react'

export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  let startY = 0

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY = e.touches[0].clientY
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY === 0) return
    const distance = e.touches[0].clientY - startY
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance * 0.5, 100))
    }
  }, [])

  const onTouchEnd = useCallback(async () => {
    if (pullDistance > 60) {
      setRefreshing(true)
      navigator.vibrate?.(10)
      await onRefresh()
      setRefreshing(false)
    }
    setPullDistance(0)
    startY = 0
  }, [pullDistance, onRefresh])

  return { refreshing, pullDistance, onTouchStart, onTouchMove, onTouchEnd }
}
```

---

## 6. Money Handling (Céntimos)

```typescript
// ALWAYS store money as integers (céntimos)
// 10.50€ → 1050

export function formatMoney(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',') + '€'
}

export function parseMoney(input: string): number {
  // "10,50" → 1050 | "10.50" → 1050 | "10" → 1000
  const cleaned = input.replace('€', '').replace(',', '.').trim()
  return Math.round(parseFloat(cleaned) * 100)
}

export function addMoney(...amounts: number[]): number {
  return amounts.reduce((a, b) => a + b, 0)
}

// Budget percentage
export function budgetPercent(spent: number, budget: number): number {
  if (budget === 0) return 0
  return Math.round((spent / budget) * 100)
}

// Budget color
export function budgetColor(percent: number): string {
  if (percent >= 100) return 'text-red-500'
  if (percent >= 80) return 'text-orange-500'
  if (percent >= 60) return 'text-yellow-500'
  return 'text-green-500'
}
```

---

## 7. Haptic Patterns

```typescript
export const haptic = {
  light: () => navigator.vibrate?.(10),
  medium: () => navigator.vibrate?.(30),
  heavy: () => navigator.vibrate?.(50),
  success: () => navigator.vibrate?.([10, 50, 10]),
  warning: () => navigator.vibrate?.([30, 50, 30]),
  error: () => navigator.vibrate?.([50, 30, 50, 30, 50]),
  selection: () => navigator.vibrate?.(5),
}
```

---

## 8. Dark Mode with Tailwind

### tailwind.config.ts
```ts
export default {
  darkMode: 'media', // Follows system preference
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        accent: 'var(--accent)',
      }
    }
  }
}
```

### CSS Variables
```css
:root {
  --background: #F2F2F7;
  --surface: #FFFFFF;
  --accent: #7D8B74;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #000000;
    --surface: #1C1C1E;
    --accent: #9DAF93;
  }
}
```
