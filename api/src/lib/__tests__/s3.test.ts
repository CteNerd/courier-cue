import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock AWS SDK modules BEFORE importing the module under test
const mockGetSignedUrl = jest.fn() as jest.MockedFunction<any>;
const mockS3Client = jest.fn() as jest.MockedFunction<any>;
const mockPutObjectCommand = jest.fn() as jest.MockedFunction<any>;
const mockGetObjectCommand = jest.fn() as jest.MockedFunction<any>;

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: mockS3Client,
  PutObjectCommand: mockPutObjectCommand,
  GetObjectCommand: mockGetObjectCommand,
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl,
}));

// Now import the module under test
import {
  verifyS3KeyOwnership,
  getReceiptS3Key,
  getSignatureUploadUrl,
} from '../s3.js';

describe('S3 Module', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Set up mock implementations
    mockS3Client.mockImplementation(() => ({
      send: jest.fn(),
      config: {
        region: jest.fn(() => Promise.resolve('us-east-1')),
        credentials: jest.fn(() => Promise.resolve({
          accessKeyId: 'mock-access-key',
          secretAccessKey: 'mock-secret-key',
        })),
      },
    }));
    
    mockPutObjectCommand.mockImplementation((params: any) => params);
    mockGetObjectCommand.mockImplementation((params: any) => params);
    mockGetSignedUrl.mockResolvedValue('https://mock-signed-url.com');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

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
