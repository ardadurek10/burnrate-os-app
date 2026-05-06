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
            model: 'claude-sonnet-4-5',
          max_tokens: 1024,
          system: `You are BurnRate OS's AI financial advisor. You work with digital entrepreneurs, freelancers, and students. Give short, sharp, actionable advice based on the user's real financial data. Always respond in English. Maximum 3 paragraphs. User data: ${context}`,
          messages: [{ role: 'user', content: message }]
        })
      })
  
      const data = await res.json()
      console.log('Anthropic data:', JSON.stringify(data))
      const reply = data.content?.[0]?.text || 'Yanıt alınamadı.'
      return Response.json({ reply })
  
    } catch (error) {
      return Response.json({ reply: 'Sunucu hatası: ' + error.message })
    }
  }