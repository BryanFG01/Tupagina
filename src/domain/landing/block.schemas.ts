import { z } from 'zod'

// ─── Schema de estilo de bloque ───────────────────────────────────────────────

export const blockStyleSchema = z.object({
  backgroundColor: z.string(),
  textColor:       z.string(),
  buttonColor:     z.string(),
  buttonTextColor: z.string(),
  paddingY:        z.enum(['sm', 'md', 'lg', 'xl']),
  fontFamily:      z.enum(['inter', 'playfair', 'grotesk', 'nunito']),
  animation:       z.enum(['none', 'fade-up', 'fade-in', 'zoom-in', 'slide-left', 'slide-right']),
}).optional()

// ─── Schemas por tipo de bloque ───────────────────────────────────────────────

export const heroContentSchema = z.object({
  title:              z.string().min(1, 'El título es requerido'),
  subtitle:           z.string().min(1, 'El subtítulo es requerido'),
  ctaText:            z.string().min(1, 'El texto del botón es requerido'),
  ctaUrl:             z.string().min(1, 'El enlace del botón es requerido'),
  backgroundImage:    z.string().url().optional().or(z.literal('')),
  backgroundVideo:    z.string().optional(),
  backgroundPosition: z.string().optional(),
  overlayColor:       z.string().optional(),
  overlayOpacity:     z.number().min(0).max(100).optional(),
})

export const servicesContentSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  items: z.array(z.object({
    title:       z.string().min(1),
    description: z.string().min(1),
    price:       z.string().optional(),
    icon:        z.string().optional(),
  })).min(1, 'Agrega al menos un servicio'),
})

export const testimonialsContentSchema = z.object({
  title:   z.string().min(1, 'El título es requerido'),
  layout:  z.enum(['grid', 'list']).optional(),
  columns: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
  items:   z.array(z.object({
    name:   z.string().min(1),
    text:   z.string().min(1),
    avatar: z.string().optional(),
    role:   z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
  })).min(1, 'Agrega al menos un testimonio'),
})

export const paymentContentSchema = z.object({
  title:       z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  price:       z.number().min(100, 'El precio mínimo es $1.00'),
  currency:    z.enum(['usd', 'ars', 'mxn', 'cop', 'clp']),
  provider:    z.enum(['stripe', 'mercadopago']),
  buttonText:  z.string().min(1, 'El texto del botón es requerido'),
})

export const contactContentSchema = z.object({
  title:      z.string().min(1, 'El título es requerido'),
  whatsapp:   z.string().optional(),
  email:      z.string().email().optional().or(z.literal('')),
  buttonText: z.string().min(1, 'El texto del botón es requerido'),
})

export const storeContentSchema = z.object({
  title:            z.string().min(1, 'El título es requerido'),
  subtitle:         z.string(),
  buttonText:       z.string(),
  columns:          z.union([z.literal(2), z.literal(3), z.literal(4)]),
  currency:         z.enum(['usd', 'ars', 'mxn', 'cop', 'clp']),
  showSearch:       z.boolean(),
  showCategories:   z.boolean(),
  layout:           z.enum(['grid', 'list']),
  // Campos agregados — opcionales para retrocompatibilidad
  filterStyle:      z.enum(['tabs', 'sidebar', 'dropdown']).optional(),
  showSort:         z.boolean().optional(),
  showPriceFilter:  z.boolean().optional(),
  showProductCount: z.boolean().optional(),
})

export const storeBannerContentSchema = z.object({
  storeName:          z.string().min(1),
  tagline:            z.string(),
  ctaText:            z.string().min(1),
  ctaTarget:          z.string(),
  backgroundColor:    z.string(),
  textColor:          z.enum(['light', 'dark']),
  backgroundImage:    z.string().url().optional().or(z.literal('')),
  backgroundVideo:    z.string().optional(),
  backgroundPosition: z.string().optional(),
  overlayColor:       z.string().optional(),
  overlayOpacity:     z.number().min(0).max(100).optional(),
  cartButton:         z.enum(['none', 'banner', 'floating-br', 'floating-bl', 'floating-tr', 'floating-tl']),
  announcement:       z.string().optional(),
  navItems: z.array(z.object({
    id:    z.string(),
    label: z.string(),
    url:   z.string(),
    dropdown: z.array(z.object({
      id:    z.string(),
      label: z.string(),
      url:   z.string(),
    })).optional(),
  })).optional(),
  navAlign: z.enum(['left', 'center', 'right']).optional(),
  slides: z.array(z.object({
    id:       z.string(),
    image:    z.string(),
    position: z.string().optional(),
  })).optional(),
  slideInterval:   z.number().min(1000).max(15000).optional(),
  slideTransition: z.enum(['fade', 'slide']).optional(),
})

