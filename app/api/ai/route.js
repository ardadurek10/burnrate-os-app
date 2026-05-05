export async function POST(request) {
    try {
      const { message, context } = await request.json()
  
      const res = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyApGGBFDLDk3hN0-Ig9BLDykkkw9UotCPY',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Sen BurnRate OS'un AI finansal danışmanısın. Dijital girişimciler için çalışıyorsun. Türkçe cevap ver. Kısa ve net ol. Maksimum 3 paragraf.\n\nKullanıcı verisi: ${context}\n\nKullanıcı sorusu: ${message}`
              }]
            }]
          })
        }
      )
  
      const data = await res.json()
      console.log('Gemini response:', JSON.stringify(data))
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Yanıt alınamadı.'
      return Response.json({ reply })
  
    } catch (error) {
      return Response.json({ reply: 'Sunucu hatası: ' + error.message })
    }
  } 