export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')
    const search = searchParams.get('search')
  
    if (search) {
      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v1/finance/search?q=${search}&quotesCount=6&newsCount=0`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        )
        const data = await res.json()
        const quotes = data?.quotes?.filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'CRYPTOCURRENCY') || []
        return Response.json(quotes.map(q => ({
          symbol: q.symbol,
          name: q.shortname || q.longname || q.symbol,
          type: q.quoteType === 'CRYPTOCURRENCY' ? 'crypto' : 'stock',
          exchange: q.exchange
        })))
      } catch (error) {
        return Response.json([], { status: 200 })
      }
    }
  
    if (symbol) {
      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        )
        const data = await res.json()
        const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
        const prevClose = data?.chart?.result?.[0]?.meta?.chartPreviousClose
        const change = price && prevClose ? ((price - prevClose) / prevClose * 100).toFixed(2) : 0
        const name = data?.chart?.result?.[0]?.meta?.longName || symbol
  
        return Response.json({
          symbol: symbol.toUpperCase(),
          name,
          price: price?.toFixed(2),
          change,
          currency: data?.chart?.result?.[0]?.meta?.currency || 'USD'
        })
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 })
      }
    }
  
    return Response.json({ error: 'symbol or search required' }, { status: 400 })
  }