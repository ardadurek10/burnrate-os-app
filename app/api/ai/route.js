export async function POST(request) {
    try {
      const { message, context } = await request.json()
  
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: `Sen BurnRate OS'un AI finansal danışmanısın. Türkçe cevap ver. Kısa ve net ol. Kullanıcı verisi: ${context}`,
          messages: [{ role: 'user', content: message }]
        })
      })
  
      const data = await res.json()
      console.log('Anthropic response:', JSON.stringify(data))
      
      if (data.error) {
        return Response.json({ reply: 'API hatası: ' + data.error.message })
      }
  
      const reply = data.content?.[0]?.text || 'Yanıt alınamadı.'
      return Response.json({ reply })
  
    } catch (error) {
      console.error('AI route error:', error)
      return Response.json({ reply: 'Sunucu hatası: ' + error.message })
    }
  }