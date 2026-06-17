# ⛽ Gasolina Tracker

App para registrar viajes con cálculo de gasolina y casetas, historial por usuario, y vista admin para superusuarios.

---

## 🚀 Deploy en 5 pasos

### Paso 1 — Crear proyecto en Supabase (gratis)

1. Ve a [supabase.com](https://supabase.com) → **Start for free**
2. Crea una organización y un nuevo proyecto (guarda la contraseña de la BD)
3. En el dashboard de Supabase, ve a **SQL Editor**
4. Pega todo el contenido de `supabase-schema.sql` y clic en **Run**

### Paso 2 — Obtener las keys de Supabase

En Supabase: **Settings → API**

Copia:
- `Project URL` → esto es tu `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → esto es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Paso 3 — Deploy en Vercel (gratis)

**Opción A — GitHub (recomendado):**
1. Sube esta carpeta a un repo en GitHub (puede ser privado)
2. Ve a [vercel.com](https://vercel.com) → **Add New Project**
3. Importa el repo
4. En **Environment Variables** agrega:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://tuproyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = tu_key_aqui
   ```
5. Clic en **Deploy** ✓

**Opción B — Vercel CLI:**
```bash
npm i -g vercel
cd gasolina
vercel
# Sigue las instrucciones, luego agrega las env vars en vercel.com
```

### Paso 4 — Crear el primer superusuario

1. Abre tu app en Vercel (ej. `https://gasolina-tracker.vercel.app`)
2. Ve a `/setup` (ej. `https://gasolina-tracker.vercel.app/setup`)
3. Llena el formulario con tu nombre, correo y contraseña
4. ¡Listo! Ya puedes entrar como superusuario

### Paso 5 — Crear usuarios adicionales

1. Entra con tu cuenta de superusuario
2. Ve a **Usuarios** en el menú lateral
3. Crea los demás usuarios con sus roles

---

## 🔐 Roles

| Rol | Puede ver |
|-----|-----------|
| **Superusuario** | Todos los viajes + ranking + filtros + gestión de usuarios |
| **Usuario** | Solo sus propios viajes |

---

## 📋 Campos por viaje

- Vendedor (quién hizo el viaje)
- Descripción (ej. Monterrey → Saltillo)
- Tipo de gasolina (Magna, Premium, Diésel)
- Distancia en km
- Precio por litro
- Rendimiento del vehículo (km/L)
- ¿Tiene caseta? → costo de caseta
- Notas opcionales

---

## 🛠️ Desarrollo local

```bash
npm install
cp .env.local.example .env.local
# Edita .env.local con tus keys de Supabase
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura

```
pages/
  index.tsx      → Calculadora principal
  historial.tsx  → Mi historial (todos los usuarios)
  admin.tsx      → Vista todos los viajes (solo superusuarios)
  usuarios.tsx   → Gestión de usuarios (solo superusuarios)
  login.tsx      → Login
  setup.tsx      → Setup inicial (solo si no hay usuarios)
lib/
  supabase.ts    → Cliente de Supabase
  auth.tsx       → Context de autenticación
components/
  Layout.tsx     → Sidebar + shell de la app
styles/
  globals.css    → Estilos globales
supabase-schema.sql → Schema de la base de datos
```
