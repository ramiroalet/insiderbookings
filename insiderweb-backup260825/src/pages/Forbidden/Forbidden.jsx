"use client"

export default function Forbidden() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-6xl font-extrabold text-red-500 mb-3">403</div>
        <h1 className="text-2xl font-semibold mb-2">Acceso denegado</h1>
        <p className="text-gray-600">
          No tenés permisos para ver esta sección. Si creés que es un error, contactá a soporte.
        </p>
      </div>
    </div>
  )
}
