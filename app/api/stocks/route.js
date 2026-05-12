// USD/TRY kurunu Yahoo Finance'ten çek
async function getUSDTRY() {
  try {
    const res = await fetch(
      'https://query1.finance.yahoo.com/v8/finance/chart/USDTRY=X?interval=1d&range=1d',
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    )
    const data = await res.json()
    const rate = data?.chart?.result?.[0]?.meta?.regularMarketPrice
    return rate ? parseFloat(rate) : 38.5
  } catch {
    return 38.5
  }
}

function toTRY(price, currency, usdtry) {
  if (!price) return null
  if (currency === 'TRY') return price
  const rates = {
    USD: usdtry,
    EUR: usdtry * 1.08,
    GBP: usdtry * 1.27,
    JPY: usdtry / 155,
    CAD: usdtry * 0.74,
    AUD: usdtry * 0.65,
    CHF: usdtry * 1.11,
    CNY: usdtry * 0.14,
  }
  return price * (rates[currency] || usdtry)
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
        symbol:   q.symbol,
        name:     q.shortname || q.longname || q.symbol,
        type:     q.quoteType === 'CRYPTOCURRENCY' ? 'crypto' : 'stock',
        exchange: q.exchange,
      })))
    } catch {
      return Response.json([], { status: 200 })
    }
  }

  // ── PRICE ────────────────────────────────────────────────────────
  if (symbol) {
    try {
      const [priceRes, usdtry] = await Promise.all([
        fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        ),
        getUSDTRY()
      ])

      const data      = await priceRes.json()
      const meta      = data?.chart?.result?.[0]?.meta
      const price     = meta?.regularMarketPrice
      const prevClose = meta?.chartPreviousClose
      const currency  = meta?.currency || 'USD'
      const name      = meta?.longName || meta?.shortName || symbol
      const change    = price && prevClose
        ? ((price - prevClose) / prevClose * 100).toFixed(2)
        : 0

      const priceTRY = toTRY(price, currency, usdtry)

      return Response.json({
        symbol:           symbol.toUpperCase(),
        name,
        price:            priceTRY ? priceTRY.toFixed(2) : null,  // TRY fiyat
        priceOriginal:    price?.toFixed(2),                       // orijinal fiyat
        change,
        currency:         'TRY',
        currencySymbol:   '₺',
        originalCurrency: currency,
        usdtry:           usdtry.toFixed(2),
        exchange:         meta?.exchangeName || '',
      })
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
  }

  return Response.json({ error: 'symbol or search required' }, { status: 400 })
}