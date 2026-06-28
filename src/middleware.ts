import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Rutas públicas
  const isPublic = path === '/login' || path === '/unauthorized' || path.startsWith('/auth')
  if (isPublic) return supabaseResponse

  // Rutas protegidas: requieren sesión
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verificar correo autorizado
  const email = user.email ?? ''
  const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL
  const employeeEmail = process.env.NEXT_PUBLIC_EMPLOYEE_EMAIL
  if (email !== ownerEmail && email !== employeeEmail) {
    await supabase.auth.signOut()
    return NextResponse.redirect(
      new URL(`/unauthorized?email=${encodeURIComponent(email)}`, request.url)
    )
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
