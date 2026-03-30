// ─── Tipos de contenido por bloque ───────────────────────────────────────────

// ─── Stats / Contadores ───────────────────────────────────────────────────────

export type StatItem = {
  id: string
  value: string      // e.g. "1 billón", "80,000", "+500"
  label: string      // e.g. "productos disponibles", "tiendas aliadas"
  icon?: string      // emoji or any short string
  color?: string     // accent hex color
}

export type StatsContent = {
  items: StatItem[]
  title?: string
  subtitle?: string
  layout: 'row' | 'grid-2' | 'grid-4'
  cardStyle: 'minimal' | 'card' | 'bordered' | 'colored'
  backgroundColor: string
  textColor: string
  accentColor: string
  animate: boolean   // count-up animation
}

// ─── Features / Beneficios ────────────────────────────────────────────────────

export type FeatureItem = {
  id: string
  image?: string
  icon?: string      // emoji
  title: string
  description: string
  ctaText?: string
  ctaUrl?: string
}

export type FeaturesContent = {
  title?: string
  subtitle?: string
  items: FeatureItem[]
  columns: 2 | 3 | 4
  imageStyle: 'square' | 'rounded' | 'circle' | 'landscape' | 'portrait'
  layout: 'card' | 'minimal' | 'centered' | 'horizontal'
  backgroundColor: string
  textColor: string
  accentColor: string
  gap: 'sm' | 'md' | 'lg'
}

export type GalleryImage = {
  id: string
  url: string
  alt: string
  ctaText?: string   // overlay button text
  ctaUrl?: string
}

export type GalleryLayout =
  | 'grid-2'          // 2 equal columns
  | 'grid-3'          // 3 equal columns
  | 'grid-4'          // 4 equal columns
  | 'feature-left'    // 1 large left + 2×2 right (like screenshot)
  | 'feature-right'   // 2×2 left + 1 large right
  | 'feature-top'     // 1 large top + row of smaller below
  | 'mosaic'          // mixed sizes: 1 tall + 2 medium + 2 small

export type GalleryContent = {
  images: GalleryImage[]
  layout: GalleryLayout
  gap: 'none' | 'sm' | 'md' | 'lg'
  rounded: 'none' | 'sm' | 'md' | 'xl'
  aspectRatio: 'square' | 'portrait' | 'landscape' | 'auto'
  hoverEffect: 'none' | 'zoom' | 'darken' | 'overlay'
  backgroundColor: string
  maxWidth: 'full' | 'xl' | '2xl' | '6xl'
}

export type BrandItem = {
  id: string
  type: 'text' | 'image'
  text: string        // brand name (text type) or alt text (image type)
  imageUrl?: string   // image URL
  color?: string      // optional custom color override
}

export type BrandsBannerContent = {
  items: BrandItem[]
  speed: 'slow' | 'normal' | 'fast'
  direction: 'left' | 'right'
  backgroundColor: string
  textColor: string
  pauseOnHover: boolean
  separator: 'none' | 'dot' | 'line' | 'slash'
  fontSize: 'xs' | 'sm' | 'md' | 'lg'
  fontWeight: 'normal' | 'medium' | 'bold' | 'black'
  uppercase: boolean
  letterSpacing: boolean
  label?: string   // optional heading above ticker, e.g. "Nuestras marcas"
  imageHeight?: number   // px height for image items, default 32
}

export type IconTickerBadgePosition =
  | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

export type IconTickerBadge = {
  text: string
  position: IconTickerBadgePosition
  bg: string        // color de fondo del badge
  color: string     // color del texto
  shape: 'pill' | 'square' | 'starburst'
  size?: number     // % del tamaño de la tarjeta (20–80), default 48
}

export type IconTickerItem = {
  id: string
  icon: string        // emoji (e.g. '🛒') or absolute image URL
  iconType: 'emoji' | 'image'
  label: string
  url?: string
  badge?: IconTickerBadge
}

