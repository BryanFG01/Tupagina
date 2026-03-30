import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ─── Usuario demo ──────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('password123', 12)

  const user = await prisma.user.upsert({
    where:  { email: 'demo@tunegocio.com' },
    update: {},
    create: {
      name:     'Demo User',
      email:    'demo@tunegocio.com',
      password: hashedPassword,
    },
  })
  console.log('✅ Usuario:', user.email)

  // ─── Landing demo: FreshCart ───────────────────────────────────────────────
  const landing = await prisma.landingPage.upsert({
    where:  { slug: 'freshcart-demo' },
    update: {},
    create: {
      userId:      user.id,
      title:       'FreshCart — Supermercado Online',
      slug:        'freshcart-demo',
      description: 'Demo completo: tienda de abarrotes estilo Instacart con todos los bloques del MVP',
      published:   true,
      blocks: JSON.stringify([

        // ── 1. Navbar ──────────────────────────────────────────────────────
        {
          id: 'b-navbar', type: 'navbar', order: 0,
          content: {
            brandName:    'FreshCart',
            brandLogo:    '',
            sticky:       true,
            transparent:  false,
            textColor:    'dark',
            backgroundColor: '#ffffff',
            dropdownStyle:   'floating',
            showSearch:   false,
            ctaText:      'Hacer pedido',
            ctaUrl:       '#productos',
            items: [
              { id: 'n1', label: 'Inicio',    url: '#',         hasDropdown: false, dropdown: [] },
              { id: 'n2', label: 'Productos', url: '#productos', hasDropdown: false, dropdown: [] },
              {
                id: 'n3', label: 'Categorías', url: '#', hasDropdown: true,
                dropdown: [
                  { id: 'dd1', label: '🍎 Frutas y Verduras', url: '/p/mercado-frutas' },
                  { id: 'dd2', label: '🥩 Carnes y Aves',     url: '/p/mercado-carnes' },
                  { id: 'dd3', label: '🥛 Lácteos',           url: '/p/mercado-lacteos' },
                  { id: 'dd4', label: '🍞 Panadería',         url: '/p/mercado-panaderia' },
                  { id: 'dd5', label: '🧃 Bebidas',           url: '/p/mercado-bebidas' },
                ],
              },
              { id: 'n4', label: 'Nosotros', url: '#nosotros', hasDropdown: false, dropdown: [] },
              { id: 'n5', label: 'Contacto', url: '#contacto', hasDropdown: false, dropdown: [] },
            ],
          },
        },

        // ── 2. Store Banner ────────────────────────────────────────────────
        {
          id: 'b-banner', type: 'store-banner', order: 1,
          content: {
            storeName:         'FreshCart',
            tagline:           'Tu supermercado favorito, ahora en tu puerta en menos de 1 hora',
            ctaText:           'Comprar ahora',
            ctaTarget:         '#productos',
            backgroundColor:   '#0a7c45',
            textColor:         'light',
            backgroundImage:   'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80',
            backgroundPosition: 'center',
            overlayColor:      '#052e19',
            overlayOpacity:    55,
            cartButton:        'banner',
            announcement:      '🚚 Envío gratis en pedidos mayores a $500  ·  ⚡ Entrega express en 60 min  ·  🎁 10% OFF tu primer pedido con código BIENVENIDO',
            navDropdownStyle:  'floating',
            navItems: [
              { id: 'nav1', label: 'Frutas',   url: '/p/mercado-frutas',     dropdown: [] },
              { id: 'nav2', label: 'Carnes',   url: '/p/mercado-carnes',     dropdown: [] },
              { id: 'nav3', label: 'Lácteos',  url: '/p/mercado-lacteos',    dropdown: [] },
              { id: 'nav4', label: 'Bebidas',  url: '/p/mercado-bebidas',    dropdown: [] },
            ],
            navAlign: 'center',
          },
        },

        // ── 3. Brands Banner ───────────────────────────────────────────────
        {
          id: 'b-brands', type: 'brands-banner', order: 2,
          content: {
            label: 'Marcas que puedes encontrar',
            items: [
              { id: 'br1',  type: 'text', text: 'NESTLÉ',      color: '#0066b2' },
              { id: 'br2',  type: 'text', text: 'COCA‑COLA',   color: '#e31837' },
              { id: 'br3',  type: 'text', text: 'KELLOGG\'S',  color: '#e2001a' },
              { id: 'br4',  type: 'text', text: 'UNILEVER',    color: '#1a2d8a' },
              { id: 'br5',  type: 'text', text: 'DANONE',      color: '#003087' },
              { id: 'br6',  type: 'text', text: 'LALA',        color: '#0063a3' },
              { id: 'br7',  type: 'text', text: 'BACHOCO',     color: '#c8102e' },
              { id: 'br8',  type: 'text', text: 'BIMBO',       color: '#1d4289' },
              { id: 'br9',  type: 'text', text: 'MASECA',      color: '#f7941d' },
              { id: 'br10', type: 'text', text: 'BONAFONT',    color: '#00b5e2' },
            ],
            speed:         'normal',
            direction:     'left',
            backgroundColor: '#f8f9fa',
            textColor:     '#1a1a2e',
            pauseOnHover:  true,
            separator:     'line',
            fontSize:      'md',
            fontWeight:    'black',
            uppercase:     true,
            letterSpacing: true,
          },
        },

        // ── 4. Icons Ticker — categorías (con links a mercados) ───────────
        {
          id: 'b-icons', type: 'icons-ticker', order: 3,
          content: {
            title: 'Compra por categoría',
            items: [
              { id: 'ic1',  icon: '🍎', iconType: 'emoji', label: 'Frutas',      url: '/p/mercado-frutas' },
              { id: 'ic2',  icon: '🥦', iconType: 'emoji', label: 'Verduras',    url: '/p/mercado-frutas' },
              { id: 'ic3',  icon: '🥩', iconType: 'emoji', label: 'Carnes',      url: '/p/mercado-carnes' },
              { id: 'ic4',  icon: '🐟', iconType: 'emoji', label: 'Pescados',    url: '/p/mercado-carnes' },
              { id: 'ic5',  icon: '🥛', iconType: 'emoji', label: 'Lácteos',     url: '/p/mercado-lacteos' },
              { id: 'ic6',  icon: '🥚', iconType: 'emoji', label: 'Huevos',      url: '/p/mercado-lacteos' },
              { id: 'ic7',  icon: '🍞', iconType: 'emoji', label: 'Panadería',   url: '/p/mercado-panaderia' },
              { id: 'ic8',  icon: '🧃', iconType: 'emoji', label: 'Bebidas',     url: '/p/mercado-bebidas' },
              { id: 'ic9',  icon: '🍫', iconType: 'emoji', label: 'Snacks',      url: '/p/freshcart-demo' },
              { id: 'ic10', icon: '🧴', iconType: 'emoji', label: 'Limpieza',    url: '/p/freshcart-demo' },
              { id: 'ic11', icon: '🌿', iconType: 'emoji', label: 'Orgánicos',   url: '/p/freshcart-demo' },
              { id: 'ic12', icon: '🐾', iconType: 'emoji', label: 'Mascotas',    url: '/p/freshcart-demo' },
            ],
            speed:           'normal',
            direction:       'left',
            backgroundColor: '#ffffff',
            cardBg:          '#f0fdf4',
            textColor:       '#14532d',
            accentColor:     '#16a34a',
            pauseOnHover:    true,
            iconSize:        'md',
            showLabels:      true,
            rounded:         'md',
            gap:             'md',
          },
        },

        // ── 5. Features — ¿Por qué FreshCart? ────────────────────────────
        {
          id: 'b-features', type: 'features', order: 4,
          content: {
            title:    '¿Por qué elegir FreshCart?',
            subtitle: 'Todo lo que necesitas para comprar fácil, rápido y sin salir de casa',
            layout:   'horizontal',
            columns:  3,
            imageStyle: 'rounded',
            gap:      'lg',
            backgroundColor: '#ffffff',
            textColor:       '#111827',
            accentColor:     '#16a34a',
            items: [
              {
                id: 'ft1',
                icon:        '⚡',
                title:       'Entrega en 60 minutos',
                description: 'Olvídate de las filas. Selecciona tus productos, paga en línea y los recibimos en tu puerta antes de que lo notes. Disponible todos los días, incluso festivos.',
                image:       'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=700&q=80',
                ctaText:     'Ver zonas de entrega',
                ctaUrl:      '#',
              },
              {
                id: 'ft2',
                icon:        '✅',
                title:       'Sin markups ni sorpresas',
                description: 'Los precios que ves son exactamente los que pagas. Sin cargos ocultos, sin precios inflados. Transparencia total en cada compra que realizas.',
                image:       'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=700&q=80',
                ctaText:     'Ver precios',
                ctaUrl:      '#productos',
              },
              {
                id: 'ft3',
                icon:        '📱',
                title:       'Pide desde donde estés',
                description: 'Desde tu celular, tableta o computadora. Tu carrito se guarda y puedes retomar tu compra cuando quieras. Proceso de pago en menos de 2 minutos.',
                image:       'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=80',
                ctaText:     'Empezar ahora',
                ctaUrl:      '#productos',
              },
            ],
          },
        },

        // ── 6. Stats ──────────────────────────────────────────────────────
        {
          id: 'b-stats', type: 'stats', order: 5,
          content: {
            title:    'Números que nos respaldan',
            subtitle: 'Miles de familias ya confían en FreshCart para su despensa semanal',
            layout:   'grid-4',
            cardStyle: 'colored',
            backgroundColor: '#052e19',
            textColor:       '#ffffff',
            accentColor:     '#4ade80',
            animate:  true,
            items: [
              { id: 'st1', value: '50,000+', label: 'clientes activos',      icon: '🧑‍🤝‍🧑', color: '#4ade80' },
              { id: 'st2', value: '8,500',   label: 'productos disponibles', icon: '📦',       color: '#86efac' },
              { id: 'st3', value: '98%',     label: 'entregas a tiempo',     icon: '⚡',       color: '#bbf7d0' },
              { id: 'st4', value: '4.9★',    label: 'calificación promedio', icon: '⭐',       color: '#fde047' },
            ],
          },
        },

        // ── 7. Gallery ────────────────────────────────────────────────────
        {
          id: 'b-gallery', type: 'gallery', order: 6,
          content: {
            layout:      'feature-left',
            gap:         'sm',
            rounded:     'md',
            aspectRatio: 'auto',
            hoverEffect: 'zoom',
            backgroundColor: '#f8f9fa',
            maxWidth:    '6xl',
            images: [
              {
                id: 'g1',
                url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80',
                alt: 'Sección de frutas y verduras frescas',
                ctaText: 'Ver Frutas y Verduras',
                ctaUrl:  '/p/mercado-frutas',
              },
              {
                id: 'g2',
                url: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&q=80',
                alt: 'Productos orgánicos',
              },
              {
                id: 'g3',
                url: 'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=600&q=80',
                alt: 'Variedad de verduras',
              },
              {
                id: 'g4',
                url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
                alt: 'Carnes frescas',
              },
              {
                id: 'g5',
                url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&q=80',
                alt: 'Lácteos y derivados',
              },
            ],
          },
        },

        // ── 8. Store — Catálogo ───────────────────────────────────────────
        {
          id: 'b-store', type: 'store', order: 7,
          content: {
            title:           'Nuestros Productos',
            subtitle:        'Frescos, a buen precio y listos para entregarte hoy',
            buttonText:      '🛒 Agregar',
            columns:         4,
            currency:        'mxn',
            showSearch:      true,
            showCategories:  true,
            filterStyle:     'tabs',
            layout:          'grid',
            showSort:        true,
            showPriceFilter: false,
            showProductCount: true,
          },
        },

        // ── 9. Testimonials ──────────────────────────────────────────────
        {
          id: 'b-testimonials', type: 'testimonials', order: 8,
          content: {
            title:   'Lo que dicen nuestros clientes',
            layout:  'grid',
            columns: 3,
            items: [
              {
                name:   'Gabriela Moreno',
                role:   'Cliente frecuente · CDMX',
                text:   'Llevo 8 meses usando FreshCart y ya no puedo imaginar mi semana sin él. Las frutas siempre llegan frescas y el delivery es increíblemente puntual. 100% recomendado.',
                rating: 5,
                avatar: 'https://i.pravatar.cc/150?img=47',
              },
              {
                name:   'Carlos Vega',
                role:   'Padre de familia · Guadalajara',
                text:   'La app es súper fácil. En 3 minutos tengo mi carrito lleno y en 45 minutos ya me llega todo. Los precios son los mismos del súper físico, sin markups. Excelente servicio.',
                rating: 5,
                avatar: 'https://i.pravatar.cc/150?img=12',
              },
              {
                name:   'Sofía Ramírez',
                role:   'Chef · Monterrey',
                text:   'Como cocinera necesito ingredientes frescos y de calidad. FreshCart me sorprendió con la variedad orgánica que ofrece. La sección de pescados y carnes es de primer nivel.',
                rating: 5,
                avatar: 'https://i.pravatar.cc/150?img=32',
              },
            ],
          },
        },

        // ── 10. Payment — Membresía FreshCart+ ───────────────────────────
        {
          id: 'b-payment', type: 'payment', order: 9,
          content: {
            title:       '🌟 FreshCart+ — Membresía sin costo de entrega',
            description: 'Envíos ilimitados gratis, descuentos exclusivos en más de 500 productos, acceso prioritario a ofertas relámpago y soporte 24/7. Por sólo $99 al mes.',
            price:       9900,
            currency:    'mxn',
            provider:    'stripe',
            buttonText:  'Suscribirme ahora — $99/mes',
          },
        },

        // ── 11. FAQ ───────────────────────────────────────────────────────
        {
          id: 'b-faq', type: 'faq', order: 10,
          content: {
            title:         'Preguntas frecuentes',
            subtitle:      'Todo lo que necesitas saber antes de tu primera compra',
            allowMultiple: false,
            items: [
              {
                id: 'fq1',
                question: '¿Cuánto tarda la entrega?',
                answer:   'Nuestro servicio estándar entrega en 60–90 minutos dentro de las zonas de cobertura. También ofrecemos entrega programada para el mismo día o días posteriores, con rangos de 2 horas de tu preferencia.',
                color:    '#16a34a',
              },
              {
                id: 'fq2',
                question: '¿Cuál es el pedido mínimo?',
                answer:   'El pedido mínimo es de $200 MXN. Los envíos son gratuitos en pedidos mayores a $500. Con la membresía FreshCart+ los envíos son siempre gratuitos sin mínimo de compra.',
                color:    '#2563eb',
              },
              {
                id: 'fq3',
                question: '¿Qué hago si un producto llega dañado o incorrecto?',
                answer:   'Garantizamos la calidad de todos nuestros productos. Si recibes algo que no cumple tus expectativas, contáctanos por WhatsApp en los siguientes 60 minutos y te enviamos un reemplazo o te hacemos el reembolso inmediato.',
                color:    '#d97706',
              },
              {
                id: 'fq4',
                question: '¿Qué métodos de pago aceptan?',
                answer:   'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, AmEx), transferencias SPEI y pago con saldo de la app. Todos los pagos son procesados de forma segura con encriptación de 256 bits.',
                color:    '#7c3aed',
              },
              {
                id: 'fq5',
                question: '¿Puedo modificar o cancelar mi pedido?',
                answer:   'Puedes modificar o cancelar tu pedido dentro de los primeros 10 minutos después de realizarlo, siempre que el shopper aún no haya iniciado la recolección. Escríbenos por chat o WhatsApp.',
                color:    '#db2777',
              },
            ],
          },
        },

        // ── 12. Contact ───────────────────────────────────────────────────
        {
          id: 'b-contact', type: 'contact', order: 11,
          content: {
            title:      '¿Tienes dudas? Estamos aquí',
            whatsapp:   '5215512345678',
            email:      'hola@freshcart.mx',
            buttonText: 'Escribir por WhatsApp',
          },
        },

        // ── 13. Floating Buttons ─────────────────────────────────────────
        {
          id: 'b-float', type: 'floating-buttons', order: 12,
          content: {
            buttons: [
              { id: 'fb1', type: 'whatsapp', label: 'Pedidos por WhatsApp', url: 'https://wa.me/5215512345678?text=Hola%2C%20quiero%20hacer%20un%20pedido', color: '#25D366', visible: true },
              { id: 'fb2', type: 'phone',    label: 'Llamar al soporte',    url: 'tel:+5215512345678', color: '#2563eb', visible: true },
            ],
            position:   'bottom-right',
            showLabels: true,
            size:       'md',
          },
        },

        // ── 14. Footer ────────────────────────────────────────────────────
        {
          id: 'b-footer', type: 'footer', order: 13,
          content: {
            brandName: 'FreshCart',
            tagline:   'Tu supermercado online. Fresco, rápido y al mejor precio.',
            columns: [
              {
                title: 'Mercados',
                links: [
                  { label: '🍎 Frutas y Verduras', url: '/p/mercado-frutas' },
                  { label: '🥩 Carnes y Aves',     url: '/p/mercado-carnes' },
                  { label: '🥛 Lácteos',           url: '/p/mercado-lacteos' },
                  { label: '🍞 Panadería',         url: '/p/mercado-panaderia' },
                  { label: '🧃 Bebidas',           url: '/p/mercado-bebidas' },
                ],
              },
              {
                title: 'Ayuda',
                links: [
                  { label: 'Centro de ayuda',   url: '#' },
                  { label: 'Seguir mi pedido',  url: '#' },
                  { label: 'Devoluciones',      url: '#' },
                  { label: 'Zonas de entrega',  url: '#' },
                ],
              },
              {
                title: 'Legal',
                links: [
                  { label: 'Términos de uso',      url: '#' },
                  { label: 'Privacidad',           url: '#' },
                  { label: 'Cookies',              url: '#' },
                ],
              },
            ],
            instagram:      'freshcart.mx',
            facebook:       'freshcartmx',
            tiktok:         'freshcart.mx',
            twitter:        'freshcartmx',
            linkedin:       '',
            youtube:        '',
            whatsappFooter: '5215512345678',
            email:          'hola@freshcart.mx',
            phone:          '+52 55 1234 5678',
            address:        'Av. Insurgentes Sur 1234, CDMX, México',
            copyright:      `© ${new Date().getFullYear()} FreshCart. Todos los derechos reservados.`,
          },
        },

      ]),
    },
  })

  console.log('✅ Landing "FreshCart" creada: /p/freshcart-demo')

  // ─── Productos demo para FreshCart ────────────────────────────────────────
  const products = [
    // Frutas y Verduras
    { name: 'Manzanas Gala Orgánicas 1kg',   description: 'Manzanas frescas, crujientes y dulces. Cultivadas sin pesticidas.', imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80', price: 4900,  category: 'Frutas y Verduras', badge: 'Orgánico',  stock: 50 },
    { name: 'Aguacate Hass Maduro ×3',        description: 'Aguacates en punto perfecto de maduración, listos para consumir.',  imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80', price: 5900,  category: 'Frutas y Verduras', badge: 'Popular',   stock: 30 },
    { name: 'Fresas Frescas 500g',            description: 'Fresas de temporada, jugosas y dulces. Perfectas para smoothies.', imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80', price: 3900,  category: 'Frutas y Verduras', badge: null,         stock: 25 },
    { name: 'Brócoli Fresco ×2 pzas',         description: 'Brócoli verde, firme y fresco. Rico en vitaminas y fibra.',        imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80', price: 2900,  category: 'Frutas y Verduras', badge: null,         stock: 40 },
    { name: 'Espinaca Baby Orgánica 200g',    description: 'Hojas tiernas y limpias, listas para ensalada o smoothies.',       imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', price: 3500,  category: 'Frutas y Verduras', badge: 'Orgánico',  stock: 20 },
    { name: 'Limones Persa 1kg',              description: 'Limones jugosos y aromáticos. Esenciales en toda cocina mexicana.', imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&q=80', price: 2500,  category: 'Frutas y Verduras', badge: null,         stock: 60 },

    // Carnes y Aves
    { name: 'Pechuga de Pollo sin hueso 1kg', description: 'Pechuga fresca de pollo sin piel. Ideal para parrilla o horno.',   imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80', price: 11900, category: 'Carnes y Aves',    badge: 'Nuevo',      stock: 20 },
    { name: 'Filete de Res Premium 500g',     description: 'Corte premium refrigerado, madurado 21 días para mayor sabor.',    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80', price: 22900, category: 'Carnes y Aves',    badge: 'Premium',    stock: 15 },
    { name: 'Salmón Atlántico 400g',          description: 'Salmón fresco importado, alto en Omega-3. Llegó hoy.',             imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', price: 18900, category: 'Carnes y Aves',    badge: 'Fresco hoy', stock: 10 },

    // Lácteos
    { name: 'Leche Entera Lala 1L ×6',        description: 'Leche entera pasteurizada. Pack económico para toda la semana.',   imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80', price: 8900,  category: 'Lácteos',          badge: 'Oferta',     stock: 45, comparePrice: 11400 },
    { name: 'Yogurt Griego Natural 1kg',       description: 'Yogurt espeso, cremoso y alto en proteína. Sin azúcar añadida.',  imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80', price: 7900,  category: 'Lácteos',          badge: 'Popular',    stock: 30 },
    { name: 'Queso Manchego Rebanado 400g',    description: 'Queso manchego suave, perfecto para sándwiches y quesadillas.',   imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&q=80', price: 9500,  category: 'Lácteos',          badge: null,         stock: 25 },

    // Panadería
    { name: 'Pan Artesanal de Masa Madre',     description: 'Pan horneado al momento, corteza crujiente y miga esponjosa.',    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', price: 6500,  category: 'Panadería',        badge: 'Hoy',        stock: 15 },
    { name: 'Croissants de Mantequilla ×4',   description: 'Croissants franceses hojaldrados, recién horneados cada mañana.',  imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', price: 7900,  category: 'Panadería',        badge: 'Popular',    stock: 20 },

    // Bebidas
    { name: 'Agua Mineral Bonafont 1.5L ×6', description: 'Agua mineral natural con gas. Ligera y refrescante.',               imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80', price: 6900,  category: 'Bebidas',          badge: 'Oferta',     stock: 50, comparePrice: 8900 },
    { name: 'Café Colombiano Molido 500g',    description: 'Tostado medio, notas a chocolate y caramelo. 100% arábica.',       imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80', price: 18900, category: 'Bebidas',          badge: 'Premium',    stock: 20 },
    { name: 'Jugo de Naranja Natural 1L',     description: 'Exprimido al momento. Sin conservadores ni azúcar añadida.',       imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80', price: 4900,  category: 'Bebidas',          badge: 'Fresco hoy', stock: 18 },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: `demo-${p.name.slice(0, 20).replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id:           `demo-${p.name.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`,
        landingId:    landing.id,
        name:         p.name,
        description:  p.description,
        imageUrl:     p.imageUrl,
        price:        p.price,
        comparePrice: p.comparePrice ?? null,
        stock:        p.stock,
        category:     p.category,
        badge:        p.badge ?? null,
        active:       true,
      },
    })
  }

  console.log(`✅ ${products.length} productos creados para FreshCart`)

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── MERCADOS DE CATEGORÍA ─────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Bloque de navegación compartido para mercados ─────────────────────────
  const marketNavbar = (active: string) => ({
    id: 'b-navbar', type: 'navbar', order: 0,
    content: {
      brandName:       'FreshCart',
      brandLogo:       '',
      sticky:          true,
      transparent:     false,
      textColor:       'dark',
      backgroundColor: '#ffffff',
      dropdownStyle:   'floating',
      showSearch:      false,
      ctaText:         '← Volver al súper',
      ctaUrl:          '/p/freshcart-demo',
      items: [
        { id: 'mn1', label: '🍎 Frutas',    url: '/p/mercado-frutas',     hasDropdown: false, dropdown: [], active: active === 'frutas' },
        { id: 'mn2', label: '🥩 Carnes',    url: '/p/mercado-carnes',     hasDropdown: false, dropdown: [], active: active === 'carnes' },
        { id: 'mn3', label: '🥛 Lácteos',   url: '/p/mercado-lacteos',    hasDropdown: false, dropdown: [], active: active === 'lacteos' },
        { id: 'mn4', label: '🍞 Panadería', url: '/p/mercado-panaderia',  hasDropdown: false, dropdown: [], active: active === 'panaderia' },
        { id: 'mn5', label: '🧃 Bebidas',   url: '/p/mercado-bebidas',    hasDropdown: false, dropdown: [], active: active === 'bebidas' },
      ],
    },
  })

  const marketFloating = {
    id: 'b-float', type: 'floating-buttons', order: 98,
    content: {
      buttons: [
        { id: 'fb1', type: 'whatsapp', label: 'Pedir por WhatsApp', url: 'https://wa.me/5215512345678?text=Hola%2C%20quiero%20hacer%20un%20pedido', color: '#25D366', visible: true },
      ],
      position:   'bottom-right',
      showLabels: true,
      size:       'md',
    },
  }

  const marketFooter = {
    id: 'b-footer', type: 'footer', order: 99,
    content: {
      brandName: 'FreshCart',
      tagline:   'Tu supermercado online. Fresco, rápido y al mejor precio.',
      columns: [
        {
          title: 'Mercados',
          links: [
            { label: '🍎 Frutas y Verduras', url: '/p/mercado-frutas' },
            { label: '🥩 Carnes y Aves',     url: '/p/mercado-carnes' },
            { label: '🥛 Lácteos',           url: '/p/mercado-lacteos' },
            { label: '🍞 Panadería',         url: '/p/mercado-panaderia' },
            { label: '🧃 Bebidas',           url: '/p/mercado-bebidas' },
          ],
        },
        {
          title: 'FreshCart',
          links: [
            { label: '🏠 Inicio',           url: '/p/freshcart-demo' },
            { label: '🛒 Ver todo',          url: '/p/freshcart-demo' },
            { label: '📞 Contacto',          url: '/p/freshcart-demo#contacto' },
          ],
        },
      ],
      whatsappFooter: '5215512345678',
      email:          'hola@freshcart.mx',
      copyright:      `© ${new Date().getFullYear()} FreshCart. Todos los derechos reservados.`,
    },
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MERCADO 1 — Frutas y Verduras
  // ══════════════════════════════════════════════════════════════════════════
  const landingFrutas = await prisma.landingPage.upsert({
    where:  { slug: 'mercado-frutas' },
    update: {},
    create: {
      userId:      user.id,
      title:       'Mercado Frutas y Verduras — FreshCart',
      slug:        'mercado-frutas',
      description: 'Las frutas y verduras más frescas, directo al domicilio en menos de 1 hora.',
      published:   true,
      blocks: JSON.stringify([
        marketNavbar('frutas'),

        // Banner
        {
          id: 'b-banner', type: 'store-banner', order: 1,
          content: {
            storeName:         '🍎 Frutas y Verduras',
            tagline:           'Del campo a tu mesa. Frescas, orgánicas y al mejor precio.',
            ctaText:           'Ver productos',
            ctaTarget:         '#productos',
            backgroundColor:   '#16a34a',
            textColor:         'light',
            backgroundImage:   'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80',
            backgroundPosition: 'center',
            overlayColor:      '#052e19',
            overlayOpacity:    50,
            cartButton:        'banner',
            announcement:      '🌿 Productos orgánicos certificados  ·  🚚 Entrega en 60 min  ·  ✅ Frescura garantizada o te devolvemos tu dinero',
            navItems: [],
            navAlign: 'center',
          },
        },

        // Icons categorías internas
        {
          id: 'b-icons-frutas', type: 'icons-ticker', order: 2,
          content: {
            title: 'Lo que encontrarás hoy',
            items: [
              { id: 'f1', icon: '🍎', iconType: 'emoji', label: 'Manzanas',   url: '' },
              { id: 'f2', icon: '🥑', iconType: 'emoji', label: 'Aguacates',  url: '' },
              { id: 'f3', icon: '🍓', iconType: 'emoji', label: 'Fresas',     url: '' },
              { id: 'f4', icon: '🥦', iconType: 'emoji', label: 'Brócoli',    url: '' },
              { id: 'f5', icon: '🌿', iconType: 'emoji', label: 'Espinacas',  url: '' },
              { id: 'f6', icon: '🍋', iconType: 'emoji', label: 'Limones',    url: '' },
              { id: 'f7', icon: '🍅', iconType: 'emoji', label: 'Tomates',    url: '' },
              { id: 'f8', icon: '🥕', iconType: 'emoji', label: 'Zanahorias', url: '' },
            ],
            displayMode:     'row',
            backgroundColor: '#f0fdf4',
            cardBg:          '#dcfce7',
            textColor:       '#14532d',
            accentColor:     '#16a34a',
            pauseOnHover:    true,
            iconSize:        'sm',
            showLabels:      true,
            rounded:         'md',
            gap:             'sm',
          },
        },

        // Tienda
        {
          id: 'b-store', type: 'store', order: 3,
          content: {
            title:           'Frutas y Verduras Frescas',
            subtitle:        'Selección del día · Cosechadas esta semana',
            buttonText:      '🛒 Agregar',
            columns:         3,
            currency:        'mxn',
            showSearch:      true,
            showCategories:  false,
            layout:          'grid',
            showSort:        true,
            showPriceFilter: false,
            showProductCount: true,
          },
        },

        // Stats frescos
        {
          id: 'b-stats', type: 'stats', order: 4,
          content: {
            title:    'Calidad que se nota',
            layout:   'grid-4',
            cardStyle: 'colored',
            backgroundColor: '#052e19',
            textColor:       '#ffffff',
            accentColor:     '#4ade80',
            animate:  true,
            items: [
              { id: 'sf1', value: '100%', label: 'productos frescos',     icon: '🌿', color: '#4ade80' },
              { id: 'sf2', value: '6',    label: 'variedades de frutas',  icon: '🍎', color: '#86efac' },
              { id: 'sf3', value: '60min',label: 'tiempo de entrega',     icon: '⚡', color: '#bbf7d0' },
              { id: 'sf4', value: '2',    label: 'opciones orgánicas',    icon: '🌱', color: '#fde047' },
            ],
          },
        },

        marketFloating,
        marketFooter,
      ]),
    },
  })
  console.log('✅ Mercado Frutas: /p/mercado-frutas')

  // Productos para Mercado Frutas (mismo landing, reutilizando los de FreshCart)
  const productosFrutas = [
    { name: 'Manzanas Gala Orgánicas 1kg',   description: 'Manzanas frescas, crujientes y dulces. Cultivadas sin pesticidas.', imageUrl: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&q=80', price: 4900,  category: 'Frutas y Verduras', badge: 'Orgánico', stock: 50 },
    { name: 'Aguacate Hass Maduro ×3',        description: 'Aguacates en punto perfecto de maduración, listos para consumir.',  imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=80', price: 5900,  category: 'Frutas y Verduras', badge: 'Popular',  stock: 30 },
    { name: 'Fresas Frescas 500g',            description: 'Fresas de temporada, jugosas y dulces. Perfectas para smoothies.', imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&q=80', price: 3900,  category: 'Frutas y Verduras', badge: null,       stock: 25 },
    { name: 'Brócoli Fresco ×2 pzas',         description: 'Brócoli verde, firme y fresco. Rico en vitaminas y fibra.',        imageUrl: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&q=80', price: 2900,  category: 'Frutas y Verduras', badge: null,       stock: 40 },
    { name: 'Espinaca Baby Orgánica 200g',    description: 'Hojas tiernas y limpias, listas para ensalada o smoothies.',       imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80', price: 3500,  category: 'Frutas y Verduras', badge: 'Orgánico', stock: 20 },
    { name: 'Limones Persa 1kg',              description: 'Limones jugosos y aromáticos. Esenciales en toda cocina mexicana.', imageUrl: 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=400&q=80', price: 2500,  category: 'Frutas y Verduras', badge: null,       stock: 60 },
  ]
  for (const p of productosFrutas) {
    await prisma.product.upsert({
      where: { id: `mkt-f-${p.name.slice(0, 18).replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `mkt-f-${p.name.slice(0, 18).replace(/\s/g, '-').toLowerCase()}`,
        landingId: landingFrutas.id,
        name: p.name, description: p.description, imageUrl: p.imageUrl,
        price: p.price, stock: p.stock, category: p.category, badge: p.badge ?? null, active: true,
      },
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MERCADO 2 — Carnes y Aves
  // ══════════════════════════════════════════════════════════════════════════
  const landingCarnes = await prisma.landingPage.upsert({
    where:  { slug: 'mercado-carnes' },
    update: {},
    create: {
      userId:      user.id,
      title:       'Mercado Carnes y Aves — FreshCart',
      slug:        'mercado-carnes',
      description: 'Cortes premium, pollo fresco y mariscos selectos. Refrigerados y entregados en tu puerta.',
      published:   true,
      blocks: JSON.stringify([
        marketNavbar('carnes'),

        // Banner
        {
          id: 'b-banner', type: 'store-banner', order: 1,
          content: {
            storeName:         '🥩 Carnes y Aves',
            tagline:           'Cortes premium, madurados y frescos. Calidad de carnicería, comodidad de tu casa.',
            ctaText:           'Ver productos',
            ctaTarget:         '#productos',
            backgroundColor:   '#991b1b',
            textColor:         'light',
            backgroundImage:   'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=1600&q=80',
            backgroundPosition: 'center',
            overlayColor:      '#450a0a',
            overlayOpacity:    55,
            cartButton:        'banner',
            announcement:      '🥩 Cortes madurados 21 días  ·  🐟 Pescado fresco de hoy  ·  🚚 Entrega refrigerada en 60 min',
            navItems: [],
            navAlign: 'center',
          },
        },

        // Icons
        {
          id: 'b-icons-carnes', type: 'icons-ticker', order: 2,
          content: {
            title: 'Nuestros cortes del día',
            items: [
              { id: 'c1', icon: '🍗', iconType: 'emoji', label: 'Pollo',     url: '' },
              { id: 'c2', icon: '🥩', iconType: 'emoji', label: 'Res',       url: '' },
              { id: 'c3', icon: '🐟', iconType: 'emoji', label: 'Salmón',    url: '' },
              { id: 'c4', icon: '🌭', iconType: 'emoji', label: 'Embutidos', url: '' },
              { id: 'c5', icon: '🦐', iconType: 'emoji', label: 'Mariscos',  url: '' },
              { id: 'c6', icon: '🔥', iconType: 'emoji', label: 'Parrilla',  url: '' },
            ],
            displayMode:     'row',
            backgroundColor: '#fff1f2',
            cardBg:          '#ffe4e6',
            textColor:       '#881337',
            accentColor:     '#dc2626',
            pauseOnHover:    true,
            iconSize:        'sm',
            showLabels:      true,
            rounded:         'md',
            gap:             'sm',
          },
        },

        // Tienda
        {
          id: 'b-store', type: 'store', order: 3,
          content: {
            title:           'Carnes y Aves Frescas',
            subtitle:        'Calidad premium · Refrigerado hasta tu puerta',
            buttonText:      '🛒 Agregar',
            columns:         3,
            currency:        'mxn',
            showSearch:      true,
            showCategories:  false,
            layout:          'grid',
            showSort:        true,
            showPriceFilter: false,
            showProductCount: true,
          },
        },

        // Stats
        {
          id: 'b-stats', type: 'stats', order: 4,
          content: {
            title:    'Calidad garantizada',
            layout:   'grid-4',
            cardStyle: 'colored',
            backgroundColor: '#450a0a',
            textColor:       '#ffffff',
            accentColor:     '#fca5a5',
            animate:  true,
            items: [
              { id: 'sc1', value: '21',    label: 'días de maduración',    icon: '🥩', color: '#fca5a5' },
              { id: 'sc2', value: '3',     label: 'cortes disponibles',    icon: '🔪', color: '#fda4af' },
              { id: 'sc3', value: '4°C',   label: 'cadena de frío',        icon: '❄️', color: '#e0f2fe' },
              { id: 'sc4', value: '100%',  label: 'frescura certificada',  icon: '✅', color: '#bbf7d0' },
            ],
          },
        },

        marketFloating,
        marketFooter,
      ]),
    },
  })
  console.log('✅ Mercado Carnes: /p/mercado-carnes')

  const productosCarnes = [
    { name: 'Pechuga de Pollo sin hueso 1kg', description: 'Pechuga fresca de pollo sin piel. Ideal para parrilla o horno.',   imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&q=80', price: 11900, category: 'Carnes y Aves', badge: 'Nuevo',      stock: 20 },
    { name: 'Filete de Res Premium 500g',     description: 'Corte premium refrigerado, madurado 21 días para mayor sabor.',    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80', price: 22900, category: 'Carnes y Aves', badge: 'Premium',    stock: 15 },
    { name: 'Salmón Atlántico 400g',          description: 'Salmón fresco importado, alto en Omega-3. Llegó hoy.',             imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80', price: 18900, category: 'Carnes y Aves', badge: 'Fresco hoy', stock: 10 },
  ]
  for (const p of productosCarnes) {
    await prisma.product.upsert({
      where: { id: `mkt-c-${p.name.slice(0, 18).replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `mkt-c-${p.name.slice(0, 18).replace(/\s/g, '-').toLowerCase()}`,
        landingId: landingCarnes.id,
        name: p.name, description: p.description, imageUrl: p.imageUrl,
        price: p.price, stock: p.stock, category: p.category, badge: p.badge ?? null, active: true,
      },
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MERCADO 3 — Lácteos
  // ══════════════════════════════════════════════════════════════════════════
  const landingLacteos = await prisma.landingPage.upsert({
    where:  { slug: 'mercado-lacteos' },
    update: {},
    create: {
      userId:      user.id,
      title:       'Mercado Lácteos — FreshCart',
      slug:        'mercado-lacteos',
      description: 'Leche, quesos, yogurt y más. Los mejores lácteos, fríos y frescos en tu puerta.',
      published:   true,
      blocks: JSON.stringify([
        marketNavbar('lacteos'),

        // Banner
        {
          id: 'b-banner', type: 'store-banner', order: 1,
          content: {
            storeName:         '🥛 Lácteos',
            tagline:           'Leche, quesos y yogurt. Frescos, nutritivos y al mejor precio.',
            ctaText:           'Ver productos',
            ctaTarget:         '#productos',
            backgroundColor:   '#1d4ed8',
            textColor:         'light',
            backgroundImage:   'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=1600&q=80',
            backgroundPosition: 'center',
            overlayColor:      '#1e3a5f',
            overlayOpacity:    50,
            cartButton:        'banner',
            announcement:      '🥛 Leche pasteurizada garantizada  ·  🧀 Quesos artesanales  ·  🥄 Yogurt sin azúcar añadida',
            navItems: [],
            navAlign: 'center',
          },
        },

        // Icons
        {
          id: 'b-icons-lacteos', type: 'icons-ticker', order: 2,
          content: {
            title: 'Categorías de lácteos',
            items: [
              { id: 'l1', icon: '🥛', iconType: 'emoji', label: 'Leche',    url: '' },
              { id: 'l2', icon: '🧀', iconType: 'emoji', label: 'Quesos',   url: '' },
              { id: 'l3', icon: '🥄', iconType: 'emoji', label: 'Yogurt',   url: '' },
              { id: 'l4', icon: '🧈', iconType: 'emoji', label: 'Mantequilla', url: '' },
              { id: 'l5', icon: '🍦', iconType: 'emoji', label: 'Crema',    url: '' },
              { id: 'l6', icon: '🥚', iconType: 'emoji', label: 'Huevos',   url: '' },
            ],
            displayMode:     'row',
            backgroundColor: '#eff6ff',
            cardBg:          '#dbeafe',
            textColor:       '#1e3a8a',
            accentColor:     '#2563eb',
            pauseOnHover:    true,
            iconSize:        'sm',
            showLabels:      true,
            rounded:         'md',
            gap:             'sm',
          },
        },

        // Tienda
        {
          id: 'b-store', type: 'store', order: 3,
          content: {
            title:           'Lácteos Frescos',
            subtitle:        'Fríos y en perfectas condiciones · Entrega refrigerada',
            buttonText:      '🛒 Agregar',
            columns:         3,
            currency:        'mxn',
            showSearch:      true,
            showCategories:  false,
            layout:          'grid',
            showSort:        true,
            showPriceFilter: false,
            showProductCount: true,
          },
        },

        // Stats
        {
          id: 'b-stats', type: 'stats', order: 4,
          content: {
            title:    'Nutrición que cuida a tu familia',
            layout:   'grid-4',
            cardStyle: 'colored',
            backgroundColor: '#1e3a5f',
            textColor:       '#ffffff',
            accentColor:     '#93c5fd',
            animate:  true,
            items: [
              { id: 'sl1', value: '3',     label: 'productos disponibles',  icon: '🥛', color: '#93c5fd' },
              { id: 'sl2', value: '4°C',   label: 'cadena de frío',         icon: '❄️', color: '#e0f2fe' },
              { id: 'sl3', value: '0g',    label: 'azúcar añadida (yogurt)',icon: '🥄', color: '#bbf7d0' },
              { id: 'sl4', value: '100%',  label: 'pasteurizado',           icon: '✅', color: '#fde047' },
            ],
          },
        },

        marketFloating,
        marketFooter,
      ]),
    },
  })
  console.log('✅ Mercado Lácteos: /p/mercado-lacteos')

  const productosLacteos = [
    { name: 'Leche Entera Lala 1L ×6',     description: 'Leche entera pasteurizada. Pack económico para toda la semana.',   imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80', price: 8900, comparePrice: 11400, category: 'Lácteos', badge: 'Oferta',   stock: 45 },
    { name: 'Yogurt Griego Natural 1kg',    description: 'Yogurt espeso, cremoso y alto en proteína. Sin azúcar añadida.',  imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80', price: 7900, category: 'Lácteos', badge: 'Popular',  stock: 30 },
    { name: 'Queso Manchego Rebanado 400g', description: 'Queso manchego suave, perfecto para sándwiches y quesadillas.',   imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400&q=80', price: 9500, category: 'Lácteos', badge: null,       stock: 25 },
  ]
  for (const p of productosLacteos) {
    await prisma.product.upsert({
      where: { id: `mkt-l-${p.name.slice(0, 18).replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `mkt-l-${p.name.slice(0, 18).replace(/\s/g, '-').toLowerCase()}`,
        landingId: landingLacteos.id,
        name: p.name, description: p.description, imageUrl: p.imageUrl,
        price: p.price, comparePrice: (p as { comparePrice?: number }).comparePrice ?? null,
        stock: p.stock, category: p.category, badge: p.badge ?? null, active: true,
      },
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MERCADO 4 — Panadería
  // ══════════════════════════════════════════════════════════════════════════
  const landingPanaderia = await prisma.landingPage.upsert({
    where:  { slug: 'mercado-panaderia' },
    update: {},
    create: {
      userId:      user.id,
      title:       'Mercado Panadería — FreshCart',
      slug:        'mercado-panaderia',
      description: 'Pan artesanal, croissants y más. Horneados cada mañana y entregados frescos.',
      published:   true,
      blocks: JSON.stringify([
        marketNavbar('panaderia'),

        // Banner
        {
          id: 'b-banner', type: 'store-banner', order: 1,
          content: {
            storeName:         '🍞 Panadería',
            tagline:           'Horneado esta mañana. En tu mesa antes de mediodía.',
            ctaText:           'Ver productos',
            ctaTarget:         '#productos',
            backgroundColor:   '#b45309',
            textColor:         'light',
            backgroundImage:   'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80',
            backgroundPosition: 'center',
            overlayColor:      '#451a03',
            overlayOpacity:    50,
            cartButton:        'banner',
            announcement:      '🍞 Horneado fresco cada mañana  ·  🥐 Croissants de mantequilla real  ·  🌾 Masa madre artesanal',
            navItems: [],
            navAlign: 'center',
          },
        },

        // Icons
        {
          id: 'b-icons-pan', type: 'icons-ticker', order: 2,
          content: {
            title: 'Nuestras especialidades',
            items: [
              { id: 'p1', icon: '🍞', iconType: 'emoji', label: 'Pan blanco',   url: '' },
              { id: 'p2', icon: '🥐', iconType: 'emoji', label: 'Croissants',   url: '' },
              { id: 'p3', icon: '🥖', iconType: 'emoji', label: 'Baguette',     url: '' },
              { id: 'p4', icon: '🧁', iconType: 'emoji', label: 'Muffins',      url: '' },
              { id: 'p5', icon: '🍩', iconType: 'emoji', label: 'Dona',         url: '' },
              { id: 'p6', icon: '🌾', iconType: 'emoji', label: 'Masa madre',   url: '' },
            ],
            displayMode:     'row',
            backgroundColor: '#fffbeb',
            cardBg:          '#fef3c7',
            textColor:       '#78350f',
            accentColor:     '#d97706',
            pauseOnHover:    true,
            iconSize:        'sm',
            showLabels:      true,
            rounded:         'md',
            gap:             'sm',
          },
        },

        // Tienda
        {
          id: 'b-store', type: 'store', order: 3,
          content: {
            title:           'Panadería Artesanal',
            subtitle:        'Horneado hoy · Entrega en tu puerta antes del mediodía',
            buttonText:      '🛒 Agregar',
            columns:         3,
            currency:        'mxn',
            showSearch:      true,
            showCategories:  false,
            layout:          'grid',
            showSort:        true,
            showPriceFilter: false,
            showProductCount: true,
          },
        },

        // Stats
        {
          id: 'b-stats', type: 'stats', order: 4,
          content: {
            title:    'Tradición panadera',
            layout:   'grid-4',
            cardStyle: 'colored',
            backgroundColor: '#451a03',
            textColor:       '#ffffff',
            accentColor:     '#fcd34d',
            animate:  true,
            items: [
              { id: 'sp1', value: '2',    label: 'especialidades del día',  icon: '🍞', color: '#fcd34d' },
              { id: 'sp2', value: '6am',  label: 'comienza el horneado',    icon: '🌅', color: '#fde68a' },
              { id: 'sp3', value: '0',    label: 'conservadores añadidos',  icon: '🌾', color: '#bbf7d0' },
              { id: 'sp4', value: '100%', label: 'mantequilla real',        icon: '🧈', color: '#fca5a5' },
            ],
          },
        },

        marketFloating,
        marketFooter,
      ]),
    },
  })
  console.log('✅ Mercado Panadería: /p/mercado-panaderia')

  const productosPanaderia = [
    { name: 'Pan Artesanal de Masa Madre',   description: 'Pan horneado al momento, corteza crujiente y miga esponjosa.',   imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', price: 6500, category: 'Panadería', badge: 'Hoy',     stock: 15 },
    { name: 'Croissants de Mantequilla ×4', description: 'Croissants franceses hojaldrados, recién horneados cada mañana.', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', price: 7900, category: 'Panadería', badge: 'Popular', stock: 20 },
  ]
  for (const p of productosPanaderia) {
    await prisma.product.upsert({
      where: { id: `mkt-p-${p.name.slice(0, 18).replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `mkt-p-${p.name.slice(0, 18).replace(/\s/g, '-').toLowerCase()}`,
        landingId: landingPanaderia.id,
        name: p.name, description: p.description, imageUrl: p.imageUrl,
        price: p.price, stock: p.stock, category: p.category, badge: p.badge ?? null, active: true,
      },
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MERCADO 5 — Bebidas
  // ══════════════════════════════════════════════════════════════════════════
  const landingBebidas = await prisma.landingPage.upsert({
    where:  { slug: 'mercado-bebidas' },
    update: {},
    create: {
      userId:      user.id,
      title:       'Mercado Bebidas — FreshCart',
      slug:        'mercado-bebidas',
      description: 'Agua, jugos, café y más. Todo lo que necesitas tomar, frío o caliente, en tu puerta.',
      published:   true,
      blocks: JSON.stringify([
        marketNavbar('bebidas'),

        // Banner
        {
          id: 'b-banner', type: 'store-banner', order: 1,
          content: {
            storeName:         '🧃 Bebidas',
            tagline:           'Agua, jugos y café. Refréscate sin salir de casa.',
            ctaText:           'Ver productos',
            ctaTarget:         '#productos',
            backgroundColor:   '#6d28d9',
            textColor:         'light',
            backgroundImage:   'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=1600&q=80',
            backgroundPosition: 'center',
            overlayColor:      '#2e1065',
            overlayOpacity:    50,
            cartButton:        'banner',
            announcement:      '💧 Agua sin gas y con gas  ·  ☕ Café 100% arábica  ·  🍊 Jugos naturales sin conservadores',
            navItems: [],
            navAlign: 'center',
          },
        },

        // Icons
        {
          id: 'b-icons-bebidas', type: 'icons-ticker', order: 2,
          content: {
            title: 'Tu selección de bebidas',
            items: [
              { id: 'b1', icon: '💧', iconType: 'emoji', label: 'Agua',       url: '' },
              { id: 'b2', icon: '☕', iconType: 'emoji', label: 'Café',       url: '' },
              { id: 'b3', icon: '🍊', iconType: 'emoji', label: 'Jugos',      url: '' },
              { id: 'b4', icon: '🧃', iconType: 'emoji', label: 'Néctares',   url: '' },
              { id: 'b5', icon: '🫖', iconType: 'emoji', label: 'Tés',        url: '' },
              { id: 'b6', icon: '🥤', iconType: 'emoji', label: 'Refrescos',  url: '' },
            ],
            displayMode:     'row',
            backgroundColor: '#f5f3ff',
            cardBg:          '#ede9fe',
            textColor:       '#4c1d95',
            accentColor:     '#7c3aed',
            pauseOnHover:    true,
            iconSize:        'sm',
            showLabels:      true,
            rounded:         'md',
            gap:             'sm',
          },
        },

        // Tienda
        {
          id: 'b-store', type: 'store', order: 3,
          content: {
            title:           'Bebidas para Toda Ocasión',
            subtitle:        'Hidratación, energía y sabor · Entrega en 60 min',
            buttonText:      '🛒 Agregar',
            columns:         3,
            currency:        'mxn',
            showSearch:      true,
            showCategories:  false,
            layout:          'grid',
            showSort:        true,
            showPriceFilter: false,
            showProductCount: true,
          },
        },

        // Stats
        {
          id: 'b-stats', type: 'stats', order: 4,
          content: {
            title:    'Hidratación garantizada',
            layout:   'grid-4',
            cardStyle: 'colored',
            backgroundColor: '#2e1065',
            textColor:       '#ffffff',
            accentColor:     '#c4b5fd',
            animate:  true,
            items: [
              { id: 'sb1', value: '3',    label: 'bebidas disponibles',    icon: '🧃', color: '#c4b5fd' },
              { id: 'sb2', value: '0',    label: 'conservadores (jugos)',  icon: '🍊', color: '#bbf7d0' },
              { id: 'sb3', value: '100%', label: 'arábica (café)',         icon: '☕', color: '#fde68a' },
              { id: 'sb4', value: '4°C',  label: 'bebidas frías',         icon: '❄️', color: '#e0f2fe' },
            ],
          },
        },

        marketFloating,
        marketFooter,
      ]),
    },
  })
  console.log('✅ Mercado Bebidas: /p/mercado-bebidas')

  const productosBebidas = [
    { name: 'Agua Mineral Bonafont 1.5L ×6', description: 'Agua mineral natural con gas. Ligera y refrescante.',         imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80', price: 6900, comparePrice: 8900, category: 'Bebidas', badge: 'Oferta',     stock: 50 },
    { name: 'Café Colombiano Molido 500g',    description: 'Tostado medio, notas a chocolate y caramelo. 100% arábica.', imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80', price: 18900, category: 'Bebidas', badge: 'Premium',    stock: 20 },
    { name: 'Jugo de Naranja Natural 1L',     description: 'Exprimido al momento. Sin conservadores ni azúcar añadida.', imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80', price: 4900, category: 'Bebidas', badge: 'Fresco hoy', stock: 18 },
  ]
  for (const p of productosBebidas) {
    await prisma.product.upsert({
      where: { id: `mkt-b-${p.name.slice(0, 18).replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `mkt-b-${p.name.slice(0, 18).replace(/\s/g, '-').toLowerCase()}`,
        landingId: landingBebidas.id,
        name: p.name, description: p.description, imageUrl: p.imageUrl,
        price: p.price, comparePrice: (p as { comparePrice?: number }).comparePrice ?? null,
        stock: p.stock, category: p.category, badge: p.badge ?? null, active: true,
      },
    })
  }

  // ─── Resumen final ────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────────')
  console.log('🚀 Demo listo para presentar al cliente:')
  console.log('')
  console.log('   🏪 Tienda principal:   /p/freshcart-demo')
  console.log('   🍎 Mercado Frutas:     /p/mercado-frutas')
  console.log('   🥩 Mercado Carnes:     /p/mercado-carnes')
  console.log('   🥛 Mercado Lácteos:    /p/mercado-lacteos')
  console.log('   🍞 Mercado Panadería:  /p/mercado-panaderia')
  console.log('   🧃 Mercado Bebidas:    /p/mercado-bebidas')
  console.log('')
  console.log('   Login: demo@tunegocio.com / password123')
  console.log('─────────────────────────────────────────────────────────\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
