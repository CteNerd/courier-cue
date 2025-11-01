import { describe, it, expect } from '@jest/globals';
import {
  validateBody,
  createLoadSchema,
  updateOrgSettingsSchema,
  inviteUserSchema,
  createTrailerSchema,
  updateTrailerSchema,
  createDockYardSchema,
  createDockSchema,
  ValidationError,
} from '../validation.js';

describe('Validation Module', () => {
  describe('validateBody', () => {
    it('should validate correct load data', () => {
      const data = {
        serviceAddress: {
          name: 'Test Company',
          street: '123 Main St',
          city: 'Austin',
          state: 'TX',
          zip: '78701',
        },
        items: [
          {
            type: 'PALLET_48x40',
            qty: 5,
          },
        ],
      };

      const result = validateBody(createLoadSchema, data);
      expect(result).toEqual(data);
    });

    it('should throw ValidationError for invalid data', () => {
      const data = {
        serviceAddress: {
          name: 'Test Company',
          // missing required fields
        },
        items: [],
      };

      expect(() => validateBody(createLoadSchema, data)).toThrow(ValidationError);
    });

    it('should validate org settings update', () => {
      const data = {
        orgName: 'Updated Org Name',
        emailFrom: 'new@example.com',
        retentionDays: 90,
      };

      const result = validateBody(updateOrgSettingsSchema, data);
      expect(result).toEqual(data);
    });

    it('should reject invalid email in org settings', () => {
      const data = {
        emailFrom: 'invalid-email',
      };

      expect(() => validateBody(updateOrgSettingsSchema, data)).toThrow(ValidationError);
    });

    it('should validate user invite', () => {
      const data = {
        email: 'newuser@example.com',
        displayName: 'New User',
        role: 'driver',
      };

      const result = validateBody(inviteUserSchema, data);
      expect(result).toEqual(data);
    });

    it('should reject invalid role in user invite', () => {
      const data = {
        email: 'newuser@example.com',
        displayName: 'New User',
        role: 'invalid-role',
      };

      expect(() => validateBody(inviteUserSchema, data)).toThrow(ValidationError);
    });
  });

  describe('Address validation', () => {
    it('should validate US state code', () => {
      const data = {
        serviceAddress: {
          name: 'Test',
          street: '123 Main',
          city: 'Austin',
          state: 'TX',
          zip: '78701',
        },
        items: [{ type: 'TEST', qty: 1 }],
      };

      expect(() => validateBody(createLoadSchema, data)).not.toThrow();
    });

    it('should reject invalid state code', () => {
      const data = {
        serviceAddress: {
          name: 'Test',
          street: '123 Main',
          city: 'Austin',
          state: 'TXX', // 3 characters
          zip: '78701',
        },
        items: [{ type: 'TEST', qty: 1 }],
      };

      expect(() => validateBody(createLoadSchema, data)).toThrow(ValidationError);
    });
  });

  describe('Trailer validation', () => {
    it('should validate correct trailer data', () => {
      const data = {
        trailerNumber: 'TRL-001',
        status: 'ACTIVE' as const,
      };

      const result = validateBody(createTrailerSchema, data);
      expect(result.trailerNumber).toEqual('TRL-001');
      expect(result.status).toEqual('ACTIVE');
    });

    it('should reject empty trailer number', () => {
      const data = {
        trailerNumber: '',
      };

      expect(() => validateBody(createTrailerSchema, data)).toThrow(ValidationError);
    });

    it('should validate trailer update with optional fields', () => {
      const data = {
        currentDockId: 'dock-123',
        status: 'IN_REPAIR' as const,
      };

      const result = validateBody(updateTrailerSchema, data);
      expect(result.currentDockId).toEqual('dock-123');
      expect(result.status).toEqual('IN_REPAIR');
    });
  });

  describe('DockYard validation', () => {
    it('should validate correct dockyard data', () => {
      const data = {
        name: 'Main Yard',
      };

      const result = validateBody(createDockYardSchema, data);
      expect(result.name).toEqual('Main Yard');
    });

    it('should validate dockyard with address', () => {
      const data = {
        name: 'Main Yard',
        address: {
          name: 'Yard Location',
          street: '100 Dock St',
          city: 'Houston',
          state: 'TX',
          zip: '77001',
        },
      };

      const result = validateBody(createDockYardSchema, data);
      expect(result.name).toEqual('Main Yard');
      expect(result.address?.city).toEqual('Houston');
    });
  });

  describe('Dock validation', () => {
    it('should validate correct dock data', () => {
      const data = {
        name: 'Dock A',
        dockYardId: 'yard-123',
        dockType: 'flatbed' as const,
      };

      const result = validateBody(createDockSchema, data);
      expect(result.name).toEqual('Dock A');
      expect(result.dockType).toEqual('flatbed');
    });

    it('should reject invalid dock type', () => {
      const data = {
        name: 'Dock A',
        dockYardId: 'yard-123',
        dockType: 'invalid' as any,
      };

      expect(() => validateBody(createDockSchema, data)).toThrow(ValidationError);
    });
  });
});