export type IconsTickerContent = {
  title?: string
  items: IconTickerItem[]
  displayMode: 'ticker' | 'row' | 'grid'  // ticker = animado, row = fila estática, grid = cuadrícula
  speed: 'slow' | 'normal' | 'fast'
  direction: 'left' | 'right'
  backgroundColor: string
  cardBg: string
  textColor: string
  accentColor: string
  pauseOnHover: boolean
  iconSize: 'sm' | 'md' | 'lg'
  showLabels: boolean
  rounded: 'sm' | 'md' | 'full'
  gap: 'sm' | 'md' | 'lg'
  gridColumns?: 2 | 3 | 4 | 5 | 6  // solo para displayMode 'grid'
}

export type HeroContent = {
  title: string
  subtitle: string
  ctaText: string
  ctaUrl: string
  backgroundImage?: string
  backgroundVideo?: string
  backgroundPosition?: string  // CSS background-position, e.g. 'center', 'top', '50% 20%'
  overlayColor?: string        // hex, e.g. '#000000'
  overlayOpacity?: number      // 0-100
}

export type ServiceItem = {
  title: string
  description: string
  price?: string
  icon?: string
}

export type ServicesContent = {
  title: string
  items: ServiceItem[]
}

export type TestimonialItem = {
  name: string
  text: string
  avatar?: string
  role?: string    // "CEO de X", "Cliente frecuente"
  rating?: number  // 1–5, default 5
}

export type TestimonialsContent = {
  title: string
  layout?: 'grid' | 'list'
  columns?: 1 | 2 | 3
  items: TestimonialItem[]
}

export type PaymentContent = {
  title: string
  description: string
  price: number // en centavos
  currency: string // "usd" | "ars" | "mxn"
  provider: 'stripe' | 'mercadopago'
  buttonText: string
  // Colores configurables
  backgroundColor?: string  // fondo de la sección
  textColor?: string        // color del título y descripción
  buttonColor?: string      // fondo del botón
  buttonTextColor?: string  // texto del botón
}

export type ContactContent = {
  title: string
  whatsapp?: string
  email?: string
  buttonText: string
}

export type StoreBadgePreset = {
  id: string
  text: string    // etiqueta exacta que coincide con el campo badge del producto
  bg: string      // color de fondo (#hex)
  color: string   // color del texto (#hex)
}

export type StoreContent = {
  title: string
  subtitle: string
  buttonText: string                          // texto del botón "Agregar al carrito"
  columns: 2 | 3 | 4                         // columnas del grid
  currency: string                            // 'usd' | 'ars' | 'mxn' | 'cop' | 'clp'
  showSearch: boolean                         // barra de búsqueda
  showCategories: boolean                     // habilita filtro de categorías
  filterStyle?: 'tabs' | 'sidebar' | 'dropdown' // cómo se muestran los filtros
  layout: 'grid' | 'list'
  showSort?: boolean                           // selector de orden
  showPriceFilter?: boolean                    // filtro de rango de precio
  showProductCount?: boolean                   // "X productos encontrados"
  badgePresets?: StoreBadgePreset[]            // etiquetas personalizables con colores
}

// Dónde mostrar el botón de carrito — solo 1 opción activa a la vez
export type CartButtonPlacement =
  | 'none'
  | 'banner'          // legacy — ahora el carrito va en el Navbar
  | 'floating-br'     // flotante esquina inferior derecha
  | 'floating-bl'     // flotante esquina inferior izquierda
  | 'floating-tr'     // flotante esquina superior derecha
  | 'floating-tl'     // flotante esquina superior izquierda

// ─── Slide de banner ─────────────────────────────────────────────────────────
export type BannerSlide = {
  id: string
  image: string
  position?: string  // CSS background-position, e.g. 'center', 'top'
}

export type StoreBannerSubItem = {
  id: string
  label: string
  url: string
}

export type StoreBannerDropdownItem = {
  id: string
  label: string
  url: string
  children?: StoreBannerSubItem[]
}

export type StoreBannerNavItem = {
  id: string
  label: string
  url: string
  dropdown?: StoreBannerDropdownItem[]
}

