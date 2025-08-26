Goal
Implement the paperless dispatch → driver → recipient flow: dispatcher creates and assigns loads; driver fulfills exactly one active load at a time, captures a digital signature, and completes delivery.
Personas
• Dispatcher: creates orders, assigns to drivers, monitors status, cancels if needed
• Driver: views assigned load, starts trip, captures recipient signature, completes order
• Recipient: signs on driver’s device
Statuses
OPEN → ASSIGNED → ENROUTE → COMPLETED (or CANCELLED)
Invariants & rules
• One active order per driver (ASSIGNED or ENROUTE)
• Only dispatchers/admins can assign or cancel
• Only the assigned driver can start or complete the order
• On completion, driver becomes available for the next assignment
RBAC
• Cognito groups: dispatcher, driver, admin
• Backend enforces group and ownership checks using JWT claims
Data model (DynamoDB single-table)
• Order (PK=ORDER#{orderId}, SK=ORDER#{orderId})
– status, pickup, delivery, load, assignedTo, assignedAt, recipientName, signature, deliveredAt, createdAt, updatedAt
• Driver (PK=DRIVER#{driverId}, SK=DRIVER#{driverId})
– name, phone, activeOrderId, createdAt, updatedAt
• Order Event (audit) (PK=ORDER#{orderId}, SK=EVT#{timestamp})
– type (CREATED, ASSIGNED, ENROUTE, COMPLETED, CANCELLED), actor, payload
• Indexes
– GSI1: list by status (GSI1PK=ORDER#STATUS#{status}, GSI1SK=createdAt)
– GSI2: list by driver (GSI2PK=DRIVER#{assignedTo}, GSI2SK=updatedAt)
Signature storage (paperless)
• Store compact vector strokes JSON on Order.signature with timestamp and recipient name
• Keep payload small to remain well under item size limits
Concurrency
• Assign uses a DynamoDB transaction: order must be OPEN and unassigned; driver must not have activeOrderId; set order.assignedTo/assignedAt and driver.activeOrderId together; return conflict on failure
• Complete uses a transaction to set order to COMPLETED and clear driver.activeOrderId only if it matches the completing order
API surface (JWT required; base /api/v1)
• POST /orders (dispatcher/admin): create order; status=OPEN; write audit CREATED
• PATCH /orders/{orderId}/assign (dispatcher/admin): transactional assign; audit ASSIGNED; conflicts return 409
• POST /orders/{orderId}/start (driver): set status ENROUTE; only assigned driver; audit ENROUTE
• POST /orders/{orderId}/complete (driver): set status COMPLETED with recipientName and signature; clear activeOrderId; audit COMPLETED
• POST /orders/{orderId}/cancel (dispatcher/admin): set status CANCELLED; audit CANCELLED
• GET /orders?status=…: dispatcher/admin list all by status; driver sees own active and recent
• GET /drivers (dispatcher/admin): list drivers for assignment
• GET /drivers/me (driver): return driver profile and activeOrderId
• GET /health: already implemented
Validation & errors
• Enforce required fields and value formats for pickup, delivery, load, assignment, signature
• Guard by role and ownership (403) and state conflicts (409)
• Clear, user-facing error messages for conflicts (e.g., driver already has an active order)
Frontend scope (V1)
• Dispatcher
– Create Order form with validation
– Orders board with tabs (OPEN, ASSIGNED, ENROUTE, COMPLETED), search by reference/orderId
– Assign modal with driver picker and conflict handling
– Order detail with audit trail and signature rendering from stored strokes
• Driver (mobile-first PWA)
– “My Active Load” view or empty state when none assigned
– Start Delivery action when ASSIGNED
– Signature Capture (canvas) and recipient name; Complete action when ENROUTE
– History of recent completed orders
• UX rules
– Start enabled only when ASSIGNED; Complete requires signature and name
– Post-completion banner confirming driver is clear for next assignment
– Deep-link buttons to navigation apps for delivery address
Observability
• Structured logs include requestId, userId, orderId, action, old→new status
• Metrics: per-status transition counts, assignment conflict rate, time-to-complete
• Basic alarms for 5xx spikes and abnormal conflict rates
Acceptance criteria
• Dispatcher can create an order; status becomes OPEN; audit CREATED recorded
• Dispatcher can assign an order; conflicts return 409; audit ASSIGNED recorded
• Driver sees exactly one active order at a time
• Driver can start only when ASSIGNED to them; status becomes ENROUTE; audit ENROUTE recorded
• Driver can complete only when ENROUTE; recipient name and signature required; status becomes COMPLETED; driver activeOrderId cleared; audit COMPLETED recorded
• Dispatcher sees COMPLETED orders and can view the rendered signature
• All protected routes require valid JWT and enforce RBAC and ownership
• CI/CD continues to pass: backend deploys, frontend builds, env wiring intact
Out of scope (V1)
• Route optimization, multi-stop planning, billing/invoicing, multi-tenant orgs, native mobile apps