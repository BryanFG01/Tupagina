# TuNegocio Backend — ASP.NET Core 8 Web API

Backend de TuNegocio construido sobre **ASP.NET Core 8** con **Arquitectura Limpia**, 
compatible con la base de datos PostgreSQL y los hashes de contraseña generados por el frontend Next.js existente.

---

## 🚀 Requisitos Previos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- PostgreSQL 14+
- Cuenta de [Stripe](https://stripe.com) (para pagos)

---

## ⚙️ Configuración

Edita `src/TuNegocio.API/appsettings.json` con tus valores reales:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=tunegocio_db;Username=postgres;Password=TU_PASSWORD"
  },
  "Jwt": {
    "Key": "CLAVE_SECRETA_DE_AL_MENOS_32_CARACTERES"
  },
  "Stripe": {
    "SecretKey": "sk_test_...",
    "WebhookSecret": "whsec_..."
  }
}
```

---

## 🗄️ Base de Datos

### Opción A: EF Core Migrations (recomendado)

```bash
cd src/TuNegocio.API
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Opción B: Script SQL manual

Ejecuta el archivo `database/schema.sql` directamente en tu instancia de PostgreSQL.

---

## ▶️ Ejecutar en Desarrollo

```bash
cd src/TuNegocio.API
dotnet run
```

La API estará disponible en:
- **HTTP**: `http://localhost:5000`
- **Swagger UI**: `http://localhost:5000/swagger`

---

## 📡 Endpoints

| Método | Endpoint                       | Acceso         |
|--------|--------------------------------|----------------|
| POST   | /api/auth/login                | Público        |
| GET    | /api/landings                  | Autorizado     |
| POST   | /api/landings                  | Autorizado     |
| PUT    | /api/landings/{id}             | Autorizado     |
| DELETE | /api/landings/{id}             | Autorizado     |
| GET    | /api/public/landings/{slug}    | Público        |
| POST   | /api/store/checkout            | Público        |
| POST   | /api/webhooks/stripe           | Público (+firma)|

---

## 🔑 Notas de Migración Next.js ↔ .NET

- **Contraseñas**: `BCrypt.Net-Next` es 100% compatible con hashes de `bcryptjs`. No se requiere resetear contraseñas.
- **Fechas**: Se usa `DateTime.UtcNow` en todo momento (compatible con `TIMESTAMPTZ` de PostgreSQL).
- **IDs**: Se mantiene `string` (UUID) para todos los IDs.

---

## 🏗️ Estructura del Proyecto

```
src/TuNegocio.API/
├── Domain/
│   ├── Entities/        → User, Landing, Product, Order, OrderItem
│   └── Interfaces/      → IUserRepository, ILandingRepository, etc.
├── Application/
│   ├── DTOs/            → Request/Response records
│   ├── Services/        → AuthService, LandingService, PaymentService
│   └── Validators/      → FluentValidation validators
├── Infrastructure/
│   ├── Data/            → AppDbContext (EF Core + JSONB)
│   └── Repositories/    → Implementaciones de interfaces
└── API/
    └── Controllers/     → Auth, Landings, Public, Store, Webhooks
```
