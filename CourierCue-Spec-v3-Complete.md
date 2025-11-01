# CourierCue – Spec v3: Complete Load Detail Fixes, Trailers, Docks, and Driver Experience

Version: 3.0  
Date: November 1, 2025
Status: **Implementation Required**  
Depends on: Base CourierCue application

---

## Executive Summary

This specification addresses critical issues and missing features in the CourierCue application:

1. **Driver Load Access**: Drivers cannot view loads listed in "My Loads" (404 errors)
2. **Admin/CoAdmin Navigation**: Load rows are not clickable for admins/coadmins to view details
3. **Trailer Management**: Complete trailer lifecycle management (missing frontend UI)
4. **Dock & Dock Yard Management**: Location management for trailers (missing frontend UI)
5. **Enhanced Load Creation**: Integration of trailer and location information
6. **Driver View Enhancements**: Display of trailer, dock, and manifest information

---

## 1. Critical Issues Analysis

### 1.1 Driver "Load Not Found" Error

**Current Behavior:**
- Drivers see loads in `/driver/loads` (My Loads page)
- Clicking on a load navigates to `/loads/{id}` 
- Backend returns 404 error

**Root Causes:**
1. API `/loads/my` returns correct `loadId` ✅ (Already implemented)
2. Frontend `DriverLoadsPage.tsx` navigates to `/loads/${load.id}` ✅
3. Backend `GET /loads/{id}` properly checks driver assignment ✅
4. **Issue**: Frontend may be using wrong ID field OR permissions not working correctly

**Required Fixes:**
- Verify `load.id` vs `load.loadId` field consistency
- Ensure driver authorization in `get-load.ts` returns 403 (not 404) for unassigned drivers
- Add error logging to identify exact failure point

### 1.2 Admin/CoAdmin Load Navigation

**Current Behavior:**
- Loads list displays all loads correctly
- Load rows are NOT clickable
- No navigation to load detail page

**Required Implementation:**
- Make entire load row clickable
- Navigate to `/loads/{loadId}` on click
- Maintain existing action buttons (Assign Driver, View Receipt)

### 1.3 Missing Frontend for Trailer Management

**Backend Status:** ✅ Complete
- API endpoints created: `GET /trailers`, `POST /trailers`, `PATCH /trailers/{id}`
- Database functions implemented in `db.ts`
- RBAC implemented

**Frontend Status:** ❌ Not Started
- No Trailers page
- No Trailer components
- No API integration in `web/src/lib/api.ts`
- No routes in `App.tsx`

### 1.4 Missing Frontend for Dock & Dock Yard Management

**Backend Status:** ✅ Complete
- API endpoints created for both docks and dockyards
- Database functions implemented
- RBAC implemented

**Frontend Status:** ❌ Not Started
- No Docks page
- No Dock Yards page
- No components
- No API integration
- No routes

### 1.5 Load Creation Missing Trailer Integration

**Current State:**
- `CreateLoadForm.tsx` has basic load creation
- No trailer selection
- No dock/location selection
- No manifest field

**Required:**
- Add trailer dropdown (from available trailers)
- Add trailer location dropdown (from available docks)
- Add manifest textarea/field
- Show compliance status for selected trailer

---

## 2. Complete Implementation Specification

### 2.1 Frontend UI Requirements

#### 2.1.1 Trailers Page (`/trailers`)

**Access:** Admin, CoAdmin only

**Features:**
- List all organization trailers in a table/card view
- Display columns:
  - Trailer Number
  - Current Location (Dock name)
  - Registration Expiration Date
  - Registration Status (Current/Expired)
  - Inspection Expiration Date
  - Inspection Status (Current/Expired)
  - Compliance Badge (COMPLIANT / NEEDS UPDATING)
  - Status (ACTIVE / INACTIVE / IN_REPAIR)
  - Actions (Edit, View Details)

- **Create Trailer Button**: Opens modal/form with fields:
  - Trailer Number (required, unique)
  - Current Dock Location (dropdown from docks)
  - Registration Expiration Date (date picker)
  - Is Registration Current (checkbox)
  - Inspection Expiration Date (date picker)
  - Is Inspection Current (checkbox)
  - Status (dropdown: ACTIVE, INACTIVE, IN_REPAIR)

