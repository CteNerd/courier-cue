// Zod validation schemas
import { z } from 'zod';

// Common schemas
export const addressSchema = z.object({
  name: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zip: z.string().min(5),
  contact: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export const itemSchema = z.object({
  type: z.string(),
  qty: z.number().int().positive(),
});

export const trailerSchema = z.object({
  dropped: z.boolean().optional(),
  picked: z.boolean().optional(),
  liveLoad: z.boolean().optional(),
  percentFull: z.number().min(0).max(100).optional(),
});

export const geoSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  accuracy: z.number().optional(),
});

// Load schemas
export const loadStatus = z.enum([
  'DRAFT',
  'ASSIGNED',
  'IN_TRANSIT',
  'DELIVERED',
  'CANCELLED',
]);

export const createLoadSchema = z.object({
  serviceAddress: addressSchema,
  description: z.string().optional(),
  items: z.array(itemSchema).min(1),
  notes: z.string().optional(),
  unloadLocation: z.string().optional(),
  shipVia: z.string().optional(),
  trailer: trailerSchema.optional(),
  trailerId: z.string().optional(),
  trailerLocationId: z.string().optional(),
  dockYardId: z.string().optional(),
  manifest: z.array(z.string()).optional(),
});

export const updateLoadSchema = z.object({
  serviceAddress: addressSchema.optional(),
  description: z.string().optional(),
  items: z.array(itemSchema).optional(),
  notes: z.string().optional(),
  unloadLocation: z.string().optional(),
  shipVia: z.string().optional(),
  trailer: trailerSchema.optional(),
  assignedDriverId: z.string().optional(),
  status: loadStatus.optional(),
  trailerId: z.string().optional(),
  trailerLocationId: z.string().optional(),
  dockYardId: z.string().optional(),
  manifest: z.array(z.string()).optional(),
});

export const statusUpdateSchema = z.object({
  action: z.enum(['IN_TRANSIT', 'DELIVERED']),
});

export const signatureConfirmSchema = z.object({
  s3Key: z.string(),
  signerName: z.string(),
  signedAt: z.string().datetime(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  accuracy: z.number().optional(),
});

// Org schemas
export const signatureOptionsSchema = z.object({
  requireGeo: z.boolean().optional(),
  capturePrintedName: z.boolean().optional(),
});

export const featuresSchema = z.object({
  remoteSign: z.boolean().optional(),
  pdfBranding: z.boolean().optional(),
  exports: z.boolean().optional(),
});

export const updateOrgSettingsSchema = z.object({
  orgName: z.string().optional(),
  legalName: z.string().optional(),
  logoUrl: z.string().url().optional(),
  emailFrom: z.string().email().optional(),
  billingEmail: z.string().email().optional(),
  accountingCc: z.array(z.string().email()).optional(),
  defaultUnloadLocations: z.array(z.string()).optional(),
  allowedItemTypes: z.array(z.string()).optional(),
  signatureOptions: signatureOptionsSchema.optional(),
  retentionDays: z.number().int().positive().optional(),
  features: featuresSchema.optional(),
  plan: z.string().optional(),
});

// User schemas
export const userRole = z.enum(['admin', 'coadmin', 'driver']);

export const inviteUserSchema = z.object({
  email: z.string().email(),
  displayName: z.string(),
  role: userRole,
  phone: z.string().optional(),
});

export const updateUserSchema = z.object({
  displayName: z.string().optional(),
  role: userRole.optional(),
  isDisabled: z.boolean().optional(),
  phone: z.string().optional(),
});

// Platform admin schemas
export const createOrgSchema = z.object({
  orgName: z.string().min(1),
  legalName: z.string().optional(),
  emailFrom: z.string().email(),
  plan: z.string().default('basic'),
});

export const updateOrgSchema = z.object({
  suspended: z.boolean().optional(),
  plan: z.string().optional(),
});

// Query params schemas
export const loadsQuerySchema = z.object({
  status: loadStatus.optional(),
  driverId: z.string().optional(),
  from: z.string().optional(), // ISO date
  to: z.string().optional(), // ISO date
  q: z.string().optional(), // free text search
});

// Trailer schemas
export const trailerStatus = z.enum(['ACTIVE', 'INACTIVE', 'IN_REPAIR']);

export const createTrailerSchema = z.object({
  trailerNumber: z.string().min(1),
  currentDockId: z.string().optional(),
  registrationExpiresAt: z.string().datetime().optional(),
  isRegistrationCurrent: z.boolean().default(true),
  inspectionExpiresAt: z.string().datetime().optional(),
  isInspectionCurrent: z.boolean().default(true),
  status: trailerStatus.default('ACTIVE'),
});

export const updateTrailerSchema = z.object({
  trailerNumber: z.string().min(1).optional(),
  currentDockId: z.string().optional(),
  registrationExpiresAt: z.string().datetime().optional(),
  isRegistrationCurrent: z.boolean().optional(),
  inspectionExpiresAt: z.string().datetime().optional(),
  isInspectionCurrent: z.boolean().optional(),
  status: trailerStatus.optional(),
});

// Dock Yard schemas
export const createDockYardSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
});

export const updateDockYardSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
});

// Dock schemas
export const dockType = z.enum(['flatbed', 'drop-in']);

export const createDockSchema = z.object({
  name: z.string().min(1),
  dockYardId: z.string().min(1),
  dockType: dockType,
  notes: z.string().optional(),
});

export const updateDockSchema = z.object({
  name: z.string().min(1).optional(),
  dockYardId: z.string().optional(),
  dockType: dockType.optional(),
  notes: z.string().optional(),
});

// Helper function to validate request body
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Validation failed',
        error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }))
      );
    }
    throw error;
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Array<{ path: string; message: string }>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
