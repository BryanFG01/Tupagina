import Link from 'next/link'

export default function PagoConfirmadoPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">¡Pago exitoso!</h1>
        <p className="text-gray-600 mb-8">
          Tu pago fue procesado correctamente. Recibirás una confirmación en tu email.
        </p>
        <Link
          href="/"
          className="inline-block bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
