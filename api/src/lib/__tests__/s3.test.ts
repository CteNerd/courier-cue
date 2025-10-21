import { describe, it, expect } from '@jest/globals';
import {
  verifyS3KeyOwnership,
  getReceiptS3Key,
  getSignatureUploadUrl,
} from '../s3';

describe('S3 Module', () => {
  describe('verifyS3KeyOwnership', () => {
    it('should return true for valid orgId prefix', () => {
      const s3Key = 'org123/load456/signature.png';
      const orgId = 'org123';

      expect(verifyS3KeyOwnership(s3Key, orgId)).toBe(true);
    });

    it('should return false for mismatched orgId', () => {
      const s3Key = 'org123/load456/signature.png';
      const orgId = 'org999';

      expect(verifyS3KeyOwnership(s3Key, orgId)).toBe(false);
    });

    it('should return false for s3Key without orgId prefix', () => {
      const s3Key = 'load456/signature.png';
      const orgId = 'org123';

      expect(verifyS3KeyOwnership(s3Key, orgId)).toBe(false);
    });
  });

  describe('getReceiptS3Key', () => {
    it('should generate correct receipt S3 key', () => {
      const orgId = 'org123';
      const loadId = 'load456';

      const key = getReceiptS3Key(orgId, loadId);

      expect(key).toBe('org123/load456/receipt.pdf');
    });
  });

  describe('getSignatureUploadUrl', () => {
    it('should generate presigned URL with s3Key', async () => {
      const orgId = 'test-org';
      const loadId = 'test-load';

      const result = await getSignatureUploadUrl(orgId, loadId);

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('s3Key');
      expect(result.s3Key).toMatch(/^test-org\/test-load\/signature-\d+\.png$/);
    });
  });
});
