export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
  
    if (!symbol) {
      return Response.json({ error: 'Symbol required' }, { status: 400 })
    }
  
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      )
      const data = await res.json()
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
      const prevClose = data?.chart?.result?.[0]?.meta?.chartPreviousClose
      const change = price && prevClose ? ((price - prevClose) / prevClose * 100).toFixed(2) : 0
  
      return Response.json({
        symbol: symbol.toUpperCase(),
        price: price?.toFixed(2),
        change,
        currency: data?.chart?.result?.[0]?.meta?.currency || 'USD'
      })
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500 })
    }
  }