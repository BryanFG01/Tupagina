import { MercadoPagoConfig, Preference } from 'mercadopago'

function getMp(): MercadoPagoConfig {
  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error('Falta la variable de entorno MERCADOPAGO_ACCESS_TOKEN')
  }
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  })
}

export async function createMpStoreCheckout(params: {
  orderId: string
  currency: string
  lineItems: { name: string; unitAmount: number; quantity: number }[]
  successUrl: string
  cancelUrl: string
  buyerEmail?: string
}): Promise<{ preferenceId: string; checkoutUrl: string }> {
  const client = getMp()
  const preference = new Preference(client)

  const result = await preference.create({
    body: {
      external_reference: `order_${params.orderId}`,
      payer: params.buyerEmail ? { email: params.buyerEmail } : undefined,
      items: params.lineItems.map(item => ({
        id: item.name.slice(0, 32),
        title: item.name,
        quantity: item.quantity,
        unit_price: item.unitAmount / 100, // MP usa enteros, no centavos para ARS/MXN
        currency_id: params.currency.toUpperCase(),
      })),
      back_urls: {
        success: params.successUrl,
        failure: params.cancelUrl,
        pending: params.successUrl,
      },
      auto_return: 'approved',
      notification_url: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`
        : undefined,
    },
  })

  if (!result.init_point) throw new Error('Mercado Pago no retornó una URL de checkout')

  return {
    preferenceId: result.id ?? '',
    checkoutUrl: result.init_point,
  }
}
