import { getManyProductsById } from '@/infrastructure/repositories/product.repository'
import { createOrderWithItems, updateOrderStatus } from '@/infrastructure/repositories/order.repository'
import { createStripeStoreCheckout } from '@/infrastructure/payments/stripe'
import { createMpStoreCheckout }     from '@/infrastructure/payments/mercadopago'
import type { StoreCheckoutInput, StoreCheckoutResult } from '@/domain/store/store.types'

export async function createStoreCheckout(
  input: StoreCheckoutInput,
  appUrl: string
): Promise<StoreCheckoutResult> {
  const { landingId, currency, paymentProvider = 'stripe', items } = input

  // 1. Cargar productos y validar stock
  const productIds = items.map(i => i.productId)
  const products = await getManyProductsById(productIds)

  const productMap = new Map(products.map(p => [p.id, p]))

  for (const item of items) {
    const product = productMap.get(item.productId)
    if (!product) throw new Error(`Producto no disponible`)
    if (!product.active) throw new Error(`"${product.name}" ya no está disponible`)
    if (product.stock !== -1 && product.stock < item.quantity) {
      throw new Error(`Stock insuficiente para "${product.name}"`)
    }
  }

  // 2. Crear la orden con snapshot de precios y datos del comprador
  const orderItems = items.map(item => {
    const product = productMap.get(item.productId)!
    return { productId: item.productId, name: product.name, unitPrice: product.price, quantity: item.quantity }
  })

  const order = await createOrderWithItems({
    landingId,
    currency,
    paymentProvider,
    buyerName:       input.buyerName,
    buyerEmail:      input.buyerEmail,
    buyerPhone:      input.buyerPhone,
    shippingAddress: input.shippingAddress,
    items:           orderItems,
  })

  const lineItems = orderItems.map(i => ({ name: i.name, unitAmount: i.unitPrice, quantity: i.quantity }))
  const successUrl = `${appUrl}/pedido/confirmado?orderId=${order.id}`
  const cancelUrl  = `${appUrl}/p/${landingId}`

  // 3. Crear sesión de pago según el provider
  if (paymentProvider === 'mercadopago') {
    const mp = await createMpStoreCheckout({
      orderId: order.id, currency, lineItems, successUrl, cancelUrl,
      buyerEmail: input.buyerEmail,
    })
    await updateOrderStatus(order.id, 'PENDING', { mpPaymentId: mp.preferenceId })
    return { orderId: order.id, checkoutUrl: mp.checkoutUrl }
  }

  // Stripe (default)
  const session = await createStripeStoreCheckout({
    orderId: order.id, currency, lineItems, successUrl, cancelUrl,
    buyerEmail: input.buyerEmail,
  })
  await updateOrderStatus(order.id, 'PENDING', { stripeSessionId: session.sessionId })
  return { orderId: order.id, checkoutUrl: session.checkoutUrl }
}
