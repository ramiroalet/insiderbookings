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
    } catch (e) {
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
            // mapeo de nombres de columnas a los campos del form
            if (f.includes("public_domain")) errs.public_domain = "Ya está en uso"
            if (f.includes("panel_domain")) errs.panel_domain = "Ya está en uso"
          }
          setFormErrors(errs)
        }
        return
      }

      if (editingId) {
        // update en state
        setTenants((prev) => prev.map((t) => (t.id === editingId ? data.tenant : t)))
        setSuccessMsg("Tenant actualizado correctamente.")
      } else {
        // create en state
        setTenants((prev) => [data.tenant, ...prev])
        setSuccessMsg("Tenant creado correctamente.")
      }

      setOpenForm(false)
      resetForm()
    } catch (e2) {
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
      // quitar del state
      setTenants((prev) => prev.filter((x) => x.id !== t.id))
      setSuccessMsg("Tenant eliminado.")
      setTimeout(() => setSuccessMsg(""), 2500)
    } catch (e) {
      setError("No se pudo eliminar el tenant.")
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <LayoutDashboard />
        <h1 style={{ margin: 0 }}>Control Panel</h1>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={openCreate}
          disabled={submitting}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <Plus size={16} />
          New Tenant
        </button>

        {successMsg && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#10b981" }}>
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}

        {error && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#ef4444" }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>

      {/* Form */}
      {openForm && (
        <form
          onSubmit={onSubmit}
          style={{
            marginBottom: 24,
            padding: 16,
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            background: "#fff",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Name *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Restaurant Pepe"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
              />
              {formErrors.name && <div style={{ color: "#ef4444", fontSize: 12 }}>{formErrors.name}</div>}
            </div>

            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Public domain *</label>
              <input
                value={form.public_domain}
                onChange={(e) => setForm((f) => ({ ...f, public_domain: e.target.value }))}
                placeholder="restaurantpepe.com"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
              />
              {formErrors.public_domain && <div style={{ color: "#ef4444", fontSize: 12 }}>{formErrors.public_domain}</div>}
            </div>

            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Panel domain *</label>
              <input
                value={form.panel_domain}
                onChange={(e) => setForm((f) => ({ ...f, panel_domain: e.target.value }))}
                placeholder="panel.restaurantpepe.com"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
              />
              {formErrors.panel_domain && <div style={{ color: "#ef4444", fontSize: 12 }}>{formErrors.panel_domain}</div>}
            </div>

            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Hotel ID (opcional)</label>
              <input
                value={form.hotel_id}
                onChange={(e) => setForm((f) => ({ ...f, hotel_id: e.target.value }))}
                placeholder="1"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
              />
              {formErrors.hotel_id && <div style={{ color: "#ef4444", fontSize: 12 }}>{formErrors.hotel_id}</div>}
            </div>

            <div>
              <label style={{ fontSize: 12, color: "#6b7280" }}>Hotel Access (opcional)</label>
              <input
                value={form.hotel_access}
                onChange={(e) => setForm((f) => ({ ...f, hotel_access: e.target.value }))}
                placeholder="2"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb" }}
              />
              {formErrors.hotel_access && <div style={{ color: "#ef4444", fontSize: 12 }}>{formErrors.hotel_access}</div>}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: submitting ? "#6b7280" : "#111",
                color: "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Saving..." : editingId ? "Save Changes" : "Save Tenant"}
            </button>
            <button
              type="button"
              onClick={() => { setOpenForm(false); resetForm() }}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Grid de Tenants */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff", height: 160, opacity: 0.5 }} />
            ))
          : tenants.map((t) => (
              <div key={t.id} style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12, background: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Building2 size={16} />
                    <strong>{t.name}</strong>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => openEdit(t)}
                      title="Edit"
                      style={{ border: "1px solid #e5e7eb", background: "#fff", borderRadius: 8, padding: 6, cursor: "pointer" }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(t)}
                      title="Delete"
                      style={{ border: "1px solid #fee2e2", background: "#fff", borderRadius: 8, padding: 6, cursor: "pointer" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                  <Globe size={14} /> {t.public_domain}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", marginTop: 4 }}>
                  <Shield size={14} /> {t.panel_domain}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                  <Server size={14} /> hotel_id: {t.hotel_id ?? "-"} • access: {t.hotel_access ?? "-"}
                </div>

                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                  {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                </div>
              </div>
            ))}
      </div>
    </div>
  )
}
