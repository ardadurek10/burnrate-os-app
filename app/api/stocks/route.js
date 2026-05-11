// Para birimi sembolleri
const CURRENCY_SYMBOLS = {
  USD: '$', TRY: '₺', EUR: '€', GBP: '£',
  JPY: '¥', KRW: '₩', INR: '₹', BTC: '₿',
  CAD: 'C$', AUD: 'A$', CHF: 'Fr', CNY: '¥',
}

// USD karşısı yaklaşık kurlar (gerçek zamanlı değil, fallback için)
const APPROX_USD_RATES = {
  TRY: 0.028,  // 1 TRY ≈ 0.028 USD
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
  KRW: 0.00075,
  INR: 0.012,
  CAD: 0.74,
  AUD: 0.65,
  CHF: 1.11,
  CNY: 0.14,
  USD: 1,
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const search = searchParams.get('search')

  // ── SEARCH ──────────────────────────────────────────────────────
  if (search) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${search}&quotesCount=8&newsCount=0`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      )
      const data = await res.json()
      const quotes = data?.quotes?.filter(q =>
        q.quoteType === 'EQUITY' || q.quoteType === 'CRYPTOCURRENCY'
      ) || []

      return Response.json(quotes.map(q => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        type: q.quoteType === 'CRYPTOCURRENCY' ? 'crypto' : 'stock',
        exchange: q.exchange,
      })))
    } catch (error) {
      return Response.json([], { status: 200 })
    }
  }

  // ── PRICE ────────────────────────────────────────────────────────
  if (symbol) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      )
      const data = await res.json()
      const meta = data?.chart?.result?.[0]?.meta

      const price     = meta?.regularMarketPrice
      const prevClose = meta?.chartPreviousClose
      const currency  = meta?.currency || 'USD'
      const name      = meta?.longName || meta?.shortName || symbol
      const change    = price && prevClose
        ? ((price - prevClose) / prevClose * 100).toFixed(2)
        : 0

      // USD'ye çevrilmiş fiyat (portfolio değeri hesabı için)
      const rate = APPROX_USD_RATES[currency] || 1
      const priceUSD = price ? (price * rate).toFixed(2) : null

      // Orijinal para birimindeki fiyat gösterim için
      const currencySymbol = CURRENCY_SYMBOLS[currency] || currency + ' '

      return Response.json({
        symbol:        symbol.toUpperCase(),
        name,
        price:         price?.toFixed(2),        // orijinal para biriminde
        priceUSD,                                 // USD karşılığı
        change,
        currency,                                 // 'TRY', 'USD', 'EUR' ...
        currencySymbol,                           // '₺', '$', '€' ...
        exchange:      meta?.exchangeName || '',
      })
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
  }

  return Response.json({ error: 'symbol or search required' }, { status: 400 })
}