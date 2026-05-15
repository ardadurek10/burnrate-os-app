async function getUSDTRY() {
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X?interval=1d&range=1d',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const data = await res.json()
    const rate = data?.chart?.result?.[0]?.meta?.regularMarketPrice
    return rate ? parseFloat(rate) : 38.5
  } catch { return 38.5 }
}

function toTRY(price, currency, usdtry) {
  if (!price) return null
  if (currency === 'TRY') return price
  const rates = {
    USD: usdtry, EUR: usdtry * 1.08, GBP: usdtry * 1.27,
    JPY: usdtry / 155, CAD: usdtry * 0.74, AUD: usdtry * 0.65,
    CHF: usdtry * 1.11, CNY: usdtry * 0.14,
  }
  return price * (rates[currency] || usdtry)
}

const GOLD_TYPES = {
  'GOLD_GRAM':    { label: 'Gram Altın',        grams: 1,     purity: 0.995 },
  'GOLD_CEYREK':  { label: 'Çeyrek Altın',      grams: 1.75,  purity: 0.917 },
  'GOLD_YARIM':   { label: 'Yarım Altın',       grams: 3.5,   purity: 0.917 },
  'GOLD_TAM':     { label: 'Tam Altın',         grams: 7.0,   purity: 0.917 },
  'GOLD_CUMHUR':  { label: 'Cumhuriyet Altını', grams: 7.216, purity: 0.917 },
}

