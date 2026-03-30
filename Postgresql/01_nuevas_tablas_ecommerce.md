# Nuevas Tablas para E-commerce Completo (PostgreSQL)

Este documento contiene las sentencias `SQL` (DDL) para crear las tablas necesarias en PostgreSQL. Estas tablas cubren el 100% de los requerimientos dinámicos detectados en el análisis anterior: pasarelas de pago multi-tenant, variaciones de productos, cupones, múltiples imágenes, dominios personalizados y reglas de envío.

> **Nota:** Se asume que ya existen tablas principales como `users`, `landing_pages`, `products` y `orders` (como figuraban en tu Prisma schema). Estas consultas establecen las Foreign Keys (FK) hacia esas tablas.

---

### 1. Pasarelas de Pago Multi-tenant (Stripe Connect / Mercado Pago)
Para que cada cliente tenga su propia configuración de pagos (y el dinero les llegue a ellos).

```sql
CREATE TABLE payment_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id VARCHAR(255) NOT NULL, -- Relación con la tienda/landing
    provider VARCHAR(50) NOT NULL, -- 'stripe' o 'mercadopago'
    access_token TEXT NOT NULL, -- Token o Stripe Account ID (acct_xxx)
    public_key TEXT, -- Llave pública para el frontend si aplica
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_landing FOREIGN KEY (landing_page_id) REFERENCES landing_pages (id) ON DELETE CASCADE
);
```

---

### 2. Variantes de Producto (Tallas, Colores)
Para dividir un solo "Zapatos" en varias combinaciones: Talla 40, Color Rojo.

```sql
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id VARCHAR(255) NOT NULL, -- Relación con la tabla products actual
    sku VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL, -- Ejemplo: "Talla M - Rojo"
    price INTEGER NOT NULL, -- Centavos. Permitiría cobrar distinto por talla.
    compare_price INTEGER,
    stock INTEGER DEFAULT 0, -- -1 para infinito, 0 = sin stock
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);
```

---

### 3. Galería Multimedia (Soporte a múltiples imágenes)
Reemplaza la limitación de una sola imagen (`imageUrl`) por producto o bloque.

```sql
CREATE TABLE media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id VARCHAR(255) NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'product', 'block', 'gallery'
    entity_id VARCHAR(255) NOT NULL, -- ID del producto o bloque específico
    url TEXT NOT NULL, -- URL de S3, Cloudinary, o Blob
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_landing_media FOREIGN KEY (landing_page_id) REFERENCES landing_pages (id) ON DELETE CASCADE
);
```

---

### 4. Cupones de Descuento
Motor de porcentajes o montos fijos para el checkout.

```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL, -- Ej: VERANO20
    discount_type VARCHAR(20) NOT NULL, -- 'percentage' o 'fixed'
    discount_value INTEGER NOT NULL, -- 20 (%) o 500 (centavos=$5)
    max_uses INTEGER, -- Nulo = ilimitado
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_until TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_landing_coupon FOREIGN KEY (landing_page_id) REFERENCES landing_pages (id) ON DELETE CASCADE,
    UNIQUE(landing_page_id, code)
);
```

---

### 5. Reglas de Envío (Zonas Logísticas)
Para sumar montos en el checkout de la tienda basándose en la ubicación del cliente.

```sql
CREATE TABLE shipping_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL, -- Ej: 'Local', 'Nacional', 'Toda Europa'
    base_cost INTEGER NOT NULL, -- Centavos
    free_shipping_threshold INTEGER, -- Envío gratis si orden > monto (centavos)
    estimated_days VARCHAR(50), -- Ej: '3-5 días hábiles'
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_landing_shipping FOREIGN KEY (landing_page_id) REFERENCES landing_pages (id) ON DELETE CASCADE
);
```

---

### 6. Dominios Personalizados (Custom Domains)
Para permitir que un cliente use su propia URL en lugar del subdirectorio `/p/...`.

```sql
CREATE TABLE custom_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL, -- Ej: mimarca.com
    status VARCHAR(50) DEFAULT 'unverified', -- 'unverified', 'active', 'failed'
    ssl_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_landing_domain FOREIGN KEY (landing_page_id) REFERENCES landing_pages (id) ON DELETE CASCADE
);
```

---

### 7. Configuración de SEO y Metadatos Dinámicos
Para configurar título, descripción e imagen compartida (OpenGraph) por landing.

```sql
CREATE TABLE seo_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id VARCHAR(255) NOT NULL UNIQUE,
    meta_title VARCHAR(255),
    meta_description TEXT,
    og_image_url TEXT, -- Imagen al compartir en WhatsApp/FB
    favicon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_landing_seo FOREIGN KEY (landing_page_id) REFERENCES landing_pages (id) ON DELETE CASCADE
);
```
