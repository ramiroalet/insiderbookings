"use client"
import { useState, useRef, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { Menu, User, LogOut, Sparkles, Mail, LayoutDashboard, Briefcase, Building2, Lock } from "lucide-react"
import { logout, showAuthModal } from "../../features/auth/authSlice"

/* ── Inline styles ─────────────────────────────────────────── */
const styles = {
  wrapper : { position: "relative" },
  btn     : {
    all         : "unset",
    width       : 40,
    height      : 40,
    borderRadius: "50%",
    background  : "#fff",
    boxShadow   : "0 0 0 1px rgba(0,0,0,.1)",
    display     : "grid",
    placeItems  : "center",
    cursor      : "pointer",
  },
  dropdown: {
    position   : "absolute",
    top        : 48,
    right      : 0,
    width      : 260,
    background : "#fff",
    borderRadius: 12,
    boxShadow  : "0 10px 30px rgba(0,0,0,.1)",
    padding    : "8px 0",
    zIndex     : 100,
  },
  item    : {
    display   : "flex",
    alignItems: "center",
    gap       : 10,
    padding   : "10px 16px",
    fontSize  : 14,
    cursor    : "pointer",
    whiteSpace: "nowrap",
  },
  divider : { height: 1, background: "#eee", margin: "6px 0" },

  staffTag: {
    padding   : "10px 16px",
    fontSize  : 12,
    fontWeight: 700,
    color     : "#f59e0b",
    display   : "flex",
    alignItems: "center",
    gap       : 6,
  },
  influencerTag: {
    padding   : "10px 16px",
    fontSize  : 12,
    fontWeight: 700,
    color     : "#7c3aed",
    display   : "flex",
    alignItems: "center",
    gap       : 6,
  },
  corporateTag: {
    padding   : "10px 16px",
    fontSize  : 12,
    fontWeight: 700,
    color     : "#2563eb",
    display   : "flex",
    alignItems: "center",
    gap       : 6,
  },
  agencyTag: {
    padding   : "10px 16px",
    fontSize  : 12,
    fontWeight: 700,
    color     : "#10b981",
    display   : "flex",
    alignItems: "center",
    gap       : 6,
  },
  vaultTag: {
    padding   : "10px 16px",
    fontSize  : 12,
    fontWeight: 700,
    color     : "#6b7280",
    display   : "flex",
    alignItems: "center",
    gap       : 6,
  },
  adminTag: {
    padding   : "10px 16px",
    fontSize  : 12,
    fontWeight: 700,
    color     : "#ef4444", // rojo sutil para admin
    display   : "flex",
    alignItems: "center",
    gap       : 6,
  },
}

/* ── Pulse keyframes ───────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("perk-pulse")) {
  const style = document.createElement("style")
  style.id = "perk-pulse"
  style.textContent = `
    @keyframes perkPulse {
      0%   { transform: scale(1);   opacity: 1; }
      100% { transform: scale(1.2); opacity: .6; }
    }
  `
  document.head.appendChild(style)
}

/* ── Component ─────────────────────────────────────────────── */
const UserMenu = () => {
  const dispatch            = useDispatch()
  const navigate            = useNavigate()
  const { isLoggedIn, user} = useSelector((s) => s.auth)
  const [open, setOpen]     = useState(false)
  const menuRef             = useRef(null)

  const isAdmin         = isLoggedIn && (user?.role === 100 || user?.role === "100")
  const isStaff         = isLoggedIn && (user?.role === 1   || user?.role === "1")
  const isInfluencer    = isLoggedIn && (user?.role === 2   || user?.role === "2")
  const isCorporate     = isLoggedIn && (user?.role === 3   || user?.role === "3")
  const isAgency        = isLoggedIn && (user?.role === 4   || user?.role === "4")
  const isVaultOperator = isLoggedIn && (user?.role === 99  || user?.role === "99")
  const isRegular       = isLoggedIn && (user?.role === 0   || user?.role === "0")

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener("mousedown", handler)
    return () => window.removeEventListener("mousedown", handler)
  }, [])

  /* Helpers */
  const goTo = (path) => {
    setOpen(false)
    navigate(path)
  }

  const logOut = async () => {
    setOpen(false)
    try {
      await dispatch(logout())
    } finally {
      window.location.reload()
    }
  }

  const openAuthModal = () => {
    setOpen(false)
    dispatch(showAuthModal({ mode: "login" }))
  }

  /* Options for guests */
  const guestOptions = [
    { label: "Help Center",       onClick: () => goTo("/help") },
    "divider",
    { label: "Sign in / Register", onClick: openAuthModal },
  ]

  /* Base options for signed-in users */
  const baseUserOptions = [
    { label: "Favorites",       onClick: () => goTo("/favourites") },
    {
      label: "Perks & Add-ons",
      icon : (
        <Sparkles
          size={16}
          style={{ color: "#f59e0b", animation: "perkPulse 1.2s ease-in-out infinite alternate" }}
        />
      ),
      onClick: () => goTo("/perks"),
    },
    { label: "Profile",        onClick: () => goTo("/profile") },
    { label: "Notifications",  onClick: () => goTo("/notifications") },
    { label: "Discounts",      onClick: () => goTo("/discount") },
    { label: "Help Center",    onClick: () => goTo("/help") },
  ]

  /* Extras por rol */
  const adminExtra = {
    label : "Control Panel",
    icon  : <LayoutDashboard size={16} />,
    onClick: () => goTo("/admin"),
  }

  const staffExtra = {
    label : "Contact via Email",
    icon  : <Mail size={16} />,
    onClick: () => goTo("/contact-mail"),
  }

  const influencerExtra = {
    label : "My Dashboard",
    icon  : <LayoutDashboard size={16} />,
    onClick: () => goTo("/i-dashbord"), // nota: "dashboard" está abreviado como en tu código original
  }

  const becomePartnerExtra = {
    label : "Become a partner",
    icon  : <Sparkles size={16} />,
    onClick: () => goTo("/become-partner"),
  }

  const roleExtras = [
    ...(isAdmin ? [adminExtra] : []),
    ...(isInfluencer ? [influencerExtra] : []),
    ...(isStaff ? [staffExtra] : []),
    ...(isRegular ? [becomePartnerExtra] : []),
  ]

  const userOptions = [
    ...roleExtras,
    ...baseUserOptions,
    "divider",
    { label: "Log out", icon: <LogOut size={16} />, onClick: logOut },
  ]

  const options = isLoggedIn ? userOptions : guestOptions

  return (
    <div style={styles.wrapper} ref={menuRef}>
      {/* Trigger button */}
      <button
        style={styles.btn}
        onClick={() => setOpen(!open)}
        aria-label="user-menu"
      >
        {isLoggedIn ? (
          <span style={{ fontWeight: 600 }}>
            {user?.name?.[0]?.toUpperCase() || <User size={18} />}
          </span>
        ) : (
          <Menu size={18} />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={styles.dropdown}>
          {/* Role tags */}
          {isAdmin && (
            <>
              <div style={styles.adminTag}>
                <LayoutDashboard size={14} style={{ color: "#ef4444" }} />
                Admin
              </div>
              <div style={styles.divider} />
            </>
          )}

          {isStaff && (
            <>
              <div style={styles.staffTag}>
                <Sparkles size={14} style={{ color: "#f59e0b" }} />
                Insider Staff member
              </div>
              <div style={styles.divider} />
            </>
          )}

          {isInfluencer && (
            <>
              <div style={styles.influencerTag}>
                <Sparkles size={14} style={{ color: "#7c3aed" }} />
                Insider Influencer member
              </div>
              <div style={styles.divider} />
            </>
          )}

          {isCorporate && (
            <>
              <div style={styles.corporateTag}>
                <Building2 size={14} style={{ color: "#2563eb" }} />
                Corporate member
              </div>
              <div style={styles.divider} />
            </>
          )}

          {isAgency && (
            <>
              <div style={styles.agencyTag}>
                <Briefcase size={14} style={{ color: "#10b981" }} />
                Agency member
              </div>
              <div style={styles.divider} />
            </>
          )}

          {isVaultOperator && (
            <>
              <div style={styles.vaultTag}>
                <Lock size={14} style={{ color: "#6b7280" }} />
                Vault Operator
              </div>
              <div style={styles.divider} />
            </>
          )}

          {/* Options list */}
          {options.map((opt, idx) =>
            opt === "divider" ? (
              <div key={`div-${idx}`} style={styles.divider} />
            ) : (
              <div
                key={opt.label}
                style={styles.item}
                onClick={opt.onClick}
                onKeyDown={(e) => e.key === "Enter" && opt.onClick()}
                role="button"
                tabIndex={0}
              >
                {opt.icon || null}
                <span>{opt.label}</span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

export default UserMenu