const NEWS_API_KEY = 'ab1cca05adfb453e9a168f032d04055d'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const symbol  = searchParams.get('symbol')
  const search  = searchParams.get('search')
  const history = searchParams.get('history')
  const news    = searchParams.get('news')
  const name    = searchParams.get('name')
  const period  = searchParams.get('period') || '1m'

  // ── NEWS ─────────────────────────────────────────────────────────
  if (news) {
    try {
      // Use company name if available, else symbol
      const query = encodeURIComponent(name || news)
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=6&language=en`,
        { headers: { 'X-Api-Key': NEWS_API_KEY } }
      )
      const data = await res.json()
      const items = (data?.articles || []).slice(0, 6).map(a => ({
        title:     a.title,
        link:      a.url,
        publisher: a.source?.name || '',
        time:      Math.floor(new Date(a.publishedAt).getTime() / 1000),
        thumbnail: a.urlToImage || null,
      }))
      return Response.json(items)
    } catch {
      return Response.json([])
    }
  }

  // ── SEARCH ───────────────────────────────────────────────────────
  if (search) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(search)}&quotesCount=8&newsCount=0`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      )
      const data = await res.json()
      const quotes = data?.quotes?.filter(q =>
        q.quoteType === 'EQUITY' || q.quoteType === 'CRYPTOCURRENCY'
      ) || []
      return Response.json(quotes.map(q => ({
        symbol:   q.symbol,
        name:     q.shortname || q.longname || q.symbol,
        type:     q.quoteType === 'CRYPTOCURRENCY' ? 'crypto' : 'stock',
        exchange: q.exchange,
      })))
    } catch { return Response.json([]) }
  }

  // ── HISTORY (Candlestick) ─────────────────────────────────────
  if (history) {
    try {
      const periodMap = {
        '1w': { range: '5d',  interval: '1h'  },
        '1m': { range: '1mo', interval: '1d'  },
        '3m': { range: '3mo', interval: '1d'  },
        '6m': { range: '6mo', interval: '1wk' },
        '1y': { range: '1y',  interval: '1wk' },
      }
      const { range, interval } = periodMap[period] || periodMap['1m']
      const usdtry = await getUSDTRY()

      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${history}?interval=${interval}&range=${range}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      )
      const data = await res.json()
      const result = data?.chart?.result?.[0]
      if (!result) return Response.json({ candles: [] })

      const timestamps = result.timestamp || []
      const quote = result.indicators?.quote?.[0] || {}
      const currency = result.meta?.currency || 'USD'

      const candles = timestamps.map((ts, i) => {
        const open  = quote.open?.[i]
        const high  = quote.high?.[i]
        const low   = quote.low?.[i]
        const close = quote.close?.[i]
        const vol   = quote.volume?.[i]
        if (!open || !close) return null
        return {
          time:   ts * 1000,
          open:   parseFloat(toTRY(open,  currency, usdtry)?.toFixed(2) || 0),
          high:   parseFloat(toTRY(high,  currency, usdtry)?.toFixed(2) || 0),
          low:    parseFloat(toTRY(low,   currency, usdtry)?.toFixed(2) || 0),
          close:  parseFloat(toTRY(close, currency, usdtry)?.toFixed(2) || 0),
          volume: vol || 0,
        }
      }).filter(Boolean)

      return Response.json({ candles, currency: 'TRY' })
    } catch (e) {
      return Response.json({ candles: [], error: e.message })
    }
  }

  // ── PRICE ────────────────────────────────────────────────────────
  if (symbol) {
    if (symbol.startsWith('GOLD_')) {
      try {
        const [gcRes, usdtry] = await Promise.all([
          fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d', { headers: { 'User-Agent': 'Mozilla/5.0' } }),
          getUSDTRY()
        ])
        const gcData = await gcRes.json()
        const meta = gcData?.chart?.result?.[0]?.meta
        const onsFiyat = meta?.regularMarketPrice
        const onsDun   = meta?.chartPreviousClose
        const goldType = GOLD_TYPES[symbol]
        if (!onsFiyat || !goldType) return Response.json({ error: 'unavailable' }, { status: 500 })

        const gramTRY  = (onsFiyat / 31.1035) * usdtry
        const priceTRY = gramTRY * goldType.grams * goldType.purity
        const prevTRY  = ((onsDun / 31.1035) * usdtry) * goldType.grams * goldType.purity
        const change   = prevTRY ? ((priceTRY - prevTRY) / prevTRY * 100).toFixed(2) : 0

        return Response.json({
          symbol, name: goldType.label,
          price: priceTRY.toFixed(2), change,
          currency: 'TRY', currencySymbol: '₺',
          gramWeight: goldType.grams, usdtry: usdtry.toFixed(2),
        })
      } catch (e) {
        return Response.json({ error: e.message }, { status: 500 })
      }
    }

    try {
      const [priceRes, usdtry] = await Promise.all([
        fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        ),
        getUSDTRY()
      ])
      const data  = await priceRes.json()
      const meta  = data?.chart?.result?.[0]?.meta
      const price = meta?.regularMarketPrice
      const prev  = meta?.chartPreviousClose
      const cur   = meta?.currency || 'USD'
      const change = price && prev ? ((price - prev) / prev * 100).toFixed(2) : 0

      return Response.json({
        symbol: symbol.toUpperCase(),
        name:             meta?.longName || meta?.shortName || symbol,
        price:            toTRY(price, cur, usdtry)?.toFixed(2),
        priceOriginal:    price?.toFixed(2),
        change, currency: 'TRY', currencySymbol: '₺',
        originalCurrency: cur,
        usdtry:           usdtry.toFixed(2),
        exchange:         meta?.exchangeName || '',
        dayHigh:          toTRY(meta?.regularMarketDayHigh,  cur, usdtry)?.toFixed(2),
        dayLow:           toTRY(meta?.regularMarketDayLow,   cur, usdtry)?.toFixed(2),
        week52High:       toTRY(meta?.fiftyTwoWeekHigh,      cur, usdtry)?.toFixed(2),
        week52Low:        toTRY(meta?.fiftyTwoWeekLow,       cur, usdtry)?.toFixed(2),
        marketCap:        meta?.marketCap,
        volume:           meta?.regularMarketVolume,
      })
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
  }

  return Response.json({ error: 'symbol or search required' }, { status: 400 })
}