- **Edit Trailer**: Same fields as create, pre-populated

- **Compliance Calculation** (computed):
  - `COMPLIANT`: Both registration and inspection are current AND not expired
  - `NEEDS_UPDATING`: Either registration or inspection expired OR checkboxes not checked

#### 2.1.2 Dock Yards Page (`/dockyards`)

**Access:** Admin, CoAdmin only

**Features:**
- List all dock yards
- Display: Name, Address (optional), Number of Docks, Actions
- Create Dock Yard form:
  - Name (required)
  - Address (optional, multi-line)

#### 2.1.3 Docks Page (`/docks`)

**Access:** Admin, CoAdmin only

**Features:**
- List all docks
- Display: Name, Dock Yard, Type, Notes, Trailers at Location, Actions
- Create Dock form:
  - Name (required)
  - Dock Yard (dropdown, required)
  - Dock Type (dropdown: flatbed, drop-in)
  - Notes (textarea, optional)

#### 2.1.4 Enhanced Load Creation Form

**Updates to `CreateLoadForm.tsx`:**

Add new section after Service Address, before Items:

```
Trailer & Location Information (Optional)
├── Trailer Selection (dropdown)
│   ├── Shows: Trailer Number - Compliance Status - Current Location
│   ├── Filter: Only show ACTIVE and COMPLIANT trailers
│   └── Display warning if selected trailer NEEDS_UPDATING
│
├── Trailer Location (dropdown of docks)
│   └── Auto-populate with trailer's currentDockId if trailer selected
│
├── Dock Yard (auto-filled from selected dock)
│
└── Manifest (textarea)
    └── Description of items loaded on trailer
```

#### 2.1.5 Enhanced Load Detail Page

**For Drivers (Read-Only):**

Add new section after Service Address:

```
Trailer & Pickup Information
├── Trailer Number: [Display]
├── Compliance Status: [Badge - COMPLIANT/NEEDS_UPDATING]
├── Pickup Location:
│   ├── Dock: [Dock Name]
│   ├── Dock Type: [flatbed/drop-in]
│   ├── Dock Yard: [Yard Name]
│   └── Address: [If available]
├── Manifest:
│   └── [Display manifest text]
```

**For Admin/CoAdmin:**
- Same display as driver
- Add "Edit Load" button
- Edit mode allows changing all fields including trailer/location

#### 2.1.6 Loads Page Clickability

**Update `LoadsPage.tsx`:**

Make load row clickable:
```tsx
<li key={load.loadId}>
  <div 
    className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
    onClick={() => navigate(`/loads/${load.loadId}`)}
  >
    {/* Existing content */}
  </div>
</li>
```

Prevent button clicks from triggering row click:
```tsx
<button 
  onClick={(e) => {
    e.stopPropagation();
    openAssignModal(load);
  }}
>
```

### 2.2 API Integration (`web/src/lib/api.ts`)

Add new API clients:

```typescript
const realTrailersApi = {
  list: () => request<{ trailers: any[] }>('/trailers'),
  create: (data: any) => request('/trailers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => request(`/trailers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