export type StoreBannerContent = {
  storeName: string
  tagline: string
  ctaText: string
  ctaTarget: string
  backgroundColor: string
  textColor: 'light' | 'dark'
  backgroundImage?: string
  backgroundVideo?: string
  backgroundPosition?: string  // CSS background-position, e.g. 'center', 'top', '50% 20%'
  overlayColor?: string        // hex, e.g. '#000000'
  overlayOpacity?: number      // 0-100
  cartButton: CartButtonPlacement
  announcement?: string
  navItems?: StoreBannerNavItem[]  // links inside the banner top bar
  navAlign?: 'left' | 'center' | 'right'  // alignment of nav links in the bar
  navDropdownBg?: string    // dropdown background color, hex
  navDropdownText?: string  // dropdown text color, hex
  navDropdownSize?: 'sm' | 'md' | 'lg'  // font size of dropdown items
  navDropdownStyle?: 'minimal' | 'card' | 'floating'  // visual style preset
  // ── Slideshow de imágenes ─────────────────────────────────────────────────
  slides?: BannerSlide[]          // 1-10 imágenes para el slideshow
  slideInterval?: number          // ms entre slides (default 4000)
  slideTransition?: 'fade' | 'slide'  // tipo de transición
}

export type FloatingButton = {
  id: string
  type: 'whatsapp' | 'phone' | 'email' | 'chat' | 'custom'
  label: string
  url: string
  color: string    // button bg hex
  visible: boolean
}

export type FloatingButtonsContent = {
  buttons: FloatingButton[]
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  showLabels: boolean
  size: 'sm' | 'md' | 'lg'
}

export type FooterLink = { label: string; url: string }
export type FooterColumn = { title: string; links: FooterLink[] }

export type FooterContent = {
  brandName: string
  tagline: string
  columns: FooterColumn[]
  instagram: string
  facebook: string
  tiktok: string
  twitter: string
  linkedin: string
  youtube: string
  whatsappFooter: string
  email: string
  phone: string
  address: string
  copyright: string
}

// ─── Estilos de bloque ───────────────────────────────────────────────────────

export type BlockAnimation = 'none' | 'fade-up' | 'fade-in' | 'zoom-in' | 'slide-left' | 'slide-right'
export type BlockFont = 'inter' | 'playfair' | 'grotesk' | 'nunito'

export type BlockStyle = {
  backgroundColor: string   // hex or 'default'
  textColor: string         // hex or 'default'
  buttonColor: string       // hex or 'default'
  buttonTextColor: string   // hex or 'default'
  paddingY: 'sm' | 'md' | 'lg' | 'xl'
  fontFamily: BlockFont
  animation: BlockAnimation
}

export const DEFAULT_BLOCK_STYLE: BlockStyle = {
  backgroundColor: 'default',
  textColor: 'default',
  buttonColor: 'default',
  buttonTextColor: 'default',
  paddingY: 'md',
  fontFamily: 'inter',
  animation: 'none',
}

// ─── Tipos de bloque ─────────────────────────────────────────────────────────

// ─── Bloque FAQ / Acordeón ────────────────────────────────────────────────────

export type FaqItem = {
  id: string
  question: string
  answer: string
  color?: string   // color del borde/acento, hex
}

export type FaqContent = {
  title: string
  subtitle?: string
  items: FaqItem[]
  allowMultiple?: boolean  // si se puede abrir más de uno a la vez
}

// ─── Bloque Navbar ────────────────────────────────────────────────────────────

export type NavDropdownItem = {
  id: string
  label: string
  url: string
}

export type NavItem = {
  id: string
  label: string
  url: string
  hasDropdown: boolean
  dropdown: NavDropdownItem[]
  color?: string
}

export type NavbarContent = {
  brandName: string
  brandLogo?: string
  items: NavItem[]
  showSearch: boolean
  ctaText?: string
  ctaUrl?: string
  sticky: boolean
  transparent: boolean
  textColor: 'light' | 'dark'
  backgroundColor: string
  dropdownStyle?: 'minimal' | 'card' | 'floating'  // visual style preset for dropdowns
  showCart?: boolean              // mostrar botón de carrito en el navbar
  cartColor?: string              // color del ícono y badge del carrito (hex)
}

// ─── Tipos de bloque ─────────────────────────────────────────────────────────

// ─── Spinner de carga global ──────────────────────────────────────────────────

export type SpinnerType = 'circle' | 'dots' | 'pulse' | 'bars'

export type SpinnerContent = {
  spinnerType: SpinnerType
  customImage?: string      // URL de imagen/logo/gif personalizado
  imageSize: number         // px (default: 80)
  imageAnimation: 'spin' | 'pulse' | 'bounce' | 'none'  // animación aplicada a la imagen custom
  backgroundColor: string   // color de fondo del overlay
  accentColor: string       // color del spinner SVG/CSS
  text?: string             // texto opcional bajo el spinner
  textColor: string
  duration: number          // ms antes de ocultar automáticamente (default: 2000)
}

