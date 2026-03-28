import { z } from 'zod'

export const createProductSchema = z.object({
  name:         z.string().min(1, 'El nombre es requerido').max(120),
  description:  z.string().max(500).optional(),
  imageUrl:     z.string().url('URL de imagen inválida').optional().or(z.literal('')),
  price:        z.number().min(100, 'El precio mínimo es $1.00'),
  comparePrice: z.number().min(100).optional(),
  stock:        z.number().int().min(-1).optional(),
  category:     z.string().max(60).optional().or(z.literal('')),
  badge:        z.string().max(30).optional().or(z.literal('')),
  badgeShape:   z.enum(['pill', 'square', 'starburst']).optional(),
  badgeSize:    z.enum(['sm', 'md', 'lg']).optional(),
})

export const updateProductSchema = createProductSchema.partial().extend({
  active: z.boolean().optional(),
})

export const shippingAddressSchema = z.object({
  street:  z.string().min(3, 'Ingresa la dirección').max(200),
  city:    z.string().min(2, 'Ingresa la ciudad').max(100),
  state:   z.string().min(2, 'Ingresa el estado / provincia').max(100),
  zipCode: z.string().min(3, 'Ingresa el código postal').max(20),
  country: z.string().min(2, 'Ingresa el país').max(100),
})

export const storeCheckoutSchema = z.object({
  landingId: z.string().cuid(),
  currency:  z.enum(['usd', 'ars', 'mxn', 'cop', 'clp']),
  paymentProvider: z.enum(['stripe', 'mercadopago']).default('stripe'),
  buyerName:  z.string().min(2, 'Ingresa tu nombre').max(120).optional(),
  buyerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  buyerPhone: z.string().max(30).optional().or(z.literal('')),
  shippingAddress: shippingAddressSchema.optional(),
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, 'El carrito está vacío'),
})

export const createReviewSchema = z.object({
  productId:  z.string().cuid(),
  orderId:    z.string().cuid().optional(),
  rating:     z.number().int().min(1).max(5),
  comment:    z.string().max(800).optional().or(z.literal('')),
  buyerName:  z.string().min(2, 'Ingresa tu nombre').max(100),
  buyerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
})
