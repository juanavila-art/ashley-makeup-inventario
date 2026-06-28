# Ashley Makeup — Inventario · Guía de configuración

## 1. Supabase

### 1.1 Crear proyecto
1. Ve a [supabase.com](https://supabase.com) → New project
2. Elige nombre, contraseña y región (South America)

### 1.2 Ejecutar SQL (en orden)
En el **SQL Editor** de tu proyecto, ejecuta estos tres archivos en orden:

```
database/schema.sql      ← tablas, RLS
database/functions.sql   ← funciones de stock atómico
database/seed.sql        ← 15 productos + período inicial
```

### 1.3 Configurar Google OAuth
1. Ve a **Authentication → Providers → Google**
2. Activa Google, anota el Redirect URL que Supabase te da
3. Ve a [console.cloud.google.com](https://console.cloud.google.com)
4. Crea un proyecto → APIs → OAuth 2.0 → Web application
5. En "Authorized redirect URIs" pega el URL de Supabase
6. Copia el Client ID y Client Secret → pégalos en Supabase

### 1.4 Obtener credenciales
**Settings → API** → copia:
- `Project URL`
- `anon public` key

---

## 2. Variables de entorno

Crea el archivo `.env.local` (copia de `.env.local.example`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

NEXT_PUBLIC_OWNER_EMAIL=correo-duena@gmail.com
NEXT_PUBLIC_EMPLOYEE_EMAIL=correo-empleada@gmail.com
```

---

## 3. Instalar y correr localmente

```bash
cd ashley-makeup-inventario
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 4. Despliegue en Vercel (recomendado)

1. Sube el proyecto a GitHub
2. Ve a [vercel.com](https://vercel.com) → Import project
3. En **Environment Variables** agrega las 4 variables del `.env.local`
4. En Supabase → **Authentication → URL Configuration** → agrega tu dominio Vercel como Redirect URL

---

## 5. Uso

| Acción | Quién |
|---|---|
| Registrar ventas | Ambas |
| Ver inventario | Ambas (empleada: solo lectura) |
| Agregar/editar/eliminar productos | Solo dueña |
| Recargar inventario | Solo dueña |
| Ver panel + métricas | Solo dueña |
| Cuadre de caja + cerrar período | Solo dueña |
| Anular ventas | Ambas (propias) / Dueña (todas) |