// ─── Multi-vistas / Pages ─────────────────────────────────────────────────────

export type LandingPageDef = {
  id: string
  label: string
  path: string      // URL param: /p/slug?p=PATH (empty string = home/default)
  icon?: string     // emoji
  isHome?: boolean  // true for the default/main page
}

export type PageNavContent = {
  pages: LandingPageDef[]
}

export type BlockType =
  | 'hero'
  | 'services'
  | 'testimonials'
  | 'payment'
  | 'contact'
  | 'store'
  | 'store-banner'
  | 'floating-buttons'
  | 'footer'
  | 'faq'
  | 'navbar'
  | 'brands-banner'
  | 'gallery'
  | 'stats'
  | 'features'
  | 'icons-ticker'
  | 'loading-spinner'

export type Block = (
  | { id: string; type: 'hero';              order: number; content: HeroContent;             style?: BlockStyle }
  | { id: string; type: 'services';          order: number; content: ServicesContent;         style?: BlockStyle }
  | { id: string; type: 'testimonials';      order: number; content: TestimonialsContent;     style?: BlockStyle }
  | { id: string; type: 'payment';           order: number; content: PaymentContent;          style?: BlockStyle }
  | { id: string; type: 'contact';           order: number; content: ContactContent;          style?: BlockStyle }
  | { id: string; type: 'store';             order: number; content: StoreContent;            style?: BlockStyle }
  | { id: string; type: 'store-banner';      order: number; content: StoreBannerContent;      style?: BlockStyle }
  | { id: string; type: 'floating-buttons';  order: number; content: FloatingButtonsContent;  style?: BlockStyle }
  | { id: string; type: 'footer';            order: number; content: FooterContent;           style?: BlockStyle }
  | { id: string; type: 'faq';              order: number; content: FaqContent;              style?: BlockStyle }
  | { id: string; type: 'navbar';         order: number; content: NavbarContent;        style?: BlockStyle }
  | { id: string; type: 'brands-banner'; order: number; content: BrandsBannerContent;  style?: BlockStyle }
  | { id: string; type: 'gallery';   order: number; content: GalleryContent;   style?: BlockStyle }
  | { id: string; type: 'stats';    order: number; content: StatsContent;    style?: BlockStyle }
  | { id: string; type: 'features'; order: number; content: FeaturesContent; style?: BlockStyle }
  | { id: string; type: 'icons-ticker';     order: number; content: IconsTickerContent;  style?: BlockStyle }
  | { id: string; type: 'loading-spinner'; order: number; content: SpinnerContent;      style?: BlockStyle }
) & { pageId?: string }

