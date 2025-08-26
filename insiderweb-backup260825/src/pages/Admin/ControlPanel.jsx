"use client"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import {
  Plus,
  Globe,
  LayoutDashboard,
  Building2,
  Shield,
  Server,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

const domainRe = /^[a-z0-9.-]+\.[a-z]{2,}$/i

function TenantForm({ form, setForm, formErrors, submitting, onSubmit, onCancel, editingId }) {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-lg font-medium mb-4">{editingId ? "Edit tenant" : "Create tenant"}</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Restaurant Pepe"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {formErrors.name && <div className="text-red-500 text-xs mt-1">{formErrors.name}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Public domain *</label>
          <input
            value={form.public_domain}
            onChange={(e) => setForm((f) => ({ ...f, public_domain: e.target.value }))}
            placeholder="restaurantpepe.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {formErrors.public_domain && <div className="text-red-500 text-xs mt-1">{formErrors.public_domain}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Panel domain *</label>
          <input
            value={form.panel_domain}
            onChange={(e) => setForm((f) => ({ ...f, panel_domain: e.target.value }))}
            placeholder="panel.restaurantpepe.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {formErrors.panel_domain && <div className="text-red-500 text-xs mt-1">{formErrors.panel_domain}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hotel ID (optional)</label>
          <input
            value={form.hotel_id}
            onChange={(e) => setForm((f) => ({ ...f, hotel_id: e.target.value }))}
            placeholder="1"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {formErrors.hotel_id && <div className="text-red-500 text-xs mt-1">{formErrors.hotel_id}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Access (optional)</label>
          <input
            value={form.hotel_access}
            onChange={(e) => setForm((f) => ({ ...f, hotel_access: e.target.value }))}
            placeholder="2"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {formErrors.hotel_access && <div className="text-red-500 text-xs mt-1">{formErrors.hotel_access}</div>}
        </div>

        <div className="flex gap-2 sm:col-span-2 mt-2">
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded-md text-white text-sm ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            {submitting ? "Saving..." : editingId ? "Save Changes" : "Save Tenant"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ControlPanel() {
  const token = useSelector((s) => s.auth?.token)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [tenants, setTenants] = useState([])

  const [openForm, setOpenForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")

  const [form, setForm] = useState({
    name: "",
    public_domain: "",
    panel_domain: "",
    hotel_id: "",
    hotel_access: "",
  })
  const [formErrors, setFormErrors] = useState({})

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const fetchTenants = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/admin/tenants`, { headers })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setTenants(data?.tenants || [])
    } catch (err) {
      console.error(err)
      setError("No se pudo cargar la lista de tenants.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const validate = () => {
    const errs = {}
    if (!form.name?.trim()) errs.name = "Nombre requerido"
    if (!form.public_domain?.trim()) errs.public_domain = "Dominio público requerido"
    else if (!domainRe.test(form.public_domain)) errs.public_domain = "Dominio inválido (ej: ejemplo.com)"
    if (!form.panel_domain?.trim()) errs.panel_domain = "Dominio de panel requerido"
    else if (!domainRe.test(form.panel_domain)) errs.panel_domain = "Dominio inválido (ej: panel.ejemplo.com)"

    if (form.hotel_id && Number.isNaN(Number(form.hotel_id))) errs.hotel_id = "hotel_id debe ser numérico"
    if (form.hotel_access && Number.isNaN(Number(form.hotel_access))) errs.hotel_access = "hotel_access debe ser numérico"
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const resetForm = () => {
    setEditingId(null)
    setForm({
      name: "",
      public_domain: "",
      panel_domain: "",
      hotel_id: "",
      hotel_access: "",
    })
    setFormErrors({})
  }

  const openCreate = () => {
    resetForm()
    setOpenForm(true)
  }

  const openEdit = (t) => {
    setEditingId(t.id)
    setForm({
      name: t.name || "",
      public_domain: t.public_domain || "",
      panel_domain: t.panel_domain || "",
      hotel_id: t.hotel_id ?? "",
      hotel_access: t.hotel_access ?? "",
    })
    setFormErrors({})
    setOpenForm(true)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSuccessMsg("")
    setError("")
    if (!validate()) return
    setSubmitting(true)

    const payload = {
      name: form.name.trim(),
      public_domain: form.public_domain.trim().toLowerCase(),
      panel_domain: form.panel_domain.trim().toLowerCase(),
      hotel_id: form.hotel_id !== "" ? Number(form.hotel_id) : null,
      hotel_access: form.hotel_access !== "" ? Number(form.hotel_access) : null,
    }

    try {
      const url = editingId ? `${API_URL}/admin/tenants/${editingId}` : `${API_URL}/admin/tenants`
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        const msg = data?.error || data?.message || "Operación fallida."
        setError(msg)
        if (res.status === 409 && data?.conflicts?.length) {
          const errs = { ...formErrors }
          for (const f of data.conflicts) {
            if (f.includes("public_domain")) errs.public_domain = "Ya está en uso"
            if (f.includes("panel_domain")) errs.panel_domain = "Ya está en uso"
          }
          setFormErrors(errs)
        }
        return
      }

      if (editingId) {
        setTenants((prev) => prev.map((t) => (t.id === editingId ? data.tenant : t)))
        setSuccessMsg("Tenant actualizado correctamente.")
      } else {
        setTenants((prev) => [data.tenant, ...prev])
        setSuccessMsg("Tenant creado correctamente.")
      }

      setOpenForm(false)
      resetForm()
    } catch (err) {
      console.error(err)
      setError("Error inesperado.")
    } finally {
      setSubmitting(false)
      setTimeout(() => setSuccessMsg(""), 3000)
    }
  }

  const onDelete = async (t) => {
    const ok = window.confirm(`¿Eliminar el tenant "${t.name}"?`)
    if (!ok) return
    setError("")
    try {
      const res = await fetch(`${API_URL}/admin/tenants/${t.id}`, {
        method: "DELETE",
        headers,
      })
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || `Error ${res.status}`)
      }
      setTenants((prev) => prev.filter((x) => x.id !== t.id))
      setSuccessMsg("Tenant eliminado.")
      setTimeout(() => setSuccessMsg(""), 2500)
    } catch (err) {
      console.error(err)
      setError("No se pudo eliminar el tenant.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Control Panel</h1>
          </div>
          <button
            onClick={openCreate}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Plus size={16} />
            New Tenant
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            {successMsg}
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {openForm && (
          <TenantForm
            form={form}
            setForm={setForm}
            formErrors={formErrors}
            submitting={submitting}
            onSubmit={onSubmit}
            onCancel={() => {
              setOpenForm(false)
              resetForm()
            }}
            editingId={editingId}
          />
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-sm text-gray-500">Loading tenants...</div>
          ) : tenants.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No tenants found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Public domain</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Panel domain</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">Hotel</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tenants.map((t) => (
                    <tr key={t.id}>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Globe className="h-4 w-4" />
                          {t.public_domain}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Shield className="h-4 w-4" />
                          {t.panel_domain}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-600">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Server className="h-4 w-4" />
                          hotel_id: {t.hotel_id ?? "-"} • access: {t.hotel_access ?? "-"}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => openEdit(t)}
                          title="Edit"
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(t)}
                          title="Delete"
                          className="p-1 rounded hover:bg-gray-100 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

