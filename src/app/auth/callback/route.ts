import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createServerClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const email = data.user.email ?? ''
      const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL
      const employeeEmail = process.env.NEXT_PUBLIC_EMPLOYEE_EMAIL

      if (email === ownerEmail || email === employeeEmail) {
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        // Cerrar sesión del no autorizado
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/unauthorized?email=${encodeURIComponent(email)}`
        )
      }
    }
  }

  return NextResponse.redirect(`${origin}/login`)
}
