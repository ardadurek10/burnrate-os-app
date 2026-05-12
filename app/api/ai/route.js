export async function POST(request) {
  try {
    const { message, context, lang } = await request.json()
    const TR = lang === 'tr'

    const systemPrompt = TR
      ? `Sen BurnRate OS'un yapay zeka finansal danışmanısın. Dijital girişimciler, freelancer'lar ve öğrencilerle çalışıyorsun. Kullanıcının gerçek finansal verilerine dayanarak kısa, keskin ve uygulanabilir tavsiyeler ver. HER ZAMAN TÜRKÇE yanıt ver. Maksimum 3 paragraf. Kullanıcı verileri: ${context}`
      : `You are BurnRate OS's AI financial advisor. You work with digital entrepreneurs, freelancers, and students. Give short, sharp, actionable advice based on the user's real financial data. Always respond in English. Maximum 3 paragraphs. User data: ${context}`

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
        system: systemPrompt,
        messages: [{ role: 'user', content: message }]
      })
    })

    const data = await res.json()
    const reply = data.content?.[0]?.text || (TR ? 'Yanıt alınamadı.' : 'Could not get a response.')
    return Response.json({ reply })

  } catch (error) {
    return Response.json({ reply: 'Sunucu hatası: ' + error.message })
  }
}