export const floatingButtonsContentSchema = z.object({
  buttons: z.array(z.object({
    id:      z.string(),
    type:    z.enum(['whatsapp', 'phone', 'email', 'chat', 'custom']),
    label:   z.string(),
    url:     z.string(),
    color:   z.string(),
    visible: z.boolean(),
  })),
  position:   z.enum(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
  showLabels: z.boolean(),
  size:       z.enum(['sm', 'md', 'lg']),
})

export const footerContentSchema = z.object({
  brandName: z.string(),
  tagline:   z.string(),
  columns:   z.array(z.object({
    title: z.string(),
    links: z.array(z.object({ label: z.string(), url: z.string() })),
  })),
  instagram:      z.string(),
  facebook:       z.string(),
  tiktok:         z.string(),
  twitter:        z.string(),
  linkedin:       z.string(),
  youtube:        z.string(),
  whatsappFooter: z.string(),
  email:          z.string(),
  phone:          z.string(),
  address:        z.string(),
  copyright:      z.string(),
})

export const faqContentSchema = z.object({
  title:         z.string().min(1),
  subtitle:      z.string().optional(),
  allowMultiple: z.boolean().optional(),
  items: z.array(z.object({
    id:       z.string(),
    question: z.string().min(1),
    answer:   z.string().min(1),
    color:    z.string().optional(),
  })),
})

export const navbarContentSchema = z.object({
  brandName:       z.string(),
  brandLogo:       z.string().optional(),
  sticky:          z.boolean(),
  transparent:     z.boolean(),
  textColor:       z.enum(['light', 'dark']),
  backgroundColor: z.string(),
  showSearch:      z.boolean(),
  ctaText:         z.string().optional(),
  ctaUrl:          z.string().optional(),
  items: z.array(z.object({
    id:          z.string(),
    label:       z.string(),
    url:         z.string(),
    hasDropdown: z.boolean(),
    color:       z.string().optional(),
    dropdown:    z.array(z.object({
      id:    z.string(),
      label: z.string(),
      url:   z.string(),
    })),
  })),
  showCart:  z.boolean().optional(),
  cartColor: z.string().optional(),
})

export const spinnerContentSchema = z.object({
  spinnerType:     z.enum(['circle', 'dots', 'pulse', 'bars']),
  customImage:     z.string().url().optional().or(z.literal('')),
  imageSize:       z.number().min(20).max(300),
  imageAnimation:  z.enum(['spin', 'pulse', 'bounce', 'none']),
  backgroundColor: z.string(),
  accentColor:     z.string(),
  text:            z.string().optional(),
  textColor:       z.string(),
  duration:        z.number().min(500).max(10000),
})

// ─── Schema completo de un bloque (con style) ─────────────────────────────────

export const blockSchema = z.discriminatedUnion('type', [
  z.object({ id: z.string(), type: z.literal('hero'),             order: z.number(), content: heroContentSchema,             style: blockStyleSchema }),
  z.object({ id: z.string(), type: z.literal('services'),         order: z.number(), content: servicesContentSchema,         style: blockStyleSchema }),
  z.object({ id: z.string(), type: z.literal('testimonials'),     order: z.number(), content: testimonialsContentSchema,     style: blockStyleSchema }),
  z.object({ id: z.string(), type: z.literal('payment'),          order: z.number(), content: paymentContentSchema,          style: blockStyleSchema }),
  z.object({ id: z.string(), type: z.literal('contact'),          order: z.number(), content: contactContentSchema,          style: blockStyleSchema }),
  z.object({ id: z.string(), type: z.literal('store'),            order: z.number(), content: storeContentSchema,            style: blockStyleSchema }),
  z.object({ id: z.string(), type: z.literal('store-banner'),     order: z.number(), content: storeBannerContentSchema,      style: blockStyleSchema }),
  z.object({ id: z.string(), type: z.literal('floating-buttons'), order: z.number(), content: floatingButtonsContentSchema,  style: blockStyleSchema }),
  z.object({ id: z.string(), type: z.literal('footer'),           order: z.number(), content: footerContentSchema,           style: blockStyleSchema }),
  z.object({ id: z.string(), type: z.literal('faq'),              order: z.number(), content: faqContentSchema,              style: blockStyleSchema }),
  z.object({ id: z.string(), type: z.literal('navbar'),           order: z.number(), content: navbarContentSchema,           style: blockStyleSchema }),
  z.object({ id: z.string(), type: z.literal('loading-spinner'), order: z.number(), content: spinnerContentSchema,          style: blockStyleSchema }),
])

export const blocksArraySchema = z.array(blockSchema)

// Schema permisivo para GUARDAR desde el editor.
// No valida el contenido interno — solo la estructura del bloque.
// Evita que cambios parciales o campos extra rompan el guardado.
export const blocksSaveSchema = z.array(
  z.object({
    id:      z.string().min(1),
    type:    z.string().min(1),
    order:   z.number(),
    content: z.record(z.unknown()),
    style:   blockStyleSchema,
  })
)
