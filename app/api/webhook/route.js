import { supabaseInsert } from '../../lib/supabase'

function generateLicenseKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segment = () => Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `BRNOS-${segment()}-${segment()}-${segment()}`
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { action, data } = body

    if (action === 'membership.went_valid') {
      const email = data?.user?.email || data?.email || 'test@whoptest.com'
      const name = data?.user?.name || data?.name || 'BurnRate Kullanıcısı'

      const licenseKey = generateLicenseKey()

      await supabaseInsert('users', {
        email: email.toLowerCase(),
        license_key: licenseKey,
        name: name,
        currency: 'USD'
      })

      return Response.json({ success: true, license_key: licenseKey })
    }

    return Response.json({ received: true })

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}