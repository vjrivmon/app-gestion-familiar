import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided', precio: null, raw: null },
        { status: 400 }
      )
    }
    
    // Si no hay API key, devolver null para que el usuario lo introduzca manualmente
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not configured')
      return NextResponse.json({
        precio: null,
        raw: 'API key not configured',
        error: 'OCR not available'
      })
    }
    
    // Extraer base64 data (quitar prefijo data:image/...)
    const base64Data = image.includes('base64,') 
      ? image.split('base64,')[1] 
      : image
    
    // Llamar a Gemini 2.0 Flash
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Extract the price from this product label or price tag. Return ONLY the number in format XX.XX or XX,XX (with decimals). If you see multiple prices, return the main/highlighted price. If no price is visible or readable, return exactly 'NO_PRICE'. Do not include currency symbols, just the number."
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 20
          }
        })
      }
    )
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('Gemini API error:', errorData)
      return NextResponse.json({
        precio: null,
        raw: errorData,
        error: 'OCR API error'
      })
    }
    
    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
    
    console.log('Gemini raw response:', rawText)
    
    // Parsear el precio
    if (rawText === 'NO_PRICE' || !rawText) {
      return NextResponse.json({
        precio: null,
        raw: rawText
      })
    }
    
    // Normalizar el texto: quitar caracteres no numéricos excepto . y ,
    const normalized = rawText
      .replace(/[^\d.,]/g, '')
      .replace(',', '.')
    
    const precio = parseFloat(normalized)
    
    if (isNaN(precio) || precio <= 0) {
      return NextResponse.json({
        precio: null,
        raw: rawText
      })
    }
    
    // Convertir a céntimos
    const precioCentimos = Math.round(precio * 100)
    
    return NextResponse.json({
      precio: precioCentimos,
      raw: rawText
    })
    
  } catch (error) {
    console.error('Scan precio error:', error)
    return NextResponse.json(
      { error: 'Internal server error', precio: null, raw: null },
      { status: 500 }
    )
  }
}
