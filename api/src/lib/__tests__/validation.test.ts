import { describe, it, expect } from '@jest/globals';
import {
  validateBody,
  createLoadSchema,
  updateOrgSettingsSchema,
  inviteUserSchema,
  ValidationError,
} from '../validation';

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
});
