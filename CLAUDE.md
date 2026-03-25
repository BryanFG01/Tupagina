# TuNegocio — Reglas del Proyecto

## Visión del Producto
Plataforma SaaS para pequeños negocios y freelancers que permite crear landing pages simples optimizadas para vender y cobrar en línea en pocos minutos. No es un constructor web genérico: es una herramienta especializada en **conversión rápida + pagos integrados**.

## Stack Tecnológico
- **Framework**: Next.js (App Router) — fullstack, frontend + backend
- **Lenguaje**: TypeScript estricto (`strict: true`)
- **Estilos**: Tailwind CSS
- **Base de datos**: PostgreSQL
- **ORM**: Prisma
- **Pagos**: Stripe + Mercado Pago
- **Auth**: NextAuth.js

---

## Arquitectura por Capas (Monolito Modular)

```
src/
├── domain/          # Entidades, tipos, reglas de negocio puras
├── services/        # Casos de uso, lógica de aplicación
├── infrastructure/  # DB (Prisma), APIs externas (Stripe, MercadoPago)
├── app/             # Next.js: rutas, componentes, server actions
└── components/      # Componentes UI reutilizables
```

### Reglas de Capas (NO NEGOCIABLES)

1. **Los componentes React NO acceden a la base de datos directamente.** Toda interacción con datos pasa por `services/`.
2. **Los componentes React NO llaman a APIs externas (Stripe, MercadoPago) directamente.** Usan server actions o API routes que delegan a `services/` → `infrastructure/`.
3. **`domain/` no importa nada de `services/`, `infrastructure/` ni `app/`.** Solo tipos y lógica pura.
4. **`services/` no importa nada de `app/` ni `components/`.** Solo usa `domain/` e `infrastructure/`.
5. **`infrastructure/` implementa interfaces definidas en `domain/` o `services/`.** Nunca al revés.

### Ejemplo de flujo correcto
```
UI (componente) → Server Action (app/) → Service (services/) → Repository (infrastructure/) → Prisma → PostgreSQL
```

---

## Convenciones de Código

### TypeScript
- `strict: true` siempre activo
- Preferir `type` sobre `interface` para DTOs y payloads
- Usar `interface` para contratos de repositorios y servicios
- Sin `any`. Usar `unknown` y hacer type narrowing
- Exportar tipos desde `domain/` y reutilizarlos en todas las capas

### Nombrado
- Archivos: `kebab-case.ts`
- Componentes React: `PascalCase.tsx`
- Funciones/variables: `camelCase`
- Constantes: `UPPER_SNAKE_CASE`
- Tipos/Interfaces: `PascalCase`

### Estructura de un Servicio
```typescript
// services/landing/create-landing.ts
export async function createLanding(userId: string, input: CreateLandingInput): Promise<Landing> {
  // 1. Validar input (domain rules)
  // 2. Llamar infrastructure
  // 3. Retornar entidad de dominio
}
```

### Server Actions
- Siempre con `"use server"` al inicio
- Validar con Zod antes de llamar al servicio
- Retornar `{ success: true, data }` o `{ success: false, error: string }`

---

## Sistema de Bloques (Landing Pages)

Las landing pages son estructuras JSON con bloques predefinidos. **No hay drag & drop**.

### Bloques disponibles
- `hero` — Título, subtítulo, CTA
- `services` — Lista de servicios/productos
- `testimonials` — Testimonios de clientes
- `payment` — Botón de pago (Stripe/MercadoPago)
- `contact` — Formulario de contacto/WhatsApp

### Estructura JSON de una Landing
```typescript
type LandingPage = {
  id: string
  userId: string
  slug: string
  title: string
  blocks: Block[]
  published: boolean
  createdAt: Date
}

type Block = {
  id: string
  type: 'hero' | 'services' | 'testimonials' | 'payment' | 'contact'
  order: number
  content: Record<string, unknown> // validado por schema del bloque
}
```

---

## Integración de Pagos

- Stripe y Mercado Pago procesados **solo en server-side** (API routes o server actions)
- Webhooks en `/api/webhooks/stripe` y `/api/webhooks/mercadopago`
- Cada transacción se registra en la tabla `payments` antes de confirmar al usuario
- **Nunca exponer keys secretas en el cliente**

---

## Prioridades por Fase

### Fase 1 — MVP (PRIORIDAD ACTUAL)
- [ ] Autenticación (registro, login con NextAuth)
- [ ] CRUD de landing pages con bloques
- [ ] Guardado en PostgreSQL via Prisma
- [ ] Publicación con slug único (`tunegocio.app/p/mi-negocio`)
- [ ] Botón de pago funcional (Stripe primero)

### Fase 2
- Dashboard de ventas y métricas básicas
- Historial de pagos por landing
- Mejoras de UI/UX para usuarios no técnicos

### Fase 3
- Plantillas por nicho (restaurantes, servicios, freelancers)
- Integraciones (email marketing, WhatsApp)
- Dominios personalizados

**Regla de prioridad**: Si algo no está en Fase 1, no lo implementes hasta que el MVP esté validado.

---

## UX y Experiencia de Usuario

- El target son **personas no técnicas**. La UI debe ser obvia, sin jerga técnica
- Flujo de creación de landing: máximo 5 pasos, máximo 10 minutos para publicar
- Mensajes de error en español, claros y accionables
- Mobile-first en páginas públicas (las landings que ven los compradores)
- Dashboard puede ser desktop-first

---

## Principios de Desarrollo

1. **Valida rápido**: Antes de construir algo complejo, pregunta si el MVP lo necesita
2. **Sin over-engineering**: No abstraer para casos hipotéticos futuros
3. **Simple > Elegante**: Una solución simple que funciona es mejor que una arquitectura perfecta que tarda semanas
4. **Sin mocks en producción**: Tests de integración deben usar DB real (entorno de test)
5. **La arquitectura en capas existe para poder reemplazar el backend en el futuro** (ej: migrar a .NET) sin reescribir la UI ni la lógica de dominio

---

## Comandos Útiles del Proyecto

```bash
npm run dev          # Servidor de desarrollo
npm run db:migrate   # Ejecutar migraciones de Prisma
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Poblar DB con datos de prueba
npm run test         # Tests
npm run build        # Build de producción
```

---

## Variables de Entorno Requeridas

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
MERCADOPAGO_ACCESS_TOKEN=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```