// Defaults por tipo de bloque para cuando se agrega uno nuevo
export const BLOCK_DEFAULTS: Record<BlockType, Block['content']> = {
  hero: {
    title: 'Tu título aquí',
    subtitle: 'Una descripción clara de lo que ofreces',
    ctaText: 'Contáctame',
    ctaUrl: '#contacto',
  },
  services: {
    title: 'Mis servicios',
    items: [
      { title: 'Servicio 1', description: 'Descripción de tu servicio', price: '$100' },
    ],
  },
  testimonials: {
    title: '¿Qué dicen mis clientes?',
    layout: 'grid',
    columns: 2,
    items: [
      { name: 'María García',  role: 'Cliente',  text: 'Excelente servicio, lo recomiendo al 100%.', rating: 5 },
      { name: 'Carlos López',  role: 'Cliente',  text: 'Muy profesional y rápido. Quedé muy satisfecho.', rating: 5 },
    ],
  },
  payment: {
    title: 'Adquiere ahora',
    description: 'Descripción de lo que incluye',
    price: 10000,
    currency: 'usd',
    provider: 'stripe',
    buttonText: 'Comprar ahora',
  },
  contact: {
    title: '¿Listo para empezar?',
    whatsapp: '',
    email: '',
    buttonText: 'Contáctame por WhatsApp',
  },
  store: {
    title: 'Nuestros productos',
    subtitle: 'Agrega lo que quieras a tu carrito y paga en un solo paso',
    buttonText: 'Agregar al carrito',
    columns: 3,
    currency: 'usd',
    showSearch: true,
    showCategories: true,
    filterStyle: 'tabs',
    layout: 'grid',
    showSort: true,
    showPriceFilter: false,
    showProductCount: true,
    badgePresets: [
      { id: 'bp-1', text: 'Nuevo',      bg: '#4f46e5', color: '#ffffff' },
      { id: 'bp-2', text: 'Oferta',     bg: '#ef4444', color: '#ffffff' },
      { id: 'bp-3', text: 'Popular',    bg: '#f59e0b', color: '#ffffff' },
      { id: 'bp-4', text: 'Destacado',  bg: '#10b981', color: '#ffffff' },
    ],
  },
  'store-banner': {
    storeName: 'Mi Tienda',
    tagline: 'Calidad y estilo en cada producto',
    ctaText: 'Ver colección',
    ctaTarget: '#productos',
    backgroundColor: '#111827',
    textColor: 'light',
    cartButton: 'banner',
    announcement: '🚚 Envío gratis en compras mayores a $50',
  },
  'floating-buttons': {
    buttons: [
      { id: 'wb1', type: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/1234567890', color: '#25D366', visible: true },
    ],
    position: 'bottom-right',
    showLabels: true,
    size: 'md',
  },
  faq: {
    title: 'Preguntas frecuentes',
    subtitle: 'Todo lo que necesitas saber',
    allowMultiple: false,
    items: [
      { id: 'faq-1', question: '¿Cuánto tiempo tarda el envío?', answer: 'El envío estándar tarda entre 3 y 5 días hábiles. Ofrecemos envío express en 24 horas con costo adicional.', color: '#6366f1' },
      { id: 'faq-2', question: '¿Puedo devolver un producto?', answer: 'Sí, aceptamos devoluciones dentro de los 30 días posteriores a la compra. El producto debe estar en su estado original.', color: '#10b981' },
      { id: 'faq-3', question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard), transferencias bancarias y pagos por plataformas digitales.', color: '#f59e0b' },
    ],
  },
  navbar: {
    brandName: 'Mi Negocio',
    brandLogo: '',
    sticky: true,
    transparent: false,
    textColor: 'dark',
    backgroundColor: '#ffffff',
    showSearch: false,
    ctaText: 'Contacto',
    ctaUrl: '#contacto',
    items: [
      { id: 'nav-1', label: 'Inicio',    url: '#',         hasDropdown: false, dropdown: [] },
      { id: 'nav-2', label: 'Productos', url: '#productos', hasDropdown: false, dropdown: [] },
      { id: 'nav-3', label: 'Categorías', url: '#',        hasDropdown: true,  dropdown: [
        { id: 'dd-1', label: 'Ropa',       url: '#ropa' },
        { id: 'dd-2', label: 'Calzado',    url: '#calzado' },
        { id: 'dd-3', label: 'Accesorios', url: '#accesorios' },
      ]},
      { id: 'nav-4', label: 'Nosotros',  url: '#nosotros',  hasDropdown: false, dropdown: [] },
    ],
  },
  footer: {
    brandName: 'Mi Negocio',
    tagline: 'Calidad y servicio para ti',
    columns: [
      { title: 'Empresa', links: [{ label: 'Inicio', url: '#' }, { label: 'Servicios', url: '#' }, { label: 'Contacto', url: '#' }] },
      { title: 'Ayuda', links: [{ label: 'Preguntas frecuentes', url: '#' }, { label: 'Términos', url: '#' }, { label: 'Privacidad', url: '#' }] },
    ],
    instagram: '',
    facebook: '',
    tiktok: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    whatsappFooter: '',
    email: '',
    phone: '',
    address: '',
    copyright: `© ${new Date().getFullYear()} Mi Negocio. Todos los derechos reservados.`,
  },
  stats: {
    title: 'Números que nos respaldan',
    subtitle: 'Confían en nosotros miles de clientes',
    layout: 'row',
    cardStyle: 'minimal',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    accentColor: '#4f46e5',
    animate: true,
    items: [
      { id: 'st-1', value: '+10,000', label: 'clientes satisfechos', icon: '🧑‍🤝‍🧑' },
      { id: 'st-2', value: '500+',    label: 'productos disponibles', icon: '📦' },
      { id: 'st-3', value: '98%',     label: 'entregas a tiempo',     icon: '⚡' },
      { id: 'st-4', value: '5★',      label: 'calificación promedio', icon: '⭐' },
    ],
  },
  features: {
    title: 'Todo lo que necesitas',
    subtitle: 'Diseñado para hacer tu vida más fácil',
    columns: 3,
    imageStyle: 'rounded',
    layout: 'card',
    backgroundColor: '#f9fafb',
    textColor: '#111827',
    accentColor: '#4f46e5',
    gap: 'md',
    items: [
      { id: 'ft-1', icon: '🛒', title: 'Elige lo que quieras', description: 'Explora miles de productos y agrégalos a tu carrito en segundos.', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80' },
      { id: 'ft-2', icon: '🚚', title: 'Entrega rápida', description: 'Recibe tu pedido en el mismo día o en la fecha que prefieras.', image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=600&q=80' },
      { id: 'ft-3', icon: '💳', title: 'Pago seguro', description: 'Paga con tarjeta o efectivo con total tranquilidad y protección.', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80' },
    ],
  },
  gallery: {
    layout: 'feature-left',
    gap: 'sm',
    rounded: 'md',
    aspectRatio: 'auto',
    hoverEffect: 'zoom',
    backgroundColor: '#ffffff',
    maxWidth: '6xl',
    images: [
      { id: 'g1', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80', alt: 'Foto 1', ctaText: 'Ver Colección', ctaUrl: '#' },
      { id: 'g2', url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80', alt: 'Foto 2' },
      { id: 'g3', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', alt: 'Foto 3' },
      { id: 'g4', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80', alt: 'Foto 4' },
      { id: 'g5', url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', alt: 'Foto 5' },
    ],
  },
  'brands-banner': {
    items: [
      { id: 'br-1', type: 'text', text: 'MICROFREE' },
      { id: 'br-2', type: 'text', text: 'ACTIVE' },
      { id: 'br-3', type: 'text', text: 'CHERRY' },
      { id: 'br-4', type: 'text', text: 'BASICO' },
      { id: 'br-5', type: 'text', text: 'INTIMA' },
      { id: 'br-6', type: 'text', text: 'SPORT' },
    ],
    speed: 'normal',
    direction: 'left',
    backgroundColor: '#ffffff',
    textColor: '#111827',
    pauseOnHover: true,
    separator: 'dot',
    fontSize: 'sm',
    fontWeight: 'bold',
    uppercase: true,
    letterSpacing: true,
  },
  'loading-spinner': {
    spinnerType: 'circle',
    imageSize: 80,
    imageAnimation: 'spin',
    backgroundColor: '#ffffff',
    accentColor: '#4f46e5',
    textColor: '#6b7280',
    duration: 2000,
  },
  'icons-ticker': {
    title: 'Nuestras categorías',
    items: [
      { id: 'it-1', icon: '🏪', iconType: 'emoji', label: 'Tiendas', url: '#' },
      { id: 'it-2', icon: '🍕', iconType: 'emoji', label: 'Comida', url: '#' },
      { id: 'it-3', icon: '💇', iconType: 'emoji', label: 'Belleza', url: '#' },
      { id: 'it-4', icon: '🏋️', iconType: 'emoji', label: 'Fitness', url: '#' },
      { id: 'it-5', icon: '🐾', iconType: 'emoji', label: 'Mascotas', url: '#' },
      { id: 'it-6', icon: '🌿', iconType: 'emoji', label: 'Naturaleza', url: '#' },
      { id: 'it-7', icon: '🎨', iconType: 'emoji', label: 'Arte', url: '#' },
      { id: 'it-8', icon: '🚗', iconType: 'emoji', label: 'Autos', url: '#' },
    ],
    displayMode: 'ticker',
    speed: 'normal',
    direction: 'left',
    backgroundColor: '#ffffff',
    cardBg: '#f9fafb',
    textColor: '#111827',
    accentColor: '#4f46e5',
    pauseOnHover: true,
    iconSize: 'md',
    showLabels: true,
    rounded: 'md',
    gap: 'md',
    gridColumns: 4,
  },
}
