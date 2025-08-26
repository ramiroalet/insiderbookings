import { Router } from "express"
import { authenticate, authorizeRoles } from "../middleware/auth.js"
import { createTenant, listTenants, updateTenant, deleteTenant } from "../controllers/admin.controller.js"

const router = Router()

router.get("/tenants", authenticate, authorizeRoles(99), listTenants)
router.post("/tenants", authenticate, authorizeRoles(99), createTenant)
router.put("/tenants/:id", authenticate, authorizeRoles(99), updateTenant)
router.delete("/tenants/:id", authenticate, authorizeRoles(99), deleteTenant)

export default router