const realDocksApi = {
  list: () => request<{ docks: any[] }>('/docks'),
  create: (data: any) => request('/docks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => request(`/docks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

const realDockYardsApi = {
  list: () => request<{ dockyards: any[] }>('/dockyards'),
  create: (data: any) => request('/dockyards', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => request(`/dockyards/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

export const trailersApi = USE_MOCK_API ? mockApi.trailers : realTrailersApi;
export const docksApi = USE_MOCK_API ? mockApi.docks : realDocksApi;
export const dockYardsApi = USE_MOCK_API ? mockApi.dockyards : realDockYardsApi;
```

### 2.3 Routes (`App.tsx`)

Add new routes:

```tsx
<Route path="/trailers" element={<TrailersPage />} />
<Route path="/docks" element={<DocksPage />} />
<Route path="/dockyards" element={<DockYardsPage />} />
```

Update Navigation component to include links (for admin/coadmin only).

### 2.4 Backend Verification

**Already Implemented (Verify):**
- ✅ Trailer APIs: `/trailers` (GET, POST), `/trailers/{id}` (PATCH)
- ✅ Dock APIs: `/docks` (GET, POST), `/docks/{id}` (PATCH)
- ✅ DockYard APIs: `/dockyards` (GET, POST), `/dockyards/{id}` (PATCH)
- ✅ Load schema supports: `trailerId`, `trailerLocationId`, `dockYardId`, `manifest`
- ✅ GET `/loads/{id}` expands trailer, dock, dockyard data

**Required Fixes:**
- Ensure `GET /loads/my` returns consistent ID field (`loadId` or `id`)
- Verify driver permission check returns 403 (not 404) for unauthorized access

### 2.5 Data Model Updates

**Load Entity (Backend):**
```typescript
interface Load {
  loadId: string;
  orgId: string;
  status: 'PENDING' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERED' | 'COMPLETED';
  serviceAddress: ServiceAddress;
  items: LoadItem[];
  assignedDriverId?: string;
  
  // NEW FIELDS:
  trailerId?: string;              // Reference to trailer
  trailerLocationId?: string;       // Reference to dock (pickup location)
  dockYardId?: string;              // Reference to dock yard
  manifest?: string;                // Description of trailer contents
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // ... other existing fields
}
```

**Trailer Entity:**
```typescript
interface Trailer {
  trailerId: string;
  trailerNumber: string;
  currentDockId?: string;
  registrationExpiresAt?: string;
  inspectionExpiresAt?: string;
  isRegistrationCurrent: boolean;
  isInspectionCurrent: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'IN_REPAIR';
  compliance: 'COMPLIANT' | 'NEEDS_UPDATING';  // computed
  createdAt: string;
  updatedAt: string;
}
```

**Dock Entity:**
```typescript
interface Dock {
  dockId: string;
  name: string;
  dockYardId: string;
  dockType: 'flatbed' | 'drop-in';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

**DockYard Entity:**
```typescript
interface DockYard {
  dockYardId: string;
  name: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 3. RBAC Summary

| Role           | View Load | Edit Load | Click Load Row | View Trailer | Edit Trailer | View Dock/DockYard | Edit Dock/DockYard |
|----------------|-----------|-----------|----------------|--------------|--------------|--------------------|--------------------|
| platformAdmin  | yes       | yes       | yes            | yes          | yes          | yes                | yes                |
| admin          | yes       | yes       | yes            | yes          | yes          | yes                | yes                |
| coadmin        | yes       | yes       | yes            | yes          | yes          | yes                | yes                |
| driver         | assigned only | no    | yes (own loads)| trailer on own load | no    | dock on own load   | no                 |

---

## 4. Acceptance Criteria

### 4.1 Critical Fixes
- [ ] **AC-1.1**: Driver can click any load in "My Loads" and view full details without 404 error
- [ ] **AC-1.2**: Driver sees 403 error (not 404) when trying to access unassigned load
- [ ] **AC-1.3**: Admin can click any load row in Loads page and navigate to detail view
- [ ] **AC-1.4**: CoAdmin can click any load row in Loads page and navigate to detail view

### 4.2 Trailer Management
- [ ] **AC-2.1**: Admin can access `/trailers` page and see list of all trailers
- [ ] **AC-2.2**: Admin can create new trailer with all required fields
- [ ] **AC-2.3**: Admin can edit existing trailer
- [ ] **AC-2.4**: Trailer compliance status is calculated correctly (COMPLIANT vs NEEDS_UPDATING)
- [ ] **AC-2.5**: Trailer list shows registration and inspection expiration dates
- [ ] **AC-2.6**: Trailer status can be set to ACTIVE, INACTIVE, or IN_REPAIR
- [ ] **AC-2.7**: Driver can see trailer information on loads assigned to them (read-only)

### 4.3 Dock & Dock Yard Management
- [ ] **AC-3.1**: Admin can access `/dockyards` page and see list of dock yards
- [ ] **AC-3.2**: Admin can create new dock yard with name and optional address
- [ ] **AC-3.3**: Admin can edit existing dock yard
- [ ] **AC-3.4**: Admin can access `/docks` page and see list of docks
- [ ] **AC-3.5**: Admin can create new dock with yard assignment and type
- [ ] **AC-3.6**: Admin can edit existing dock
- [ ] **AC-3.7**: Dock type can be set to "flatbed" or "drop-in"

### 4.4 Enhanced Load Creation
- [ ] **AC-4.1**: Create Load form includes trailer selection dropdown
- [ ] **AC-4.2**: Trailer dropdown shows trailer number, compliance status, and current location
- [ ] **AC-4.3**: Only ACTIVE trailers are selectable
- [ ] **AC-4.4**: Warning displays if selected trailer has NEEDS_UPDATING compliance
- [ ] **AC-4.5**: Create Load form includes dock selection for trailer location
- [ ] **AC-4.6**: Dock Yard auto-fills based on selected dock
- [ ] **AC-4.7**: Create Load form includes manifest textarea
- [ ] **AC-4.8**: Load can be created without trailer/dock (optional fields)

### 4.5 Enhanced Load Detail View
- [ ] **AC-5.1**: Driver sees "Trailer & Pickup Information" section on assigned loads
- [ ] **AC-5.2**: Driver sees trailer number and compliance status
- [ ] **AC-5.3**: Driver sees dock name, type, dock yard name
- [ ] **AC-5.4**: Driver sees dock yard address if available
- [ ] **AC-5.5**: Driver sees manifest text
- [ ] **AC-5.6**: Driver cannot edit any load information
- [ ] **AC-5.7**: Admin sees same trailer/dock information
- [ ] **AC-5.8**: Admin can edit all load fields including trailer/dock/manifest
- [ ] **AC-5.9**: CoAdmin has same permissions as Admin

### 4.6 Navigation & UX
- [ ] **AC-6.1**: Navigation menu shows Trailers, Docks, Dock Yards links (admin/coadmin only)
- [ ] **AC-6.2**: Load row click doesn't trigger when clicking action buttons
- [ ] **AC-6.3**: All pages have consistent dark mode support
- [ ] **AC-6.4**: Loading states display correctly on all new pages
- [ ] **AC-6.5**: Error messages are user-friendly and actionable

---

## 5. Implementation Checklist

### Phase 1: Critical Fixes (Priority 1)
- [ ] Fix driver load detail 404 error
  - [ ] Verify ID field consistency (`id` vs `loadId`)
  - [ ] Add debug logging to identify issue
  - [ ] Update authorization to return 403 for unassigned drivers
- [ ] Make admin load rows clickable
  - [ ] Add onClick handler to load row
  - [ ] Add stopPropagation to action buttons
  - [ ] Add cursor-pointer styling

### Phase 2: API Integration (Priority 1)
- [ ] Add trailers API to `web/src/lib/api.ts`
- [ ] Add docks API to `web/src/lib/api.ts`
- [ ] Add dockyards API to `web/src/lib/api.ts`
- [ ] Export new API clients

### Phase 3: Trailer Management UI (Priority 2)
- [ ] Create `TrailersPage.tsx`
- [ ] Create `CreateTrailerForm.tsx` component
- [ ] Create `EditTrailerForm.tsx` component
- [ ] Add trailer type definitions
- [ ] Add route to `App.tsx`
- [ ] Add navigation link (admin/coadmin only)
- [ ] Implement compliance calculation logic
- [ ] Add data refresh after create/update

### Phase 4: Dock & Dock Yard Management UI (Priority 2)
- [ ] Create `DockYardsPage.tsx`
- [ ] Create `CreateDockYardForm.tsx` component
- [ ] Create `DocksPage.tsx`
- [ ] Create `CreateDockForm.tsx` component
- [ ] Add type definitions
- [ ] Add routes to `App.tsx`
- [ ] Add navigation links
- [ ] Link docks to dock yards in UI

### Phase 5: Enhanced Load Creation (Priority 3)
- [ ] Update `CreateLoadForm.tsx` to include trailer section
- [ ] Add trailer dropdown with filtering (ACTIVE only)
- [ ] Add compliance warning for NEEDS_UPDATING trailers
- [ ] Add dock selection dropdown
- [ ] Auto-populate dock yard from dock
- [ ] Add manifest textarea
- [ ] Update form submission to include new fields
- [ ] Update load creation API call

### Phase 6: Enhanced Load Detail View (Priority 3)
- [ ] Update `LoadDetailsPage.tsx` to display trailer info
- [ ] Add "Trailer & Pickup Information" section
- [ ] Display trailer number and compliance badge
- [ ] Display dock name, type, dock yard
- [ ] Display manifest
- [ ] Add conditional rendering for when trailer exists
- [ ] Ensure driver sees read-only view
- [ ] Ensure admin/coadmin can edit

### Phase 7: Testing & Polish (Priority 4)
- [ ] Test all RBAC permissions
- [ ] Test driver load access
- [ ] Test admin load navigation
- [ ] Test trailer CRUD operations
- [ ] Test dock CRUD operations
- [ ] Test dock yard CRUD operations
- [ ] Test load creation with trailer/dock
- [ ] Test compliance calculations
- [ ] Test dark mode on all new pages
- [ ] Fix any UI/UX issues
- [ ] Add loading spinners where needed
- [ ] Add error handling and user feedback

---

## 6. Technical Notes

### 6.1 ID Field Consistency
The backend uses `loadId` as the primary identifier. Frontend should consistently use:
- `load.loadId` for API calls
- Update any references to `load.id` to `load.loadId`

### 6.2 Compliance Calculation
```typescript
function calculateCompliance(trailer: Trailer): 'COMPLIANT' | 'NEEDS_UPDATING' {
  const now = new Date();
  const regExpired = trailer.registrationExpiresAt 
    ? new Date(trailer.registrationExpiresAt) < now 
    : true;
  const inspExpired = trailer.inspectionExpiresAt 
    ? new Date(trailer.inspectionExpiresAt) < now 
    : true;
  
  const compliant = 
    trailer.isRegistrationCurrent && 
    !regExpired && 
    trailer.isInspectionCurrent && 
    !inspExpired;
  
  return compliant ? 'COMPLIANT' : 'NEEDS_UPDATING';
}
```

### 6.3 Navigation Security
All new pages must check user role and redirect if unauthorized:
```typescript
if (currentUser?.role !== 'admin' && currentUser?.role !== 'coadmin') {
  return <Navigate to="/dashboard" replace />;
}
```

---

## 7. Future Enhancements (Out of Scope)

- Trailer maintenance history
- Dock availability scheduling
- Trailer GPS tracking
- Automated compliance notifications
- Bulk trailer updates
- Trailer assignment workflow

---

## 8. Success Metrics

1. **Zero 404 errors** for drivers accessing their assigned loads
2. **100% clickable** load rows for admin/coadmin
3. **Complete CRUD** operations for trailers, docks, dock yards
4. **Full visibility** of trailer/dock info in load creation and detail views
5. **Proper RBAC** enforcement across all new features

---

## Appendix: File Structure

```
web/src/
├── pages/
│   ├── TrailersPage.tsx           [NEW]
│   ├── DocksPage.tsx               [NEW]
│   ├── DockYardsPage.tsx           [NEW]
│   ├── LoadsPage.tsx               [MODIFY]
│   ├── LoadDetailsPage.tsx         [MODIFY]
│   └── CreateLoadForm.tsx          [MODIFY]
├── components/
│   ├── trailers/
│   │   ├── CreateTrailerForm.tsx   [NEW]
│   │   └── EditTrailerForm.tsx     [NEW]
│   ├── docks/
│   │   ├── CreateDockForm.tsx      [NEW]
│   │   └── EditDockForm.tsx        [NEW]
│   └── dockyards/
│       ├── CreateDockYardForm.tsx  [NEW]
│       └── EditDockYardForm.tsx    [NEW]
├── types/
│   ├── trailer.ts                  [NEW]
│   ├── dock.ts                     [NEW]
│   └── load.ts                     [MODIFY]
├── lib/
│   └── api.ts                      [MODIFY]
└── App.tsx                         [MODIFY]
```

---

**End of Specification v3**
