import { NewLandingForm } from './new-landing-form'

export default function NuevaLandingPage() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nueva página</h1>
        <p className="text-gray-600 mt-1">
          Dale un nombre a tu página y elige la URL pública.
        </p>
      </div>
      <div className="bg-white rounded-2xl border p-8">
        <NewLandingForm />
      </div>
    </div>
  )
}
