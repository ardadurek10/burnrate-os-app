import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic()

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const { platform, topic, tone, extra } = await req.json()

    const platformInstructions = {
      twitter: 'Twitter/X için maksimum 270 karakter. Kısa, vurucu, emoji kullan.',
      linkedin: 'LinkedIn için 150-350 kelime. Satır aralarında boşluk bırak.',
      instagram: 'Instagram caption. Emoji kullan, call-to-action ile bitir. 100-200 kelime.',
      threads: 'Threads için 450 karakter maks. Samimi, konuşma tarzı.'
    }

    const topicLabels = {
      v2_1_teaser: 'BurnRate OS v2.1 yakında geliyor (teaser/hype postu)',
      feature_ai: 'AI Finansal Danışman özelliği',
      feature_invest: 'Canlı yatırım takibi — hisse ve kripto 5 saniyede bir güncelleniyor',
      feature_summary: 'Aylık özet ve PDF rapor indirme özelliği',
      feature_challenge: '30 günlük finansal meydan okuma',
      general_product: 'BurnRate OS genel ürün tanıtımı',
      tips: 'Finansal ipucu / para yönetimi tavsiyesi',
      engagement: 'Takipçilerle etkileşim postu'
    }

    const toneLabels = {
      heyecanli: 'heyecanlı, enerjik, ünlem işaretleri, pozitif',
      profesyonel: 'profesyonel, güvenilir, değer odaklı',
      gizemli: 'gizemli, merak uyandıran, cliffhanger',
      samimi: 'samimi, arkadaşça, sen dili',
      teknik: 'teknik detaylar, özellik odaklı'
    }

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Sen BurnRate OS adlı bir Türk fintech startup'ının sosyal medya uzmanısın. BurnRate OS; harcama takibi, abonelik yönetimi, yatırım takibi, AI finansal danışman ve aylık finansal özet sunan bir web uygulaması. URL: app.burnrate-os.com

${platformInstructions[platform]}
Konu: ${topicLabels[topic] || topic}
Ton: ${toneLabels[tone]}
${extra ? 'Ekstra: ' + extra : ''}

SADECE JSON formatında yanıt ver, başka hiçbir şey yazma:
{"content":"post metni","hashtags":["tag1","tag2","tag3","tag4","tag5"]}`
      }]
    })

    const text = message.content[0].text
    const parsed = JSON.parse(text.replace(/\`\`\`json|\`\`\`/g, '').trim())

    return NextResponse.json(parsed, { headers })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers })
  }
}
